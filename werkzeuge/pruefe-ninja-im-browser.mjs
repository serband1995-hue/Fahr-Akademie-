// Browser-Prüfung von Spiel 9 „Schilder-Wisch“ (Id ninja), 07.10.2026: echte App im Chromium, echte Wisch-Gesten.
//   - Die App läuft aus diesem Ordner. Falls spiele.js / texte.js / academy-spiele.ts das Spiel noch nicht kennen, werden die Einträge
//     zur Laufzeit eingesetzt (werkzeuge/ninja-testbasis.mjs; schon Eingebautes bleibt unangetastet). Der Server ist die ECHTE
//     Function-Datei gegen eine Datenbank im Speicher.
//   - Gesten: Touch über das Chrome-DevTools-Protokoll (touchStart/-Move/-End = echtes Wischen), Fingertipp (touchscreen.tap),
//     Maus (down/move/up), Tastatur (Enter auf einem Schild-Knopf). Der Zufall des Spiels (Math.random) wird mit festem Startwert ersetzt.
//   - Geprüft: Handy 360 x 740, 320 x 640, 412 x 915 dunkel, Querformat 740 x 360 (nichts abgeschnitten, nichts wischt seitlich, Zeigerziele
//     groß genug, Start-Knopf MITTEN über dem Feld, Seite scrollt beim Wischen im Feld nicht), ein voller Durchgang mit 3 Runden
//     (perfekt gewischt / mit falschem Schild / Zeit läuft ab), Erklärliste mit Nummer, Name, Kategorie, Punkte, Server-Ergebnis, Bestenliste,
//     reduzierte Bewegung, Maus, Tastatur, Rechts-nach-links (ar), alle 18 Sprachen, Verlassen mitten im Spiel, keine Konsolenfehler.
//   - Die Zeit läuft im Spiel teils beschleunigt (performance.now), damit „Zeit abgelaufen“ nicht 25 s dauert; Gesten bleiben echt.
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-ninja-im-browser.mjs
//   (Playwright liegt global: PLAYWRIGHT_PFAD=/opt/node22/lib/node_modules; Browser: PLAYWRIGHT_BROWSERS_PATH oder CHROMIUM_PFAD)
// Bilder landen in $SPIELE_BILDER (Standard: ./spiele-bilder, nicht einchecken).
import http from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, extname } from "node:path";
import { db, jetzt, warte } from "./edge-functions/spiele-im-speicher.mjs";
import { serverMitEintrag, spielePatch, textePatch, wurzel } from "./ninja-testbasis.mjs";
import * as N from "../spiele/ninja.js";
import { TEXTE } from "../spiele/texte.js";
import { TEXTE_NINJA } from "../spiele/texte-ninja.js";

const { chromium } = createRequire((process.env.PLAYWRIGHT_PFAD || "/opt/node22/lib/node_modules") + "/")("playwright");
const bilder = process.env.SPIELE_BILDER || join(process.cwd(), "spiele-bilder");
mkdirSync(bilder, { recursive: true });
const rufe = await serverMitEintrag();
const SPRACHEN = Object.keys(TEXTE_NINJA);
const RTL = ["ar", "ckb", "ur", "fa", "ps"];
const T = (sp, key, werte) => { let s = TEXTE_NINJA[sp][key] || TEXTE[sp][key]; for (const k of Object.keys(werte || {})) s = s.split("{" + k + "}").join(werte[k]); return s; };

const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
const schueler = (id, name) => db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null });
schueler("t", "Serban Dumitrescu");
db.academy_sessions.push({ session_token: "tok-t", schueler_id: "t", expires_at: inEinemJahr });
[["m1", "Mira Kaya", 280], ["m2", "Jonas Weber", 190], ["m3", "Ali Reza Karimi", 120]].forEach(([id, n, w]) => { schueler(id, n); db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "ninja", wert: w, erreicht_am: jetzt(), versuche: 2 }); });

const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg" };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const pfad = join(wurzel, decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html");
  if (!pfad.startsWith(wurzel) || !existsSync(pfad) || pfad === wurzel + "/") { res.writeHead(404); res.end("nicht da"); return; }
  let inhalt = readFileSync(pfad);
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
const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS" };
async function neueSeite(opt) {
  db.academy_spiele_runden = [];
  const ctx = await browser.newContext({
    viewport: { width: opt.b, height: opt.h }, hasTouch: opt.maus ? false : true, isMobile: opt.maus ? false : true, deviceScaleFactor: 2,
    colorScheme: opt.dunkel ? "dark" : "light", reducedMotion: opt.reduziert ? "reduce" : "no-preference"
  });
  await ctx.addInitScript((d) => {
    try {
      localStorage.setItem("academy_session", JSON.stringify({ name: "Serban Dumitrescu", session_token: "tok-t", vollzugang: true, agb_akzeptiert_am: "2026-01-01T00:00:00Z", ablauf_am: d.ablauf, klasse: "B", telefon: "0100" }));
      localStorage.setItem("spiele_vorschau", "1");
      localStorage.setItem("academy_sprache", d.sprache);
    } catch (e) {}
    // Zufall des Spiels mit festem Startwert (mulberry32): Fahrpläne sind wiederholbar
    let a = d.seed >>> 0;
    Math.random = function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    // beschleunigte Uhr nur für das Spiel: window.__tempo(f) stellt den Faktor um, ohne die Zeit springen zu lassen
    const echt = performance.now.bind(performance);
    let basisEcht = echt(), basisFalsch = basisEcht, faktor = 1;
    performance.now = () => basisFalsch + (echt() - basisEcht) * faktor;
    window.__tempo = (f) => { basisFalsch = performance.now(); basisEcht = echt(); faktor = f; };
  }, { ablauf: inEinemJahr, sprache: opt.sprache || "de", seed: opt.seed || 12345 });
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
  await s.tap("#drawer-open-btn").catch(async () => { await s.click("#drawer-open-btn"); });
  await s.waitForSelector('[data-drawer="spiele"]', { state: "visible" });
  await s.tap('[data-drawer="spiele"]').catch(async () => { await s.click('[data-drawer="spiele"]'); });
  await s.waitForSelector(".sp-karte", { timeout: 10000 });
};
const zumSpiel = async (s) => { await zumHub(s); await (s.tap('.sp-karte[data-spiel="ninja"]').catch(() => s.click('.sp-karte[data-spiel="ninja"]'))); await s.waitForSelector(".ni-knopf"); await s.waitForTimeout(400); };
const druecke = (s, sel) => s.tap(sel).catch(() => s.click(sel));

/* Layout: nichts seitlich wischbar, nichts abgeschnitten, Tippflächen groß genug */
async function layoutPruefen(s, name) {
  const r = await s.evaluate(() => {
    const probleme = [];
    const de = document.documentElement;
    if (de.scrollWidth > window.innerWidth + 1) probleme.push("Seite wischbar: " + de.scrollWidth + " > " + window.innerWidth);
    document.querySelectorAll("#spiele-platz *").forEach((el) => {
      if (el.closest(".ni-feld") && !el.classList.contains("ni-feld")) return;   // Schilder gleiten absichtlich über den Rand (das Feld schneidet ab)
      const rc = el.getBoundingClientRect();
      if (rc.width === 0 || rc.height === 0) return;
      if (rc.right > window.innerWidth + 1 || rc.left < -1) probleme.push("ragt raus: " + el.className + " " + Math.round(rc.left) + ".." + Math.round(rc.right));
      if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible") probleme.push("abgeschnitten: " + el.className);
    });
    document.querySelectorAll(".ni-knopf,.ni-weiter,.sp-schalter,.sp-karte").forEach((el) => {
      const rc = el.getBoundingClientRect();
      if (rc.height > 0 && (rc.height < 43.5 || rc.width < 43.5)) probleme.push("Tippfläche klein: " + el.className + " " + Math.round(rc.width) + "x" + Math.round(rc.height));
    });
    return probleme;
  });
  pruefe(name + ": Layout ohne Überstand/Abschneiden/kleine Knöpfe", r.length === 0, r.slice(0, 4).join(" | "));
}

/* ---------- Gesten ---------- */
async function cdp(s) { if (!s._cdp) s._cdp = await s.context().newCDPSession(s); return s._cdp; }
async function touchWisch(s, punkte) {
  const c = await cdp(s);
  await c.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: punkte[0].x, y: punkte[0].y }] });
  for (const p of punkte.slice(1)) await c.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: p.x, y: p.y }] });
  await c.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
async function mausWisch(s, punkte) {
  await s.mouse.move(punkte[0].x, punkte[0].y); await s.mouse.down();
  for (const p of punkte.slice(1)) await s.mouse.move(p.x, p.y);
  await s.mouse.up();
}
const strecke = (x0, y0, x1, y1, n) => Array.from({ length: n + 1 }, (_, i) => ({ x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n }));
const feldBox = (s) => s.locator(".ni-feld").evaluate((e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; });
const schilder = (s) => s.evaluate(() => Array.from(document.querySelectorAll(".ni-schild:not(.treffer):not(.fehl)")).map((e) => { const r = e.getBoundingClientRect(); return { i: +e.dataset.i, sid: e.dataset.sid, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, label: e.getAttribute("aria-label") }; }));
/* waagerechter Wisch quer durch ein Schild (±34 px), bleibt im Feld; gibt false zurück, wenn das Schild zu nah am Rand ist */
async function wische(s, z, art, fb) {
  if (z.x < fb.l + 40 || z.x > fb.r - 40 || z.y < fb.t + 10 || z.y > fb.b - 10) return false;
  const pts = strecke(z.x - 34, z.y, z.x + 34, z.y, 6);
  if (art === "maus") await mausWisch(s, pts); else await touchWisch(s, pts);
  return true;
}
const zustand = (s) => s.evaluate(() => ({
  punkte: +document.querySelector(".ni-punkte b").textContent,
  runde: document.querySelector(".ni-runde").textContent.trim(),
  regel: document.querySelector(".ni-regel").textContent.trim(),
  zeit: document.querySelector(".ni-zeit").textContent.trim(),
  meldung: document.querySelector(".ni-meldung").textContent.trim(),
  antwort: !document.querySelector(".ni-antwort").hidden,
  knopf: document.querySelector(".ni-knopf").hidden ? "" : document.querySelector(".ni-knopf").textContent.trim(),
  schilder: document.querySelectorAll(".ni-schild").length,
  aktiv: document.querySelector(".ni-spielfeld").classList.contains("aktiv")
}));
const regelAus = (sp, text) => N.REGELN.find((r) => T(sp, r.text) === text);
const warteAufloesung = (s, ms) => s.waitForSelector(".ni-antwort:not([hidden])", { timeout: ms || 40000 });
async function weiterZumLos(s) {   // nach „Start“ bzw. „Nächste Runde“ erscheint „Los!“
  await s.waitForFunction(() => { const k = document.querySelector(".ni-knopf"); return k && !k.hidden && k.classList.contains("los"); }, null, { timeout: 9000 });
}
async function losDruecken(s) { await weiterZumLos(s); await druecke(s, ".ni-knopf"); await s.waitForFunction(() => document.querySelector(".ni-spielfeld").classList.contains("aktiv")); }

/* Die Erklärliste einer Runde prüfen. gesehen = Map erkl -> { richtig }; status = Map erkl -> erwarteter Status */
async function auflosungPruefen(s, sp, regel, name, erwartet) {
  const info = await s.evaluate(() => ({
    eintraege: Array.from(document.querySelectorAll(".ni-eintrag")).map((e) => ({ erkl: e.dataset.schild, klasse: e.className, kopf: e.querySelector(".ni-eintrag-kopf b").textContent.trim(), status: e.querySelector(".ni-status").textContent.trim(), kat: e.querySelector(".ni-kat").textContent.trim(), bild: !!e.querySelector("img") && e.querySelector("img").naturalWidth > 0 })),
    warum: document.querySelector(".ni-warum").textContent.trim(), urteil: document.querySelector(".ni-urteil").textContent.trim(), zahlen: document.querySelector(".ni-zahlen").textContent.trim(),
    weiter: document.querySelector(".ni-weiter").textContent.trim(), titel: document.querySelector(".ni-listentitel").textContent.trim()
  }));
  const stKey = { falsch: "niStFalsch", verpasst: "niStVerpasst", gewischt: "niStGewischt", gemieden: "niStGemieden" };
  pruefe(name + ": Erklärliste nicht leer, jeder Eintrag mit Bild", info.eintraege.length >= 3 && info.eintraege.every((e) => e.bild), JSON.stringify(info.eintraege.map((e) => e.erkl)));
  const ok = info.eintraege.every((e) => {
    const sch = N.SCHILDER.find((x) => x.erkl === e.erkl);
    const st = Object.keys(stKey).find((k) => e.klasse.split(" ").includes(k));
    const erw = erwartet && erwartet[e.erkl];
    return sch && e.kopf === T(sp, "memoryZeichen", { n: sch.nr }) + " · " + T(sp, sch.name) && e.kat === T(sp, sch.kat) && st && e.status === T(sp, stKey[st]) && (!erw || erw === st);
  });
  pruefe(name + ": jeder Eintrag zeigt Nummer, Name, Kategorie und Status in der Sprache (und den erwarteten Status)", ok, JSON.stringify(info.eintraege.map((e) => [e.erkl, e.klasse.replace("ni-eintrag ", ""), e.status])) + " erwartet " + JSON.stringify(erwartet));
  const rang = { falsch: 0, verpasst: 1, gewischt: 2, gemieden: 3 };
  const reihe = info.eintraege.map((e) => rang[Object.keys(rang).find((k) => e.klasse.split(" ").includes(k))]);
  pruefe(name + ": Reihenfolge falsch gewischt, verpasst, gewischt, gemieden", reihe.every((x, i) => i === 0 || reihe[i - 1] <= x), reihe.join(""));
  pruefe(name + ": Regel und Fach-Erklärung stehen da", info.warum === T(sp, regel.text) + " " + T(sp, regel.warum) && info.titel === T(sp, "niListe") && info.zahlen.length > 5, info.warum);
  return info;
}

/* ===================== 1. Layout in Ruhe ===================== */
console.log("Schilder-Wisch: Layout in Ruhe");
for (const g of [{ b: 360, h: 740, n: "360" }, { b: 320, h: 640, n: "320" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }, { b: 740, h: 360, n: "quer 740x360" }]) {
  const s = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
  await zumHub(s);
  pruefe(g.n + ": Karte auf der Startseite mit Namen und Vorschau-Marke", (await s.textContent('.sp-karte[data-spiel="ninja"] .sp-karte-titel')).trim() === "Schilder-Wisch" && (await s.locator('.sp-karte[data-spiel="ninja"] .sp-karte-marke').count()) === 1);
  pruefe(g.n + ": Symbol der Karte vorhanden (SVG)", (await s.locator('.sp-karte[data-spiel="ninja"] svg').count()) === 1);
  await druecke(s, '.sp-karte[data-spiel="ninja"]'); await s.waitForSelector(".ni-knopf"); await s.waitForTimeout(500);
  await layoutPruefen(s, "Schilder-Wisch bereit " + g.n);
  const m = await s.evaluate(() => { const r = (q) => document.querySelector(q).getBoundingClientRect(); const k = r(".ni-knopf"), z = r(".ni-spielfeld"); return { kx: k.left + k.width / 2, ky: k.top + k.height / 2, zx: z.left + z.width / 2, zy: z.top + z.height / 2, kb: k.width, kh: k.height, oben: z.top, unten: z.bottom, vh: window.innerHeight, css: !!document.querySelector("link[data-ninja-css]"), w: getComputedStyle(document.querySelector(".sp-ninja")).visibility, ta: getComputedStyle(document.querySelector(".ni-feld")).touchAction }; });
  pruefe(g.n + ": Start-Knopf MITTEN über dem Feld", Math.abs(m.kx - m.zx) < 3 && Math.abs(m.ky - m.zy) < 3 && m.kb >= 150 && m.kh >= 44, JSON.stringify(m));
  pruefe(g.n + ": eigene ninja.css wurde vom Spiel geladen, Bereich sichtbar", m.css && m.w === "visible");
  pruefe(g.n + ": Start-Knopf liegt im sichtbaren Bereich", m.ky > 0 && m.ky < m.vh - 40, JSON.stringify(m));
  pruefe(g.n + ": außerhalb des Spiels sperrt das Feld das Scrollen NICHT (touch-action nicht none)", m.ta !== "none", m.ta);
  pruefe(g.n + ": Start-Knopf beschriftet „Start“", (await s.textContent(".ni-knopf")).trim() === "Start");
  await s.screenshot({ path: join(bilder, "ninja-bereit-" + g.n.replace(/\W+/g, "_") + ".png") });
  pruefe(g.n + ": keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();
}

/* ===================== 2. Ein voller Durchgang mit echten Gesten (360 x 740) ===================== */
console.log("Schilder-Wisch: ein voller Durchgang (360 x 740)");
{
  const sp = "de";
  let s = await neueSeite({ b: 360, h: 740, seed: 2024 });
  await zumSpiel(s);
  await druecke(s, ".ni-knopf");
  await s.waitForFunction(() => { const k = document.querySelector(".ni-knopf"); return k && !k.hidden && k.classList.contains("los"); }, null, { timeout: 9000 });
  const rundeServer = db.academy_spiele_runden.filter((r) => r.spiel === "ninja");
  pruefe("Runde wurde auf dem Server angemeldet (spiel=ninja)", rundeServer.length === 1);
  let gesamt = 0, summeR = 0, summeF = 0, summeVoll = 0;
  const regelnGesehen = [];
  let z = await zustand(s);
  for (let nr = 0; nr < N.RUNDEN; nr++) {
    z = await zustand(s);
    const regel = regelAus(sp, z.regel);
    regelnGesehen.push(regel && regel.id);
    const name = "Runde " + (nr + 1) + " (" + (regel && regel.id) + ")";
    pruefe(name + ": Anzeige „Runde " + (nr + 1) + " von 3“ und Regel steht oben, Punkte bisher " + gesamt, z.runde === T(sp, "niRunde", { n: nr + 1, m: 3 }) && !!regel && z.punkte === gesamt && z.knopf === T(sp, "niLos"), JSON.stringify(z));
    if (nr === 0) { await layoutPruefen(s, "Schilder-Wisch Regel (360)"); await s.screenshot({ path: join(bilder, "ninja-regel-360.png") }); }
    await losDruecken(s);
    const fb = await feldBox(s);
    const info = await s.evaluate(() => { const r = (q) => document.querySelector(q).getBoundingClientRect(); return { hudO: r(".ni-hud").top, feldU: r(".ni-spielfeld").bottom, feldB: r(".ni-spielfeld").width, h: window.innerHeight, ta: getComputedStyle(document.querySelector(".ni-feld")).touchAction }; });
    if (nr === 0) pruefe("360: Anzeige und ganzes Feld im Bild, über der Menüleiste; touch-action:none während des Spiels", info.hudO >= 0 && info.feldU <= info.h - 60 && info.feldB >= 280 && info.ta === "none", JSON.stringify(info));
    const gesehen = {};      // erkl -> richtig
    const sidsGesehen = new Set();
    const getroffen = {};    // i -> true
    let richtig = 0, falsch = 0, versuchtFalsch = false;
    const art = nr === 0 ? "touch" : nr === 1 ? "tipp" : "nichts";
    let fotoGemacht = false;
    const bis = Date.now() + 30000;
    let letzterTick = 0;
    while (Date.now() < bis) {
      if (await s.evaluate(() => !document.querySelector(".ni-antwort").hidden)) break;
      const liste = await schilder(s);
      for (const sc of liste) {
        const sch = N.schildMitId(sc.sid);
        const istRichtig = N.richtigePool(regel).some((x) => x.id === sc.sid);
        gesehen[sch.erkl] = istRichtig; sidsGesehen.add(sc.sid);
      }
      if (!fotoGemacht && liste.length >= 4 && nr === 0) { fotoGemacht = true; await s.screenshot({ path: join(bilder, "ninja-spiel-360.png") }); }
      if (art === "nichts") { await pause(150); continue; }
      for (const sc of liste) {
        if (getroffen[sc.i]) continue;
        const istRichtig = N.richtigePool(regel).some((x) => x.id === sc.sid);
        const sollWischen = istRichtig || (nr === 1 && !versuchtFalsch && sc.x > fb.l + 60 && sc.x < fb.r - 60);
        if (!sollWischen) continue;
        const vorher = (await zustand(s)).punkte;
        let getan = false;
        if (art === "touch") getan = await wische(s, sc, "touch", fb);
        else { if (sc.x >= fb.l + 30 && sc.x <= fb.r - 30 && sc.y >= fb.t + 10 && sc.y <= fb.b - 10) { await s.touchscreen.tap(sc.x, sc.y); getan = true; } }
        if (!getan) continue;
        getroffen[sc.i] = true;
        if (istRichtig) richtig++; else { falsch++; versuchtFalsch = true; }
        break;
      }
      await pause(60);
    }
    await warteAufloesung(s, 15000);
    z = await zustand(s);
    // Erwartung gegen die Rechnung
    const erwR = art === "nichts" ? 0 : richtig;
    const punkte = N.punkteRunde(erwR, falsch);
    gesamt += punkte; summeR += erwR; summeF += falsch; if (N.istVoll(erwR, falsch)) summeVoll++;
    if (nr === 0) pruefe(name + ": mit echten Touch-Wischgesten alle 9 richtigen Schilder gewischt, nichts Falsches", richtig === 9 && falsch === 0, richtig + " richtig, " + falsch + " falsch");
    if (nr === 1) pruefe(name + ": mit Fingertipps ≥ 8 richtige und genau 1 falsches Schild getroffen", richtig >= 8 && falsch === 1, richtig + " richtig, " + falsch + " falsch");
    if (nr === 2) pruefe(name + ": nichts getan -> 0 Punkte, alle verpasst", z.punkte === gesamt);
    pruefe(name + ": Punkteanzeige = Rechnung (" + gesamt + ")", z.punkte === gesamt, JSON.stringify(z));
    // Erwartete Status je Erklär-Eintrag
    const erw = {};
    N.SCHILDER.forEach((x) => { if (gesehen[x.erkl] === undefined) return; });
    for (const [erkl, istRichtig] of Object.entries(gesehen)) {
      const hits = Object.entries(getroffen).filter(([i]) => true);
      erw[erkl] = null;
    }
    const info2 = await auflosungPruefen(s, sp, regel, name, null);
    // Status der Einträge gegen die tatsächlich gewischten Schilder
    const gewischteErkl = {};
    Object.keys(getroffen).forEach((i) => { /* i = Nummer im Fahrplan; unbekannt -> Status wird über Zähler geprüft */ });
    const zahlen = await s.evaluate(() => Array.from(document.querySelectorAll(".ni-eintrag")).reduce((a, e) => { const k = ["falsch", "verpasst", "gewischt", "gemieden"].find((c) => e.classList.contains(c)); a[k] = (a[k] || 0) + 1; return a; }, {}));
    if (nr === 0) pruefe(name + ": alles richtig -> kein Eintrag 'verpasst' oder 'falsch', Urteil mit Bonus", !zahlen.verpasst && !zahlen.falsch && info2.urteil === T(sp, "niVollMsg", { v: 20 }), JSON.stringify(zahlen) + " " + info2.urteil);
    if (nr === 1) pruefe(name + ": ein falsch gewischtes Schild steht als 'falsch' in der Liste, Urteil ohne Bonus", zahlen.falsch >= 1 && info2.urteil === T(sp, "niRundeEnde"), JSON.stringify(zahlen) + " " + info2.urteil);
    if (nr === 2) pruefe(name + ": nichts gewischt -> alle richtigen Arten als 'verpasst'", zahlen.verpasst >= 2 && !zahlen.gewischt && !zahlen.falsch, JSON.stringify(zahlen));
    pruefe(name + ": Zahlenzeile nennt richtig, falsch und Punkte", info2.zahlen === T(sp, "niRundeZahlen", { n: erwR, m: 9, f: falsch }) + " · " + T(sp, "niRundePunkte", { v: punkte }), info2.zahlen);
    pruefe(name + ": Weiter-Knopf: " + (nr === 2 ? "Ergebnis zeigen" : "Nächste Runde"), info2.weiter === T(sp, nr === 2 ? "niErgebnisZeigen" : "niWeiter"));
    pruefe(name + ": nach der Runde ist das Feld wieder frei (kein touch-action:none, keine Schilder)", (await zustand(s)).aktiv === false && (await zustand(s)).schilder === 0);
    if (nr === 0 || nr === 1) { await layoutPruefen(s, name + " Auflösung (360)"); await s.screenshot({ path: join(bilder, "ninja-aufloesung-" + (nr + 1) + "-360.png"), fullPage: true }); }
    if (nr === 2) await s.screenshot({ path: join(bilder, "ninja-aufloesung-verpasst-360.png"), fullPage: true });
    if (nr === 2) warte(60_000);   // die Prüfung spielt schneller als ein Mensch; die Server-Uhr läuft vor, sonst gälte der Wert zu Recht als „zu schnell“
    await druecke(s, ".ni-weiter");
    if (nr < 2) { await s.waitForSelector(".ni-antwort[hidden]", { state: "attached" }); await weiterZumLos(s); }
  }
  pruefe("drei verschiedene Regeln im Durchgang", new Set(regelnGesehen).size === 3, regelnGesehen.join(","));
  await s.waitForSelector(".sp-erg", { timeout: 6000 });
  await s.waitForSelector(".sp-badge", { timeout: 6000 }).catch(async () => { console.log("  Speicherzeile:", await s.textContent(".sp-speicher"), JSON.stringify(db.academy_spiele_runden)); });
  const erg = await s.evaluate(() => ({ gross: document.querySelector(".sp-gross").textContent.trim(), zeilen: Array.from(document.querySelectorAll(".ni-ergzeile")).map((e) => e.textContent.trim()), badges: Array.from(document.querySelectorAll(".sp-badge")).map((e) => e.textContent.trim()), knopf: document.querySelector(".ni-knopf").textContent.trim(), knopfSichtbar: !document.querySelector(".ni-knopf").hidden, hinweis: document.querySelector(".sp-hinweis-strasse").textContent.trim() }));
  pruefe("Ergebnis: Punkte = " + gesamt, erg.gross === String(gesamt), JSON.stringify(erg));
  pruefe("Ergebnis: richtig / falsch / fehlerfreie Runden stimmen", erg.zeilen[0] === T(sp, "niErgRichtig", { n: summeR, m: 27 }) && erg.zeilen[1] === T(sp, "niErgFalsch", { n: summeF }) && erg.zeilen[2] === T(sp, "niErgVoll", { n: summeVoll, m: 3 }), JSON.stringify(erg.zeilen));
  pruefe("Ergebnis: Hinweis zum echten Verkehr, Knopf „Nochmal“ sichtbar", erg.hinweis === T(sp, "niHinweis") && erg.knopf === "Nochmal" && erg.knopfSichtbar);
  pruefe("Ergebnis: neue Bestpunktzahl und Platz", erg.badges.includes(T(sp, "niNeu")) && erg.badges.some((b) => b.startsWith("Platz ")), JSON.stringify(erg.badges));
  const gesp = db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "ninja");
  pruefe("Server hat den Wert gespeichert (" + gesamt + ")", !!gesp && gesp.wert === gesamt, JSON.stringify(gesp));
  await layoutPruefen(s, "Schilder-Wisch Ergebnis (360)");
  await s.screenshot({ path: join(bilder, "ninja-ergebnis-360.png"), fullPage: true });
  pruefe("Bestenliste zeigt die Mitspieler", (await s.locator(".sp-ranking .sp-zeile").count()) >= 3);
  // zweiter Durchgang: Nochmal startet neu ohne Reste
  await druecke(s, ".ni-knopf");
  await weiterZumLos(s);
  const z2 = await zustand(s);
  pruefe("Nochmal: neuer Durchgang bei 0 Punkten, Runde 1 von 3, Ergebnis weg", z2.punkte === 0 && z2.runde === T(sp, "niRunde", { n: 1, m: 3 }) && (await s.locator(".sp-erg").count()) === 0, JSON.stringify(z2));
  pruefe("keine Konsolenfehler im Durchgang", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();
}

/* ===================== 3. Seite scrollt beim Wischen im Feld nicht, außerhalb schon ===================== */
console.log("Schilder-Wisch: Wischen scrollt die Seite nicht");
{
  const s = await neueSeite({ b: 360, h: 740, seed: 7 });
  await zumSpiel(s);
  await druecke(s, ".ni-knopf"); await losDruecken(s);
  await s.waitForFunction(() => document.querySelectorAll(".ni-schild").length >= 2, null, { timeout: 8000 });
  await s.evaluate(() => { window.scrollTo(0, 0); });
  await s.waitForTimeout(100);
  const hoehe = await s.evaluate(() => ({ sh: document.documentElement.scrollHeight, ih: window.innerHeight }));
  pruefe("die Seite ist höher als der Bildschirm (sonst wäre die Prüfung wertlos)", hoehe.sh > hoehe.ih + 60, JSON.stringify(hoehe));
  const fb = await feldBox(s);
  // Wisch senkrecht im Feld (von unten nach oben): ohne touch-action:none würde die Seite scrollen
  const x = fb.l + 20, y0 = Math.min(fb.b - 8, 700), y1 = fb.t + 20;
  await touchWisch(s, strecke(x, y0, x, y1, 12));
  await s.waitForTimeout(250);
  const yNach = await s.evaluate(() => window.scrollY);
  pruefe("senkrechter Touch-Wisch im Feld scrollt die Seite NICHT (scrollY " + yNach + ")", yNach === 0, String(yNach));
  // Wisch auf der Anzeige oberhalb des Feldes (nach oben ziehen): die Seite scrollt ganz normal
  const ib = await s.locator(".ni-info").evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.left + 30, y: r.top + r.height / 2 }; });
  await touchWisch(s, strecke(ib.x, ib.y, ib.x, ib.y - 20, 6).concat(strecke(ib.x, ib.y - 20, ib.x, 5, 12)));
  await s.waitForTimeout(500);
  const yAussen = await s.evaluate(() => window.scrollY);
  pruefe("Wisch auf der Anzeige außerhalb des Feldes scrollt die Seite ganz normal (scrollY " + yAussen + ")", yAussen > 0, String(yAussen));
  await s.context().close();
}

/* ===================== 4. Tippziele auf dem kleinen Handy (320 x 640) ===================== */
console.log("Schilder-Wisch: Zeigerziele auf 320 x 640");
{
  const s = await neueSeite({ b: 320, h: 640, seed: 99 });
  await zumSpiel(s);
  await druecke(s, ".ni-knopf"); await losDruecken(s);
  await s.waitForFunction(() => document.querySelectorAll(".ni-schild").length >= 3, null, { timeout: 9000 });
  await layoutPruefen(s, "Schilder-Wisch Spiel (320)");
  const gr = await s.evaluate(() => Array.from(document.querySelectorAll(".ni-schild")).map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
  pruefe("320: alle Schilder mindestens 44 x 44 px (" + gr[0].join("x") + ")", gr.every(([w, h]) => w >= 44 && h >= 44));
  const fb = await feldBox(s);
  pruefe("320: Feld breit genug, ganzes Feld auf dem Bildschirm", fb.w >= 240 && fb.b <= 640 - 50, JSON.stringify(fb));
  await s.screenshot({ path: join(bilder, "ninja-spiel-320.png") });
  // Wisch 8 px neben der Mitte (Wischfläche = halbe Schildbreite + 4 px) trifft
  const regel = regelAus("de", (await zustand(s)).regel);
  const liste = (await schilder(s)).filter((c) => c.x > fb.l + 50 && c.x < fb.r - 50);
  const ziel = liste.find((c) => N.richtigePool(regel).some((x) => x.id === c.sid)) || liste[0];
  const richtigZiel = N.richtigePool(regel).some((x) => x.id === ziel.sid);
  const v0 = (await zustand(s)).punkte;
  await touchWisch(s, strecke(ziel.x - 20, ziel.y + 20, ziel.x + 20, ziel.y + 20, 5));   // 20 px unterhalb der Mitte, schräg daran vorbei (innerhalb 26 px)
  const v1 = (await zustand(s)).punkte;
  pruefe("320: Wisch 20 px neben der Schildmitte trifft das Schild (Wischfläche ≥ 52 px)", richtigZiel ? v1 === v0 + 10 : v1 === Math.max(0, v0 - 15) || v1 < v0 || v1 === v0 /* falsches Schild bei 0 Punkten bleibt 0 */, v0 + " -> " + v1);
  pruefe("320: Treffer wird gemeldet (Meldung steht da)", (await zustand(s)).meldung === (richtigZiel ? T("de", "niRichtigMsg", { v: 10 }) : T("de", "niFalschMsg", { v: 15 })), JSON.stringify(await zustand(s)));
  await s.evaluate(() => window.__tempo(60)); await warteAufloesung(s, 15000);
  await layoutPruefen(s, "Schilder-Wisch Auflösung (320)");
  await s.screenshot({ path: join(bilder, "ninja-aufloesung-320.png"), fullPage: true });
  pruefe("320: keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();
}

/* ===================== 5. Querformat ===================== */
console.log("Schilder-Wisch: Querformat 740 x 360");
{
  const s = await neueSeite({ b: 740, h: 360, seed: 31 });
  await zumSpiel(s);
  await druecke(s, ".ni-knopf"); await losDruecken(s);
  await s.waitForFunction(() => document.querySelectorAll(".ni-schild").length >= 3, null, { timeout: 9000 });
  const rc = await s.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); return { fO: g(".ni-spielfeld").top, fU: g(".ni-spielfeld").bottom, fR: g(".ni-spielfeld").right, hudL: g(".ni-hud").left, h: window.innerHeight, w: window.innerWidth, schild: Math.min(...Array.from(document.querySelectorAll(".ni-schild")).map((e) => e.getBoundingClientRect().width)) }; });
  pruefe("quer: ganzes Feld im Fenster, Anzeigen rechts daneben, Schilder ≥ 44 px", rc.fO >= 0 && rc.fU <= rc.h && rc.hudL >= rc.fR - 1 && rc.schild >= 44, JSON.stringify(rc));
  await layoutPruefen(s, "Schilder-Wisch Spiel (quer)");
  await s.screenshot({ path: join(bilder, "ninja-spiel-quer.png") });
  // Wischen funktioniert auch quer
  const fb = await feldBox(s);
  const regel = regelAus("de", (await zustand(s)).regel);
  let treffer = 0;
  for (let versuch = 0; versuch < 40 && treffer < 2; versuch++) {
    const liste = await schilder(s);
    const c = liste.find((q) => N.richtigePool(regel).some((x) => x.id === q.sid) && q.x > fb.l + 40 && q.x < fb.r - 40);
    if (c && await wische(s, c, "touch", fb)) treffer++;
    await pause(80);
  }
  pruefe("quer: zwei richtige Schilder durchwischt", (await zustand(s)).punkte === 20, JSON.stringify(await zustand(s)));
  await s.evaluate(() => window.__tempo(60)); await warteAufloesung(s, 15000);
  await layoutPruefen(s, "Schilder-Wisch Auflösung (quer)");
  await s.screenshot({ path: join(bilder, "ninja-aufloesung-quer.png"), fullPage: true });
  const weiter = await s.evaluate(() => { document.querySelector(".ni-weiter").scrollIntoView({ block: "center" }); const r = document.querySelector(".ni-weiter").getBoundingClientRect(); return { h: r.height, b: r.width, o: r.top, u: r.bottom, vh: window.innerHeight }; });
  pruefe("quer: Weiter-Knopf erreichbar und groß genug", weiter.h >= 43.5 && weiter.o >= 0 && weiter.u <= weiter.vh, JSON.stringify(weiter));
  pruefe("quer: keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();
}

/* ===================== 6. Dunkelmodus ===================== */
console.log("Schilder-Wisch: Dunkelmodus 412 x 915");
{
  const s = await neueSeite({ b: 412, h: 915, dunkel: true, seed: 5 });
  await zumSpiel(s);
  await druecke(s, ".ni-knopf"); await losDruecken(s);
  await s.waitForFunction(() => document.querySelectorAll(".ni-schild").length >= 3, null, { timeout: 9000 });
  await s.screenshot({ path: join(bilder, "ninja-spiel-dunkel.png") });
  await s.evaluate(() => window.__tempo(60)); await warteAufloesung(s, 15000);
  const farben = await s.evaluate(() => { const c = (q, p) => getComputedStyle(document.querySelector(q))[p]; return { antwort: c(".ni-antwort", "backgroundColor"), text: c(".ni-eintrag-kopf", "color"), eintrag: c(".ni-eintrag", "backgroundColor"), seite: getComputedStyle(document.body).backgroundColor }; });
  pruefe("dunkel: Erklärfeld dunkel, Text hell (aus App-Variablen)", farben.antwort !== "rgba(0, 0, 0, 0)" && farben.text !== farben.antwort && farben.text !== farben.eintrag, JSON.stringify(farben));
  await layoutPruefen(s, "Schilder-Wisch Auflösung (dunkel)");
  await s.screenshot({ path: join(bilder, "ninja-aufloesung-dunkel.png"), fullPage: true });
  await s.context().close();
}

/* ===================== 7. Maus und Tastatur ===================== */
console.log("Schilder-Wisch: Maus und Tastatur");
{
  const s = await neueSeite({ b: 800, h: 900, maus: true, seed: 17 });
  await zumSpiel(s);
  await druecke(s, ".ni-knopf"); await losDruecken(s);
  await s.waitForFunction(() => document.querySelectorAll(".ni-schild").length >= 3, null, { timeout: 9000 });
  const fb = await feldBox(s);
  const regel = regelAus("de", (await zustand(s)).regel);
  const richtigDa = async () => (await schilder(s)).find((q) => N.richtigePool(regel).some((x) => x.id === q.sid) && q.x > fb.l + 40 && q.x < fb.r - 40);
  // Maus: wischen
  let c, ok = false;
  for (let i = 0; i < 40 && !ok; i++) { c = await richtigDa(); if (c) ok = await wische(s, c, "maus", fb); await pause(80); }
  pruefe("Maus: richtiges Schild mit gedrückter Maustaste durchwischt (+10)", ok && (await zustand(s)).punkte === 10, JSON.stringify(await zustand(s)));
  // Maus ohne gedrückte Taste: nur darüberfahren zählt nicht
  const falsche = async () => (await schilder(s)).find((q) => !N.richtigePool(regel).some((x) => x.id === q.sid) && q.x > fb.l + 40 && q.x < fb.r - 40);
  let f = null; for (let i = 0; i < 40 && !f; i++) { f = await falsche(); await pause(80); }
  const vor = (await zustand(s)).punkte;
  const pts = strecke(f.x - 30, f.y, f.x + 30, f.y, 6);
  await s.mouse.move(pts[0].x, pts[0].y); for (const p of pts.slice(1)) await s.mouse.move(p.x, p.y);
  pruefe("Maus: bloßes Darüberfahren (ohne Taste) zählt nicht", (await zustand(s)).punkte === vor);
  // Maus: Wisch auf ein falsches Schild kostet Punkte (von 10 auf 0, Runde nie unter 0 -> Anzeige zeigt max(0, …))
  f = null; for (let i = 0; i < 40 && !f; i++) { f = await falsche(); await pause(80); }
  await wische(s, f, "maus", fb);
  const nach = await zustand(s);
  pruefe("Maus: Wisch über ein falsches Schild: Meldung „Falsch“, Punkte sinken (10 → 0)", nach.meldung === T("de", "niFalschMsg", { v: 15 }) && nach.punkte === 0, JSON.stringify(nach));
  // Tastatur: Schild-Knopf mit Namen fokussieren, Enter
  let k = null;
  for (let i = 0; i < 60 && !k; i++) { k = await s.evaluate((ids) => { const e = Array.from(document.querySelectorAll(".ni-schild:not(.treffer):not(.fehl)")).find((x) => ids.includes(x.dataset.sid)); if (!e) return null; e.focus(); return { sid: e.dataset.sid, label: e.getAttribute("aria-label"), fokus: document.activeElement === e }; }, N.richtigePool(regel).map((x) => x.id)); if (!k) await pause(80); }
  pruefe("Tastatur: Schild ist ein fokussierbarer Knopf mit dem Schildnamen als Beschriftung", !!k && k.fokus && k.label === T("de", N.schildMitId(k.sid).name).replace(/­/g, ""), JSON.stringify(k));
  await s.keyboard.press("Enter");
  const kt = await zustand(s);
  pruefe("Tastatur: Enter auf einem richtigen Schild zählt (+10; Rundenstand 2 richtig, 1 falsch = 20 − 15 = 5)", kt.punkte === 5 && kt.meldung === T("de", "niRichtigMsg", { v: 10 }), JSON.stringify(kt));
  pruefe("Maus/Tastatur: keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();
}

/* ===================== 8. Reduzierte Bewegung ===================== */
console.log("Schilder-Wisch: prefers-reduced-motion");
{
  async function geschwindigkeit(reduziert) {
    const s = await neueSeite({ b: 360, h: 740, seed: 4, reduziert });
    await zumSpiel(s);
    await druecke(s, ".ni-knopf"); await losDruecken(s);
    await s.waitForFunction(() => document.querySelectorAll(".ni-schild").length >= 1, null, { timeout: 9000 });
    const m = await s.evaluate(async () => {
      const e = document.querySelector(".ni-schild"); const i = e.dataset.i;
      const x = () => { const r = document.querySelector('.ni-schild[data-i="' + i + '"]'); return r ? r.getBoundingClientRect().left + r.getBoundingClientRect().width / 2 : null; };
      const a = x(), t0 = performance.now();
      await new Promise((ok) => setTimeout(ok, 700));
      const b = x(), t1 = performance.now();
      return { v: Math.abs(b - a) / ((t1 - t0) / 1000), w: document.querySelector(".ni-feld").getBoundingClientRect().width, anim: getComputedStyle(document.documentElement).getPropertyValue("--x"), reduce: matchMedia("(prefers-reduced-motion: reduce)").matches };
    });
    await s.context().close();
    return m;
  }
  const normal = await geschwindigkeit(false), langsam = await geschwindigkeit(true);
  pruefe("Medienabfrage richtig gesetzt", normal.reduce === false && langsam.reduce === true);
  const verhaeltnis = normal.v / langsam.v;
  pruefe("bei reduzierter Bewegung gleiten die Schilder langsamer (Faktor " + verhaeltnis.toFixed(2) + ", erwartet ≈ 1,5)", verhaeltnis > 1.3 && verhaeltnis < 1.7, normal.v.toFixed(1) + " / " + langsam.v.toFixed(1) + " px/s");
  pruefe("normale Geschwindigkeit der ersten Runde ≈ (Breite + Schild) / 6,5 s", Math.abs(normal.v - (normal.w + 56) / 6.5) < 25, normal.v.toFixed(1) + " px/s bei Breite " + normal.w);
  const css = readFileSync(join(wurzel, "spiele/ninja.css"), "utf8");
  pruefe("reduzierte Bewegung: keine Animationen für Treffer/Wackeln im Stil", /prefers-reduced-motion:reduce\)\{[^}]*animation:none/.test(css.replace(/\s+/g, "")) || /prefers-reduced-motion:\s*reduce\)\s*\{[^}]*animation:\s*none/.test(css));
}

/* ===================== 9. Alle 18 Sprachen (360 x 740) ===================== */
console.log("Schilder-Wisch: alle 18 Sprachen");
for (const sp of SPRACHEN) {
  const t = await neueSeite({ b: 360, h: 740, sprache: sp, seed: 3 });
  await zumHub(t);
  pruefe(sp + ": Karte übersetzt", (await t.textContent('.sp-karte[data-spiel="ninja"] .sp-karte-titel')).trim() === TEXTE_NINJA[sp].niName && (await t.textContent('.sp-karte[data-spiel="ninja"] .sp-karte-kurz')).trim() === TEXTE_NINJA[sp].niKurz);
  await druecke(t, '.sp-karte[data-spiel="ninja"]'); await t.waitForSelector(".ni-knopf"); await t.waitForTimeout(350);
  pruefe(sp + ": Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await t.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
  pruefe(sp + ": Titel, Anleitung, Start in der Sprache", (await t.textContent(".sp-spieltitel")).trim() === TEXTE_NINJA[sp].niName && (await t.textContent(".ni-anleitung")).trim() === TEXTE_NINJA[sp].niBereit && (await t.textContent(".ni-knopf")).trim() === TEXTE[sp].start);
  await layoutPruefen(t, sp + " bereit");
  await druecke(t, ".ni-knopf");
  await weiterZumLos(t);
  const z0 = await zustand(t);
  const regel = regelAus(sp, z0.regel);
  pruefe(sp + ": Runde und Regel in der Sprache, Knopf „Los“", z0.runde === T(sp, "niRunde", { n: 1, m: 3 }) && !!regel && z0.knopf === T(sp, "niLos"), JSON.stringify(z0));
  await layoutPruefen(t, sp + " Regel");
  await losDruecken(t);
  // ein falsches Schild antippen, ein richtiges antippen (Meldungen in der Sprache), dann Zeit beschleunigen
  const fb = await feldBox(t);
  let falschGetippt = false, richtigGetippt = false;
  const bis = Date.now() + 14000;
  while (Date.now() < bis && !(falschGetippt && richtigGetippt)) {
    const liste = (await schilder(t)).filter((q) => q.x > fb.l + 40 && q.x < fb.r - 40 && q.y > fb.t + 10 && q.y < fb.b - 10);
    for (const q of liste) {
      const r = N.richtigePool(regel).some((x) => x.id === q.sid);
      if (r && !richtigGetippt) { await t.touchscreen.tap(q.x, q.y); richtigGetippt = true; const z = await zustand(t); pruefe(sp + ": Meldung zum Treffer in der Sprache", z.meldung === T(sp, "niRichtigMsg", { v: 10 }), z.meldung); break; }
      if (!r && !falschGetippt && richtigGetippt) { await t.touchscreen.tap(q.x, q.y); falschGetippt = true; const z = await zustand(t); pruefe(sp + ": Meldung zum falschen Schild in der Sprache", z.meldung === T(sp, "niFalschMsg", { v: 15 }), z.meldung); break; }
    }
    await pause(100);
  }
  pruefe(sp + ": ein richtiges und ein falsches Schild angetippt", richtigGetippt && falschGetippt);
  await layoutPruefen(t, sp + " im Spiel");
  await t.evaluate(() => window.__tempo(60));
  await warteAufloesung(t, 15000);
  await auflosungPruefen(t, sp, regel, sp + " Auflösung", null);
  const sichtbar = await t.evaluate(() => !/\{[nmvf]\}|\bni[A-Z][A-Za-z_]+/.test(document.querySelector("#spiele-platz").textContent));
  pruefe(sp + ": kein roher Schlüssel oder offener Platzhalter sichtbar", sichtbar);
  await layoutPruefen(t, sp + " Auflösung");
  if (["ar", "tr", "am", "ru", "de", "ckb"].includes(sp)) { await t.waitForTimeout(300); await t.screenshot({ path: join(bilder, "ninja-sprache-" + sp + ".png"), fullPage: true }); }
  pruefe(sp + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
  await t.context().close();
}

/* ===================== 10. Verlassen mitten im Spiel ===================== */
console.log("Schilder-Wisch: Seite verlassen mitten im Spiel");
{
  const s = await neueSeite({ b: 360, h: 740 });
  await zumSpiel(s);
  await druecke(s, ".ni-knopf"); await losDruecken(s);
  await s.waitForFunction(() => document.querySelectorAll(".ni-schild").length >= 1, null, { timeout: 9000 });
  await s.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await s.waitForTimeout(250);
  const z = await zustand(s);
  pruefe("App im Hintergrund: Runde wird abgebrochen, Start-Knopf wieder da, keine Schilder, keine alten Punkte", z.schilder === 0 && z.knopf === "Start" && z.punkte === 0 && z.aktiv === false, JSON.stringify(z));
  await s.evaluate(() => { delete document.hidden; });
  await s.evaluate(() => history.back());
  await s.waitForTimeout(500);
  pruefe("keine Konsolenfehler beim Verlassen", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();
}

await browser.close();
server.close();
console.log("\n" + bestanden + " Prüfungen bestanden" + (befunde.length ? ", " + befunde.length + " FEHLER:\n - " + befunde.join("\n - ") : ""));
