/* =====================================================================
   Szenen-Export für "Verkehr verstehen"
   Tastet die Lernszenen des Fahrlehrer-Kompass (lernszenen.js,
   lernszenen-stadt.js) und die eigenen Szenen (werkzeuge/szenen/*.js)
   ab und schreibt je Szene eine JSON-Datei im Format v1.
   Die Dateien kommen NICHT ins Repo, sondern in die Tabelle
   academy_szenen (ausgeliefert über die Edge Function academy-szene).

   Aufruf (Akademie-Repo muss über http erreichbar sein):
     npx http-server . -p 8765 -a 127.0.0.1 -c-1 &
     node werkzeuge/szenen-export.js <Pfad zum Kompass-Repo> <Ausgabeordner>

   Koordinaten: Kompass (x vor, y rechts) -> Akademie (x vor, z rechts),
   Richtung h_neu = -h_alt.

   Signale je Abtastpunkt als Bitfeld:
     1 Blinker links, 2 Blinker rechts, 4 Bremse, 8 Warnblinker,
     16 rückwärts, 32 Schulterblick links, 64 Schulterblick rechts,
     128 unsichtbar, 256 Blick Innenspiegel, 512 Spiegel links,
     1024 Spiegel rechts, 2048 Lichthupe, 4096 Rundumlicht
   ===================================================================== */
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const fs = require("fs"), path = require("path");

const KOMPASS = process.argv[2] || "../Fahrlehrer-Kompass-";
const OUT = process.argv[3] || "szenen-daten";
const BASIS = process.env.BASIS || "http://127.0.0.1:8765";
const DT = 1 / 15;

(async () => {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage();
  const fehler = []; p.on("pageerror", (x) => fehler.push(x.message));
  await p.goto(BASIS + "/manifest.json");
  let src = fs.readFileSync(path.join(KOMPASS, "lernszenen.js"), "utf8");
  src = src.replace("window.Lernszenen = {", "window.__LZI = { signale };\n  window.Lernszenen = {");
  await p.addScriptTag({ content: src });
  await p.addScriptTag({ content: fs.readFileSync(path.join(KOMPASS, "lernszenen-stadt.js"), "utf8") });

  const szenen = await p.evaluate(async (DT) => {
    const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;
    const tief = (o) => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v)));
    const KAT = ["innerorts", "ueberland", "grundfahr", "autobahn"];

    // Bahnen abtasten: pose(t) -> {x, z, h, v, s}, bits(t) -> Signale
    function abtasten(dauer, pose, bits) {
      const n = Math.ceil(dauer / DT) + 1, P = [], SIG = [];
      for (let i = 0; i < n; i++) {
        const t = Math.min(dauer, i * DT), q = pose(t);
        P.push(r2(q.x), r2(q.z), r3(q.h), r2(Math.abs(q.v || 0)), r2(q.s || 0)); SIG.push(bits(t, q));
      }
      const o = {};
      let fest = true;
      for (let i = 5; i < P.length && fest; i += 5) if (P[i] !== P[0] || P[i + 1] !== P[1] || P[i + 2] !== P[2]) fest = false;
      if (fest) o.pose = P.slice(0, 5); else o.P = P;
      if (SIG.every((v) => v === SIG[0])) o.sig0 = SIG[0]; else o.SIG = SIG;
      return o;
    }

    // ---------- Kompass-Szenen
    const S = window.Lernszenen._szenen, I = window.Lernszenen._intern, Z = window.__LZI;
    const liste = S.filter((s) => s.id !== "ueberholen").map((s, nr) => {
      const fz = s.fahrzeuge.map((f) => {
        let sw = 0, last = null;
        const pose = (t) => {
          const q = I.rohPos(f, t);
          return { x: q.x, z: q.y, h: -q.h, v: q.v, rueck: q.rueck };
        };
        // Weg (für Räder/Schritte) fortlaufend mitzählen
        const n = Math.ceil(s.dauer / DT) + 1, wege = [];
        for (let i = 0; i < n; i++) {
          const t = Math.min(s.dauer, i * DT), q = I.rohPos(f, t);
          if (last) { const d = Math.hypot(q.x - last.x, q.y - last.y); sw += (q.rueck || f.rueckwaerts || q.v < 0) ? -d : d; }
          last = q; wege.push(sw);
        }
        const o = { id: f.id, typ: f.typ, farbe: f.farbe };
        ["fokus", "geist", "blau", "schulbus", "parkt"].forEach((k) => { if (f[k]) o[k] = f[k]; });
        Object.assign(o, abtasten(s.dauer, (t) => Object.assign(pose(t), { s: wege[Math.min(wege.length - 1, Math.round(t / DT))] }), (t) => {
          const q = I.rohPos(f, t), g = Z.signale(f, t, q);
          const sch = g.schulter ? (g.schulter.seite || "links") : null;
          return (g.blinker === "links" ? 1 : 0) | (g.blinker === "rechts" ? 2 : 0) | (g.bremse ? 4 : 0) | (g.warn ? 8 : 0) | (g.rueck ? 16 : 0) |
            (sch === "links" || sch === "rundum" ? 32 : 0) | (sch === "rechts" || sch === "rundum" ? 64 : 0) | (f.unsichtbar && f.unsichtbar(t) ? 128 : 0) | (f.blau ? 4096 : 0);
        }));
        return o;
      });
      // Hilfsflächen: Reaktions- und Bremsweg (Gefahrbremsung) je Abtastpunkt
      let hilfen = null;
      if (s.id === "gefahr" && s.overlayUnten) {
        hilfen = [];
        for (let t = 0; t <= s.dauer + 1e-6; t += DT) {
          const auf = [];
          const ctx = { save() {}, restore() {}, fillRect(x, y, w, h) { auf.push({ f: this._f, x0: x, x1: x + w, z0: y, z1: y + h }); }, fillText(tx, x, y) { auf.push({ text: tx, x, y }); }, set fillStyle(v) { this._f = v; }, get fillStyle() { return this._f; } };
          s.overlayUnten(ctx, (x) => x, (y) => y, 1, t);
          const fl = auf.filter((a) => !a.text).map((a, i) => ({ id: "w" + i, x0: r2(a.x0), x1: r2(a.x1), z0: r2(a.z0), z1: r2(a.z1), farbe: a.f }));
          let ti = 0;
          auf.filter((a) => a.text).forEach((a) => {
            const f = fl.find((o) => Math.abs((o.x0 + o.x1) / 2 - a.x) < 0.2 && Math.abs((o.z0 + o.z1) / 2 - a.y) < 0.3 && !o.text);
            if (!f) return;
            const m = a.text.match(/^(Reaktion|Bremsen) ([\d.]+) m$/);
            const zahl = m ? m[2].replace(".", ",") : "";
            f.text = m ? (m[1] === "Reaktion" ? { de: "Reaktion " + zahl + " m", tr: "Tepki " + zahl + " m", en: "Reaction " + zahl + " m", ar: "رد الفعل " + zahl + " م" }
              : { de: "Bremsen " + zahl + " m", tr: "Fren " + zahl + " m", en: "Braking " + zahl + " m", ar: "الكبح " + zahl + " م" }) : { de: a.text };
            f.bei = [r2(a.x), 0.2, r2(a.y + (ti++ % 2 ? 1.6 : -1.6))];
          });
          hilfen.push(fl);
        }
      }
      const hilfenFest = s.id === "laengs" ? [{ id: "rahmen", x0: 0, x1: 7, z0: 3.4, z1: 5.4, farbe: "#ffffff", deckkraft: 0.2 }] : null;
      // Kamera: feste Übersicht (Kreuzung, Parklücke) oder dem Fokus folgen
      const k = s.kamera || {}, ko = {};
      const fokus = (s.fahrzeuge.find((f) => f.fokus) || s.fahrzeuge[0]).id;
      const f0 = I.rohPos(s.fahrzeuge.find((f) => f.id === fokus), 0);
      if (k.fest) {
        const zoom = k.zoom || 9, abstand = Math.max(16, Math.min(46, 330 / zoom));
        ko.fest = { x: k.fest[0], z: k.fest[1], blick: r3(f0.h), abstand: r2(abstand), hoehe: r2(abstand * 0.78) };
        ko.obenFest = true; ko.obenHoehe = r2(abstand * 1.25); ko.stadt = true;
      } else if (s.kategorie === "autobahn") { ko.folgeZ = true; ko.obenHoehe = 62; ko.obenVor = 14; }
      else { ko.folgeZ = true; ko.obenHoehe = 30; ko.obenVor = 5; ko.stadt = true; }
      const grundKamera = k.fest ? "uebersicht" : "schraeg";
      const kapitel = {};
      s.phasen.forEach((ph, i) => {
        let fr = ph.frage || null;
        if (fr && fr.art === "reihenfolge") fr = { text: "In welcher Reihenfolge dürfen die Fahrzeuge fahren?", reihenfolge: fr.ids.map((id) => fr.namen[id]), erklaerung: fr.erklaerung };
        kapitel["k" + i] = tief({ titel: ph.titel, text: ph.text, regel: ph.regel, frage: fr });
      });
      return {
        v: 1, id: s.id, kategorie: s.kategorie, reihenfolge: KAT.indexOf(s.kategorie) * 100 + nr,
        texte: { de: { titel: s.titel, kurz: s.kurz, kapitel } },
        varianten: [{
          name: "standard", dauer: s.dauer, dt: r3(DT), fokus, welt: { art: "kompass", strasse: tief(s.strasse) }, kameraOpt: ko, grundKamera,
          fahrzeuge: fz, kapitel: s.phasen.map((ph, i) => ({ t: r2(ph.t), id: "k" + i, kamera: grundKamera })), hilfen, hilfenFest
        }]
      };
    });

    // ---------- Eigene Szenen (Module mit richtig/falsch)
    const eigene = [];
    for (const name of ["ueberholen"]) {
      const m = await import("/werkzeuge/szenen/" + name + ".js");
      const sz = m.szene();
      const varianten = Object.keys(sz.varianten).map((vn) => {
        const V = sz.varianten[vn];
        const fz = V.fahrzeuge.map((f) => {
          const o = { id: f.id, typ: f.fahrschule ? "fahrschule" : f.bau === "pkw" ? (f.art === "transporter" ? "transporter" : "pkw") : f.bau, farbe: f.farbe };
          ["art", "kennzeichen", "aufbau"].forEach((k) => { if (f[k]) o[k] = f[k]; });
          if (f.id === V.fokus) o.fokus = true;
          Object.assign(o, abtasten(V.dauer, (t) => f.pose(t), (t) => {
            const g = f.sig(t) || {};
            return (g.blinker === "links" ? 1 : 0) | (g.blinker === "rechts" ? 2 : 0) | (g.bremse ? 4 : 0) | (g.warnblink ? 8 : 0) |
              (g.schulter === "links" ? 32 : 0) | (g.schulter === "rechts" ? 64 : 0) | (g.spiegel === "innen" ? 256 : 0) | (g.spiegel === "links" ? 512 : 0) |
              (g.spiegel === "rechts" ? 1024 : 0) | (g.lichthupe ? 2048 : 0) | (g.rundum ? 4096 : 0);
          }));
          return o;
        });
        const hilfen = [];
        for (let t = 0; t <= V.dauer + 1e-6; t += DT) {
          const stand = {}; V.fahrzeuge.forEach((f) => { stand[f.id] = f.pose(t); });
          hilfen.push(tief(V.hilfen(t, stand)));
        }
        return { name: vn, dauer: V.dauer, dt: r3(DT), fokus: V.fokus, welt: { art: "landstrasse", def: tief(V.strasse) }, kameraOpt: {}, grundKamera: "schraeg",
          fahrzeuge: fz, kapitel: V.kapitel.map((k) => tief(k)), hilfen, hilfenFest: null };
      });
      eigene.push({ v: 1, id: sz.id, kategorie: "ueberland", reihenfolge: 100, texte: tief(sz.texte), varianten });
    }
    return liste.concat(eigene);
  }, DT);

  // Übersetzungen (werkzeuge/szenen-texte/<sprache>.json, gleiche Struktur wie texte.de)
  ["tr", "en", "ar"].forEach((sp) => {
    const datei = path.join(__dirname, "szenen-texte", sp + ".json");
    if (!fs.existsSync(datei)) return;
    const tx = JSON.parse(fs.readFileSync(datei, "utf8"));
    szenen.forEach((s) => { if (tx[s.id]) s.texte[sp] = tx[s.id]; else console.log("Übersetzung fehlt:", sp, s.id); });
  });
  fs.mkdirSync(OUT, { recursive: true });
  let summe = 0;
  szenen.forEach((s) => {
    const j = JSON.stringify(s); summe += j.length;
    fs.writeFileSync(path.join(OUT, s.id + ".json"), j);
    console.log(s.id.padEnd(16), String(Math.round(j.length / 1024)).padStart(4) + " KB", s.varianten.map((v) => v.fahrzeuge.length + " Fz").join(" / "));
  });
  console.log(szenen.length + " Szenen, zusammen " + Math.round(summe / 1024) + " KB", fehler.length ? "FEHLER: " + fehler.join(" | ") : "");
  await b.close();
})();
