// Browser-Prüfung des Spiele-Bereichs (06.10.2026): echte App in einem echten (Chromium-)Browser, mit Fingertipp.
//   - Die App läuft aus diesem Ordner, alle Server-Aufrufe der App werden abgefangen:
//     academy-spiele beantwortet die ECHTE Function-Datei gegen eine Datenbank im Speicher
//     (werkzeuge/edge-functions/spiele-im-speicher.mjs), alles andere bekommt leere Standardantworten.
//   - Geprüft: Menü, Startseite, Spiel, Fehlstart, Ergebnis + Rechnung, Tempo-Wechsel, Bestenliste,
//     Ausblenden, Verlassen mitten in der Runde, Handy hoch/quer, alle 18 Sprachen (nichts abgeschnitten,
//     nichts seitlich wischbar, Tippflächen >= 44 px, RTL), keine Fehler in der Konsole.
//   - Einzel-Freigabe je Spiel (nurVorschau): normales Schülergerät sieht Spiel 1, aber NICHT Spiel 2; ?spiele=1 zeigt beide.
//   - Tempo-Sprint (Spiel 2, neu 08.10.2026: Auffahrt auf 60 km/h, dann 10 s Strecke, Schein-3D-Zeichenfläche): ganze Läufe in
//     ECHTER Zeit (je ca. 20 s): ehrlicher Lauf, verpasste Auffahrt, Mehrfinger, Nachtippen nach dem Ende, Verlassen mitten im Lauf, alle 18 Sprachen.
//   - Schilder-Memory (Spiel 3) und Rechts vor Links (Spiel 4): ganze Spiele mit echten Fingertipps, Uhr-Pause beim Lesen,
//     falsche/richtige/abgelaufene Antworten, Regeltexte, Server-Ergebnis, alle 18 Sprachen.
//   Nur einzelne Teile prüfen: NUR=bisherige,tempo,memory,vorfahrt node --experimental-strip-types werkzeuge/pruefe-spiele-im-browser.mjs
//   (NUR_TEMPO=1 gilt weiter für nur den Tempo-Sprint)
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-spiele-im-browser.mjs
//   (Playwright liegt global: PLAYWRIGHT_PFAD=/opt/node22/lib/node_modules; Browser: PLAYWRIGHT_BROWSERS_PATH)
// Bilder landen in $SPIELE_BILDER (Standard: ./spiele-bilder, nicht einchecken).
import http from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { db, rufe, jetzt } from "./edge-functions/spiele-im-speicher.mjs";
import { REGELN, obergrenze } from "../spiele/tempo.js";
import { SPIELE } from "../spiele/spiele.js";
import * as V from "../spiele/vorfahrt.js";
import { SCHILDER } from "../spiele/memory.js";
import { TEXTE } from "../spiele/texte.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire((process.env.PLAYWRIGHT_PFAD || "/opt/node22/lib/node_modules") + "/")("playwright");
const bilder = process.env.SPIELE_BILDER || join(process.cwd(), "spiele-bilder");
mkdirSync(bilder, { recursive: true });

// ---- Datenbank im Speicher: ein Testschüler + Mitspieler ----
const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
const schueler = (id, name, extra) => db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null, ...extra });
schueler("t", "Serban Dumitrescu");
db.academy_sessions.push({ session_token: "tok-t", schueler_id: "t", expires_at: inEinemJahr });
[["m1", "Mira Kaya", 231, 1050, 14200, 1350], ["m2", "Jonas Weber", 262, 980, 18900, 1210], ["m3", "Ali Reza Karimi", 305, 900, 23100, 1100], ["m4", "Ayşe Yılmaz", 340, 840, 30500, 900]].forEach(([id, n, w, tempo, memory, vorf]) => {
  schueler(id, n);
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "ampel", wert: w, erreicht_am: jetzt(), versuche: 3 });
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "sprint", wert: tempo, erreicht_am: jetzt(), versuche: 2 });
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "memory", wert: memory, erreicht_am: jetzt(), versuche: 2 });
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "vorfahrt", wert: vorf, erreicht_am: jetzt(), versuche: 2 });
});

// ---- Static-Server für die App ----
const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg" };
const server = http.createServer((req, res) => {
  const pfad = join(wurzel, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "") || "index.html");
  if (!pfad.startsWith(wurzel) || !existsSync(pfad) || pfad === wurzel + "/") { res.writeHead(404); res.end("nicht da"); return; }
  res.writeHead(200, { "Content-Type": TYPEN[extname(pfad)] || "application/octet-stream" });
  res.end(readFileSync(pfad));
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
  db.academy_spiele_runden = [];   // Testaufbau: jede neue Seite beginnt mit leerem Rundenzähler (sonst greift nach 30 Runden in 10 min die Bremse des Servers)
  const ctx = await browser.newContext({ viewport: { width: opt.b, height: opt.h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, colorScheme: opt.dunkel ? "dark" : "light" });
  await ctx.addInitScript((d) => {
    try {
      localStorage.setItem("academy_session", JSON.stringify({ name: "Serban Dumitrescu", session_token: "tok-t", vollzugang: true, agb_akzeptiert_am: "2026-01-01T00:00:00Z", ablauf_am: d.ablauf, klasse: "B", telefon: "0100" }));
      if (!d.ohneFlag) localStorage.setItem("spiele_vorschau", "1");   // Vorschau-Gerät; ohne Flag = normales Schülergerät
      localStorage.setItem("academy_sprache", d.sprache);
    } catch (e) {}
  }, { ablauf: inEinemJahr, sprache: opt.sprache || "de", ohneFlag: !!opt.ohneFlag });
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
/* Spielkarte antippen: erst in die Bildschirmmitte holen (bei vielen Spielen und langen Texten liegt sie sonst unter der Menüleiste) */
async function karteTippen(s, id) {
  await s.locator('.sp-karte[data-spiel="' + id + '"]').evaluate((e) => e.scrollIntoView({ block: "center" }));
  await s.waitForTimeout(250);
  await s.tap('.sp-karte[data-spiel="' + id + '"]');
}
const zumSpiel = async (s) => { await zumHub(s); await karteTippen(s, 'ampel'); await s.waitForSelector(".sp-knopf"); };

/* Layout: nichts seitlich wischbar, nichts abgeschnitten, Tippflächen groß genug */
async function layoutPruefen(s, name, breite) {
  const r = await s.evaluate((b) => {
    const probleme = [];
    const de = document.documentElement;
    if (de.scrollWidth > window.innerWidth + 1) probleme.push("Seite wischbar: " + de.scrollWidth + " > " + window.innerWidth);
    document.querySelectorAll("#spiele-platz *").forEach((el) => {
      const rc = el.getBoundingClientRect();
      if (rc.width === 0 || rc.height === 0) return;
      if (rc.right > window.innerWidth + 1 || rc.left < -1) probleme.push("ragt raus: " + el.className + " " + Math.round(rc.left) + ".." + Math.round(rc.right));
      if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible") probleme.push("abgeschnitten: " + el.className);
    });
    document.querySelectorAll(".sp-tempo-knopf,.sp-schalter,.sp-knopf,.sp-karte,.sp-t-pad,.sp-m-karte,.sp-m-knopf,.sp-v-knopf,.sp-m-weiter,.sp-v-weiter,.sp-v-treffer").forEach((el) => {
      const rc = el.getBoundingClientRect();
      if (rc.height > 0 && (rc.height < 43.5 || rc.width < 43.5)) probleme.push("Tippfläche klein: " + el.className + " " + Math.round(rc.width) + "x" + Math.round(rc.height));
    });
    return probleme;
  }, breite);
  pruefe(name + ": Layout ohne Überstand/Abschneiden/kleine Knöpfe", r.length === 0, r.slice(0, 4).join(" | "));
}

/* eine Runde wie ein Mensch spielen: Start, auf das Ende der Lichter warten, mit Abstand bremsen */
async function runde(s, reaktionsPause) {
  await s.tap(".sp-knopf");
  await s.waitForSelector(".sp-status.go", { timeout: 12000 });
  await s.waitForTimeout(reaktionsPause);
  await s.tap(".sp-knopf");
}

async function bisherige() {
  console.log("Menü und Startseite (360 x 740)");
  let s = await neueSeite({ b: 360, h: 740 });
  await s.waitForSelector("#drawer-open-btn", { timeout: 15000 });
  await s.tap("#drawer-open-btn");
  pruefe("Menüpunkt „Spiele“ ist da (Vorschau-Gerät)", await s.isVisible('[data-drawer="spiele"]'));
  await s.tap('[data-drawer="spiele"]');
  await s.waitForSelector(".sp-karte");
  pruefe("Startseite zeigt Titel und Spielkarte", (await s.textContent(".sp-titel")).trim() === "Spiele" && (await s.textContent(".sp-karte-titel")).includes("Ampel-Bremsweg"));
  await s.waitForSelector(".sp-name");
  pruefe("Name im Ranking = Vorname + 1 Buchstabe", (await s.textContent(".sp-name")).trim() === "Serban D.", await s.textContent(".sp-name"));
  pruefe("Noch nicht gespielt steht an der Karte", (await s.textContent("[data-best]")).includes("Noch nicht gespielt"));
  await layoutPruefen(s, "Startseite 360", 360);
  await s.waitForTimeout(700); // Überblendung der App abwarten, sonst steht die alte Seite als Geisterbild im Foto
  await s.screenshot({ path: join(bilder, "start-360.png") });

  console.log("Spiel: Fehlstart");
  await karteTippen(s, 'ampel');
  await s.waitForSelector(".sp-knopf");
  await layoutPruefen(s, "Spiel 360 (bereit)", 360);
  await s.screenshot({ path: join(bilder, "spiel-bereit-360.png") });
  await s.tap(".sp-knopf");
  await s.waitForTimeout(1800);
  pruefe("während der Lichter: Knopf heißt BREMSEN", (await s.textContent(".sp-knopf")).trim() === "BREMSEN");
  await s.screenshot({ path: join(bilder, "spiel-lichter-360.png") });
  await s.tap(".sp-knopf");
  await s.waitForSelector(".sp-status.warn");
  pruefe("zu früh gebremst -> Fehlstart, kein Ergebnis", (await s.textContent(".sp-status")).includes("Fehlstart") && (await s.locator(".sp-erg").count()) === 0);
  pruefe("Fehlstart zählt nicht im Ranking", db.academy_spiele_bestwerte.filter((b) => b.schueler_id === "t").length === 0);

  console.log("Spiel: erste Runde");
  await runde(s, 280);
  await s.waitForSelector(".sp-erg");
  const ms1 = parseInt((await s.textContent(".sp-gross")).trim(), 10);
  pruefe("Reaktionszeit im menschlichen Bereich (120–1500 ms)", ms1 >= 120 && ms1 <= 1500, "ms=" + ms1);
  const werte = async () => (await s.locator(".sp-bz-wert").allTextContents()).map((x) => x.trim());
  let w = await werte();
  const erwDein = (v, ms) => { const r = Math.round(((v / 3.6) * (ms / 1000) + Math.pow(v / 10, 2)) * 10) / 10; return (Number.isInteger(r) ? String(r) : r.toFixed(1).replace(".", ",")) + " m"; };
  pruefe("50 km/h: Auf der Straße 40 m, bei Nässe 65 m", w[1] === "40 m" && w[2] === "65 m", w.join(" / "));
  pruefe("50 km/h: Dein Anhalteweg = Reaktion + 25 m Bremsweg", w[0] === erwDein(50, ms1), w[0] + " erwartet " + erwDein(50, ms1));
  await s.tap('.sp-tempo-knopf[data-tempo="100"]');
  w = await werte();
  pruefe("100 km/h: Auf der Straße 130 m, bei Nässe 230 m (sofort neu gerechnet)", w[1] === "130 m" && w[2] === "230 m" && w[0] === erwDein(100, ms1), w.join(" / "));
  await s.tap('.sp-tempo-knopf[data-tempo="30"]');
  w = await werte();
  pruefe("30 km/h: Auf der Straße 18 m, bei Nässe 27 m", w[1] === "18 m" && w[2] === "27 m", w.join(" / "));
  await s.waitForSelector(".sp-badge.neu");
  pruefe("erste Runde: „Neue Bestzeit!“ und Platz", (await s.textContent(".sp-speicher")).includes("Neue Bestzeit") && /Platz \d+ von \d+/.test(await s.textContent(".sp-speicher")), await s.textContent(".sp-speicher"));
  await s.waitForSelector(".sp-zeile.ich");
  pruefe("Bestenliste zeigt mich mit „Du“", (await s.textContent(".sp-zeile.ich")).includes("Du"));
  const namen = await s.locator(".sp-rname").allTextContents();
  pruefe("Bestenliste: nur Vorname + 1 Buchstabe", namen.every((n) => /^[^\s]+( [^\s]\.)?( · Du)?$/.test(n.trim())), namen.join(" | "));
  pruefe("Ali Reza Karimi erscheint als „Ali K.“", namen.some((n) => n.trim() === "Ali K."), namen.join(" | "));
  await layoutPruefen(s, "Ergebnis 360", 360);
  await s.screenshot({ path: join(bilder, "ergebnis-360.png"), fullPage: true });
  pruefe("Server hat die Bestzeit gespeichert", db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t")?.wert === ms1);

  console.log("Spiel: zweite, langsamere Runde");
  await s.tap('.sp-tempo-knopf[data-tempo="50"]');
  await runde(s, 700);
  await s.waitForSelector(".sp-erg");
  await s.waitForFunction(() => /Bestzeit/.test(document.querySelector(".sp-speicher")?.textContent || ""));
  const ms2 = parseInt((await s.textContent(".sp-gross")).trim(), 10);
  pruefe("langsamere Runde: keine neue Bestzeit, Bestzeit bleibt", ms2 > ms1 && (await s.locator(".sp-badge.neu").count()) === 0 && db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t").wert === ms1, ms2 + " vs " + ms1);

  console.log("Ausblenden");
  await s.tap(".sp-schalter");
  await s.waitForFunction(() => document.querySelector(".sp-schalter")?.getAttribute("aria-checked") === "false");
  await s.waitForFunction(() => document.querySelectorAll(".sp-zeile.ich").length === 0);
  pruefe("ausgeblendet: nicht mehr in der Bestenliste", (await s.locator(".sp-zeile.ich").count()) === 0 && !(await s.locator(".sp-rname").allTextContents()).some((n) => n.includes("Serban")));
  pruefe("Hinweis wechselt auf „Du bist ausgeblendet“", (await s.textContent(".sp-hinweis")).includes("ausgeblendet"));
  await s.tap(".sp-schalter");
  await s.waitForFunction(() => document.querySelector(".sp-schalter")?.getAttribute("aria-checked") === "true");
  await s.waitForSelector(".sp-zeile.ich");
  pruefe("wieder sichtbar: zurück in der Bestenliste", true);

  console.log("Navigation: Zurück, Neustart und Verlassen mitten in der Runde");
  await s.tap(".sp-knopf");                       // neue Runde starten …
  await s.waitForTimeout(600);
  await s.tap("[data-nav-zurueck]");              // … und mitten drin zurück zur Startseite
  await s.waitForSelector(".sp-karte");
  pruefe("Zurück führt zur Spiele-Startseite", await s.isVisible(".sp-karte"));
  pruefe("Startseite zeigt jetzt die Bestzeit", (await s.textContent("[data-best]")).includes(ms1 + " ms"), await s.textContent("[data-best]"));
  await s.waitForTimeout(7500);                   // länger als jede Rundenzeit: alte Zeitgeber dürfen nichts mehr tun
  pruefe("nach dem Verlassen keine Fehler / keine späten Zeitgeber", s.fehler.length === 0, s.fehler.join(" | "));
  await karteTippen(s, 'ampel');
  await s.waitForSelector(".sp-knopf");
  pruefe("Spiel lässt sich erneut öffnen, Zustand frisch", (await s.textContent(".sp-knopf")).trim() === "Start" && (await s.locator(".sp-erg:visible").count()) === 0);
  pruefe("Konsole ohne Fehler (Teil 1)", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();

  console.log("Freigabe für alle: normales Schülergerät ohne ?spiele=1");
  { const n = await neueSeite({ b: 360, h: 740, ohneFlag: true });
    await zumHub(n);
    pruefe("Schüler ohne Vorschau-Flag sieht Menüpunkt und Spiele-Startseite", (await n.textContent(".sp-titel")).trim() === "Spiele");
    await n.context().close(); }

  console.log("Weitere Bildschirmgrößen und Dunkelmodus");
  for (const g of [{ b: 412, h: 915, n: "412 hoch" }, { b: 740, h: 360, n: "quer 740x360" }, { b: 320, h: 640, n: "klein 320" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }]) {
    const t = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
    await zumSpiel(t);
    await layoutPruefen(t, "Spiel " + g.n, g.b);
    await t.waitForTimeout(900);   // Überblendung und automatisches Scrollen abwarten
    if (g.b > g.h) {   // Querformat: Lichter UND Knopf müssen ohne eigenes Scrollen im Bild sein (über der Menüleiste)
      const rc = await t.evaluate(() => { const r = document.querySelector(".sp-knopf").getBoundingClientRect(); const g = document.querySelector(".sp-gantry").getBoundingClientRect(); return { lichterOben: g.top, oben: r.top, unten: r.bottom, h: window.innerHeight }; });
      pruefe("Querformat: Lichter und Start-Knopf ohne eigenes Scrollen im Bild", rc.lichterOben >= 0 && rc.oben >= 0 && rc.unten <= rc.h - 70, JSON.stringify(rc));
    }
    await t.waitForTimeout(700);
    await t.screenshot({ path: join(bilder, "spiel-" + g.n.replace(/\W+/g, "_") + ".png") });
    await t.context().close();
  }

  console.log("Alle 18 Sprachen (Handy 360, Spiel + Startseite)");
  const SPRACHEN = ["de", "tr", "en", "ar", "es", "ru", "sr", "ckb", "kmr", "hi", "ur", "vi", "rif", "fa", "ps", "el", "am", "ti"];
  const RTL = ["ar", "ckb", "ur", "fa", "ps"];
  for (const sp of SPRACHEN) {
    const t = await neueSeite({ b: 360, h: 740, sprache: sp });
    await zumHub(t);
    await t.waitForSelector(".sp-name");
    const dirOk = (await t.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr");
    const titel = (await t.textContent(".sp-titel")).trim();
    pruefe(sp + ": Titel übersetzt, Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), dirOk && (sp === "de" || titel !== "Spiele"), titel);
    await layoutPruefen(t, sp + " Startseite", 360);
    await karteTippen(t, 'ampel');
    await t.waitForSelector(".sp-knopf");
    await runde(t, 300);
    await t.waitForSelector(".sp-erg");
    await t.waitForSelector(".sp-badge");
    await layoutPruefen(t, sp + " Ergebnis", 360);
    const fehlt = await t.evaluate(() => Array.from(document.querySelectorAll("#spiele-platz *")).filter((e) => e.children.length === 0 && /^(laden|fehler|rankingTitel)$/.test((e.textContent || "").trim())).length);
    pruefe(sp + ": kein roher Schlüsselname sichtbar", fehlt === 0);
    if (["ar", "am", "tr"].includes(sp)) { await t.waitForTimeout(700); await t.screenshot({ path: join(bilder, "sprache-" + sp + ".png"), fullPage: true }); }
    pruefe(sp + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
    await t.context().close();
  }
}

/* =========================  Tempo-Sprint (Spiel 2)  ========================= */
const warteMs = (ms) => new Promise((ok) => setTimeout(ok, ms));
const zumTempo = async (s) => { await zumHub(s); await karteTippen(s, 'sprint'); await s.waitForSelector(".sp-t-pad"); };
const padText = async (s) => (await s.textContent(".sp-t-pad")).trim();
const zahlJetzt = async (s) => parseInt(await s.textContent(".sp-t-zahl"), 10);
const SPRACHEN = ["de", "tr", "en", "ar", "es", "ru", "sr", "ckb", "kmr", "hi", "ur", "vi", "rif", "fa", "ps", "el", "am", "ti"];
const RTL = ["ar", "ckb", "ur", "fa", "ps"];

/* Mitspieler im Browser: tippt wie ein Mensch (Fingerereignisse auf die Tippfläche), sobald die Fläche „TIPPEN“ zeigt.
   takt: ms zwischen Tipps (100 = 10 pro Sekunde); salve: Finger gleichzeitig (Mehrfinger) */
async function botStarten(s, o) {
  await s.evaluate((opt) => {
    const pad = document.querySelector(".sp-t-pad");
    window.__bot = { id: setInterval(() => {
      if (!pad.classList.contains("tippen")) return;
      for (let i = 0; i < (opt.salve || 1); i++) pad.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", pointerId: 10 + i, isPrimary: i === 0 }));
    }, opt.takt || 100) };
  }, o);
}
const botStoppen = (s) => s.evaluate(() => { if (window.__bot) clearInterval(window.__bot.id); });

/* Zeichenfläche: zeigt mehr als eine Farbe und ändert sich von einem Bild zum nächsten (die Szene läuft) */
async function canvasLebt(s) {
  const bild = () => s.evaluate(() => { const c = document.querySelector(".sp-t-canvas"); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; const farben = new Set(); let h = 0; for (let i = 0; i < d.length; i += 4 * 37) { farben.add((d[i] >> 5) + "," + (d[i + 1] >> 5) + "," + (d[i + 2] >> 5)); h = (h * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) >>> 0; } return { farben: farben.size, h: h }; });
  const a = await bild(); await s.waitForTimeout(350); const b = await bild();
  return a.farben >= 8 && b.farben >= 8 && a.h !== b.h;
}

/* Hochformat: Tacho, Straße, Meldung UND Tippfläche in einem Bild, über der Menüleiste (ca. 90 px) */
async function imBildPruefen(s, name) {
  const r = await s.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); return { hudO: g(".sp-t-hud").top, padO: g(".sp-t-pad").top, padU: g(".sp-t-pad").bottom, h: window.innerHeight }; });
  pruefe(name + ": Tacho und Tippfläche zusammen im Bild (Tippfläche endet über der Menüleiste)", r.hudO >= 0 && r.padO > r.hudO && r.padU <= r.h - 80, JSON.stringify(r));
}

async function tempoPruefungen() {
  console.log("Einzel-Freigabe je Spiel");
  // Datengetrieben: welche Spiele sichtbar/versteckt sind, steht in SPIELE (spiele/spiele.js, Feld nurVorschau)
  const alleIds = SPIELE.map((x) => x.id), sichtbarIds = SPIELE.filter((x) => !x.nurVorschau).map((x) => x.id), verstecktIds = SPIELE.filter((x) => x.nurVorschau).map((x) => x.id);
  console.log("  (alle: " + alleIds.join(",") + " | für alle: " + sichtbarIds.join(",") + " | nur Vorschau: " + (verstecktIds.join(",") || "–") + ")");
  { // normales Schülergerät (ohne Flag): nur die freigegebenen Spiele
    const n = await neueSeite({ b: 360, h: 740, ohneFlag: true });
    await zumHub(n);
    const karten = await n.locator(".sp-karte").evaluateAll((els) => els.map((e) => e.dataset.spiel));
    pruefe("Schüler ohne Flag sieht genau die freigegebenen Spiele (" + sichtbarIds.join(", ") + ")", karten.join(",") === sichtbarIds.join(","), karten.join(","));
    pruefe("Schüler ohne Flag: keine Vorschau-Marke auf der Startseite", (await n.locator(".sp-karte-marke").count()) === 0);
    for (const id of verstecktIds) {
      await n.evaluate((x) => go({ drawer: "spiele", spiel: x }), id);
      await n.waitForSelector(".sp-karte", { timeout: 8000 });
      await n.waitForTimeout(600);
      pruefe("direkt aufgerufenes verstecktes Spiel „" + id + "“ öffnet für normale Schüler NICHT (Startseite statt Spiel)", (await n.locator(".sp-karte").count()) === sichtbarIds.length && (await n.locator("#spiele-platz .sp-knopf, #spiele-platz .sp-t-pad, #spiele-platz .sp-m-feld, #spiele-platz .sp-v-szene").count()) === 0);
    }
    if (!verstecktIds.length) console.log("  (kein verstecktes Spiel in dieser Version: der Mechanismus wurde mit Spiel 2 geprüft und kommt mit dem nächsten neuen Spiel wieder dran)");
    await n.evaluate(() => go({ drawer: "spiele", spiel: "ampel" }));
    await n.waitForSelector(".sp-knopf", { timeout: 8000 });
    pruefe("Spiel 1 lässt sich weiterhin direkt öffnen", (await n.locator(".sp-knopf").count()) === 1);
    if (sichtbarIds.includes("sprint")) {
      await n.evaluate(() => go({ drawer: "spiele", spiel: "sprint" }));
      await n.waitForSelector(".sp-t-pad", { timeout: 8000 });
      pruefe("Spiel 2 ist für normale Schüler freigegeben und spielbar (Pad „Start“)", (await padText(n)) === "Start");
    }
    pruefe("keine Konsolenfehler (Freigabe)", n.fehler.length === 0, n.fehler.join(" | "));
    await n.context().close();
  }
  { // ?spiele=1 in der Adresse: Vorschau-Gerät sieht alle Spiele
    const n = await neueSeite({ b: 360, h: 740, ohneFlag: true, suche: "?spiele=1" });
    await zumHub(n);
    const karten = await n.locator(".sp-karte").evaluateAll((els) => els.map((e) => e.dataset.spiel));
    pruefe("Gerät mit ?spiele=1 sieht alle Spiele", karten.join(",") === alleIds.join(","), karten.join(","));
    pruefe("Vorschau-Marke genau auf den versteckten Spielen", (await n.locator(".sp-karte-marke").count()) === verstecktIds.length && (await n.locator(".sp-karte[data-spiel] .sp-karte-marke").evaluateAll((els) => els.map((e) => e.closest(".sp-karte").dataset.spiel))).join(",") === verstecktIds.join(","));
    await n.waitForFunction(() => /Noch nicht gespielt/.test(document.querySelector('[data-best="sprint"]')?.textContent || ""));
    await karteTippen(n, 'sprint');
    await n.waitForSelector(".sp-t-pad");
    pruefe("Tempo-Sprint öffnet auf dem Vorschau-Gerät", (await padText(n)) === "Start");
    await n.context().close();
  }

  console.log("Tempo-Sprint: Layout in Ruhe (bereit)");
  for (const g of [{ b: 360, h: 740, n: "360" }, { b: 412, h: 915, n: "412" }, { b: 320, h: 640, n: "320" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }]) {
    const t = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
    await zumTempo(t);
    await t.waitForTimeout(1200);
    await layoutPruefen(t, "Tempo-Sprint bereit " + g.n, g.b);
    await imBildPruefen(t, "Tempo-Sprint bereit " + g.n);
    await t.screenshot({ path: join(bilder, "tempo-bereit-" + g.n.replace(/\W+/g, "_") + ".png") });
    pruefe("Tempo-Sprint " + g.n + ": Zeichenfläche zeigt eine Szene und bewegt sich (Vorführung)", await canvasLebt(t), "Fläche leer oder starr");
    pruefe("Tempo-Sprint " + g.n + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
    await t.context().close();
  }

  console.log("Tempo-Sprint: ehrlicher Lauf in echter Zeit (360 x 740, ca. 20 s)");
  let s = await neueSeite({ b: 360, h: 740 });
  await zumTempo(s);
  pruefe("bereit: Fläche heißt „Start“, Tacho 0, Anleitung sichtbar", (await padText(s)) === "Start" && (await zahlJetzt(s)) === 0 && (await s.isVisible(".sp-t-anleitung")));
  pruefe("bereit: Anleitung nennt 60 km/h und 10 Sekunden", /60 km\/h/.test(await s.textContent(".sp-t-anleitung")) && /10 Sekunden/.test(await s.textContent(".sp-t-anleitung")));
  await s.tap(".sp-t-pad");
  await s.waitForFunction(() => /^[123…]$/.test(document.querySelector(".sp-t-pad").textContent.trim()), null, { timeout: 8000 });
  pruefe("Start: Anleitung verschwindet, Countdown läuft", !(await s.isVisible(".sp-t-anleitung")));
  await imBildPruefen(s, "Tempo-Sprint Countdown 360");
  await s.screenshot({ path: join(bilder, "tempo-countdown-360.png") });
  await s.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
  pruefe("nach dem Countdown: Fläche heißt TIPPEN!, Meldung „GAS GEBEN“", (await padText(s)) === "TIPPEN!" && /GAS GEBEN/.test(await s.textContent(".sp-t-meldung")), await s.textContent(".sp-t-meldung"));
  pruefe("Auffahrt: Restzeit läuft (höchstens 6 s) und Strecke steht auf 0", /^[0-6][,.]\d s$/.test((await s.textContent(".sp-t-rest")).trim()) && (await s.textContent(".sp-t-meter")).trim() === "0", await s.textContent(".sp-t-rest"));
  await botStarten(s, { takt: 100 });
  await s.waitForFunction(() => /Drauf auf die Autobahn/.test(document.querySelector(".sp-t-meldung").textContent), null, { timeout: 5000 });
  pruefe("60 km/h erreicht: „Drauf auf die Autobahn“, Fläche wird golden", (await s.getAttribute(".sp-t-pad", "class")).includes("spurt"));
  await s.waitForTimeout(2200);
  const mitte = { tacho: await zahlJetzt(s), meter: parseInt(await s.textContent(".sp-t-meter"), 10), rest: (await s.textContent(".sp-t-rest")).trim() };
  pruefe("auf der Autobahn: Tacho über 60, Strecke wächst, Restzeit unter 10 s", mitte.tacho > 60 && mitte.meter > 20 && /^[0-9][,.]\d s$/.test(mitte.rest), JSON.stringify(mitte));
  await imBildPruefen(s, "Tempo-Sprint Autobahn 360");
  await s.screenshot({ path: join(bilder, "tempo-autobahn-360.png") });
  pruefe("Zeichenfläche lebt mitten im Lauf", await canvasLebt(s));
  await s.waitForSelector(".sp-erg", { timeout: 20000 });
  await botStoppen(s);
  const erg = await s.evaluate(() => ({ gross: document.querySelector(".sp-gross").textContent.replace(/\s+/g, " ").trim(), zahlen: Array.from(document.querySelectorAll(".sp-t-zahlen b")).map((b) => b.textContent.trim()), pad: document.querySelector(".sp-t-pad").textContent.trim() }));
  const wert1 = parseInt(erg.gross, 10), vmax1 = parseInt(erg.zahlen[0], 10), tipps1 = parseInt(erg.zahlen[1], 10);
  pruefe("Ergebnis: Strecke in m, Höchsttempo, Tipps – im menschlichen Bereich (10 Tipps/s ≈ 770 m, ≈ 400 km/h)", /m$/.test(erg.gross) && wert1 >= 500 && wert1 <= 1000 && vmax1 >= 300 && vmax1 <= 480 && tipps1 >= 70 && tipps1 <= 105, JSON.stringify(erg));
  pruefe("Ergebnis: Strecke passt zum Höchsttempo (nie mehr als 10 s mit Höchsttempo)", wert1 <= vmax1 / 3.6 * 10 + 1);
  pruefe("Fläche heißt wieder „Nochmal“", erg.pad === "Nochmal", erg.pad);
  await s.waitForFunction(() => /Platz \d+ von \d+/.test(document.querySelector(".sp-speicher")?.textContent || ""), null, { timeout: 8000 });
  pruefe("Server hat die Strecke als Bestwert gespeichert (Spiel „sprint“, größer ist besser)", db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "sprint")?.wert === wert1, JSON.stringify(db.academy_spiele_bestwerte.filter((b) => b.schueler_id === "t")));
  pruefe("Ergebnis-Hinweis: nur im Spiel so schnell, im echten Leben Richtgeschwindigkeit", /130/.test(await s.textContent(".sp-hinweis-strasse")));
  pruefe("Bestenliste in Metern, größte zuerst", await s.evaluate(() => { const w = Array.from(document.querySelectorAll(".sp-wert")).map((e) => parseInt(e.textContent, 10)); return w.length >= 2 && /m$/.test(document.querySelector(".sp-wert").textContent.trim()) && w.slice(0, -1).every((x, i) => i === w.length - 2 || x >= w[i + 1]); }));
  await imBildPruefen(s, "Tempo-Sprint Ergebnis 360");
  await layoutPruefen(s, "Tempo-Sprint Ergebnis 360", 360);
  await s.screenshot({ path: join(bilder, "tempo-ergebnis-360.png"), fullPage: true });
  pruefe("Konsole ohne Fehler (ehrlicher Lauf)", s.fehler.length === 0, s.fehler.join(" | "));

  console.log("Tempo-Sprint: Auffahrt verpasst (nicht getippt)");
  const vorher = db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "sprint").wert;
  await s.waitForTimeout(1600);
  await s.tap(".sp-t-pad");
  await s.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
  await s.waitForSelector(".sp-t-verpasst", { timeout: 9000 });
  pruefe("zu langsam: Meldung „Du brauchst 60 km/h“, kein Ergebnis, Fläche „Nochmal“", /60 km\/h/.test(await s.textContent(".sp-t-verpasst")) && (await padText(s)) === "Nochmal" && (await s.locator(".sp-gross").count()) === 0);
  pruefe("verpasste Auffahrt wird nicht gespeichert, Bestwert bleibt", db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "sprint").wert === vorher);
  await s.screenshot({ path: join(bilder, "tempo-verpasst-360.png"), fullPage: true });
  await s.context().close();

  console.log("Tempo-Sprint: Nachtippen nach dem Ende startet keine neue Runde (412 x 915, ca. 20 s)");
  s = await neueSeite({ b: 412, h: 915 });
  await zumTempo(s);
  await s.tap(".sp-t-pad");
  await s.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
  await botStarten(s, { takt: 80, salve: 1 });
  await s.waitForSelector(".sp-erg", { timeout: 20000 });
  await botStoppen(s);
  await s.evaluate(() => { const p = document.querySelector(".sp-t-pad"); for (let i = 0; i < 6; i++) p.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", pointerId: 3 })); });
  await s.waitForTimeout(300);
  pruefe("wildes Weitertippen direkt nach dem Ende startet keine neue Runde (Ergebnis bleibt)", (await s.locator(".sp-erg").count()) === 1 && (await padText(s)) === "Nochmal");
  await s.waitForTimeout(1500);
  await s.tap(".sp-t-pad");
  await s.waitForFunction(() => /^[123…]$/.test(document.querySelector(".sp-t-pad").textContent.trim()), null, { timeout: 6000 });
  pruefe("nach der Sperre startet „Nochmal“ eine neue Runde", true);
  await s.context().close();

  console.log("Tempo-Sprint: Mehrfinger zählen nicht mehr als einer, Mensch-Takt (ca. 20 s)");
  { const m = await neueSeite({ b: 360, h: 740 });
    await zumTempo(m);
    await m.tap(".sp-t-pad");
    await m.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
    await botStarten(m, { takt: 80, salve: 4 });          // vier Finger gleichzeitig, alle 80 ms
    await m.waitForSelector(".sp-erg", { timeout: 20000 });
    await botStoppen(m);
    const z = await m.evaluate(() => Array.from(document.querySelectorAll(".sp-t-zahlen b")).map((b) => parseInt(b.textContent, 10)));
    pruefe("vier Finger gleichzeitig: höchstens 16 Tipps pro Sekunde (≤ 160)", z[1] <= 160 && z[1] >= 40, JSON.stringify(z));
    const grenze = await m.evaluate(() => document.querySelector(".sp-gross").textContent);
    pruefe("Server nimmt auch den Mehrfinger-Lauf an (Ergebnis gespeichert)", db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "sprint") !== undefined, grenze);
    await m.context().close(); }

  console.log("Tempo-Sprint: Verlassen mitten im Lauf / App in den Hintergrund");
  { const v = await neueSeite({ b: 360, h: 740 });
    await zumTempo(v);
    const runden0 = db.academy_spiele_runden.length;
    await v.tap(".sp-t-pad");
    await v.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
    await botStarten(v, { takt: 100 });
    await v.waitForTimeout(1500);
    await v.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
    await botStoppen(v);
    await v.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); });
    pruefe("App in den Hintergrund: Runde bricht ab, Spiel wieder auf „Start“, nichts gespeichert", (await padText(v)) === "Start" && (await v.locator(".sp-erg:visible").count()) === 0);
    await v.waitForTimeout(9000);
    pruefe("keine späten Zeitgeber nach dem Abbruch (Fläche bleibt „Start“)", (await padText(v)) === "Start" && v.fehler.length === 0, v.fehler.join(" | "));
    await v.tap(".sp-t-pad");
    await v.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
    await v.tap("[data-nav-zurueck]");
    await v.waitForSelector(".sp-karte");
    await v.waitForTimeout(12000);
    pruefe("Zurück mitten im Lauf: keine Fehler, keine späten Zeitgeber", v.fehler.length === 0, v.fehler.join(" | "));
    await v.context().close(); }

  console.log("Tempo-Sprint: kleiner Bildschirm 320 x 640 und Querformat 740 x 360 (mitten im Lauf)");
  for (const g of [{ b: 320, h: 640, n: "320" }, { b: 740, h: 360, n: "quer" }]) {
    const t = await neueSeite({ b: g.b, h: g.h });
    await zumTempo(t);
    await t.waitForTimeout(700);
    await t.tap(".sp-t-pad");
    await t.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
    await botStarten(t, { takt: 100 });
    await t.waitForFunction(() => /Drauf auf die Autobahn/.test(document.querySelector(".sp-t-meldung").textContent), null, { timeout: 6000 });
    await t.waitForTimeout(1500);
    await layoutPruefen(t, "Tempo Lauf " + g.n, g.b);
    if (g.b > g.h) {
      const rc = await t.evaluate(() => { const p = document.querySelector(".sp-t-pad").getBoundingClientRect(), h = document.querySelector(".sp-t-hud").getBoundingClientRect(); return { hudO: h.top, padO: p.top, padU: p.bottom, h: innerHeight }; });
      pruefe("Querformat: Tacho und Tippfläche ohne Scrollen im Bild", rc.hudO >= 0 && rc.padO >= 0 && rc.padU <= rc.h - 70, JSON.stringify(rc));
    } else await imBildPruefen(t, "Tempo Lauf 320");
    await t.screenshot({ path: join(bilder, "tempo-lauf-" + g.n + ".png") });
    await botStoppen(t);
    pruefe("Tempo " + g.n + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
    await t.context().close();
  }

  console.log("Tempo-Sprint: alle 18 Sprachen (360 x 740)");
  for (const sp of SPRACHEN) {
    const t = await neueSeite({ b: 360, h: 740, sprache: sp });
    await zumHub(t);
    await t.waitForSelector('.sp-karte[data-spiel="sprint"]');
    const titel = (await t.textContent('.sp-karte[data-spiel="sprint"] .sp-karte-titel')).trim();
    pruefe(sp + ": Tempo-Sprint-Karte übersetzt", sp === "de" ? titel === "Tempo-Sprint" : titel !== "Tempo-Sprint" && !/^tempo[A-Z]/.test(titel), titel);
    await layoutPruefen(t, sp + " Spieleliste", 360);
    await karteTippen(t, 'sprint');
    await t.waitForSelector(".sp-t-pad");
    pruefe(sp + ": Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await t.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
    await layoutPruefen(t, sp + " Tempo bereit", 360);
    await t.tap(".sp-t-pad");
    await t.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
    await botStarten(t, { takt: 100 });
    await t.waitForFunction(() => document.querySelector(".sp-t-pad").className.includes("spurt"), null, { timeout: 6000 });
    await t.waitForTimeout(500);
    const info = await t.evaluate(() => ({ alles: document.querySelector("#spiele-platz").textContent, aria: document.querySelector(".sp-t-szene").getAttribute("aria-label") || "", meld: document.querySelector(".sp-t-meldung").textContent.trim(), pad: document.querySelector(".sp-t-pad").textContent.trim() }));
    pruefe(sp + ": Lauf – kein roher Schlüsselname, kein offenes {…}", !/tempo[A-Z]\w+|vorschauMarke|\{[a-z]+\}/.test(info.alles + info.aria + info.meld + info.pad), info.meld + " | " + info.aria);
    pruefe(sp + ": Szene hat einen Bildtext, Meldung und Fläche sind übersetzt", info.aria.length > 5 && info.meld.length > 3 && info.pad.length > 1 && (sp === "de" || (info.meld !== "Drauf auf die Autobahn! Jetzt so weit wie möglich!" && info.pad !== "TIPPEN!")), info.meld);
    await layoutPruefen(t, sp + " Tempo Lauf", 360);
    if (["ar", "am", "tr"].includes(sp)) { await t.waitForTimeout(500); await t.screenshot({ path: join(bilder, "tempo-sprache-" + sp + ".png"), fullPage: true }); }
    await botStoppen(t);
    pruefe(sp + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
    await t.context().close();
  }
}

/* =========================  Schilder-Memory (Spiel 3)  ========================= */
const zumMemory = async (s) => { await zumHub(s); await karteTippen(s, 'memory'); await s.waitForSelector(".sp-m-knopf"); };
const sekunden = (txt) => parseFloat(String(txt).replace(",", ".").replace(/[^\d.]/g, ""));
const memKarten = (s) => s.locator(".sp-m-karte").evaluateAll((els) => els.map((e) => ({ i: +e.dataset.i, paar: e.dataset.paar, art: e.dataset.art })));
const zeitLesen = async (s) => sekunden(await s.textContent(".sp-m-zeit"));
async function memTippen(s, i) { await s.tap('.sp-m-karte[data-i="' + i + '"]'); }
async function memPaar(s, ks, paar) {   // Schild und Text eines Paares aufdecken (echte Fingertipps)
  const a = ks.find((c) => c.paar === paar && c.art === "schild"), b = ks.find((c) => c.paar === paar && c.art === "text");
  await memTippen(s, a.i); await memTippen(s, b.i);
}

async function memoryPruefungen() {
  console.log("Verkehrszeichen: alle amtlichen Bilder laden und werden angezeigt");
  { const z = await neueSeite({ b: 360, h: 740 });
    await zumMemory(z);
    const r = await z.evaluate(async () => {
      const m = await import("./spiele/schilder.js");
      const fehl = [], gross = [];
      await Promise.all(m.SCHILD_DATEIEN.map((n) => new Promise((ok) => {
        const i = new Image(); i.onload = () => { if (i.naturalWidth < 50 || i.naturalHeight < 20) fehl.push(n + " winzig"); ok(); }; i.onerror = () => { fehl.push(n + " lädt nicht"); ok(); };
        i.src = new URL("../verkehr/vorfahrt-zeichen/" + n, new URL("./spiele/schilder.js", location.href)).href;
      })));
      return { anzahl: m.SCHILD_DATEIEN.length, fehl: fehl };
    });
    pruefe("alle " + r.anzahl + " Zeichen-Dateien laden als Bild (keine 404, keine kaputten Dateien)", r.anzahl >= 19 && r.fehl.length === 0, JSON.stringify(r));
    await z.tap(".sp-m-knopf"); await z.waitForSelector(".sp-m-feld:not(.aus)", { timeout: 9000 });
    await z.waitForTimeout(600);
    const karten = await z.evaluate(() => Array.from(document.querySelectorAll(".sp-m-schild img")).map((i) => ({ geladen: i.complete && i.naturalWidth > 0, alt: i.alt })));
    pruefe("Memory: die 6 Schild-Karten haben geladene Bilder (verdeckt, aber fertig geladen)", karten.length === 6 && karten.every((k) => k.geladen), JSON.stringify(karten));
    await z.context().close(); }
  console.log("Schilder-Memory: Layout in Ruhe");
  for (const g of [{ b: 360, h: 740, n: "360" }, { b: 412, h: 915, n: "412" }, { b: 320, h: 640, n: "320" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }, { b: 740, h: 360, n: "quer 740x360" }]) {
    const m = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
    await zumMemory(m);
    await m.waitForTimeout(800);
    await layoutPruefen(m, "Memory bereit " + g.n, g.b);
    pruefe("Memory " + g.n + ": 12 verdeckte Karten, Start-Knopf, Anleitung", (await m.locator(".sp-m-karte").count()) === 12 && (await padStart(m)) && (await m.isVisible(".sp-m-anleitung")) === (g.b <= g.h));
    await m.screenshot({ path: join(bilder, "memory-bereit-" + g.n.replace(/\W+/g, "_") + ".png") });
    pruefe("Memory " + g.n + ": keine Konsolenfehler", m.fehler.length === 0, m.fehler.join(" | "));
    await m.context().close();
  }

  console.log("Schilder-Memory: ein ganzes Spiel (360 x 740)");
  let m = await neueSeite({ b: 360, h: 740 });
  await zumMemory(m);
  pruefe("Startzustand: Start-Knopf, Zeit 0, Brett abgeblendet, Karten nicht antippbar", (await m.textContent(".sp-m-knopf")).trim() === "Start" && sekunden(await m.textContent(".sp-m-zeit")) === 0 && (await m.locator(".sp-m-feld.aus").count()) === 1);
  await m.tap(".sp-m-knopf");                                   // echter Fingertipp
  await m.waitForSelector(".sp-m-feld:not(.aus)", { timeout: 9000 });
  await m.waitForTimeout(500);
  const rcBrett = await m.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); return { hudO: g(".sp-m-hud").top, feldU: g(".sp-m-feld").bottom, h: window.innerHeight }; });
  pruefe("Memory 360 im Lauf: Anzeige und ganzes Brett im Bild, über der Menüleiste", rcBrett.hudO >= 0 && rcBrett.feldU <= rcBrett.h - 80, JSON.stringify(rcBrett));
  pruefe("im Lauf: Anleitung und Start-Knopf ausgeblendet", !(await m.isVisible(".sp-m-anleitung")) && !(await m.isVisible(".sp-m-knopf")));
  await layoutPruefen(m, "Memory Lauf 360", 360);
  const ks = await memKarten(m);
  pruefe("12 Karten: 6 Paare, je ein Schild und ein Text", ks.length === 12 && new Set(ks.map((c) => c.paar)).size === 6 && ks.every((c) => ks.filter((d) => d.paar === c.paar && d.art !== c.art).length === 1));
  // Fehlversuch mit zwei Karten verschiedener Paare
  const erste = ks[0], zweite = ks.find((c) => c.paar !== erste.paar);
  const t0 = Date.now();
  await memTippen(m, erste.i); await memTippen(m, zweite.i);
  pruefe("zwei falsche Karten: beide offen, Züge 1, Fehlversuche 1", (await m.locator(".sp-m-karte.offen").count()) === 2 && (await m.textContent(".sp-m-zuege")).trim() === "1" && (await m.textContent(".sp-m-fehler")).trim() === "1");
  await m.tap('.sp-m-karte:not(.offen)');                        // während der Sperre: dritte Karte darf nicht aufgehen
  pruefe("während der Sperre geht keine dritte Karte auf", (await m.locator(".sp-m-karte.offen").count()) === 2);
  await m.waitForFunction(() => document.querySelectorAll(".sp-m-karte.offen").length === 0, null, { timeout: 3000 });
  pruefe("falsche Karten drehen sich nach ca. 0,9 s zurück", Date.now() - t0 >= 850 && Date.now() - t0 < 2200, (Date.now() - t0) + " ms");
  // erstes Paar: Treffer, Erklärung, Uhr steht
  const paare = [...new Set(ks.map((c) => c.paar))];
  await memPaar(m, ks, paare[0]);
  await m.waitForSelector(".sp-m-popup:not([hidden])");
  const sc0 = SCHILDER.find((x) => x.id === paare[0]);
  pruefe("Erklärung: das Schild ist ein geladenes amtliches Bild und sichtbar groß (mind. 70 px)", await m.evaluate(() => { const i = document.querySelector(".sp-m-pop-schild img"); const r = i.getBoundingClientRect(); return i.complete && i.naturalWidth > 0 && r.width >= 70 && r.height >= 60; }));
  const pop = await m.evaluate(() => ({ kopf: document.querySelector(".sp-m-pop-kopf").textContent.trim(), nr: document.querySelector(".sp-m-pop-nr").textContent.trim(), name: document.querySelector(".sp-m-pop-name").textContent.trim(), text: document.querySelector(".sp-m-pop-text").textContent.trim(), bild: !!document.querySelector(".sp-m-pop-schild svg, .sp-m-pop-schild img"), weiter: document.querySelector(".sp-m-weiter").textContent.trim() }));
  pruefe("Erklärung nach dem Treffer: Treffer!, Zeichen-Nummer, Name, Erklärung nach StVO, Bild, Weiter", pop.kopf === "Treffer!" && pop.nr === "Zeichen " + sc0.nr && pop.name === TEXTE.de[paare[0] + "l"] && pop.text === TEXTE.de[paare[0] + "m"] && pop.bild && pop.weiter === "Weiter", JSON.stringify(pop));
  await layoutPruefen(m, "Memory Erklärung 360", 360);
  await m.screenshot({ path: join(bilder, "memory-erklaerung-360.png") });
  const z1 = await zeitLesen(m); await m.waitForTimeout(1300); const z2 = await zeitLesen(m);
  pruefe("beim Lesen der Erklärung steht die Uhr", z1 === z2, z1 + " vs " + z2);
  const bedeckt = await m.evaluate(() => { const k = document.querySelector(".sp-m-karte:not(.gefunden)").getBoundingClientRect(); const x = document.elementFromPoint(k.left + k.width / 2, k.top + k.height / 2); return !!x.closest(".sp-m-popup"); });
  pruefe("die Erklärung deckt das Brett ab (ein Fingertipp trifft keine Karte)", bedeckt);
  await m.evaluate(() => document.querySelector(".sp-m-karte:not(.gefunden)").click());   // auch ein Klick per Skript deckt nichts auf
  pruefe("während der Erklärung lässt sich keine Karte aufdecken", (await m.locator(".sp-m-karte.offen:not(.gefunden)").count()) === 0);
  pruefe("das gefundene Paar bleibt offen und ist grün markiert", (await m.locator(".sp-m-karte.gefunden").count()) === 2 && (await m.textContent(".sp-m-paare")).includes("1 von 6"), await m.textContent(".sp-m-paare"));
  await m.tap(".sp-m-weiter");
  pruefe("nach „Weiter“ ist die Erklärung weg", await m.locator(".sp-m-popup").isHidden());
  const vorWarten = await zeitLesen(m); await m.waitForTimeout(1500); const nachWarten = await zeitLesen(m);
  pruefe("nach der Erklärung läuft die Uhr sofort weiter (Nachdenken ist nicht gratis)", nachWarten - vorWarten >= 1.2, vorWarten + " -> " + nachWarten);
  // übrige fünf Paare
  for (let j = 1; j < 6; j++) {
    await memPaar(m, ks, paare[j]);
    await m.waitForSelector(".sp-m-popup:not([hidden])");
    if (j < 5) { pruefe("Erklärung für Paar " + (j + 1) + " zeigt den passenden Text", (await m.textContent(".sp-m-pop-text")).trim() === TEXTE.de[paare[j] + "m"]); await m.tap(".sp-m-weiter"); }
  }
  pruefe("letzte Erklärung: Knopf heißt „Geschafft!“", (await m.textContent(".sp-m-weiter")).trim() === "Geschafft!");
  const zEnde = await zeitLesen(m);
  await m.tap(".sp-m-weiter");
  await m.waitForSelector(".sp-erg", { timeout: 6000 });
  const erg = await m.evaluate(() => ({ gross: document.querySelector(".sp-gross").textContent.trim(), zahlen: Array.from(document.querySelectorAll(".sp-t-zahlen b")).map((b) => b.textContent.trim()), knopf: document.querySelector(".sp-m-knopf").textContent.trim(), sichtbar: !document.querySelector(".sp-m-knopf").hidden }));
  pruefe("Ergebnis: Zeit = Anzeige beim letzten Treffer, Züge 7 (6 + 1 Fehlversuch), Fehlversuche 1, Knopf „Nochmal“", sekunden(erg.gross) === zEnde && erg.zahlen[0] === "7" && erg.zahlen[1] === "1" && erg.knopf === "Nochmal" && erg.sichtbar, JSON.stringify(erg) + " / " + zEnde);
  await m.waitForSelector(".sp-badge.neu");
  const gespeichert = db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "memory");
  pruefe("Server hat die Zeit gespeichert (Millisekunden, passt zur Anzeige)", !!gespeichert && Math.abs(gespeichert.wert / 1000 - zEnde) < 0.06, JSON.stringify(gespeichert));
  pruefe("neue Bestzeit + Platz", (await m.textContent(".sp-speicher")).includes("Neue Bestzeit") && /Platz \d+ von \d+/.test(await m.textContent(".sp-speicher")), await m.textContent(".sp-speicher"));
  await m.waitForSelector(".sp-zeile.ich");
  const werte = (await m.locator(".sp-zeile .sp-wert").allTextContents()).map(sekunden);
  pruefe("Bestenliste: schnellste Zeit zuerst, Anzeige in Sekunden", werte.length >= 5 && werte.every((x, i) => i === 0 || x >= werte[i - 1]) && (await m.locator(".sp-zeile .sp-wert").first().textContent()).includes(" s"), werte.join(","));
  await layoutPruefen(m, "Memory Ergebnis 360", 360);
  await m.screenshot({ path: join(bilder, "memory-ergebnis-360.png"), fullPage: true });
  pruefe("Konsole ohne Fehler (Memory-Lauf)", m.fehler.length === 0, m.fehler.join(" | "));
  // Nochmal: neu gemischt, alles zurückgesetzt
  const alt = (await memKarten(m)).map((c) => c.paar + c.art).join();
  await m.tap(".sp-m-knopf");
  await m.waitForSelector(".sp-m-feld:not(.aus)", { timeout: 9000 });
  pruefe("Nochmal: neue Runde, Zähler auf 0, Ergebnis weg", (await m.textContent(".sp-m-zuege")).trim() === "0" && (await m.locator(".sp-erg:visible").count()) === 0 && sekunden(await m.textContent(".sp-m-zeit")) === 0);
  // App in den Hintergrund mitten im Spiel
  const ks2 = await memKarten(m);
  await memTippen(m, ks2[0].i);
  await m.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await m.waitForTimeout(300);
  pruefe("App im Hintergrund: Spiel abgebrochen, neu gemischt, zurück auf „Start“", (await m.locator(".sp-m-karte.offen").count()) === 0 && (await m.textContent(".sp-m-knopf")).trim() === "Start" && (await m.locator(".sp-m-feld.aus").count()) === 1);
  await m.evaluate(() => { delete document.hidden; });
  await m.tap(".sp-m-knopf"); await m.waitForSelector(".sp-m-feld:not(.aus)", { timeout: 9000 });
  await m.waitForTimeout(500);
  await m.tap("[data-nav-zurueck]");                                  // mitten im Spiel zurück
  await m.waitForSelector(".sp-karte");
  await m.waitForTimeout(3000);
  pruefe("nach dem Verlassen mitten im Spiel keine Fehler", m.fehler.length === 0, m.fehler.join(" | "));
  pruefe("Startseite zeigt die Bestzeit in Sekunden", /Deine Bestzeit: \d+(,\d)? s/.test(await m.textContent('[data-best="memory"]')), await m.textContent('[data-best="memory"]'));
  await m.context().close();

  console.log("Schilder-Memory: alle 18 Sprachen (360 x 740)");
  for (const sp of SPRACHEN) {
    const t = await neueSeite({ b: 360, h: 740, sprache: sp });
    await zumHub(t);
    await t.waitForSelector('.sp-karte[data-spiel="memory"]');
    const titel = (await t.textContent('.sp-karte[data-spiel="memory"] .sp-karte-titel')).trim();
    pruefe(sp + ": Memory-Karte übersetzt", titel === TEXTE[sp].memoryName, titel);
    await karteTippen(t, 'memory');
    await t.waitForSelector(".sp-m-knopf");
    pruefe(sp + ": Memory Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await t.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
    await layoutPruefen(t, sp + " Memory bereit", 360);
    // alle 14 Kartentexte dieser Sprache in einer Karte (so groß wie im Spiel): nichts abgeschnitten
    const zu = await t.evaluate(async (arg) => {
      const texte = (await import("./spiele/texte.js")).TEXTE;
      const erste = document.querySelector(".sp-m-feld .sp-m-karte"), br = erste.getBoundingClientRect();
      const probe = document.createElement("div");
      probe.style.cssText = "position:absolute;left:-9999px;top:0;width:" + br.width + "px;height:" + br.height + "px";
      probe.setAttribute("dir", document.querySelector("#spiele-platz").getAttribute("dir"));
      document.body.appendChild(probe);
      const zu = [];
      for (const id of arg.ids) {
        const k = document.createElement("div"); k.className = "sp-m-karte offen"; k.style.cssText = "width:100%;height:100%;position:relative;display:block";
        const f = document.createElement("span"); f.className = "sp-m-front sp-m-text"; f.setAttribute("dir", "auto"); f.textContent = texte[arg.sp][id + "l"];
        k.appendChild(f); probe.innerHTML = ""; probe.appendChild(k);
        if (f.scrollHeight > f.clientHeight + 1 || f.scrollWidth > f.clientWidth + 1) zu.push(id + " (" + f.scrollWidth + "x" + f.scrollHeight + " > " + f.clientWidth + "x" + f.clientHeight + ")");
      }
      probe.remove();
      return zu;
    }, { ids: SCHILDER.map((x) => x.id), sp: sp }).catch((e) => ["Fehler im Test: " + e.message]);
    pruefe(sp + ": alle 14 Schildnamen passen auf eine Karte (nichts abgeschnitten)", Array.isArray(zu) && zu.length === 0, JSON.stringify(zu).slice(0, 300));
    await t.tap(".sp-m-knopf");
    await t.waitForSelector(".sp-m-feld:not(.aus)", { timeout: 9000 });
    const k2 = await memKarten(t);
    await memPaar(t, k2, k2[0].paar);
    await t.waitForSelector(".sp-m-popup:not([hidden])");
    const pi = await t.evaluate(() => ({ alles: document.querySelector("#spiele-platz").textContent, text: document.querySelector(".sp-m-pop-text").textContent.trim(), name: document.querySelector(".sp-m-pop-name").textContent.trim(), nr: document.querySelector(".sp-m-pop-nr").textContent.trim(), weiter: document.querySelector(".sp-m-weiter").textContent.trim(), kopf: document.querySelector(".sp-m-pop-kopf").textContent.trim() }));
    pruefe(sp + ": Erklärung in der Sprache, kein roher Schlüssel", pi.text === TEXTE[sp][k2[0].paar + "m"] && pi.name === TEXTE[sp][k2[0].paar + "l"] && pi.kopf === TEXTE[sp].memoryTreffer && pi.weiter === TEXTE[sp].memoryWeiter && !/memory[A-Z]|z\d+[lm]\b|\{n\}/.test(pi.alles), JSON.stringify(pi).slice(0, 200));
    await layoutPruefen(t, sp + " Memory Erklärung", 360);
    if (["ar", "am", "tr"].includes(sp)) { await t.waitForTimeout(400); await t.screenshot({ path: join(bilder, "memory-sprache-" + sp + ".png"), fullPage: true }); }
    pruefe(sp + ": Memory keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
    await t.context().close();
  }
}
const padStart = async (s) => (await s.textContent(".sp-m-knopf")).trim() === "Start";

/* =========================  Rechts vor Links (Spiel 4)  ========================= */
const zumVorfahrt = async (s) => { await zumHub(s); await karteTippen(s, 'vorfahrt'); await s.waitForSelector(".sp-v-knopf"); };
const vorAutos = (s) => s.locator(".sp-v-auto").evaluateAll((els) => els.map((e) => ({ arm: +e.dataset.arm, richtung: e.dataset.richtung })));
const GRUND_TEXT = { frei: "vorGFrei", rechts: "vorGRechts", gegen: "vorGGegen" };
async function vorTippen(s, arm) { await s.tap('.sp-v-auto[data-arm="' + arm + '"] .sp-v-treffer'); }

async function vorfahrtPruefungen() {
  console.log("Rechts vor Links: Layout in Ruhe");
  for (const g of [{ b: 360, h: 740, n: "360" }, { b: 412, h: 915, n: "412" }, { b: 320, h: 640, n: "320" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }, { b: 740, h: 360, n: "quer 740x360" }]) {
    const v = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
    await zumVorfahrt(v);
    await v.waitForTimeout(800);
    await layoutPruefen(v, "Vorfahrt bereit " + g.n, g.b);
    pruefe("Vorfahrt " + g.n + ": Kreuzung ohne Autos, Start-Knopf", (await v.locator(".sp-v-svg").count()) === 1 && (await v.locator(".sp-v-auto").count()) === 0 && (await v.textContent(".sp-v-knopf")).trim() === "Start");
    await v.screenshot({ path: join(bilder, "vorfahrt-bereit-" + g.n.replace(/\W+/g, "_") + ".png") });
    pruefe("Vorfahrt " + g.n + ": keine Konsolenfehler", v.fehler.length === 0, v.fehler.join(" | "));
    await v.context().close();
  }

  console.log("Rechts vor Links: ein ganzes Spiel in echter Zeit (360 x 740, ca. 30 s)");
  let v = await neueSeite({ b: 360, h: 740 });
  await zumVorfahrt(v);
  await v.tap(".sp-v-knopf");
  await v.waitForSelector(".sp-v-auto", { timeout: 9000 });
  let erwartetPunkteMin = 0, erwartetRichtig = 0, protokoll = [];
  for (let runde = 0; runde < 10; runde++) {
    const autos = await vorAutos(v);
    const frei = V.freieAutos(autos);
    pruefe("Aufgabe " + (runde + 1) + ": " + autos.length + " Autos, genau ein Auto darf zuerst", frei.length === 1 && autos.length === [2, 2, 2, 3, 3, 3, 3, 4, 4, 4][runde], JSON.stringify(autos));
    pruefe("Aufgabe " + (runde + 1) + ": Anzeige „Aufgabe " + (runde + 1) + " von 10“ und Frage", (await v.textContent(".sp-v-aufgabe")).trim() === "Aufgabe " + (runde + 1) + " von 10" && (await v.textContent(".sp-v-frage")).includes("Welches Auto darf zuerst fahren?"));
    if (runde === 0) {
      await v.waitForTimeout(500);
      const rc = await v.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); return { hudO: g(".sp-v-hud").top, szeneU: g(".sp-v-szene").bottom, szeneB: g(".sp-v-szene").width, h: window.innerHeight }; });
      pruefe("360: Anzeige, Frage und ganze Kreuzung im Bild, über der Menüleiste", rc.hudO >= 0 && rc.szeneU <= rc.h - 80 && rc.szeneB >= 240, JSON.stringify(rc));
      const aria = await v.locator(".sp-v-auto").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
      pruefe("jedes Auto hat eine Beschreibung (Seite und Richtung)", aria.every((a) => /^Auto von (unten|links|oben|rechts), (fährt geradeaus|biegt rechts ab|biegt links ab)$/.test(a)), aria.join(" | "));
      pruefe("Blinker nur bei Autos, die abbiegen", (await v.locator(".sp-v-blink").count()) === autos.filter((c) => c.richtung !== "gerade").length);
      await layoutPruefen(v, "Vorfahrt Aufgabe 1 (360)", 360);
      await v.screenshot({ path: join(bilder, "vorfahrt-aufgabe-360.png") });
    }
    const falsch = autos.find((c) => c.arm !== frei[0].arm);
    const wrongRound = runde === 1, timeoutRound = runde === 2;
    if (timeoutRound) {
      await v.waitForSelector(".sp-v-antwort:not([hidden])", { timeout: 17500 });
      pruefe("Aufgabe 3: ohne Antwort nach 15 s „Die Zeit ist abgelaufen.“", (await v.textContent(".sp-v-urteil")).trim() === "Die Zeit ist abgelaufen." && (await v.locator(".sp-v-auto.richtig").count()) === 1);
    } else {
      await vorTippen(v, wrongRound ? falsch.arm : frei[0].arm);
      await v.waitForSelector(".sp-v-antwort:not([hidden])");
      const info = await v.evaluate(() => ({ urteil: document.querySelector(".sp-v-urteil").textContent.trim(), cls: document.querySelector(".sp-v-urteil").className, regeln: Array.from(document.querySelectorAll(".sp-v-regel")).map((r) => r.textContent.trim()), punkte: +document.querySelector(".sp-v-punkte b").textContent, richtig: document.querySelectorAll(".sp-v-auto.richtig").length, falsch: document.querySelectorAll(".sp-v-auto.falsch").length, blass: document.querySelectorAll(".sp-v-auto.blass").length }));
      const reasonKey = GRUND_TEXT[V.grundFuerSieger(autos, frei[0])];
      pruefe("Aufgabe " + (runde + 1) + ": richtiges Auto grün markiert, die Regel dazu steht da", info.richtig === 1 && info.regeln[0] === TEXTE.de[reasonKey], JSON.stringify(info.regeln));
      if (wrongRound) {
        const w = V.grundWarten(autos, falsch);
        pruefe("Aufgabe 2 (falsch getippt): „Leider falsch.“, gewähltes Auto rot, Erklärung warum es warten muss", info.urteil === "Leider falsch." && info.cls.includes("nein") && info.falsch === 1 && info.regeln[1] === TEXTE.de[w === "rechts" ? "vorWRechts" : "vorWGegen"] && info.punkte === erwartetPunkteMin, JSON.stringify(info));
        await v.screenshot({ path: join(bilder, "vorfahrt-falsch-360.png"), fullPage: true });
      } else {
        const m = /^Richtig! \+(\d+)$/.exec(info.urteil);
        pruefe("Aufgabe " + (runde + 1) + ": „Richtig! +Punkte“ mit 100–150 Punkten, Anzeige zählt hoch", !!m && +m[1] >= 100 && +m[1] <= 150 && info.punkte === erwartetPunkteMin + +m[1], info.urteil + " / " + info.punkte);
        erwartetPunkteMin += +m[1]; erwartetRichtig++;
        if (+m[1] < 140) protokoll.push("langsam " + m[1]);
      }
    }
    if (runde === 0) {
      const rc2 = await v.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); return { weiter: g(".sp-v-weiter").bottom, h: window.innerHeight }; });
      pruefe("360: „Weiter“-Knopf ist nach der Antwort erreichbar (im Bild oder durch kurzes Wischen)", rc2.weiter > 0, JSON.stringify(rc2));
      await layoutPruefen(v, "Vorfahrt Antwort (360)", 360);
      await v.screenshot({ path: join(bilder, "vorfahrt-richtig-360.png"), fullPage: true });
    }
    await v.tap(".sp-v-weiter");
    if (runde < 9) await v.waitForFunction((n) => /Aufgabe/.test(document.querySelector(".sp-v-aufgabe")?.textContent || "") && document.querySelector(".sp-v-aufgabe").textContent.includes("Aufgabe " + n + " "), runde + 2, { timeout: 5000 });
  }
  await v.waitForSelector(".sp-erg", { timeout: 6000 });
  const ge = await v.evaluate(() => ({ gross: +document.querySelector(".sp-gross").textContent, richtig: document.querySelector(".sp-v-richtigzahl").textContent.trim(), hinweis: document.querySelector(".sp-hinweis-strasse").textContent.trim(), knopf: document.querySelector(".sp-v-knopf").textContent.trim() }));
  pruefe("Ergebnis: Punkte = Summe der Runden, „8 von 10 richtig“, Hinweis, Knopf „Nochmal“", ge.gross === erwartetPunkteMin && ge.richtig === "8 von 10 richtig" && ge.hinweis.startsWith("Im echten Leben fährt ohne Schilder und Ampel zuerst, wer von rechts kommt") && ge.knopf === "Nochmal", JSON.stringify(ge) + " / " + erwartetPunkteMin);
  await v.waitForSelector(".sp-badge.neu");
  const gesp = db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "vorfahrt");
  pruefe("Server hat die Punkte gespeichert (8 richtig: 800–1200 Punkte)", !!gesp && gesp.wert === erwartetPunkteMin && gesp.wert >= 800 && gesp.wert <= 1200, JSON.stringify(gesp));
  pruefe("Rekord-Marke + Platz", (await v.textContent(".sp-speicher")).includes("Neue Bestpunktzahl") && /Platz \d+ von \d+/.test(await v.textContent(".sp-speicher")), await v.textContent(".sp-speicher"));
  await v.waitForSelector(".sp-zeile.ich");
  const pw = (await v.locator(".sp-zeile .sp-wert").allTextContents()).map((x) => parseInt(x, 10));
  pruefe("Bestenliste: meiste Punkte zuerst, Einheit „Punkte“", pw.length >= 5 && pw.every((x, i) => i === 0 || x <= pw[i - 1]) && (await v.locator(".sp-zeile .sp-wert").first().textContent()).includes("Punkte"), pw.join(","));
  await layoutPruefen(v, "Vorfahrt Ergebnis 360", 360);
  await v.screenshot({ path: join(bilder, "vorfahrt-ergebnis-360.png"), fullPage: true });
  pruefe("Konsole ohne Fehler (Vorfahrt-Lauf)", v.fehler.length === 0, v.fehler.join(" | "));
  // Hintergrund / Verlassen
  await v.tap(".sp-v-knopf"); await v.waitForSelector(".sp-v-auto", { timeout: 9000 });
  await v.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await v.waitForTimeout(300);
  pruefe("App im Hintergrund: Spiel abgebrochen, leere Kreuzung, „Start“", (await v.locator(".sp-v-auto").count()) === 0 && (await v.textContent(".sp-v-knopf")).trim() === "Start");
  await v.evaluate(() => { delete document.hidden; });
  await v.tap(".sp-v-knopf"); await v.waitForSelector(".sp-v-auto", { timeout: 9000 });
  await v.tap("[data-nav-zurueck]");
  await v.waitForSelector(".sp-karte");
  await v.waitForTimeout(3500);
  pruefe("nach dem Verlassen mitten im Spiel keine Fehler / späten Zeitgeber", v.fehler.length === 0, v.fehler.join(" | "));
  pruefe("Startseite zeigt die Bestpunktzahl", (await v.textContent('[data-best="vorfahrt"]')).includes("Deine Bestpunktzahl: " + erwartetPunkteMin + " Punkte"), await v.textContent('[data-best="vorfahrt"]'));
  await v.context().close();

  console.log("Rechts vor Links: Querformat 740 x 360 (Aufgabe)");
  v = await neueSeite({ b: 740, h: 360 });
  await zumVorfahrt(v);
  await v.waitForTimeout(700);
  await v.tap(".sp-v-knopf");
  await v.waitForSelector(".sp-v-auto", { timeout: 9000 });
  await v.waitForTimeout(700);
  await layoutPruefen(v, "Vorfahrt Querformat", 740);
  const rq = await v.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); return { hudO: g(".sp-v-hud").top, szeneO: g(".sp-v-szene").top, szeneU: g(".sp-v-szene").bottom, szeneB: g(".sp-v-szene").width, frageU: g(".sp-v-frage").bottom, h: window.innerHeight }; });
  pruefe("Querformat: Kreuzung (mind. 190 px) und Frage ohne eigenes Scrollen im Bild, über der Menüleiste", rq.hudO >= 0 && rq.szeneO >= 0 && rq.szeneU <= rq.h - 70 && rq.szeneB >= 190, JSON.stringify(rq));
  const aq = await vorAutos(v);
  await vorTippen(v, V.freieAutos(aq)[0].arm);
  await v.waitForSelector(".sp-v-antwort:not([hidden])");
  await layoutPruefen(v, "Vorfahrt Querformat Antwort", 740);
  await v.screenshot({ path: join(bilder, "vorfahrt-quer-antwort.png") });
  await v.context().close();

  console.log("Rechts vor Links: alle 18 Sprachen (360 x 740)");
  for (const sp of SPRACHEN) {
    const t = await neueSeite({ b: 360, h: 740, sprache: sp });
    await zumHub(t);
    await t.waitForSelector('.sp-karte[data-spiel="vorfahrt"]');
    pruefe(sp + ": Vorfahrt-Karte übersetzt", (await t.textContent('.sp-karte[data-spiel="vorfahrt"] .sp-karte-titel')).trim() === TEXTE[sp].vorName);
    await karteTippen(t, 'vorfahrt');
    await t.waitForSelector(".sp-v-knopf");
    pruefe(sp + ": Vorfahrt Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await t.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
    await layoutPruefen(t, sp + " Vorfahrt bereit", 360);
    await t.tap(".sp-v-knopf");
    await t.waitForSelector(".sp-v-auto", { timeout: 9000 });
    const autos = await vorAutos(t), frei = V.freieAutos(autos)[0], falsch = autos.find((c) => c.arm !== frei.arm);
    await vorTippen(t, falsch.arm);
    await t.waitForSelector(".sp-v-antwort:not([hidden])");
    const info = await t.evaluate(() => ({ alles: document.querySelector("#spiele-platz").textContent, aria: Array.from(document.querySelectorAll(".sp-v-auto")).map((e) => e.getAttribute("aria-label")), urteil: document.querySelector(".sp-v-urteil").textContent.trim(), regeln: Array.from(document.querySelectorAll(".sp-v-regel")).map((r) => r.textContent.trim()), weiter: document.querySelector(".sp-v-weiter").textContent.trim(), frage: document.querySelector(".sp-v-frage").textContent.trim(), aufgabe: document.querySelector(".sp-v-aufgabe").textContent.trim() }));
    const w = V.grundWarten(autos, falsch);
    const erwartet = [TEXTE[sp][GRUND_TEXT[V.grundFuerSieger(autos, frei)]], w ? TEXTE[sp][w === "rechts" ? "vorWRechts" : "vorWGegen"] : null].filter(Boolean);
    pruefe(sp + ": Urteil, Frage, Regel und Warte-Grund in der Sprache", info.urteil === TEXTE[sp].vorFalsch && info.frage === TEXTE[sp].vorFrage && info.aufgabe === TEXTE[sp].vorAufgabe.replace("{n}", "1").replace("{m}", "10") && JSON.stringify(info.regeln) === JSON.stringify(erwartet) && info.weiter === TEXTE[sp].vorWeiter, JSON.stringify(info).slice(0, 260));
    pruefe(sp + ": Autobeschreibungen vollständig, kein roher Schlüssel", info.aria.every((a) => a && !/\{|vor[A-Z]/.test(a)) && !/vor[A-Z]\w+|\{[nm]\}/.test(info.alles), info.aria.join(" | "));
    await layoutPruefen(t, sp + " Vorfahrt Antwort", 360);
    if (["ar", "am", "tr"].includes(sp)) { await t.waitForTimeout(400); await t.screenshot({ path: join(bilder, "vorfahrt-sprache-" + sp + ".png"), fullPage: true }); }
    pruefe(sp + ": Vorfahrt keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
    await t.context().close();
  }
}

try {
  const nurListe = (process.env.NUR || (process.env.NUR_TEMPO ? "tempo" : "")).split(",").filter(Boolean);
  const dran = (name) => !nurListe.length || nurListe.includes(name);
  if (dran("bisherige")) await bisherige();
  if (dran("tempo")) await tempoPruefungen();
  if (dran("memory")) await memoryPruefungen();
  if (dran("vorfahrt")) await vorfahrtPruefungen();
} finally {
  await browser.close();
  server.close();
}
console.log("\n" + bestanden + " Prüfungen bestanden" + (befunde.length ? ", " + befunde.length + " FEHLER:\n - " + befunde.join("\n - ") : ""));
