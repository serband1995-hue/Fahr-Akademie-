// Erzeugt aus text.js: Untertitel (WebVTT, Deutsch) und das Sprechertext-Blatt für die Stimme.
// Aufruf: node export-text.mjs   → schreibt ./out/untertitel-de.vtt und ./out/sprechertext-de.txt
// Die Zeiten sind Schätzungen (Wörter / 2,3 pro Sekunde), bis die echte Stimme eingesprochen ist.
import fs from "node:fs";
import vm from "node:vm";
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL("./text.js", import.meta.url), "utf8"), ctx);
const T = ctx.window.FILM_TEXT;
const fmt = (s) => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60, r = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(r).padStart(3, "0")}`; };
let vtt = "WEBVTT\n\n", sheet = `${T.titel}\nSprechertext (Deutsch). NOCH NICHT eingesprochen.\n\n`, n = 1, t0 = 0, words = 0;
for (const k of T.kapitel) {
  sheet += `--- ${k.kicker}: ${k.titel} (ab ${fmt(t0).slice(3, 8)}, ${k.dauer} s) ---\n`;
  k.sprecher.forEach((s, i) => {
    const next = k.sprecher[i + 1], start = t0 + s.t, w = s.text.split(/\s+/).length; words += w;
    const end = Math.min(start + w / 2.3 + 0.4, next ? t0 + next.t - 0.05 : t0 + k.dauer - 0.3);
    vtt += `${n++}\n${fmt(start)} --> ${fmt(end)}\n${s.text}\n\n`;
    sheet += `[${fmt(start).slice(3, 8)}] ${s.text}\n`;
  });
  sheet += "\n"; t0 += k.dauer;
}
sheet += `Wörter gesamt: ${words}\n`;
fs.mkdirSync(new URL("./out/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("./out/untertitel-de.vtt", import.meta.url), vtt);
fs.writeFileSync(new URL("./out/sprechertext-de.txt", import.meta.url), sheet);
console.log(`ok: ${n - 1} Zeilen, ${words} Wörter, ${t0} s`);
