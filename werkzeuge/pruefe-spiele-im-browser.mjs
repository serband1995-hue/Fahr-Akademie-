// Browser-Prüfung des Spiele-Bereichs (06.10.2026): echte App in einem echten (Chromium-)Browser, mit Fingertipp.
//   - Die App läuft aus diesem Ordner, alle Server-Aufrufe der App werden abgefangen:
//     academy-spiele beantwortet die ECHTE Function-Datei gegen eine Datenbank im Speicher
//     (werkzeuge/edge-functions/spiele-im-speicher.mjs), alles andere bekommt leere Standardantworten.
//   - Geprüft: Menü, Startseite, Spiel, Fehlstart, Ergebnis + Rechnung, Tempo-Wechsel, Bestenliste,
//     Ausblenden, Verlassen mitten in der Runde, Handy hoch/quer, alle 18 Sprachen (nichts abgeschnitten,
//     nichts seitlich wischbar, Tippflächen >= 44 px, RTL), keine Fehler in der Konsole.
//   - Einzel-Freigabe je Spiel (nurVorschau): normales Schülergerät sieht Spiel 1, aber NICHT Spiel 2; ?spiele=1 zeigt beide.
//   - Tempo-Sprint (Spiel 2): ganze Läufe in ECHTER Zeit (je ca. 45 s): ehrlicher Lauf, Blitzer + Mehrfinger-Salven,
//     Nachtippen nach dem Ende, Verlassen mitten im Lauf, alle 18 Sprachen.
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
[["m1", "Mira Kaya", 231, 188, 14200, 1350], ["m2", "Jonas Weber", 262, 171, 18900, 1210], ["m3", "Ali Reza Karimi", 305, 160, 23100, 1100], ["m4", "Ayşe Yılmaz", 340, 150, 30500, 900]].forEach(([id, n, w, tempo, memory, vorf]) => {
  schueler(id, n);
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "ampel", wert: w, erreicht_am: jetzt(), versuche: 3 });
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "tempo", wert: tempo, erreicht_am: jetzt(), versuche: 2 });
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
const zumSpiel = async (s) => { await zumHub(s); await s.tap('.sp-karte[data-spiel="ampel"]'); await s.waitForSelector(".sp-knopf"); };

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
  await s.tap('.sp-karte[data-spiel="ampel"]');
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
  await s.tap('.sp-karte[data-spiel="ampel"]');
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
    await t.tap('.sp-karte[data-spiel="ampel"]');
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
const zumTempo = async (s) => { await zumHub(s); await s.tap('.sp-karte[data-spiel="tempo"]'); await s.waitForSelector(".sp-t-pad"); };
const padText = async (s) => (await s.textContent(".sp-t-pad")).trim();
const zahlJetzt = async (s) => parseInt(await s.textContent(".sp-t-zahl"), 10);
const SPRACHEN = ["de", "tr", "en", "ar", "es", "ru", "sr", "ckb", "kmr", "hi", "ur", "vi", "rif", "fa", "ps", "el", "am", "ti"];
const RTL = ["ar", "ckb", "ur", "fa", "ps"];

/* Mitspieler im Browser: tippt wie ein Mensch (Fingerereignisse auf die Tippfläche).
   lernen: "halten" (knapp unter dem Schild) | "dauer" (immer) | "nichts"; salve: Finger gleichzeitig im Endspurt; takt: ms zwischen Salven */
async function botStarten(s, o) {
  await s.evaluate((opt) => {
    const pad = document.querySelector(".sp-t-pad"), zahl = document.querySelector(".sp-t-zahl");
    const tippen = (n) => { for (let i = 0; i < n; i++) pad.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", pointerId: 10 + i, isPrimary: i === 0 })); };
    const limit = () => { const l = document.querySelector("[data-aktuell] img"); const m = l && /(\d+) km\/h/.exec(l.getAttribute("alt") || ""); return m ? +m[1] : null; };
    window.__bot = {
      lern: setInterval(() => {
        if (!pad.classList.contains("tippen") || pad.classList.contains("spurt")) return;
        if (opt.lernen === "dauer") tippen(1);
        else if (opt.lernen === "halten") { const l = limit(); if (l && +zahl.textContent < l - 8) tippen(1); }
      }, 25),
      spurt: setInterval(() => { if (pad.classList.contains("tippen") && pad.classList.contains("spurt")) tippen(opt.salve || 1); }, opt.takt || 80)
    };
  }, o);
}
const botStoppen = (s) => s.evaluate(() => { if (window.__bot) { clearInterval(window.__bot.lern); clearInterval(window.__bot.spurt); } });

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
    if (sichtbarIds.includes("tempo")) {
      await n.evaluate(() => go({ drawer: "spiele", spiel: "tempo" }));
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
    await n.waitForFunction(() => /Noch nicht gespielt/.test(document.querySelector('[data-best="tempo"]')?.textContent || ""));
    await n.tap('.sp-karte[data-spiel="tempo"]');
    await n.waitForSelector(".sp-t-pad");
    pruefe("Tempo-Sprint öffnet auf dem Vorschau-Gerät", (await padText(n)) === "Start");
    await n.context().close();
  }

  console.log("Tempo-Sprint: Layout in Ruhe (bereit)");
  for (const g of [{ b: 360, h: 740, n: "360" }, { b: 412, h: 915, n: "412" }, { b: 320, h: 640, n: "320" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }]) {
    const t = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
    await zumTempo(t);
    await t.waitForTimeout(800);
    await layoutPruefen(t, "Tempo-Sprint bereit " + g.n, g.b);
    await t.screenshot({ path: join(bilder, "tempo-bereit-" + g.n.replace(/\W+/g, "_") + ".png") });
    pruefe("Tempo-Sprint " + g.n + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
    await t.context().close();
  }

  console.log("Tempo-Sprint: ehrlicher Lauf in echter Zeit (360 x 740, ca. 45 s)");
  let s = await neueSeite({ b: 360, h: 740 });
  await zumTempo(s);
  pruefe("Startzustand: Anleitung unter der Tippfläche, Tacho 0, Pad „Start“", (await s.textContent(".sp-t-anleitung")).includes("Tippe auf Start") && (await s.isVisible(".sp-t-anleitung")) && (await zahlJetzt(s)) === 0 && (await padText(s)) === "Start");
  pruefe("keine Ergebnis-Karte vor dem ersten Lauf", (await s.locator(".sp-erg:visible").count()) === 0);
  await s.tap(".sp-t-pad");                                    // echter Fingertipp startet
  await s.waitForSelector(".sp-t-pad.warte");
  const ziffern = new Set();
  const stufe = Date.now();
  while (Date.now() - stufe < 3600 && !(await s.locator(".sp-t-pad.tippen").count())) { ziffern.add(await padText(s)); await s.waitForTimeout(60); }
  pruefe("Countdown zeigt 3, 2, 1", ["3", "2", "1"].every((z) => ziffern.has(z)), [...ziffern].join(","));
  await s.waitForSelector(".sp-t-pad.tippen", { timeout: 8000 });
  const tLauf = Date.now();
  await imBildPruefen(s, "Tempo-Sprint 360 im Lauf");
  pruefe("im Lauf ist die Anleitung ausgeblendet", !(await s.isVisible(".sp-t-anleitung")));
  pruefe("Lernphase beginnt bei 50 km/h, Schild 80 im Blick", (await s.textContent(".sp-t-meldung")).includes("Erlaubt: 80 km/h") && (await s.getAttribute("[data-aktuell] img", "alt")).includes("274") && (await s.getAttribute("[data-aktuell] img", "alt")).includes("80 km/h"));
  pruefe("Tempo-Schild im Anzeigefeld ist das geladene amtliche Bild (mind. 50 px)", await s.evaluate(() => { const i = document.querySelector("[data-aktuell] img"); const r = i.getBoundingClientRect(); return i.complete && i.naturalWidth > 0 && r.width >= 50; }));
  const v1 = await zahlJetzt(s);
  pruefe("Tacho beim Start im Bereich 40–50 (rollt ohne Tippen)", v1 >= 38 && v1 <= 50, "v=" + v1);
  await botStarten(s, { lernen: "halten", takt: 80 });
  const proben = []; let blitzerGesehen = false, ankuendigungen = new Set(), schilder = new Set(), padWorte = new Set();
  let layoutLern = false, bildLern = false, bildAnk = false, letztesSchild = null, schildSeit = Date.now();
  while (!(await s.locator(".sp-t-pad.spurt").count()) && Date.now() - tLauf < 36000) {
    const info = await s.evaluate(() => ({
      v: +document.querySelector(".sp-t-zahl").textContent, m: document.querySelector(".sp-t-meldung").textContent.trim(), warn: document.querySelector(".sp-t-meldung").classList.contains("warn"),
      l: (/(\d+) km\/h/.exec(document.querySelector("[data-aktuell] img")?.getAttribute("alt") || "") || [])[1], gesperrt: !!document.querySelector(".sp-t-pad.gesperrt"),
      weg: document.querySelector("[data-weg]")?.dataset.wert || ""
    }));
    if (info.l !== letztesSchild) { letztesSchild = info.l; schildSeit = Date.now(); }
    info.nachKulanz = Date.now() - schildSeit > REGELN.KULANZ_MS + 400;   // direkt nach einem neuen Schild darf man noch langsamer werden
    proben.push(info);
    if (info.warn || info.gesperrt) blitzerGesehen = true;
    if (/^Gleich:/.test(info.m)) ankuendigungen.add(info.m);
    if (info.l) schilder.add(info.l);
    if (info.weg) padWorte.add(info.weg);
    if (!layoutLern && Date.now() - tLauf > 4000) { layoutLern = true; await layoutPruefen(s, "Tempo-Sprint Lernphase 360", 360); await s.screenshot({ path: join(bilder, "tempo-lern-360.png") }); }
    if (!bildAnk && /^Gleich:/.test(info.m) && info.weg && Date.now() - tLauf > 8000) { bildAnk = true; await warteMs(900); await s.screenshot({ path: join(bilder, "tempo-schild-naht-360.png") }); }
    await s.waitForTimeout(150);
  }
  pruefe("Lernphase: Bot unter dem Schild -> nie Blitzer, nie gesperrt", !blitzerGesehen, "");
  pruefe("Tacho nie mehr als 5 km/h über dem gezeigten Schild (nach der Kulanzzeit von 2,5 s)", proben.every((p) => !p.l || !p.nachKulanz || p.v <= +p.l + REGELN.TOL + 1), proben.filter((p) => p.l && p.nachKulanz && p.v > +p.l + REGELN.TOL + 1).slice(0, 3).map((p) => p.v + ">" + p.l).join(" "));
  pruefe("direkt nach einem niedrigeren Schild darf der Tacho kurz darüber sein (Kulanz wird gebraucht und reicht)", proben.some((p) => p.l && !p.nachKulanz && p.v > +p.l + REGELN.TOL) && !blitzerGesehen);
  pruefe("alle sechs Schilder 80, 100, 80, 60, 100, 120 wurden gezeigt", REGELN.LIMITS.every((l) => schilder.has(String(l))) && schilder.size === 4, [...schilder].join(","));
  pruefe("Ankündigungen „Gleich: …“ vor dem Wechsel (100, 80, 60, 100, 120 und ‚keine Begrenzung‘)", ["Gleich: 100 km/h", "Gleich: 80 km/h", "Gleich: 60 km/h", "Gleich: 120 km/h"].every((a) => ankuendigungen.has(a)) , [...ankuendigungen].join(" | "));
  pruefe("Schilder laufen am Straßenrand heran (Zeichen 274 und am Ende 282)", padWorte.has("100") && padWorte.has("60") && padWorte.has("frei"), [...padWorte].join(","));
  pruefe("Lernphase dauert ~30 s (Endspurt nach 29–32 s)", Math.abs((Date.now() - tLauf) - 30000) < 2500, (Date.now() - tLauf) + " ms");
  pruefe("Endspurt: Meldung ENDSPURT, Schild Zeichen 282, Pad goldfarben (Klasse spurt)", (await s.textContent(".sp-t-meldung")).includes("ENDSPURT") && (await s.getAttribute("[data-aktuell] img", "alt")).includes("282"));
  const v0Spurt = await zahlJetzt(s);
  pruefe("Tempo am Start des Endspurts: 100–135 (letztes Schild 120)", v0Spurt >= 95 && v0Spurt <= REGELN.V0_MAX + 1, "v=" + v0Spurt);
  await s.screenshot({ path: join(bilder, "tempo-spurt-360.png") });
  await layoutPruefen(s, "Tempo-Sprint Endspurt 360", 360);
  await s.waitForSelector(".sp-erg", { timeout: 16000 });
  await botStoppen(s);
  const gesamt = Date.now() - tLauf;
  pruefe("Endspurt dauert 10 s (Ergebnis nach 39,5–41,5 s)", gesamt > 39500 && gesamt < 41800, gesamt + " ms");
  const wert = parseInt((await s.textContent(".sp-gross")).trim(), 10);
  const zahlen = (await s.locator(".sp-t-zahlen b").allTextContents()).map((x) => parseInt(x, 10));
  pruefe("Ergebnis: guter Spieler (12,5 Tipps/s) kommt SEHR schnell (240–300 km/h)", wert >= 240 && wert <= 300, "wert=" + wert);
  pruefe("Tipps im Endspurt: ca. 12 pro Sekunde (90–135), Blitzer 0", zahlen[0] >= 90 && zahlen[0] <= 135 && zahlen[1] === 0, zahlen.join(","));
  pruefe("Höchsttempo ist mit diesen Tipps möglich (<= Obergrenze)", wert <= Math.ceil(obergrenze(zahlen[0])) + 1, wert + " > " + obergrenze(zahlen[0]));
  pruefe("Tacho zeigt am Ende das Höchsttempo", (await zahlJetzt(s)) === wert, (await zahlJetzt(s)) + " vs " + wert);
  pruefe("Hinweis zur Richtgeschwindigkeit 130 steht da", (await s.textContent(".sp-hinweis-strasse")).includes("130 km/h") && (await s.textContent(".sp-hinweis-strasse")).includes("Richtgeschwindigkeit"));
  await s.waitForSelector(".sp-badge.neu");
  pruefe("erster Lauf: „Neues Höchsttempo!“ und Platz", (await s.textContent(".sp-speicher")).includes("Neues Höchsttempo") && /Platz \d+ von \d+/.test(await s.textContent(".sp-speicher")), await s.textContent(".sp-speicher"));
  pruefe("Server hat das Höchsttempo gespeichert", db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "tempo")?.wert === wert);
  await s.waitForSelector(".sp-zeile.ich");
  const zeilen = await s.locator(".sp-zeile").evaluateAll((els) => els.map((e) => e.textContent.replace(/\s+/g, " ").trim()));
  const nums = zeilen.map((z) => parseInt((/(\d+) km\/h/.exec(z) || [])[1], 10)).filter(Number.isFinite);
  pruefe("Bestenliste: höchstes Tempo zuerst, Einheit km/h", nums.length >= 5 && nums.every((x, i) => i === 0 || x <= nums[i - 1]), zeilen.join(" | "));
  pruefe("Bestenliste: Namen nur Vorname + 1 Buchstabe", (await s.locator(".sp-rname").allTextContents()).every((n) => /^[^\s]+( [^\s]\.)?( · Du)?$/.test(n.trim())));
  await layoutPruefen(s, "Tempo-Sprint Ergebnis 360", 360);
  await s.screenshot({ path: join(bilder, "tempo-ergebnis-360.png"), fullPage: true });
  console.log("Tempo-Sprint: Nachtippen nach dem Ende startet keine neue Runde");
  await s.evaluate(() => { const p = document.querySelector(".sp-t-pad"); for (let i = 0; i < 6; i++) p.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", pointerId: 20 + i })); });
  await s.waitForTimeout(250);
  pruefe("wildes Weitertippen direkt nach dem Ende: Ergebnis bleibt, keine neue Runde", (await padText(s)) === "Nochmal" && (await s.locator(".sp-erg:visible").count()) === 1 && !(await s.locator(".sp-t-pad.warte").count()));
  pruefe("Konsole ohne Fehler (ehrlicher Lauf)", s.fehler.length === 0, s.fehler.join(" | "));
  await s.waitForTimeout(1500);
  await s.tap(".sp-t-pad");
  await s.waitForSelector(".sp-t-pad.warte");
  pruefe("nach der Sperrzeit startet ein echter Tipp die nächste Runde (Ergebnis weg, Tacho 50)", (await s.locator(".sp-erg:visible").count()) === 0 && (await zahlJetzt(s)) === 50);
  await s.tap("[data-nav-zurueck]");
  await s.waitForSelector(".sp-karte");
  pruefe("Startseite zeigt Höchsttempo an der Karte", (await s.textContent('[data-best="tempo"]')).includes("Dein Höchsttempo: " + wert + " km/h"), await s.textContent('[data-best="tempo"]'));
  await s.waitForTimeout(5000);
  pruefe("nach dem Verlassen mitten im Countdown keine Fehler / späten Zeitgeber", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();

  console.log("Tempo-Sprint: Blitzer und Mehrfinger-Salven in echter Zeit (412 x 915, ca. 45 s)");
  s = await neueSeite({ b: 412, h: 915 });
  await zumTempo(s);
  await s.tap(".sp-t-pad");
  await s.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
  const t2 = Date.now();
  await imBildPruefen(s, "Tempo-Sprint 412 im Lauf");
  await botStarten(s, { lernen: "dauer", salve: 4, takt: 70 });
  let sperrProben = [], sperrGeprueft = false, sperrBlitze = 0, blitzSeen = 0, gesperrtVorher = false, fallGesehen = false, letzteV = null, spitze = 0;
  while (!(await s.locator(".sp-t-pad.spurt").count()) && Date.now() - t2 < 36000) {
    const i = await s.evaluate(() => ({ v: +document.querySelector(".sp-t-zahl").textContent, g: !!document.querySelector(".sp-t-pad.gesperrt"), warn: document.querySelector(".sp-t-meldung").classList.contains("warn"), m: document.querySelector(".sp-t-meldung").textContent.trim(), pad: document.querySelector(".sp-t-pad").textContent.trim() }));
    if (i.g && !gesperrtVorher) { blitzSeen++; sperrProben = []; sperrGeprueft = false; }
    if (i.g && !sperrGeprueft) sperrProben.push(i.v);
    gesperrtVorher = i.g;
    if (i.g && blitzSeen === 1 && sperrProben.length === 1) { pruefe("Blitzer: Meldung rot und Pad gesperrt mit Wort „Blitzer“", i.warn && i.m.includes("Blitzer") && i.pad.toLowerCase() === "blitzer", JSON.stringify(i)); await s.screenshot({ path: join(bilder, "tempo-blitzer-412.png") }); }
    if (letzteV != null && !i.g) { spitze = Math.max(spitze, i.v); if (letzteV - i.v > 25) fallGesehen = true; }
    letzteV = i.v;
    await s.waitForTimeout(100);
    if (!sperrGeprueft && sperrProben.length >= 8) { // während der Sperre trotz Dauer-Tippen nie schneller (je Blitzer einmal)
      sperrGeprueft = true; sperrBlitze++;
      pruefe("während der Blitzer-Sperre bringt Tippen nichts (Tacho steigt nicht, Blitzer " + sperrBlitze + ")", sperrProben.every((x, k) => k === 0 || x <= sperrProben[k - 1]), sperrProben.join(","));
    }
  }
  pruefe("Dauertippen löst in der Lernphase mehrfach Blitzer aus", blitzSeen >= 3, "Blitzer: " + blitzSeen);
  const v0b = await zahlJetzt(s);
  pruefe("Tempo am Start des Endspurts bleibt unter V0_MAX", v0b <= REGELN.V0_MAX + 1, "v=" + v0b);
  await s.waitForSelector(".sp-erg", { timeout: 16000 });
  await botStoppen(s);
  const w2 = parseInt((await s.textContent(".sp-gross")).trim(), 10);
  const z2 = (await s.locator(".sp-t-zahlen b").allTextContents()).map((x) => parseInt(x, 10));
  pruefe("Mehrfinger-Salven (4 Finger / 70 ms): höchstens 1 Tipp je 63 ms gezählt (100–160)", z2[0] >= 100 && z2[0] <= REGELN.TAPS_MAX, "Tipps " + z2[0]);
  pruefe("Blitzer-Zahl im Ergebnis stimmt mit den beobachteten überein (>= 3)", z2[1] >= 3, "Ergebnis " + z2[1] + ", gesehen " + blitzSeen);
  pruefe("Server nahm den Salven-Lauf an (Rekord/Platz sichtbar) – Tipps <= TAPS_MAX", (await s.locator(".sp-badge").count()) >= 1 && /Platz \d+ von \d+|Höchsttempo/.test(await s.textContent(".sp-speicher")), await s.textContent(".sp-speicher"));
  pruefe("Tempo mit Salven nicht über der Obergrenze", w2 <= Math.ceil(obergrenze(z2[0])) + 1, w2 + " vs " + obergrenze(z2[0]));
  pruefe("Salven-Lauf (~14 Tipps/s) kommt trotz Blitzer-Strafen über 250 km/h – wer richtig gut ist, wird sehr schnell", w2 >= 250 && w2 <= 320, "wert=" + w2);
  await layoutPruefen(s, "Tempo-Sprint Ergebnis 412", 412);
  pruefe("Konsole ohne Fehler (Blitzer-Lauf)", s.fehler.length === 0, s.fehler.join(" | "));
  await s.context().close();

  console.log("Tempo-Sprint: Verlassen mitten im Lauf / App in den Hintergrund");
  s = await neueSeite({ b: 360, h: 740 });
  await zumTempo(s);
  await s.tap(".sp-t-pad");
  await s.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
  await botStarten(s, { lernen: "halten" });
  await s.waitForTimeout(1500);
  await s.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await s.waitForTimeout(300);
  await botStoppen(s);
  pruefe("App im Hintergrund: Runde abgebrochen, zurück auf „Start“, Tacho 0, kein Ergebnis", (await padText(s)) === "Start" && (await zahlJetzt(s)) === 0 && (await s.locator(".sp-erg:visible").count()) === 0);
  await s.evaluate(() => { delete document.hidden; });
  await s.tap(".sp-t-pad");
  await s.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
  await s.waitForTimeout(800);
  await s.tap("[data-nav-zurueck]");                 // mitten im Lauf zurück
  await s.waitForSelector(".sp-karte");
  await s.waitForTimeout(7000);
  pruefe("nach dem Verlassen mitten im Lauf keine Fehler / späte Zeitgeber", s.fehler.length === 0, s.fehler.join(" | "));
  await s.tap('.sp-karte[data-spiel="tempo"]');
  await s.waitForSelector(".sp-t-pad");
  pruefe("Spiel lässt sich erneut öffnen, Zustand frisch", (await padText(s)) === "Start" && (await zahlJetzt(s)) === 0 && (await s.locator(".sp-erg:visible").count()) === 0);
  await s.context().close();

  console.log("Tempo-Sprint: kleiner Bildschirm 320 x 640 (mitten im Lauf)");
  s = await neueSeite({ b: 320, h: 640 });
  await zumTempo(s);
  await s.tap(".sp-t-pad");
  await s.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
  await s.waitForTimeout(700);
  await imBildPruefen(s, "Tempo-Sprint 320 im Lauf");
  await layoutPruefen(s, "Tempo-Sprint Lauf 320", 320);
  await s.screenshot({ path: join(bilder, "tempo-lauf-320.png") });
  await s.context().close();

  console.log("Tempo-Sprint: Querformat 740 x 360 (mitten im Lauf)");
  s = await neueSeite({ b: 740, h: 360 });
  await zumTempo(s);
  await s.waitForTimeout(900);
  await s.tap(".sp-t-pad");
  await s.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
  await s.waitForTimeout(700);
  await layoutPruefen(s, "Tempo-Sprint Querformat", 740);
  const rc = await s.evaluate(() => { const r = (q) => document.querySelector(q).getBoundingClientRect(); return { hud: r(".sp-t-hud").top, szeneU: r(".sp-t-szene").bottom, meldU: r(".sp-t-meldung").bottom, padO: r(".sp-t-pad").top, padU: r(".sp-t-pad").bottom, h: window.innerHeight, seitlich: document.documentElement.scrollWidth - window.innerWidth }; });
  pruefe("Querformat: Tacho, Szene, Meldung und Tippfläche ohne eigenes Scrollen im Bild (über der Menüleiste)", rc.hud >= 0 && rc.meldU <= rc.h - 70 && rc.padO >= 0 && rc.padU <= rc.h - 70, JSON.stringify(rc));
  await s.screenshot({ path: join(bilder, "tempo-quer-740x360.png") });
  await s.context().close();

  console.log("Tempo-Sprint: alle 18 Sprachen (360 x 740)");
  for (const sp of SPRACHEN) {
    const t = await neueSeite({ b: 360, h: 740, sprache: sp });
    await zumHub(t);
    await t.waitForSelector('.sp-karte[data-spiel="tempo"]');
    const titel = (await t.textContent('.sp-karte[data-spiel="tempo"] .sp-karte-titel')).trim();
    pruefe(sp + ": Tempo-Sprint-Karte übersetzt", sp === "de" ? titel === "Tempo-Sprint" : titel !== "Tempo-Sprint" && !/^tempo[A-Z]/.test(titel), titel);
    await layoutPruefen(t, sp + " Spieleliste mit zwei Karten", 360);
    await t.tap('.sp-karte[data-spiel="tempo"]');
    await t.waitForSelector(".sp-t-pad");
    pruefe(sp + ": Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await t.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
    await layoutPruefen(t, sp + " Tempo bereit", 360);
    await t.tap(".sp-t-pad");
    await t.waitForSelector(".sp-t-pad.tippen", { timeout: 9000 });
    await t.waitForTimeout(500);
    const info = await t.evaluate(() => ({
      alles: document.querySelector("#spiele-platz").textContent,
      aria: document.querySelector("[data-aktuell] img")?.getAttribute("alt") || "",
      meld: document.querySelector(".sp-t-meldung").textContent.trim(), pad: document.querySelector(".sp-t-pad").textContent.trim()
    }));
    pruefe(sp + ": Lauf – kein roher Schlüsselname, kein offenes {v}", !/tempo[A-Z]\w+|vorschauMarke|\{v\}/.test(info.alles + info.aria + info.meld + info.pad), info.meld + " | " + info.aria);
    pruefe(sp + ": Erlaubt-Text und Schildtext nennen 80", /80/.test(info.meld) && /80/.test(info.aria) && /274/.test(info.aria), info.meld + " | " + info.aria);
    await layoutPruefen(t, sp + " Tempo Lauf", 360);
    if (["ar", "am", "tr"].includes(sp)) { await t.waitForTimeout(500); await t.screenshot({ path: join(bilder, "tempo-sprache-" + sp + ".png"), fullPage: true }); }
    pruefe(sp + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
    await t.context().close();
  }
}

/* =========================  Schilder-Memory (Spiel 3)  ========================= */
const zumMemory = async (s) => { await zumHub(s); await s.tap('.sp-karte[data-spiel="memory"]'); await s.waitForSelector(".sp-m-knopf"); };
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
    await t.tap('.sp-karte[data-spiel="memory"]');
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
const zumVorfahrt = async (s) => { await zumHub(s); await s.tap('.sp-karte[data-spiel="vorfahrt"]'); await s.waitForSelector(".sp-v-knopf"); };
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
    await t.tap('.sp-karte[data-spiel="vorfahrt"]');
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
