// Prüft die Übersetzungen in sprachen/*.json gegen text.js:
//  1. vollständig (alle Schlüssel, keine leeren Texte, keine fremden Schlüssel)
//  2. Lesezeit: Zeichen pro Sekunde je Satz (Anzeigedauer = bis der nächste Satz kommt). Grenze 16 Zeichen/s (Lernende, Fremdsprache).
//  3. Länge im Vergleich zu Deutsch (Warnung ab 1,6-fach; Bühnen-Wörter ab 1,8-fach oder > 16 Zeichen)
// Aufruf: node pruefe-lesezeit.mjs [code ...]   (ohne Angabe: alle Sprachen)
import fs from "node:fs"; import vm from "node:vm"; import path from "node:path";
const hier = path.dirname(new URL(import.meta.url).pathname);
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(hier, "text.js"), "utf8"), ctx);
const T = ctx.window.FILM_TEXT, DE = T.de;
// Anzeigefenster je Schlüssel (Sekunden)
const fenster = {};
T.kapitel.forEach((ch) => {
  const items = [];
  if (ch.sub) items.push([ch.sub.t, ch.sub.k]);
  if (ch.intro) items.push([ch.intro.t, ch.intro.k]);
  (ch.stufen || []).forEach((s) => { items.push([s.t + 0.2, s.text]); fenster["__" + s.text] = 1; });
  (ch.punkte || []).forEach((p) => items.push([p.t, p.k]));
  if (ch.merk) items.push([ch.merk.t, ch.merk.k]);
  items.sort((a, b) => a[0] - b[0]);
  items.forEach((it, i) => { const next = items[i + 1]; fenster[it[1]] = (next ? next[0] : ch.dauer) - it[0] - 0.4; });
  // Stufen: Name, Text, Plus, Ref werden gemeinsam gelesen -> Plus teilt das Fenster mit dem Text
  (ch.stufen || []).forEach((s) => { fenster[s.plus] = fenster[s.text]; });
});
const kurz = new Set(["s1_name", "s2_name", "s3_name", "s4_name", "k2_vorrang", "k3_pill", "k4_pill"]);
const codes = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(hier, "sprachen")).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => f.slice(0, -5));
let fehler = 0;
for (const c of codes) {
  const L = JSON.parse(fs.readFileSync(path.join(hier, "sprachen", c + ".json"), "utf8"));
  const msgs = [];
  for (const k of Object.keys(DE)) { if (!(k in L)) msgs.push("FEHLT " + k); else if (!String(L[k]).trim()) msgs.push("LEER " + k); }
  for (const k of Object.keys(L)) if (!(k in DE)) msgs.push("FREMD " + k);
  // Lesezeit: Stufe = Text + Plus gemeinsam
  const lesen = (k) => {
    let n = [...(L[k] || "")].length;
    T.kapitel.forEach((ch) => (ch.stufen || []).forEach((s) => { if (s.text === k) n += [...(L[s.plus] || "")].length; }));
    return n;
  };
  for (const k of Object.keys(fenster)) {
    if (k.startsWith("__") || !L[k]) continue;
    if (T.kapitel.some((ch) => (ch.stufen || []).some((s) => s.plus === k))) continue;
    const cps = lesen(k) / fenster[k];
    if (cps > 16) msgs.push(`ZU SCHNELL ${k}: ${cps.toFixed(1)} Zeichen/s (Fenster ${fenster[k].toFixed(1)} s)`);
  }
  for (const k of Object.keys(DE)) {
    if (!L[k]) continue;
    const a = [...DE[k]].length, b = [...L[k]].length, q = b / a;
    if (kurz.has(k)) { if (b > 16 || q > 1.8) msgs.push(`BÜHNENWORT lang ${k}: "${L[k]}" (${b} Zeichen)`); }
    else if (q > 1.6 && b > 30) msgs.push(`LANG ${k}: ${q.toFixed(2)}-fach`);
  }
  console.log(`${c}: ${msgs.length ? msgs.length + " Hinweise" : "ok"}`); msgs.forEach((m) => console.log("   " + m)); fehler += msgs.filter((m) => /^(FEHLT|LEER|FREMD)/.test(m)).length;
}
process.exit(fehler ? 1 : 0);
