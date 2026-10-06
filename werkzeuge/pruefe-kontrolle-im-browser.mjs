// Browser-Prüfung von Spiel 6 „Verkehrskontrolle“ (07.10.2026): echte App in echtem Chromium, mit Fingertipp.
//   - Die App läuft aus diesem Ordner. Solange die Integration (spiele.js, texte.js, academy-spiele.ts) noch nicht eingebaut ist, setzt
//     werkzeuge/kontrolle-unterbau.mjs sie beim Ausliefern/im Speicher ein; ist sie eingebaut, wird nichts doppelt eingesetzt.
//   - Alle Server-Aufrufe beantwortet die ECHTE Function-Datei gegen eine Datenbank im Speicher (wie pruefe-spiele-im-browser.mjs).
//   - Geprüft: Start-Knopf mitten über dem Feld, voller Durchgang mit echten Fingertipps (8 Fahrzeuge, kein Fall doppelt),
//     Bild = Daten des Falls (Papiere, Gegenstände, Lampen, Profil, Plakette), Wertung und Erklärung = Spielmodell, Uhr läuft nur
//     während einer Entscheidung, falscher Alarm/übersehener Mangel, Server-Ergebnis, Verlassen mitten in der Runde,
//     Handy 360x740 / 320x640 / 412x915 dunkel / Querformat, nichts wischt seitlich, nichts abgeschnitten, Tippflächen >= 44 px,
//     alle 18 Sprachen (RTL: ar), keine Konsolenfehler.
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-kontrolle-im-browser.mjs
//   (Playwright liegt global: PLAYWRIGHT_PFAD=/opt/node22/lib/node_modules; Browser: PLAYWRIGHT_BROWSERS_PATH)
//   Nur einzelne Teile: NUR=layout,durchgang,sprachen,uhr,verlassen  Bilder landen in $KONTROLLE_BILDER (Standard ./kontrolle-bilder, nicht einchecken).
import http from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, extname } from "node:path";
import { wurzel, serverEinsetzen, spieleJsQuelle, texteQuelle } from "./kontrolle-unterbau.mjs";
import * as K from "../spiele/kontrolle.js";
import { TEXTE_KONTROLLE } from "../spiele/texte-kontrolle.js";

const zurueck = serverEinsetzen();
const { db, rufe, jetzt, warte } = await import("./edge-functions/spiele-im-speicher.mjs");
zurueck();

const { chromium } = createRequire((process.env.PLAYWRIGHT_PFAD || "/opt/node22/lib/node_modules") + "/")("playwright");
const bilder = process.env.KONTROLLE_BILDER || join(process.cwd(), "kontrolle-bilder");
mkdirSync(bilder, { recursive: true });
const nur = process.env.NUR ? process.env.NUR.split(",") : null;
const dran = (x) => !nur || nur.includes(x);

// ---- Datenbank im Speicher: ein Testschüler + Mitspieler ----
const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
const schueler = (id, name) => db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null });
schueler("t", "Serban Dumitrescu");
db.academy_sessions.push({ session_token: "tok-t", schueler_id: "t", expires_at: inEinemJahr });
[["m1", "Mira Kaya", 1010], ["m2", "Jonas Weber", 905], ["m3", "Ali Reza Karimi", 720]].forEach(([id, n, w]) => {
  schueler(id, n);
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "kontrolle", wert: w, erreicht_am: jetzt(), versuche: 2 });
});

// ---- Static-Server für die App (spiele.js und texte.js bekommen den Einbau, falls er noch fehlt) ----
const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg" };
const server = http.createServer((req, res) => {
  const pfad = join(wurzel, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "") || "index.html");
  if (!pfad.startsWith(wurzel) || !existsSync(pfad) || pfad === wurzel + "/") { res.writeHead(404); res.end("nicht da"); return; }
  let inhalt = readFileSync(pfad);
  if (pfad.endsWith("/spiele/spiele.js")) inhalt = spieleJsQuelle(inhalt.toString("utf8"));
  if (pfad.endsWith("/spiele/texte.js")) inhalt = texteQuelle(inhalt.toString("utf8"));
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
  db.academy_spiele_runden = [];   // jede neue Seite beginnt mit leerem Rundenzähler (sonst greift nach 30 Runden in 10 min die Bremse)
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
const zumSpiel = async (s) => { await zumHub(s); await s.tap('.sp-karte[data-spiel="kontrolle"]'); await s.waitForSelector(".sp-k-knopf", { timeout: 10000 }); await s.waitForTimeout(700); };
const foto = async (s, name, voll) => { await s.waitForTimeout(500); await s.screenshot({ path: join(bilder, name + ".png"), fullPage: !!voll }); };

/* Layout: nichts seitlich wischbar, nichts abgeschnitten, Tippflächen groß genug, Text bricht um statt zu überlaufen */
async function layoutPruefen(s, name) {
  const r = await s.evaluate(() => {
    const probleme = [];
    const de = document.documentElement;
    if (de.scrollWidth > window.innerWidth + 1) probleme.push("Seite wischbar: " + de.scrollWidth + " > " + window.innerWidth);
    document.querySelectorAll("#spiele-platz *").forEach((el) => {
      if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") return;
      const rc = el.getBoundingClientRect();
      if (rc.width === 0 || rc.height === 0) return;
      if (getComputedStyle(el).visibility === "hidden") return;
      if (rc.right > window.innerWidth + 1 || rc.left < -1) probleme.push("ragt raus: " + el.className + " " + Math.round(rc.left) + ".." + Math.round(rc.right));
      const d = getComputedStyle(el).display;
      if (d !== "inline" && el.tagName.toLowerCase() !== "svg" && el.scrollWidth > el.clientWidth + 1) probleme.push("Inhalt breiter als Kasten: " + el.className + " " + el.scrollWidth + ">" + el.clientWidth);
      if (el.children.length === 0 && el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflow !== "visible") probleme.push("abgeschnitten: " + el.className);
    });
    document.querySelectorAll(".sp-k-station,.sp-k-ent,.sp-k-weiter,.sp-k-knopf,.sp-schalter,.sp-karte").forEach((el) => {
      const rc = el.getBoundingClientRect();
      if (rc.height > 0 && getComputedStyle(el).visibility !== "hidden" && (rc.height < 43.5 || rc.width < 43.5)) probleme.push("Tippfläche klein: " + el.className + " " + Math.round(rc.width) + "x" + Math.round(rc.height));
    });
    return probleme;
  });
  pruefe(name + ": Layout ohne Überstand/Abschneiden/kleine Knöpfe", r.length === 0, r.slice(0, 4).join(" | "));
}
const imBild = async (s, sel, name, unten) => {
  const r = await s.evaluate(({ sel, unten }) => { const e = document.querySelector(sel); if (!e) return { fehlt: true }; const rc = e.getBoundingClientRect(); return { oben: Math.round(rc.top), unten: Math.round(rc.bottom), h: window.innerHeight, ok: rc.top >= 0 && rc.bottom <= window.innerHeight - unten }; }, { sel, unten });
  pruefe(name + ": im Bild (über der Menüleiste)", !r.fehlt && r.ok, JSON.stringify(r));
};

/* ---------- Spielen wie ein Mensch ---------- */
const heute = () => { const d = new Date(); return { jahr: d.getFullYear(), monat: d.getMonth() + 1 }; };
const de = TEXTE_KONTROLLE.de;
function zufall(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const fallVon = (id) => K.FAELLE.find((f) => f.id === id);

/* Was zeigt die Station? Wird mit den Daten des Falls verglichen (Bild = Modell). */
async function stationLesen(s, st) {
  return s.evaluate((st) => {
    const p = document.querySelector('.sp-k-panel[data-station="' + st + '"]');
    if (!p) return null;
    if (st === "papiere" || st === "ausruestung") return { items: Array.from(p.querySelectorAll("[data-item]")).map((e) => e.getAttribute("data-item")), texte: Array.from(p.querySelectorAll("[data-item] span")).map((e) => e.textContent.trim()) };
    if (st === "licht") { const l = {}; p.querySelectorAll("[data-lampe]").forEach((e) => { l[e.getAttribute("data-lampe")] = e.getAttribute("data-an") === "1"; }); return { lampen: l, aria: p.querySelector(".sp-k-lichter").getAttribute("aria-label") }; }
    const m = p.querySelector(".sp-k-messung"), t = p.querySelector("[data-typ]"), w = p.querySelector("[data-wetter]"), pl = p.querySelector(".sp-k-plbild");
    const texte = Array.from(pl.querySelectorAll("svg text")), oben = texte.find((e) => e.getAttribute("font-weight") === "800" && e.getAttribute("font-size") === "12"), jahr = texte.find((e) => e.getAttribute("font-size") === "19");
    return { profil: +m.getAttribute("data-profil"), profilText: m.querySelector("b").textContent.trim(), typ: t.getAttribute("data-typ"), wetter: w.getAttribute("data-wetter"), hu: pl.getAttribute("data-hu"), plMonat: oben ? oben.textContent : null, plJahr: jahr ? jahr.textContent : null, zeile: p.querySelector(".sp-k-plzeile").textContent.trim() };
  }, st);
}
function stationPruefen(f, st, g, name) {
  if (!g) return pruefe(name + ": Station zeigt Inhalt", false, "kein Panel");
  if (st === "papiere") pruefe(name + ": Bild zeigt genau die Papiere des Falls", JSON.stringify(g.items.slice().sort()) === JSON.stringify(f.papiere.slice().sort()), g.items.join() + " vs " + f.papiere.join());
  else if (st === "ausruestung") pruefe(name + ": Bild zeigt genau die Gegenstände des Falls", JSON.stringify(g.items.slice().sort()) === JSON.stringify(f.ausr.slice().sort()), g.items.join() + " vs " + f.ausr.join());
  else if (st === "licht") {
    const soll = { "ab-0": f.licht.ab[0], "ab-1": f.licht.ab[1], "br-0": f.licht.br[0], "br-1": f.licht.br[1], "bl-0": f.licht.bl[0], "bl-1": f.licht.bl[1] };
    pruefe(name + ": sechs Lampen leuchten/sind dunkel wie im Fall", JSON.stringify(g.lampen) === JSON.stringify(soll), JSON.stringify(g.lampen) + " vs " + JSON.stringify(soll));
  } else {
    const h = heute(), d = f.hu == null ? null : new Date(h.jahr, h.monat - 1 + f.hu, 1), m = d ? { jahr: d.getFullYear(), monat: d.getMonth() + 1 } : null,   // unabhängig von K.plakettenMonat gerechnet
       zt = m ? (m.monat < 10 ? "0" : "") + m.monat + "/" + m.jahr : "fehlt";
    pruefe(name + ": Profiltiefe, Reifenart, Wetter wie im Fall", g.profil === f.reifen.profil && g.typ === f.reifen.typ && g.wetter === f.reifen.wetter && /mm$/.test(g.profilText) && parseFloat(g.profilText.replace(",", ".")) === f.reifen.profil / 10, JSON.stringify(g));
    pruefe(name + ": HU-Plakette zeigt Monat/Jahr (oben der Monat, in der Mitte das Jahr) bzw. fehlt", g.hu === zt && (m ? g.plMonat === String(m.monat) && g.plJahr === String(m.jahr).slice(-2) : g.plMonat === null) && g.zeile.includes(m ? zt : "") && g.zeile.includes(String(h.monat < 10 ? "0" + h.monat : h.monat) + "/" + h.jahr), JSON.stringify(g) + " erwartet " + zt);
  }
}

/* Ein Fahrzeug durchspielen. plan: { ant: {station: bool}, ent: bool, reihenfolge: [...], pruefInhalt: bool, vorher: ms Warten in der Übersicht, vorEnt: ms Warten vor Gesamtentscheidung, nachStation: fn(st) } */
async function fahrzeug(s, plan) {
  const id = await s.getAttribute(".sp-k-buehne", "data-fall");
  const f = fallVon(id);
  if (!f) throw new Error("unbekannter Fall " + id);
  if (plan.vorher) await s.waitForTimeout(plan.vorher);
  const ant = plan.ant(f);
  for (const st of plan.reihenfolge || K.STATIONEN) {
    await s.tap('.sp-k-station[data-station="' + st + '"]');
    await s.waitForSelector('.sp-k-panel[data-station="' + st + '"]');
    if (plan.pruefInhalt) stationPruefen(f, st, await stationLesen(s, st), "Fall " + id + "/" + st);
    if (plan.nachStation) await plan.nachStation(st, f);
    await s.tap('.sp-k-panel .sp-k-ent[data-mangel="' + (ant[st] ? 1 : 0) + '"]');
    await s.waitForSelector(".sp-k-uebersicht");
    if (plan.zwischen && st === (plan.reihenfolge || K.STATIONEN)[0]) await s.waitForTimeout(plan.zwischen);
  }
  const ent = plan.ent(f, ant);
  if (plan.vorEnt) await s.waitForTimeout(plan.vorEnt);
  await s.waitForSelector('.sp-k-ent[data-ent="1"]');
  await s.tap('.sp-k-ent[data-ent="' + (ent ? 1 : 0) + '"]');
  await s.waitForSelector(".sp-k-antwort");
  // Auswertung auslesen
  const a = await s.evaluate(() => ({
    punkte: parseInt(document.querySelector(".sp-k-urteil span").textContent.replace("+", ""), 10),
    richtigText: document.querySelector(".sp-k-antwort .sp-k-richtigzahl").textContent.trim(),
    zeilen: Array.from(document.querySelectorAll(".sp-k-zeile")).map((z) => ({ station: z.getAttribute("data-station"), art: z.getAttribute("data-art"), saetze: Array.from(z.querySelectorAll(".sp-k-satz")).map((x) => x.textContent.trim()), klassen: Array.from(z.querySelectorAll(".sp-k-satz")).map((x) => x.className.replace("sp-k-satz ", "")), chip: z.querySelector(".sp-k-chip").textContent.trim() })),
    hud: parseInt(document.querySelector(".sp-k-punkte b").textContent, 10)
  }));
  return { id, f, ant, ent, a };
}
/* Auswertung gegen das Modell prüfen; ms-Grenzen: die Zeit kennt der Test nicht genau */
function auswertungPruefen(r, name, summeDavor) {
  const lo = K.bewerteFahrzeug(r.f, r.ant, r.ent, { papiere: 99999, ausruestung: 99999, licht: 99999, reifen: 99999, ent: 99999 });
  const hi = K.bewerteFahrzeug(r.f, r.ant, r.ent, { papiere: 0, ausruestung: 0, licht: 0, reifen: 0, ent: 0 });
  const e = lo;   // Arten/Zeilen hängen nicht von der Zeit ab
  pruefe(name + ": Punkte liegen im möglichen Bereich " + lo.summe + "–" + hi.summe + " (+" + r.a.punkte + ")", r.a.punkte >= lo.summe && r.a.punkte <= hi.summe, "+" + r.a.punkte);
  pruefe(name + ": Anzahl richtiger Entscheidungen wie im Modell (" + e.richtig + " von 5)", r.a.richtigText.includes(e.richtig + " von 5") || r.a.richtigText.includes(e.richtig + " /") || r.a.richtigText.includes(String(e.richtig)), r.a.richtigText);
  const arten = e.stationen.map((x) => x.art).concat([e.ent.art]);
  pruefe(name + ": Art jeder Zeile (richtig / falscher Alarm / übersehen) wie im Modell", JSON.stringify(r.a.zeilen.map((z) => z.art)) === JSON.stringify(arten), JSON.stringify(r.a.zeilen.map((z) => z.art)) + " vs " + arten.join());
  let saetzeOk = true, detail = "";
  e.stationen.forEach((st, i) => {
    const soll = st.zeilen.map((z) => de[z.k]), ist = r.a.zeilen[i].saetze;
    if (JSON.stringify(soll) !== JSON.stringify(ist)) { saetzeOk = false; detail += st.station + ": " + JSON.stringify(ist).slice(0, 80) + " "; }
    const chipSoll = st.wahr ? de.koMangel : de.koOk;
    if (r.a.zeilen[i].chip !== chipSoll) { saetzeOk = false; detail += st.station + " chip " + r.a.zeilen[i].chip + " "; }
  });
  pruefe(name + ": Erklärung nennt zu jeder Station genau die Sätze des Modells (Lerneffekt, Urteil)", saetzeOk, detail);
  const endKey = e.ent.wahr ? (e.ent.antwort ? "koEndRichtigM" : "koEndFalschW") : (e.ent.antwort ? "koEndFalschM" : "koEndRichtigW");
  pruefe(name + ": Satz zur Gesamtentscheidung stimmt", r.a.zeilen[4].saetze[0] === de[endKey], r.a.zeilen[4].saetze[0]);
  if (summeDavor != null) pruefe(name + ": Anzeige „Punkte“ oben = Summe", r.a.hud === summeDavor + r.a.punkte, r.a.hud + " vs " + (summeDavor + r.a.punkte));
  return e;
}

/* Ein ganzer Durchgang. Gibt Liste der Fahrzeuge und die Punkte zurück. */
async function durchgang(s, plan, name, opt = {}) {
  await s.tap(".sp-k-knopf");
  await s.waitForSelector(".sp-k-station:not([disabled])", { timeout: 12000 });
  const ids = [];
  let summe = 0, richtig = 0;
  for (let i = 0; i < 8; i++) {
    await s.waitForFunction((n) => /\d/.test(document.querySelector(".sp-k-fz").textContent) && document.querySelector(".sp-k-fz").textContent.includes(String(n)), i + 1);
    if (opt.vorFahrzeug) await opt.vorFahrzeug(i);
    const r = await fahrzeug(s, typeof plan === "function" ? plan(i) : plan);
    ids.push(r.id);
    const e = auswertungPruefen(r, name + " Fahrzeug " + (i + 1) + " (" + r.id + ")", summe);
    summe += r.a.punkte; richtig += e.richtig;
    if (i === 0 && opt.fotoErklaerung) await foto(s, opt.fotoErklaerung);
    if (opt.nachAuswertung) await opt.nachAuswertung(i, r);
    if (i === 7) warte(31_000);        // der Server verlangt eine Mindestdauer (72 Tipps brauchen Zeit); der Test-Bot ist schneller als ein Mensch
    await s.tap(".sp-k-weiter");
  }
  await s.waitForSelector(".sp-erg", { timeout: 10000 });
  return { ids, summe, richtig };
}

/* ================================  Prüfungen  ================================ */
const ENT_RICHTIG = { ant: (f) => Object.fromEntries(K.STATIONEN.map((x) => [x, K.stationMangel(f, x)])), ent: (f) => K.fahrzeugMangel(f) };
const rnd0 = zufall(2026);
const mischung = () => { const o = K.STATIONEN.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(rnd0() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };

async function layoutTeil() {
  console.log("Start-Knopf, Ansichten und Layout (Handy hoch, klein, dunkel, quer)");
  for (const g of [{ b: 360, h: 740, n: "360x740" }, { b: 320, h: 640, n: "320x640" }, { b: 412, h: 915, n: "412x915 dunkel", dunkel: true }, { b: 740, h: 360, n: "quer 740x360" }, { b: 640, h: 320, n: "quer 640x320" }]) {
    const s = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
    await zumSpiel(s);
    const kurz = g.n.replace(/\W+/g, "_");
    await layoutPruefen(s, g.n + " bereit");
    // Start-Knopf MITTEN über dem (abgeblendeten) Feld
    const geo = await s.evaluate(() => { const k = document.querySelector(".sp-k-knopf").getBoundingClientRect(), b = document.querySelector(".sp-k-buehne").getBoundingClientRect(); return { dx: Math.abs((k.left + k.right) / 2 - (b.left + b.right) / 2), dy: Math.abs((k.top + k.bottom) / 2 - (b.top + b.bottom) / 2), bh: b.height, kt: k.top, kb: k.bottom, bt: b.top, bb: b.bottom, h: window.innerHeight }; });
    pruefe(g.n + ": Start-Knopf mitten über dem Feld", geo.dx < 3 && geo.dy < 3 && geo.kt > geo.bt && geo.kb < geo.bb, JSON.stringify(geo));
    await imBild(s, ".sp-k-knopf", g.n + ": Start-Knopf", 70);
    pruefe(g.n + ": vor dem Start sind die Stationen nicht antippbar", (await s.locator(".sp-k-station:not([disabled])").count()) === 0 && (await s.getAttribute(".sp-k-buehne", "class")).includes("aus"));
    await foto(s, "bereit-" + kurz);
    await s.tap(".sp-k-knopf");
    await s.waitForSelector(".sp-k-station:not([disabled])");
    pruefe(g.n + ": nach Start ist der Knopf weg, die Anleitung auch", !(await s.isVisible(".sp-k-knopf")) && !(await s.isVisible(".sp-k-anleitung")));
    await s.waitForTimeout(800);
    await layoutPruefen(s, g.n + " Übersicht");
    await imBild(s, ".sp-k-stationen", g.n + ": vier Stationen", 60);
    await foto(s, "uebersicht-" + kurz);
    // jede Station einmal öffnen, ansehen, in Ordnung antworten (schlechte Antworten sind egal, es geht um das Bild)
    const id = await s.getAttribute(".sp-k-buehne", "data-fall");
    for (const st of K.STATIONEN) {
      await s.tap('.sp-k-station[data-station="' + st + '"]');
      await s.waitForSelector('.sp-k-panel[data-station="' + st + '"]');
      await s.waitForTimeout(450);
      await layoutPruefen(s, g.n + " Station " + st);
      await imBild(s, ".sp-k-panel .sp-k-ent", g.n + " Station " + st + ": Knöpfe", 56);
      if (st === "ausruestung" || st === "reifen" || st === "licht") await foto(s, "station-" + st + "-" + kurz);
      await s.tap('.sp-k-panel .sp-k-ent[data-mangel="0"]');
      await s.waitForSelector(".sp-k-uebersicht");
    }
    await layoutPruefen(s, g.n + " Gesamtentscheidung");
    await imBild(s, ".sp-k-wahl", g.n + ": Gesamtentscheidung", 56);
    await foto(s, "gesamt-" + kurz);
    await s.tap('.sp-k-ent[data-ent="0"]');
    await s.waitForSelector(".sp-k-antwort");
    await s.waitForTimeout(500);
    await layoutPruefen(s, g.n + " Auswertung");
    await imBild(s, ".sp-k-weiter", g.n + " Auswertung: Weiter-Knopf", 56);
    await foto(s, "auswertung-" + kurz, true);
    pruefe(g.n + ": Fall " + id + " kam aus dem Pool", !!fallVon(id));
    pruefe(g.n + ": keine Konsolenfehler", s.fehler.length === 0, s.fehler.join(" | "));
    await s.context().close();
  }
}

async function durchgangTeil() {
  console.log("Voller Durchgang 1 (ehrlich und richtig), Handy 360x740");
  let s = await neueSeite({ b: 360, h: 740 });
  await zumHub(s);
  pruefe("Startseite zeigt die Karte „Verkehrskontrolle“ mit Vorschau-Marke", (await s.locator('.sp-karte[data-spiel="kontrolle"] .sp-karte-titel').textContent()).trim() === de.koName && (await s.locator('.sp-karte[data-spiel="kontrolle"] .sp-karte-marke').count()) === 1);
  await s.tap('.sp-karte[data-spiel="kontrolle"]');
  await s.waitForSelector(".sp-k-knopf");
  await s.waitForTimeout(600);
  pruefe("Spiel-Titel und Anleitung sichtbar vor dem Start", (await s.textContent(".sp-kontrolle .sp-spieltitel")).trim() === de.koName && (await s.textContent(".sp-k-anleitung")).trim() === de.koBereit);
  const r1 = await durchgang(s, () => ({ ...ENT_RICHTIG, reihenfolge: mischung(), pruefInhalt: true }), "Durchgang 1", { fotoErklaerung: "auswertung-durchgang1" });
  pruefe("Durchgang 1: 8 verschiedene Fahrzeuge, kein Fall doppelt", new Set(r1.ids).size === 8, r1.ids.join());
  const ohne = r1.ids.filter((id) => !K.fahrzeugMangel(fallVon(id))).length;
  pruefe("Durchgang 1: 2 oder 3 Fahrzeuge ohne Mangel, jede Station kommt mit Mangel dran", ohne >= 2 && ohne <= 3 && K.STATIONEN.every((st) => r1.ids.some((id) => K.stationMangel(fallVon(id), st))), r1.ids.join());
  const wert = parseInt((await s.textContent(".sp-gross")).trim(), 10);
  pruefe("Durchgang 1: Endpunkte = Summe der Fahrzeuge (" + r1.summe + ")", wert === r1.summe, wert + " vs " + r1.summe);
  pruefe("Durchgang 1: alles richtig bei flotten Fingern: 800 bis 1200 Punkte, 40 von 40", wert >= 800 && wert <= 1200 && r1.richtig === 40, wert + "/" + r1.richtig);
  pruefe("Durchgang 1: Ergebnis nennt „40 von 40 Entscheidungen richtig“", (await s.textContent(".sp-erg .sp-k-richtigzahl")).trim() === "40 von 40 Entscheidungen richtig", await s.textContent(".sp-erg .sp-k-richtigzahl"));
  pruefe("Durchgang 1: Hinweis zum echten Leben steht dabei", (await s.textContent(".sp-hinweis-strasse")).trim() === de.koHinweis);
  await s.waitForSelector(".sp-badge.neu");
  const sp = (await s.textContent(".sp-speicher")).trim();
  pruefe("Durchgang 1: „Neue Bestpunktzahl!“ und Platz", sp.includes("Neue Bestpunktzahl") && /Platz \d+ von \d+/.test(sp), sp);
  const gespeichert = db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "kontrolle");
  pruefe("Server hat die Punkte gespeichert", gespeichert && gespeichert.wert === wert, JSON.stringify(gespeichert));
  await s.waitForSelector(".sp-zeile.ich");
  pruefe("Bestenliste zeigt mich, größte Punktzahl zuerst", (await s.textContent(".sp-zeile.ich")).includes("Du") && (await s.locator(".sp-wert").allTextContents()).map((x) => parseInt(x, 10)).every((x, i, a) => i === 0 || a[i - 1] >= x), (await s.locator(".sp-wert").allTextContents()).join());
  await layoutPruefen(s, "Ergebnis 360");
  await foto(s, "ergebnis-360", true);
  pruefe("Konsole ohne Fehler (Durchgang 1)", s.fehler.length === 0, s.fehler.join(" | "));

  console.log("Durchgang 2: alles als Mangel melden (falscher Alarm) – nie unter 0 je Fahrzeug");
  await s.tap(".sp-k-knopf");
  await s.waitForSelector(".sp-k-station:not([disabled])");
  const bisher = wert;
  let summe2 = 0, ids2 = [];
  for (let i = 0; i < 8; i++) {
    await s.waitForFunction((n) => document.querySelector(".sp-k-fz").textContent.includes(String(n)), i + 1);
    const r = await fahrzeug(s, { ant: () => Object.fromEntries(K.STATIONEN.map((x) => [x, true])), ent: () => true, reihenfolge: mischung() });
    const e = auswertungPruefen(r, "Durchgang 2 Fahrzeug " + (i + 1) + " (" + r.id + ")", summe2);
    pruefe("Durchgang 2 Fahrzeug " + (i + 1) + ": nie unter 0 (+" + r.a.punkte + ")", r.a.punkte >= 0);
    if (!K.fahrzeugMangel(r.f)) pruefe("Durchgang 2 Fahrzeug " + (i + 1) + ": Auto ohne Mangel, alles als Mangel gemeldet: " + r.a.zeilen.filter((z) => z.art === "alarm").length + " falsche Alarme", r.a.zeilen.every((z) => z.art === "alarm") && r.a.punkte === 0);
    summe2 += r.a.punkte; ids2.push(r.id);
    if (i === 7) warte(31_000);
    await s.tap(".sp-k-weiter");
  }
  await s.waitForSelector(".sp-erg");
  const w2 = parseInt((await s.textContent(".sp-gross")).trim(), 10);
  pruefe("Durchgang 2: 8 verschiedene Fahrzeuge", new Set(ids2).size === 8);
  pruefe("Durchgang 2: Punkte = Summe, schlechter als Durchgang 1, Bestwert bleibt", w2 === summe2 && w2 < bisher && (await s.locator(".sp-badge.neu").count()) === 0 && db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "kontrolle").wert === bisher, w2 + " vs " + bisher);
  await s.waitForFunction(() => /Bestpunktzahl/.test(document.querySelector(".sp-speicher")?.textContent || ""));
  await foto(s, "ergebnis-durchgang2", true);

  console.log("Durchgang 3: alles „in Ordnung“ melden (Mängel übersehen: 0 Punkte, kein Abzug)");
  await s.tap(".sp-k-knopf");
  await s.waitForSelector(".sp-k-station:not([disabled])");
  let summe3 = 0;
  for (let i = 0; i < 8; i++) {
    await s.waitForFunction((n) => document.querySelector(".sp-k-fz").textContent.includes(String(n)), i + 1);
    const r = await fahrzeug(s, { ant: () => Object.fromEntries(K.STATIONEN.map((x) => [x, false])), ent: () => false });
    auswertungPruefen(r, "Durchgang 3 Fahrzeug " + (i + 1) + " (" + r.id + ")", summe3);
    if (K.fahrzeugMangel(r.f)) pruefe("Durchgang 3 Fahrzeug " + (i + 1) + ": Mangel übersehen, Auswertung nennt es", r.a.zeilen.some((z) => z.art === "uebersehen") && r.a.zeilen.every((z) => z.art !== "alarm"));
    summe3 += r.a.punkte;
    if (i === 7) warte(31_000);
    await s.tap(".sp-k-weiter");
  }
  await s.waitForSelector(".sp-erg");
  pruefe("Durchgang 3: Endpunkte = Summe", parseInt((await s.textContent(".sp-gross")).trim(), 10) === summe3);
  await s.waitForFunction(() => /Bestpunktzahl|Neue/.test(document.querySelector(".sp-speicher")?.textContent || ""));
  pruefe("Server: höchster Wert bleibt gespeichert, 3 Runden gezählt", db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "kontrolle").wert === bisher && db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "kontrolle").versuche === 3);
  pruefe("Konsole ohne Fehler (Durchgänge 2 und 3)", s.fehler.length === 0, s.fehler.join(" | "));
  const letzterStart = await s.evaluate(() => document.querySelector(".sp-k-knopf").textContent.trim());
  pruefe("Am Ende steht „Nochmal“ mitten über dem Feld", letzterStart === "Nochmal");
  // Startseite zeigt den Bestwert mit Punkten
  await s.tap("[data-nav-zurueck]");
  await s.waitForSelector(".sp-karte");
  await s.waitForFunction((id) => document.querySelector('[data-best="' + id + '"]')?.textContent.includes("Punkte"), "kontrolle");
  pruefe("Startseite: „Deine Bestpunktzahl: … Punkte“ an der Karte", (await s.textContent('[data-best="kontrolle"]')).trim() === de.koBestwert + ": " + bisher + " " + de.koPunkte, await s.textContent('[data-best="kontrolle"]'));
  await s.context().close();

  console.log("Normales Schülergerät (ohne Vorschau-Flag): das Spiel ist noch nicht freigegeben");
  { const n = await neueSeite({ b: 360, h: 740, ohneFlag: true });
    await zumHub(n);
    pruefe("Karte „Verkehrskontrolle“ erscheint ohne Vorschau-Gerät NICHT", (await n.locator('.sp-karte[data-spiel="kontrolle"]').count()) === 0);
    await n.evaluate(() => go({ drawer: "spiele", spiel: "kontrolle" }));
    await n.waitForSelector(".sp-karte", { timeout: 8000 });
    await n.waitForTimeout(600);
    pruefe("direkt aufgerufen öffnet das Spiel NICHT (Startseite statt Spiel)", (await n.locator(".sp-k-knopf, .sp-kontrolle").count()) === 0);
    await n.context().close(); }
}

async function uhrTeil() {
  console.log("Uhr: läuft nur, solange eine Entscheidung offen ist");
  const s = await neueSeite({ b: 360, h: 740 });
  await zumSpiel(s);
  await s.tap(".sp-k-knopf");
  await s.waitForSelector(".sp-k-station:not([disabled])");
  // Fahrzeug 1: 9 s in der Übersicht warten (Uhr steht), dann zügig und richtig entscheiden → fast volle Punkte
  const r1 = await fahrzeug(s, { ...ENT_RICHTIG, vorher: 9000, zwischen: 9000 });
  pruefe("9 s Warten in der Übersicht (vor und zwischen den Stationen) kostet keine Bonus-Punkte (+" + r1.a.punkte + " ≥ 140)", r1.a.punkte >= 140, "+" + r1.a.punkte);
  await s.waitForTimeout(9000);   // 9 s Lesen der Erklärung: die Uhr steht
  await s.tap(".sp-k-weiter");
  await s.waitForSelector(".sp-k-station:not([disabled])");
  // Fahrzeug 2: Stationen zügig, dann 9 s vor der Gesamtentscheidung → Bonus der Gesamtentscheidung weg (20 statt ~30)
  const r2 = await fahrzeug(s, { ...ENT_RICHTIG, vorEnt: 9000 });
  pruefe("Erklärung 9 s lesen kostet nichts (Fahrzeug 2 beginnt frisch), 9 s Zögern vor dem Gesamturteil kostet den Bonus (+" + r2.a.punkte + " zwischen 100 und 141)", r2.a.punkte >= 100 && r2.a.punkte <= 141, "+" + r2.a.punkte);
  await s.tap(".sp-k-weiter");
  await s.waitForSelector(".sp-k-station:not([disabled])");
  // Fahrzeug 3: 9 s in einer offenen Station zögern → Bonus dieser Station weg
  const r3 = await fahrzeug(s, { ...ENT_RICHTIG, nachStation: async (st) => { if (st === "papiere") await s.waitForTimeout(9000); } });
  pruefe("9 s Zögern in einer offenen Station kostet deren Bonus (+" + r3.a.punkte + " zwischen 100 und 141)", r3.a.punkte >= 100 && r3.a.punkte <= 141, "+" + r3.a.punkte);
  await s.context().close();
}

async function verlassenTeil() {
  console.log("Verlassen mitten in der Runde");
  const s = await neueSeite({ b: 360, h: 740 });
  await zumSpiel(s);
  const vorher = db.academy_spiele_bestwerte.filter((b) => b.schueler_id === "t").length;
  await s.tap(".sp-k-knopf");
  await s.waitForSelector(".sp-k-station:not([disabled])");
  await s.tap('.sp-k-station[data-station="papiere"]');
  await s.waitForSelector(".sp-k-panel");
  await s.tap("[data-nav-zurueck]");
  await s.waitForSelector(".sp-karte");
  await s.waitForTimeout(3000);
  pruefe("nach dem Verlassen keine Fehler / keine späten Zeitgeber", s.fehler.length === 0, s.fehler.join(" | "));
  pruefe("abgebrochene Runde speichert nichts", db.academy_spiele_bestwerte.filter((b) => b.schueler_id === "t").length === vorher);
  await s.tap('.sp-karte[data-spiel="kontrolle"]');
  await s.waitForSelector(".sp-k-knopf");
  pruefe("Spiel lässt sich erneut öffnen, Zustand frisch (Start, Stationen gesperrt, kein Ergebnis)", (await s.textContent(".sp-k-knopf")).trim() === "Start" && (await s.locator(".sp-k-station:not([disabled])").count()) === 0 && (await s.locator(".sp-erg:visible").count()) === 0);
  // App in den Hintergrund: die Runde wird abgebrochen und beginnt von vorn
  await s.tap(".sp-k-knopf");
  await s.waitForSelector(".sp-k-station:not([disabled])");
  await s.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await s.waitForTimeout(300);
  pruefe("App im Hintergrund: Runde wird abgebrochen (Start-Knopf wieder da)", (await s.textContent(".sp-k-knopf")).trim() === "Start" && (await s.isVisible(".sp-k-knopf")));
  await s.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); });
  await s.context().close();
}

async function sprachenTeil() {
  console.log("Alle 18 Sprachen (Handy 360, Übersicht, Stationen, Auswertung)");
  const SPRACHEN = ["de", "tr", "en", "ar", "es", "ru", "sr", "ckb", "kmr", "hi", "ur", "vi", "rif", "fa", "ps", "el", "am", "ti"];
  const RTL = ["ar", "ckb", "ur", "fa", "ps"];
  const wirdGebraucht = new Set();
  for (const sp of SPRACHEN) {
    const t = await neueSeite({ b: 360, h: 740, sprache: sp });
    await zumHub(t);
    await t.waitForSelector(".sp-name");
    const marke = (await t.locator('.sp-karte[data-spiel="kontrolle"] .sp-karte-titel').textContent()).trim();
    pruefe(sp + ": Karte auf der Startseite heißt " + TEXTE_KONTROLLE[sp].koName, marke === TEXTE_KONTROLLE[sp].koName, marke);
    await t.tap('.sp-karte[data-spiel="kontrolle"]');
    await t.waitForSelector(".sp-k-knopf");
    await t.waitForTimeout(500);
    pruefe(sp + ": Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await t.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
    await layoutPruefen(t, sp + " bereit");
    await t.tap(".sp-k-knopf");
    await t.waitForSelector(".sp-k-station:not([disabled])");
    await t.waitForTimeout(500);
    await layoutPruefen(t, sp + " Übersicht");
    const id = await t.getAttribute(".sp-k-buehne", "data-fall"), f = fallVon(id);
    const ant = ENT_RICHTIG.ant(f);
    for (const st of K.STATIONEN) {
      await t.tap('.sp-k-station[data-station="' + st + '"]');
      await t.waitForSelector('.sp-k-panel[data-station="' + st + '"]');
      await layoutPruefen(t, sp + " Station " + st);
      stationPruefen(f, st, await stationLesen(t, st), sp + " " + id + "/" + st);
      if (sp === "ar" || sp === "tr" || sp === "am") { if (st === "reifen" || st === "ausruestung" || st === "licht") await foto(t, "sprache-" + sp + "-" + st); }
      await t.tap('.sp-k-panel .sp-k-ent[data-mangel="' + (ant[st] ? 1 : 0) + '"]');
      await t.waitForSelector(".sp-k-uebersicht");
    }
    await layoutPruefen(t, sp + " Gesamtentscheidung");
    await t.tap('.sp-k-ent[data-ent="' + (K.fahrzeugMangel(f) ? 1 : 0) + '"]');
    await t.waitForSelector(".sp-k-antwort");
    await t.waitForTimeout(400);
    await layoutPruefen(t, sp + " Auswertung");
    const texte = await t.evaluate(() => Array.from(document.querySelectorAll("#spiele-platz *")).filter((e) => e.children.length === 0).map((e) => (e.textContent || "").trim()).filter(Boolean));
    pruefe(sp + ": kein roher Schlüsselname sichtbar", !texte.some((x) => /^ko[A-Z][A-Za-z0-9]+$/.test(x) || /^(laden|fehler|start|nochmal)$/.test(x)), texte.filter((x) => /^ko[A-Z]/.test(x)).join());
    // Die Texte der Auswertung sind genau die dieser Sprache
    const soll = new Set(); K.STATIONEN.forEach((st) => K.pruefeStation(f, st).zeilen.forEach((z) => soll.add(TEXTE_KONTROLLE[sp][z.k])));
    soll.add(TEXTE_KONTROLLE[sp][K.fahrzeugMangel(f) ? "koEndRichtigM" : "koEndRichtigW"]);
    const ist = await t.locator(".sp-k-satz").allTextContents();
    pruefe(sp + ": Erklärsätze in dieser Sprache (" + ist.length + ")", ist.every((x) => soll.has(x.trim())) && ist.length >= 5, ist.slice(0, 2).join(" | "));
    ist.forEach((x) => wirdGebraucht.add(x));
    if (sp === "ar" || sp === "am" || sp === "tr") await foto(t, "sprache-" + sp + "-auswertung", true);
    pruefe(sp + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
    await t.context().close();
  }
}

try {
  if (dran("layout")) await layoutTeil();
  if (dran("durchgang")) await durchgangTeil();
  if (dran("uhr")) await uhrTeil();
  if (dran("verlassen")) await verlassenTeil();
  if (dran("sprachen")) await sprachenTeil();
} finally {
  await browser.close();
  server.close();
}
console.log("\n" + bestanden + " Prüfungen bestanden, " + befunde.length + " fehlgeschlagen");
if (befunde.length) { befunde.forEach((b) => console.log(" - " + b)); process.exit(1); }
process.exit(0);
