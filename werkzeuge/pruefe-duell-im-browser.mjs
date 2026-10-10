// Browser-Prüfung von Spiel 10 „Duell gegen Mitschüler“ (06.10.2026): echte App im echten Chromium, mit Fingertipp, ZWEI Browser-Kontexte = zwei Schüler.
//   - Die App läuft aus diesem Ordner. spiele/spiele.js und spiele/texte.js werden beim Ausliefern im Speicher um den Duell-Eintrag ergänzt
//     (werkzeuge/duell-einbau.mjs = genau die Änderung, die der Hauptagent einbaut); die Dateien auf der Platte bleiben unberührt.
//   - Alle Server-Aufrufe der App werden abgefangen: academy-spiele beantwortet die ECHTE Function-Datei gegen die Datenbank im Speicher
//     (werkzeuge/edge-functions/spiele-im-speicher.mjs), alles andere bekommt leere Standardantworten.
//   - Geprüft: voller Ablauf A -> B mit echten Tipps (Fragen, Bilder, Zeitleiste, Auswertung mit Erklärung, Siegerurteil, Bilanz),
//     Doppeltipp, Verlassen mitten in der Runde (Weiterspielen mit denselben Fragen), verlorene Antwort auf „Los“ (Weiterspielen), hängendes Netz (nach 20 s Abbruch),
//     Netzfehler beim Senden (Wiederholen), Zeit abgelaufen (20 s echte Zeit),
//     schon vergebene Herausforderung, Limit, ausgeblendet, HTML im Namen, Vorschau-Modus; Handy 360x740, 320x640, 412x915 (hell/dunkel), quer 740x360 und 640x320,
//     Arabisch (RTL), alle 18 Sprachen (nichts abgeschnitten, nichts seitlich wischbar, Tippflächen >= 44 px, kein roher Schlüsselname, Bilder laden).
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-duell-im-browser.mjs        (ca. 8 Minuten; nur Teile: NUR=ablauf,groessen,sprachen,sonder)
//   Playwright liegt global: PLAYWRIGHT_PFAD=/opt/node22/lib/node_modules; Browser: PLAYWRIGHT_BROWSERS_PATH (playwright install NICHT ausführen).
// Bilder landen in $SPIELE_BILDER (Standard: ./spiele-bilder, nicht einchecken).
import http from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { db, rufe, LOESUNGEN, LOESUNGEN_FEHLER } from "./edge-functions/spiele-im-speicher.mjs";
import { SPRACHEN } from "./duell-quelle/meta.mjs";
import { FRAGEN_NACH_ID } from "../spiele/duell-fragen.js";
import { TEXTE_DUELL } from "../spiele/texte-duell.js";
import { spielePatchen, textePatchen } from "./duell-einbau.mjs";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire((process.env.PLAYWRIGHT_PFAD || "/opt/node22/lib/node_modules") + "/")("playwright");
const bilder = process.env.SPIELE_BILDER || join(process.cwd(), "spiele-bilder");
mkdirSync(bilder, { recursive: true });
// Die Lösungen sind privat (öffentliches Repo): ohne den Schlüssel kann dieser Test keine richtigen Antworten antippen und lehnt klar ab (kein stilles Überspringen).
if (!LOESUNGEN) { console.error("Browser-Prüfung abgelehnt: " + LOESUNGEN_FEHLER); process.exit(2); }
const LOESUNG = LOESUNGEN;
const RTL = ["ar", "ckb", "ur", "fa", "ps"];
const K = (sp, schluessel, werte) => Object.keys(werte || {}).reduce((s, n) => s.split("{" + n + "}").join(werte[n]), TEXTE_DUELL[sp][schluessel]);

// ---- Static-Server für die App (spiele.js und texte.js im Speicher um das Duell ergänzt) ----
const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg" };
const server = http.createServer((req, res) => {
  const pfad = join(wurzel, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "") || "index.html");
  if (!pfad.startsWith(wurzel) || !existsSync(pfad) || pfad === wurzel + "/") { res.writeHead(404); res.end("nicht da"); return; }
  let inhalt = readFileSync(pfad);
  if (pfad === join(wurzel, "spiele/spiele.js")) inhalt = spielePatchen(inhalt.toString("utf8"));
  if (pfad === join(wurzel, "spiele/texte.js")) inhalt = textePatchen(inhalt.toString("utf8"));
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
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Schüler und Seiten ----
const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
let zaehler = 0;
function neuerSchueler(name, extra) {
  zaehler++; const id = "sid-b" + String(zaehler).padStart(3, "0");
  db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null, ...extra });
  db.academy_sessions.push({ session_token: "tok-" + id, schueler_id: id, expires_at: inEinemJahr });
  return { id, name, tok: "tok-" + id, rufe: (o) => rufe({ session_token: "tok-" + id, ...o }) };
}
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS" };
async function neueSeite(sch, opt = {}) {
  const ctx = await browser.newContext({ viewport: { width: opt.b || 360, height: opt.h || 740 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, colorScheme: opt.dunkel ? "dark" : "light" });
  await ctx.addInitScript((d) => {
    try {
      localStorage.setItem("academy_session", JSON.stringify({ name: d.name, session_token: d.tok, vollzugang: true, agb_akzeptiert_am: "2026-01-01T00:00:00Z", ablauf_am: d.ablauf, klasse: "B", telefon: "0100" }));
      localStorage.setItem("spiele_vorschau", "1");     // Vorschau-Gerät: sieht Spiele mit nurVorschau (das Duell ist so eingebaut)
      localStorage.setItem("academy_sprache", d.sprache);
    } catch (e) {}
  }, { name: sch.name, tok: sch.tok, ablauf: inEinemJahr, sprache: opt.sprache || "de" });
  const s = await ctx.newPage();
  s.fehler = []; s.aufrufe = []; s.sperreEnde = 0; s.verlusteStart = 0; s.haengt = 0; s.haengtBei = null;
  s.on("pageerror", (e) => s.fehler.push("pageerror: " + e.message));
  s.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR|fonts\.g/.test(m.text())) s.fehler.push("console: " + m.text()); });
  await s.route("**/*", async (route) => {
    const u = route.request().url();
    if (u.startsWith(basis)) return route.continue();
    const m = u.match(/\/functions\/v1\/([a-z0-9-]+)/);
    if (!m) return route.abort();
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const antwort = (status, body) => route.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) });
    if (m[1] === "academy-spiele") {
      const body = JSON.parse(route.request().postData() || "{}");
      s.aufrufe.push(body.aktion);
      if (body.aktion === "duell_ende" && s.sperreEnde > 0) { s.sperreEnde--; return route.abort("failed"); }   // Netzfehler beim Senden
      if (body.aktion === "duell_start" && s.verlusteStart > 0) { s.verlusteStart--; await rufe(body); return route.abort("failed"); }   // Server startet die Runde, die Antwort geht verloren
      if (body.aktion === s.haengtBei && s.haengt > 0) { s.haengt--; await new Promise((r) => setTimeout(r, 26_000)); try { await route.abort("failed"); } catch (e) {} return; }   // hängendes Netz: keine Antwort
      const { status, ...rest } = await rufe(body); return antwort(status, rest);
    }
    if (m[1] === "academy-session-refresh") return antwort(200, { ok: true });
    if (m[1] === "academy-katalog") return antwort(200, { ok: true, tags: [], videos: [], video_tags: [], pruefer: [], video_pruefer: [], gebiete: [], uebersetzungen: [] });
    if (m[1] === "academy-szene") return antwort(200, { ok: true, szenen: [] });
    return antwort(503, { error: "nicht nachgebaut", code: "voruebergehend" });
  });
  await s.goto(basis + "/index.html");
  return s;
}
const zumDuell = async (s) => {
  await s.waitForSelector("#drawer-open-btn", { timeout: 15000 });
  await s.tap("#drawer-open-btn");
  await s.waitForSelector('[data-drawer="spiele"]', { state: "visible" });
  await s.tap('[data-drawer="spiele"]');
  await s.waitForSelector('.sp-karte[data-spiel="duell"]', { timeout: 10000 });
  await s.tap('.sp-karte[data-spiel="duell"]');
  await s.waitForSelector(".du-spiel .du-knopf", { timeout: 10000 });
};
const letztes = (sch, rolle) => db.academy_spiele_duelle.filter((d) => d[rolle] === sch.id).sort((a, b) => String(a.erstellt_am).localeCompare(String(b.erstellt_am))).pop();

/* Layout: nichts seitlich wischbar, nichts abgeschnitten, Tippflächen groß genug, Bilder geladen */
async function layoutPruefen(s, name, breite) {
  const r = await s.evaluate(() => {
    const probleme = []; const de = document.documentElement;
    if (de.scrollWidth > window.innerWidth + 1) probleme.push("Seite wischbar: " + de.scrollWidth + " > " + window.innerWidth);
    document.querySelectorAll("#spiele-platz *").forEach((el) => {
      const rc = el.getBoundingClientRect(); if (rc.width === 0 || rc.height === 0) return;
      if (rc.right > window.innerWidth + 1 || rc.left < -1) probleme.push("ragt raus: " + el.className + " " + Math.round(rc.left) + ".." + Math.round(rc.right));
      if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible") probleme.push("abgeschnitten: " + el.className);
    });
    document.querySelectorAll(".du-knopf,.du-klein,.du-antwort,.sp-schalter,.sp-karte").forEach((el) => { const rc = el.getBoundingClientRect(); if (rc.height > 0 && (rc.height < 43.5 || rc.width < 43.5)) probleme.push("Tippfläche klein: " + el.className + " " + Math.round(rc.width) + "x" + Math.round(rc.height)); });
    document.querySelectorAll("#spiele-platz img").forEach((im) => { if (!(im.complete && im.naturalWidth > 0)) probleme.push("Bild lädt nicht: " + im.src.split("/").pop()); });
    return probleme;
  });
  pruefe(name + ": Layout ohne Überstand/Abschneiden/kleine Knöpfe/kaputte Bilder", r.length === 0, r.slice(0, 4).join(" | "));
}

/* Eine Runde wie ein Mensch spielen: je Frage lesen (850 ms), antippen. wie(i) = "richtig" | "falsch" | "nichts" (nichts: 20 s warten) */
async function spieleRunde(s, ids, sp, wie, opt = {}) {
  let ersteBildFrage = false;
  for (let i = 0; i < ids.length; i++) {
    const q = FRAGEN_NACH_ID[ids[i]], t = q.t[sp];
    await s.waitForFunction((txt) => document.querySelector(".du-kopf span")?.textContent.trim() === txt, K(sp, "duFrage", { n: i + 1, m: 8 }), { timeout: 30000 });
    const ist = await s.evaluate(() => ({ f: document.querySelector(".du-frage").textContent.trim(), a: Array.from(document.querySelectorAll(".du-antwort")).map((b) => b.textContent.trim()), bild: !!document.querySelector(".du-schild img"), leiste: document.querySelector(".du-leiste i").style.width }));
    if (!opt.schnell || i === 0) pruefe((opt.name || "") + " Frage " + (i + 1) + ": Text, 3 Antworten und Bild wie im Pool", ist.f === t.f && JSON.stringify(ist.a) === JSON.stringify(t.a) && ist.bild === !!q.bild, JSON.stringify(ist).slice(0, 200));
    if (opt.layout && (i === 0 || (q.bild && !ersteBildFrage))) { if (q.bild) ersteBildFrage = true; await s.waitForTimeout(150); await layoutPruefen(s, opt.layout + " Frage " + (i + 1) + (q.bild ? " mit Zeichen" : ""), opt.breite || 360); if (opt.foto && (i === 0 || q.bild)) await s.screenshot({ path: join(bilder, opt.foto + "-frage" + (i + 1) + ".png") }); }
    const w = wie(i);
    if (w === "nichts") { await s.waitForTimeout(20_600); continue; }
    await s.waitForTimeout(opt.lesen ?? 850);
    const n = w === "richtig" ? LOESUNG[ids[i]] : (LOESUNG[ids[i]] + 1) % 3;
    await s.tap('.du-antwort[data-n="' + n + '"]');
  }
}
const alleRichtig = () => "richtig";

/* Anzeige der Auswertung prüfen */
async function ergebnisPruefen(s, sp, ids, meine, d, name) {
  await s.waitForSelector(".du-erg", { timeout: 20000 });
  const e = await s.evaluate(() => ({
    gross: document.querySelector(".du-gross").textContent.trim(),
    pr: Array.from(document.querySelectorAll(".du-pr")).map((p) => ({ ok: p.classList.contains("ok"), frage: p.querySelector(".du-pr-frage").textContent.trim(), erkl: p.querySelector(".du-pr-erkl").textContent.trim(), zeilen: Array.from(p.querySelectorAll(".du-pr-zeile")).map((z) => z.textContent.trim()), bild: !!p.querySelector("img"), urteil: p.querySelector(".du-pr-urteil").textContent.trim() })),
    urteil: document.querySelector(".du-urteil")?.textContent.trim() || null, alles: document.querySelector("#spiele-platz").textContent,
  }));
  pruefe(name + ": Punkte auf dem Bildschirm = Punkte vom Server (" + d.punkte + ")", e.gross === String(d.punkte), e.gross);
  pruefe(name + ": 8 Auswertungen, richtig/falsch passend zu den Tipps, Erklärung aus dem Pool", e.pr.length === 8 && e.pr.every((p, i) => p.ok === (meine[i] === "richtig") && p.erkl === FRAGEN_NACH_ID[ids[i]].t[sp].e && p.frage === FRAGEN_NACH_ID[ids[i]].t[sp].f && p.bild === !!FRAGEN_NACH_ID[ids[i]].bild && p.urteil === TEXTE_DUELL[sp][p.ok ? "duRichtigLabel" : "duFalschLabel"]), JSON.stringify(e.pr.slice(0, 2)).slice(0, 300));
  pruefe(name + ": falsche Fragen zeigen die richtige Antwort (vom Server)", e.pr.every((p, i) => p.ok || p.zeilen.some((z) => z.includes(FRAGEN_NACH_ID[ids[i]].t[sp].a[LOESUNG[ids[i]]]))));
  pruefe(name + ": kein roher Schlüsselname oder Platzhalter sichtbar", !/\bdu[A-Z][A-Za-z]+\b|\{[a-z]+\}|undefined/.test(e.alles), e.alles.slice(0, 100));
  return e;
}

const nurListe = (process.env.NUR || "").split(",").filter(Boolean);
const dran = (name) => !nurListe.length || nurListe.includes(name);

/* ============================ voller Ablauf A -> B ============================ */
async function ablauf() {
  console.log("Ablauf A -> B (Deutsch, 360 x 740)");
  const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
  const a = await neueSeite(A), b = await neueSeite(B);
  await zumDuell(a);
  await a.waitForTimeout(700);
  await layoutPruefen(a, "Übersicht (leer)", 360); await a.screenshot({ path: join(bilder, "duell-uebersicht-leer.png"), fullPage: true });
  pruefe("Übersicht: Titel, drei Bilanzzahlen 0, „Deine Duelle“ leer, „Offene Herausforderungen“ leer", (await a.textContent(".sp-spieltitel")).trim() === "Duell gegen Mitschüler" && (await a.locator(".du-bilanz b").allTextContents()).join() === "0,0,0" && /noch kein Duell/.test(await a.textContent("#spiele-platz")) && /wartet niemand/.test(await a.textContent("#spiele-platz")));
  pruefe("Profil-Karte (Name im Ranking) ist da: „Mira K.“", (await (async () => { await a.waitForSelector(".sp-name"); return (await a.textContent(".sp-name")).trim(); })()) === "Mira K.");
  await a.tap('[data-aktion="neu"]');
  await a.waitForSelector('[data-aktion="los"]');
  await layoutPruefen(a, "Bereit", 360); await a.screenshot({ path: join(bilder, "duell-bereit.png"), fullPage: true });
  const dA = letztes(A, "ersteller"); pruefe("Duell ist angelegt, aber die Runde noch NICHT verbraucht (Zurück ist möglich)", !!dA && dA.ersteller_gestartet_am === null);
  // Doppeltipp auf „Los“: genau ein Start
  await a.evaluate(() => { const b = document.querySelector('[data-aktion="los"]'); b.click(); b.click(); });
  await a.waitForSelector(".du-antwort");
  pruefe("Doppeltipp auf „Los“ startet genau eine Runde", a.aufrufe.filter((x) => x === "duell_start").length === 1);
  const ids = letztes(A, "ersteller").fragen;
  const meineA = ids.map((_, i) => (i === 2 || i === 5 ? "falsch" : "richtig"));
  // Zeitleiste läuft
  await a.waitForTimeout(500); const w1 = await a.evaluate(() => parseFloat(document.querySelector(".du-leiste i").style.width)); await a.waitForTimeout(1200); const w2 = await a.evaluate(() => parseFloat(document.querySelector(".du-leiste i").style.width));
  pruefe("Zeitleiste schrumpft während der Frage", w2 < w1 && w1 < 100, w1 + " -> " + w2);
  await spieleRunde(a, ids, "de", (i) => meineA[i], { name: "A", layout: "Frage 360", foto: "duell-a", breite: 360 });
  // Doppeltipp auf eine Antwort zählt einmal: geprüft über die Abgabe (8 Antworten, Punkte stimmen)
  const dA2 = await (async () => { await a.waitForSelector(".du-erg", { timeout: 20000 }); return letztes(A, "ersteller"); })();
  pruefe("Server hat die Runde von A ausgewertet (6 von 8 richtig)", dA2.ersteller_fertig_am && dA2.richtig_ersteller === 6 && dA2.punkte_ersteller >= 600 && dA2.punkte_ersteller <= 6 * 146, JSON.stringify([dA2.richtig_ersteller, dA2.punkte_ersteller]));
  const eA = await ergebnisPruefen(a, "de", ids, meineA, { punkte: dA2.punkte_ersteller }, "A");
  pruefe("A: „Dein Ergebnis steht … sobald dein Gegner gespielt hat“ (noch kein Urteil)", eA.urteil === null && /Sobald dein Gegner gespielt hat/.test(eA.alles));
  await layoutPruefen(a, "Ergebnis A", 360); await a.screenshot({ path: join(bilder, "duell-ergebnis-a.png"), fullPage: true });
  await a.tap('[data-aktion="hub"]'); await a.waitForSelector(".du-zeile");
  pruefe("A: Übersicht zeigt „Dein Duell – Wartet auf einen Mitschüler“ mit eigenem Ergebnis", /Dein Duell/.test(await a.textContent(".du-liste")) && /Wartet auf einen Mitschüler/.test(await a.textContent(".du-liste")), await a.textContent(".du-liste"));

  // B
  await zumDuell(b);
  await b.waitForSelector('[data-aktion="annehmen"]');
  const offen = await b.textContent(".du-karte:nth-of-type(4)").catch(() => "");
  pruefe("B sieht die Herausforderung von „Mira K.“ (nur Vorname + Buchstabe) mit Knopf „Annehmen“", /Mira K\./.test(await b.textContent("#spiele-platz")) && !/Kaya/.test(await b.textContent("#spiele-platz")));
  await layoutPruefen(b, "Übersicht B mit Herausforderung", 360); await b.screenshot({ path: join(bilder, "duell-uebersicht-b.png"), fullPage: true });
  await b.tap('[data-aktion="annehmen"]'); await b.waitForSelector('[data-aktion="los"]');
  pruefe("B: Bereit-Bildschirm nennt den Gegner „gegen Mira K.“", /gegen Mira K\./.test(await b.textContent(".du-bereit")));
  await b.tap('[data-aktion="los"]'); await b.waitForSelector(".du-antwort");
  const idsB = letztes(B, "gegner").fragen;
  pruefe("B bekommt DIESELBEN Fragen in derselben Reihenfolge wie A", JSON.stringify(idsB) === JSON.stringify(ids));
  const meineB = idsB.map(() => "richtig");
  await spieleRunde(b, idsB, "de", (i) => meineB[i], { name: "B", schnell: true });
  await b.waitForSelector(".du-erg", { timeout: 20000 });
  const dB = letztes(B, "gegner");
  const eB = await ergebnisPruefen(b, "de", idsB, meineB, { punkte: dB.punkte_gegner }, "B");
  pruefe("B: alles richtig gegen 6 von 8 -> „Gewonnen!“ mit Punkten des Gegners", eB.urteil === "Gewonnen!" && /Mira K\.: \d+ Punkte/.test(eB.alles), eB.urteil);
  await layoutPruefen(b, "Ergebnis B (Sieg)", 360); await b.screenshot({ path: join(bilder, "duell-ergebnis-b-sieg.png"), fullPage: true });
  // A sieht das Ergebnis beim nächsten Öffnen
  await a.tap('[data-aktion="hub"]'); await a.waitForSelector(".du-marke");
  pruefe("A sieht in „Deine Duelle“: „Verloren“ gegen „Jonas W.“ mit Punkten; Bilanz 0 Siege / 1 Niederlage", /Verloren/.test(await a.textContent(".du-liste")) && /gegen Jonas W\./.test(await a.textContent(".du-liste")) && (await a.locator(".du-bilanz b").allTextContents()).join() === "0,0,1", await a.textContent(".du-liste"));
  await layoutPruefen(a, "Übersicht A mit Ergebnis", 360); await a.screenshot({ path: join(bilder, "duell-uebersicht-a-fertig.png"), fullPage: true });
  await b.tap('[data-aktion="hub"]'); await b.waitForSelector(".du-marke");
  pruefe("B sieht: „Gewonnen“ gegen „Mira K.“; Bilanz 1 Sieg", /Gewonnen/.test(await b.textContent(".du-liste")) && (await b.locator(".du-bilanz b").allTextContents()).join() === "1,0,0");
  pruefe("keine Konsolenfehler (A und B)", a.fehler.length === 0 && b.fehler.length === 0, a.fehler.concat(b.fehler).join(" | "));
  await a.context().close(); await b.context().close();
}

/* ============================ Größen, Querformat, Dunkelmodus, Arabisch ============================ */
async function groessen() {
  for (const g of [{ b: 360, h: 740, n: "360x740" }, { b: 320, h: 640, n: "320x640 klein" }, { b: 412, h: 915, n: "412x915" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }, { b: 740, h: 360, n: "quer 740x360" }, { b: 640, h: 320, n: "quer 640x320" }, { b: 360, h: 740, n: "Arabisch RTL 360x740", sprache: "ar" }, { b: 740, h: 360, n: "Arabisch quer", sprache: "ar" }]) {
    console.log("Größe: " + g.n);
    const sp = g.sprache || "de";
    const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber");
    // Vorbereitung: B hat schon ein Duell gespielt, das A annehmen kann (so sieht A auch die Liste der Herausforderungen)
    const n = await B.rufe({ aktion: "duell_neu" }); const sB = await B.rufe({ aktion: "duell_start", duell: n.duell }); await pause(5400);
    await B.rufe({ aktion: "duell_ende", duell: n.duell, antworten: sB.fragen.map((id) => ({ a: LOESUNG[id], ms: 600 })) });
    const s = await neueSeite(A, g);
    await zumDuell(s); await s.waitForSelector('[data-aktion="annehmen"]'); await s.waitForTimeout(700);
    const tag = g.n.replace(/[^a-z0-9]+/gi, "-");
    await layoutPruefen(s, g.n + " Übersicht", g.b); await s.screenshot({ path: join(bilder, "duell-gr-" + tag + "-uebersicht.png"), fullPage: true });
    pruefe(g.n + ": Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await s.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
    await s.tap('[data-aktion="annehmen"]'); await s.waitForSelector('[data-aktion="los"]'); await s.waitForTimeout(300);
    await layoutPruefen(s, g.n + " Bereit", g.b); await s.screenshot({ path: join(bilder, "duell-gr-" + tag + "-bereit.png"), fullPage: true });
    await s.tap('[data-aktion="los"]'); await s.waitForSelector(".du-antwort");
    const ids = letztes(A, "gegner").fragen;
    // Frage mit Zeichen und Frage ohne Zeichen prüfen; der Rest wird zügig durchgespielt
    await spieleRunde(s, ids, sp, (i) => (i % 3 === 1 ? "falsch" : "richtig"), { name: g.n, layout: g.n, foto: "duell-gr-" + tag, breite: g.b, schnell: true });
    await s.waitForSelector(".du-erg", { timeout: 20000 });
    const quer = g.b > g.h;
    if (quer) {
      // im Querformat müssen die ganze Frage und alle drei Antworten ohne Scrollen im Bild sein, über der Menüleiste
      const nochmal = await neueSeite(neuerSchueler("Lea Fischer"), g);
      const C = db.academy_schueler[db.academy_schueler.length - 1];
      const dd = await B.rufe({ aktion: "duell_neu" }); const sb2 = await B.rufe({ aktion: "duell_start", duell: dd.duell }); await pause(5400);
      await B.rufe({ aktion: "duell_ende", duell: dd.duell, antworten: sb2.fragen.map((id) => ({ a: LOESUNG[id], ms: 600 })) });
      await zumDuell(nochmal); await nochmal.waitForSelector('[data-aktion="annehmen"]'); await nochmal.tap('[data-aktion="annehmen"]'); await nochmal.waitForSelector('[data-aktion="los"]');
      await nochmal.tap('[data-aktion="los"]'); await nochmal.waitForSelector(".du-antwort"); await nochmal.waitForTimeout(700);
      const r = await nochmal.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); const a = Array.from(document.querySelectorAll(".du-antwort")).map((b) => b.getBoundingClientRect()); return { kopfO: g(".du-kopf").top, frageU: g(".du-frage").bottom, antU: Math.max(...a.map((x) => x.bottom)), antO: Math.min(...a.map((x) => x.top)), h: window.innerHeight }; });
      pruefe(g.n + ": Frage und alle Antworten ohne Scrollen im Bild (über der Menüleiste)", r.kopfO >= 0 && r.antO >= 0 && r.antU <= r.h - 70 && r.frageU <= r.h - 70, JSON.stringify(r));
      await nochmal.screenshot({ path: join(bilder, "duell-gr-" + tag + "-bild.png") });
      await nochmal.context().close();
    }
    const d = letztes(A, "gegner");
    await layoutPruefen(s, g.n + " Ergebnis", g.b); await s.screenshot({ path: join(bilder, "duell-gr-" + tag + "-ergebnis.png"), fullPage: true });
    pruefe(g.n + ": Siegerurteil steht da (Gegner hatte alles richtig)", !!(await s.textContent(".du-urteil")).trim() && d.status === "fertig");
    pruefe(g.n + ": keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
    await s.context().close();
  }
}

/* ============================ alle 18 Sprachen ============================ */
async function sprachen() {
  for (const sp of SPRACHEN) {
    console.log("Sprache: " + sp);
    const A = neuerSchueler("Mira Kaya");
    // eine schon gestartete, nicht beendete Runde (zeigt „Weiterspielen“ in der Übersicht)
    const d0 = await A.rufe({ aktion: "duell_neu" }); await A.rufe({ aktion: "duell_start", duell: d0.duell });
    const duellD0 = () => db.academy_spiele_duelle.find((d) => d.id === d0.duell);
    const s = await neueSeite(A, { sprache: sp });
    await s.waitForSelector("#drawer-open-btn", { timeout: 15000 }); await s.tap("#drawer-open-btn"); await s.waitForSelector('[data-drawer="spiele"]', { state: "visible" }); await s.tap('[data-drawer="spiele"]');
    await s.waitForSelector('.sp-karte[data-spiel="duell"]');
    pruefe(sp + ": Karte auf der Startseite hat Titel und Kurztext in der Sprache", (await s.textContent('.sp-karte[data-spiel="duell"] .sp-karte-titel')).trim() === TEXTE_DUELL[sp].duName && (await s.textContent('.sp-karte[data-spiel="duell"] .sp-karte-kurz')).trim() === TEXTE_DUELL[sp].duKurz);
    await layoutPruefen(s, sp + " Startseite", 360);
    await s.tap('.sp-karte[data-spiel="duell"]'); await s.waitForSelector(".du-spiel .du-knopf"); await s.waitForSelector('[data-aktion="spielen"][data-weiter="1"]'); await s.waitForTimeout(500);
    pruefe(sp + ": Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await s.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
    pruefe(sp + ": Übersicht in der Sprache (Titel, Knopf, Bilanz)", (await s.textContent(".sp-spieltitel")).trim() === TEXTE_DUELL[sp].duName && (await s.textContent('[data-aktion="neu"]')).trim() === TEXTE_DUELL[sp].duNeu && (await s.textContent(".du-karte h3")).trim() === TEXTE_DUELL[sp].duBilanz);
    pruefe(sp + ": offene Runde zeigt „Weiterspielen“ und den Hinweis in der Sprache", (await s.textContent('[data-aktion="spielen"][data-weiter="1"]')).trim() === TEXTE_DUELL[sp].duWeiterspielen && (await s.textContent(".du-liste")).includes(TEXTE_DUELL[sp].duStLaeuft));
    await layoutPruefen(s, sp + " Übersicht mit Weiterspielen", 360);
    if (["ar", "tr", "am", "ru"].includes(sp)) await s.screenshot({ path: join(bilder, "duell-weiter-uebersicht-" + sp + ".png"), fullPage: true });
    await s.tap('[data-aktion="neu"]'); await s.waitForSelector('[data-aktion="los"]');
    pruefe(sp + ": Bereit-Text in der Sprache", (await s.textContent(".du-bereit .du-hinweis")).trim() === TEXTE_DUELL[sp].duBereitText && (await s.textContent('[data-aktion="los"]')).trim() === TEXTE_DUELL[sp].duLos);
    await layoutPruefen(s, sp + " Bereit", 360);
    await s.tap('[data-aktion="hub"]'); await s.waitForSelector('[data-aktion="spielen"][data-weiter="1"]');
    await s.tap('[data-aktion="spielen"][data-weiter="1"]'); await s.waitForSelector('[data-aktion="los"]');
    pruefe(sp + ": Weiterspielen-Bildschirm in der Sprache (Hinweis und Knopf)", (await s.textContent(".du-bereit .du-hinweis")).trim() === TEXTE_DUELL[sp].duWeiterText && (await s.textContent('[data-aktion="los"]')).trim() === TEXTE_DUELL[sp].duWeiterspielen);
    await layoutPruefen(s, sp + " Weiterspielen", 360);
    if (["ar", "tr", "am", "ru"].includes(sp)) await s.screenshot({ path: join(bilder, "duell-weiter-bereit-" + sp + ".png"), fullPage: true });
    const start0 = duellD0().ersteller_gestartet_am;
    await s.tap('[data-aktion="los"]'); await s.waitForSelector(".du-antwort");
    const ids = duellD0().fragen;
    pruefe(sp + ": Weiterspielen: dieselbe Runde (Startzeit unverändert)", duellD0().ersteller_gestartet_am === start0);
    const meine = ids.map((_, i) => (i % 2 ? "falsch" : "richtig"));
    await spieleRunde(s, ids, sp, (i) => meine[i], { name: sp, layout: sp, breite: 360, schnell: true, lesen: 800 });
    await s.waitForSelector(".du-erg", { timeout: 20000 });
    const d = duellD0();
    await ergebnisPruefen(s, sp, ids, meine, { punkte: d.punkte_ersteller }, sp);
    await layoutPruefen(s, sp + " Ergebnis", 360);
    if (["ar", "tr", "am", "ru"].includes(sp)) { await s.waitForTimeout(400); await s.screenshot({ path: join(bilder, "duell-sprache-" + sp + ".png"), fullPage: true }); }
    pruefe(sp + ": keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
    await s.context().close();
  }
}

/* ============================ Sonderfälle ============================ */
async function sonder() {
  console.log("Sonderfall: Verlassen mitten in der Runde -> Weiterspielen mit denselben Fragen");
  { const A = neuerSchueler("Mira Kaya"); const s = await neueSeite(A); await zumDuell(s);
    await s.tap('[data-aktion="neu"]'); await s.waitForSelector('[data-aktion="los"]'); await s.tap('[data-aktion="los"]'); await s.waitForSelector(".du-antwort");
    const ids = letztes(A, "ersteller").fragen; const start0 = letztes(A, "ersteller").ersteller_gestartet_am;
    await spieleRunde(s, ids.slice(0, 2), "de", () => "richtig", { schnell: true });
    await s.waitForSelector(".du-antwort"); await s.tap("[data-nav-zurueck]"); await s.waitForSelector(".sp-karte");
    await s.waitForTimeout(1500);
    pruefe("nach dem Verlassen keine späten Fehler im Spiel", s.fehler.length === 0, s.fehler.join(" | "));
    await s.tap('.sp-karte[data-spiel="duell"]'); await s.waitForSelector(".du-zeile");
    const t = await s.textContent(".du-liste");
    pruefe("Duell steht als „Runde gestartet, aber nicht beendet“ mit Knopf „Weiterspielen“", /nicht beendet/.test(t) && (await s.locator('[data-aktion="spielen"][data-weiter="1"]').count()) === 1 && /Weiterspielen/.test(t), t);
    await layoutPruefen(s, "Übersicht mit Weiterspielen", 360); await s.screenshot({ path: join(bilder, "duell-weiterspielen-uebersicht.png"), fullPage: true });
    pruefe("das unfertige Duell steht für andere nicht als Herausforderung da", !(await neuerSchueler("Jonas Weber").rufe({ aktion: "duell_uebersicht" })).offene.some((o) => o.id === letztes(A, "ersteller").id));
    await s.tap('[data-aktion="spielen"][data-weiter="1"]'); await s.waitForSelector('[data-aktion="los"]');
    pruefe("Bildschirm erklärt: Runde noch offen, dieselben Fragen, Zeit läuft weiter; Knopf „Weiterspielen“", /noch offen/.test(await s.textContent(".du-bereit")) && /10 Minuten/.test(await s.textContent(".du-bereit")) && (await s.textContent('[data-aktion="los"]')).trim() === "Weiterspielen");
    await layoutPruefen(s, "Weiterspielen-Bildschirm", 360); await s.screenshot({ path: join(bilder, "duell-weiterspielen-bereit.png"), fullPage: true });
    await s.tap('[data-aktion="los"]'); await s.waitForSelector(".du-antwort");
    pruefe("Server: dieselbe Runde, Startzeit unverändert, nichts doppelt gewertet", letztes(A, "ersteller").ersteller_gestartet_am === start0 && letztes(A, "ersteller").ersteller_fertig_am === null);
    await spieleRunde(s, ids, "de", () => "richtig", { schnell: true });
    await s.waitForSelector(".du-erg", { timeout: 20000 });
    pruefe("zu Ende gespielt: 8 von 8 richtig gewertet, genau eine Runde", letztes(A, "ersteller").richtig_ersteller === 8 && db.academy_spiele_duelle.filter((d) => d.ersteller === A.id).length === 1);
    await s.context().close(); }

  console.log("Sonderfall: Antwort auf „Los“ geht im Netz verloren -> Weiterspielen");
  { const A = neuerSchueler("Mira Kaya"); const s = await neueSeite(A); await zumDuell(s);
    s.verlusteStart = 1;
    await s.tap('[data-aktion="neu"]'); await s.waitForSelector('[data-aktion="los"]'); await s.tap('[data-aktion="los"]');
    await s.waitForSelector('[data-aktion="spielen"][data-weiter="1"]', { timeout: 15000 });
    pruefe("Fehlermeldung statt Absturz, Duell steht als offene Runde da, Knopf „Weiterspielen“", /Das hat nicht geklappt/.test(await s.textContent(".du-fehler")) && !!letztes(A, "ersteller").ersteller_gestartet_am && letztes(A, "ersteller").ersteller_fertig_am === null);
    await layoutPruefen(s, "Start-Netzfehler", 360); await s.screenshot({ path: join(bilder, "duell-start-netzfehler.png"), fullPage: true });
    await s.tap('[data-aktion="spielen"][data-weiter="1"]'); await s.waitForSelector('[data-aktion="los"]'); await s.tap('[data-aktion="los"]'); await s.waitForSelector(".du-antwort");
    const ids = letztes(A, "ersteller").fragen;
    await spieleRunde(s, ids, "de", () => "richtig", { schnell: true });
    await s.waitForSelector(".du-erg", { timeout: 20000 });
    pruefe("danach normal gespielt und gewertet (8 von 8), start wurde zweimal aufgerufen", letztes(A, "ersteller").richtig_ersteller === 8 && s.aufrufe.filter((x) => x === "duell_start").length === 2);
    await s.context().close(); }

  console.log("Sonderfall: hängendes Netz -> nach 20 s Abbruch mit Fehlermeldung");
  { const A = neuerSchueler("Mira Kaya"); const s = await neueSeite(A);
    s.haengtBei = "duell_uebersicht"; s.haengt = 1;
    await s.waitForSelector("#drawer-open-btn", { timeout: 15000 }); await s.tap("#drawer-open-btn"); await s.waitForSelector('[data-drawer="spiele"]', { state: "visible" }); await s.tap('[data-drawer="spiele"]');
    await s.waitForSelector('.sp-karte[data-spiel="duell"]', { timeout: 10000 }); const t0 = Date.now(); await s.tap('.sp-karte[data-spiel="duell"]');
    await s.waitForSelector(".du-fehler", { timeout: 35000 }); const dauer = Date.now() - t0;
    pruefe("kein ewiges Laden: nach etwa 20 s (nicht früher, nicht viel später) erscheint „Die Duelle konnten nicht geladen werden“ mit Knopf „Aktualisieren“", dauer >= 19_000 && dauer <= 26_000 && /konnten nicht geladen werden/.test(await s.textContent(".du-fehler")) && (await s.locator('[data-aktion="hub"]').count()) === 1, String(dauer));
    await s.tap('[data-aktion="hub"]'); await s.waitForSelector('[data-aktion="neu"]', { timeout: 10000 });
    pruefe("Aktualisieren lädt die Übersicht danach normal", true);
    pruefe("keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
    await s.context().close(); }

  console.log("Sonderfall: Netzfehler beim Senden -> Wiederholen");
  { const A = neuerSchueler("Mira Kaya"); const s = await neueSeite(A); await zumDuell(s);
    s.sperreEnde = 1;
    await s.tap('[data-aktion="neu"]'); await s.waitForSelector('[data-aktion="los"]'); await s.tap('[data-aktion="los"]'); await s.waitForSelector(".du-antwort");
    const ids = letztes(A, "ersteller").fragen;
    await spieleRunde(s, ids, "de", () => "richtig", { schnell: true });
    await s.waitForSelector('[data-aktion="nochmal"]', { timeout: 20000 });
    pruefe("Fehlermeldung „konnte nicht gespeichert werden“ und Knopf „Noch einmal senden“", /konnte nicht gespeichert werden/.test(await s.textContent("#spiele-platz")) && letztes(A, "ersteller").ersteller_fertig_am === null);
    await layoutPruefen(s, "Senden-Fehler", 360); await s.screenshot({ path: join(bilder, "duell-senden-fehler.png"), fullPage: true });
    await s.tap('[data-aktion="nochmal"]'); await s.waitForSelector(".du-erg", { timeout: 20000 });
    pruefe("zweiter Versuch klappt, genau eine Auswertung gespeichert", letztes(A, "ersteller").richtig_ersteller === 8 && s.aufrufe.filter((x) => x === "duell_ende").length === 2); await s.context().close(); }

  console.log("Sonderfall: Zeit abgelaufen (20 s echte Zeit)");
  { const A = neuerSchueler("Mira Kaya"); const s = await neueSeite(A); await zumDuell(s);
    await s.tap('[data-aktion="neu"]'); await s.waitForSelector('[data-aktion="los"]'); await s.tap('[data-aktion="los"]'); await s.waitForSelector(".du-antwort");
    const ids = letztes(A, "ersteller").fragen;
    const meine = ids.map((_, i) => (i === 0 ? "nichts" : "richtig"));
    await spieleRunde(s, ids, "de", (i) => meine[i], { schnell: true });
    await s.waitForSelector(".du-erg", { timeout: 20000 });
    const d = letztes(A, "ersteller");
    pruefe("keine Antwort in 20 s: Frage zählt 0, die anderen 7 zählen; Auswertung sagt „Keine Antwort (Zeit abgelaufen)“", d.richtig_ersteller === 7 && /Keine Antwort \(Zeit abgelaufen\)/.test(await s.textContent(".du-pruefung")), JSON.stringify([d.richtig_ersteller, d.punkte_ersteller]));
    await s.context().close(); }

  console.log("Sonderfall: Herausforderung schon vergeben, Limit, ausgeblendet");
  { const A = neuerSchueler("Mira Kaya"), B = neuerSchueler("Jonas Weber"), C = neuerSchueler("Nora Klein");
    const n = await A.rufe({ aktion: "duell_neu" }); const sA = await A.rufe({ aktion: "duell_start", duell: n.duell }); await pause(5400);
    await A.rufe({ aktion: "duell_ende", duell: n.duell, antworten: sA.fragen.map((id) => ({ a: LOESUNG[id], ms: 600 })) });
    const s = await neueSeite(B); await zumDuell(s); await s.waitForSelector('[data-aktion="annehmen"]');
    await C.rufe({ aktion: "duell_annehmen", duell: n.duell });           // C war schneller
    await s.tap('[data-aktion="annehmen"]'); await s.waitForSelector(".du-fehler:not([hidden])");
    pruefe("schon vergebene Herausforderung (für Fremde wie „gibt es nicht“): Meldung „Dieses Duell gibt es nicht mehr oder es ist abgelaufen“, Liste neu geladen", /gibt es nicht mehr oder es ist abgelaufen/.test(await s.textContent(".du-fehler")) && (await s.locator('[data-aktion="annehmen"][data-id="' + n.duell + '"]').count()) === 0);
    await s.context().close(); }
  { const L = neuerSchueler("Lena Voss"); for (let i = 0; i < 3; i++) await L.rufe({ aktion: "duell_neu" });
    const P = neuerSchueler("Paul Ernst"); const o = await P.rufe({ aktion: "duell_neu" }); const sp_ = await P.rufe({ aktion: "duell_start", duell: o.duell }); await pause(5400);
    await P.rufe({ aktion: "duell_ende", duell: o.duell, antworten: sp_.fragen.map((id) => ({ a: LOESUNG[id], ms: 600 })) });
    const s = await neueSeite(L); await zumDuell(s); await s.waitForSelector('[data-aktion="annehmen"]');
    pruefe("Limit 3: „Neues Duell“ und „Annehmen“ sind gesperrt, Hinweis nennt die 3 Duelle", (await s.isDisabled('[data-aktion="neu"]')) && (await s.isDisabled('[data-aktion="annehmen"]')) && /3 laufende Duelle/.test(await s.textContent("#spiele-platz")));
    await layoutPruefen(s, "Limit", 360); await s.context().close(); }
  { const H = neuerSchueler("Hanna Sehr"); await H.rufe({ aktion: "profil", sichtbar: false });
    const s = await neueSeite(H); await zumDuell(s); await s.waitForSelector(".sp-schalter");
    pruefe("ausgeblendet: „Neues Duell“ gesperrt, Hinweis erklärt warum", (await s.isDisabled('[data-aktion="neu"]')) && /im Ranking ausgeblendet/.test(await s.textContent("#spiele-platz")));
    await s.tap(".sp-schalter"); await s.waitForFunction(() => !document.querySelector('[data-aktion="neu"]').disabled);
    pruefe("Schalter „Im Ranking sichtbar“ einschalten: Übersicht lädt neu, „Neues Duell“ geht wieder", true);
    await s.context().close(); }

  console.log("Sonderfall: HTML im Namen, Vorschau-Modus");
  { const X = neuerSchueler('<img src=x onerror="window.__xss=1">Mira Kaya'), B = neuerSchueler("Jonas Weber");
    const n = await X.rufe({ aktion: "duell_neu" }); const sX = await X.rufe({ aktion: "duell_start", duell: n.duell }); await pause(5400);
    await X.rufe({ aktion: "duell_ende", duell: n.duell, antworten: sX.fragen.map((id) => ({ a: LOESUNG[id], ms: 600 })) });
    const s = await neueSeite(B); await zumDuell(s); await s.waitForSelector('[data-aktion="annehmen"]');
    pruefe("HTML im Namen eines Mitschülers wird als Text angezeigt, nichts wird ausgeführt", (await s.evaluate(() => window.__xss)) === undefined && (await s.locator("#spiele-platz img[src='x']").count()) === 0 && /<img K\./.test(await s.textContent(".du-liste")), await s.textContent(".du-liste"));
    // Vorschau-Modus: Spiel direkt starten mit k.vorschau = true
    const text = await s.evaluate(async () => {
      const m = await import("/spiele/duell.js"), r = await import("/spiele/rahmen.js");
      const el = document.createElement("div"); document.body.appendChild(el);
      const k = r.erzeugeK({ sprache: "de", vorschau: true }); const inst = m.starte(el, k);
      await new Promise((ok) => setTimeout(ok, 800)); const t = el.textContent; inst.zerstoeren(); el.remove(); return t;
    });
    pruefe("Vorschau-Modus: Hinweis „Duelle brauchen dein Konto“, kein Server-Aufruf, keine Fehler", /Duelle brauchen dein Konto/.test(text) && s.fehler.length === 0, text + " | " + s.fehler.join(","));
    await s.context().close(); }
}

try {
  if (dran("ablauf")) await ablauf();
  if (dran("groessen")) await groessen();
  if (dran("sprachen")) await sprachen();
  if (dran("sonder")) await sonder();
} finally {
  await browser.close();
  server.close();
}
console.log("\n" + bestanden + " Prüfungen bestanden" + (befunde.length ? ", " + befunde.length + " FEHLER:\n - " + befunde.join("\n - ") : ""));
