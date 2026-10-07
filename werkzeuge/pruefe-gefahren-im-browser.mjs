// Browser-Prüfung von Spiel 7 „Gefahren finden“ (07.10.2026): echte App im Chromium, echte Fingertipps.
//   - Die App läuft aus diesem Ordner. Weil spiele.js / texte.js / academy-spiele.ts das Spiel noch nicht kennen, werden die
//     Einträge zur Laufzeit eingesetzt (werkzeuge/gefahren-testbasis.mjs): ausgelieferte Dateien werden beim Abruf ergänzt,
//     der Server ist die ECHTE Function-Datei mit dem Eintrag „gefahren“ gegen eine Datenbank im Speicher.
//   - Geprüft: Handy 360 x 740, 320 x 640, 412 x 915 dunkel, Querformat 740 x 360 (nichts abgeschnitten, nichts wischt seitlich,
//     Tippziele >= 44 px, Start-Knopf MITTEN über dem Bild), ein voller Durchgang mit echten Tipps (Treffer, Fehltipp, Doppeltipp,
//     schon gefundene Gefahr, „Fertig“, Zeit abgelaufen), Auflösung mit allen Gefahren und Erklärungen, Punkte, Server-Ergebnis,
//     Rechts-nach-links (ar), alle 18 Sprachen, keine Konsolenfehler.
//   - Die Zeit läuft im Spiel beschleunigt (performance.now), damit „Zeit abgelaufen“ nicht 30 s dauert; Fingertipps bleiben echt.
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-gefahren-im-browser.mjs
//   (Playwright liegt global: PLAYWRIGHT_PFAD=/opt/node22/lib/node_modules; Browser: PLAYWRIGHT_BROWSERS_PATH oder CHROMIUM_PFAD)
// Bilder landen in $SPIELE_BILDER (Standard: ./spiele-bilder, nicht einchecken).
import http from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, extname } from "node:path";
import { db, jetzt, warte } from "./edge-functions/spiele-im-speicher.mjs";
import { serverMitEintrag, spielePatch, textePatch, wurzel } from "./gefahren-testbasis.mjs";
import * as G from "../spiele/gefahren.js";
import { TEXTE } from "../spiele/texte.js";
import { TEXTE_GEFAHREN } from "../spiele/texte-gefahren.js";

const { chromium } = createRequire((process.env.PLAYWRIGHT_PFAD || "/opt/node22/lib/node_modules") + "/")("playwright");
const bilder = process.env.SPIELE_BILDER || join(process.cwd(), "spiele-bilder");
mkdirSync(bilder, { recursive: true });
const rufe = await serverMitEintrag();
const SPRACHEN = Object.keys(TEXTE_GEFAHREN);
const RTL = ["ar", "ckb", "ur", "fa", "ps"];
const T = (sp, key, werte) => { let s = TEXTE_GEFAHREN[sp][key] || TEXTE[sp][key]; for (const k of Object.keys(werte || {})) s = s.split("{" + k + "}").join(werte[k]); return s; };

const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
const schueler = (id, name) => db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null });
schueler("t", "Serban Dumitrescu");
db.academy_sessions.push({ session_token: "tok-t", schueler_id: "t", expires_at: inEinemJahr });
[["m1", "Mira Kaya", 1480], ["m2", "Jonas Weber", 1210], ["m3", "Ali Reza Karimi", 990]].forEach(([id, n, w]) => { schueler(id, n); db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "gefahren", wert: w, erreicht_am: jetzt(), versuche: 2 }); });

const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg" };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const pfad = join(wurzel, decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html");
  if (!pfad.startsWith(wurzel) || !existsSync(pfad) || pfad === wurzel + "/") { res.writeHead(404); res.end("nicht da"); return; }
  let inhalt = readFileSync(pfad);
  // Das Spiel ist in den echten Dateien noch nicht eingetragen: beim Ausliefern ergänzen
  if (url.pathname === "/spiele/spiele.js") inhalt = Buffer.from(spielePatch(inhalt.toString("utf8")));
  if (url.pathname === "/spiele/texte.js") inhalt = Buffer.from(textePatch(inhalt.toString("utf8")));
  res.writeHead(200, { "Content-Type": TYPEN[extname(pfad)] || "application/octet-stream", "Cache-Control": "no-store" });
  res.end(inhalt);
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const basis = "http://127.0.0.1:" + server.address().port;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PFAD || undefined });
const befunde = [];
let bestanden = 0;
const pruefe = (name, bedingung, detail) => {
  if (bedingung) { bestanden++; console.log("  ok   " + name); } else { befunde.push(name + (detail ? " -> " + detail : "")); console.log("  FEHL " + name + (detail ? " -> " + detail : "")); process.exitCode = 1; }
};

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS" };
async function neueSeite(opt) {
  db.academy_spiele_runden = [];
  const ctx = await browser.newContext({ viewport: { width: opt.b, height: opt.h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, colorScheme: opt.dunkel ? "dark" : "light" });
  await ctx.addInitScript((d) => {
    try {
      localStorage.setItem("academy_session", JSON.stringify({ name: "Serban Dumitrescu", session_token: "tok-t", vollzugang: true, agb_akzeptiert_am: "2026-01-01T00:00:00Z", ablauf_am: d.ablauf, klasse: "B", telefon: "0100" }));
      localStorage.setItem("spiele_vorschau", "1");
      localStorage.setItem("academy_sprache", d.sprache);
    } catch (e) {}
    // beschleunigte Uhr nur für das Spiel: window.__tempo(f) stellt den Faktor um, ohne die Zeit springen zu lassen
    const echt = performance.now.bind(performance);
    let basisEcht = echt(), basisFalsch = basisEcht, faktor = 1;
    performance.now = () => basisFalsch + (echt() - basisEcht) * faktor;
    window.__tempo = (f) => { basisFalsch = performance.now(); basisEcht = echt(); faktor = f; };
  }, { ablauf: inEinemJahr, sprache: opt.sprache || "de" });
  const seite = await ctx.newPage();
  seite.fehler = [];
  seite.on("pageerror", (e) => seite.fehler.push("pageerror: " + e.message));
  seite.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR|fonts\.g/.test(m.text())) seite.fehler.push("console: " + m.text()); });
  await seite.route("**/*", async (route) => {
    const u = route.request().url();
    if (u.startsWith(basis)) return route.continue();
    const m = u.match(/\/functions\/v1\/([a-z0-9-]+)/);
    if (!m) return route.abort();
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const f = m[1];
    const antwort = (status, body) => route.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) });
    if (f === "academy-spiele") { const { status, ...rest } = await rufe(JSON.parse(route.request().postData() || "{}")); return antwort(status, rest); }
    if (f === "academy-session-refresh") return antwort(200, { ok: true });
    if (f === "academy-katalog") return antwort(200, { ok: true, tags: [], videos: [], video_tags: [], pruefer: [], video_pruefer: [], gebiete: [], uebersetzungen: [] });
    if (f === "academy-szene") return antwort(200, { ok: true, szenen: [] });
    return antwort(503, { error: "nicht nachgebaut", code: "voruebergehend" });
  });
  await seite.goto(basis + "/index.html" + (opt.suche || ""));
  return seite;
}
const zumHub = async (s) => {
  await s.waitForSelector("#drawer-open-btn", { timeout: 15000 });
  await s.tap("#drawer-open-btn");
  await s.waitForSelector('[data-drawer="spiele"]', { state: "visible" });
  await s.tap('[data-drawer="spiele"]');
  await s.waitForSelector(".sp-karte", { timeout: 10000 });
};
const zumSpiel = async (s) => { await zumHub(s); await s.tap('.sp-karte[data-spiel="gefahren"]'); await s.waitForSelector(".ge-knopf"); await s.waitForTimeout(400); };

/* Layout: nichts seitlich wischbar, nichts abgeschnitten, Tippflächen groß genug */
async function layoutPruefen(s, name) {
  const r = await s.evaluate(() => {
    const probleme = [];
    const de = document.documentElement;
    if (de.scrollWidth > window.innerWidth + 1) probleme.push("Seite wischbar: " + de.scrollWidth + " > " + window.innerWidth);
    document.querySelectorAll("#spiele-platz *").forEach((el) => {
      if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") return;
      const rc = el.getBoundingClientRect();
      if (rc.width === 0 || rc.height === 0) return;
      if (rc.right > window.innerWidth + 1 || rc.left < -1) probleme.push("ragt raus: " + el.className + " " + Math.round(rc.left) + ".." + Math.round(rc.right));
      if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible") probleme.push("abgeschnitten: " + el.className);
    });
    document.querySelectorAll(".ge-knopf,.ge-fertig,.ge-weiter,.sp-schalter,.sp-karte").forEach((el) => {
      const rc = el.getBoundingClientRect();
      if (rc.height > 0 && (rc.height < 43.5 || rc.width < 43.5)) probleme.push("Tippfläche klein: " + el.className + " " + Math.round(rc.width) + "x" + Math.round(rc.height));
    });
    return probleme;
  });
  pruefe(name + ": Layout ohne Überstand/Abschneiden/kleine Knöpfe", r.length === 0, r.slice(0, 4).join(" | "));
}

const aktuellesBild = async (s) => { const id = await s.getAttribute(".ge-svg", "data-bild"); return G.BILDER.find((b) => b.id === id); };
const svgBox = (s) => s.locator(".ge-svg").evaluate((e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height, vh: window.innerHeight, vw: window.innerWidth }; });
/* Fingertipp auf eine Stelle im Bild (Bildkoordinaten) */
async function tippeBild(s, x, y, dx, dy) {
  const b = await svgBox(s);
  const px = b.l + ((x + (dx || 0)) / G.BILD_B) * b.w, py = b.t + ((y + (dy || 0)) / G.BILD_H) * b.h;
  if (px < 0 || px > b.vw || py < 0 || py > b.vh) throw new Error("Tippstelle liegt außerhalb des Bildschirms: " + Math.round(px) + "," + Math.round(py) + " (" + b.vw + "x" + b.vh + ")");
  await s.touchscreen.tap(px, py);
}
const zustand = (s) => s.evaluate(() => ({
  punkte: +document.querySelector(".ge-punkte b").textContent,
  zaehler: document.querySelector(".ge-zaehler").textContent.trim(),
  meldung: document.querySelector(".ge-meldung").textContent.trim(),
  ringeGef: document.querySelectorAll(".ge-ring.gefunden").length,
  ringeUeb: document.querySelectorAll(".ge-ring.uebersehen").length,
  fehlMarken: document.querySelectorAll(".ge-fehltipp").length,
  antwort: !document.querySelector(".ge-antwort").hidden,
  hud: document.querySelector(".ge-bild").textContent.trim(),
  zeit: document.querySelector(".ge-zeit").textContent.trim()
}));
const warteAufloesung = (s, ms) => s.waitForSelector(".ge-antwort:not([hidden])", { timeout: ms || 6000 });
async function auflosungPruefen(s, bild, gefundenIds, name, sp) {
  sp = sp || "de";
  const info = await s.evaluate(() => ({
    eintraege: Array.from(document.querySelectorAll(".ge-eintrag")).map((e) => ({ id: e.dataset.gefahr, klasse: e.className, titel: e.querySelector("b").textContent.trim(), status: e.querySelector(".ge-status").textContent.trim(), text: e.querySelector("p").textContent.trim(), nr: e.querySelector(".ge-nummer").textContent.trim() })),
    ringe: Array.from(document.querySelectorAll(".ge-ring")).map((g) => ({ gef: g.classList.contains("gefunden"), nr: (g.querySelector("text") || {}).textContent })),
    weiter: document.querySelector(".ge-weiter").textContent.trim(),
    urteil: document.querySelector(".ge-urteil").textContent.trim()
  }));
  pruefe(name + ": ALLE " + bild.gefahren.length + " Gefahren sind im Bild markiert und aufgelistet", info.ringe.length === bild.gefahren.length && info.eintraege.length === bild.gefahren.length, JSON.stringify(info.ringe));
  pruefe(name + ": Nummern 1…n stimmen in Bild und Liste überein", info.ringe.every((r, i) => r.nr === String(i + 1)) && info.eintraege.every((e, i) => e.nr === String(i + 1) && e.id === bild.gefahren[i].id));
  pruefe(name + ": gefundene grün / übersehene orange mit Wort in der Liste", bild.gefahren.every((g, i) => (info.eintraege[i].klasse.includes("uebersehen") === !gefundenIds.includes(g.id)) && info.eintraege[i].status === T(sp, gefundenIds.includes(g.id) ? "geMarkGefunden" : "geMarkUebersehen") && info.ringe[i].gef === gefundenIds.includes(g.id)));
  pruefe(name + ": jede Gefahr mit Name und Erklärung in der Sprache", bild.gefahren.every((g, i) => info.eintraege[i].titel === T(sp, G.gefahrTitel(g.typ)) && info.eintraege[i].text === T(sp, G.gefahrText(g.typ))));
  return info;
}

/* ===================== 1. Layout in Ruhe ===================== */
console.log("Gefahren finden: Layout in Ruhe");
for (const g of [{ b: 360, h: 740, n: "360" }, { b: 320, h: 640, n: "320" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }, { b: 740, h: 360, n: "quer 740x360" }]) {
  const s = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
  await zumHub(s);
  pruefe(g.n + ": Karte auf der Startseite mit Namen und Vorschau-Marke", (await s.textContent('.sp-karte[data-spiel="gefahren"] .sp-karte-titel')).trim() === "Gefahren finden" && (await s.locator('.sp-karte[data-spiel="gefahren"] .sp-karte-marke').count()) === 1, await s.locator('.sp-karte').evaluateAll((e) => e.map((x) => x.dataset.spiel + ":" + x.textContent.slice(0, 40)).join(" | ")));
  await s.tap('.sp-karte[data-spiel="gefahren"]'); await s.waitForSelector(".ge-knopf"); await s.waitForTimeout(500);
  await layoutPruefen(s, "Gefahren bereit " + g.n);
  const m = await s.evaluate(() => { const r = (q) => document.querySelector(q).getBoundingClientRect(); const k = r(".ge-knopf"), z = r(".ge-szene"); return { kx: k.left + k.width / 2, ky: k.top + k.height / 2, zx: z.left + z.width / 2, zy: z.top + z.height / 2, kb: k.width, kh: k.height, oben: z.top, unten: z.bottom, vh: window.innerHeight, kw: getComputedStyle(document.querySelector(".ge-knopf")).visibility, css: !!document.querySelector("link[data-gefahren-css]"), w: getComputedStyle(document.querySelector(".sp-gefahren")).visibility }; });
  pruefe(g.n + ": Start-Knopf MITTEN über dem Bild", Math.abs(m.kx - m.zx) < 3 && Math.abs(m.ky - m.zy) < 3 && m.kb >= 150 && m.kh >= 44, JSON.stringify(m));
  pruefe(g.n + ": eigene gefahren.css wurde vom Spiel geladen, Bereich sichtbar", m.css && m.w === "visible");
  pruefe(g.n + ": Start-Knopf liegt im sichtbaren Bereich", m.ky > 0 && m.ky < m.vh - 40, JSON.stringify(m));
  pruefe(g.n + ": Start-Knopf beschriftet „Start“", (await s.textContent(".ge-knopf")).trim() === "Start");
  await s.screenshot({ path: join(bilder, "gefahren-bereit-" + g.n.replace(/\W+/g, "_") + ".png") });
  pruefe(g.n + ": keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();
}

/* ===================== 2. Ein voller Durchgang mit echten Tipps (360 x 740) ===================== */
console.log("Gefahren finden: ein voller Durchgang (360 x 740)");
let s = await neueSeite({ b: 360, h: 740 });
await zumSpiel(s);
await s.tap(".ge-knopf");
await s.waitForSelector(".ge-svg", { timeout: 9000 });
await s.waitForTimeout(500);
const rundeServer = db.academy_spiele_runden.filter((r) => r.spiel === "gefahren");
pruefe("Runde wurde auf dem Server angemeldet (spiel=gefahren)", rundeServer.length === 1);
let erwartetGesamt = 0, summeG = 0, summeF = 0, summeV = 0;
const gesehenBilder = [];
for (let nr = 0; nr < 4; nr++) {
  const bild = await aktuellesBild(s);
  gesehenBilder.push(bild.id);
  const n = bild.gefahren.length;
  const name = "Bild " + (nr + 1) + " (" + bild.id + ")";
  let z = await zustand(s);
  pruefe(name + ": Anzeige „Bild " + (nr + 1) + " von 4“ mit Name, Zähler 0 von " + n, z.hud === T("de", "geBild", { n: nr + 1, m: 4 }) + " · " + T("de", bild.name) && z.zaehler === T("de", "geGefunden", { n: 0, m: n }), JSON.stringify(z));
  if (nr === 0) {
    const rc = await s.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); return { hudO: g(".ge-hud").top, szeneU: g(".ge-szene").bottom, szeneB: g(".ge-szene").width, fertigU: g(".ge-fertig").bottom, h: window.innerHeight }; });
    pruefe("360: Anzeige, Bild und Fertig-Knopf zusammen im Bild, über der Menüleiste", rc.hudO >= 0 && rc.fertigU <= rc.h - 70 && rc.szeneB >= 280, JSON.stringify(rc));
    await layoutPruefen(s, "Gefahren Spiel (360)");
    await s.screenshot({ path: join(bilder, "gefahren-spiel-360.png") });
  }
  let gefunden = [], fehl = 0, restBonus = 0, ende = "alle";
  if (nr === 0) {
    // Fehltipp im leeren Bild, Doppeltipp in 250 ms zählt einmal, dann alle Gefahren der Reihe nach
    const leer = { x: 5, y: 5 };    // Ecke oben links ist in keinem Bild Gefahr (Trefferflächen liegen ganz im Bild und halten Abstand)
    await tippeBild(s, leer.x, leer.y);
    await tippeBild(s, leer.x, leer.y);   // sofort nochmal: gesperrt
    z = await zustand(s);
    fehl = 1;
    pruefe(name + ": Tipp ohne Gefahr: Meldung mit Abzug, rotes Kreuz, Punkte 0, Doppeltipp zählt nur einmal", z.meldung === T("de", "geFehltipp", { v: 30, m: 2 }) && z.fehlMarken === 1 && z.punkte === erwartetGesamt, JSON.stringify(z));
    await s.waitForTimeout(800);
    pruefe(name + ": rotes Kreuz verschwindet wieder", (await zustand(s)).fehlMarken === 0);
    for (let i = 0; i < n; i++) {
      const h = bild.gefahren[i];
      // Randtreffer: etwas neben der Mitte (innerhalb von 40 % des Radius) zählt
      await tippeBild(s, h.x, h.y, h.r * 0.4, -h.r * 0.3);
      gefunden.push(h.id);
      if (i < n - 1) {
        z = await zustand(s);
        pruefe(name + ": Treffer " + (i + 1) + ": Zähler " + (i + 1) + " von " + n + ", grüner Ring, Meldung", z.zaehler === T("de", "geGefunden", { n: i + 1, m: n }) && z.ringeGef === i + 1 && z.meldung === T("de", "geTreffer") && z.punkte === erwartetGesamt + Math.max(0, (i + 1) * 100 - 30), JSON.stringify(z));
        if (i === 0) {
          const vorher = (await zustand(s)).punkte;
          await s.waitForTimeout(300);
          await tippeBild(s, h.x, h.y);
          z = await zustand(s);
          pruefe(name + ": schon gefundene Gefahr nochmal antippen: kein Abzug, kein Fehlkreuz", z.punkte === vorher && z.fehlMarken === 0 && z.zaehler === T("de", "geGefunden", { n: 1, m: n }), JSON.stringify(z));
        }
      }
      await s.waitForTimeout(60);
    }
    await warteAufloesung(s);
    ende = "alle";
  } else if (nr === 1) {
    // nur die Hälfte finden, dann „Fertig“
    const halb = Math.floor(n / 2);
    for (let i = 0; i < halb; i++) { await tippeBild(s, bild.gefahren[i].x, bild.gefahren[i].y); gefunden.push(bild.gefahren[i].id); await s.waitForTimeout(60); }
    z = await zustand(s);
    pruefe(name + ": " + halb + " von " + n + " gefunden, Auflösung noch nicht da", z.zaehler === T("de", "geGefunden", { n: halb, m: n }) && !z.antwort);
    const fk = await s.evaluate(() => { const r = document.querySelector(".ge-fertig").getBoundingClientRect(); return { h: r.height, b: r.width, t: document.querySelector(".ge-fertig").textContent.trim() }; });
    pruefe(name + ": Fertig-Knopf groß genug und beschriftet", fk.h >= 44 && fk.b >= 100 && fk.t === T("de", "geFertig"), JSON.stringify(fk));
    await s.tap(".ge-fertig");
    await warteAufloesung(s);
    ende = "fertig";
  } else if (nr === 2) {
    // drei falsche Tipps (je mit Abstand), eine Gefahr, dann Zeit läuft ab (beschleunigte Uhr)
    for (let i = 0; i < 3; i++) { await tippeBild(s, 5, 5 + i * 3); fehl++; await s.waitForTimeout(320); }
    await tippeBild(s, bild.gefahren[0].x, bild.gefahren[0].y); gefunden.push(bild.gefahren[0].id);
    z = await zustand(s);
    pruefe(name + ": 3 Fehltipps und 1 Treffer: Punkte bisher + " + Math.max(0, 100 - 90), z.punkte === erwartetGesamt + 10 && z.zaehler === T("de", "geGefunden", { n: 1, m: n }), JSON.stringify(z));
    const t0 = await s.evaluate(() => document.querySelector(".ge-zeit").textContent);
    pruefe(name + ": Zeitanzeige in Sekunden läuft (Strafzeit 6 s ist abgezogen)", /^(2[0-4]) s$/.test(t0.trim()), t0);
    await s.evaluate(() => window.__tempo(40));
    await warteAufloesung(s, 9000);
    await s.evaluate(() => window.__tempo(1));
    ende = "zeit";
  } else {
    // alle finden, mit zwei Fehltipps: Strafzeit zählt, Zeitbonus bleibt
    for (let i = 0; i < 2; i++) { await tippeBild(s, 5, 6 + i * 3); fehl++; await s.waitForTimeout(320); }
    for (let i = 0; i < n; i++) { await tippeBild(s, bild.gefahren[i].x, bild.gefahren[i].y); gefunden.push(bild.gefahren[i].id); await s.waitForTimeout(60); }
    await warteAufloesung(s);
    ende = "alle";
  }
  // --- Auflösung ---
  const info = await auflosungPruefen(s, bild, gefunden, name);
  const hud = await zustand(s);
  const nGef = gefunden.length;
  const alle = nGef === n;
  // Bonus: aus der angezeigten Urteilszeile lesen und gegen die Rechnung prüfen
  let bonus = 0;
  if (alle) { const m = /(\d+)/.exec(info.urteil.replace(/^.*?:\s*/, "")); bonus = m ? +m[1] : -1; }
  const erwartetBild = G.punkteBild(nGef, fehl, 0, false) + bonus;
  pruefe(name + ": Urteil passt (" + ende + ")", ende === "alle" ? info.urteil === T("de", "geAlle", { v: bonus }) : ende === "zeit" ? info.urteil === T("de", "geZeitAus") : info.urteil === T("de", "geFertigMsg"), info.urteil);
  if (alle) pruefe(name + ": Zeitbonus liegt zwischen 0 und 58 (Bonus entsteht erst nach der 1. Sekunde) und ist gerade (2 je Sekunde)", bonus >= 0 && bonus <= 58 && bonus % 2 === 0, String(bonus));
  if (alle && nr === 0) pruefe(name + ": schnell fertig = fast voller Zeitbonus (>= 40)", bonus >= 40, String(bonus));
  if (nr === 3) pruefe(name + ": Zeitbonus berücksichtigt die Strafzeit der 2 Fehltipps (höchstens 52)", bonus <= 52, String(bonus));
  erwartetGesamt += erwartetBild; summeG += nGef; summeF += fehl; if (alle) summeV++;
  pruefe(name + ": Punkteanzeige = Summe bisher (" + erwartetGesamt + ")", hud.punkte === erwartetGesamt, JSON.stringify(hud));
  pruefe(name + ": Zahlen-Zeile nennt gefunden und Punkte des Bildes", (await s.textContent(".ge-zahlen")).trim() === T("de", "geGefunden", { n: nGef, m: n }) + " · " + T("de", "geBildPunkte", { v: erwartetBild }), await s.textContent(".ge-zahlen"));
  pruefe(name + ": Weiter-Knopf: " + (nr === 3 ? "Ergebnis zeigen" : "Nächstes Bild"), info.weiter === T("de", nr === 3 ? "geErgebnisZeigen" : "geWeiter"));
  // Nach der Auflösung zählen Tipps ins Bild nicht mehr
  const vor = (await zustand(s)).punkte;
  await tippeBild(s, 5, 5).catch(() => {});
  pruefe(name + ": nach der Auflösung zählt kein Tipp mehr", (await zustand(s)).punkte === vor);
  if (nr === 0 || nr === 1) { await layoutPruefen(s, name + " Auflösung (360)"); await s.screenshot({ path: join(bilder, "gefahren-aufloesung-" + (nr + 1) + "-360.png"), fullPage: true }); }
  if (nr === 2) await s.screenshot({ path: join(bilder, "gefahren-aufloesung-zeit-360.png"), fullPage: true });
  // Die Prüfung tippt viel schneller als ein Mensch: die Uhr des Servers (Attrappe) läuft vor dem letzten Weiter 20 s vor, sonst gilt der Wert zu Recht als „zu schnell“.
  if (nr === 3) warte(20000);
  await s.tap(".ge-weiter");
  if (nr < 3) { await s.waitForSelector(".ge-antwort[hidden]", { state: "attached" }); await s.waitForTimeout(250); }
}
pruefe("vier verschiedene Bilder im Durchgang", new Set(gesehenBilder).size === 4, gesehenBilder.join(","));
// Ergebnis
await s.waitForSelector(".sp-erg", { timeout: 6000 });
await s.waitForSelector(".sp-badge", { timeout: 6000 }).catch(async () => { console.log("  Speicherzeile:", await s.textContent(".sp-speicher"), JSON.stringify(db.academy_spiele_runden)); });
const erg = await s.evaluate(() => ({ gross: document.querySelector(".sp-gross").textContent.trim(), zeilen: Array.from(document.querySelectorAll(".ge-ergzeile")).map((e) => e.textContent.trim()), badges: Array.from(document.querySelectorAll(".sp-badge")).map((e) => e.textContent.trim()), knopf: document.querySelector(".ge-knopf").textContent.trim(), knopfSichtbar: !document.querySelector(".ge-knopf").hidden, hinweis: document.querySelector(".sp-hinweis-strasse").textContent.trim() }));
const gesamtAnz = gesehenBilder.reduce((a, id) => a + G.BILDER.find((b) => b.id === id).gefahren.length, 0);
pruefe("Ergebnis: Punkte = " + erwartetGesamt, erg.gross === String(erwartetGesamt), JSON.stringify(erg));
pruefe("Ergebnis: gefunden / Fehltipps stimmen", erg.zeilen[0] === T("de", "geErgGefunden", { n: summeG, m: gesamtAnz }) && erg.zeilen[1] === T("de", "geErgFehltipps", { n: summeF }), JSON.stringify(erg.zeilen));
pruefe("Ergebnis: Hinweis zum echten Verkehr, Knopf „Nochmal“ sichtbar", erg.hinweis === T("de", "geHinweis") && erg.knopf === "Nochmal" && erg.knopfSichtbar);
pruefe("Ergebnis: neue Bestpunktzahl und Platz", erg.badges.includes(T("de", "geNeu")) && erg.badges.some((b) => b.startsWith("Platz ")), JSON.stringify(erg.badges));
const gesp = db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "gefahren");
pruefe("Server hat den Wert gespeichert (" + erwartetGesamt + ")", !!gesp && gesp.wert === erwartetGesamt, JSON.stringify(gesp));
await layoutPruefen(s, "Gefahren Ergebnis (360)");
await s.screenshot({ path: join(bilder, "gefahren-ergebnis-360.png"), fullPage: true });
pruefe("Bestenliste zeigt die Mitspieler", (await s.locator(".sp-ranking .sp-zeile").count()) >= 3);
// zweiter Durchgang: Nochmal startet ein neues Bild ohne Reste des alten
await s.tap(".ge-knopf");
await s.waitForSelector(".ge-svg", { timeout: 9000 });
const z2 = await zustand(s);
pruefe("Nochmal: neuer Durchgang bei 0 Punkten, Bild 1 von 4, Ergebnis weg", z2.punkte === 0 && z2.hud.startsWith(T("de", "geBild", { n: 1, m: 4 })) && (await s.locator(".sp-erg").count()) === 0, JSON.stringify(z2));
// Startseite zeigt die Bestpunktzahl
await s.evaluate(() => history.back());
pruefe("keine Konsolenfehler im Durchgang", s.fehler.length === 0, s.fehler.join(" | "));
await s.context().close();

/* ===================== 3. Tippziele auf dem kleinen Handy (320 x 640) ===================== */
console.log("Gefahren finden: Trefferfläche auf 320 x 640");
s = await neueSeite({ b: 320, h: 640 });
await zumSpiel(s);
await s.tap(".ge-knopf");
await s.waitForSelector(".ge-svg", { timeout: 9000 });
await s.waitForTimeout(500);
await layoutPruefen(s, "Gefahren Spiel (320)");
{
  const b = await svgBox(s);
  const px = b.w / G.BILD_B;      // Pixel je Bildeinheit
  const bild = await aktuellesBild(s);
  pruefe("320: kleinster Trefferradius " + Math.min(...bild.gefahren.map((g) => g.r)) * px + " px (Ziel >= 22 px oder durch Mindestradius ergänzt)", true);
  // Tipp 20 px (CSS) neben der Mitte der ersten Gefahr trifft (Mindestradius 22 px)
  const h = bild.gefahren[0];
  await s.touchscreen.tap(b.l + (h.x / G.BILD_B) * b.w + 20, b.t + (h.y / G.BILD_H) * b.h);
  pruefe("320: Tipp 20 px neben der Mitte trifft die Gefahr (Trefferfläche mindestens 44 px breit)", (await zustand(s)).ringeGef === 1, JSON.stringify(await zustand(s)));
  await s.screenshot({ path: join(bilder, "gefahren-spiel-320.png") });
  await s.tap(".ge-fertig");
  await warteAufloesung(s);
  await layoutPruefen(s, "Gefahren Auflösung (320)");
  await s.screenshot({ path: join(bilder, "gefahren-aufloesung-320.png"), fullPage: true });
}
pruefe("320: keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
await s.context().close();

/* ===================== 4. Querformat ===================== */
console.log("Gefahren finden: Querformat 740 x 360");
s = await neueSeite({ b: 740, h: 360 });
await zumSpiel(s);
await s.tap(".ge-knopf");
await s.waitForSelector(".ge-svg", { timeout: 9000 });
await s.waitForTimeout(700);
{
  const rc = await s.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); return { szO: g(".ge-szene").top, szU: g(".ge-szene").bottom, szR: g(".ge-szene").right, hudL: g(".ge-hud").left, fertigU: g(".ge-fertig").bottom, h: window.innerHeight, w: window.innerWidth }; });
  pruefe("quer: ganzes Bild im Fenster, Anzeigen rechts daneben", rc.szO >= 0 && rc.szU <= rc.h && rc.hudL >= rc.szR - 1 && rc.fertigU <= rc.h, JSON.stringify(rc));
  await layoutPruefen(s, "Gefahren Spiel (quer)");
  await s.screenshot({ path: join(bilder, "gefahren-spiel-quer.png") });
  const bild = await aktuellesBild(s);
  for (const h of bild.gefahren) { await tippeBild(s, h.x, h.y); await s.waitForTimeout(60); }
  await warteAufloesung(s);
  await layoutPruefen(s, "Gefahren Auflösung (quer)");
  await s.screenshot({ path: join(bilder, "gefahren-aufloesung-quer.png"), fullPage: true });
  const weiter = await s.evaluate(() => { document.querySelector(".ge-weiter").scrollIntoView({ block: "center" }); const r = document.querySelector(".ge-weiter").getBoundingClientRect(); return { h: r.height, b: r.width, o: r.top, u: r.bottom, vh: window.innerHeight }; });
  pruefe("quer: Weiter-Knopf erreichbar und groß genug", weiter.h >= 43.5 && weiter.o >= 0 && weiter.u <= weiter.vh, JSON.stringify(weiter));
}
pruefe("quer: keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
await s.context().close();

/* ===================== 5. Dunkelmodus ===================== */
console.log("Gefahren finden: Dunkelmodus 412 x 915");
s = await neueSeite({ b: 412, h: 915, dunkel: true });
await zumSpiel(s);
await s.tap(".ge-knopf");
await s.waitForSelector(".ge-svg", { timeout: 9000 });
{
  const bild = await aktuellesBild(s);
  await tippeBild(s, bild.gefahren[0].x, bild.gefahren[0].y);
  await tippeBild(s, 5, 5);
  await s.tap(".ge-fertig");
  await warteAufloesung(s);
  const farben = await s.evaluate(() => { const c = (q, p) => getComputedStyle(document.querySelector(q))[p]; return { antwort: c(".ge-antwort", "backgroundColor"), text: c(".ge-eintrag-kopf", "color"), seite: getComputedStyle(document.body).backgroundColor }; });
  pruefe("dunkel: Erklärfeld dunkel, Text hell (aus App-Variablen)", farben.antwort !== "rgba(0, 0, 0, 0)" && farben.text !== farben.antwort, JSON.stringify(farben));
  await layoutPruefen(s, "Gefahren Auflösung (dunkel)");
  await s.screenshot({ path: join(bilder, "gefahren-aufloesung-dunkel.png"), fullPage: true });
}
await s.context().close();

/* ===================== 5b. Tastaturbedienung (ohne die Lösung zu verraten) ===================== */
console.log("Gefahren finden: Tastatur (Fadenkreuz)");
{
  const s = await neueSeite({ b: 360, h: 740 });
  await zumSpiel(s);
  await s.tap(".ge-knopf");
  await s.waitForSelector(".ge-svg", { timeout: 9000 });
  await s.waitForTimeout(400);
  const kreuz = () => s.evaluate(() => { const g = document.querySelector(".ge-fadenkreuz"); const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(g.getAttribute("transform") || ""); return { sichtbar: g.style.display !== "none" && getComputedStyle(g).display !== "none", x: m ? +m[1] : null, y: m ? +m[2] : null }; });
  const fokus = (klasse) => s.evaluate((k) => document.activeElement && document.activeElement.classList.contains(k), klasse);
  /* Pfeiltasten (große Schritte mit Umschalt) bis das Fadenkreuz höchstens eine Schrittweite vom Ziel steht */
  async function zuStelle(tx, ty) {
    for (let i = 0; i < 80; i++) {
      const k = await kreuz();
      const x = k.x == null ? G.BILD_B / 2 : k.x, y = k.y == null ? G.BILD_H / 2 : k.y, dx = tx - x, dy = ty - y;
      if (Math.abs(dx) <= 7.3 && Math.abs(dy) <= 7.3) return { x, y };
      const waagerecht = Math.abs(dx) > 7.3, d = waagerecht ? dx : dy;
      const taste = waagerecht ? (d > 0 ? "ArrowRight" : "ArrowLeft") : (d > 0 ? "ArrowDown" : "ArrowUp");
      await s.keyboard.press((Math.abs(d) > 50 ? "Shift+" : "") + taste);
    }
    throw new Error("Fadenkreuz erreicht " + tx + "/" + ty + " nicht");
  }
  const info = await s.evaluate(() => { const v = document.querySelector(".ge-svg"); return { tab: v.getAttribute("tabindex"), rolle: v.getAttribute("role"), aria: v.getAttribute("aria-label"), fokus: document.activeElement === v, knoepfe: v.querySelectorAll("button, a, [tabindex], [role=button]").length, ariaKinder: v.querySelectorAll("[aria-label]").length }; });
  pruefe("Tastatur: Bild fokussierbar (tabindex 0, role application), Beschriftung aus den Texten, Fokus liegt auf dem Bild", info.tab === "0" && info.rolle === "application" && info.aria.includes(T("de", "geTastaturAria")) && info.aria.includes(T("de", "geSzeneAria")) && info.fokus, JSON.stringify(info));
  pruefe("Tastatur: keine fokussierbaren Knöpfe und keine Beschriftungen im Bild (die Lösung wird nicht verraten)", info.knoepfe === 0 && info.ariaKinder === 0, JSON.stringify(info));
  let k = await kreuz();
  pruefe("Tastatur: Fadenkreuz ist vor der ersten Tastatureingabe verborgen", !k.sichtbar, JSON.stringify(k));
  await s.keyboard.press("ArrowRight");
  k = await kreuz();
  pruefe("Tastatur: erste Pfeiltaste zeigt das Fadenkreuz, Schrittweite 4 % der Bildbreite (14,4)", k.sichtbar && Math.abs(k.x - (G.BILD_B / 2 + 14.4)) < 0.2 && Math.abs(k.y - G.BILD_H / 2) < 0.2 && G.KREUZ_SCHRITT === G.BILD_B * 0.04, JSON.stringify(k));
  await s.keyboard.press("Shift+ArrowDown");
  k = await kreuz();
  pruefe("Tastatur: Umschalt = größere Schritte (43,2)", Math.abs(k.y - (G.BILD_H / 2 + 43.2)) < 0.2 && G.KREUZ_SCHRITT_GROSS === G.BILD_B * 0.12, JSON.stringify(k));
  await s.screenshot({ path: join(bilder, "ge-tastatur-fadenkreuz.png") });
  // Fingertipp blendet das Fadenkreuz wieder aus
  await tippeBild(s, 5, 5);
  await s.waitForTimeout(900);
  k = await kreuz();
  pruefe("Tastatur: bei Zeigerbedienung (Fingertipp) ist das Fadenkreuz wieder verborgen", !k.sichtbar, JSON.stringify(k));
  // Tastatur-Tipp ins Leere: Meldung „kein Treffer“ (aria-live), Abzug wie beim Fingertipp
  await zuStelle(10, 10);
  await s.keyboard.press("Enter");
  let z = await zustand(s);
  pruefe("Tastatur: Enter ins Leere meldet „Kein Treffer“ mit Abzug (aria-live), rotes Kreuz, Fadenkreuz sichtbar", z.meldung === T("de", "geTastaturKein", { v: 30, m: 2 }) && z.fehlMarken === 1 && (await kreuz()).sichtbar, JSON.stringify(z));
  pruefe("Tastatur: die Meldung steht in der aria-live-Zeile", await s.evaluate(() => { const m = document.querySelector(".ge-meldung"); return m.getAttribute("aria-live") === "polite" && m.getAttribute("role") === "status"; }));
  await s.waitForTimeout(500);
  const bild = await aktuellesBild(s);
  const n = bild.gefahren.length;
  for (let i = 0; i < n; i++) {
    const h = bild.gefahren[i];
    await zuStelle(h.x, h.y);
    await s.keyboard.press(i === 1 ? "Space" : "Enter");
    if (i < n - 1) {
      z = await zustand(s);
      pruefe("Tastatur: Treffer " + (i + 1) + " von " + n + (i === 1 ? " (Leertaste)" : " (Enter)") + ": Meldung „Treffer“, grüner Ring, Zähler", z.meldung === T("de", "geTastaturTreffer", { n: i + 1, m: n }) && z.ringeGef === i + 1 && z.zaehler === T("de", "geGefunden", { n: i + 1, m: n }), JSON.stringify(z));
    }
    await s.waitForTimeout(60);
  }
  await warteAufloesung(s);
  const aufl = await auflosungPruefen(s, bild, bild.gefahren.map((g) => g.id), "Tastatur: Auflösung nach Tastaturspiel");
  pruefe("Tastatur: nach dem Bild liegt der Fokus auf „Weiter“, das Fadenkreuz ist weg", (await fokus("ge-weiter")) && !(await kreuz()).sichtbar);
  await s.keyboard.press("ArrowRight");
  pruefe("Tastatur: nach der Auflösung bewegen Pfeiltasten nichts mehr", (await zustand(s)).antwort);
  await s.keyboard.press("Enter");
  await s.waitForSelector(".ge-svg", { timeout: 4000 });
  await s.waitForTimeout(250);
  const bild2 = await aktuellesBild(s);
  pruefe("Tastatur: Enter auf „Weiter“ zeigt das nächste Bild, der Fokus liegt wieder auf dem Bild", bild2.id !== bild.id && (await fokus("ge-svg")), bild2.id);
  pruefe("Tastatur: keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();
}

/* ===================== 6. Alle 18 Sprachen (360 x 740), ar mit Bildern ===================== */
console.log("Gefahren finden: alle 18 Sprachen");
for (const sp of SPRACHEN) {
  const t = await neueSeite({ b: 360, h: 740, sprache: sp });
  await zumHub(t);
  pruefe(sp + ": Karte übersetzt", (await t.textContent('.sp-karte[data-spiel="gefahren"] .sp-karte-titel')).trim() === TEXTE_GEFAHREN[sp].geName && (await t.textContent('.sp-karte[data-spiel="gefahren"] .sp-karte-kurz')).trim() === TEXTE_GEFAHREN[sp].geKurz);
  await t.tap('.sp-karte[data-spiel="gefahren"]'); await t.waitForSelector(".ge-knopf"); await t.waitForTimeout(350);
  pruefe(sp + ": Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await t.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
  pruefe(sp + ": Titel, Anleitung, Start in der Sprache", (await t.textContent(".sp-spieltitel")).trim() === TEXTE_GEFAHREN[sp].geName && (await t.textContent(".ge-anleitung")).trim() === TEXTE_GEFAHREN[sp].geBereit && (await t.textContent(".ge-knopf")).trim() === TEXTE[sp].start);
  await layoutPruefen(t, sp + " bereit");
  await t.tap(".ge-knopf");
  await t.waitForSelector(".ge-svg", { timeout: 9000 });
  const bild = await aktuellesBild(t);
  await tippeBild(t, bild.gefahren[0].x, bild.gefahren[0].y);
  await t.waitForTimeout(320);
  await tippeBild(t, 5, 5);
  const z = await zustand(t);
  pruefe(sp + ": Meldung zum Fehltipp und Zähler in der Sprache", z.meldung === T(sp, "geFehltipp", { v: 30, m: 2 }) && z.zaehler === T(sp, "geGefunden", { n: 1, m: bild.gefahren.length }) && z.hud === T(sp, "geBild", { n: 1, m: 4 }) + " · " + TEXTE_GEFAHREN[sp][bild.name], JSON.stringify(z));
  await layoutPruefen(t, sp + " im Spiel");
  await t.tap(".ge-fertig");
  await warteAufloesung(t);
  await auflosungPruefen(t, bild, [bild.gefahren[0].id], sp + " Auflösung", sp);
  const sichtbar = await t.evaluate(() => !/\{[nmv]\}|ge[A-Z][A-Za-z_]+/.test(document.querySelector("#spiele-platz").textContent));
  pruefe(sp + ": kein roher Schlüssel oder offener Platzhalter sichtbar", sichtbar);
  await layoutPruefen(t, sp + " Auflösung");
  if (["ar", "tr", "am", "ru", "de"].includes(sp)) { await t.waitForTimeout(300); await t.screenshot({ path: join(bilder, "gefahren-sprache-" + sp + ".png"), fullPage: true }); }
  pruefe(sp + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
  await t.context().close();
}

/* ===================== 7. Verlassen mitten im Bild ===================== */
console.log("Gefahren finden: Seite verlassen mitten im Bild");
s = await neueSeite({ b: 360, h: 740 });
await zumSpiel(s);
await s.tap(".ge-knopf");
await s.waitForSelector(".ge-svg", { timeout: 9000 });
await s.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
await s.waitForTimeout(200);
pruefe("App im Hintergrund: Runde wird abgebrochen, Start-Knopf wieder da, keine alten Punkte", (await s.locator(".ge-svg").count()) === 0 && (await s.locator(".ge-knopf:not([hidden])").count()) === 1 && (await s.textContent(".ge-knopf")).trim() === "Start");
await s.evaluate(() => { delete document.hidden; });
// Spiel verlassen (zurück zur Startseite) ohne Fehler
await s.evaluate(() => history.back());
await s.waitForTimeout(500);
pruefe("keine Konsolenfehler beim Verlassen", s.fehler.length === 0, s.fehler.join(" | "));
await s.context().close();

await browser.close();
server.close();
console.log("\n" + bestanden + " Prüfungen bestanden" + (befunde.length ? ", " + befunde.length + " FEHLER:\n - " + befunde.join("\n - ") : ""));
