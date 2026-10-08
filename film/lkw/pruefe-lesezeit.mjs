// Prüft Text und Übersetzungen eines Films gegen die Lesezeit (wie film/vorfahrt/pruefe-lesezeit.mjs, aber für alle Lkw-Filme).
//  1. Übersetzungen vollständig (alle Schlüssel, keine leeren Texte, keine fremden Schlüssel)
//  2. Lesezeit: Zeichen pro Sekunde je Satz (Anzeigedauer = bis der nächste Satz kommt). Grenze 16 Zeichen/s (Lernende, Fremdsprache).
//  3. Länge im Vergleich zu Deutsch (Warnung ab 1,6-fach; Beschriftungen auf der Bühne: höchstens 22 Zeichen, sonst Umbruch im Bild)
//  4. Deutsch selbst: Mindestzeit 2,0 s + 0,5 s je Wort je Satz
// Aufruf: node film/lkw/pruefe-lesezeit.mjs f5-1 [code ...]   (ohne Codes: nur Deutsch plus alle vorhandenen Sprachdateien)
import fs from "node:fs"; import vm from "node:vm"; import path from "node:path";
const hier = path.dirname(new URL(import.meta.url).pathname);
const film = process.argv[2] || "f5-1";
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(hier, film, "text.js"), "utf8"), ctx);
const T = ctx.window.FILM_TEXT, DE = T.de;
const fenster = {};   // Anzeigefenster je Schlüssel (Sekunden)
T.kapitel.forEach((ch) => {
  const items = [];
  if (ch.sub) items.push([ch.sub.t, ch.sub.k]);
  (ch.punkte || []).forEach((p) => items.push([p.t, p.k]));
  if (ch.merk) items.push([ch.merk.t, ch.merk.k]);
  items.sort((a, b) => a[0] - b[0]);
  // Untertitel bleibt neben den Sätzen stehen (er wird nicht ersetzt) und ist bis zum Kapitelende lesbar
  items.forEach((it, i) => { const next = items[i + 1]; fenster[it[1]] = (it[1] === (ch.sub && ch.sub.k) ? ch.dauer - it[0] : (next ? next[0] : ch.dauer) - it[0]) - 0.4; });
});
const kurz = new Set(Object.keys(DE).filter((k) => k.startsWith("l_")));
let fehler = 0;
// Deutsch: Mindestzeit
const worte = (s) => s.trim().split(/\s+/).length;
const msgsDe = [];
for (const k of Object.keys(fenster)) { const soll = 2.0 + 0.5 * worte(DE[k]); if (fenster[k] + 0.4 < soll) msgsDe.push(`ZU KURZ ${k}: Fenster ${(fenster[k] + 0.4).toFixed(1)} s, Soll ${soll.toFixed(1)} s (2,0 s + 0,5 s je Wort)`); }
console.log(`de: ${msgsDe.length ? msgsDe.length + " Hinweise" : "ok"}`); msgsDe.forEach((m) => console.log("   " + m)); fehler += msgsDe.length;
const codes = process.argv.slice(3).length ? process.argv.slice(3) : (fs.existsSync(path.join(hier, film, "sprachen")) ? fs.readdirSync(path.join(hier, film, "sprachen")).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => f.slice(0, -5)) : []);
for (const c of codes) {
  const L = JSON.parse(fs.readFileSync(path.join(hier, film, "sprachen", c + ".json"), "utf8"));
  const msgs = [];
  for (const k of Object.keys(DE)) { if (!(k in L)) msgs.push("FEHLT " + k); else if (!String(L[k]).trim()) msgs.push("LEER " + k); }
  for (const k of Object.keys(L)) if (!(k in DE)) msgs.push("FREMD " + k);
  for (const k of Object.keys(fenster)) {
    if (!L[k]) continue;
    const cps = [...L[k]].length / fenster[k];
    if (cps > 16) msgs.push(`ZU SCHNELL ${k}: ${cps.toFixed(1)} Zeichen/s (Fenster ${fenster[k].toFixed(1)} s)`);
  }
  for (const k of Object.keys(DE)) {
    if (!L[k]) continue;
    const a = [...DE[k]].length, b = [...L[k]].length, q = b / a;
    if (kurz.has(k)) { if (b > 22) msgs.push(`BÜHNENWORT lang ${k}: "${L[k]}" (${b} Zeichen)`); }
    else if (q > 1.6 && b > 30) msgs.push(`LANG ${k}: ${q.toFixed(2)}-fach`);
  }
  console.log(`${c}: ${msgs.length ? msgs.length + " Hinweise" : "ok"}`); msgs.forEach((m) => console.log("   " + m)); fehler += msgs.filter((m) => /^(FEHLT|LEER|FREMD)/.test(m)).length;
}
process.exit(fehler ? 1 : 0);
