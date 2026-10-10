// Browser-Prüfung des Fahrlehrer-Simulators (Spiel 5): echte App in einem echten (Chromium-)Browser, mit Fingertipp.
//   - Die App läuft aus diesem Ordner. Weil spiele/spiele.js und spiele/texte.js nicht von diesem Spiel angefasst werden, schiebt der Test
//     den Eintrag in SPIELE und die Texte aus spiele/texte-fahrlehrer.js beim AUSLIEFERN dazu (nur im Speicher; fehlt der Einbau nicht mehr, bleibt alles wie es ist).
//   - Alle Server-Aufrufe der App werden abgefangen: academy-spiele beantwortet die ECHTE Function-Datei (mit Eintrag „fahrlehrer“, siehe
//     werkzeuge/fahrlehrer-server.mjs) gegen eine Datenbank im Speicher; alles andere bekommt leere Standardantworten.
//   - Geprüft: Karte für alle sichtbar (freigegeben 10.10.2026), Start-Knopf in der Mitte, 360x740 / 320x640 / Querformat / Dunkelmodus (nichts abgeschnitten, nichts seitlich
//     wischbar, Tippflächen >= 44 px, nichts unter der Menüleiste), ein voller Durchgang mit echten Fingertipps (richtig, falsch, Zeit abgelaufen),
//     Punkte, Server-Wert, Bestenliste, Verlassen mitten im Spiel, alle 18 Sprachen, RTL, alle 14 Szenarien in den längsten Sprachen bei 320x640.
// Aufruf:  node --experimental-strip-types werkzeuge/pruefe-fahrlehrer-im-browser.mjs
//   (Playwright liegt global: PLAYWRIGHT_PFAD=/opt/node22/lib/node_modules; Browser: PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers)
//   Nur einzelne Teile: NUR=layout,lauf,sprachen,szenen,rest   Bilder landen in $SPIELE_BILDER (Standard ./spiele-bilder, nicht einchecken).
import http from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ladeServer, spieleJsMitFahrlehrer, texteJsMitFahrlehrer } from "./fahrlehrer-server.mjs";
import * as F from "../spiele/fahrlehrer.js";
import { TEXTE_FAHRLEHRER as T } from "../spiele/texte-fahrlehrer.js";
import { RTL } from "../spiele/texte.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire((process.env.PLAYWRIGHT_PFAD || "/opt/node22/lib/node_modules") + "/")("playwright");
const bilder = process.env.SPIELE_BILDER || join(process.cwd(), "spiele-bilder");
mkdirSync(bilder, { recursive: true });
const SPRACHEN = ["de", "tr", "en", "ar", "es", "ru", "sr", "ckb", "kmr", "hi", "ur", "vi", "rif", "fa", "ps", "el", "am", "ti"];

const S = await ladeServer();
const { db, rufe, jetzt } = S;
const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
const schueler = (id, name) => db.academy_schueler.push({ id, name, aktiv: true, ablauf_am: inEinemJahr, schule_id: null, archiviert_am: null });
schueler("t", "Serban Dumitrescu");
db.academy_sessions.push({ session_token: "tok-t", schueler_id: "t", expires_at: inEinemJahr });
[["m1", "Mira Kaya", 1010], ["m2", "Jonas Weber", 930], ["m3", "Ali Reza Karimi", 860], ["m4", "Ayşe Yılmaz", 700]].forEach(([id, n, w]) => {
  schueler(id, n);
  db.academy_spiele_bestwerte.push({ schueler_id: id, spiel: "fahrlehrer", wert: w, erreicht_am: jetzt(), versuche: 2 });
});

// ---- Static-Server für die App (spiele.js und texte.js mit dem Fahrlehrer-Einbau) ----
const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg" };
const server = http.createServer((req, res) => {
  const pfad = join(wurzel, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "") || "index.html");
  if (!pfad.startsWith(wurzel) || !existsSync(pfad) || pfad === wurzel + "/") { res.writeHead(404); res.end("nicht da"); return; }
  let body = readFileSync(pfad);
  if (pfad === join(wurzel, "spiele", "spiele.js")) body = spieleJsMitFahrlehrer(body.toString("utf8"));
  if (pfad === join(wurzel, "spiele", "texte.js")) body = texteJsMitFahrlehrer(body.toString("utf8"));
  res.writeHead(200, { "Content-Type": TYPEN[extname(pfad)] || "application/octet-stream", "Cache-Control": "no-store" });
  res.end(body);
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
  db.academy_spiele_runden = [];   // jede neue Seite beginnt mit leerem Rundenzähler (sonst greift nach 30 Runden in 10 min die Bremse des Servers)
  const ctx = await browser.newContext({ viewport: { width: opt.b, height: opt.h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, colorScheme: opt.dunkel ? "dark" : "light" });
  await ctx.addInitScript((d) => {
    try {
      localStorage.setItem("academy_session", JSON.stringify({ name: "Serban Dumitrescu", session_token: "tok-t", vollzugang: true, agb_akzeptiert_am: "2026-01-01T00:00:00Z", ablauf_am: d.ablauf, klasse: "B", telefon: "0100" }));
      if (!d.ohneFlag) localStorage.setItem("spiele_vorschau", "1");   // Vorschau-Gerät; ohne Flag = normales Schülergerät
      localStorage.setItem("academy_sprache", d.sprache);
    } catch (e) {}
    // Zufall steuerbar: window.__rnd = [Werte] wird der Reihe nach verbraucht (nur für gezieltes Ziehen der Szenarien), sonst echter Zufall
    const echt = Math.random.bind(Math);
    window.__rnd = [];
    Math.random = function () { return window.__rnd.length ? window.__rnd.shift() : echt(); };
  }, { ablauf: inEinemJahr, sprache: opt.sprache || "de", ohneFlag: !!opt.ohneFlag });
  const seite = await ctx.newPage();
  seite.fehler = [];
  seite.breite = opt.b;   // Sollbreite des Geräts: bei zu breitem Inhalt vergrößert der Handy-Browser sonst window.innerWidth selbst und nichts fiele auf
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
  await seite.addStyleTag({ content: "html,body,*{scroll-behavior:auto !important;}" });   // sanftes Scrollen der App würde Fingertipps während des Scrollens verschieben (Messfehler)
  return seite;
}
const zumHub = async (s) => {
  await s.waitForSelector("#drawer-open-btn", { timeout: 15000 });
  await s.tap("#drawer-open-btn");
  await s.waitForSelector('[data-drawer="spiele"]', { state: "visible" });
  await s.tap('[data-drawer="spiele"]');
  await s.waitForSelector(".sp-karte", { timeout: 10000 });
};
const zumSpiel = async (s) => {
  await zumHub(s);
  for (let versuch = 0; versuch < 3; versuch++) {      // die Startseite baut sich kurz nach dem Erscheinen noch um: bei verschlucktem Tipp erneut tippen
    await s.waitForTimeout(400);
    if (await s.locator(".sp-fl-knopf").count()) break;
    await s.evaluate(() => document.querySelector('.sp-karte[data-spiel="fahrlehrer"]').scrollIntoView({ block: "center" }));   // sonst liegt die 5. Karte unter der Menüleiste
    await s.tap('.sp-karte[data-spiel="fahrlehrer"]');
    try { await s.waitForSelector(".sp-fl-knopf", { timeout: 4000 }); break; } catch (e) { if (versuch === 2) { await s.screenshot({ path: join(bilder, "fehler-zumSpiel.png") }); throw e; } }
  }
  await s.waitForTimeout(700);
};

/* Layout: nichts seitlich wischbar, nichts abgeschnitten, Tippflächen groß genug (Zeichnung der Szene selbst ausgenommen: sie wird beschnitten) */
async function layoutPruefen(s, name) {
  const r = await s.evaluate((B) => {
    const probleme = [];
    const de = document.documentElement;
    if (de.scrollWidth > B + 1) probleme.push("Seite wischbar: " + de.scrollWidth + " > " + B);
    document.querySelectorAll("#spiele-platz *").forEach((el) => {
      if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") return;
      const rc = el.getBoundingClientRect();
      if (rc.width === 0 || rc.height === 0) return;
      if (rc.right > B + 1 || rc.left < -1) probleme.push("ragt raus: " + el.className + " " + Math.round(rc.left) + ".." + Math.round(rc.right));
      if (el.children.length === 0 && el.textContent.trim()) {   // Text breiter als sein Kasten (auch bei sichtbarem Überlauf; Buttons melden hier scrollWidth nicht zuverlässig -> Textbreite per Range messen)
        const rg = document.createRange(); rg.selectNodeContents(el);
        const tr = rg.getBoundingClientRect();
        if (tr.right > rc.right + 1.5 || tr.left < rc.left - 1.5 || el.scrollWidth > el.clientWidth + 2) probleme.push("Text läuft über den Rand: " + el.className + " " + Math.round(tr.left) + ".." + Math.round(tr.right) + " in " + Math.round(rc.left) + ".." + Math.round(rc.right));
      }
      if (el.matches(".sp-fl-wahl,.sp-fl-weiter,.sp-fl-aufloesung,.sp-fl-bild,.sp-fl-frage,.sp-fl-zeilentext,.sp-fl-regel p") && el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflowY !== "visible") probleme.push("Text abgeschnitten (Höhe): " + el.className);
    });
    document.querySelectorAll(".sp-fl-wahl,.sp-fl-weiter,.sp-fl-knopf,.sp-schalter,.sp-karte").forEach((el) => {
      const rc = el.getBoundingClientRect();
      if (rc.height > 0 && (rc.height < 43.5 || rc.width < 43.5)) probleme.push("Tippfläche klein: " + el.className + " " + Math.round(rc.width) + "x" + Math.round(rc.height));
    });
    return probleme;
  }, s.breite);
  pruefe(name + ": Layout ohne Überstand/Abschneiden/kleine Knöpfe", r.length === 0, r.slice(0, 4).join(" | "));
}
/* Ist das Element nach dem Scrollen ans Seitenende noch über der Menüleiste und im Bild? */
async function erreichbar(s, selektor, name) {
  const r = await s.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { fehlt: true };
    const nav = document.querySelector(".bottom-nav");
    const vorher = window.scrollY;
    window.scrollTo(0, document.documentElement.scrollHeight);
    el.scrollIntoView({ block: "nearest" });
    const rc = el.getBoundingClientRect(), navTop = nav && nav.getBoundingClientRect().height > 0 ? nav.getBoundingClientRect().top : window.innerHeight;
    return { oben: rc.top, unten: rc.bottom, navTop, h: window.innerHeight, vorher };
  }, selektor);
  pruefe(name + ": erreichbar (im Bild, nicht unter der Menüleiste)", !r.fehlt && r.oben >= -1 && r.unten <= r.navTop + 1, JSON.stringify(r));
  await s.evaluate((y) => window.scrollTo(0, y), r.vorher || 0);   // Lesestelle wie vorher (das Spiel scrollt die Bühne selbst an den Anfang; Tippen unter der Menüleiste wäre kein echter Fall)
}

const capText = (sp, s) => T[sp][s.bild];
const szenarioAusSeite = async (s, sp) => {
  const cap = await s.textContent(".sp-fl-bild");
  return F.SZENARIEN.find((z) => cap.includes(capText(sp, z)));
};
/* Reihenfolge der Szenarien erzwingen: Math.random so füttern, dass mischen() die gewünschten Szenarien nach vorn legt */
function zufallFuer(erste) {
  const n = F.SZENARIEN.length, rest = [...Array(n).keys()].filter((i) => !erste.includes(i));
  const ziel = erste.concat(rest);
  const a = [...Array(n).keys()], werte = [];
  for (let i = n - 1; i >= 1; i--) { const j = a.indexOf(ziel[i]); werte.push((j + 0.5) / (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return werte;
}
const warteAuf = (s, fn, arg, ms) => s.waitForFunction(fn, arg, { timeout: ms || 6000 });

/* Ein Durchgang. plan[i] = [modus1, modus2] mit "richtig" | "falsch" | "zeit". Prüft jeden Schritt in Sprache sp. */
async function durchgang(s, sp, plan, opt) {
  opt = opt || {};
  const t = T[sp];
  const gesehen = [];
  let summe = 0, richtigZahl = 0;
  if (opt.erste) await s.evaluate((w) => { window.__rnd = w.slice(); }, zufallFuer(opt.erste));
  await s.tap(".sp-fl-knopf");
  await s.waitForSelector(".sp-fl-wahl", { timeout: 9000 });
  await s.evaluate(() => { window.__rnd = []; });
  for (let r = 0; r < F.ANZAHL_RUNDEN; r++) {
    const z = await szenarioAusSeite(s, sp);
    pruefe(sp + " Runde " + (r + 1) + ": Szene erkannt", !!z, await s.textContent(".sp-fl-bild"));
    if (!z) return null;
    gesehen.push(z.id);
    if (opt.erste && r < opt.erste.length) pruefe(sp + " Runde " + (r + 1) + ": gewünschtes Szenario " + F.SZENARIEN[opt.erste[r]].id, z.id === F.SZENARIEN[opt.erste[r]].id, z.id);
    const hud = (await s.textContent(".sp-fl-runde")).trim();
    pruefe(sp + " Runde " + (r + 1) + ": Anzeige „" + t.flRunde.replace("{n}", r + 1).replace("{m}", 8) + "“", hud === t.flRunde.replace("{n}", r + 1).replace("{m}", String(F.ANZAHL_RUNDEN)), hud);
    const capVoll = (await s.textContent(".sp-fl-bild")).trim();
    pruefe(sp + " Runde " + (r + 1) + ": Bildbeschreibung = Text des Szenarios + Legende", capVoll === (t[z.bild] + " " + t.flLegende).trim().replace(/\s+/g, " ") || capVoll.replace(/\s+/g, " ") === (t[z.bild] + " " + t.flLegende).replace(/\s+/g, " "), capVoll);
    const aria = await s.getAttribute(".sp-fl-svg", "aria-label");
    pruefe(sp + " Runde " + (r + 1) + ": Zeichnung hat Beschreibung für Screenreader", aria === t[z.bild], aria);
    const rundeRichtig = [], rundePunkte = [];
    for (let q = 1; q <= 2; q++) {
      const modus = plan[r][q - 1];
      const gruppe = q === 1 ? z.fehler : z.korrektur;
      const sollTexte = [gruppe.richtig].concat(gruppe.falsch).map((key) => t[key]);
      await s.waitForFunction((n) => { const f = document.querySelector(".sp-fl-frage"); return f && f.querySelector(".sp-fl-schritt") && document.querySelectorAll(".sp-fl-wahl:not([disabled])").length === 3 && /\d/.test(f.querySelector(".sp-fl-schritt").textContent) && f.textContent.length > 5 && !f.classList.contains("urteil"); }, q, { timeout: 5000 });
      const frageText = (await s.textContent(".sp-fl-frage")).replace(/\s+/g, " ").trim();
      const erwartetFrage = (t.flSchritt.replace("{n}", q).replace("{m}", "2") + " " + (q === 1 ? t.flFrage1 : t.flFrage2)).replace(/\s+/g, " ");
      pruefe(sp + " R" + (r + 1) + " Frage " + q + ": Titel „" + erwartetFrage.slice(0, 40) + "…“", frageText === erwartetFrage, frageText);
      const texte = await s.locator(".sp-fl-wahl").allTextContents();
      pruefe(sp + " R" + (r + 1) + " Frage " + q + ": drei Antworten, genau die drei Texte des Szenarios", texte.length === 3 && JSON.stringify(texte.map((x) => x.trim()).sort()) === JSON.stringify(sollTexte.slice().sort()), texte.join(" | ").slice(0, 200));
      if (opt.layout && r === 0) { await layoutPruefen(s, sp + " R1 Frage " + q + " " + opt.layout); await erreichbar(s, ".sp-fl-wahl:last-child", sp + " R1 Frage " + q + " letzte Antwort " + opt.layout); }
      if (opt.bild && r === 0 && q === 1) await s.screenshot({ path: join(bilder, opt.bild + "-frage.png") });
      const idxRichtig = texte.findIndex((x) => x.trim() === t[gruppe.richtig]);
      const idxFalsch = [0, 1, 2].find((i) => i !== idxRichtig);
      const vorher = performance.now();
      if (modus === "zeit") {
        await s.waitForFunction(() => document.querySelector(".sp-fl-frage.urteil"), null, { timeout: F.LIMIT_MS + 6000 });
      } else {
        await s.locator(".sp-fl-wahl").nth(modus === "richtig" ? idxRichtig : idxFalsch).tap();
      }
      try { await s.waitForSelector(".sp-fl-frage.urteil", { timeout: 8000 }); } catch (e) {
        await s.screenshot({ path: join(bilder, "fehler-urteil-" + sp + ".png") });
        console.log("  Zustand: " + JSON.stringify(await s.evaluate(() => ({ frage: document.querySelector(".sp-fl-frage").outerHTML.slice(0, 200), wahl: Array.from(document.querySelectorAll(".sp-fl-wahl")).map((b) => b.className + (b.disabled ? " [aus]" : "")), y: window.scrollY }))));
        throw e;
      }
      const urteil = (await s.textContent(".sp-fl-frage")).trim();
      const info = await s.evaluate(() => ({ richtig: document.querySelectorAll(".sp-fl-wahl.richtig").length, falsch: document.querySelectorAll(".sp-fl-wahl.falsch").length, aus: document.querySelectorAll(".sp-fl-wahl[disabled]").length, punkte: +document.querySelector(".sp-fl-punkte b").textContent }));
      if (modus === "richtig") {
        const m = /^(.*) \+(\d+)$/.exec(urteil);
        pruefe(sp + " R" + (r + 1) + " Frage " + q + ": „" + t.flRichtig + " +Punkte“ mit 50–75 Punkten", !!m && m[1] === t.flRichtig && +m[2] >= 50 && +m[2] <= 75, urteil);
        const p = m ? +m[2] : 0; summe += p; richtigZahl++; rundePunkte[q - 1] = p; rundeRichtig[q - 1] = true;
        pruefe(sp + " R" + (r + 1) + " Frage " + q + ": Punkteanzeige zählt hoch", info.punkte === summe, info.punkte + " / " + summe);
        pruefe(sp + " R" + (r + 1) + " Frage " + q + ": nur die richtige Antwort grün, keine rot", info.richtig === 1 && info.falsch === 0 && info.aus === 3);
      } else {
        pruefe(sp + " R" + (r + 1) + " Frage " + q + ": " + (modus === "zeit" ? "Zeit abgelaufen" : "falsch") + " -> Text, 0 Punkte", urteil === (modus === "zeit" ? t.flZeitAus : t.flFalsch) && info.punkte === summe, urteil + " / " + info.punkte);
        pruefe(sp + " R" + (r + 1) + " Frage " + q + ": richtige Antwort grün" + (modus === "zeit" ? "" : ", gewählte rot"), info.richtig === 1 && info.falsch === (modus === "zeit" ? 0 : 1) && info.aus === 3, JSON.stringify(info));
        rundePunkte[q - 1] = 0; rundeRichtig[q - 1] = false;
      }
      void vorher;
      if (q === 1) { /* nach kurzer Pause kommt Frage 2 von selbst */ }
    }
    await s.waitForSelector(".sp-fl-aufloesung:not([hidden])", { timeout: 5000 });
    const auf = await s.evaluate(() => ({
      zeilen: Array.from(document.querySelectorAll(".sp-fl-zeile")).map((z) => ({ ok: z.classList.contains("ja"), text: z.querySelector(".sp-fl-zeilentext").textContent.replace(/\s+/g, " ").trim() })),
      regel: document.querySelector(".sp-fl-regel p").textContent.trim(), weiter: document.querySelector(".sp-fl-weiter").textContent.trim(),
      antwortenSichtbar: !document.querySelector(".sp-fl-antworten").hidden, punkte: +document.querySelector(".sp-fl-punkte b").textContent
    }));
    pruefe(sp + " R" + (r + 1) + ": Auflösung zeigt zwei Zeilen mit der richtigen Anweisung/dem richtigen Fehler", auf.zeilen.length === 2 && auf.zeilen[0].text.includes(t[z.fehler.richtig]) && auf.zeilen[1].text.includes(t[z.korrektur.richtig]) && auf.zeilen[0].text.includes(t.flLabelFehler) && auf.zeilen[1].text.includes(t.flLabelAnweisung), JSON.stringify(auf.zeilen).slice(0, 200));
    pruefe(sp + " R" + (r + 1) + ": Haken/Kreuz passen zu den Antworten, +Punkte nur bei richtig", auf.zeilen[0].ok === rundeRichtig[0] && auf.zeilen[1].ok === rundeRichtig[1] && auf.zeilen.every((zz, i) => /\+\d+/.test(zz.text) === zz.ok && (!zz.ok || zz.text.includes("+" + rundePunkte[i]))), JSON.stringify(auf.zeilen).slice(0, 220));
    pruefe(sp + " R" + (r + 1) + ": Regel/Begründung des Szenarios steht da", auf.regel === t[z.regel], auf.regel.slice(0, 80));
    pruefe(sp + " R" + (r + 1) + ": Knopf „" + (r === 7 ? t.flErgebnisZeigen : t.flWeiter) + "“, Antworten ausgeblendet", auf.weiter === (r === 7 ? t.flErgebnisZeigen : t.flWeiter) && !auf.antwortenSichtbar);
    if (opt.layout && (r < 2 || opt.alleRunden)) { await layoutPruefen(s, sp + " R" + (r + 1) + " Auflösung " + opt.layout); await erreichbar(s, ".sp-fl-weiter", sp + " R" + (r + 1) + " Weiter " + opt.layout); }
    if (opt.bild && r === 0) await s.screenshot({ path: join(bilder, opt.bild + "-aufloesung.png"), fullPage: true });
    await s.locator(".sp-fl-weiter").tap();
    if (r < F.ANZAHL_RUNDEN - 1) await warteAuf(s, (n) => (document.querySelector(".sp-fl-runde")?.textContent || "").includes(String(n)) && document.querySelectorAll(".sp-fl-wahl:not([disabled])").length === 3, r + 2, 5000);
  }
  await s.waitForSelector(".sp-erg", { timeout: 6000 });
  return { summe, richtig: richtigZahl, gesehen };
}

const alle = (n) => Array.from({ length: F.ANZAHL_RUNDEN }, () => [n, n]);
const nurListe = (process.env.NUR || "").split(",").filter(Boolean);
const dran = (name) => !nurListe.length || nurListe.includes(name);

try {
  if (dran("layout")) {
    console.log("Karte auf normalen Geräten (freigegeben)");
    let v = await neueSeite({ b: 360, h: 740, ohneFlag: true });
    await zumHub(v);
    pruefe("normales Schülergerät: Fahrlehrer-Karte sichtbar (freigegeben)", (await v.locator('.sp-karte[data-spiel="fahrlehrer"]').count()) === 1);
    await v.context().close();
    v = await neueSeite({ b: 360, h: 740 });
    await zumHub(v);
    pruefe("Vorschau-Gerät: Karte da, mit Titel, Kurztext und Symbol", (await v.locator('.sp-karte[data-spiel="fahrlehrer"]').count()) === 1 && (await v.textContent('.sp-karte[data-spiel="fahrlehrer"] .sp-karte-titel')).trim() === T.de.flName && (await v.textContent('.sp-karte[data-spiel="fahrlehrer"] .sp-karte-kurz')).trim() === T.de.flKurz && (await v.locator('.sp-karte[data-spiel="fahrlehrer"] svg').count()) === 1);
    await layoutPruefen(v, "Startseite mit Fahrlehrer-Karte 360");
    await v.waitForTimeout(600);
    await v.screenshot({ path: join(bilder, "fahrlehrer-startseite-360.png"), fullPage: true });
    await v.context().close();

    console.log("Layout in Ruhe (Start-Knopf in der Mitte, Anleitung)");
    for (const g of [{ b: 360, h: 740, n: "360" }, { b: 412, h: 915, n: "412" }, { b: 320, h: 640, n: "320" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }, { b: 740, h: 360, n: "quer 740x360" }, { b: 640, h: 360, n: "quer 640x360" }]) {
      const p = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
      await zumSpiel(p);
      await layoutPruefen(p, "Fahrlehrer bereit " + g.n);
      const m = await p.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); const sz = g(".sp-fl-szene"), kn = g(".sp-fl-knopf"); return { dx: Math.abs((kn.left + kn.width / 2) - (sz.left + sz.width / 2)), dy: Math.abs((kn.top + kn.height / 2) - (sz.top + sz.height / 2)), knUnten: kn.bottom, knOben: kn.top, h: window.innerHeight, szeneB: sz.width, text: document.querySelector(".sp-fl-knopf").textContent.trim() }; });
      pruefe("Fahrlehrer " + g.n + ": Start-Knopf mitten über der abgeblendeten Szene, ganz im Bild", m.dx < 3 && m.dy < 3 && m.knOben >= 0 && m.knUnten <= m.h - 70 && m.text === "Start", JSON.stringify(m));
      pruefe("Fahrlehrer " + g.n + ": Titel und Anleitung (Phase „bereit“)", (await p.textContent(".sp-fahrlehrer .sp-spieltitel")) === T.de.flName && (g.h < 520 || (await p.textContent(".sp-fl-anleitung")).trim() === T.de.flBereit));
      await p.screenshot({ path: join(bilder, "fahrlehrer-bereit-" + g.n.replace(/\W+/g, "_") + ".png") });
      pruefe("Fahrlehrer " + g.n + ": keine Konsolenfehler", p.fehler.length === 0, p.fehler.join(" | "));
      await p.context().close();
    }
  }

  if (dran("lauf")) {
    console.log("Voller Durchgang (360 x 740, Deutsch): richtig, falsch, Zeit abgelaufen, echte Fingertipps (ca. 1,5 Minuten)");
    const v = await neueSeite({ b: 360, h: 740 });
    await zumSpiel(v);
    const plan = [["richtig", "richtig"], ["falsch", "richtig"], ["richtig", "falsch"], ["richtig", "richtig"], ["falsch", "falsch"], ["richtig", "richtig"], ["zeit", "richtig"], ["richtig", "richtig"]];
    const erg = await durchgang(v, "de", plan, { layout: "360", bild: "fahrlehrer-360", erste: [0, 1, 2, 3, 4, 5, 6, 7] });
    pruefe("Durchgang: alle 8 Szenarien verschieden", !!erg && new Set(erg.gesehen).size === 8, JSON.stringify(erg && erg.gesehen));
    const soll = plan.flat().filter((x) => x === "richtig").length;
    pruefe("Durchgang: " + soll + " von 16 richtig gewertet", !!erg && erg.richtig === soll, JSON.stringify(erg));
    const ge = await v.evaluate(() => ({ gross: +document.querySelector(".sp-gross").textContent, richtig: document.querySelector(".sp-fl-richtigzahl").textContent.trim(), hinweis: document.querySelector(".sp-hinweis-strasse").textContent.trim(), knopf: document.querySelector(".sp-fl-knopf").textContent.trim(), knopfSichtbar: !document.querySelector(".sp-fl-knopf").hidden }));
    pruefe("Ergebnis: Punkte = Summe aller Teilantworten, „" + soll + " von 16 Antworten richtig“, Hinweis, Knopf „Nochmal“", !!erg && ge.gross === erg.summe && ge.richtig === T.de.flRichtigVon.replace("{n}", soll).replace("{m}", "16") && ge.hinweis === T.de.flHinweis && ge.knopf === "Nochmal" && ge.knopfSichtbar, JSON.stringify(ge) + " / " + (erg && erg.summe));
    await v.waitForSelector(".sp-badge.neu");
    const gesp = db.academy_spiele_bestwerte.find((b) => b.schueler_id === "t" && b.spiel === "fahrlehrer");
    pruefe("Server hat die Punkte gespeichert (Wert = Summe, 50–75 Punkte je richtiger Teilantwort)", !!gesp && !!erg && gesp.wert === erg.summe && gesp.wert >= soll * 50 && gesp.wert <= soll * 75, JSON.stringify(gesp));
    pruefe("Rekord-Marke + Platz", (await v.textContent(".sp-speicher")).includes(T.de.flNeu) && /Platz \d+ von \d+/.test(await v.textContent(".sp-speicher")), await v.textContent(".sp-speicher"));
    await v.waitForSelector(".sp-zeile.ich");
    const pw = (await v.locator(".sp-zeile .sp-wert").allTextContents()).map((x) => parseInt(x, 10));
    pruefe("Bestenliste: meiste Punkte zuerst, Einheit „Punkte“", pw.length >= 5 && pw.every((x, i) => i === 0 || x <= pw[i - 1]) && (await v.locator(".sp-zeile .sp-wert").first().textContent()).includes("Punkte"), pw.join(","));
    await layoutPruefen(v, "Fahrlehrer Ergebnis 360");
    await v.screenshot({ path: join(bilder, "fahrlehrer-ergebnis-360.png"), fullPage: true });
    pruefe("Konsole ohne Fehler (voller Durchgang)", v.fehler.length === 0, v.fehler.join(" | "));
    // zweiter Durchgang über „Nochmal“: neue Runde, Ergebnis des alten verschwindet, schlechterer Wert -> kein Rekord
    await v.tap(".sp-fl-knopf");
    await v.waitForSelector(".sp-fl-wahl", { timeout: 9000 });
    pruefe("„Nochmal“: neuer Durchgang startet (Runde 1, 0 Punkte, altes Ergebnis weg)", (await v.textContent(".sp-fl-runde")).trim() === T.de.flRunde.replace("{n}", "1").replace("{m}", "8") && (await v.textContent(".sp-fl-punkte b")) === "0" && (await v.locator(".sp-ergebnis").isHidden()));
    // Verlassen mitten im Spiel
    await v.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
    await v.waitForTimeout(300);
    pruefe("App im Hintergrund: Spiel abgebrochen, leere Straße, „Start“", (await v.locator(".sp-fl-wahl").count()) === 0 && (await v.textContent(".sp-fl-knopf")).trim() === "Start" && (await v.textContent(".sp-fl-punkte b")) === "0");
    await v.evaluate(() => { delete document.hidden; });
    await v.tap(".sp-fl-knopf"); await v.waitForSelector(".sp-fl-wahl", { timeout: 9000 });
    await v.locator(".sp-fl-wahl").first().tap();
    await v.tap("[data-nav-zurueck]");     // mitten in der Pause zurück zur Startseite
    await v.waitForSelector(".sp-karte");
    await v.waitForTimeout(3500);
    pruefe("nach dem Verlassen mitten im Spiel keine Fehler / späten Zeitgeber", v.fehler.length === 0, v.fehler.join(" | "));
    pruefe("Startseite zeigt die Bestpunktzahl", (await v.textContent('[data-best="fahrlehrer"]')).includes(T.de.flBestwert + ": " + (erg ? erg.summe : "?") + " Punkte"), await v.textContent('[data-best="fahrlehrer"]'));
    await v.context().close();
  }

  if (dran("rest")) {
    console.log("Querformat 740 x 360 und 640 x 360 (Frage, Antworten, Auflösung)");
    for (const g of [{ b: 740, h: 360 }, { b: 640, h: 360 }]) {
      const v = await neueSeite({ b: g.b, h: g.h });
      await zumSpiel(v);
      await v.tap(".sp-fl-knopf");
      await v.waitForSelector(".sp-fl-wahl", { timeout: 9000 });
      await v.waitForTimeout(700);
      await layoutPruefen(v, "Querformat " + g.b + "x" + g.h + " Frage");
      const rq = await v.evaluate(() => { const g = (q) => document.querySelector(q).getBoundingClientRect(); const nav = document.querySelector(".bottom-nav").getBoundingClientRect(); const wahl = Array.from(document.querySelectorAll(".sp-fl-wahl")).map((e) => e.getBoundingClientRect()); return { hudO: g(".sp-fl-hud").top, szeneO: g(".sp-fl-szene").top, szeneU: g(".sp-fl-szene").bottom, szeneB: g(".sp-fl-szene").width, wahlO: Math.min(...wahl.map((r) => r.top)), wahlU: Math.max(...wahl.map((r) => r.bottom)), navTop: nav.height > 0 ? nav.top : window.innerHeight, h: window.innerHeight, rechtsTexte: Math.max(...wahl.map((r) => r.right)), w: window.innerWidth }; });
      pruefe("Querformat " + g.b + "x" + g.h + ": Szene (mind. 190 px breit) und alle drei Antworten im Bild, über der Menüleiste", rq.hudO >= 0 && rq.szeneO >= 0 && rq.szeneB >= 190 && rq.wahlO >= 0 && rq.wahlU <= rq.navTop + 1 && rq.szeneU <= rq.navTop + 1, JSON.stringify(rq));
      await v.screenshot({ path: join(bilder, "fahrlehrer-quer-" + g.b + "x" + g.h + "-frage.png") });
      const z = await szenarioAusSeite(v, "de");
      const texte = await v.locator(".sp-fl-wahl").allTextContents();
      await v.locator(".sp-fl-wahl").nth(texte.findIndex((x) => x.trim() === T.de[z.fehler.richtig])).tap();
      await v.waitForFunction(() => document.querySelectorAll(".sp-fl-wahl:not([disabled])").length === 3, null, { timeout: 4000 });
      const t2 = await v.locator(".sp-fl-wahl").allTextContents();
      await v.locator(".sp-fl-wahl").nth(t2.findIndex((x) => x.trim() === T.de[z.korrektur.richtig])).tap();
      await v.waitForSelector(".sp-fl-aufloesung:not([hidden])");
      await v.waitForTimeout(500);
      await layoutPruefen(v, "Querformat " + g.b + "x" + g.h + " Auflösung");
      await erreichbar(v, ".sp-fl-weiter", "Querformat " + g.b + "x" + g.h + " Weiter");
      await v.screenshot({ path: join(bilder, "fahrlehrer-quer-" + g.b + "x" + g.h + "-aufloesung.png"), fullPage: true });
      pruefe("Querformat: keine Konsolenfehler", v.fehler.length === 0, v.fehler.join(" | "));
      await v.context().close();
    }
    console.log("Handy hoch klein 320 x 640 und Dunkelmodus 412 x 915 (Frage + Auflösung, Deutsch)");
    for (const g of [{ b: 320, h: 640, n: "320" }, { b: 412, h: 915, n: "412 dunkel", dunkel: true }]) {
      const v = await neueSeite({ b: g.b, h: g.h, dunkel: g.dunkel });
      await zumSpiel(v);
      await durchgang(v, "de", [["falsch", "richtig"]].concat(alle("richtig").slice(1)), { layout: g.n, bild: "fahrlehrer-" + g.n.replace(/\W+/g, "_") });
      await v.context().close();
    }
  }

  if (dran("sprachen")) {
    console.log("Alle 18 Sprachen (360 x 740): eine Runde mit Frage, Pause, zweiter Frage und Auflösung");
    for (const sp of SPRACHEN) {
      const t = await neueSeite({ b: 360, h: 740, sprache: sp });
      await zumHub(t);
      await t.waitForSelector('.sp-karte[data-spiel="fahrlehrer"]');
      pruefe(sp + ": Karte übersetzt (Titel, Kurztext)", (await t.textContent('.sp-karte[data-spiel="fahrlehrer"] .sp-karte-titel')).trim() === T[sp].flName && (await t.textContent('.sp-karte[data-spiel="fahrlehrer"] .sp-karte-kurz')).trim() === T[sp].flKurz);
      await t.evaluate(() => document.querySelector('.sp-karte[data-spiel="fahrlehrer"]').scrollIntoView({ block: "center" }));
      await t.tap('.sp-karte[data-spiel="fahrlehrer"]');
      await t.waitForSelector(".sp-fl-knopf");
      await t.waitForTimeout(500);
      pruefe(sp + ": Richtung " + (RTL.includes(sp) ? "rtl" : "ltr"), (await t.getAttribute("#spiele-platz", "dir")) === (RTL.includes(sp) ? "rtl" : "ltr"));
      await layoutPruefen(t, sp + " bereit");
      await t.tap(".sp-fl-knopf");
      await t.waitForSelector(".sp-fl-wahl", { timeout: 9000 });
      const z = await szenarioAusSeite(t, sp);
      pruefe(sp + ": Szenario erkannt (Bildbeschreibung in der Sprache)", !!z);
      if (z) {
        const texte1 = await t.locator(".sp-fl-wahl").allTextContents();
        pruefe(sp + ": Frage 1 mit Titel und drei übersetzten Antworten", (await t.textContent(".sp-fl-frage")).replace(/\s+/g, " ").includes(T[sp].flFrage1) && [z.fehler.richtig].concat(z.fehler.falsch).every((key) => texte1.some((x) => x.trim() === T[sp][key])));
        await layoutPruefen(t, sp + " Frage 1");
        await t.locator(".sp-fl-wahl").nth(texte1.findIndex((x) => x.trim() === T[sp][z.fehler.falsch[0]])).tap();
        const urteil = (await t.textContent(".sp-fl-frage")).trim();
        pruefe(sp + ": Urteil „" + T[sp].flFalsch + "“", urteil === T[sp].flFalsch, urteil);
        await t.waitForFunction(() => document.querySelectorAll(".sp-fl-wahl:not([disabled])").length === 3, null, { timeout: 4000 });
        const texte2 = await t.locator(".sp-fl-wahl").allTextContents();
        pruefe(sp + ": Frage 2 mit Titel und drei übersetzten Antworten", (await t.textContent(".sp-fl-frage")).replace(/\s+/g, " ").includes(T[sp].flFrage2) && [z.korrektur.richtig].concat(z.korrektur.falsch).every((key) => texte2.some((x) => x.trim() === T[sp][key])));
        await layoutPruefen(t, sp + " Frage 2");
        await t.locator(".sp-fl-wahl").nth(texte2.findIndex((x) => x.trim() === T[sp][z.korrektur.richtig])).tap();
        const u2 = (await t.textContent(".sp-fl-frage")).trim();
        pruefe(sp + ": Urteil „" + T[sp].flRichtig + " +…“", u2.startsWith(T[sp].flRichtig + " +"), u2);
        await t.waitForSelector(".sp-fl-aufloesung:not([hidden])");
        const info = await t.evaluate(() => ({ alles: document.querySelector("#spiele-platz").textContent, regel: document.querySelector(".sp-fl-regel p").textContent.trim(), weiter: document.querySelector(".sp-fl-weiter").textContent.trim() }));
        pruefe(sp + ": Regel und „Weiter“ in der Sprache, kein roher Schlüssel, kein {n}/{m}", info.regel === T[sp][z.regel] && info.weiter === T[sp].flWeiter && !/\bfl[A-Z]\w+|\{[nm]\}/.test(info.alles), info.alles.slice(0, 120));
        await layoutPruefen(t, sp + " Auflösung");
        await erreichbar(t, ".sp-fl-weiter", sp + " Weiter");
        if (["ar", "am", "tr", "ps"].includes(sp)) { await t.waitForTimeout(400); await t.screenshot({ path: join(bilder, "fahrlehrer-sprache-" + sp + ".png"), fullPage: true }); }
      }
      pruefe(sp + ": keine Konsolenfehler", t.fehler.length === 0, t.fehler.join(" | "));
      await t.context().close();
    }
  }

  if (dran("szenen")) {
    // alle 14 Szenarien in den Sprachen mit den längsten Texten bei 320 x 640 (das engste Handy): zwei Durchgänge mit erzwungener Reihenfolge decken den ganzen Pool ab
    const laenge = (sp) => Object.values(T[sp]).reduce((a, x) => a + x.length, 0);
    const lang = process.env.NUR_SPRACHE ? process.env.NUR_SPRACHE.split(",") : SPRACHEN.filter((sp) => sp !== "de").sort((a, b) => laenge(b) - laenge(a)).slice(0, 3).concat(["ar", "de"]).filter((x, i, a) => a.indexOf(x) === i);
    console.log("Alle 14 Szenarien bei 320 x 640 in: " + lang.join(", ") + " (je zwei Durchgänge, alle Runden geprüft)");
    for (const sp of lang) {
      const gesehen = new Set();
      for (const erste of [[0, 1, 2, 3, 4, 5, 6, 7], [6, 7, 8, 9, 10, 11, 12, 13]]) {
        const v = await neueSeite({ b: 320, h: 640, sprache: sp });
        await zumSpiel(v);
        const plan = Array.from({ length: F.ANZAHL_RUNDEN }, (_, i) => (i % 2 ? ["falsch", "richtig"] : ["richtig", "falsch"]));
        const erg = await durchgang(v, sp, plan, { layout: "320", alleRunden: true, erste: erste });
        (erg ? erg.gesehen : []).forEach((x) => gesehen.add(x));
        await layoutPruefen(v, sp + " Ergebnis 320");
        pruefe(sp + ": keine Konsolenfehler (320er Durchgang)", v.fehler.length === 0, v.fehler.join(" | "));
        await v.context().close();
      }
      pruefe(sp + ": alle 14 Szenarien einmal gesehen", gesehen.size === F.SZENARIEN.length, [...gesehen].join(","));
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log("\n" + bestanden + " Prüfungen bestanden, " + befunde.length + " Befunde");
if (befunde.length) { console.log("Befunde:\n - " + befunde.join("\n - ")); process.exitCode = 1; }
