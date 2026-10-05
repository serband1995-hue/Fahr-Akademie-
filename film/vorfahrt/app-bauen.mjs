// Baut aus den Film-Quellen die EINE App-Datei: ../../verkehr/vorfahrt-film.js (ES-Modul, wird beim Öffnen von „Verkehr verstehen“ geladen).
// Aufruf: node app-bauen.mjs   (im Ordner film/vorfahrt). Die erzeugte Datei NICHT von Hand ändern – Quellen ändern, neu bauen.
// Kopiert außerdem die Verkehrszeichen nach ../../verkehr/vorfahrt-zeichen/.
import fs from "node:fs";
import path from "node:path";
const hier = path.dirname(new URL(import.meta.url).pathname);
const lies = (f) => fs.readFileSync(path.join(hier, f), "utf8");

// Bühnen-CSS auf die App einschränken: jede Regel bekommt ".vf " davor (Klassen der App bleiben unberührt)
function einschraenken(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (_, sel, body) =>
    sel.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (s.startsWith(".vf-") ? s : ".vf " + s)).join(",") + "{" + body.trim() + "}\n");
}
const css = einschraenken(lies("buehne.css")) + lies("app.css");

// Sprachdateien: sprachen/<code>.json -> W.FILM_SPRACHEN
const sprachDir = path.join(hier, "sprachen");
const sprachen = {};
if (fs.existsSync(sprachDir)) for (const f of fs.readdirSync(sprachDir).sort()) if (f.endsWith(".json")) sprachen[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(sprachDir, f), "utf8"));

const huelle = (name, code) => `// ---- ${name} ----\n(function (window) {\n${code}\n})(W);\n`;
const out =
`/* GENERIERT von film/vorfahrt/app-bauen.mjs – nicht von Hand ändern (Quellen: film/vorfahrt/*.js, buehne.css, app.css, sprachen/*.json).
   Erklärfilm „Vorfahrt“ für „Verkehr verstehen“: Animation läuft live (GSAP), nur der Text wechselt je Sprache. Keine Videodatei.
   starte(platz, { sprache, zeichen }) -> { zerstoeren }. Braucht window.gsap (vendor/gsap-3.14.2.min.js). */
const W = {};
const CSS = ${JSON.stringify(css)};
${huelle("baukasten.js", lies("baukasten.js"))}
${huelle("text.js", lies("text.js"))}
W.FILM_SPRACHEN = ${JSON.stringify(sprachen)};
${huelle("szenen.js", lies("szenen.js"))}
// ---- app-host.js ----
${lies("app-host.js")}`;
fs.writeFileSync(path.join(hier, "../../verkehr/vorfahrt-film.js"), out);

const zdir = path.join(hier, "../../verkehr/vorfahrt-zeichen");
fs.mkdirSync(zdir, { recursive: true });
for (const f of ["z205.svg", "z206.svg", "z2741.svg", "z306.svg"]) fs.copyFileSync(path.join(hier, "assets/zeichen", f), path.join(zdir, f));
console.log("ok: verkehr/vorfahrt-film.js (" + Math.round(out.length / 1024) + " KB), " + Object.keys(sprachen).length + " Sprachdateien, 4 Zeichen kopiert");
