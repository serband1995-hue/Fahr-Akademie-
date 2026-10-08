// Baut aus den Quellen eines Films EINE App-Datei: ../../verkehr/lkw-<film>.js (ES-Modul, starte(platz, { sprache }) -> { zerstoeren, zustand, zeitleiste, gesamt }).
// Aufruf: node film/lkw/bauen.mjs f5-1      Die erzeugte Datei NICHT von Hand ändern – Quellen ändern, neu bauen.
import fs from "node:fs";
import path from "node:path";
const hier = path.dirname(new URL(import.meta.url).pathname);
const film = process.argv[2];
if (!film || !fs.existsSync(path.join(hier, film, "text.js"))) { console.error("Aufruf: node film/lkw/bauen.mjs <film>  (z. B. f5-1)"); process.exit(1); }
const lies = (...p) => fs.readFileSync(path.join(hier, ...p), "utf8");

// Bühnen-CSS auf die App einschränken: jede Regel bekommt ".lk " davor (Klassen der App bleiben unberührt)
function einschraenken(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (_, sel, body) =>
    sel.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (/^\.lk([\s\[.:-]|$)/.test(s) ? s : ".lk " + s)).join(",") + "{" + body.trim() + "}\n");
}
const css = einschraenken(lies("kern", "buehne.css")) + lies("kern", "app.css");

// Sprachdateien: <film>/sprachen/<code>.json -> W.FILM_SPRACHEN
const sprachDir = path.join(hier, film, "sprachen");
const sprachen = {};
if (fs.existsSync(sprachDir)) for (const f of fs.readdirSync(sprachDir).sort()) if (f.endsWith(".json") && !f.startsWith("_")) sprachen[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(sprachDir, f), "utf8"));

const huelle = (name, code) => `// ---- ${name} ----\n(function (window) {\n${code}\n})(W);\n`;
const out =
`/* GENERIERT von film/lkw/bauen.mjs – nicht von Hand ändern (Quellen: film/lkw/kern/*, film/lkw/${film}/*).
   Erklärfilm „${film}“ für „Lkw und Zug verstehen“: Animation läuft live (GSAP) und wird aus dem Rechenmodell gezeichnet, nur der Text wechselt je Sprache. Keine Videodatei.
   starte(platz, { sprache }) -> { zerstoeren, zustand, zeitleiste, gesamt }. Braucht window.gsap (vendor/gsap-3.14.2.min.js). */
const W = {};
const CSS = ${JSON.stringify(css)};
${huelle("kern/modell.js", lies("kern", "modell.js"))}
${huelle("kern/baukasten.js", lies("kern", "baukasten.js"))}
${huelle("kern/panel.js", lies("kern", "panel.js"))}
${huelle("kern/seite.js", lies("kern", "seite.js"))}
${huelle("kern/zeit.js", lies("kern", "zeit.js"))}
${huelle(film + "/text.js", lies(film, "text.js"))}
W.FILM_SPRACHEN = ${JSON.stringify(sprachen)};
${huelle(film + "/szenen.js", lies(film, "szenen.js"))}
// ---- kern/host.js ----
${lies("kern", "host.js")}`;
const ziel = path.join(hier, "../../verkehr", `lkw-${film}.js`);
fs.writeFileSync(ziel, out);
console.log(`ok: verkehr/lkw-${film}.js (${Math.round(out.length / 1024)} KB), ${Object.keys(sprachen).length} Sprachdateien`);
