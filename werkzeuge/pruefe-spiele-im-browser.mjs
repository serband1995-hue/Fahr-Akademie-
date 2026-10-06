// Browser-Prüfung des Spiele-Bereichs (06.10.2026): echte App in einem echten (Chromium-)Browser, mit Fingertipp.
//   - Die App läuft aus diesem Ordner, alle Server-Aufrufe der App werden abgefangen:
//     academy-spiele beantwortet die ECHTE Function-Datei gegen eine Datenbank im Speicher
//     (werkzeuge/edge-functions/spiele-im-speicher.mjs), alles andere bekommt leere Standardantworten.
//   - Geprüft: Menü, Startseite, Spiel, Fehlstart, Ergebnis + Rechnung, Tempo-Wechsel, Bestenliste,
//     Ausblenden, Verlassen mitten in der Runde, Handy hoch/quer, alle 18 Sprachen (nichts abgeschnitten,
//     nichts seitlich wischbar, Tippflächen >= 44 px, RTL), keine Fehler in der Konsole.
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-spiele-im-browser.mjs
//   (Playwright liegt global: PLAYWRIGHT_PFAD=/opt/node22/lib/node_modules; Browser: PLAYWRIGHT_BROWSERS_PATH)
// Bilder landen in $SPIELE_BILDER (Standard: ./spiele-bilder, nicht einchecken).
import http from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { db, rufe, jetzt } from "./edge-functions/spiele-im-speicher.mjs";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire((process.env.PLAYWRIGHT_PFAD || "/opt/node22/lib/node_modules") + "/")("playwright");
const bilder = process.env.SPIELE_BILDER || join(process.cwd(), "spiele-bilder");
mkdirSync(bilder, { recursive: true });

// ---- Datenbank im Speicher: ein Testschüler + Mitspieler ----
const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
const schueler = (id, name, extra) => db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null, ...extra });
schueler("t", "Serban Dumitrescu");
db.academy_sessions.push({ session_token: "tok-t", schueler_id: "t", expires_at: inEinemJahr });
[["m1", "Mira Kaya", 231], ["m2", "Jonas Weber", 262], ["m3", "Ali Reza Karimi", 305], ["m4", "Ayşe Yılmaz", 340]].forEach(([id, n, w]) => {
  schueler(id, n);
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "ampel", wert: w, erreicht_am: jetzt(), versuche: 3 });
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
      if (!d.ohneFlag) localStorage.setItem("spiele_vorschau", "1");
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
  await seite.goto(basis + "/index.html");
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
    document.querySelectorAll(".sp-tempo-knopf,.sp-schalter,.sp-knopf,.sp-karte").forEach((el) => {
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

try {
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
} finally {
  await browser.close();
  server.close();
}
console.log("\n" + bestanden + " Prüfungen bestanden" + (befunde.length ? ", " + befunde.length + " FEHLER:\n - " + befunde.join("\n - ") : ""));
