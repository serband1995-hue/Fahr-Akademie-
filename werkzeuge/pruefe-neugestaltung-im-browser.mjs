// Browser-Prüfung der Neugestaltung (10.10.2026): echte App, echter Chromium, Fingertipp, Server-Antworten abgefangen.
// Katalog, Session-Auffrischung und Szenen werden nachgebaut (nichts geht an die echte Datenbank).
// Aufruf: node werkzeuge/pruefe-neugestaltung-im-browser.mjs   (Playwright global: PLAYWRIGHT_PFAD=/opt/node22/lib/node_modules)
// Bilder: $NEU_BILDER (Standard ./neu-bilder, nicht einchecken).
import http from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire((process.env.PLAYWRIGHT_PFAD || "/opt/node22/lib/node_modules") + "/")("playwright");
const bilder = process.env.NEU_BILDER || join(process.cwd(), "neu-bilder");
mkdirSync(bilder, { recursive: true });

const STUFEN = ["Fahrzeug & Technik", "Stoppschild-Situationen", "Fahrmanöver-Grundlagen", "Abbiegen, Vorfahrt & Verkehrszeichen", "Autobahn", "Prüfung", "Prüfungsstrecken"];
// Beispiel-Katalog: je Bereich 3 Themen mit je 2 Videos. Nur "Fahrzeug & Technik" ist gratis, dazu ein Kostprobe-Video.
const tags = [], videos = [], video_tags = [];
STUFEN.forEach((st, si) => { for (let k = 0; k < 3; k++) {
  const tid = "t" + si + k; tags.push({ id: tid, label: st + " " + (k + 1), stufe: st, reihenfolge: si * 10 + k, gratis: si === 0, archiviert: false, nur_klasse: null });
  for (let v = 0; v < 2; v++) { const vid = "v" + si + k + v; videos.push({ id: vid, titel: "Video " + st.slice(0, 8) + " " + (k + 1) + "." + (v + 1), hat_video: true, status: "live", ausgeblendet: false, dauer_sekunden: 240 + v * 60, reihenfolge: si * 100 + k * 10 + v, gratis: si === 6 && k === 0 && v === 0 }); video_tags.push({ video_id: vid, tag_id: tid }); }
} });

const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const pfad = join(wurzel, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "") || "index.html");
  if (!pfad.startsWith(wurzel) || !existsSync(pfad) || pfad === wurzel + "/") { res.writeHead(404); res.end("nicht da"); return; }
  res.writeHead(200, { "Content-Type": TYPEN[extname(pfad)] || "application/octet-stream" }); res.end(readFileSync(pfad));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const basis = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PFAD || undefined });
const befunde = []; let bestanden = 0;
const pruefe = (name, ok, detail) => { if (ok) { bestanden++; console.log("  ok   " + name); } else { befunde.push(name + (detail ? " -> " + detail : "")); console.log("  FEHL " + name + (detail ? " -> " + detail : "")); process.exitCode = 1; } };
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS" };
const inEinemJahr = new Date(Date.now() + 365 * 86_400_000).toISOString();
const tageVon = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

/* opt: b, h, voll, termin (Tage oder null), sprache, dunkel, klasse */
export async function neueSeite(opt) {
  const ctx = await browser.newContext({ viewport: { width: opt.b, height: opt.h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, colorScheme: opt.dunkel ? "dark" : "light", reducedMotion: opt.ruhig ? "reduce" : "no-preference" });
  const sess = { name: "Lena Beispiel", session_token: "tok", vollzugang: !!opt.voll, agb_akzeptiert_am: "2026-01-01T00:00:00Z", ablauf_am: inEinemJahr, klasse: opt.klasse || "B", telefon: "0100", pruefungstermin: opt.termin == null ? null : tageVon(opt.termin) };
  await ctx.addInitScript((d) => { try { localStorage.setItem("academy_session", JSON.stringify(d.s)); localStorage.setItem("academy_sprache", d.sprache); } catch (e) {} }, { s: sess, sprache: opt.sprache || "de" });
  const seite = await ctx.newPage(); seite.fehler = [];
  seite.on("pageerror", (e) => seite.fehler.push("pageerror: " + e.message));
  seite.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR|fonts\.g/.test(m.text())) seite.fehler.push("console: " + m.text()); });
  await seite.route("**/*", async (route) => {
    const u = route.request().url();
    if (u.startsWith(basis)) return route.continue();
    const m = u.match(/\/functions\/v1\/([a-z0-9-]+)/);
    if (!m) return route.abort();
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const antwort = (status, body) => route.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) });
    const f = m[1];
    if (f === "academy-session-refresh") return antwort(200, { ok: true, vollzugang: !!opt.voll, pruefungstermin: sess.pruefungstermin, klasse: sess.klasse, ablauf_am: inEinemJahr, name: sess.name });
    if (f === "academy-katalog") return antwort(200, { ok: true, tags, videos, video_tags, pruefer: [], video_pruefer: [], gebiete: [], uebersetzungen: [] });
    if (f === "academy-szene") return antwort(200, { ok: true, szenen: [] });
    return antwort(503, { error: "nicht nachgebaut", code: "voruebergehend" });
  });
  await seite.goto(basis + "/index.html");
  await seite.waitForSelector(".page-content", { timeout: 15000 });
  return seite;
}
export const schliessen = async () => { await browser.close(); server.close(); };
export { pruefe, bilder, befunde, bestanden as zaehler };

/* Fingertipp mitten auf die Kachel (die Kacheln schweben, Playwright hält sie sonst für "nicht stabil") */
async function tippeKachel(s, sel) {
  await s.locator(sel).first().evaluate((e) => e.scrollIntoView({ block: "center" })); await s.waitForTimeout(350);
  const bb = await s.locator(sel).first().boundingBox(); await s.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
}
/* Seitenmenü (10.10.2026): Gruppen aufklappbar. Zustand einer Gruppe lesen bzw. sie öffnen. */
const gruppeOffen = (s, id) => s.evaluate((i) => document.querySelector('[data-menue-gruppe="' + i + '"]').getAttribute("aria-expanded") === "true", id);
async function gruppeAuf(s, id) { if (!(await gruppeOffen(s, id))) { await s.tap('[data-menue-gruppe="' + id + '"]'); await s.waitForTimeout(400); } }
async function layout(s, name) {
  const r = await s.evaluate(() => {
    const p = []; const de = document.documentElement;
    if (de.scrollWidth > innerWidth + 1) p.push("Seite wischbar " + de.scrollWidth + ">" + innerWidth);
    document.querySelectorAll(".page-content *, .header *, .bottom-nav *").forEach((el) => { if (el.closest("svg") || el.closest("canvas")) return; const r = el.getBoundingClientRect();
      // Teile, die ein Elternteil mit overflow:hidden (z.B. die Bühne des Vorfahrt-Films) wegschneidet, zählen nicht
      let p0 = el.parentElement, beschnitten = false; while (p0 && p0 !== document.body) { const cs = getComputedStyle(p0); if (cs.overflowX !== "visible") { const pr = p0.getBoundingClientRect(); if (pr.right <= innerWidth + 1 && pr.left >= -1) { beschnitten = true; break; } } p0 = p0.parentElement; } if (beschnitten) return; if (!r.width || !r.height) return; if (r.right > innerWidth + 1 || r.left < -1) p.push("raus: " + el.className + " " + Math.round(r.left) + ".." + Math.round(r.right)); });
    return p;
  });
  pruefe(name + ": Layout", r.length === 0, r.slice(0, 3).join(" | "));
  /* 10.10.2026: die App ist immer hell, auch bei dunklem Systemdesign */
  const hell = await s.evaluate(() => { const c = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number); const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; return { L: Math.round(L), cs: getComputedStyle(document.documentElement).colorScheme }; });
  const barlow = await s.evaluate(async () => { await document.fonts.ready; return document.fonts.check("600 15px Barlow") && [...document.fonts].some((f) => f.family.replace(/['"]/g, "") === "Barlow" && f.status === "loaded"); });
  pruefe(name + ": Schrift Barlow geladen (selbst ausgeliefert)", barlow);
  pruefe(name + ": Hintergrund hell", hell.L > 200 && hell.cs === "light", "L=" + hell.L + " colorScheme=" + hell.cs);
}
export { layout };

if (import.meta.url === "file://" + process.argv[1]) {
  const GROESSEN = [[360, 740, "360"], [412, 915, "412"], [812, 375, "quer"]];
  const nur = process.env.NUR || "e1,e2,e3,e4";
  /* ---------- Etappe 1: Krone und Schloss mit Krone ---------- */
  if (nur.includes("e1")) for (const dunkel of [false, true]) for (const [b, h, gn] of GROESSEN) for (const voll of [true, false]) {
    const tag = "E1 " + (voll ? "voll" : "start") + " " + gn + (dunkel ? " dunkel" : "");
    const s = await neueSeite({ b, h, voll, termin: 12, dunkel });
    await s.waitForTimeout(1200);
    const kr = await s.locator(".konto-kreis .krone-zeichen").count();
    pruefe(tag + ": Krone auf den Initialen " + (voll ? "da" : "nicht da"), voll ? kr === 1 : kr === 0);
    await layout(s, tag + " Start");
    await s.evaluate(() => document.querySelector('[data-view="lernpfad"]').click()); await s.waitForTimeout(1200); await layout(s, tag + " Übersicht");
    if (!voll) {
      await s.locator('.page-content [data-gotostufe="Stoppschild-Situationen"]').first().evaluate((e) => e.scrollIntoView({ block: "center" })); await s.tap('.page-content [data-gotostufe="Stoppschild-Situationen"]'); await s.waitForTimeout(1200);
      const z = await s.locator(".video-zeile.versiegelt .vz-mal-siegel .ic").count();
      pruefe(tag + ": gesperrte Videos zeigen Schloss mit Krone (" + z + ")", z >= 3);
      pruefe(tag + ": kein Wort „versiegelt“ mehr in den Zeilen", (await s.locator(".vz-siegelwort").count()) === 0);
      await layout(s, tag + " Bereich");
    }
    await s.tap('[data-view="pruefungsstrecken"]'); await s.waitForTimeout(1200); await layout(s, tag + " Strecken");
    await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
    const dn = await s.locator(".drawer .dh-name .krone-zeichen").count();
    pruefe(tag + ": Menü zeigt Krone " + (voll ? "da" : "nicht da"), voll ? dn === 1 : dn === 0);
    pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
    await s.context().close();
  }
  /* ---------- Etappe 2: Start als Dashboard ---------- */
  if (nur.includes("e2")) {
    for (const dunkel of [false, true]) for (const [b, h, gn] of GROESSEN) for (const voll of [true, false]) for (const termin of [12, 0, null]) {
      const tag = "E2 " + (voll ? "voll" : "start") + " " + gn + (dunkel ? " dunkel" : "") + " termin=" + termin;
      const s = await neueSeite({ b, h, voll, termin, dunkel });
      await s.waitForTimeout(1300);
      const kacheln = await s.locator(".kachel-t").count();
      pruefe(tag + ": 9 Themen-Kacheln (7 Bereiche, Verkehr, Spiele), da " + kacheln, kacheln === 9);
      const kronen = await s.locator(".kt-marke.krone").count(), schloesser = await s.locator(".kt-marke.zu").count();
      pruefe(tag + ": " + (voll ? "Kronen auf den Vollzugang-Kacheln (6, Verkehr erst bei geladener Liste)" : "Schloss mit Krone auf den gesperrten Kacheln (6)") + ", da " + kronen + "/" + schloesser, voll ? (kronen === 6 && schloesser === 0) : (schloesser === 6 && kronen === 0));
      const pille = await s.locator(".cd-pille").count();
      pruefe(tag + ": Termin-Pille " + (termin == null ? "fehlt ohne Termin" : "da"), termin == null ? pille === 0 : pille === 1);
      if (termin === 12) pruefe(tag + ": Pille nennt 12 Tage", /12/.test(await s.locator(".cd-pille").innerText()));
      if (termin === 0) pruefe(tag + ": Pille ist hervorgehoben (nah)", (await s.locator(".cd-pille.nah").count()) === 1);
      pruefe(tag + ": " + (voll ? "kein" : "ein") + " „Zugang anfragen“-Knopf", (await s.locator(".kt-cta").count()) === (voll ? 0 : 1));
      pruefe(tag + ": alte Strecke und Quittung sind weg", (await s.locator(".strecke, .fa-quittung, .siegel-notiz").count()) === 0);
      await layout(s, tag);
      const klein = await s.evaluate(() => [...document.querySelectorAll(".kachel-t, .cd-pille, .weiter-zeile")].filter((e) => { const r = e.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).length);
      pruefe(tag + ": alle Tippflächen >= 44 px", klein === 0);
      if (gn === "360" && termin === 12) await s.screenshot({ path: join(bilder, "e2-" + (voll ? "voll" : "start") + (dunkel ? "-dunkel" : "") + ".png") });
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
    // Antippen: Bereich-Kachel -> Bereichsseite, zurueck; Termin-Pille -> Strecken; Verkehr -> Verkehr-Seite
    for (const voll of [true, false]) {
      const tag = "E2 Tippen " + (voll ? "voll" : "start");
      const s = await neueSeite({ b: 390, h: 844, voll, termin: 5 }); await s.waitForTimeout(1300);
      await tippeKachel(s, '.kachel-t[data-gotostufe="Autobahn"]'); await s.waitForTimeout(900);
      pruefe(tag + ": Kachel Autobahn öffnet den Bereich", (await s.locator(".kachel-t").count()) === 0 && (await s.locator(".video-zeile").count()) >= 4);
      await s.tap("[data-nav-zurueck]"); await s.waitForTimeout(900);
      pruefe(tag + ": Zurück führt wieder zum Start mit Kacheln", (await s.locator(".kachel-t").count()) === 9);
      await s.tap(".cd-pille"); await s.waitForTimeout(900);
      pruefe(tag + ": Termin-Pille öffnet die Strecken", (await s.locator('.bottom-nav-item.active[data-view="pruefungsstrecken"]').count()) === 1);
      await s.tap('[data-view="start"]'); await s.waitForTimeout(900);
      await tippeKachel(s, ".kachel-t[data-vv-oeffnen]"); await s.waitForTimeout(900);
      pruefe(tag + ": Kachel Verkehr verstehen öffnet die Verkehr-Seite", (await s.locator('.drawer-item[data-drawer="verkehr"].aktiv, .drawer-item[aria-current="page"][data-drawer="verkehr"]').count()) === 1);
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
    // alle 18 Sprachen: nichts wischbar/abgeschnitten, RTL
    const probe = await neueSeite({ b: 360, h: 740, voll: false, termin: 3 });
    const codes = await probe.evaluate(() => Object.keys(I18N)); await probe.context().close();
    pruefe("E2: 18 Sprachen gefunden (" + codes.length + ")", codes.length === 18);
    for (const code of codes) for (const voll of [true, false]) {
      const tag = "E2 Sprache " + code + (voll ? " voll" : " start");
      const s = await neueSeite({ b: 360, h: 740, voll, termin: 3, sprache: code }); await s.waitForTimeout(1300);
      pruefe(tag + ": 8 Kacheln", (await s.locator(".kachel-t").count()) === 9);
      await layout(s, tag);
      const abg = await s.evaluate(() => [...document.querySelectorAll(".kt-name, .cd-pille span, .weiter-titel")].filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== "visible").length);
      pruefe(tag + ": Texte nicht abgeschnitten", abg === 0);
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
  }
  /* ---------- Etappe 3: untere Schnell-Leiste und Seitenleiste ---------- */
  if (nur.includes("e3")) {
    const stapel = (s) => s.evaluate(() => navStapel.length);
    const ansicht = (s) => s.evaluate(() => JSON.stringify({ v: mainView, d: drawerView }));
    for (const [b, h, gn] of GROESSEN) for (const voll of [true, false]) for (const dunkel of [false, true]) {
      const tag = "E3 " + (voll ? "voll" : "start") + " " + gn + (dunkel ? " dunkel" : "");
      const s = await neueSeite({ b, h, voll, termin: 7, dunkel }); await s.waitForTimeout(1300);
      pruefe(tag + ": 5 Tabs unten (Start, Weg, 3D, Spiele, Strecken)", (await s.locator(".bottom-nav-item").count()) === 5);
      pruefe(tag + ": Gesehen ist nicht mehr unten", (await s.locator('.bottom-nav-item[data-view="verlauf"]').count()) === 0);
      const klein = await s.evaluate(() => [...document.querySelectorAll(".bottom-nav-item")].filter((e) => { const r = e.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).length);
      pruefe(tag + ": Tabs >= 44 px", klein === 0);
      // jeder Tab: richtig markiert, Stapel leer
      for (const [sel, name] of [['[data-view="weg"]', "Weg"], ['[data-tab-drawer="verkehr"]', "3D"], ['[data-tab-drawer="spiele"]', "Spiele"], ['[data-view="pruefungsstrecken"]', "Strecken"], ['[data-view="start"]', "Start"]]) {
        await s.tap(".bottom-nav " + sel); await s.waitForTimeout(900);
        pruefe(tag + ": Tab " + name + " ist markiert", (await s.locator(".bottom-nav-item.active" + sel).count()) === 1, await ansicht(s));
        pruefe(tag + ": Tab " + name + " leert den Zurück-Stapel", (await stapel(s)) === 0);
      }
      // aus einem Bereich heraus direkt in 3D: Stapel wird geleert
      await tippeKachel(s, ".kachel-t[data-gotostufe]"); await s.waitForTimeout(800);
      pruefe(tag + ": Bereich geöffnet, Stapel > 0", (await stapel(s)) > 0);
      await s.tap('.bottom-nav [data-tab-drawer="verkehr"]'); await s.waitForTimeout(800);
      pruefe(tag + ": 3D aus dem Bereich: Stapel 0", (await stapel(s)) === 0);
      await layout(s, tag + " 3D");
      // Seitenleiste
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
      pruefe(tag + ": Menü zeigt 7 Themen", (await s.locator(".drawer-item[data-gotostufe]").count()) === 7);
      const kr = await s.locator(".drawer-item[data-gotostufe] .drawer-marke .krone-zeichen").count(), sk = await s.locator(".drawer-item[data-gotostufe] .drawer-marke .ic").count();
      pruefe(tag + ": Menü " + (voll ? "Kronen (6)" : "Schloss mit Krone (6)") + ", da " + kr + "/" + sk, voll ? (kr === 6 && sk === 0) : (sk === 6 && kr === 0));
      pruefe(tag + ": Menü hat Verlauf, Konto, Sprache", (await s.locator('.drawer-item[data-view="verlauf"], .drawer-item[data-view="konto"], .drawer-item[data-konto-sprache]').count()) === 3);
      // Gruppen: Dashboard einzeln oben, dann Lernen, Üben, Prüfung & Tipps, Einstellungen
      const aufbau = await s.evaluate(() => {
        const items = document.querySelector(".drawer-items");
        const erst = items.firstElementChild;
        const koepfe = [...items.querySelectorAll(".drawer-gruppe-kopf")];
        const gr = (id) => [...document.querySelectorAll("#menue-gruppe-" + id + " .drawer-item")].map((e) => e.dataset.drawer || e.dataset.view || (e.dataset.gotostufe ? "stufe" : "") || (e.hasAttribute("data-konto-sprache") ? "sprache" : "?"));
        return { erst: erst.dataset.drawer, koepfe: koepfe.map((k) => k.dataset.menueGruppe), knopf: koepfe.every((k) => k.tagName === "BUTTON" && k.hasAttribute("aria-expanded") && !!document.getElementById(k.getAttribute("aria-controls"))),
          lernen: gr("lernen"), ueben: gr("ueben"), pruefung: gr("pruefung"), einstellungen: gr("einstellungen") };
      });
      pruefe(tag + ": Dashboard steht einzeln ganz oben", aufbau.erst === "dashboard", JSON.stringify(aufbau.erst));
      pruefe(tag + ": 4 Gruppen in der Reihenfolge Lernen, Üben, Prüfung, Einstellungen", aufbau.koepfe.join() === "lernen,ueben,pruefung,einstellungen", aufbau.koepfe.join());
      pruefe(tag + ": Gruppenköpfe sind Knöpfe mit aria-expanded und aria-controls", aufbau.knopf);
      pruefe(tag + ": Lernen = Übersicht, 7 Bereiche, # Themen, Gesehen", aufbau.lernen.join() === "lernpfad,stufe,stufe,stufe,stufe,stufe,stufe,stufe,themen,verlauf", aufbau.lernen.join());
      pruefe(tag + ": Üben = Verkehr verstehen, Spiele", aufbau.ueben.join() === "verkehr,spiele", aufbau.ueben.join());
      pruefe(tag + ": Prüfung & Tipps = Prüfungstag, Nützliches, Hilfe", aufbau.pruefung.join() === "pruefungstag,nuetzliches,hilfe", aufbau.pruefung.join());
      pruefe(tag + ": Einstellungen = Konto, Sprache, Rechtliches, Über", aufbau.einstellungen.join() === "konto,sprache,rechtliches,ueber", aufbau.einstellungen.join());
      // Start-Zustand auf der 3D-Seite: Lernen (Standard) und Üben (enthält die offene Seite) offen, der Rest zu
      const zu0 = { l: await gruppeOffen(s, "lernen"), u: await gruppeOffen(s, "ueben"), p: await gruppeOffen(s, "pruefung"), e: await gruppeOffen(s, "einstellungen") };
      pruefe(tag + ": beim Öffnen: Lernen und Üben (aktuelle Seite) offen, Prüfung und Einstellungen zu", zu0.l && zu0.u && !zu0.p && !zu0.e, JSON.stringify(zu0));
      const verborgen = await s.evaluate(() => { const els = [...document.querySelectorAll("#menue-gruppe-einstellungen .drawer-item")]; const b = els[0]; b.focus(); return els.every((e) => getComputedStyle(e).visibility === "hidden") && document.activeElement !== b && document.getElementById("menue-gruppe-einstellungen").getBoundingClientRect().height < 1; });
      pruefe(tag + ": Punkte zugeklappter Gruppen sind unsichtbar, ohne Höhe und nicht fokussierbar", verborgen);
      const kleinK = await s.evaluate(() => [...document.querySelectorAll(".drawer-gruppe-kopf, .drawer .drawer-item")].filter((e) => { const r = e.getBoundingClientRect(); return getComputedStyle(e).visibility === "visible" && r.height > 0 && (r.height < 43.5 || r.width < 43.5); }).length);
      pruefe(tag + ": Menü-Tippflächen >= 44 px", kleinK === 0);
      // Auf- und Zuklappen per Fingertipp; Pfeil dreht sich; Zustand wird gemerkt
      await s.tap('[data-menue-gruppe="einstellungen"]'); await s.waitForTimeout(450);
      const auf = await s.evaluate(() => { const k = document.querySelector('[data-menue-gruppe="einstellungen"]'); const sp = document.querySelector("#menue-gruppe-einstellungen [data-konto-sprache]"); const r = sp.getBoundingClientRect();
        return { exp: k.getAttribute("aria-expanded"), pfeil: getComputedStyle(k.querySelector(".dg-pfeil")).transform, sichtbar: getComputedStyle(sp).visibility === "visible" && r.height >= 44, gemerkt: localStorage.getItem("academy_menue_gruppen") }; });
      pruefe(tag + ": Antippen klappt Einstellungen auf (aria-expanded, Pfeil gedreht, Sprache sichtbar, gemerkt)", auf.exp === "true" && auf.pfeil !== "none" && auf.pfeil !== "matrix(1, 0, 0, 1, 0, 0)" && auf.sichtbar && /einstellungen/.test(auf.gemerkt || ""), JSON.stringify(auf));
      await s.tap('[data-menue-gruppe="einstellungen"]'); await s.waitForTimeout(450);
      const zu = await s.evaluate(() => { const k = document.querySelector('[data-menue-gruppe="einstellungen"]'); return { exp: k.getAttribute("aria-expanded"), pfeil: getComputedStyle(k.querySelector(".dg-pfeil")).transform, h: document.getElementById("menue-gruppe-einstellungen").getBoundingClientRect().height, gemerkt: localStorage.getItem("academy_menue_gruppen") }; });
      pruefe(tag + ": nochmal Antippen klappt wieder zu (Höhe 0, Pfeil zurück)", zu.exp === "false" && zu.h < 1 && (zu.pfeil === "none" || zu.pfeil === "matrix(1, 0, 0, 1, 0, 0)") && !/einstellungen/.test(zu.gemerkt || ""), JSON.stringify(zu));
      pruefe(tag + ": Menü bleibt beim Auf-/Zuklappen offen", (await s.locator(".drawer.open").count()) === 1);
      await gruppeAuf(s, "pruefung"); await gruppeAuf(s, "einstellungen");
      const ueber = await s.evaluate(() => [...document.querySelectorAll(".drawer-item, .drawer-gruppe-kopf")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1; }).length);
      pruefe(tag + ": Menüzeilen ragen nicht raus", ueber === 0);
      pruefe(tag + ": Menü seitlich nicht wischbar", await s.evaluate(() => { const d = document.querySelector(".drawer-items"); return d.scrollWidth <= d.clientWidth + 1; }));
      if (gn === "360" && !dunkel) await s.screenshot({ path: join(bilder, "e3-menue-" + (voll ? "voll" : "start") + ".png") });
      await s.tap('[data-menue-gruppe="pruefung"]'); await s.waitForTimeout(300); await s.tap('[data-menue-gruppe="einstellungen"]'); await s.waitForTimeout(400);
      await s.locator('.drawer-item[data-gotostufe="Autobahn"]').scrollIntoViewIfNeeded();
      await s.tap('.drawer-item[data-gotostufe="Autobahn"]'); await s.waitForTimeout(900);
      pruefe(tag + ": Thema im Menü öffnet den Bereich und schließt das Menü", (await s.locator(".drawer.open").count()) === 0 && (await s.locator(".video-zeile").count()) >= 4);
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(500); await s.tap('.drawer-item[data-view="verlauf"]'); await s.waitForTimeout(900);
      pruefe(tag + ": Verlauf aus dem Menü, Menü zu", (await ansicht(s)).includes('"v":"verlauf"') && (await s.locator(".drawer.open").count()) === 0);
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
      pruefe(tag + ": auf der Gesehen-Seite ist Lernen offen", await gruppeOffen(s, "lernen"));
      await gruppeAuf(s, "einstellungen"); await s.locator(".drawer-item[data-konto-sprache]").scrollIntoViewIfNeeded(); await s.tap(".drawer-item[data-konto-sprache]"); await s.waitForTimeout(1100);
      pruefe(tag + ": Sprache aus dem Menü öffnet die Sprachwahl auf der Konto-Seite", (await ansicht(s)).includes('"v":"konto"') && (await s.locator(".blatt-overlay.offen, .overlay.offen, [class*=blatt].offen").count()) >= 1);
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
    // Menü-Gruppen: Gedächtnis über Neuladen, aktive Gruppe klappt auf, Unterpunkt führt hin, ohne Bewegung bei reduzierter Bewegung
    {
      const tag = "E3 Menü-Gruppen";
      const s = await neueSeite({ b: 360, h: 740, voll: true, termin: 7 }); await s.waitForTimeout(1300);
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
      pruefe(tag + ": ohne Gedächtnis auf Start: nur Lernen offen", (await gruppeOffen(s, "lernen")) && !(await gruppeOffen(s, "ueben")) && !(await gruppeOffen(s, "pruefung")) && !(await gruppeOffen(s, "einstellungen")));
      pruefe(tag + ": Aufklappen ist sanft (Bewegung > 0 s)", await s.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".drawer-gruppe-inhalt")).transitionDuration) > 0));
      await s.tap('[data-menue-gruppe="lernen"]'); await s.waitForTimeout(300); await s.tap('[data-menue-gruppe="pruefung"]'); await s.waitForTimeout(400);
      await s.tap('.drawer-item[data-drawer="hilfe"]'); await s.waitForTimeout(900);
      pruefe(tag + ": Unterpunkt Hilfe führt zur Hilfe, Menü zu", (await s.evaluate(() => drawerView)) === "hilfe" && (await s.locator(".drawer.open").count()) === 0);
      await s.reload(); await s.waitForSelector(".page-content"); await s.waitForTimeout(1000);
      await s.evaluate(() => { drawerOpen = false; go({ view: "start" }); }); await s.waitForTimeout(400);
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
      pruefe(tag + ": nach Neuladen gemerkt: Lernen zu, Prüfung & Tipps offen", !(await gruppeOffen(s, "lernen")) && (await gruppeOffen(s, "pruefung")));
      await s.evaluate(() => { drawerOpen = false; go({ drawer: "rechtliches" }); }); await s.waitForTimeout(500);
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
      pruefe(tag + ": auf „Rechtliches“ ist Einstellungen offen und der Punkt markiert", (await gruppeOffen(s, "einstellungen")) && (await s.locator('#menue-gruppe-einstellungen .drawer-item.aktiv[data-drawer="rechtliches"][aria-current="page"]').count()) === 1);
      await s.evaluate(() => { drawerOpen = false; go({ view: "bereichdetail", bereich: "Autobahn" }); }); await s.waitForTimeout(500);
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
      pruefe(tag + ": im Bereich Autobahn ist Lernen offen und Autobahn markiert", (await gruppeOffen(s, "lernen")) && (await s.locator('.drawer-item.aktiv[data-gotostufe="Autobahn"]').count()) === 1);
      // Tastatur: Enter auf dem Gruppenkopf klappt auf, Fokusring sichtbar
      await s.locator('[data-menue-gruppe="ueben"]').focus(); await s.keyboard.press("Enter"); await s.waitForTimeout(400);
      const ring = await s.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
      pruefe(tag + ": Enter auf dem Kopf klappt auf, Fokusring sichtbar", (await gruppeOffen(s, "ueben")) && ring !== "none", ring);
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
      const r = await neueSeite({ b: 360, h: 740, voll: true, termin: 7, ruhig: true }); await r.waitForTimeout(1000);
      await r.tap("#drawer-open-btn"); await r.waitForTimeout(500);
      const dauer = await r.evaluate(() => [getComputedStyle(document.querySelector(".drawer-gruppe-inhalt")).transitionDuration, getComputedStyle(document.querySelector(".dg-pfeil")).transitionDuration]);
      pruefe(tag + ": bei reduzierter Bewegung keine Animation", dauer.every((d) => d.split(",").every((x) => parseFloat(x) < 0.01)), dauer.join(" / "));
      await r.context().close();
    }
    // Wurzeln: nur der Tab-Aufruf macht 3D zur Wurzel; Menü- und Kachel-Weg bleiben normale Seiten mit Zurück
    {
      const s = await neueSeite({ b: 390, h: 844, voll: true, termin: 7 }); await s.waitForTimeout(1300);
      const r = await s.evaluate(() => {
        go({ view: "weg" }); const a = navStapel.length;
        go({ drawer: "verkehr" }); const b = navStapel.length;                     // aus dem Menü/der Kachel
        go({ view: "start", drawer: "verkehr", tab: true }); const c = navStapel.length;   // vom Tab
        go({ view: "start", drawer: "verkehr", szene: "x", tab: true }); const d = navStapel.length;   // Szene bleibt Seite mit Zurück
        return { a, b, c, d, w1: navIstWurzel({ view: "start", bereich: null, hashtag: null, recht: null, drawer: "verkehr", szene: null, spiel: null }) };
      });
      pruefe("E3: Menü-/Kachel-Weg nach 3D behält den Zurück-Stapel, der Tab leert ihn, eine Szene legt ab", r.b === 1 && r.c === 0 && r.d === 1 && r.w1 === false, JSON.stringify(r));
      await s.context().close();
    }
    // alle 18 Sprachen: Leiste und Menü
    const probe = await neueSeite({ b: 360, h: 740, voll: false, termin: 3 });
    const codes = await probe.evaluate(() => Object.keys(I18N)); await probe.context().close();
    for (const code of codes) for (const voll of [true, false]) {
      const tag = "E3 Sprache " + code + (voll ? " voll" : " start");
      const s = await neueSeite({ b: 360, h: 740, voll, termin: 3, sprache: code }); await s.waitForTimeout(1300);
      await layout(s, tag);
      const abg = await s.evaluate(() => [...document.querySelectorAll(".bottom-nav-item .nav-text")].filter((e) => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent));
      pruefe(tag + ": Tab-Beschriftungen nicht abgeschnitten", abg.length === 0, abg.join(","));
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
      if (voll && ["de", "tr", "ar"].includes(code)) await s.screenshot({ path: join(bilder, "e3-menue-" + code + ".png") });
      for (const id of ["ueben", "pruefung", "einstellungen"]) await gruppeAuf(s, id);
      const ab2 = await s.evaluate(() => [...document.querySelectorAll(".drawer-item, .drawer-gruppe-kopf")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }).length);
      pruefe(tag + ": Menü nicht seitlich überstehend", ab2 === 0);
      const gtexte = await s.evaluate(() => ["mgLernen", "mgUeben", "mgPruefung", "mgEinstellungen"].filter((k) => !(sprache === "de" || (I18N[sprache][k] && I18N[sprache][k] !== I18N.de[k]))));
      pruefe(tag + ": Gruppennamen übersetzt", gtexte.length === 0, gtexte.join(","));
      const abg3 = await s.evaluate(() => [...document.querySelectorAll(".drawer-gruppe-kopf .dg-titel, .drawer-item > span:not(.drawer-marke)")].filter((e) => e.scrollWidth > e.clientWidth + 2).map((e) => e.textContent.slice(0, 20)));
      pruefe(tag + ": Menütexte nicht abgeschnitten", abg3.length === 0, abg3.join(","));
      const rtl = await s.evaluate(() => { const k = document.querySelector('[data-menue-gruppe="lernen"]'); const t = k.querySelector(".dg-titel").getBoundingClientRect(), p = k.querySelector(".dg-pfeil").getBoundingClientRect(); return { rtl: document.documentElement.dir === "rtl", pfeilLinks: p.right <= t.left + 1, pfeilRechts: p.left >= t.right - 1 }; });
      pruefe(tag + ": Pfeil steht am Zeilenende (" + (rtl.rtl ? "RTL links" : "rechts") + ")", rtl.rtl ? rtl.pfeilLinks : rtl.pfeilRechts, JSON.stringify(rtl));
      if (voll && ["de", "tr", "ar"].includes(code)) { await s.evaluate(() => { document.querySelector(".drawer-items").scrollTop = 1e5; }); await s.waitForTimeout(200); await s.screenshot({ path: join(bilder, "e3-menue-" + code + "-alle-offen.png") }); }
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
  }
  /* ---------- Etappe 4: Weg (Karte mit Figur) ---------- */
  if (nur.includes("e4")) {
    const figY = (s) => s.evaluate(() => parseFloat(document.getElementById("weg-figur").style.top));
    const knotenY = (s) => s.evaluate(() => [...document.querySelectorAll(".wg-knoten")].map((e) => parseFloat(e.style.top)));
    const sehen = (s, anzahlBereiche) => s.evaluate((n) => { for (let si = 0; si < n; si++) for (let k = 0; k < 3; k++) for (let v = 0; v < 2; v++) seenVideoIds.add("v" + si + k + v); }, anzahlBereiche);
    const zumWeg = async (s) => { await s.tap('.bottom-nav [data-view="weg"]'); await s.waitForSelector("#weg-figur", { timeout: 8000 }); };
    for (const [b, h, gn] of GROESSEN) for (const voll of [true, false]) for (const dunkel of [false, true]) {
      const tag = "E4 " + (voll ? "voll" : "start") + " " + gn + (dunkel ? " dunkel" : "");
      const s = await neueSeite({ b, h, voll, termin: 9, dunkel, ruhig: true }); await s.waitForTimeout(1200);
      await zumWeg(s); await s.waitForTimeout(500);
      pruefe(tag + ": 7 Stationen, Figur, Ziel", (await s.locator(".wg-kachel").count()) === 7 && (await s.locator("#weg-figur").count()) === 1 && (await s.locator(".wg-ziel").count()) === 1);
      pruefe(tag + ": Ziel nennt die Tage (9)", (await s.locator(".wg-ziel b").innerText()) === "9");
      const kr = await s.locator(".wg-kachel .wg-marke.krone").count(), sk = await s.locator(".wg-kachel .wg-marke.zu").count();
      pruefe(tag + ": " + (voll ? "Kronen auf 6 Stationen" : "Schloss mit Krone auf 6 Stationen") + " (" + kr + "/" + sk + ")", voll ? (kr === 6 && sk === 0) : (sk === 6 && kr === 0));
      const pille = await s.evaluate(() => { const w = document.querySelector(".wg-weiter"), n = document.querySelector(".bottom-nav"); if (!w) return "keine"; const a = w.getBoundingClientRect(), c = n.getBoundingClientRect(); return a.bottom <= c.top + 1 && a.left >= 0 && a.right <= innerWidth ? "ok" : "ueberlappt"; });
      pruefe(tag + ": Weiter-Pille liegt über der Leiste, nichts überlappt", pille === "ok", pille);
      const ys = await knotenY(s), f0 = await figY(s);
      pruefe(tag + ": ohne Fortschritt steht die Figur am Start (unter allen Stationen)", f0 > Math.max(...ys), f0 + " vs " + Math.max(...ys));
      // Fortschritt: Bereich 1 komplett -> Figur auf Station 1; alle -> auf Station 7 (nur mit Vollzugang)
      await sehen(s, 1); await s.evaluate(() => renderCatalog()); await s.waitForSelector("#weg-figur"); await s.waitForTimeout(400);
      let f1 = await figY(s); const k1 = (await knotenY(s))[0];
      pruefe(tag + ": Bereich 1 gesehen -> Figur auf Station 1", Math.abs(f1 - k1) < 1.2, f1 + " vs " + k1);
      pruefe(tag + ": Station 1 zeigt Haken", (await s.locator(".wg-kachel .wg-marke.ok").count()) === 1);
      // Kostprobe im gesperrten Bereich verschiebt die Figur nicht (ohne Vollzugang)
      if (!voll) {
        await s.evaluate(() => { seenVideoIds.add("v600"); renderCatalog(); }); await s.waitForTimeout(400);
        pruefe(tag + ": Kostprobe im gesperrten Bereich bewegt die Figur nicht", Math.abs((await figY(s)) - f1) < 0.3);
      } else {
        await sehen(s, 7); await s.evaluate(() => renderCatalog()); await s.waitForSelector("#weg-figur"); await s.waitForTimeout(400);
        const f7 = await figY(s), k7 = (await knotenY(s))[6];
        pruefe(tag + ": alles gesehen -> Figur auf Station 7", Math.abs(f7 - k7) < 1.2, f7 + " vs " + k7);
        pruefe(tag + ": alle 7 Stationen mit Haken", (await s.locator(".wg-kachel .wg-marke.ok").count()) === 7);
      }
      await layout(s, tag + " Weg");
      const klein = await s.evaluate(() => [...document.querySelectorAll(".wg-kachel, .wg-ziel, .wg-weiter")].filter((e) => { const r = e.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).length);
      pruefe(tag + ": Tippflächen >= 44 px", klein === 0);
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      if (dunkel || gn === "360") await s.screenshot({ path: join(bilder, "e4-" + (voll ? "voll" : "start") + "-" + gn + (dunkel ? "-dunkel" : "") + ".png") });
      await s.context().close();
    }
    // Lkw-Klassen (C, CE) fahren auf dem Weg einen Lkw, alle anderen ein Auto (10.10.2026)
    for (const [kl, soll] of [["CE", "lkw"], ["C", "lkw"], ["B", null], ["BE", null]]) {
      const s = await neueSeite({ b: 390, h: 844, voll: true, termin: 9, klasse: kl, ruhig: true, dunkel: true }); await s.waitForTimeout(1000);
      await s.tap('.bottom-nav [data-view="weg"]'); await s.waitForSelector("#weg-figur");
      pruefe("E4 Figur Klasse " + kl + ": " + (soll || "Auto"), (await s.evaluate(() => document.querySelector("#weg-figur svg").getAttribute("data-figur"))) === soll);
      await layout(s, "E4 Figur Klasse " + kl);
      await s.context().close();
    }
    // Fahrt: die Figur faehrt von der letzten Position zur neuen, die Seite folgt, am Ende ist der Wert gemerkt
    {
      const s = await neueSeite({ b: 390, h: 844, voll: true, termin: 9 }); await s.waitForTimeout(1200);
      await s.evaluate(() => { try { localStorage.setItem("academy_weg_t_0100", "0"); } catch (e) {} for (let k = 0; k < 3; k++) for (let v = 0; v < 2; v++) seenVideoIds.add("v0" + k + v); });
      await s.tap('.bottom-nav [data-view="weg"]'); await s.waitForSelector("#weg-figur"); await s.waitForTimeout(300);
      const a = await figY(s); await s.waitForTimeout(900); const m = await figY(s); await s.waitForTimeout(1800); const e = await figY(s);
      const k1 = (await knotenY(s))[0];
      pruefe("E4 Fahrt: Figur startet unten, ist nach 0,9 s unterwegs und kommt bei Station 1 an", a > m && m > e && Math.abs(e - k1) < 1.2, [a, m, e, k1].join(" > "));
      pruefe("E4 Fahrt: Wert wurde gemerkt (je Schüler)", (await s.evaluate(() => localStorage.getItem("academy_weg_t_0100"))) === "1", await s.evaluate(() => localStorage.getItem("academy_weg_t_0100")));
      const sichtbar = await s.evaluate(() => { const r = document.getElementById("weg-figur").getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
      pruefe("E4 Fahrt: Figur bleibt im Bild (die Seite folgt)", sichtbar);
      // zweiter Besuch ohne Aenderung: keine Fahrt
      await s.tap('.bottom-nav [data-view="start"]'); await s.waitForTimeout(500); await s.tap('.bottom-nav [data-view="weg"]'); await s.waitForSelector("#weg-figur");
      const a2 = await figY(s); await s.waitForTimeout(700); pruefe("E4 Fahrt: zweiter Besuch ohne Änderung, Figur steht sofort", Math.abs((await figY(s)) - a2) < 0.05 && Math.abs(a2 - k1) < 1.2);
      pruefe("E4 Fahrt: keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
    // Antippen und Zurück
    for (const voll of [true, false]) {
      const tag = "E4 Tippen " + (voll ? "voll" : "start");
      const s = await neueSeite({ b: 390, h: 844, voll, termin: 5, ruhig: true }); await s.waitForTimeout(1200);
      await zumWeg(s); await s.waitForTimeout(500);
      await tippeKachel(s, '.wg-kachel[data-gotostufe="Autobahn"]'); await s.waitForTimeout(900);
      pruefe(tag + ": Station öffnet den Bereich", (await s.locator(".wg-kachel").count()) === 0 && (await s.locator(".video-zeile").count()) >= 4);
      await s.tap("[data-nav-zurueck]"); await s.waitForTimeout(900);
      pruefe(tag + ": Zurück führt auf den Weg", (await s.locator(".wg-kachel").count()) === 7 && (await s.locator('.bottom-nav-item.active[data-view="weg"]').count()) === 1);
      await tippeKachel(s, ".wg-ziel"); await s.waitForTimeout(900);
      pruefe(tag + ": Ziel öffnet die Strecken", (await s.locator('.bottom-nav-item.active[data-view="pruefungsstrecken"]').count()) === 1);
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
      pruefe(tag + ": Menü hat „Übersicht“ (Suche bleibt erreichbar)", (await s.locator('.drawer-item[data-view="lernpfad"]').count()) === 1);
      await s.tap('.drawer-item[data-view="lernpfad"]'); await s.waitForTimeout(1000);
      pruefe(tag + ": Übersicht aus dem Menü zeigt die Suche", (await s.locator("#such-input").count()) === 1 && (await s.locator(".drawer.open").count()) === 0);
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
    // Doppeltipp und schnelles Hin und Her während der Fahrt: keine Geisterschleife, Seite springt nicht
    {
      const s = await neueSeite({ b: 390, h: 844, voll: true, termin: 9 }); await s.waitForTimeout(1200);
      await s.evaluate(() => { try { localStorage.setItem("academy_weg_t_0100", "0"); } catch (e) {} for (let si = 0; si < 3; si++) for (let k = 0; k < 3; k++) for (let v = 0; v < 2; v++) seenVideoIds.add("v" + si + k + v); });
      await s.evaluate(() => { const b = document.querySelector('.bottom-nav [data-view="weg"]'); b.click(); b.click(); setTimeout(() => b.click(), 60); setTimeout(() => document.querySelector('.bottom-nav [data-view="start"]').click(), 400); setTimeout(() => document.querySelector('.bottom-nav [data-view="weg"]').click(), 700); });
      await s.waitForSelector("#weg-figur"); await s.waitForTimeout(4200);
      const ziel3 = (await knotenY(s))[2], f = await figY(s);
      const sichtbar = await s.evaluate(() => { const r = document.getElementById("weg-figur").getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
      pruefe("E4 Doppeltipp/Hin-und-Her: Figur steht am Ende auf Station 3 und im Bild", Math.abs(f - ziel3) < 1.2 && sichtbar, f + " vs " + ziel3 + " sichtbar=" + sichtbar);
      pruefe("E4 Doppeltipp/Hin-und-Her: keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
    // Klassensperre: einfaches Schloss, keine Krone, keine Zugangsanfrage dafür; Video ohne Dauer; Name mit Komma; Hinweis "kein Kauf"
    for (const voll of [true, false]) {
      const tag = "E4 Sonderfälle " + (voll ? "voll" : "start");
      const s = await neueSeite({ b: 390, h: 844, voll, termin: 9, ruhig: true }); await s.waitForTimeout(1200);
      await s.evaluate(() => { allTags.filter((x) => x.stufe === "Autobahn").forEach((x) => { x.nur_klasse = "C"; }); const vid = allVideos.find((v) => v.id === "v400"); vid.dauer_sekunden = null; session.name = "Müller, Max"; renderCatalog(); });
      await s.waitForTimeout(1300);
      const art = await s.evaluate(() => { const k = document.querySelector('.kachel-t[data-gotostufe="Autobahn"]'); return { krone: !!k.querySelector(".kt-marke.krone"), zuKrone: !!k.querySelector(".kt-marke.zu .krone-zeichen, .kt-marke.zu svg path[fill]"), einfach: !!k.querySelector(".kt-marke.zu") }; });
      pruefe(tag + ": Klassensperre zeigt keine Krone und kein Schloss mit Krone", !art.krone && !art.zuKrone, JSON.stringify(art));
      pruefe(tag + ": Klassensperre zeigt ein einfaches Schloss", art.einfach);
      pruefe(tag + ": Vorname aus „Müller, Max“ ist Max", (await s.locator("h1.fa-hero").innerText()).includes("Max") && !(await s.locator("h1.fa-hero").innerText()).includes("Müller"));
      pruefe(tag + ": Hinweis „kein Kauf“ " + (voll ? "fehlt mit Vollzugang" : "steht unter dem Knopf"), (await s.locator(".kt-cta + .siegel-klein").count()) === (voll ? 0 : 1));
      if (!voll) { const ziel = await s.locator(".kt-cta").getAttribute("data-zugang-anfragen"); pruefe(tag + ": Zugangsanfrage zielt nicht auf den Klassensperre-Bereich", ziel !== "Autobahn", ziel); }
      // Weg: Video ohne Dauer ungesehen -> Bereich nicht fertig
      await s.evaluate(() => { for (const v of ["v400", "v401"]) { /* Autobahn */ } const ids = []; for (let k = 0; k < 3; k++) for (let v = 0; v < 2; v++) ids.push("v" + 4 + k + v); ids.filter((i) => i !== "v400").forEach((i) => seenVideoIds.add(i)); });
      if (voll) {
        await s.evaluate(() => { allTags.filter((x) => x.stufe === "Autobahn").forEach((x) => { x.nur_klasse = null; }); renderCatalog(); });
        await s.tap('.bottom-nav [data-view="weg"]'); await s.waitForSelector("#weg-figur"); await s.waitForTimeout(500);
        const fertig = await s.evaluate(() => { const k = document.querySelector('.wg-kachel[data-gotostufe="Autobahn"]'); return !!k.querySelector(".wg-marke.ok"); });
        pruefe(tag + ": Bereich mit ungesehenem Video ohne Dauer gilt nicht als fertig", fertig === false);
      }
      await s.tap('.bottom-nav [data-view="start"]'); await s.waitForTimeout(900);
      pruefe(tag + ": Zähler „0 / 6“ ist links-nach-rechts isoliert (RTL-sicher)", (await s.locator('.kt-zahl bdi[dir="ltr"]').count()) >= 1);
      pruefe(tag + ": geschlossenes Menü ist nicht per Tastatur erreichbar (inert)", (await s.locator(".drawer[inert]").count()) === 1);
      await s.tap("#drawer-open-btn"); await s.waitForTimeout(400);
      pruefe(tag + ": offenes Menü ist ein Dialog, Fokus im Menü", (await s.locator('.drawer[role="dialog"]:not([inert])').count()) === 1 && (await s.evaluate(() => !!document.activeElement.closest(".drawer"))));
      await s.touchscreen.tap(382, 300); await s.waitForTimeout(400);
      pruefe(tag + ": Menü zu: wieder inert", (await s.locator(".drawer[inert]").count()) === 1);
      pruefe(tag + ": 3D-Tab hat Vorlesenamen", (await s.locator('.bottom-nav [data-tab-drawer="verkehr"]').getAttribute("aria-label")).length > 3);
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
    // Video über die Weiter-Pille: Zurück führt auf den Weg, und die Figur fährt dort weiter
    {
      const s = await neueSeite({ b: 390, h: 844, voll: true, termin: 9 }); await s.waitForTimeout(1200);
      await s.route("**/functions/v1/academy-video-token", (r) => r.fulfill({ status: 200, headers: { "access-control-allow-origin": "*", "content-type": "application/json" }, body: JSON.stringify({ ok: true, playlist: "https://x.invalid/a.m3u8", embed_url: "https://x.invalid/e", token: "t", expires: 9999999999, hinweise: [], kapitel: [] }) }));
      await s.evaluate(() => { try { localStorage.setItem("academy_weg_t_0100", "0"); } catch (e) {} });
      await s.tap('.bottom-nav [data-view="weg"]'); await s.waitForSelector(".wg-weiter"); await s.waitForTimeout(500);
      await s.tap(".wg-weiter"); await s.waitForTimeout(1500);
      const hatZurueck = (await s.locator("#back-btn").count()) === 1;
      pruefe("E4 Video: Zurück-Knopf zeigt „Weg“", hatZurueck && (await s.locator("#back-btn").innerText()).trim() === (await s.evaluate(() => I18N[sprache].navWeg)));
      if (hatZurueck) { await s.evaluate(() => { for (let k = 0; k < 3; k++) for (let v = 0; v < 2; v++) seenVideoIds.add("v0" + k + v); }); await s.tap("#back-btn"); await s.waitForSelector("#weg-figur"); await s.waitForTimeout(2600);
        pruefe("E4 Video: Zurück landet auf dem Weg, die Figur fährt zu Station 1", (await s.locator('.bottom-nav-item.active[data-view="weg"]').count()) === 1 && Math.abs((await figY(s)) - (await knotenY(s))[0]) < 1.5); }
      await s.context().close();
    }
    // Sprachwechsel-Text im Menü darf nicht sichtbar sein (nur Vorlesetext)
    {
      const s = await neueSeite({ b: 360, h: 640, voll: false, termin: 9 }); await s.waitForTimeout(1200);
      const sichtbar = await s.evaluate(() => [...document.querySelectorAll(".unsichtbar")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 2 || r.height > 2; }).length);
      pruefe("E4 Vorlesetexte (unsichtbar) sind wirklich unsichtbar", sichtbar === 0, String(sichtbar));
      await s.context().close();
    }
    // Zahlformen und Beschriftungen
    {
      const s = await neueSeite({ b: 390, h: 844, voll: true, termin: 9 }); await s.waitForTimeout(800);
      const r = await s.evaluate(() => { const o = {}; for (const [c, n] of [["ar", 2], ["ar", 5], ["ar", 12], ["sr", 21], ["sr", 22], ["sr", 11], ["de", 3]]) { sprache = c; o[c + n] = wannText(n); } sprache = "de"; return o; });
      pruefe("E4 Zahlformen: ar 2 = Dual, ar 12 = Einzahl, sr 21 = dan, sr 22/11 = dana", r.ar2 === "بعد يومين" && r.ar12.endsWith("يوماً") && r.sr21 === "za 21 dan" && r.sr22 === "za 22 dana" && r.sr11 === "za 11 dana", JSON.stringify(r));
      const kol = await s.evaluate(() => Object.keys(I18N).filter((c) => I18N[c].navWeg === I18N[c].navStrecken));
      pruefe("E4 Beschriftungen: „Weg“ und „Strecken“ heißen in keiner Sprache gleich", kol.length === 0, kol.join(","));
      await s.context().close();
    }
    // alle 18 Sprachen: Beschriftung "Weg", nichts abgeschnitten
    const probe = await neueSeite({ b: 360, h: 740, voll: false, termin: 3 });
    const codes = await probe.evaluate(() => Object.keys(I18N)); await probe.context().close();
    for (const code of codes) for (const voll of [true, false]) {
      const tag = "E4 Sprache " + code + (voll ? " voll" : " start");
      const s = await neueSeite({ b: 360, h: 740, voll, termin: 3, sprache: code, ruhig: true }); await s.waitForTimeout(1200);
      const lbl = await s.evaluate(() => ({ weg: I18N[sprache].navWeg, de: I18N.de.navWeg }));
      pruefe(tag + ": Beschriftung „Weg“ vorhanden (" + lbl.weg + ")", !!lbl.weg && (code === "de" || lbl.weg !== lbl.de));
      await zumWeg(s); await s.waitForTimeout(400);
      await layout(s, tag);
      const abg = await s.evaluate(() => [...document.querySelectorAll(".bottom-nav-item .nav-text, .wg-name")].filter((e) => e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2).map((e) => e.textContent.slice(0, 20)));
      pruefe(tag + ": Texte nicht abgeschnitten", abg.length === 0, abg.join(","));
      const ueber = await s.evaluate(() => [...document.querySelectorAll(".wg-kachel")].filter((e) => { const r = e.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth + 1; }).length);
      pruefe(tag + ": alle Stationen im Bild", ueber === 0);
      pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
      await s.context().close();
    }
  }
  console.log("\n" + bestanden + " bestanden, " + befunde.length + " Befunde"); await schliessen();
}
