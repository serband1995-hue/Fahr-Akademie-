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
//   Nur Tempo-Sprint prüfen: NUR_TEMPO=1 node --experimental-strip-types werkzeuge/pruefe-spiele-im-browser.mjs
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

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire((process.env.PLAYWRIGHT_PFAD || "/opt/node22/lib/node_modules") + "/")("playwright");
const bilder = process.env.SPIELE_BILDER || join(process.cwd(), "spiele-bilder");
mkdirSync(bilder, { recursive: true });

// ---- Datenbank im Speicher: ein Testschüler + Mitspieler ----
const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
const schueler = (id, name, extra) => db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null, ...extra });
schueler("t", "Serban Dumitrescu");
db.academy_sessions.push({ session_token: "tok-t", schueler_id: "t", expires_at: inEinemJahr });
[["m1", "Mira Kaya", 231, 188], ["m2", "Jonas Weber", 262, 171], ["m3", "Ali Reza Karimi", 305, 160], ["m4", "Ayşe Yılmaz", 340, 150]].forEach(([id, n, w, tempo]) => {
  schueler(id, n);
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "ampel", wert: w, erreicht_am: jetzt(), versuche: 3 });
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "tempo", wert: tempo, erreicht_am: jetzt(), versuche: 2 });
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
    document.querySelectorAll(".sp-tempo-knopf,.sp-schalter,.sp-knopf,.sp-karte,.sp-t-pad").forEach((el) => {
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

const nurTempo = !!process.env.NUR_TEMPO;
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
    const limit = () => { const l = document.querySelector("[data-aktuell] svg"); const m = l && /(\d+) km\/h/.exec(l.getAttribute("aria-label") || ""); return m ? +m[1] : null; };
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
  { // normales Schülergerät (ohne Flag): nur Spiel 1
    const n = await neueSeite({ b: 360, h: 740, ohneFlag: true });
    await zumHub(n);
    const karten = await n.locator(".sp-karte").evaluateAll((els) => els.map((e) => e.dataset.spiel));
    pruefe("Schüler ohne Flag sieht Spiel 1, aber NICHT Spiel 2", karten.length === 1 && karten[0] === "ampel", karten.join(","));
    pruefe("Schüler ohne Flag: keine Vorschau-Marke auf der Startseite", (await n.locator(".sp-karte-marke").count()) === 0);
    await n.evaluate(() => go({ drawer: "spiele", spiel: "tempo" }));
    await n.waitForSelector(".sp-karte", { timeout: 8000 });
    await n.waitForTimeout(600);
    pruefe("direkt aufgerufenes Spiel 2 öffnet für normale Schüler NICHT (Startseite statt Spiel)", (await n.locator(".sp-t-pad").count()) === 0 && (await n.locator(".sp-karte").count()) === 1);
    await n.evaluate(() => go({ drawer: "spiele", spiel: "ampel" }));
    await n.waitForSelector(".sp-knopf", { timeout: 8000 });
    pruefe("Spiel 1 lässt sich weiterhin direkt öffnen", (await n.locator(".sp-knopf").count()) === 1);
    pruefe("keine Konsolenfehler (Freigabe)", n.fehler.length === 0, n.fehler.join(" | "));
    await n.context().close();
  }
  { // ?spiele=1 in der Adresse: Vorschau-Gerät
    const n = await neueSeite({ b: 360, h: 740, ohneFlag: true, suche: "?spiele=1" });
    await zumHub(n);
    const karten = await n.locator(".sp-karte").evaluateAll((els) => els.map((e) => e.dataset.spiel));
    pruefe("Gerät mit ?spiele=1 sieht beide Spiele", karten.join(",") === "ampel,tempo", karten.join(","));
    pruefe("Vorschau-Marke nur auf Spiel 2", (await n.locator(".sp-karte-marke").count()) === 1 && (await n.locator('.sp-karte[data-spiel="tempo"] .sp-karte-marke').count()) === 1 && (await n.locator('.sp-karte[data-spiel="ampel"] .sp-karte-marke').count()) === 0);
    await n.waitForFunction(() => /Noch nicht gespielt/.test(document.querySelector('[data-best="tempo"]')?.textContent || ""));
    await n.tap('.sp-karte[data-spiel="tempo"]');
    await n.waitForSelector(".sp-t-pad");
    pruefe("Spiel 2 öffnet auf dem Vorschau-Gerät", (await padText(n)) === "Start");
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
  pruefe("Lernphase beginnt bei 50 km/h, Schild 80 im Blick", (await s.textContent(".sp-t-meldung")).includes("Erlaubt: 80 km/h") && (await s.getAttribute("[data-aktuell] svg", "aria-label")).includes("274") && (await s.getAttribute("[data-aktuell] svg", "aria-label")).includes("80 km/h"));
  const v1 = await zahlJetzt(s);
  pruefe("Tacho beim Start im Bereich 40–50 (rollt ohne Tippen)", v1 >= 38 && v1 <= 50, "v=" + v1);
  await botStarten(s, { lernen: "halten", takt: 80 });
  const proben = []; let blitzerGesehen = false, ankuendigungen = new Set(), schilder = new Set(), padWorte = new Set();
  let layoutLern = false, bildLern = false, bildAnk = false, letztesSchild = null, schildSeit = Date.now();
  while (!(await s.locator(".sp-t-pad.spurt").count()) && Date.now() - tLauf < 36000) {
    const info = await s.evaluate(() => ({
      v: +document.querySelector(".sp-t-zahl").textContent, m: document.querySelector(".sp-t-meldung").textContent.trim(), warn: document.querySelector(".sp-t-meldung").classList.contains("warn"),
      l: (/(\d+) km\/h/.exec(document.querySelector("[data-aktuell] svg")?.getAttribute("aria-label") || "") || [])[1], gesperrt: !!document.querySelector(".sp-t-pad.gesperrt"),
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
  pruefe("Endspurt: Meldung ENDSPURT, Schild Zeichen 282, Pad goldfarben (Klasse spurt)", (await s.textContent(".sp-t-meldung")).includes("ENDSPURT") && (await s.getAttribute("[data-aktuell] svg", "aria-label")).includes("282"));
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
      aria: document.querySelector("[data-aktuell] svg")?.getAttribute("aria-label") || "",
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

try {
  if (!nurTempo) await bisherige();
  await tempoPruefungen();
} finally {
  await browser.close();
  server.close();
}
console.log("\n" + bestanden + " Prüfungen bestanden" + (befunde.length ? ", " + befunde.length + " FEHLER:\n - " + befunde.join("\n - ") : ""));
