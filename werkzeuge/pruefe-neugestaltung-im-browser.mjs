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
  const ctx = await browser.newContext({ viewport: { width: opt.b, height: opt.h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, colorScheme: opt.dunkel ? "dark" : "light" });
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

async function layout(s, name) {
  const r = await s.evaluate(() => {
    const p = []; const de = document.documentElement;
    if (de.scrollWidth > innerWidth + 1) p.push("Seite wischbar " + de.scrollWidth + ">" + innerWidth);
    document.querySelectorAll(".page-content *, .header *, .bottom-nav *").forEach((el) => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return; if (r.right > innerWidth + 1 || r.left < -1) p.push("raus: " + el.className + " " + Math.round(r.left) + ".." + Math.round(r.right)); });
    return p;
  });
  pruefe(name + ": Layout", r.length === 0, r.slice(0, 3).join(" | "));
}
export { layout };

if (import.meta.url === "file://" + process.argv[1]) {
  const GROESSEN = [[360, 740, "360"], [412, 915, "412"], [812, 375, "quer"]];
  for (const dunkel of [false, true]) for (const [b, h, gn] of GROESSEN) for (const voll of [true, false]) {
    const tag = (voll ? "voll" : "start") + " " + gn + (dunkel ? " dunkel" : "");
    const s = await neueSeite({ b, h, voll, termin: 12, dunkel });
    await s.waitForTimeout(1200);
    const kr = await s.locator(".konto-kreis .krone-zeichen").count();
    pruefe(tag + ": Krone auf den Initialen " + (voll ? "da" : "nicht da"), voll ? kr === 1 : kr === 0);
    await layout(s, tag + " Start");
    await s.tap('[data-view="lernpfad"]'); await s.waitForTimeout(1200); await layout(s, tag + " Übersicht");
    // erster Bereich mit Schloss (nur ohne Vollzugang) -> hineingehen, Schloss mit Krone an den Zeilen
    if (!voll) {
      await s.locator('[data-gotostufe="Stoppschild-Situationen"]').first().evaluate((e) => e.scrollIntoView({ block: "center" })); await s.tap('[data-gotostufe="Stoppschild-Situationen"]'); await s.waitForTimeout(1200);
      const z = await s.locator(".video-zeile.versiegelt .vz-mal-siegel .ic").count();
      pruefe(tag + ": gesperrte Videos zeigen Schloss mit Krone (" + z + ")", z >= 3);
      const wort = await s.locator(".vz-siegelwort").count();
      pruefe(tag + ": kein Wort „versiegelt“ mehr in den Zeilen", wort === 0);
      await layout(s, tag + " Bereich");
      await s.screenshot({ path: join(bilder, "e1-" + gn + (dunkel ? "-dunkel" : "") + "-bereich.png") });
    }
    await s.tap('[data-view="pruefungsstrecken"]'); await s.waitForTimeout(1200); await layout(s, tag + " Strecken");
    await s.tap("#drawer-open-btn"); await s.waitForTimeout(500);
    const dn = await s.locator(".drawer .dh-name .krone-zeichen").count();
    pruefe(tag + ": Menü zeigt Krone " + (voll ? "da" : "nicht da"), voll ? dn === 1 : dn === 0);
    pruefe(tag + ": keine Fehler in der Konsole", s.fehler.length === 0, s.fehler.join(" | "));
    await s.context().close();
  }
  console.log("\n" + bestanden + " bestanden, " + befunde.length + " Befunde"); await schliessen();
}
