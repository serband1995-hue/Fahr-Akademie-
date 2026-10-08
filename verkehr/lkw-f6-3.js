/* GENERIERT von film/lkw/bauen.mjs – nicht von Hand ändern (Quellen: film/lkw/kern/*, film/lkw/f6-3/*).
   Erklärfilm „f6-3“ für „Lkw und Zug verstehen“: Animation läuft live (GSAP) und wird aus dem Rechenmodell gezeichnet, nur der Text wechselt je Sprache. Keine Videodatei.
   starte(platz, { sprache }) -> { zerstoeren, zustand, zeitleiste, gesamt }. Braucht window.gsap (vendor/gsap-3.14.2.min.js). */
const W = {};
const CSS = ".lk .stagewrap{position:relative;}\n.lk .stage{position:absolute; left:0; top:0; width:1080px; height:1080px; overflow:hidden; background:#434B45; direction:ltr;}\n.lk .stage > *{position:absolute;}\n.lk .pill{padding:10px 28px; border-radius:42px; background:#FAF6EC; color:#2F4A34; border:3px solid var(--lk-gold,#D9954C); font:700 44px/1.15 var(--lk-text,'Barlow',sans-serif); text-align:center; max-width:560px; box-shadow:0 5px 12px rgba(0,0,0,.35);}\n.lk .pill.gross{font-size:62px; padding:16px 44px; border-radius:60px; max-width:900px;}\n.lk .pill.klein{font-size:38px; padding:6px 20px;}\n.lk .lkw-pill{text-wrap:balance;}\n.lk-rtl .pill{direction:rtl;}\n.lk .panel .kicker{font-family:var(--lk-text,'Barlow',sans-serif); font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:#8F5A14;}\n.lk .panel .ttl,.lk .panel .merk{font-variant-numeric:lining-nums;}\n.lk .panel .ttl{font-family:var(--lk-titel,'Playfair Display',serif); font-weight:700; color:#2F4A34;}\n.lk .panel .sub{font-family:var(--lk-text,'Barlow',sans-serif); font-weight:500; color:#6F6857; opacity:0;}\n.lk .pts{display:grid;}\n.lk .pts > *{grid-area:1 / 1; align-self:start; opacity:0;}\n.lk .pt .tx{text-wrap:balance; font-family:var(--lk-text,'Barlow',sans-serif); font-weight:600; color:#2B2A22;}\n.lk .pt.gold .tx{color:#8F5A14;}\n.lk .pt .rf{font-family:var(--lk-text,'Barlow',sans-serif); font-weight:500; color:#6F6857;}\n.lk .merk{font-variant-numeric:lining-nums; background:#2F4A34; color:#FAF6EC; border-left:12px solid #D9954C; border-radius:6px 18px 18px 6px; font-family:var(--lk-titel,'Playfair Display',serif); font-weight:600; box-shadow:0 10px 24px rgba(43,42,34,.25);}\n\n/* Erklärfilme „Lkw und Zug verstehen“ in der App: Bild oben, Text darunter, Steuerung darunter (keine Knöpfe auf dem Bild).\n   Handy zuerst (360–412 px). Ab ~660 px Breite (Querformat/Tablet) steht der Text neben dem Bild. */\n.lk { --lk-titel:var(--ff-titel,'Playfair Display',Georgia,serif); --lk-text:var(--ff-body,'Barlow',sans-serif); --lk-gold:var(--gold,#D9954C); margin:var(--sp-m,12px) 0 var(--sp-l,18px); }\n.lk-kopf { font-family:var(--lk-titel); font-weight:600; font-size:19px; margin:0 0 4px; }\n.lk-intro { color:var(--muted,#6F6857); font-size:14.5px; line-height:1.45; margin:0 0 10px; }\n.lk-kasten { background:var(--surface,#EEE6D3); border:1px solid var(--border,rgba(43,40,30,.16)); border-radius:var(--r-l,16px); padding:10px; overflow:hidden; }\n.lk-szenen { display:grid; position:relative; }\n.lk-szenen .scene { grid-area:1 / 1; display:flex; flex-direction:column; gap:12px; min-width:0; pointer-events:none; direction:ltr; }\n.lk-szenen .stagewrap { width:100%; aspect-ratio:1 / 1; border-radius:var(--r-m,12px); overflow:hidden; flex:none; background:#434B45; }\n.lk-szenen .stage { transform-origin:0 0; transform:scale(var(--lk-s,.3)); }\n.lk-szenen .panel { min-width:0; padding:2px 4px 4px; }\n.lk-szenen .dots, .lk-szenen .foot { display:none; }\n.lk-szenen .kicker { font-size:12.5px; line-height:1.3; letter-spacing:.12em; }\n.lk-szenen .ttl { font-size:24px; line-height:1.15; margin:4px 0 0; }\n.lk-szenen .sub { font-size:16px; line-height:1.4; margin-top:8px; }\n.lk-szenen .pts { margin-top:12px; }\n.lk-szenen .pt .tx { font-size:18px; line-height:1.42; }\n.lk-szenen .pt .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.lk-szenen .step .nr { font-size:36px; }\n.lk-szenen .step .nm { font-size:22px; line-height:1.2; margin-top:2px; }\n.lk-szenen .step .tx { font-size:17px; line-height:1.42; margin-top:8px; }\n.lk-szenen .step .px { font-size:15px; line-height:1.4; margin-top:8px; }\n.lk-szenen .step .rf { font-size:13px; line-height:1.35; margin-top:6px; }\n.lk-szenen .merk { padding:14px 16px; font-size:20px; line-height:1.3; border-left-width:8px; }\n.lk-breit .lk-szenen .scene { flex-direction:row; align-items:flex-start; gap:20px; }\n.lk-breit .lk-szenen .stagewrap { flex:0 0 46%; }\n.lk-breit .lk-szenen .panel { flex:1; }\n.lk-rtl .lk-szenen .panel, .lk-rtl .lk-text, .lk-rtl .lk-intro, .lk-rtl .lk-kopf { direction:rtl; text-align:right; }\n.lk-steuer { display:flex; flex-direction:column; gap:10px; margin-top:12px; }\n.lk-reihe { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }\n.lk-knopf { min-height:44px; padding:0 16px; border-radius:999px; border:1px solid var(--border,rgba(43,40,30,.16)); background:var(--bg,#FAF6EC); color:var(--text,#2B2A22); font:600 15px/1.2 var(--lk-text); display:inline-flex; align-items:center; gap:8px; cursor:pointer; }\n.lk-knopf svg { width:18px; height:18px; flex:none; fill:currentColor; }\n.lk-play { background:var(--lk-gold); color:var(--auf-gold,#2B2A22); border-color:transparent; }\n.lk-zeit { margin-inline-start:auto; font-size:13px; color:var(--muted,#6F6857); font-variant-numeric:tabular-nums; direction:ltr; }\n.lk-regler { width:100%; height:28px; margin:0; accent-color:var(--gold-text,#8F5A14); direction:ltr; }\n.lk-kapitel { display:grid; grid-template-columns:repeat(auto-fit,minmax(40px,1fr)); gap:4px; direction:ltr; }   /* 7 Kapitel müssen bei 360 px in eine Zeile passen, sonst wickeln sie um */\n.lk-kap { min-width:0; min-height:44px; border-radius:12px; border:1px solid var(--border,rgba(43,40,30,.16)); background:var(--bg,#FAF6EC); color:var(--text,#2B2A22); font:700 15px/1 var(--lk-text); cursor:pointer; }\n.lk-kap[aria-current=\"true\"] { background:var(--gruen,#2F4A34); color:var(--auf-tief,#fff); border-color:transparent; }\n.lk-knopf:focus-visible, .lk-kap:focus-visible, .lk-regler:focus-visible, .lk-text summary:focus-visible { outline:3px solid var(--gold-text,#8F5A14); outline-offset:2px; }\n.lk-text { margin-top:12px; font-size:15px; line-height:1.5; }\n.lk-text summary { min-height:44px; display:flex; align-items:center; cursor:pointer; font-weight:600; }\n.lk-text h3 { font-family:var(--lk-titel); font-size:16px; margin:14px 0 4px; }\n.lk-text p { margin:0 0 6px; }\n.lk-text .lk-ref { color:var(--muted,#6F6857); font-size:13px; }\n@media (prefers-reduced-motion: reduce) { .lk-szenen .stage { transition:none; } }\n/* Paragrafen-Verweise nie verdrehen (RTL-Sprachen), Regel 8 der Sprachen-Notiz */\n.lk-szenen .rf, .lk-szenen .step .rf, .lk-text .lk-ref { unicode-bidi:plaintext; }\n/* Schriften ohne Playfair-Zeichen (ar, ckb, ur, hi, fa, ps, el, am, ti): Überschriften in Barlow, mehr Zeilenhöhe */\n.lk-barlow { --lk-titel:var(--ff-body,'Barlow',sans-serif); }\n.lk-barlow .ttl, .lk-barlow .nm, .lk-barlow .merk, .lk-barlow .bigcard, .lk-barlow .lk-kopf, .lk-barlow .lk-text h3 { font-weight:700; }\n.lk[lang=\"ur\"] .lk-szenen :is(.pt .tx,.step .tx,.step .px,.sub,.merk,.ttl,.step .nm), .lk[lang=\"ur\"] .lk-text, .lk[lang=\"ur\"] .lk-intro { line-height:1.7; }\n.lk[lang=\"ps\"] .lk-szenen :is(.pt .tx,.step .tx,.step .px,.sub,.merk,.ttl,.step .nm), .lk[lang=\"ps\"] .lk-text, .lk[lang=\"ps\"] .lk-intro { line-height:1.55; }\n";
// ---- kern/modell.js ----
(function (window) {
/* Rechenmodell „Lkw und Zug“ (Kinematik, Draufsicht). EINE Quelle für Film UND Test: Bewegungen werden gerechnet, nicht gezeichnet.
   Läuft im Browser (window.LKW_MODELL) und in Node (module.exports).

   Koordinaten in Metern: x nach Osten, y nach Süden (wie am Bildschirm), Winkel 0 = Osten, positiv = im Uhrzeigersinn (Rechtskurve = Winkel wächst).
   Rechtsverkehr: Bei Fahrt nach Osten liegt rechts = Süden (+y). Fahrerseite (links) = −y im Fahrzeugsystem.

   Modell (langsame Fahrt, kein Reifenschlupf, „Verfolgerkette“):
   - Die gelenkte Vorderachse (Mitte) F läuft genau auf der vorgegebenen Bahn.
   - Jede weitere Achse/Kupplung ist durch eine starre Strecke mit dem Vorderglied verbunden und läuft dem Vorderglied hinterher:
       Hinterachse A       folgt F   im Abstand L (Radstand)
       Kupplungspunkt K    liegt auf der Längsachse des Zugfahrzeugs im Abstand e von A (e > 0 vor, e < 0 hinter der Hinterachse)
       Anhängerachse T     folgt K   im Abstand D
   - Stationär (Kreisfahrt) ergibt das die bekannten Formeln: R_A = √(R_F² − L²), R_K = √(R_A² + e²), R_T = √(R_K² − D²).
   Quelle der Formeln: Vault „Recherche C-CE – Fahrdynamik und Grundfahraufgaben“ 2.3 (eigene Herleitung, Standard-Kinematik).
   Alle Fahrzeugmaße sind BEISPIELWERTE (Annahmen), keine Daten eines bestimmten Fahrzeugs. */
(function (root) {
  "use strict";
  const PI = Math.PI;

  /* ---------- Beispiel-Fahrzeuge (Meter) ----------
     breite  Fahrzeugbreite (Gesetz: höchstens 2,55 m, § 32 Abs. 1 StVZO)
     L       Radstand (Vorderachse – Hinterachse)
     vorn    Überhang vor der Vorderachse
     hinten  Überhang hinter der Hinterachse
     e       Lage des Kupplungspunkts relativ zur Hinterachse (+ vor, − hinter)
     D       Abstand Kupplungspunkt – Mitte der Anhängerachsen
     anh     { vorn, hinten }: Aufbau des Anhängers vor bzw. hinter der Achsmitte (vorn gemessen von der Achsmitte nach vorn)
     Gesamtlängen werden im Test gegen § 32 Abs. 3, 4 StVZO geprüft (Sattelzug ≤ 15,50 m; Lastzug 17,60 m liegt unter der einfachen Grenze 18,00 m, die 18,75 m gelten nur mit Ladeflächen-Teillängen). */
  const FAHRZEUGE = {
    solo: { id: "solo", breite: 2.55, L: 4.8, vorn: 1.4, hinten: 2.2, anh: null },
    lastzug: {
      id: "lastzug", breite: 2.55, L: 4.8, vorn: 1.4, hinten: 2.2,
      e: -2.3, D: 5.4,                       // starre Deichsel (Zentralachse), Anhängerachsen als Gruppe in der Mitte
      anh: { typ: "zentral", vorn: 3.8, hinten: 3.7 }   // Aufbau 7,5 m lang, Deichsel 1,6 m davor
    },
    sattelzug: {
      id: "sattelzug", breite: 2.55, L: 3.7, vorn: 1.4, hinten: 1.2,
      e: 0.55, D: 7.6,                       // Sattelvormaß 0,55 m, Königszapfen bis Achsmitte 7,60 m (Folie CE, Rechenbeispiel)
      anh: { typ: "sattel", vorn: 9.15, hinten: 3.3 }   // Aufbau beginnt 1,55 m vor dem Zapfen
    }
  };

  /* ---------- Bahn der Vorderachse ----------
     Segmente: { gerade: Länge } | { bogen: Radius, winkel: Bogenmaß, rechts: true|false }.
     Start bei (0,0) mit Richtung 0 (Osten). Für s < 0 wird die erste Gerade nach hinten verlängert. */
  function bahn(segmente) {
    const teile = []; let x = 0, y = 0, h = 0, s0 = 0;
    segmente.forEach(function (sg) {
      if (sg.gerade != null) {
        teile.push({ art: "g", s0: s0, len: sg.gerade, x: x, y: y, h: h });
        x += Math.cos(h) * sg.gerade; y += Math.sin(h) * sg.gerade; s0 += sg.gerade;
      } else {
        const R = sg.bogen, dir = sg.rechts === false ? -1 : 1, len = R * sg.winkel;
        // Mittelpunkt: rechts der Fahrtrichtung (Rechtskurve) = Richtung h + 90° bei „y nach unten“
        const cx = x + Math.cos(h + dir * PI / 2) * R, cy = y + Math.sin(h + dir * PI / 2) * R;
        teile.push({ art: "b", s0: s0, len: len, x: x, y: y, h: h, R: R, dir: dir, cx: cx, cy: cy });
        h += dir * sg.winkel;
        x = cx + Math.cos(h - dir * PI / 2) * R; y = cy + Math.sin(h - dir * PI / 2) * R; s0 += len;
      }
    });
    const gesamt = s0;
    function punkt(s) {
      if (s <= 0) { const t = teile[0]; return { x: t.x + Math.cos(t.h) * s, y: t.y + Math.sin(t.h) * s, h: t.h }; }
      if (s >= gesamt) {   // nach dem Ende gerade weiter
        const t = teile[teile.length - 1], e = punktIn(t, t.len), d = s - gesamt;
        return { x: e.x + Math.cos(e.h) * d, y: e.y + Math.sin(e.h) * d, h: e.h };
      }
      let i = 0; while (i < teile.length - 1 && s >= teile[i + 1].s0) i++;
      return punktIn(teile[i], s - teile[i].s0);
    }
    function punktIn(t, d) {
      if (t.art === "g") return { x: t.x + Math.cos(t.h) * d, y: t.y + Math.sin(t.h) * d, h: t.h };
      const w = t.h + t.dir * d / t.R;
      return { x: t.cx + Math.cos(w - t.dir * PI / 2) * t.R, y: t.cy + Math.sin(w - t.dir * PI / 2) * t.R, h: w };
    }
    return { punkt: punkt, laenge: gesamt, teile: teile };
  }

  /* ---------- Simulation ----------
     Gibt für jeden Schritt (ds Meter Vorderachsweg) die Lage aller Punkte zurück.
     Anfangszustand: alles gerade hinter der Vorderachse (stationäre Gerade), dann Verfolgerkette.
     Zustand z: { s, F:{x,y,h(Bahnrichtung)}, A, hz (Richtung Zugfahrzeug), K, T, ha (Richtung Anhänger) }. */
  function simuliere(fz, b, sStart, sEnde, ds, fuehrung) {
    ds = ds || 0.02;
    const ecke = fuehrung === "ecke";     // „ecke“: die Bahn führt die äußerste vordere Ecke (so verlangt es § 32d Abs. 1 Satz 2), sonst die Vorderachse
    const n = Math.round((sEnde - sStart) / ds);
    const P0 = b.punkt(sStart), u0 = { x: Math.cos(P0.h), y: Math.sin(P0.h) };
    // Anfangszustand: alles gerade in Richtung der ersten Geraden
    let F = ecke ? versetzt(P0, 0, fz) : { x: P0.x, y: P0.y };
    let A = { x: F.x - u0.x * fz.L, y: F.y - u0.y * fz.L };
    let K = null, T = null;
    if (fz.anh) {
      K = { x: A.x + u0.x * fz.e, y: A.y + u0.y * fz.e };
      T = { x: K.x - u0.x * fz.D, y: K.y - u0.y * fz.D };
    }
    let hz = P0.h, Fvor = { x: F.x, y: F.y };
    const zust = new Array(n + 1);
    for (let i = 0; i <= n; i++) {
      const s = sStart + i * ds, P = b.punkt(s);
      if (i > 0) {
        if (ecke) {                         // Vorderachse so setzen, dass die Ecke auf der Bahn bleibt (zwei Verbesserungsschritte)
          for (let k = 0; k < 3; k++) { F = versetzt(P, hz, fz); const a2 = folge(F, A, fz.L); hz = Math.atan2(F.y - a2.y, F.x - a2.x); }
        } else F = { x: P.x, y: P.y };
        A = folge(F, A, fz.L);
        hz = Math.atan2(F.y - A.y, F.x - A.x);
        if (fz.anh) {
          K = { x: A.x + Math.cos(hz) * fz.e, y: A.y + Math.sin(hz) * fz.e };
          T = folge(K, T, fz.D);
        }
      }
      // Richtung der Vorderräder = Richtung, in die sich die Vorderachse bewegt (bei Eckenführung aus der Bewegung gerechnet)
      const vh = ecke ? (i > 0 ? Math.atan2(F.y - Fvor.y, F.x - Fvor.x) : hz) : P.h; Fvor = { x: F.x, y: F.y };
      const z = { s: s, F: { x: F.x, y: F.y, h: vh }, A: { x: A.x, y: A.y }, hz: hz };
      if (fz.anh) { z.K = { x: K.x, y: K.y }; z.T = { x: T.x, y: T.y }; z.ha = Math.atan2(K.y - T.y, K.x - T.x); }
      zust[i] = z;
    }
    return { fz: fz, ds: ds, sStart: sStart, zustaende: zust, bei: function (s) { const i = Math.max(0, Math.min(n, Math.round((s - sStart) / ds))); return zust[i]; } };
  }
  // Vorderachse aus der Lage der äußersten vorderen Ecke (Rechtskurve: äußere Seite = links): Ecke = F + Drehung(hz)·(vorn, −breite/2)
  function versetzt(P, hz, fz) {
    const c = Math.cos(hz), s = Math.sin(hz);
    return { x: P.x - (c * fz.vorn + s * fz.breite / 2), y: P.y - (s * fz.vorn - c * fz.breite / 2) };
  }
  // Nachläufer: bleibt im festen Abstand d hinter dem Vorderpunkt p, auf der Verbindungslinie zu seiner alten Lage
  function folge(p, alt, d) {
    const dx = alt.x - p.x, dy = alt.y - p.y, l = Math.hypot(dx, dy) || 1;
    return { x: p.x + dx / l * d, y: p.y + dy / l * d };
  }

  /* ---------- Körper (für Zeichnung und Messung) ---------- */
  // Rechteck in Fahrzeugkoordinaten (x nach vorn, y nach rechts) -> Weltkoordinaten
  function rechteck(o, h, x0, x1, y0, y1) {
    const c = Math.cos(h), s = Math.sin(h);
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(function (p) { return { x: o.x + c * p[0] - s * p[1], y: o.y + s * p[0] + c * p[1] }; });
  }
  // Umrisse der tragenden Körper eines Zustands: Zugfahrzeug (Ursprung Hinterachse) und Anhänger/Auflieger (Ursprung Anhängerachse)
  function koerper(fz, z) {
    const b2 = fz.breite / 2, teile = [];
    teile.push({ name: "zug", poly: rechteck(z.A, z.hz, -fz.hinten, fz.L + fz.vorn, -b2, b2) });
    if (fz.anh) teile.push({ name: "anh", poly: rechteck(z.T, z.ha, -fz.anh.hinten, fz.anh.vorn, -b2, b2) });
    return teile;
  }

  /* ---------- Messungen (werden im Test und für Hinweise im Film benutzt) ---------- */
  // Signierter Abstand eines Punkts von einer Linie (Punkt p0, Richtung h0): positiv = links der Linie (bei Osten: Norden = −y)
  function abstandLinks(p, p0, h0) { return (-(p.x - p0.x) * Math.sin(h0) + (p.y - p0.y) * Math.cos(h0)) * -1; }
  function eckpunkte(fz, z) { const r = []; koerper(fz, z).forEach(function (k) { k.poly.forEach(function (p) { r.push(p); }); }); return r; }
  // Wie weit ragt irgendein Eckpunkt über die Gerade g (Punkt p0, Richtung h0) nach LINKS hinaus (links = Kurvenaußenseite bei Rechtskurve)?
  function maxUeberschnitt(sim, p0, h0, sBis) {
    let m = -1e9;
    sim.zustaende.forEach(function (z) {
      if (z.s > sBis) return;
      eckpunkte(sim.fz, z).forEach(function (p) { const d = abstandLinks(p, p0, h0); if (d > m) m = d; });
    });
    return m;
  }
  // Länge des Zuges (Meter), gemessen von der vordersten bis zur hintersten Ecke bei Geradeausfahrt
  function gesamtLaenge(fz) {
    if (!fz.anh) return fz.vorn + fz.L + fz.hinten;
    // vorderste Ecke -> Vorderachse (vorn) -> Kupplungspunkt (L − e) -> Anhängerachse (D) -> Ende des Aufbaus
    return fz.vorn + (fz.L - fz.e) + fz.D + fz.anh.hinten;
  }
  // Stationäre Radien einer Kreisfahrt, wenn die Vorderachse auf Radius RF läuft
  function radien(fz, RF) {
    const A = Math.sqrt(RF * RF - fz.L * fz.L), r = { F: RF, A: A };
    if (fz.anh) { r.K = Math.sqrt(A * A + fz.e * fz.e); r.T = Math.sqrt(r.K * r.K - fz.D * fz.D); }
    return r;
  }
  // Radius der Vorderachse, bei dem die äußerste vordere Ecke genau auf dem Kreis Raußen läuft (§ 32d Abs. 1 Satz 2).
  // Die Ecke liegt (L + vorn) vor und breite/2 neben der Hinterachse, deren Mittelpunkt auf der Hinterachslinie liegt: (R_A + b/2)² + (L + vorn)² = Raußen²
  function vorderachsRadius(fz, Raussen) { const RA = Math.sqrt(Raussen * Raussen - (fz.L + fz.vorn) * (fz.L + fz.vorn)) - fz.breite / 2; return Math.sqrt(RA * RA + fz.L * fz.L); }
  // Innerster Radius des Fahrzeugs (innere Ecke der letzten Achse) bei Kreisfahrt
  function innenRadius(fz, RF) { const r = radien(fz, RF); return (fz.anh ? r.T : r.A) - fz.breite / 2; }


  /* ---------- Folgefahrt (Abstand, Seitenansicht) ----------
     Ein Pkw bremst plötzlich bis zum Stand, der Lkw dahinter reagiert nach „reaktion“ Sekunden und bremst mit „aHinten“.
     Alle Werte sind BEISPIELWERTE (keine Aussage über Anhaltewege; Zahlen kommen im Film nicht vor):
     v0 Anfangsgeschwindigkeit m/s, luecke Abstand Stoßstange–Heck bei Bremsbeginn (m), aVorn/aHinten Verzögerungen (m/s²).
     Gibt Lage der Fahrzeugfronten über der Zeit zurück: x ist der Weg seit Bremsbeginn (m), Kollision = Abstand ≤ 0. */
  function folgefahrt(o) {
    const dt = 0.01, n = Math.round((o.dauer || 14) / dt), z = [];
    let vV = o.v0, vH = o.v0, xV = 0, xH = -o.luecke;   // xV = Heck des Vordermanns, xH = Front des Lkw
    let kollision = null;
    for (let i = 0; i <= n; i++) {
      const t = i * dt;
      z.push({ t: t, xV: xV, xH: xH, vV: vV, vH: vH, bremstV: t >= 0, bremstH: t >= o.reaktion, abstand: xV - xH });
      if (xV - xH <= 0 && kollision == null) kollision = t;
      vV = Math.max(0, vV - o.aVorn * dt); xV += vV * dt;
      if (t >= o.reaktion) vH = Math.max(0, vH - o.aHinten * dt);
      xH += vH * dt;
    }
    return { zustaende: z, dt: dt, kollision: kollision, minAbstand: Math.min.apply(null, z.map((q) => q.abstand)), bei: function (t) { return z[Math.max(0, Math.min(n, Math.round(t / dt)))]; } };
  }


  /* ---------- Sozialvorschriften (Film 8.1): Lenk-, Pausen- und Ruhezeiten nach VO (EG) Nr. 561/2006 ----------
     Regeln (Wortlaut Stand Konsolidierung 2020/21, gelesen am 08.10.2026): Art. 6 Abs. 1 (9 h, zweimal je Woche 10 h), Art. 7 (nach 4,5 h Lenkdauer 45 min Pause,
     ersatzweise erst ≥ 15 min, danach ≥ 30 min), Art. 8 Abs. 2 (24-Stunden-Zeitraum; Teil der Ruhezeit im Zeitraum ≥ 11 h regelmäßig, 9 bis < 11 h reduziert), Art. 4 Buchst. g.
     ev: Liste { art: "fahren" | "arbeit" | "pause" | "ruhe", min } in zeitlicher Reihenfolge ab dem Ende der vorigen Ruhezeit; die letzte Ruhe ist die Tagesruhe.
     Gibt { fehler: [..], lenkMin, ruhe: "regelmaessig" | "reduziert" | "zuKurz" | null } zurück. */
  function pruefeTag(ev, opt) {
    opt = opt || {};
    const fehler = []; let seit = 0, teil15 = false, lenk = 0, zeit = 0, ruheTeil = null; const ruheListe = [];
    for (let i = 0; i < ev.length; i++) {
      const e = ev[i];
      if (e.art === "fahren") {
        seit += e.min; lenk += e.min; zeit += e.min;
        if (seit > 270) fehler.push("Lenkdauer über 4:30 h ohne ausreichende Pause (nach " + zeit + " min)");
      } else if (e.art === "arbeit") { zeit += e.min; }
      else if (e.art === "pause") {
        zeit += e.min;
        if (e.min >= 45) { seit = 0; teil15 = false; }
        else if (e.min >= 30 && teil15) { seit = 0; teil15 = false; }
        else if (e.min >= 15 && !teil15) { teil15 = true; }
      } else if (e.art === "ruhe") {
        zeit += 0; ruheListe.push(Math.min(e.min, 24 * 60 - zeit)); zeit += e.min;
      }
    }
    // tägliche Ruhezeit (Art. 4 Buchst. g, Art. 8 Abs. 2): eine Ruhezeit ≥ 11 h regelmäßig, ≥ 9 h reduziert; zwei Abschnitte: erst ≥ 3 h, dann ≥ 9 h = regelmäßig, geteilt
    if (ruheListe.length === 1) ruheTeil = ruheListe[0] >= 660 ? "regelmaessig" : ruheListe[0] >= 540 ? "reduziert" : "zuKurz";
    else if (ruheListe.length === 2) ruheTeil = ruheListe[0] >= 180 && ruheListe[1] >= 540 ? "regelmaessigGeteilt" : "zuKurz";
    if (ruheTeil === "zuKurz") fehler.push("Tagesruhe im 24-Stunden-Zeitraum kürzer als 9 h");
    const grenze = opt.verlaengert ? 600 : 540;
    if (lenk > grenze) fehler.push("Tageslenkzeit über " + (grenze / 60) + " h");
    return { fehler: fehler, lenkMin: lenk, ruhe: ruheTeil, ok: fehler.length === 0 };
  }

  // Verlauf der „Lenkdauer seit der letzten anrechenbaren Pause“ (Art. 7) zu einer Minute m des Ablaufs ev (für das Messgerät im Film 8.1)
  function lenkdauerBei(ev, m) {
    let seit = 0, teil15 = false, t = 0, lenk = 0;
    for (let i = 0; i < ev.length && t < m; i++) {
      const e = ev[i], d = Math.min(e.min, m - t), voll = d >= e.min;
      if (e.art === "fahren") { seit += d; lenk += d; }
      else if (e.art === "pause" && voll) {
        if (e.min >= 45) { seit = 0; teil15 = false; } else if (e.min >= 30 && teil15) { seit = 0; teil15 = false; } else if (e.min >= 15 && !teil15) teil15 = true;
      }
      t += d;
    }
    return { seit: seit, lenk: lenk, teil15: teil15 };
  }
  // Woche: Lenkstunden je Tag (Mo..So) -> Prüfung Art. 6 Abs. 1–3 (Tag 9 h, höchstens zweimal 10 h; Woche 56 h; zwei Wochen 90 h)
  function pruefeWochen(wochen) {
    const fehler = []; let vorher = null;
    wochen.forEach((w, k) => {
      const summe = w.reduce((a, b) => a + b, 0), lang = w.filter((h) => h > 9).length;
      if (w.some((h) => h > 10)) fehler.push("Woche " + (k + 1) + ": ein Tag über 10 h");
      if (lang > 2) fehler.push("Woche " + (k + 1) + ": mehr als zweimal über 9 h");
      if (summe > 56) fehler.push("Woche " + (k + 1) + ": " + summe + " h über 56 h");
      if (vorher != null && vorher + summe > 90) fehler.push("Woche " + k + " und " + (k + 1) + ": " + (vorher + summe) + " h über 90 h");
      vorher = summe;
    });
    return { fehler: fehler, ok: fehler.length === 0 };
  }

  /* ---------- Sichtfeld des Fahrers (Film 5.2 „Toter Winkel“) ----------
     Vereinfachtes Modell eines Solo-Lkw (Maße schematisch, siehe SICHT): Draufsicht, Koordinaten im Fahrzeug (Ursprung Hinterachse, x vorn, y rechts).
     Direkt gesehen wird, was hinter der Unterkante einer Scheibe liegt (Strahl von der Augenhöhe über die Kante auf den Boden, Höhe des Objekts zählt);
     Spiegel sind Sichtkeile ab der Spiegelposition nach hinten; der eigene Aufbau verdeckt (Strahl-Rechteck-Test). Kein Frontspiegel, keine Kamera. */
  const SICHT = {
    he: 2.55, hw: 1.85, hs: 1.35,                       // Augenhöhe, Unterkante Frontscheibe, Unterkante Seitenscheibe (m)
    spiegel: [                                            // Keile: Achsrichtung nach hinten, um phi nach außen gedreht, Halbwinkel alpha, Reichweite
      { id: "haupt", seite: 1, phi: 5, alpha: 7.5, reichweite: 50 }, { id: "weit", seite: 1, phi: 22, alpha: 12, reichweite: 30 },
      { id: "haupt", seite: -1, phi: 5, alpha: 7.5, reichweite: 50 }, { id: "weit", seite: -1, phi: 22, alpha: 12, reichweite: 30 }
    ]
  };
  function sichtfeld(fz) {
    const b2 = fz.breite / 2, xv = fz.L + fz.vorn, kl = 2.3;
    const auge = { x: xv - 1.45, y: -0.55 }, mx = xv - 1.35 + 0.17, my = b2 + 0.4;
    // Öffnungen: Frontscheibe (Ebene x = xv), rechte und linke Seitenscheibe (Ebene y = ±(b2 − 0.1))
    const oeff = [
      { id: "front", A: { x: xv, y: -b2 + 0.16 }, B: { x: xv, y: b2 - 0.16 }, h: SICHT.hw },
      { id: "rechts", A: { x: auge.x - 0.4, y: b2 - 0.1 }, B: { x: auge.x + 0.4, y: b2 - 0.1 }, h: SICHT.hs },
      { id: "links", A: { x: auge.x - 0.4, y: -b2 + 0.1 }, B: { x: auge.x + 0.4, y: -b2 + 0.1 }, h: SICHT.hs }
    ];
    const spiegel = SICHT.spiegel.map(function (m) {
      const ph = m.phi * Math.PI / 180, al = m.alpha * Math.PI / 180;
      return { id: m.id, seite: m.seite, pos: { x: mx, y: m.seite * my }, achse: Math.atan2(m.seite * Math.sin(ph), -Math.cos(ph)), halb: al, reichweite: m.reichweite };
    });
    const koerper = { x0: -fz.hinten, x1: xv, y0: -b2, y1: b2 };
    function schnittKoerper(a, b) {     // Strecke a→b trifft das Rechteck?
      const r = koerper; let t0 = 0, t1 = 1; const dx = b.x - a.x, dy = b.y - a.y;
      const pr = [-dx, dx, -dy, dy], qr = [a.x - r.x0 - 1e-9, r.x1 - a.x - 1e-9, a.y - r.y0 - 1e-9, r.y1 - a.y - 1e-9];
      for (let i = 0; i < 4; i++) {
        if (pr[i] === 0) { if (qr[i] < 0) return false; } else {
          const u = qr[i] / pr[i]; if (pr[i] < 0) { if (u > t1) return false; if (u > t0) t0 = u; } else { if (u < t0) return false; if (u < t1) t1 = u; }
        }
      }
      return t0 < t1;
    }
    // Strahl vom Auge durch die Öffnung: sichtbar, wenn der Punkt hinter der auf Faktor k gestreckten Öffnungslinie liegt
    function ueberOeffnung(o, x, y, ho) {
      const k = Math.max(1, (SICHT.he - ho) / (SICHT.he - o.h));
      const ax = auge.x + k * (o.A.x - auge.x), ay = auge.y + k * (o.A.y - auge.y), bx = auge.x + k * (o.B.x - auge.x), by = auge.y + k * (o.B.y - auge.y);
      const dx = x - auge.x, dy = y - auge.y, ex = bx - ax, ey = by - ay, det = dx * (-ey) - dy * (-ex);
      if (Math.abs(det) < 1e-12) return false;
      const rx = ax - auge.x, ry = ay - auge.y, t = (rx * (-ey) - ry * (-ex)) / det, u = (dx * ry - dy * rx) / det;
      return u >= 0 && u <= 1 && t > 0 && t <= 1;   // Punkt liegt (auf dem Strahl) hinter oder auf der gestreckten Öffnungslinie
    }
    function imKeil(m, x, y) {
      const dx = x - m.pos.x, dy = y - m.pos.y, d = Math.hypot(dx, dy); if (d > m.reichweite || d < 0.3) return false;
      let w = Math.atan2(dy, dx) - m.achse; while (w > Math.PI) w -= 2 * Math.PI; while (w < -Math.PI) w += 2 * Math.PI;
      return Math.abs(w) <= m.halb && !schnittKoerper(m.pos, { x: x, y: y });
    }
    /* Quelle der Sicht: "front" | "rechts" | "links" | spiegel-id+Seite | null (verdeckt). ho = Höhe des Objekts (m) */
    function quelle(x, y, ho) {
      ho = ho || 0;
      if (x >= koerper.x0 && x <= koerper.x1 && y >= koerper.y0 && y <= koerper.y1) return "fahrzeug";
      for (let i = 0; i < oeff.length; i++) if (ueberOeffnung(oeff[i], x, y, ho)) return oeff[i].id;
      for (let i = 0; i < spiegel.length; i++) if (imKeil(spiegel[i], x, y)) return spiegel[i].id + (spiegel[i].seite > 0 ? "R" : "L");
      return null;
    }
    return { auge: auge, oeff: oeff, spiegel: spiegel, koerper: koerper, quelle: quelle, sichtbar: (x, y, ho) => { const q = quelle(x, y, ho); return q != null && q !== "fahrzeug"; } };
  }
  // Weltpunkt -> Fahrzeugkoordinaten (z: Zustand der Simulation mit A, hz)
  function insFahrzeug(z, p) { const c = Math.cos(z.hz), s = Math.sin(z.hz), dx = p.x - z.A.x, dy = p.y - z.A.y; return { x: c * dx + s * dy, y: -s * dx + c * dy }; }


  // Kleinster Abstand zweier Vielecke (0, wenn sie sich berühren oder überlappen); Eckenlisten [{x,y}]
  function polyAbstand(P, Q) {
    const inside = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; };
    const segD = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy, t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0; return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
    if (P.some((p) => inside(p, Q)) || Q.some((q) => inside(q, P))) return 0;
    let d = Infinity;
    P.forEach((p, i) => { const n = Q.length; for (let j = 0; j < n; j++) d = Math.min(d, segD(p, Q[j], Q[(j + 1) % n])); });
    Q.forEach((q, i) => { const n = P.length; for (let j = 0; j < n; j++) d = Math.min(d, segD(q, P[j], P[(j + 1) % n])); });
    return d;
  }
  // Wie weit vor der Stoßstange (m) ein Objekt der Höhe ho vom Fahrerauge aus noch verdeckt ist (Strahl über die Unterkante der Frontscheibe)
  function verdecktVorn(ho) { const k = Math.max(1, (SICHT.he - ho) / (SICHT.he - SICHT.hw)); return 1.45 * (k - 1); }

  /* ---------- Rechtsabbiegen mit Radfahrer (Film 5.2) ----------
     Weltkoordinaten der Rechnung: der Lkw fährt in x-Richtung, die Vorderachse beginnt die Rechtskurve (Radius 10,75 m) bei x = 32 m; y nach rechts.
     Der Radfahrer fährt auf dem Radstreifen rechts vom Lkw geradeaus (y = 2,4 m, Länge 1,8 m, Breite 0,6 m, Höhe der Sichtprobe 1,0 m).
     art "A": Lkw wird langsamer, biegt ab, ohne neu zu schauen. art "B": Lkw hält vor dem Abbiegen, lässt den Radfahrer durch, biegt dann mit Schrittgeschwindigkeit ab. */
  const ABBIEGEN = { R: 10.75, S0: 32, dt: 0.05, yb: 2.4, vb: 4.0, xb0: 9, s0: 9, v0: 5.0, v1: 3.5, ta: 2.0, vSchritt: 1.8, sBremse: 21.7, aBremse: 1.5, stopp: 0.2 };
  function radfahrerAbbiegen(art, opt) {
    const P = Object.assign({}, ABBIEGEN, opt || {}), fz = FAHRZEUGE.solo, sf = sichtfeld(fz);
    const bogenL = P.R * Math.PI / 2, b = bahn([{ gerade: P.S0 }, { bogen: P.R, winkel: Math.PI / 2, rechts: true }, { gerade: 60 }]);
    const sim = simuliere(fz, b, 0, P.S0 + bogenL + 40, P.dt), zs = (s) => sim.zustaende[Math.max(0, Math.min(sim.zustaende.length - 1, Math.round(s / P.dt)))];
    const frames = []; let s = P.s0, v = art === "B" ? P.v0 : P.v0, t = 0, haelt = false, losBei = null, kontakt = false;
    for (let i = 0; i < 4000; i++) {
      t = i * P.dt;
      const bx = P.xb0 + P.vb * t, z = zs(s);
      const bp = [{ x: bx - 0.9, y: P.yb - 0.3 }, { x: bx + 0.9, y: P.yb - 0.3 }, { x: bx + 0.9, y: P.yb + 0.3 }, { x: bx - 0.9, y: P.yb + 0.3 }];
      const d = polyAbstand(koerper(fz, z)[0].poly, bp);
      // Sicht: Radfahrer wird gesehen, wenn mindestens ein Punkt (hinten, Mitte, vorn) sichtbar ist
      let art2 = "verdeckt";
      [bx + 0.8, bx, bx - 0.8].forEach(function (x) { const l = insFahrzeug(z, { x: x, y: P.yb }), q = sf.quelle(l.x, l.y, 1.0); if (q && q !== "fahrzeug") { if (/^(haupt|weit)/.test(q)) art2 = "spiegel"; else if (art2 === "verdeckt") art2 = "scheibe"; } });
      frames.push({ t: t, s: s, z: z, v: v, bx: bx, by: P.yb, abstand: d, sicht: art2 });
      if (art === "A" && d < P.stopp) { kontakt = true; break; }
      if (s > P.S0 + bogenL + 14) break;
      // Lkw-Geschwindigkeit
      if (art === "A") v = t < P.ta ? P.v0 + (P.v1 - P.v0) * t / P.ta : P.v1;
      else {
        if (losBei == null) {
          if (s >= P.sBremse) v = Math.max(0, v - P.aBremse * P.dt);       // bremsen bis zum Stillstand
          if (v === 0 && s >= P.sBremse) { haelt = true; if (bx - 0.9 > P.S0 + P.R + 3) losBei = t; }   // erst wenn der Radfahrer vorbei ist
        } else v = Math.min(P.vSchritt, v + 1.8 * P.dt);
      }
      s += v * P.dt;
    }
    return { frames: frames, kontakt: kontakt, P: P, losBei: losBei, bogenL: bogenL, minAbstand: Math.min.apply(null, frames.map((f) => f.abstand)) };
  }

  // Umrisse der Sichtfelder (Meter im Fahrzeug) zum Zeichnen: Spiegelkeile mit Schatten des Aufbaus (Strahlverfolgung), Blickfelder durch die Scheiben (Boden)
  function sichtPolygone(fz, ho) {
    ho = ho || 0;
    const sf = sichtfeld(fz), r = sf.koerper, out = { spiegel: [], scheibe: [] };
    function trifftKoerper(o, w) {      // Abstand bis zum Rechteck entlang des Strahls (Infinity: kein Treffer)
      const dx = Math.cos(w), dy = Math.sin(w); let t0 = 0, t1 = Infinity;
      const pr = [-dx, dx, -dy, dy], qr = [o.x - r.x0, r.x1 - o.x, o.y - r.y0, r.y1 - o.y];
      for (let i = 0; i < 4; i++) {
        if (Math.abs(pr[i]) < 1e-12) { if (qr[i] < 0) return Infinity; } else {
          const u = qr[i] / pr[i]; if (pr[i] < 0) { if (u > t1) return Infinity; if (u > t0) t0 = u; } else { if (u < t0) return Infinity; if (u < t1) t1 = u; }
        }
      }
      return t0 < t1 && t0 > 1e-6 ? t0 : Infinity;
    }
    sf.spiegel.forEach(function (m) {
      const pts = [{ x: m.pos.x, y: m.pos.y }], n = 24;
      for (let k = 0; k <= n; k++) { const w = m.achse - m.halb + (2 * m.halb) * k / n, d = Math.min(m.reichweite, trifftKoerper(m.pos, w)); pts.push({ x: m.pos.x + d * Math.cos(w), y: m.pos.y + d * Math.sin(w) }); }
      out.spiegel.push({ id: m.id, seite: m.seite, pts: pts });
    });
    sf.oeff.forEach(function (o) {
      const k = Math.max(1, (SICHT.he - ho) / (SICHT.he - o.h)), ex = (p, f) => ({ x: sf.auge.x + f * (p.x - sf.auge.x), y: sf.auge.y + f * (p.y - sf.auge.y) });
      const dA = Math.hypot(o.A.x - sf.auge.x, o.A.y - sf.auge.y), dB = Math.hypot(o.B.x - sf.auge.x, o.B.y - sf.auge.y), far = 12;
      out.scheibe.push({ id: o.id, pts: [ex(o.A, k), ex(o.B, k), ex(o.B, Math.max(k, far / dB)), ex(o.A, Math.max(k, far / dA))] });
    });
    return out;
  }

  /* ---------- Druckluft-Bremsanlage (Filme 6.1, 6.2, 6.3, 3.x): Prinzipmodell, Drücke als Anteil 0…1 (keine bar-Werte) ----------
     Das Modell bildet die Wirkrichtung ab, nicht die Größe: wer Druck hat, bremst; wer Vorrat hat, kann bremsen; Feder bremst, Luft löst. */
  const DRUCK = { schwelle: 0.5 };   // Versorgungsdruck, ab dem die Anhängerbremse „versorgt“ ist (Anteil des vollen Vorratsdrucks)
  // Zweikreis-Betriebsbremse: zwei voneinander getrennte Bremskreise (z. B. Vorder- und Hinterachse); jeder hat eigenen Vorrat
  function zweikreis(o) {
    const pedal = Math.max(0, Math.min(1, o.pedal || 0)), leck = o.leck || [false, false];
    const vorrat = leck.map((l) => (l ? 0 : 1)), zyl = vorrat.map((v) => Math.min(v, pedal));
    return { vorrat: vorrat, zyl: zyl, wirkung: (zyl[0] + zyl[1]) / 2, kreiseOk: vorrat.filter((v) => v > 0).length };
  }
  // Anhängerbremsventil der Zweileitungsbremse: rot = Vorratsleitung (versorgt, hält den Anhänger gelöst), gelb = Bremsleitung (Steuerdruck: Druck rein = bremsen)
  // Fällt der Druck in der roten Leitung unter die Schwelle, bremst der Anhänger selbsttätig aus seinem eigenen Vorratsbehälter.
  function anhaengerBremse(o) {
    const rot = o.rot, gelb = o.gelb, vorrat = o.vorratAnh == null ? 1 : o.vorratAnh;
    const versorgt = rot >= DRUCK.schwelle;
    const zyl = versorgt ? Math.min(gelb, vorrat) : vorrat;
    return { versorgt: versorgt, zyl: zyl, selbsttaetig: !versorgt && vorrat > 0, gebremst: zyl > 0.05, vomZugSteuerbar: versorgt && o.gelbVerbunden !== false };
  }
  // Kombizylinder (Betriebsbremse = Membran, Feststell-/Hilfsbremse = Federspeicher): Feder bremst, Druck im Federspeicherraum löst
  const FEDER = { haltedruck: 0.6 };   // ab diesem Anteil des Vorratsdrucks ist die Feder ganz gespannt (Bremse gelöst)
  function federspeicher(o) {
    const pF = Math.max(0, Math.min(1, o.pFeder)), pM = Math.max(0, Math.min(1, o.pMembran || 0));
    const federKraft = Math.max(0, 1 - pF / FEDER.haltedruck);             // 1 = Feder voll entspannt (volle Federkraft), 0 = ganz gespannt
    const kraft = Math.min(1, federKraft + pM);                             // Betriebsbremse und Feder addieren sich (Begrenzung auf volle Bremskraft)
    return { federKraft: federKraft, kraft: kraft, geloest: federKraft === 0 && pM === 0, gebremst: kraft > 0.02 };
  }
  // Anschlussreihenfolge Zug ↔ Anhänger: Zustand nach jedem Schritt (rot = Vorratsleitung, gelb = Bremsleitung)
  function kuppelnZustand(verbunden) {
    const rot = !!verbunden.rot, gelb = !!verbunden.gelb;
    const angehaengt = verbunden.angehaengt !== false;
    // Ohne Versorgung (rot nicht verbunden) bremst der Anhänger selbsttätig; mit Versorgung ist er gelöst
    const ab = anhaengerBremse({ rot: rot ? 1 : 0, gelb: 0, vorratAnh: 1, gelbVerbunden: gelb });
    const geloest = ab.versorgt;
    const unsicher = geloest && !gelb;     // Anhänger gelöst, aber der Zug kann ihn nicht bremsen
    return { geloest: geloest, bremstSelbst: ab.selbsttaetig, vomZugSteuerbar: geloest && gelb, unsicher: unsicher };
  }

  /* ---------- Sattelzug kuppeln (Filme 3.1, 3.2, 3.3): Beispielhöhen eines neutralen Fahrzeugs, Prüfungen für Höhe, Fluchten und Wegrollen ---------- */
  const SATTEL = { unterkante: 1.30, plattenOben: 1.25, zapfenUnten: 1.18, fluchtToleranz: 0.10, e: 0.55 };   // m; Zapfen ragt 0,12 m unter die Aufgleitplatte, Sattelplatte soll ihn seitlich fassen
  // Höhe: Die Sattelplatte muss beim Unterfahren unter dem Zapfen und der Aufgleitplatte bleiben; erst danach wird die Zugmaschine bis zum Kontakt angehoben (Auflieger darf nicht angehoben werden)
  function sattelUnterfahren(luft) {
    const oben = SATTEL.plattenOben + luft;
    return { plattenOben: oben, passtUnter: oben < SATTEL.zapfenUnten - 1e-9, kontakt: oben >= SATTEL.unterkante - 1e-9, hebtAuf: oben > SATTEL.unterkante + 1e-9 };
  }
  // Fluchten: Die Zugmaschine fährt gerade zurück; sie startet mit seitlichem Versatz (m) und Winkel (Grad) zur Auflieger-Mittellinie, Weg bis zum Zapfen d (m)
  function sattelTreffer(o) {
    const quer = (o.versatz || 0) + (o.abstand || 6) * Math.tan((o.winkel || 0) * Math.PI / 180);
    return { quer: quer, ok: Math.abs(quer) <= SATTEL.fluchtToleranz };
  }
  // Wegrollen beim Anschließen der roten Leitung (DGUV Information 214-080): Rot löst die Betriebsbremse des Anhängers; ohne Feststellbremse und Keile rollt der Zug schon bei kleinem Gefälle
  function rollen(o) {
    const betriebsbremseAnhaenger = !o.rot;                          // rot angeschlossen = Betriebsbremse des Anhängers gelöst
    const gesichert = !!(o.festZug || o.festAnh || o.keile);
    return { rollt: !betriebsbremseAnhaenger && !gesichert && (o.gefaelle || 0) > 0, betriebsbremseAnhaenger: betriebsbremseAnhaenger, gesichert: gesichert };
  }

  // Abreißen (Film 6.2): Was passiert mit dem Anhänger, wenn die rote Vorratsleitung bzw. nur die gelbe Bremsleitung abreißt?
  // rot weg: Druckabfall in der Vorratsleitung → Anhänger bremst sofort selbsttätig (aus dem eigenen Vorrat). gelb weg: beim Fahren unbemerkt; erst wenn die Zugmaschine bremst, fehlt der Gegendruck,
  // das Anhängersteuerventil entlüftet die rote Leitung und der Anhänger bremst. Die Bremskreise der Zugmaschine bleiben durch Überström- und Vierkreisschutzventil gefüllt.
  function abreissen(o) {
    const rot = !!o.rot, gelb = !!o.gelb && !rot, bremst = !!o.bremst;
    return { anhaengerBremst: rot || (gelb && bremst), sofort: rot, wartetAufBremsung: gelb && !bremst, zugBremstWeiter: true };
  }
  // Zeit-Weg des Abreißens: beide Fahrzeuge fahren mit v0; die Kupplung reißt bei t = 0; der Anhänger bremst nach der Verzögerung tV mit a, die Zugmaschine bremst nach der Reaktionszeit tR mit aZ
  function abrissFahrt(o) {
    const P = Object.assign({ v0: 15, tV: 0.4, a: 4.5, tR: 1.2, aZ: 3.0, dt: 0.02, dauer: 12 }, o || {}), n = Math.round(P.dauer / P.dt) + 1, z = [];
    let xA = 0, vA = P.v0, xZ = 0, vZ = P.v0;
    for (let i = 0; i < n; i++) {
      const t = i * P.dt; z.push({ t: t, xA: xA, vA: vA, bremstA: t >= P.tV && vA > 0, xZ: xZ, vZ: vZ, bremstZ: t >= P.tR && vZ > 0 });
      if (t >= P.tV) vA = Math.max(0, vA - P.a * P.dt); if (t >= P.tR) vZ = Math.max(0, vZ - P.aZ * P.dt);
      xA += vA * P.dt; xZ += vZ * P.dt;
    }
    return { zustaende: z, P: P };
  }

  const api = { lenkdauerBei: lenkdauerBei, pruefeTag: pruefeTag, pruefeWochen: pruefeWochen, folgefahrt: folgefahrt, FAHRZEUGE: FAHRZEUGE, bahn: bahn, simuliere: simuliere, koerper: koerper, rechteck: rechteck, maxUeberschnitt: maxUeberschnitt, gesamtLaenge: gesamtLaenge, radien: radien, vorderachsRadius: vorderachsRadius, innenRadius: innenRadius, abstandLinks: abstandLinks, folge: folge, SICHT: SICHT, sichtfeld: sichtfeld, insFahrzeug: insFahrzeug, polyAbstand: polyAbstand, verdecktVorn: verdecktVorn, radfahrerAbbiegen: radfahrerAbbiegen, ABBIEGEN: ABBIEGEN, sichtPolygone: sichtPolygone, zweikreis: zweikreis, anhaengerBremse: anhaengerBremse, federspeicher: federspeicher, kuppelnZustand: kuppelnZustand, DRUCK: DRUCK, FEDER: FEDER, SATTEL: SATTEL, sattelUnterfahren: sattelUnterfahren, sattelTreffer: sattelTreffer, rollen: rollen, abreissen: abreissen, abrissFahrt: abrissFahrt };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.LKW_MODELL = api;
})(typeof window !== "undefined" ? window : globalThis);

})(W);

// ---- kern/baukasten.js ----
(function (window) {
/* Baukasten „Lkw und Zug“: Bühne (Asphalt, Raster), Fahrzeuge in Draufsicht, Spuren, Gefahrenbereich, Maßlinien.
   Alles deterministisch: die Zeichnung ist eine reine Funktion von Rechenzustand (modell.js) und Zeit. Kein Zufall, keine Uhr.
   Bühne 1080 x 1080 (Pixel). Maßstab S Pixel je Meter (Standard 25). Rechtsverkehr, Fahrerseite links. */
(function (window) {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const DEG = 180 / Math.PI;
  const FARBE = {
    asphalt: "#434B45", raster: "rgba(250,246,236,.075)", rasterFein: "rgba(250,246,236,.035)",
    creme: "#FAF6EC", gold: "#EDAE4F", goldDunkel: "#8F5A14", gruen: "#2F4A34",
    vorn: "#EDAE4F", hinten: "#8FD6A6", anhaenger: "#79C6EE", auflieger: "#C9A9F2",
    kabine: "#5E7C8F", kabineD: "#3E566A", kasten: "#F3EDE0", kastenD: "#B9AE93", glas: "#1F2A30", reifen: "#1B1D1A",
    blinkAn: "#FFA81F", blinkAus: "#8A5A18", ruecklicht: "#8E2B1E", scheinwerfer: "#FFF3C4"
  };

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const f = (v) => (Math.round(v * 100) / 100);

  /* ---------- Welt: Abbildung Meter -> Pixel, Ebenen ---------- */
  function welt(stage, o) {
    o = o || {};
    const S = o.S || 25, ox = o.ox || 0, oy = o.oy || 0;
    const W = { S: S, ox: ox, oy: oy };
    W.px = (x, y) => [ox + x * S, oy + y * S];
    stage.style.background = FARBE.asphalt;
    const canvas = document.createElement("canvas");   // überstrichene Fläche (wächst mit der Fahrt)
    canvas.width = 1080; canvas.height = 1080; canvas.className = "fuss";
    canvas.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1080px;opacity:" + (o.fussOpazitaet != null ? o.fussOpazitaet : 0.34);
    const raster = el("svg", { class: "raster", viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    raster.style.cssText = "position:absolute;left:0;top:0";
    const svg = el("svg", { class: "welt", viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(raster); stage.appendChild(canvas); stage.appendChild(svg);

    // Raster alle 5 m (fein alle 1 m nur bei Bedarf), Maßstabsbalken
    if (o.raster !== false) {
      const g = el("g", null, raster);
      const x0 = ox - Math.ceil(ox / (5 * S)) * 5 * S, y0 = oy - Math.ceil(oy / (5 * S)) * 5 * S;
      for (let x = x0; x <= 1080; x += 5 * S) el("line", { x1: f(x), y1: 0, x2: f(x), y2: 1080, stroke: FARBE.raster, "stroke-width": 1.5 }, g);
      for (let y = y0; y <= 1080; y += 5 * S) el("line", { x1: 0, y1: f(y), x2: 1080, y2: f(y), stroke: FARBE.raster, "stroke-width": 1.5 }, g);
    }
    // Maßstabsbalken 5 m (links unten): zeigt, dass Fahrzeuge und Kurven maßstäblich gezeichnet sind
    if (o.massstab !== false) {
      const g = el("g", { transform: "translate(56 1018)" }, raster), L = 5 * S;
      el("rect", { x: -2, y: -14, width: L + 4 + 74, height: 40, rx: 10, fill: "rgba(5,8,10,.45)" }, g);
      el("line", { x1: 8, y1: 8, x2: 8 + L, y2: 8, stroke: FARBE.creme, "stroke-width": 4, "stroke-linecap": "round" }, g);
      el("line", { x1: 8, y1: 0, x2: 8, y2: 16, stroke: FARBE.creme, "stroke-width": 3 }, g); el("line", { x1: 8 + L, y1: 0, x2: 8 + L, y2: 16, stroke: FARBE.creme, "stroke-width": 3 }, g);
      const t = el("text", { x: 8 + L + 14, y: 15, "font-size": 30, "font-weight": 600, "font-family": "Barlow, sans-serif", fill: FARBE.creme }, g); t.textContent = "5 m";
    }
    const defs = el("defs", null, svg);
    // Schraffur „Gefahrenbereich“ (Gold, 45°)
    const pat = el("pattern", { id: "schraf" + (o.id || ""), width: 14, height: 14, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    el("rect", { width: 14, height: 14, fill: "rgba(237,174,79,.20)" }, pat);
    el("rect", { width: 6, height: 14, fill: "rgba(237,174,79,.78)" }, pat);
    W.schrafId = "schraf" + (o.id || "");
    W.haloId = "blinkhalo" + (o.id || "");
    const rg = el("radialGradient", { id: W.haloId }, defs);
    el("stop", { offset: "0%", "stop-color": "#FFB020", "stop-opacity": 0.85 }, rg); el("stop", { offset: "100%", "stop-color": "#FFB020", "stop-opacity": 0 }, rg);
    const glow = el("filter", { id: "glow" + (o.id || ""), x: "-80%", y: "-80%", width: "260%", height: "260%" }, defs);
    el("feGaussianBlur", { stdDeviation: 0.12, result: "b" }, glow);   // in Metern, wird mit der Gruppe skaliert
    const merge = el("feMerge", null, glow); el("feMergeNode", { in: "b" }, merge); el("feMergeNode", { in: "SourceGraphic" }, merge);
    W.glowId = "glow" + (o.id || "");
    W.gBand = el("g", null, svg); W.gFz = el("g", null, svg); W.gSpur = el("g", null, svg); W.gUeber = el("g", null, svg);
    W.svg = svg; W.canvas = canvas; W.ctx = canvas.getContext("2d");
    // Muster für die Fläche auf der Leinwand
    const pc = document.createElement("canvas"); pc.width = 14; pc.height = 14; const pctx = pc.getContext("2d");
    pctx.fillStyle = "rgba(237,174,79,.30)"; pctx.fillRect(0, 0, 14, 14);
    pctx.fillStyle = "#EDAE4F"; pctx.beginPath(); pctx.moveTo(0, 14); pctx.lineTo(7, 14); pctx.lineTo(14, 7); pctx.lineTo(14, 0); pctx.lineTo(7, 0); pctx.lineTo(0, 7); pctx.closePath(); pctx.fill();
    W.muster = W.ctx.createPattern(pc, "repeat");
    return W;
  }

  /* ---------- Fahrzeug (Draufsicht, Meter-Koordinaten in der Gruppe, Ursprung = Achse) ---------- */
  function rect(g, x, y, w, h, fill, stroke, rx, sw) {
    return el("rect", { x: f(x), y: f(y), width: f(w), height: f(h), rx: rx || 0, fill: fill, stroke: stroke || "none", "stroke-width": sw || 0.07 }, g);
  }
  function rad(g, cx, cy, laenge, breite) {   // Reifen von oben
    const r = el("g", null, g); rect(r, cx - laenge / 2, cy - breite / 2, laenge, breite, FARBE.reifen, "#000", 0.12, 0.03); return r;
  }
  function radPaar(g, x, b2, aussen, innen) {   // beidseitig, außen + (optional) Zwillingsreifen innen
    rad(g, x, b2 - 0.2, 1.0, 0.32); rad(g, x, -(b2 - 0.2), 1.0, 0.32);
    if (innen) { rad(g, x, b2 - 0.58, 1.0, 0.32); rad(g, x, -(b2 - 0.58), 1.0, 0.32); }
  }
  function kabine(g, fz, xv) {   // Kabine von oben, vorn bei xv
    const b2 = fz.breite / 2, kl = 2.3, x0 = xv - kl;
    rect(g, x0, -b2, kl, fz.breite, FARBE.kabine, FARBE.kabineD, 0.35, 0.09);
    rect(g, x0 + 0.5, -b2 + 0.26, kl - 1.0, fz.breite - 0.52, "#6F8FA3", FARBE.kabineD, 0.22, 0.05);    // Dach
    rect(g, xv - 0.62, -b2 + 0.16, 0.42, fz.breite - 0.32, FARBE.glas, "none", 0.14);                   // Frontscheibe
    rect(g, x0 + 0.1, -b2 + 0.05, 0.36, 0.12, FARBE.glas, "none", 0.05); rect(g, x0 + 0.1, b2 - 0.17, 0.36, 0.12, FARBE.glas, "none", 0.05);
    // Spiegel links (Fahrerseite) und rechts
    rect(g, xv - 1.35, b2, 0.34, 0.2, "#23262A", "none", 0.05); rect(g, xv - 1.35, -b2 - 0.2, 0.34, 0.2, "#23262A", "none", 0.05);
    rect(g, xv - 1.35, b2 + 0.1, 0.1, 0.3, "#23262A", "none", 0.03); rect(g, xv - 1.35, -b2 - 0.4, 0.1, 0.3, "#23262A", "none", 0.03);
    // Scheinwerfer
    rect(g, xv - 0.1, b2 - 0.5, 0.1, 0.34, FARBE.scheinwerfer, "none", 0.04); rect(g, xv - 0.1, -b2 + 0.16, 0.1, 0.34, FARBE.scheinwerfer, "none", 0.04);
  }
  function rippen(g, x0, x1, b2) {   // Dachrippen des Kastens
    for (let x = x0 + 0.8; x < x1 - 0.3; x += 1.15) el("line", { x1: f(x), y1: f(-b2 + 0.12), x2: f(x), y2: f(b2 - 0.12), stroke: "rgba(120,108,80,.30)", "stroke-width": 0.04 }, g);
  }
  function halo(g, x, y, w, h, halos, hid) {   // Leuchtfleck um einen Blinker (nur sichtbar, solange er an ist)
    const c = el("circle", { cx: f(x + w / 2), cy: f(y + h / 2), r: 0.55, fill: "url(#" + hid + ")", opacity: 0 }, g); halos.push(c); return c;
  }
  function bremslicht(g, xh, b2, liste) {   // leuchtet nur beim Bremsen (Bremslicht = hell rot, das normale Rücklicht bleibt dunkel)
    [b2 - 0.55, -b2 + 0.23].forEach((y) => { liste.push(rect(g, xh - 0.04, y, 0.14, 0.32, "#FF3B2B", "none", 0.03)); liste[liste.length - 1].setAttribute("opacity", 0); });
  }
  function ruecklichter(g, xh, b2, blinker, halos, hid, blinkerL, halosL) {
    rect(g, xh, b2 - 0.55, 0.1, 0.32, FARBE.ruecklicht, "none", 0.03); rect(g, xh, -b2 + 0.23, 0.1, 0.32, FARBE.ruecklicht, "none", 0.03);
    // Blinker rechts hinten (Fahrtrichtung rechts = +y), links stets aus
    blinker.push(rect(g, xh, b2 - 0.25, 0.12, 0.22, FARBE.blinkAus, "none", 0.03)); halo(g, xh - 0.1, b2 - 0.25, 0.12, 0.22, halos, hid);
    blinkerL.push(rect(g, xh, -b2 + 0.03, 0.12, 0.22, FARBE.blinkAus, "none", 0.03)); halo(g, xh - 0.1, -b2 + 0.03, 0.12, 0.22, halosL, hid);
  }

  function fahrzeug(layer, fz, W, o) {
    o = o || {};
    const S = W.S, b2 = fz.breite / 2, blinker = [], halos = [], bremsen = [], blinkerL = [], halosL = [], rv = {};
    const gAnh = fz.anh ? el("g", { class: "anhaenger" }, layer) : null;   // Anhänger zuerst (liegt unter dem Zugfahrzeug)
    const gZug = el("g", { class: "zug" }, layer);
    const schatten = "drop-shadow(0 " + (6 / S).toFixed(3) + "px " + (6 / S).toFixed(3) + "px rgba(0,0,0,.40))";   // Einheit = Meter (Gruppe ist skaliert)
    gZug.style.filter = schatten; if (gAnh) gAnh.style.filter = schatten;
    const xv = fz.L + fz.vorn;

    // Zugfahrzeug
    if (fz.anh && fz.anh.typ === "sattel") {
      rect(gZug, -fz.hinten, -0.55, xv - 2.4 + fz.hinten, 1.1, "#5A5F66", "#33373C", 0.12, 0.06);              // Rahmen
      rect(gZug, 1.0, -b2 + 0.05, 1.7, 0.55, "#AEB4BB", "#6D7379", 0.14, 0.05); rect(gZug, 1.0, b2 - 0.6, 1.7, 0.55, "#AEB4BB", "#6D7379", 0.14, 0.05);   // Tanks
      el("circle", { cx: f(fz.e), cy: 0, r: 0.62, fill: "#7A8088", stroke: "#33373C", "stroke-width": 0.06 }, gZug);                                     // Sattelplatte
      rect(gZug, fz.e - 0.62, -0.06, 0.62, 0.12, "#33373C", "none", 0.03);
      radPaar(gZug, 0, b2, true, true); radPaar(gZug, -1.35 + 0, b2, true, true);
    } else {
      const kl = xv - 2.45;
      rect(gZug, -fz.hinten, -b2, kl + fz.hinten, fz.breite, FARBE.kasten, FARBE.kastenD, 0.14, 0.08);          // Kastenaufbau
      rippen(gZug, -fz.hinten, kl, b2);
      radPaar(gZug, 0, b2, true, true);
      if (fz.anh) {                                                                                             // Anhängerkupplung am Heck
        rect(gZug, -fz.hinten + 0.1, -0.12, fz.hinten + fz.e - 0.1 < 0 ? -fz.e - fz.hinten + 0.1 : 0.1, 0.24, "#33373C", "none", 0.03);
        el("circle", { cx: f(fz.e), cy: 0, r: 0.2, fill: "#33373C" }, gZug);
      }
    }
    kabine(gZug, fz, xv);
    rv.vr = rad(gZug, fz.L, b2 - 0.2, 1.0, 0.32); rv.vl = rad(gZug, fz.L, -(b2 - 0.2), 1.0, 0.32);              // lenkbare Vorderräder
    rv.vr.setAttribute("class", "vr"); rv.vl.setAttribute("class", "vl");
    // Blinker rechts vorn; Rücklicht hinten (nur Zug ohne Anhänger / Sattelzugmaschine zeigt kein Heck)
    blinker.push(rect(gZug, xv - 0.2, b2 - 0.26, 0.2, 0.24, FARBE.blinkAus, "none", 0.04)); halo(gZug, xv, b2 - 0.26, 0.2, 0.24, halos, W.haloId);
    blinkerL.push(rect(gZug, xv - 0.2, -b2 + 0.02, 0.2, 0.24, FARBE.blinkAus, "none", 0.04)); halo(gZug, xv, -b2 + 0.02, 0.2, 0.24, halosL, W.haloId);
    if (!fz.anh) { ruecklichter(gZug, -fz.hinten, b2, blinker, halos, W.haloId, blinkerL, halosL); bremslicht(gZug, -fz.hinten, b2, bremsen); }

    // Anhänger / Auflieger
    if (gAnh) {
      const a = fz.anh, x0 = -a.hinten, x1 = a.vorn;
      if (a.typ === "zentral") {
        rect(gAnh, x1, -0.2, fz.D - x1, 0.4, "#C4C9CF", "#1E2022", 0.08, 0.06);                                  // Deichsel
        el("circle", { cx: f(fz.D), cy: 0, r: 0.32, fill: "none", stroke: "#C4C9CF", "stroke-width": 0.13 }, gAnh);   // Zugöse
      }
      rect(gAnh, x0, -b2, x1 - x0, fz.breite, FARBE.kasten, FARBE.kastenD, 0.14, 0.08);
      rippen(gAnh, x0, x1, b2);
      if (a.typ === "sattel") {
        el("circle", { cx: f(fz.D), cy: 0, r: 0.18, fill: "#33373C" }, gAnh);                                      // Königszapfen
        radPaar(gAnh, -1.3, b2, true, true); radPaar(gAnh, 0, b2, true, true); radPaar(gAnh, 1.3, b2, true, true);
      } else { radPaar(gAnh, -0.65, b2, true, true); radPaar(gAnh, 0.65, b2, true, true); }
      ruecklichter(gAnh, x0, b2, blinker, halos, W.haloId, blinkerL, halosL); bremslicht(gAnh, x0, b2, bremsen);
    }

    const obj = {
      /* z: Rechenzustand (modell.simuliere), blink: 0 oder 1 */
      setze: function (z, blink, bremst, blinkL) {
        const A = W.px(z.A.x, z.A.y);
        gZug.setAttribute("transform", "translate(" + f(A[0]) + " " + f(A[1]) + ") rotate(" + f(z.hz * DEG) + ") scale(" + S + ")");
        // Vorderräder zeigen in Bewegungsrichtung der Vorderachse: Winkel gegen die Fahrzeuglängsachse
        let d = z.F.h - z.hz; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
        const tf = "rotate(" + f(d * DEG) + " " + fz.L + " ";
        rv.vr.setAttribute("transform", tf + f(b2 - 0.2) + ")"); rv.vl.setAttribute("transform", tf + f(-(b2 - 0.2)) + ")");
        if (gAnh) {
          const T = W.px(z.T.x, z.T.y);
          gAnh.setAttribute("transform", "translate(" + f(T[0]) + " " + f(T[1]) + ") rotate(" + f(z.ha * DEG) + ") scale(" + S + ")");
        }
        const farbe = blink ? FARBE.blinkAn : FARBE.blinkAus;
        blinker.forEach((b) => b.setAttribute("fill", farbe));
        halos.forEach((h) => h.setAttribute("opacity", blink ? 0.9 : 0));
        bremsen.forEach((r) => r.setAttribute("opacity", bremst ? 1 : 0));
        blinkerL.forEach((l) => l.setAttribute("fill", blinkL ? FARBE.blinkAn : FARBE.blinkAus));
        halosL.forEach((h) => h.setAttribute("opacity", blinkL ? 0.9 : 0));
      },
      zeige: function (an) { const v = an ? "visible" : "hidden"; gZug.style.visibility = v; if (gAnh) gAnh.style.visibility = v; },
      groups: { zug: gZug, anh: gAnh }
    };
    return obj;
  }

  /* ---------- Überstrichene Fläche (Leinwand, wächst mit der Fahrt) ---------- */
  function fussflaeche(W, sim, o) {
    o = o || {};
    const ctx = W.ctx; let bis = -1; const schritt = o.schritt || 3;   // alle 3 Rechenschritte = 6 cm
    const fz = sim.fz;
    function malen(i) {
      const z = sim.zustaende[i], ks = M().koerper(fz, z);
      ctx.beginPath();
      ks.forEach((k) => { k.poly.forEach((p, j) => { const q = W.px(p.x, p.y); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.closePath(); });
      ctx.fill();
    }
    return {
      bis: function (idx) {
        idx = Math.max(0, Math.min(sim.zustaende.length - 1, idx));
        if (idx < bis) { ctx.clearRect(0, 0, 1080, 1080); bis = -1; }
        ctx.fillStyle = o.muster ? W.muster : (o.farbe || "#FAF6EC");
        for (let i = bis < 0 ? 0 : bis + schritt; i <= idx; i += schritt) { malen(i); bis = i; }
        if (idx > bis && idx === sim.zustaende.length - 1) { malen(idx); bis = idx; }
      },
      leeren: function () { ctx.clearRect(0, 0, 1080, 1080); bis = -1; }
    };
  }
  const M = () => window.LKW_MODELL;

  /* ---------- Spuren und Band ---------- */
  function spur(W, sim, wahl, farbe, o) {   // wahl: Funktion z -> Punkt (Meter)
    o = o || {};
    const g = el("g", null, W.gSpur);
    const lin = el("polyline", { fill: "none", stroke: farbe, "stroke-width": o.breite || 4.5, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    if (o.gestrichelt) lin.setAttribute("stroke-dasharray", "10 8");
    const kopf = el("circle", { r: o.kopf || 8, fill: farbe, stroke: "#101410", "stroke-width": 2.5 }, g);
    const sch = o.schritt || 5;
    const pts = [];
    for (let i = 0; i < sim.zustaende.length; i += sch) { const p = wahl(sim.zustaende[i]), q = W.px(p.x, p.y); pts.push(f(q[0]) + "," + f(q[1])); }
    const lastIdx = Math.floor((sim.zustaende.length - 1) / sch);
    return {
      g: g, punkte: pts, schritt: sch,
      bis: function (idx) {
        const n = Math.max(1, Math.min(lastIdx, Math.floor(idx / sch)) + 1);
        lin.setAttribute("points", pts.slice(0, n).join(" "));
        const p = wahl(sim.zustaende[Math.max(0, Math.min(sim.zustaende.length - 1, idx))]), q = W.px(p.x, p.y);
        kopf.setAttribute("cx", f(q[0])); kopf.setAttribute("cy", f(q[1]));
      },
      zeige: function (a) { g.style.opacity = a; }
    };
  }
  function band(W, simA, wahlA, simB, wahlB, o) {   // Fläche zwischen zwei Spuren, bis Rechenstand idx
    const pol = el("polygon", { fill: "url(#" + W.schrafId + ")", stroke: "rgba(237,174,79,.85)", "stroke-width": 1.5 }, W.gBand);
    const sch = (o && o.schritt) || 10;
    const a = [], b = [];
    for (let i = 0; i < simA.zustaende.length; i += sch) { const p = wahlA(simA.zustaende[i]), q = W.px(p.x, p.y); a.push(f(q[0]) + "," + f(q[1])); }
    for (let i = 0; i < simB.zustaende.length; i += sch) { const p = wahlB(simB.zustaende[i]), q = W.px(p.x, p.y); b.push(f(q[0]) + "," + f(q[1])); }
    return {
      el: pol,
      bis: function (idx) {
        const n = Math.max(1, Math.min(a.length, Math.floor(idx / sch) + 1));
        pol.setAttribute("points", a.slice(0, n).join(" ") + " " + b.slice(0, n).reverse().join(" "));
      },
      zeige: function (a2) { pol.style.opacity = a2; }
    };
  }

  /* ---------- Beschriftung (HTML-Pillen auf der Bühne, über die Sprachen austauschbar) ---------- */
  function pille(stage, text, x, y, o) {
    o = o || {};
    const d = document.createElement("div");
    d.className = "pill lkw-pill" + (o.klasse ? " " + o.klasse : "");
    d.textContent = text;
    // ax "0": linker Rand bei x · "-100%": rechter Rand bei x (per right:, damit die Breite nicht zusammengedrückt wird) · sonst mittig
    const h = o.ax === "-100%" ? "right:" + (1080 - x) + "px" : "left:" + x + "px";
    const tr = o.ax === "-100%" ? "translate(0," + (o.ay != null ? o.ay : "-50%") + ")" : "translate(" + (o.ax != null ? o.ax : "-50%") + "," + (o.ay != null ? o.ay : "-50%") + ")";
    d.style.cssText = "position:absolute;width:max-content;max-width:" + ((o.klasse || "").indexOf("gross") >= 0 ? 900 : 520) + "px;" + h + ";top:" + y + "px;transform:" + tr + ";opacity:0" + (o.farbe ? ";border-color:" + o.farbe : "");
    if (o.punkt) { const p = document.createElement("i"); p.style.cssText = "display:inline-block;width:22px;height:22px;border-radius:50%;margin-inline-end:12px;vertical-align:-1px;background:" + o.punkt; d.insertBefore(p, d.firstChild); }
    stage.appendChild(d);
    return d;
  }
  // Hinweislinie von der Pille zum Punkt
  function leitlinie(W, x1, y1, x2, y2, farbe) {
    const g = el("g", { opacity: 0 }, W.gUeber);
    el("line", { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke: farbe || FARBE.creme, "stroke-width": 2.5, "stroke-dasharray": "2 7", "stroke-linecap": "round" }, g);
    el("circle", { cx: f(x2), cy: f(y2), r: 5, fill: farbe || FARBE.creme }, g);
    return g;
  }
  // Maßpfeil mit Endstrichen
  function mass(W, x1, y1, x2, y2, farbe, w) {
    const g = el("g", { opacity: 0 }, W.gUeber), c = farbe || FARBE.creme, sw = w || 3;
    el("line", { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke: c, "stroke-width": sw }, g);
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * 11, ny = Math.cos(a) * 11;
    [[x1, y1], [x2, y2]].forEach((p) => el("line", { x1: f(p[0] - nx), y1: f(p[1] - ny), x2: f(p[0] + nx), y2: f(p[1] + ny), stroke: c, "stroke-width": sw }, g));
    return g;
  }


  /* ---------- Pkw von oben (Ursprung Mitte, x vorn) ---------- */
  function pkwOben(layer, W, farbe) {
    const g = el("g", null, layer), S = W.S;
    g.style.filter = "drop-shadow(0 " + (5 / S).toFixed(3) + "px " + (5 / S).toFixed(3) + "px rgba(0,0,0,.4))";
    const c = farbe || "#D9954C", d = "#8F5A14";
    [[-1.35, 0.95], [-1.35, -0.95], [1.4, 0.95], [1.4, -0.95]].forEach((p) => rect(g, p[0] - 0.33, p[1] - 0.12, 0.66, 0.26, FARBE.reifen, "none", 0.08));
    rect(g, -2.2, -0.9, 4.4, 1.8, c, d, 0.45, 0.07);
    rect(g, -0.6, -0.72, 1.7, 1.44, "#E8B77F", d, 0.3, 0.05);
    rect(g, 0.55, -0.7, 0.45, 1.4, FARBE.glas, "none", 0.15); rect(g, -1.05, -0.66, 0.35, 1.32, FARBE.glas, "none", 0.12);
    rect(g, 2.1, 0.45, 0.1, 0.3, FARBE.scheinwerfer, "none", 0.04); rect(g, 2.1, -0.75, 0.1, 0.3, FARBE.scheinwerfer, "none", 0.04);
    rect(g, -2.2, 0.45, 0.1, 0.3, FARBE.ruecklicht, "none", 0.04); rect(g, -2.2, -0.75, 0.1, 0.3, FARBE.ruecklicht, "none", 0.04);
    const bl = rect(g, 2.0, 0.78, 0.2, 0.14, FARBE.blinkAus, "none", 0.04), bll = rect(g, 2.0, -0.92, 0.2, 0.14, FARBE.blinkAus, "none", 0.04);
    return { g: g, laenge: 4.4, setze: function (x, y, h, blinkR, blinkL) {
      const p = W.px(x, y); g.setAttribute("transform", "translate(" + f(p[0]) + " " + f(p[1]) + ") rotate(" + f(h * DEG) + ") scale(" + S + ")");
      bl.setAttribute("fill", blinkR ? FARBE.blinkAn : FARBE.blinkAus); bll.setAttribute("fill", blinkL ? FARBE.blinkAn : FARBE.blinkAus);
    } };
  }
  window.LKW_BK = { pkwOben: pkwOben, FARBE: FARBE, el: el, welt: welt, fahrzeug: fahrzeug, fussflaeche: fussflaeche, spur: spur, band: band, pille: pille, leitlinie: leitlinie, mass: mass, f: f, DEG: DEG };
})(window);

})(W);

// ---- kern/panel.js ----
(function (window) {
/* Text-Feld (Panel) und Einblendungen – gleicher Aufbau wie beim Film „Vorfahrt“, nur als gemeinsamer Baustein für alle Lkw-Filme.
   Nutzung: const P = LKW_PANEL.neu({ tl, T, tx, logo }); P.szene(sc, kapitelNr) ... */
(function (window) {
  "use strict";
  function neu(o) {
    const tl = o.tl, T = o.T, tx = o.tx;
    const el = (tag, cls, text) => { const d = document.createElement(tag); if (cls) d.className = cls; if (text != null) d.textContent = text; return d; };
    const fade = (target, t, d, from) => tl.fromTo(target, from || { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: d || 0.6, ease: "power2.out" }, t);
    const starts = []; let acc = 0;
    T.kapitel.forEach((k) => { starts.push(acc); acc += k.dauer; });

    function buehne(sc) {
      const wrap = el("div", "stagewrap"), st = el("div", "stage");
      wrap.appendChild(st); sc.appendChild(wrap); return st;
    }
    function panel(sc, ch, i) {
      const p = el("div", "panel");
      const dots = el("div", "dots"); T.kapitel.forEach((_, j) => dots.appendChild(el("i", j === i ? "on" : "")));
      const titel = tx(ch.titel);
      p.appendChild(dots);
      p.appendChild(el("div", "kicker", (i > 0 && i < T.kapitel.length - 1 ? i + " · " : "") + tx(ch.kicker)));
      p.appendChild(el("h1", "ttl" + (titel.length > 16 ? " lang" : ""), titel));
      if (ch.sub) p.appendChild(el("div", "sub", tx(ch.sub.k)));
      p.appendChild(el("div", "pts"));
      if (o.logo) { const f = el("div", "foot"); const im = el("img"); im.src = o.logo; im.alt = ""; f.appendChild(im); f.appendChild(el("span", "", "Fahr-Akademie · " + (o.fussName || "Lkw und Zug verstehen"))); p.appendChild(f); }
      sc.appendChild(p); return p;
    }
    // Immer nur EIN Satz sichtbar: der nächste ersetzt den vorigen
    function stapel(p, items, T0, endT) {
      const wrap = p.querySelector(".pts");
      items.forEach((it, i) => {
        wrap.appendChild(it.el);
        fade(it.el, T0 + it.t);
        const nxt = items[i + 1];
        const out = nxt ? T0 + nxt.t - 0.4 : (endT != null ? T0 + endT : null);
        if (out != null) tl.to(it.el, { opacity: 0, duration: 0.35 }, out);
      });
    }
    function ptEl(pt) {
      const d = el("div", "pt" + (pt.stil === "gold" ? " gold" : ""));
      d.appendChild(el("div", "tx", tx(pt.k)));
      if (pt.ref) d.appendChild(el("div", "rf", pt.ref));
      return d;
    }
    const merkEl = (m) => el("div", "merk", tx(m.k));
    function standardPanel(sc, ch, i, T0, mitMerk) {
      const p = panel(sc, ch, i);
      const items = (ch.punkte || []).map((pt) => ({ t: pt.t, el: ptEl(pt) }));
      if (mitMerk && ch.merk) items.push({ t: ch.merk.t, el: merkEl(ch.merk) });
      stapel(p, items, T0);
      // Titel und Untertitel
      tl.fromTo(p.querySelector(".ttl"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, T0 + 0.3);
      if (ch.sub) fade(p.querySelector(".sub"), T0 + ch.sub.t, 0.7, { opacity: 0, y: 20 });
      return p;
    }
    function sceneFade(sc, T0, dur) {
      // autoAlpha: unsichtbare Kapitel werden gar nicht gezeichnet (spart auf dem Handy Rechenzeit)
      tl.fromTo(sc, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, T0);
      tl.to(sc, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, T0 + dur - 0.4);
    }
    // Einblenden eines Elements zum Zeitpunkt t (nur Deckkraft: Pillen sind per CSS zentriert)
    const zeige = (e, t, d) => tl.fromTo(e, { opacity: 0 }, { opacity: 1, duration: d || 0.5, ease: "power1.out" }, t);
    return { el: el, fade: fade, starts: starts, gesamt: acc, buehne: buehne, panel: panel, stapel: stapel, ptEl: ptEl, merkEl: merkEl, standardPanel: standardPanel, sceneFade: sceneFade, zeige: zeige };
  }
  window.LKW_PANEL = { neu: neu };
})(window);

})(W);

// ---- kern/seite.js ----
(function (window) {
/* Seitenansicht (Filme mit Abstand, Bremsen): Straße, Lkw und Pkw von der Seite, Maßklammer, mitlaufende Kamera.
   Fahrtrichtung nach RECHTS (Rechtsverkehr, wir sehen die Fahrerseite nicht: Seitenansicht von der Beifahrerseite des nach rechts fahrenden Fahrzeugs ist die rechte Seite; Details bleiben neutral).
   Alle Zeichnungen in Metern, Gruppe skaliert mit S Pixel je Meter. Kamera: camX = Weltposition, die auf px0 steht. */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f;

  function szene(stage, o) {
    o = o || {};
    const S = o.S || 12, px0 = o.px0 || 200, boden = o.boden || 760;
    const W = { S: S, boden: boden, px0: px0, cam: 0 };
    W.px = (x) => px0 + (x - W.cam) * S;
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#3A463F 55%,#434B45 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    // Hügel (Parallaxe) und Straße
    const huegel = el("path", { fill: "#2F3B35" }, svg);
    el("rect", { x: 0, y: boden, width: 1080, height: 1080 - boden, fill: "#4A524C" }, svg);
    el("rect", { x: 0, y: boden, width: 1080, height: 8, fill: "#7A837C" }, svg);
    el("rect", { x: 0, y: boden + 8, width: 1080, height: 60, fill: "#3F4742" }, svg);      // Fahrbahnrand (Seitenstreifen)
    const marken = el("g", null, svg), ticks = el("g", null, svg);
    W.gFz = el("g", null, svg); W.gUeber = el("g", null, svg);
    // Streckenmarken alle 10 m (Maßstab): Striche auf dem Boden; alle 50 m kräftiger
    const strich = [];
    for (let i = -10; i < 120; i++) { const l = el("line", { y1: boden + 20, y2: boden + 46, stroke: "rgba(250,246,236,.32)", "stroke-width": 3 }, ticks); strich.push([l, i * 10]); }
    const mittel = []; for (const dy of [130, 215]) for (let i = -10; i < 130; i++) { const r = el("rect", { y: boden + dy, width: 3 * S, height: 6, fill: "rgba(250,246,236,.55)" }, marken); mittel.push([r, i * 8]); }
    W.kamera = function (x) {
      W.cam = x;
      strich.forEach((s) => { const p = W.px(s[1]); s[0].setAttribute("x1", f(p)); s[0].setAttribute("x2", f(p)); });
      mittel.forEach((s) => s[0].setAttribute("x", f(W.px(s[1]))));
      const sh = -((x * S * 0.12) % 360); let d = "M" + (sh - 360) + " " + boden;
      for (let k = -1; k < 5; k++) { const b = sh + k * 360; d += " Q" + (b + 90) + " " + (boden - 130) + " " + (b + 180) + " " + (boden - 40) + " T" + (b + 360) + " " + boden; }
      huegel.setAttribute("d", d + " L1500 " + boden + " L-400 " + boden + " Z");
    };
    W.kamera(0);
    return W;
  }

  function rad(g, cx, r) {
    const w = el("g", { transform: "translate(" + cx + " -" + r + ")" }, g);
    el("circle", { r: r, fill: F.reifen, stroke: "#000", "stroke-width": 0.04 }, w);
    const dreh = el("g", null, w);
    el("circle", { r: r * 0.55, fill: "#8D949C" }, dreh);
    el("line", { x1: -r * 0.5, y1: 0, x2: r * 0.5, y2: 0, stroke: "#4B5057", "stroke-width": 0.09 }, dreh);
    el("line", { x1: 0, y1: -r * 0.5, x2: 0, y2: r * 0.5, stroke: "#4B5057", "stroke-width": 0.09 }, dreh);
    return dreh;
  }

  // Lkw (Kastenwagen) von der Seite. Ursprung: Boden unter der Stoßstange vorn, Fahrzeug erstreckt sich nach links (−8,4 m).
  function lkw(W, laenge) {
    const L = laenge || 8.4, g = el("g", null, W.gFz), s = W.S;
    g.style.filter = "drop-shadow(0 " + (5 / s).toFixed(3) + "px " + (5 / s).toFixed(3) + "px rgba(0,0,0,.4))";
    const dreher = [];
    el("rect", { x: -L, y: -1.0, width: L, height: 0.38, fill: "#3A3E43" }, g);
    el("rect", { x: -L, y: -3.45, width: L - 2.4, height: 2.55, rx: 0.12, fill: F.kasten, stroke: F.kastenD, "stroke-width": 0.07 }, g);
    for (let x = -L + 0.9; x < -2.6; x += 1.2) el("line", { x1: x, y1: -3.35, x2: x, y2: -1.0, stroke: "rgba(120,108,80,.28)", "stroke-width": 0.04 }, g);
    el("path", { d: "M-2.3 -0.9 L-2.3 -3.1 L-1.0 -3.1 L0 -1.85 L0 -0.9 Z", fill: F.kabine, stroke: F.kabineD, "stroke-width": 0.07 }, g);
    el("path", { d: "M-2.0 -1.9 L-2.0 -2.85 L-1.1 -2.85 L-0.45 -1.9 Z", fill: F.glas }, g);
    el("rect", { x: -0.12, y: -1.5, width: 0.12, height: 0.3, fill: F.scheinwerfer }, g);
    const brems = el("rect", { x: -L - 0.02, y: -1.55, width: 0.12, height: 0.45, fill: "#FF3B2B", opacity: 0 }, g);
    el("rect", { x: -L - 0.02, y: -1.55, width: 0.12, height: 0.45, fill: F.ruecklicht, opacity: 0.9 }, g);
    g.appendChild(brems);
    [-0.9, -L + 1.2, -L + 2.5].forEach((cx) => dreher.push(rad(g, cx, 0.5)));
    return { g: g, laenge: L, setze: function (xFront, bremst, weg) {
      g.setAttribute("transform", "translate(" + f(W.px(xFront)) + " " + W.boden + ") scale(" + W.S + ")");
      brems.setAttribute("opacity", bremst ? 1 : 0);
      dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f((weg / 0.5) * 57.2958 % 360) + ")"));
    } };
  }
  // Pkw von der Seite. Ursprung: Boden unter dem Heck; Fahrzeug erstreckt sich nach rechts (4,4 m).
  function pkw(W) {
    const g = el("g", null, W.gFz), s = W.S, dreher = [];
    g.style.filter = "drop-shadow(0 " + (5 / s).toFixed(3) + "px " + (5 / s).toFixed(3) + "px rgba(0,0,0,.4))";
    el("path", { d: "M0 -0.55 L0 -1.0 Q0.05 -1.15 0.6 -1.2 L1.2 -1.25 L1.9 -1.85 Q2.2 -2.0 3.0 -2.0 L3.5 -1.4 L4.2 -1.25 Q4.4 -1.2 4.4 -0.95 L4.4 -0.55 Z", fill: "#D9954C", stroke: "#8F5A14", "stroke-width": 0.06 }, g);
    el("path", { d: "M2.0 -1.25 L2.35 -1.8 L2.95 -1.8 L3.35 -1.25 Z", fill: F.glas }, g);
    el("rect", { x: 4.3, y: -1.15, width: 0.1, height: 0.22, fill: F.scheinwerfer }, g);
    el("rect", { x: -0.02, y: -1.05, width: 0.12, height: 0.25, fill: F.ruecklicht, opacity: 0.9 }, g);
    const brems = el("rect", { x: -0.02, y: -1.05, width: 0.12, height: 0.25, fill: "#FF3B2B", opacity: 0 }, g);
    [0.95, 3.45].forEach((cx) => dreher.push(rad(g, cx, 0.34)));
    return { g: g, laenge: 4.4, setze: function (xHeck, bremst, weg) {
      g.setAttribute("transform", "translate(" + f(W.px(xHeck)) + " " + W.boden + ") scale(" + W.S + ")");
      brems.setAttribute("opacity", bremst ? 1 : 0);
      dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f((weg / 0.34) * 57.2958 % 360) + ")"));
    } };
  }

  // Reisebus von der Seite (Ursprung Boden unter der Front, erstreckt sich nach links 12 m)
  function bus(W) {
    const L = 12, g = el("g", null, W.gFz), s = W.S, dreher = [];
    g.style.filter = "drop-shadow(0 " + (5 / s).toFixed(3) + "px " + (5 / s).toFixed(3) + "px rgba(0,0,0,.4))";
    el("rect", { x: -L, y: -3.4, width: L, height: 2.75, rx: 0.4, fill: "#E7E1D0", stroke: F.kastenD, "stroke-width": 0.07 }, g);
    el("rect", { x: -L + 0.5, y: -3.0, width: L - 1.0, height: 1.0, rx: 0.15, fill: F.glas }, g);
    for (let x = -L + 2.2; x < -0.7; x += 2.2) el("line", { x1: x, y1: -3.0, x2: x, y2: -2.0, stroke: "#B9AE93", "stroke-width": 0.09 }, g);
    el("rect", { x: -L, y: -1.2, width: L, height: 0.2, fill: F.gold }, g);
    el("rect", { x: -0.12, y: -1.45, width: 0.12, height: 0.3, fill: F.scheinwerfer }, g);
    const brems = el("rect", { x: -L - 0.02, y: -1.6, width: 0.12, height: 0.4, fill: "#FF3B2B", opacity: 0 }, g);
    [-1.6, -L + 1.6, -L + 3.0].forEach((cx) => dreher.push(rad(g, cx, 0.5)));
    return { g: g, laenge: L, setze: function (xFront, bremst, weg) {
      g.setAttribute("transform", "translate(" + f(W.px(xFront)) + " " + W.boden + ") scale(" + W.S + ")");
      brems.setAttribute("opacity", bremst ? 1 : 0);
      dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f((weg / 0.5) * 57.2958 % 360) + ")"));
    } };
  }

  // Anhänger mit Deichsel (Zentralachs) von der Seite. Ursprung: Zugöse (vorn), Boden; Fahrzeug erstreckt sich nach links (Deichsel 1,6 m, Aufbau 7,5 m).
  function anhaenger(W) {
    const g = el("g", null, W.gFz), s = W.S, dreher = [], D = 1.6, L = 7.5;
    g.style.filter = "drop-shadow(0 " + (5 / s).toFixed(3) + "px " + (5 / s).toFixed(3) + "px rgba(0,0,0,.4))";
    el("rect", { x: -D, y: -1.05, width: D, height: 0.14, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 0.04 }, g);                   // Deichsel
    el("circle", { cx: 0, cy: -0.98, r: 0.2, fill: "none", stroke: "#C4C9CF", "stroke-width": 0.09 }, g);                                     // Zugöse
    el("rect", { x: -D - L, y: -1.0, width: L, height: 0.3, fill: "#3A3E43" }, g);
    el("rect", { x: -D - L, y: -3.45, width: L, height: 2.45, rx: 0.12, fill: F.kasten, stroke: F.kastenD, "stroke-width": 0.07 }, g);
    for (let x = -D - L + 0.9; x < -D - 0.4; x += 1.2) el("line", { x1: x, y1: -3.35, x2: x, y2: -1.1, stroke: "rgba(120,108,80,.28)", "stroke-width": 0.04 }, g);
    const glut = el("circle", { cx: -D - L, cy: -1.4, r: 0.55, fill: "rgba(255,59,43,.7)", opacity: 0 }, g);
    el("rect", { x: -D - L - 0.02, y: -1.55, width: 0.12, height: 0.45, fill: F.ruecklicht, opacity: 0.9 }, g);
    const brems = el("rect", { x: -D - L - 0.02, y: -1.55, width: 0.12, height: 0.45, fill: "#FF3B2B", opacity: 0 }, g);
    [-D - L + 2.2, -D - L + 3.5].forEach((cx) => dreher.push(rad(g, cx, 0.5)));
    return { g: g, laenge: D + L, setze: function (xTip, bremst, weg) {
      g.setAttribute("transform", "translate(" + f(W.px(xTip)) + " " + W.boden + ") scale(" + W.S + ")");
      brems.setAttribute("opacity", bremst ? 1 : 0); glut.setAttribute("opacity", bremst ? 0.45 : 0);
      dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f((weg / 0.5) * 57.2958 % 360) + ")"));
    } };
  }
  // Maßklammer zwischen zwei Weltpunkten über der Straße (Pille mit Text kommt von außen)
  function klammer(W, y, farbe) {
    const g = el("g", { opacity: 0 }, W.gUeber), c = farbe || F.gold;
    const l = el("line", { y1: y, y2: y, stroke: c, "stroke-width": 5 }, g), a = el("line", { y1: y - 16, y2: y + 16, stroke: c, "stroke-width": 5 }, g), b = el("line", { y1: y - 16, y2: y + 16, stroke: c, "stroke-width": 5 }, g);
    const flaeche = el("rect", { y: y, height: W.boden - y, fill: c, opacity: 0.13 }, g);
    return { g: g, farbe: function (c2) { [l, a, b].forEach((e) => e.setAttribute("stroke", c2)); flaeche.setAttribute("fill", c2); }, setze: function (x1, x2) {
      const p1 = W.px(x1), p2 = W.px(x2);
      l.setAttribute("x1", f(p1)); l.setAttribute("x2", f(p2)); a.setAttribute("x1", f(p1)); a.setAttribute("x2", f(p1)); b.setAttribute("x1", f(p2)); b.setAttribute("x2", f(p2));
      flaeche.setAttribute("x", f(Math.min(p1, p2))); flaeche.setAttribute("width", f(Math.abs(p2 - p1)));
      return [(p1 + p2) / 2, y];
    } };
  }
  window.LKW_SEITE = { anhaenger: anhaenger, szene: szene, bus: bus, lkw: lkw, pkw: pkw, klammer: klammer };
})(window);

})(W);

// ---- kern/zeit.js ----
(function (window) {
/* Zeitbilder (Film 8.1 Lenk- und Ruhezeiten): 24-Stunden-Leiste, Mess-Balken, Wochenkalender.
   Reine Zeichnung aus Zahlen; die Regeln selbst prüft kern/modell.js (pruefeTag, pruefeWochen, lenkdauerBei). Bühne 1080 x 1080. */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f;
  const ART = { fahren: F.gold, pause: "#79C6EE", ruhe: "#8190E8", arbeit: "#A6ADA6" };

  function buehne(stage) {
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#36423B 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    return { svg: svg, g: el("g", null, svg), ueber: el("g", null, svg) };
  }
  function text(parent, t, x, y, o) {
    o = o || {};
    const e = el("text", { x: x, y: y, "text-anchor": o.anker || "middle", "font-size": o.gr || 30, "font-weight": o.fett ? 700 : 600, "font-family": "Barlow, sans-serif", fill: o.farbe || F.creme }, parent);
    e.textContent = t; return e;
  }
  const hm = (min) => Math.floor(min / 60) + ":" + String(Math.round(min % 60)).padStart(2, "0");

  /* 24-Stunden-Leiste. ev: [{art,min}], hNow: Stunden seit Beginn; x0..x1 = 0..24 h */
  function leiste(B, o) {
    const span = o.span || 24, tick = o.tick || (span > 12 ? 3 : 1), x0 = o.x0 || 70, x1 = o.x1 || 1010, y = o.y, h = o.h || 96, st = (x1 - x0) / span;
    const g = el("g", null, B.g);
    el("rect", { x: x0 - 6, y: y - 6, width: x1 - x0 + 12, height: h + 12, rx: 18, fill: "rgba(250,246,236,.07)", stroke: "rgba(250,246,236,.25)", "stroke-width": 2 }, g);
    for (let k = 0; k <= span; k += tick) { el("line", { x1: x0 + k * st, y1: y + h + 14, x2: x0 + k * st, y2: y + h + 30, stroke: "rgba(250,246,236,.5)", "stroke-width": 3 }, g); text(g, String(k), x0 + k * st, y + h + 62, { gr: 28, farbe: "rgba(250,246,236,.75)" }); }
    const segs = [], rahmen = el("g", { "clip-path": "inset(0 round 14px)" }, g);
    const marke = el("line", { y1: y - 16, y2: y + h + 16, stroke: F.creme, "stroke-width": 4 }, g);
    const api = {
      g: g, x0: x0, st: st, y: y, h: h,
      px: (hh) => x0 + hh * st,
      zeichne: function (ev, hNow, start) {
        start = start || 0; let m = start * 60;
        while (segs.length < ev.length) segs.push(el("rect", { y: y, height: h, rx: 6 }, g));
        ev.forEach((e, i) => {
          const a = m / 60, b = Math.min(hNow, (m + e.min) / 60), r = segs[i];
          if (b <= a) { r.setAttribute("width", 0); m += e.min; return; }
          r.setAttribute("x", f(x0 + a * st)); r.setAttribute("width", f((b - a) * st)); r.setAttribute("fill", ART[e.art]); r.setAttribute("stroke", "#1B1D1A"); r.setAttribute("stroke-width", 2);
          m += e.min;
        });
        const px = x0 + Math.min(span, hNow) * st; marke.setAttribute("x1", f(px)); marke.setAttribute("x2", f(px));
      },
      zeige: (a) => { g.style.opacity = a; }
    };
    return api;
  }

  /* Mess-Balken: Wert in Minuten, Maximum max; Marken [{min, farbe, text}] */
  function messer(B, o) {
    const x = o.x || 70, w = o.w || 940, y = o.y, h = o.h || 44, max = o.max;
    const g = el("g", null, B.g);
    el("rect", { x: x, y: y, width: w, height: h, rx: 14, fill: "rgba(250,246,236,.1)", stroke: "rgba(250,246,236,.3)", "stroke-width": 2 }, g);
    const fuell = el("rect", { x: x, y: y, width: 0, height: h, rx: 14, fill: ART.fahren }, g);
    const wert = text(g, "0:00", x + w - 16, y + h + 40, { anker: "end", gr: 38, fett: true });
    (o.marken || []).forEach((mk) => {
      const px = x + mk.min / max * w;
      el("line", { x1: px, y1: y - 12, x2: px, y2: y + h + 12, stroke: mk.farbe || F.creme, "stroke-width": 5 }, g);
      text(g, mk.text || hm(mk.min), px, y - 20, { gr: 30, fett: true, farbe: mk.farbe || F.creme });
    });
    return { g: g, setze: function (min, farbe) { fuell.setAttribute("width", f(Math.max(0, Math.min(1, min / max)) * w)); fuell.setAttribute("fill", farbe || ART.fahren); wert.textContent = hm(min); wert.setAttribute("fill", farbe && farbe !== ART.fahren ? farbe : F.creme); }, zeige: (a) => { g.style.opacity = a; } };
  }

  /* Kalender: zwei Wochen, je 7 Tage; stunden: [[Mo..So],[Mo..So]]; Kopfzeilen von außen (Tageskürzel) */
  function kalender(B, o) {
    const x0 = o.x0 || 80, breite = o.breite || 120, hoeheMax = o.hoehe || 150, ys = o.ys || [330, 690], g = el("g", null, B.g), tage = o.tage || ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const bars = [], summen = [], marken = [];
    o.stunden.forEach((woche, wi) => {
      const y = ys[wi];
      el("rect", { x: x0 - 20, y: y - hoeheMax - 62, width: breite * 7 + 40 - 20, height: hoeheMax + 190, rx: 22, fill: "rgba(250,246,236,.06)", stroke: "rgba(250,246,236,.2)", "stroke-width": 2 }, g);
      el("line", { x1: x0 - 8, y1: y, x2: x0 + breite * 7 - 28, y2: y, stroke: "rgba(250,246,236,.4)", "stroke-width": 3 }, g);
      woche.forEach((h, di) => {
        const cx = x0 + di * breite + 46;
        const r = el("rect", { x: cx - 30, y: y, width: 60, height: 0, rx: 8, fill: ART.fahren }, g), t = text(g, "", cx, y - 14, { gr: 34, fett: true });
        text(g, tage[di], cx, y + 44, { gr: 30, farbe: "rgba(250,246,236,.8)" });
        bars.push({ r: r, t: t, h: h, y: y, wi: wi, di: di });
      });
      summen.push(text(g, "", x0 + breite * 3.5 - 14, y + 100, { gr: 42, fett: true }));
    });
    return { g: g, summen: summen, setze: function (anteilTage, o2) {
      o2 = o2 || {};
      bars.forEach((b) => {
        const idx = b.wi * 7 + b.di, a = Math.max(0, Math.min(1, anteilTage - idx)), hh = b.h * a;
        b.r.setAttribute("y", f(b.y - hh / 10 * hoeheMax)); b.r.setAttribute("height", f(hh / 10 * hoeheMax));
        b.r.setAttribute("fill", b.h > 9 ? "#F2C16E" : ART.fahren);
        b.t.textContent = a > 0.99 && b.h > 0 ? String(b.h) : ""; b.t.setAttribute("y", f(b.y - hh / 10 * hoeheMax - 14));
      });
      o.stunden.forEach((w, wi) => {
        const bis = Math.max(0, Math.min(7, anteilTage - wi * 7)), n = Math.floor(bis + 0.001), s = w.slice(0, n).reduce((a, c) => a + c, 0);
        summen[wi].textContent = n > 0 ? (o2.vorlage ? o2.vorlage(wi, s) : String(s)) : "";
      });
    }, zeige: (a) => { g.style.opacity = a; } };
  }
  window.LKW_ZEIT = { ART: ART, buehne: buehne, text: text, leiste: leiste, messer: messer, kalender: kalender, hm: hm };
})(window);

})(W);

// ---- kern/pneu.js ----
(function (window) {
/* Schaltbilder der Druckluft-Bremsanlage (Filme 6.1, 6.2, 6.3, 3.x): Behälter, Leitungen, Zylinder, Ventile, Kupplungsköpfe.
   Reine Zeichnung: jede Komponente hat setze(Wert) mit Werten 0…1 aus kern/modell.js (zweikreis, anhaengerBremse, federspeicher, kuppelnZustand).
   Farben: Druckluft blau, Bremsleitung (Kupplungskopf) gelb, Vorratsleitung rot. Bühne 1080 x 1080. */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f;
  let clipZaehler = 0;
  const C = { luft: "#6EC1E4", gelb: "#F2C94C", rot: "#E5584B", stahl: "#C9CFC6", dunkel: "#23262A", linie: "rgba(250,246,236,.30)", feder: "#E8B77F", belag: "#B08A5A" };

  function buehne(stage) {
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#36423B 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    return { svg: svg, g: el("g", null, svg), ueber: el("g", null, svg) };
  }
  function text(parent, t, x, y, o) {
    o = o || {};
    const e = el("text", { x: x, y: y, "text-anchor": o.anker || "middle", "font-size": o.gr || 28, "font-weight": o.fett ? 700 : 600, "font-family": "Barlow, sans-serif", fill: o.farbe || F.creme }, parent);
    e.textContent = t; return e;
  }
  const pfadD = (pts) => "M" + pts.map((p) => f(p[0]) + " " + f(p[1])).join(" L");
  const mix = (a, b, u) => a + (b - a) * u;

  /* Leitung: graue Röhre, darüber die Füllung (Farbe), Deckkraft/Dicke nach Druck p; ungefüllt = nur Röhre. o: { farbe, w } */
  function leitung(B, pts, o) {
    o = o || {}; const w = o.w || 14, g = el("g", null, o.layer || B.g);
    el("path", { d: pfadD(pts), fill: "none", stroke: "rgba(250,246,236,.22)", "stroke-width": w + 6, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    el("path", { d: pfadD(pts), fill: "none", stroke: "#2B3631", "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    const fuell = el("path", { d: pfadD(pts), fill: "none", stroke: o.farbe || C.luft, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, g);
    return { g: g, setze: function (p) { fuell.setAttribute("opacity", f(Math.max(0, Math.min(1, p)) * 0.95)); }, farbe: (c) => fuell.setAttribute("stroke", c), pts: pts };
  }
  /* Behälter (Vorratsbehälter): Füllstand von unten */
  function behaelter(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 150, h = o.h || 90;
    el("rect", { x: x, y: y, width: w, height: h, rx: h / 2, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    const cp = "cl" + (++clipZaehler) + "_" + Math.round(x) + "_" + Math.round(y) + "_" + (o.id || "");
    const defs = el("defs", null, g), clip = el("clipPath", { id: cp }, defs); el("rect", { x: x + 3, y: y + 3, width: w - 6, height: h - 6, rx: h / 2 - 3 }, clip);
    const fuell = el("rect", { x: x, y: y + h, width: w, height: 0, fill: o.farbe || C.luft, opacity: 0.85, "clip-path": "url(#" + cp + ")" }, g);
    if (o.name) text(g, o.name, x + w / 2, y + h + 34, { gr: 26 });
    return { g: g, setze: function (p) { p = Math.max(0, Math.min(1, p)); fuell.setAttribute("y", f(y + h - p * h)); fuell.setAttribute("height", f(p * h)); }, x: x, y: y, w: w, h: h };
  }
  /* Bremszylinder (Membran) waagerecht mit Schubstange nach rechts auf eine Bremstrommel-Scheibe. setze(p): Druck 0…1 → Stange fährt aus, Belag drückt */
  function zylinder(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 150, h = o.h || 80, hub = o.hub || 60;
    const kam = el("rect", { x: x, y: y, width: w * 0.6, height: h, rx: 10, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    const luft = el("rect", { x: x + 4, y: y + 4, width: 0, height: h - 8, rx: 6, fill: o.farbe || C.luft, opacity: 0.85 }, g);
    const kolben = el("rect", { x: x + 4, y: y + 4, width: 10, height: h - 8, rx: 3, fill: C.stahl }, g);
    const stange = el("rect", { x: x + w * 0.6, y: y + h / 2 - 7, width: w * 0.4, height: 14, fill: C.stahl }, g);
    const beleg = el("rect", { x: x + w, y: y + h / 2 - 28, width: 14, height: 56, rx: 4, fill: C.belag }, g);
    const trommel = el("circle", { cx: x + w + 14 + 70, cy: y + h / 2, r: 62, fill: "none", stroke: "rgba(250,246,236,.45)", "stroke-width": 10 }, g);
    return { g: g, setze: function (p) {
      p = Math.max(0, Math.min(1, p));
      const lw = (w * 0.6 - 8 - 12) * 0.9;
      luft.setAttribute("width", f(p * lw)); kolben.setAttribute("x", f(x + 4 + p * lw)); luft.setAttribute("opacity", f(p > 0 ? 0.85 : 0));
      const s = p * hub * 0.35;
      stange.setAttribute("x", f(x + w * 0.6 + s)); stange.setAttribute("width", f(w * 0.4 - s * 0 + 0)); beleg.setAttribute("x", f(x + w + s));
      trommel.setAttribute("stroke", p > 0.05 ? C.belag : "rgba(250,246,236,.45)");
    } };
  }
  /* Ventil (Kasten mit Beschriftung); setze(aktiv 0…1) färbt den Rand */
  function ventil(B, o) {
    const g = el("g", null, B.g), w = o.w || 110, h = o.h || 90;
    const r = el("rect", { x: o.x, y: o.y, width: w, height: h, rx: 14, fill: "#2B3631", stroke: C.stahl, "stroke-width": 5 }, g);
    el("path", { d: "M" + (o.x + w * 0.3) + " " + (o.y + h * 0.75) + " L" + (o.x + w * 0.3) + " " + (o.y + h * 0.25) + " L" + (o.x + w * 0.7) + " " + (o.y + h * 0.75) + " L" + (o.x + w * 0.7) + " " + (o.y + h * 0.25), fill: "none", stroke: "rgba(250,246,236,.7)", "stroke-width": 4, "stroke-linejoin": "round" }, g);
    if (o.name) text(g, o.name, o.x + w / 2, o.y - 14, { gr: 26 });
    return { g: g, setze: function (a) { r.setAttribute("stroke", a > 0.5 ? (o.farbe || F.gold) : C.stahl); } };
  }
  /* Kupplungskopf (rot/gelb) als Kreis mit Ring; setze(verbunden): 1 = zusammen, 0 = getrennt (Hälften auseinander) */
  function kupplung(B, o) {
    const g = el("g", null, B.g), col = o.farbe, r = o.r || 24, d = o.abstand || 70;
    const a = el("g", null, g), b = el("g", null, g);
    el("circle", { r: r, fill: "#2B3631", stroke: col, "stroke-width": 8 }, a); el("circle", { r: r, fill: "#2B3631", stroke: col, "stroke-width": 8 }, b);
    el("circle", { r: r * 0.4, fill: col }, a); el("circle", { r: r * 0.4, fill: col }, b);
    return { g: g, setze: function (v) { const s = (1 - Math.max(0, Math.min(1, v))) * d / 2; a.setAttribute("transform", "translate(" + f(o.x - s - r) + " " + o.y + ")"); b.setAttribute("transform", "translate(" + f(o.x + s + r) + " " + o.y + ")"); } };
  }
  /* Kombizylinder (Schnittbild, vereinfacht): links der Raum der Betriebsbremse (Membran: Druck schiebt die Platte nach links = bremst),
     rechts der Federspeicher (Feder schiebt den Federkolben zur Trennwand und über die Schubstange die Platte nach links = bremst; Druck zwischen Wand und Federkolben spannt die Feder = löst).
     setze(pMembran, pFeder) rechnet mit modell.federspeicher; Stange fährt bei Bremskraft nach links zur Bremse aus. Gibt das Modell-Ergebnis zurück. */
  function kombi(B, o) {
    const g = el("g", null, B.g), x = o.x, y = o.y, w = o.w || 560, h = o.h || 200, M = window.LKW_MODELL;
    const mem = w * 0.42, wand = x + mem, ende = x + w, ym = y + h / 2, hub = mem - 70, weg = ende - wand - 90;
    el("rect", { x: x, y: y, width: w, height: h, rx: 22, fill: "#2B3631", stroke: C.stahl, "stroke-width": 7 }, g);
    const luftM = el("rect", { x: x + 8, y: y + 10, width: 0, height: h - 20, fill: C.luft, opacity: 0.85 }, g);
    const luftF = el("rect", { x: wand + 6, y: y + 10, width: 0, height: h - 20, fill: C.luft, opacity: 0.85 }, g);
    el("rect", { x: wand - 6, y: y + 4, width: 12, height: h - 8, fill: C.stahl }, g);                                  // Trennwand
    const platte = el("rect", { x: wand - 16, y: y + 12, width: 14, height: h - 24, rx: 4, fill: C.stahl }, g);       // Membranplatte
    const kolbenF = el("rect", { x: wand + 6, y: y + 12, width: 16, height: h - 24, rx: 4, fill: C.stahl }, g);        // Federkolben
    const feder = el("path", { d: "", fill: "none", stroke: C.feder, "stroke-width": 9, "stroke-linejoin": "round" }, g);
    const stange = el("rect", { x: x - 70, y: ym - 10, width: 90, height: 20, fill: C.stahl }, g);
    const belag = el("rect", { x: x - 100, y: ym - 42, width: 28, height: 84, rx: 6, fill: C.belag }, g);
    const trommel = el("circle", { cx: x - 100 - 24 - 80, cy: ym, r: 86, fill: "none", stroke: "rgba(250,246,236,.45)", "stroke-width": 12 }, g);
    function federPfad(l, r) { const n = 9, a = h * 0.28; let d = "M" + f(l) + " " + f(ym); for (let k = 0; k < n; k++) d += " L" + f(l + (r - l) * (k + 0.5) / n) + " " + f(ym + (k % 2 ? a : -a)); return d + " L" + f(r) + " " + f(ym); }
    return { g: g, x: x, y: y, w: w, h: h, wandX: wand, endeX: ende, setze: function (pM, pF) {
      const r = M.federspeicher({ pFeder: pF, pMembran: pM }), pl = Math.min(1, pF / M.FEDER.haltedruck);
      const xk = wand + 12 + weg * pl;                                              // Federkolben: bei Druck nach rechts (Feder gespannt)
      kolbenF.setAttribute("x", f(xk)); luftF.setAttribute("width", f(Math.max(0, xk - wand - 6))); luftF.setAttribute("opacity", f(pF > 0.02 ? 0.85 : 0));
      feder.setAttribute("d", federPfad(xk + 16, ende - 14));
      const px = wand - 16 - hub * r.kraft;                                          // Membranplatte: je größer die Bremskraft, desto weiter links
      platte.setAttribute("x", f(px)); luftM.setAttribute("x", f(px + 14)); luftM.setAttribute("width", f(Math.max(0, wand - 16 - px) * (pM > 0.02 ? 1 : 0))); luftM.setAttribute("opacity", f(pM > 0.02 ? 0.85 : 0));
      const aus = 40 * r.kraft; stange.setAttribute("x", f(x - 70 - aus)); belag.setAttribute("x", f(x - 100 - aus));
      trommel.setAttribute("stroke", r.gebremst ? C.belag : "rgba(250,246,236,.45)"); return r;
    } };
  }

  /* Verzögerung erster Ordnung (Druck baut sich auf/ab): Werte im Raster dt vorab rechnen, Abruf per Zeit */
  function verlauf(dauer, ziel, tau, start) { const dt = 0.05, n = Math.round(dauer / dt) + 1, a = new Array(n); let p = start || 0; for (let i = 0; i < n; i++) { p += (ziel(i * dt) - p) * (1 - Math.exp(-dt / tau)); a[i] = p; } return (t) => a[Math.max(0, Math.min(n - 1, Math.round(t / dt)))]; }
  const klemme = (u) => Math.max(0, Math.min(1, u));

  /* Schema der Zweileitungsbremse (Zugmaschine links, Anhänger rechts, Köpfe in der Mitte). Bühne B (aus buehne()), tx = Textfunktion.
     zustand(t) -> { rotV, gelbV (Verbindung 0…1), pedal (0…1), res0 (Vorrat des Anhängers, solange rot nicht verbunden), rotDruck (optional, Druck auf der roten Leitung; Standard 1), gelbDefekt (optional: gelbe Leitung abgerissen) }
     Die Drücke im Anhänger kommen aus modell.anhaengerBremse. zeichne(t) -> { c (Zylinderdruck), r (Vorrat) } */
  function zweileitung(st, tx, zustand, dauer) {
    const B = buehne(st), g = B.g, M = window.LKW_MODELL, ROT = C.rot, GELB = C.gelb;
    el("rect", { x: 40, y: 150, width: 250, height: 640, rx: 22, fill: "rgba(250,246,236,.06)", stroke: "rgba(250,246,236,.30)", "stroke-width": 3 }, g);
    el("rect", { x: 580, y: 150, width: 460, height: 640, rx: 22, fill: "rgba(250,246,236,.06)", stroke: "rgba(250,246,236,.30)", "stroke-width": 3 }, g);
    text(g, tx("l_zug"), 165, 120, { gr: 30, fett: true }); text(g, tx("l_anh"), 810, 120, { gr: 30, fett: true });
    const vorratZ = behaelter(B, { x: 70, y: 190, w: 190, h: 90 });
    const pedal = el("g", null, g), pedalPlatte = el("rect", { x: 100, y: 620, width: 130, height: 46, rx: 10, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 5 }, pedal);
    text(g, tx("l_pedal"), 165, 720, { gr: 26 });
    const rot = { y: 300 }, gelb = { y: 520 };
    const teil = (y, farbe) => ({ l: el("line", { x1: 0, y1: y, x2: 0, y2: y, stroke: "#2B3631", "stroke-width": 16, "stroke-linecap": "round" }, g), f: el("line", { x1: 0, y1: y, x2: 0, y2: y, stroke: farbe, "stroke-width": 16, "stroke-linecap": "round", opacity: 0 }, g) });
    const rz = teil(rot.y, ROT), ra = teil(rot.y, ROT), gz = teil(gelb.y, GELB), ga = teil(gelb.y, GELB);
    const setzeTeil = (t, x1, x2, p) => { [t.l, t.f].forEach((e) => { e.setAttribute("x1", f(x1)); e.setAttribute("x2", f(x2)); }); t.f.setAttribute("opacity", f(klemme(p) * 0.95)); };
    const kr = kupplung(B, { x: 430, y: rot.y, farbe: ROT, r: 26, abstand: 150 }), kg = kupplung(B, { x: 430, y: gelb.y, farbe: GELB, r: 26, abstand: 150 });
    const ventil1 = ventil(B, { x: 660, y: 380, w: 130, h: 100 }); text(g, tx("l_ventil"), 725, 360, { gr: 24 });
    const vorratA = behaelter(B, { x: 840, y: 190, w: 170, h: 90 }); text(g, tx("l_behaelter"), 955, 322, { gr: 22 });
    const zyl = zylinder(B, { x: 640, y: 650, w: 150, h: 80 });
    const l1 = leitung(B, [[580, rot.y], [725, rot.y], [725, 380]], { farbe: ROT }), l2 = leitung(B, [[790, 430], [865, 430], [865, 280]], { farbe: ROT });
    const l3 = leitung(B, [[580, gelb.y], [620, gelb.y], [620, 430], [660, 430]], { farbe: GELB }), l4 = leitung(B, [[725, 480], [725, 650]], { farbe: C.luft });
    const rotP = (z) => (z.rotV >= 1 ? (z.rotDruck == null ? 1 : z.rotDruck) : 0);
    const res = verlauf(dauer, (t) => { const z = zustand(t); return rotP(z) >= M.DRUCK.schwelle ? 1 : z.res0; }, 1.5, zustand(0).res0);
    const zielZyl = (t) => { const z = zustand(t); return M.anhaengerBremse({ rot: rotP(z), gelb: z.gelbV >= 1 ? z.pedal : 0, vorratAnh: res(t) }).zyl; };
    const zy = verlauf(dauer, zielZyl, 0.5, zielZyl(0));
    const rotZug = verlauf(dauer, (t) => { const z = zustand(t); return z.rotDruck == null ? 1 : z.rotDruck; }, 0.25, 1);
    return { B: B, zeichne: function (t) {
      const z = zustand(t), r = res(t), c = zy(t), rd = rotZug(t), rp = rotP(z) >= M.DRUCK.schwelle ? Math.min(1, rd) : 0;
      pedalPlatte.setAttribute("y", f(620 + 16 * z.pedal)); pedalPlatte.setAttribute("fill", z.pedal > 0.05 ? C.gelb : "#8D949C");
      vorratZ.setze(1);
      kr.setze(z.rotV); kg.setze(z.gelbV);
      const dr = (1 - z.rotV) * 75, dg = (1 - z.gelbV) * 75;
      setzeTeil(rz, 290, 430 - 26 - dr, rd); setzeTeil(ra, 430 + 26 + dr, 580, z.rotV >= 1 ? rd : 0);
      setzeTeil(gz, 290, 430 - 26 - dg, z.gelbDefekt ? 0 : z.pedal); setzeTeil(ga, 430 + 26 + dg, 580, z.gelbV >= 1 ? z.pedal : 0);
      l1.setze(rp); l2.setze(rp); l3.setze(z.gelbV >= 1 ? z.pedal : 0); l4.setze(c); vorratA.setze(r); zyl.setze(c); ventil1.setze(c > 0.05 ? 1 : 0);
      return { c: c, r: r };
    }, g: g, kr: kr, kg: kg };
  }


  /* Schema der Zweikreis-Betriebsbremse: zwei Vorratsbehälter (Kreis 1 und 2), Bremsventil mit zwei Ausgängen, zwei Bremszylinder (Vorder- und Hinterachse).
     zustand(t) -> { pedal (0…1), leck: [bool, bool] }. Rechnet mit modell.zweikreis; Behälter entleeren sich bei Leck, der andere Kreis bleibt gefüllt. Gibt { wirkung } zurück. */
  function zweikreis(st, tx, zustand, dauer) {
    const B = buehne(st), g = B.g, M = window.LKW_MODELL, K = [C.luft, "#8FD6A6"];
    const r1 = behaelter(B, { x: 70, y: 200, w: 190, h: 90, farbe: K[0] }), r2 = behaelter(B, { x: 70, y: 480, w: 190, h: 90, farbe: K[1] });
    text(g, tx("l_kreis1"), 165, 180, { gr: 26 }); text(g, tx("l_kreis2"), 165, 460, { gr: 26 });
    const vent = ventil(B, { x: 420, y: 340, w: 150, h: 130 }); text(g, tx("l_bremsventil"), 495, 320, { gr: 26 });
    const z1 = zylinder(B, { x: 700, y: 190, w: 150, h: 80, farbe: K[0] }), z2 = zylinder(B, { x: 700, y: 480, w: 150, h: 80, farbe: K[1] });
    text(g, tx("l_vorderachse"), 790, 170, { gr: 26 }); text(g, tx("l_hinterachse"), 790, 460, { gr: 26 });
    const a1 = leitung(B, [[260, 245], [340, 245], [340, 375], [420, 375]], { farbe: K[0] }), a2 = leitung(B, [[260, 525], [340, 525], [340, 440], [420, 440]], { farbe: K[1] });
    const o1 = leitung(B, [[570, 380], [640, 380], [640, 230], [700, 230]], { farbe: K[0] }), o2 = leitung(B, [[570, 435], [640, 435], [640, 520], [700, 520]], { farbe: K[1] });
    const pedal = el("rect", { x: 420, y: 640, width: 150, height: 46, rx: 10, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 5 }, g); text(g, tx("l_pedal"), 495, 730, { gr: 26 });
    el("rect", { x: 70, y: 850, width: 520, height: 44, rx: 14, fill: "rgba(250,246,236,.1)", stroke: "rgba(250,246,236,.3)", "stroke-width": 2 }, g);
    const wBalken = el("rect", { x: 70, y: 850, width: 0, height: 44, rx: 14, fill: C.gelb }, g); text(g, tx("l_wirkung"), 70, 835, { gr: 26, anker: "start" });
    // Leck: Tropfen unter Behälter 2
    const leck = el("g", { opacity: 0 }, g); [[130, 600], [180, 612], [225, 598]].forEach((p) => el("path", { d: "M" + p[0] + " " + p[1] + " q-10 20 0 28 q10 -8 0 -28", fill: "#FF9A5C" }, leck));
    const V = [0, 1].map((k) => verlauf(dauer, (t) => (zustand(t).leck[k] ? 0 : 1), 1.6, 1));
    const Z = [0, 1].map((k) => verlauf(dauer, (t) => M.zweikreis({ pedal: zustand(t).pedal, leck: [V[0](t) < 0.05, V[1](t) < 0.05] }).zyl[k], 0.4, 0));
    return { B: B, zeichne: function (t) {
      const z = zustand(t), v = [V[0](t), V[1](t)], c = [Z[0](t), Z[1](t)];
      r1.setze(v[0]); r2.setze(v[1]); a1.setze(v[0]); a2.setze(v[1]); o1.setze(c[0]); o2.setze(c[1]); z1.setze(c[0]); z2.setze(c[1]);
      vent.setze(z.pedal > 0.05 ? 1 : 0); pedal.setAttribute("y", f(640 + 16 * z.pedal)); pedal.setAttribute("fill", z.pedal > 0.05 ? C.gelb : "#8D949C");
      const w = (c[0] + c[1]) / 2; wBalken.setAttribute("width", f(w * 520)); leck.setAttribute("opacity", z.leck[1] || z.leck[0] ? 1 : 0);
      return { wirkung: w, v: v, c: c };
    } };
  }

  window.LKW_PNEU = { zweikreis: zweikreis, zweileitung: zweileitung, verlauf: verlauf, C: C, buehne: buehne, text: text, leitung: leitung, behaelter: behaelter, zylinder: zylinder, ventil: ventil, kupplung: kupplung, kombi: kombi, mix: mix };
})(window);

})(W);

// ---- kern/kuppeln.js ----
(function (window) {
/* Seitenbilder zum Kuppeln (Filme 3.1, 3.2, 3.3): Sattelzugmaschine, Auflieger mit Stützwinden und Keilen, Druckluftschläuche, geneigter Boden.
   Alle Zeichnungen in Metern (Boden y = 0, Höhe nach oben = negatives y), Fahrtrichtung nach rechts. Die Höhen sind Beispielwerte eines neutralen Fahrzeugs
   (Sattelplatte knapp unter der Unterkante des Aufliegers), Zahlen kommen nicht ins Bild. Bewegungen und Prüfungen: kern/modell.js (sattelUnterfahren, kuppelnZustand, rollen). */
(function (window) {
  "use strict";
  const BK = window.LKW_BK, F = BK.FARBE, el = BK.el, f = BK.f, SA = window.LKW_MODELL.SATTEL;
  const GELB = "#F2C94C", ROT = "#E5584B", ELEK = "#B9BEC4";
  // Beispielmaße (m): Unterkante des Aufliegers über dem Boden, Sattelplatte der Zugmaschine bei normaler Fahrhöhe
  const MASS = { auflieger: { unterkante: SA.unterkante, zapfenUnten: SA.zapfenUnten, stuetzX: -2.4, achsX: -7.6, vorderKante: 1.55, hinterKante: -10.9, hoehe: 4.0 }, zug: { plattenOben: SA.plattenOben, hinterachse: 0, vorderachse: 3.7, kabineHinten: 2.9, kabineVorn: 5.1, rahmenHinten: -1.2 }, steckdose: { x: 1.56, y: [-2.55, -2.30, -2.05] }, anker: { x: 2.9, y: [-2.55, -2.30, -2.05] } };

  /* Bühne mit geneigtem Boden: Gruppe G in Metern, x entlang des Bodens. winkel in Grad (positiv: Boden fällt nach rechts ab). kamera(xc): Weltpunkt xc liegt auf ox */
  function szene(stage, o) {
    o = o || {}; const S = o.S || 48, ox = o.ox || 540, boden = o.boden || 760, sl = o.winkel || 0;
    stage.style.background = "linear-gradient(180deg,#2B3631 0%,#3A463F 60%,#434B45 100%)";
    const svg = el("svg", { viewBox: "0 0 1080 1080", width: 1080, height: 1080 });
    svg.style.cssText = "position:absolute;left:0;top:0;overflow:hidden";
    stage.appendChild(svg);
    const G = el("g", null, svg), W = { S: S, G: G, svg: svg, xc: 0, ox: ox, boden: boden, winkel: sl };
    el("rect", { x: -400, y: 0, width: 800, height: 400, fill: "#4A524C" }, G);
    el("rect", { x: -400, y: -0.06, width: 800, height: 0.12, fill: "#7A837C" }, G);
    for (let i = -80; i <= 80; i++) el("line", { x1: i * 5, y1: 0.35, x2: i * 5, y2: 0.8, stroke: "rgba(250,246,236,.30)", "stroke-width": 0.06 }, G);   // Streckenmarken alle 5 m
    W.gHinten = el("g", null, G); W.gFz = el("g", null, G); W.gVorn = el("g", null, G);
    W.kamera = function (xc) { W.xc = xc; G.setAttribute("transform", "translate(" + f(ox) + " " + f(boden) + ") rotate(" + f(sl) + ") scale(" + S + ") translate(" + f(-xc) + " 0)"); };
    W.kamera(0);
    // Bildschirmposition eines Punktes (Meter in G) ohne Neigung: für Beschriftungen
    W.px = (x, y) => { const a = sl * Math.PI / 180, dx = (x - W.xc) * S, dy = (y || 0) * S; return [ox + dx * Math.cos(a) - dy * Math.sin(a), boden + dx * Math.sin(a) + dy * Math.cos(a)]; };
    return W;
  }
  function rad(g, cx, r) {
    const w = el("g", { transform: "translate(" + cx + " -" + r + ")" }, g);
    el("circle", { r: r, fill: F.reifen, stroke: "#000", "stroke-width": 0.04 }, w);
    const d = el("g", null, w); el("circle", { r: r * 0.55, fill: "#8D949C" }, d); el("line", { x1: -r * 0.5, y1: 0, x2: r * 0.5, y2: 0, stroke: "#4B5057", "stroke-width": 0.09 }, d);
    return d;
  }

  /* Auflieger (Ursprung: Königszapfen am Boden; x = Fahrtrichtung). setze({ stuetze: 0…1 (ausgefahren), keil: 0/1, licht: 0/1 }) */
  function auflieger(W, o) {
    o = o || {}; const A = MASS.auflieger, g = el("g", null, o.layer || W.gFz);
    g.style.filter = "drop-shadow(0 " + (5 / W.S).toFixed(3) + "px " + (5 / W.S).toFixed(3) + "px rgba(0,0,0,.4))";
    const kasten = el("rect", { x: A.hinterKante, y: -A.hoehe, width: A.vorderKante - A.hinterKante, height: A.hoehe - 1.45, rx: 0.12, fill: F.kasten, stroke: F.kastenD, "stroke-width": 0.07 }, g);
    for (let x = A.hinterKante + 1.0; x < A.vorderKante - 0.5; x += 1.2) el("line", { x1: x, y1: -A.hoehe + 0.1, x2: x, y2: -1.55, stroke: "rgba(120,108,80,.28)", "stroke-width": 0.04 }, g);
    el("rect", { x: A.hinterKante + 0.2, y: -1.45, width: A.vorderKante - A.hinterKante - 0.4, height: 0.15, fill: "#3A3E43" }, g);                   // Fahrgestell
    el("path", { d: "M" + A.vorderKante + " -" + (A.unterkante + 0.12) + " L0.6 -" + A.unterkante + " L" + A.vorderKante + " -" + A.unterkante + " Z", fill: "#5A5F66" }, g);   // Aufgleitplatte (vorn angeschrägt)
    el("rect", { x: -0.09, y: -A.unterkante, width: 0.18, height: A.unterkante - A.zapfenUnten, fill: "#33373C" }, g);                                                            // Königszapfen
    el("rect", { x: A.vorderKante - 0.05, y: -3.2, width: 0.06, height: 1.7, fill: "#9AA3AC" }, g);                                                      // Stirnwand
    // Stützwinde (Seitenansicht: ein Bein)
    const bein = el("rect", { x: A.stuetzX - 0.1, y: -A.unterkante, width: 0.2, height: 0.85, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 0.04 }, g);
    const fuss = el("rect", { x: A.stuetzX - 0.3, y: -0.12, width: 0.6, height: 0.1, rx: 0.03, fill: "#33373C" }, g);
    const kurbel = el("g", null, g); el("line", { x1: A.stuetzX + 0.1, y1: -0.9, x2: A.stuetzX + 0.55, y2: -0.9, stroke: "#23262A", "stroke-width": 0.06 }, kurbel); el("circle", { cx: A.stuetzX + 0.55, cy: -0.9, r: 0.07, fill: "#23262A" }, kurbel);
    // Räder (drei Achsen)
    const dreherA = [A.achsX - 1.3, A.achsX, A.achsX + 1.3].map((cx) => rad(g, cx, 0.5));
    // Keile (vor und hinter dem letzten Rad)
    const keil = el("g", { opacity: 0 }, g);
    el("path", { d: "M" + (A.achsX - 1.3 - 0.52) + " 0 L" + (A.achsX - 1.3 - 0.95) + " 0 L" + (A.achsX - 1.3 - 0.52) + " -0.28 Z", fill: "#D9B35C", stroke: "#8F5A14", "stroke-width": 0.04 }, keil);
    el("path", { d: "M" + (A.achsX - 1.3 + 0.52) + " 0 L" + (A.achsX - 1.3 + 0.95) + " 0 L" + (A.achsX - 1.3 + 0.52) + " -0.28 Z", fill: "#D9B35C", stroke: "#8F5A14", "stroke-width": 0.04 }, keil);
    // Steckdosen an der Stirnwand: gelb (Bremse), rot (Vorrat), elektrisch
    [GELB, ROT, ELEK].forEach((c, k) => el("circle", { cx: MASS.steckdose.x, cy: MASS.steckdose.y[k], r: 0.075, fill: c, stroke: "#23262A", "stroke-width": 0.03 }, g));
    const glut = el("circle", { cx: A.hinterKante, cy: -1.75, r: 0.55, fill: "rgba(255,59,43,.7)", opacity: 0 }, g), licht = el("rect", { x: A.hinterKante - 0.03, y: -1.9, width: 0.12, height: 0.34, fill: F.ruecklicht, opacity: 0.9 }, g), bremslicht = el("rect", { x: A.hinterKante - 0.03, y: -1.9, width: 0.12, height: 0.34, fill: "#FF3B2B", opacity: 0 }, g);
    return { g: g, setze: function (x, s) {
      s = s || {}; g.setAttribute("transform", "translate(" + f(x) + " 0)"); dreherA.forEach((d) => d.setAttribute("transform", "rotate(" + f(((x + A.achsX) / 0.5) * 57.2958 % 360) + ")"));
      const e = s.stuetze == null ? 1 : s.stuetze; bein.setAttribute("height", f(A.unterkante - 0.45 * (1 - e))); fuss.setAttribute("y", f(-0.12 - 0.45 * (1 - e) * 1));
      kurbel.setAttribute("transform", "translate(0 " + f(-0.45 * (1 - e) * 0) + ")");
      keil.setAttribute("opacity", s.keil == null ? 0 : Number(s.keil)); bremslicht.setAttribute("opacity", s.bremst ? 1 : 0); glut.setAttribute("opacity", s.bremst ? 0.45 : 0); licht.setAttribute("opacity", s.licht == null ? 0.9 : (s.licht ? 1 : 0.35));
    } };
  }

  /* Sattelzugmaschine (Ursprung: Hinterachse am Boden). setze(x, luft): luft = Höhenänderung der Luftfederung in m (positiv = angehoben) */
  function zugmaschine(W, o) {
    o = o || {}; const Z = MASS.zug, g = el("g", null, o.layer || W.gFz), karo = el("g", null, g);
    g.style.filter = "drop-shadow(0 " + (5 / W.S).toFixed(3) + "px " + (5 / W.S).toFixed(3) + "px rgba(0,0,0,.4))";
    el("rect", { x: Z.rahmenHinten, y: -1.15, width: 5.9, height: 0.16, fill: "#3A3E43" }, karo);
    el("rect", { x: -0.2, y: -Z.plattenOben - 0.005, width: 1.5, height: 0.12, rx: 0.03, fill: "#8D949C", stroke: "#4B5057", "stroke-width": 0.03 }, karo);               // Sattelplatte (Oberseite bei −1,25 m)
    el("rect", { x: -0.2, y: -Z.plattenOben - 0.005, width: 0.3, height: 0.12, fill: "#5A5F66" }, karo);
    el("path", { d: "M" + Z.kabineHinten + " -1.1 L" + Z.kabineHinten + " -3.3 L4.3 -3.3 L" + Z.kabineVorn + " -2.0 L" + Z.kabineVorn + " -1.1 Z", fill: F.kabine, stroke: F.kabineD, "stroke-width": 0.07 }, karo);
    el("path", { d: "M3.2 -2.2 L3.2 -3.05 L4.2 -3.05 L4.85 -2.2 Z", fill: F.glas }, karo);
    el("rect", { x: Z.kabineVorn - 0.12, y: -1.5, width: 0.12, height: 0.3, fill: F.scheinwerfer }, karo);
    el("rect", { x: 3.0, y: -1.0, width: 1.0, height: 0.55, rx: 0.05, fill: "#5A5F66" }, karo);
    // Anschlusspunkte hinter der Kabine (gelb, rot, Elektrik)
    [GELB, ROT, ELEK].forEach((c, k) => el("circle", { cx: MASS.anker.x, cy: MASS.anker.y[k], r: 0.075, fill: c, stroke: "#23262A", "stroke-width": 0.03 }, karo));
    // Betätigung der Sattelkupplung: Hebel hinten an der Platte (offen = angehoben) und Sicherung (Falle); zu = 1: geschlossen und gesichert
    const hebel = el("g", { transform: "translate(-0.15 -1.34)" }, karo); el("line", { x1: 0, y1: 0, x2: -0.45, y2: 0, stroke: "#23262A", "stroke-width": 0.08, "stroke-linecap": "round" }, hebel); el("circle", { cx: -0.45, cy: 0, r: 0.07, fill: "#23262A" }, hebel);
    const falle = el("rect", { x: -0.12, y: -1.36, width: 0.2, height: 0.1, rx: 0.03, fill: "#FF9A5C", stroke: "#23262A", "stroke-width": 0.03 }, karo);
    const dreher = [rad(g, Z.hinterachse, 0.5), rad(g, Z.vorderachse, 0.5)];
    return { g: g, karo: karo, hebelPos: { x: -0.4, y: -1.34 }, setze: function (x, luft) { g.setAttribute("transform", "translate(" + f(x) + " 0)"); karo.setAttribute("transform", "translate(0 " + f(-(luft || 0)) + ")"); dreher.forEach((d) => d.setAttribute("transform", "rotate(" + f(((x + SA.e) / 0.5) * 57.2958 % 360) + ")")); },
      kupplung: function (zu) { hebel.setAttribute("transform", "translate(-0.15 -1.34) rotate(" + f((1 - zu) * -55) + ")"); falle.setAttribute("fill", zu > 0.5 ? "#8FD6A6" : "#FF9A5C"); falle.setAttribute("y", f(zu > 0.5 ? -1.31 : -1.40)); } };
  }

  /* Schlauch von (x1,y1) nach (x2,y2) mit Durchhang; Länge L (m): je kürzer der Abstand, desto mehr Durchhang. */
  function schlauch(W, farbe, o) {
    o = o || {}; const g = el("g", null, o.layer || W.gVorn), L = o.laenge || 1.6;
    const p = el("path", { d: "", fill: "none", stroke: farbe, "stroke-width": 0.1, "stroke-linecap": "round" }, g), kopf = el("circle", { r: 0.12, fill: farbe, stroke: "#23262A", "stroke-width": 0.04 }, g);
    return { g: g, setze: function (a, b) {
      const d = Math.hypot(b.x - a.x, b.y - a.y), sack = Math.max(0.1, Math.sqrt(Math.max(0, L * L - d * d)) * 0.5), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + sack;
      p.setAttribute("d", "M" + f(a.x) + " " + f(a.y) + " Q" + f(mx) + " " + f(my + sack * 0.3) + " " + f(b.x) + " " + f(b.y)); kopf.setAttribute("cx", f(b.x)); kopf.setAttribute("cy", f(b.y));
    } };
  }
  // Anschlusspunkt k (0 gelb, 1 rot, 2 Elektrik) hinter der Kabine in Weltkoordinaten, wenn der Zug mit dem Königszapfen bei kp gekuppelt steht (Zugmaschine bei kp − e, angehoben bis Kontakt)
  const ankerWelt = (kp, k) => ({ x: kp - SA.e + MASS.anker.x, y: MASS.anker.y[k] - (SA.unterkante - SA.plattenOben) });
  const ruheWelt = (kp, k) => { const a = ankerWelt(kp, k); return { x: a.x - 0.15, y: a.y + 0.55 }; };
  /* Pille an Bildschirmposition (Mitte) mit Deckkraft a; Hinweislinie (Pixel) von der Pille zum Punkt */
  function platz(p, x, y, a) { p.style.left = f(Math.max(270, Math.min(810, x))) + "px"; p.style.top = f(y) + "px"; p.style.opacity = a; }
  function leiter(W, farbe) {
    const g = el("g", { opacity: 0 }, W.svg), l = el("line", { stroke: farbe || F.creme, "stroke-width": 2.5, "stroke-dasharray": "2 7", "stroke-linecap": "round" }, g), c = el("circle", { r: 5, fill: farbe || F.creme }, g);
    return { g: g, setze: (x1, y1, x2, y2, a) => { l.setAttribute("x1", f(x1)); l.setAttribute("y1", f(y1)); l.setAttribute("x2", f(x2)); l.setAttribute("y2", f(y2)); c.setAttribute("cx", f(x2)); c.setAttribute("cy", f(y2)); g.style.opacity = a; } };
  }
  // Seitenansicht mit Zugmaschine und Auflieger (Maßstab S, Kamera xc, Blickhöhe yc)
  function seite(st, S, xc, yc, ox) { const W = szene(st, { S: S, ox: ox || 540, boden: 540 + yc * S }); W.kamera(xc); return { W: W, au: auflieger(W), zm: zugmaschine(W) }; }
  window.LKW_KUPPELN = { ankerWelt: ankerWelt, ruheWelt: ruheWelt, platz: platz, leiter: leiter, seite: seite, MASS: MASS, GELB: GELB, ROT: ROT, szene: szene, auflieger: auflieger, zugmaschine: zugmaschine, schlauch: schlauch };
})(window);

})(W);

W.LKW_FOTOS = {"federspeicher":"data:image/jpeg;base64,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"};
// ---- kern/foto.js ----
(function (window) {
/* Fotokarte: blendet ein Beispielfoto (KI-erzeugt, siehe fotos/) über die Bühne, Rest der Bühne wird abgedunkelt.
   LKW_FOTO.karte(st, name, titel, hinweis) -> { setze(a) }  (a = 0…1). Die Bilddaten kommen in der App aus window.LKW_FOTOS[name] (Data-URI, von bauen.mjs eingebettet), im MP4-Film aus ../fotos/<name>.jpg.
   Das Foto ist Beispiel, kein Herstellerbild: Es trägt immer den Hinweis „Beispielbild, KI-erzeugt“ (hinweis). */
(function (window) {
  "use strict";
  function karte(st, name, titel, hinweis) {
    const d = document.createElement("div");
    d.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1080px;background:rgba(24,31,27,.9);opacity:0;pointer-events:none";
    const rahmen = document.createElement("div");
    rahmen.style.cssText = "position:absolute;left:190px;top:150px;width:700px;height:700px;border-radius:26px;overflow:hidden;border:6px solid #FAF6EC;box-shadow:0 18px 50px rgba(0,0,0,.5);background:#222";
    const im = document.createElement("img"); im.alt = "";
    im.src = (window.LKW_FOTOS && window.LKW_FOTOS[name]) || ("../fotos/" + name + ".jpg");
    im.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
    rahmen.appendChild(im); d.appendChild(rahmen);
    const t = document.createElement("div"); t.textContent = titel;
    t.style.cssText = "position:absolute;left:90px;width:900px;top:880px;text-align:center;font:700 54px/1.1 'Barlow',sans-serif;color:#FAF6EC";
    const h = document.createElement("div"); h.textContent = hinweis;
    h.style.cssText = "position:absolute;left:90px;width:900px;top:960px;text-align:center;font:600 32px/1.1 'Barlow',sans-serif;color:rgba(250,246,236,.7)";
    d.appendChild(t); d.appendChild(h); st.appendChild(d);
    return { setze: function (a) { d.style.opacity = a; } };
  }
  window.LKW_FOTO = { karte: karte };
})(window);

})(W);

// ---- f6-3/text.js ----
(function (window) {
/* Film 6.3 „Federspeicherbremse“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Quellen: kfz-tech (Druckluft-Handbremse: „Die Druckluft wird also zum Lösen der Bremse gebraucht“, „… bei Ausfall der Druckluft automatisch wirksam“), WABCO-Produktkatalog (Handbremsventil, Überströmventil),
   Wikipedia Federspeicherbremse/Membranzylinder, Serbands Dropbox-Folien CE (Feststellbremse, „erst losfahren, wenn der Druck aufgebaut ist“). Belege und Grenzen: Vault, Faktenblatt Film 6.3.
   Prinzipbild eines Kombizylinders, vereinfacht; Drücke sind Anteile (0 bis voll), keine bar-Werte. Modell: kern/modell.js (federspeicher) mit Tests. Keine Aussagen zu Hebelrichtung, Notlösen oder Anhänger-Löseknöpfen (bauartabhängig). */
window.FILM_TEXT = {
  film: "lkw-f6-3",
  fotos: ["federspeicher"],
  poster: 40,
  de: {
    titel: "Federspeicherbremse",
    l_foto: "Beispielbild, KI-erzeugt", f_feder: "Kombizylinder an der Achse",
    ui_ueber: "Überblick: Feder bremst, Luft löst",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Das Prinzip", k1_titel: "Die Feder bremst", k1_sub: "Schnitt durch den Federspeicherteil (vereinfacht).",
    k1_p1: "Im Federspeicherzylinder sitzt eine starke Feder.",
    k1_p2: "Ohne Druckluft drückt die Feder die Bremse zu.",
    k1_p3: "Druckluft im Federteil spannt die Feder. Die Bremse löst.",
    k1_p4: "Also: Die Feder bremst, die Luft löst.",
    l_feder: "Feder", l_luft: "Druckluft", l_zu: "Bremse zu", l_frei: "Bremse frei", l_trommel: "Bremstrommel",

    k2_kicker: "Der Kombizylinder", k2_titel: "Zwei Bremsen in einem Gehäuse", k2_sub: "Betriebsbremse und Feststellbremse.",
    k2_p1: "Der Kombizylinder hat zwei Teile: den Membranteil und den Federteil.",
    k2_p2: "Die Betriebsbremse arbeitet über den Membranteil: Luft drückt, die Bremse greift.",
    k2_p3: "Die Feststellbremse arbeitet über den Federteil: Das Handbremsventil entlüftet ihn.",
    k2_p4: "Dann bremst die Feder. Zum Lösen kommt wieder Luft in den Federteil.",
    l_membran: "Membranteil", l_federteil: "Federteil", l_betrieb: "Betriebsbremse", l_fest: "Feststellbremse", l_entlueftet: "Federteil entlüftet",

    k3_kicker: "Wenn Druck fehlt", k3_titel: "Druckverlust: die Feder bremst von selbst", k3_sub: "Auch ohne dass jemand bremst.",
    k3_p1: "Verliert der Federteil Druck, zum Beispiel durch ein Leck, wird die Feder nicht mehr gehalten.",
    k3_p2: "Fällt er zu tief, drückt die Feder die Bremse zu.",
    k3_p3: "So bremst das Fahrzeug von selbst, zum Beispiel bei einem Leck.",
    k3_p4: "Darum erst losfahren, wenn der Druck aufgebaut ist.",
    l_druck: "Druck im Federteil", l_zieht_zu: "Ab hier zieht die Feder zu", l_leck: "Druck sinkt", l_aufbau: "Druck baut sich auf", l_gespannt: "Feder gespannt", l_bremst_selbst: "Bremst von selbst",

    k4_kicker: "Merke", k4_titel: "Zum Mitnehmen",
    k4_merk: "Feder bremst, Luft löst. Ohne Druck bremst die Feder von selbst. Erst losfahren, wenn der Druck aufgebaut ist."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 56, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.5, ref: "kfz-tech; Wikipedia Federspeicherbremse" }, { k: "k1_p2", t: 13.0, ref: "kfz-tech" }, { k: "k1_p3", t: 24.0, ref: "kfz-tech: „Die Druckluft wird also zum Lösen der Bremse gebraucht“" }, { k: "k1_p4", t: 42.0 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 66, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5, ref: "Wikipedia Membranzylinder; Atzlinger" }, { k: "k2_p2", t: 12.0, ref: "Wikipedia Membranzylinder" }, { k: "k2_p3", t: 30.0, ref: "WABCO Handbremsventil; kfz-tech Handbremsventil2" }, { k: "k2_p4", t: 46.0, ref: "kfz-tech Handbremsventil2" }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 64, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5, ref: "Wikipedia Federspeicherbremse" }, { k: "k3_p2", t: 16.0, ref: "kfz-tech" }, { k: "k3_p3", t: 30.0, ref: "Wikipedia Federspeicherbremse; kfz-tech" }, { k: "k3_p4", t: 44.0, ref: "Folien CE (Prinzip: WABCO Überströmventil, Schlepper-Katalog)" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 22, merk: { k: "k4_merk", t: 1.2 } }
  ]
};

})(W);

W.FILM_SPRACHEN = {"en":{"titel":"Spring brake","ui_ueber":"Overview: spring brakes, air releases","ui_intro":"A short film without sound: everything is shown as text in the picture. You can pause at any time or choose a chapter.","ui_start":"Start film","ui_pause":"Pause","ui_weiter":"Next","ui_neu":"From the start","ui_kapitel":"Chapters","ui_lesen":"Read the full text","k1_kicker":"The principle","k1_titel":"The spring brakes","k1_sub":"Section through the spring brake part (simplified).","k1_p1":"A strong spring sits in the spring brake chamber.","k1_p2":"Without compressed air, the spring presses the brake on.","k1_p3":"Compressed air in the spring part compresses the spring. The brake releases.","k1_p4":"So: the spring brakes, the air releases.","l_feder":"Spring","l_luft":"Compressed air","l_zu":"Brake on","l_frei":"Brake released","l_trommel":"Brake drum","k2_kicker":"The combination chamber","k2_titel":"Two brakes in one housing","k2_sub":"Service brake and parking brake.","k2_p1":"The combination chamber has two parts: the diaphragm part and the spring part.","k2_p2":"The service brake works via the diaphragm part: air pushes, the brake applies.","k2_p3":"The parking brake works via the spring part: the parking brake valve exhausts it.","k2_p4":"Then the spring brakes. To release, air goes back into the spring part.","l_membran":"Diaphragm part","l_federteil":"Spring part","l_betrieb":"Service brake","l_fest":"Parking brake","l_entlueftet":"Spring part exhausted","k3_kicker":"When pressure is missing","k3_titel":"Pressure loss: the spring brakes by itself","k3_sub":"Even if nobody brakes.","k3_p1":"If the spring part loses pressure, for example through a leak, the spring is no longer held.","k3_p2":"If it falls too low, the spring presses the brake on.","k3_p3":"So the vehicle brakes by itself, for example with a leak.","k3_p4":"That is why you only drive off once the pressure has built up.","l_druck":"Spring part pressure","l_zieht_zu":"Spring applies here","l_leck":"Pressure drops","l_aufbau":"Pressure builds up","l_gespannt":"Spring compressed","l_bremst_selbst":"Brakes by itself","k4_kicker":"Remember","k4_titel":"To take away","k4_merk":"Spring brakes, air releases. Without pressure the spring brakes by itself. Only drive off once the pressure has built up.","l_foto":"Example image, AI-generated","f_feder":"Combination chamber on the axle"},"sr":{"titel":"Opružna kočnica","ui_ueber":"Pregled: opruga koči, vazduh otpušta","ui_intro":"Kratak film bez zvuka: sve stoji kao tekst u slici. Možeš da zaustaviš film u bilo kom trenutku ili da izabereš poglavlje.","ui_start":"Pokreni film","ui_pause":"Zaustavi","ui_weiter":"Dalje","ui_neu":"Ispočetka","ui_kapitel":"Poglavlja","ui_lesen":"Pročitaj ceo tekst","k1_kicker":"Princip","k1_titel":"Opruga koči","k1_sub":"Presek opružnog dela (pojednostavljeno).","k1_p1":"U opružnom cilindru nalazi se jaka opruga.","k1_p2":"Bez komprimovanog vazduha opruga steže kočnicu.","k1_p3":"Komprimovani vazduh u opružnom delu steže oprugu. Kočnica se otpušta.","k1_p4":"Dakle: opruga koči, vazduh otpušta.","l_feder":"Opruga","l_luft":"Komprim. vazduh","l_zu":"Kočnica stegnuta","l_frei":"Kočnica otpuštena","l_trommel":"Kočioni bubanj","k2_kicker":"Kombinovani cilindar","k2_titel":"Dve kočnice u jednom kućištu","k2_sub":"Radna kočnica i parkirna kočnica.","k2_p1":"Kombinovani cilindar ima dva dela: membranski deo i opružni deo.","k2_p2":"Radna kočnica radi preko membranskog dela: vazduh pritiska, kočnica prianja.","k2_p3":"Parkirna kočnica radi preko opružnog dela: ventil ručne kočnice ispušta vazduh iz njega.","k2_p4":"Tada opruga koči. Za otpuštanje vazduh ponovo ulazi u opružni deo.","l_membran":"Membranski deo","l_federteil":"Opružni deo","l_betrieb":"Radna kočnica","l_fest":"Parkirna kočnica","l_entlueftet":"Opružni deo prazan","k3_kicker":"Kad nema pritiska","k3_titel":"Pad pritiska: opruga koči sama","k3_sub":"I kad niko ne koči.","k3_p1":"Ako opružni deo izgubi pritisak, na primer zbog curenja, opruga se više ne drži.","k3_p2":"Ako padne prenisko, opruga steže kočnicu.","k3_p3":"Tako vozilo koči samo, na primer kod curenja.","k3_p4":"Zato kreni tek kad se pritisak napuni.","l_druck":"Pritisak opružnog dela","l_zieht_zu":"Odavde opruga steže","l_leck":"Pritisak pada","l_aufbau":"Pritisak raste","l_gespannt":"Opruga stegnuta","l_bremst_selbst":"Koči sama","k4_kicker":"Zapamti","k4_titel":"Za poneti","k4_merk":"Opruga koči, vazduh otpušta. Bez pritiska opruga koči sama. Kreni tek kad se pritisak napuni.","l_foto":"Primer slike, napravljen veštačkom inteligencijom","f_feder":"Kombinovani cilindar na osovini"},"tr":{"titel":"Yaylı fren","ui_ueber":"Genel bakış: yay frenler, hava serbest bırakır","ui_intro":"Sessiz kısa bir film: her şey görüntüde yazı olarak durur. İstediğin zaman durdurabilir veya bir bölüm seçebilirsin.","ui_start":"Filmi başlat","ui_pause":"Durdur","ui_weiter":"İleri","ui_neu":"Baştan","ui_kapitel":"Bölümler","ui_lesen":"Metnin tamamını oku","k1_kicker":"İlke","k1_titel":"Yay frenler","k1_sub":"Yaylı kısmın kesiti (basitleştirilmiş).","k1_p1":"Yaylı silindirin içinde güçlü bir yay vardır.","k1_p2":"Basınçlı hava yoksa yay freni sıkar.","k1_p3":"Yaylı kısımdaki basınçlı hava yayı gerer. Fren serbest kalır.","k1_p4":"Yani: yay frenler, hava serbest bırakır.","l_feder":"Yay","l_luft":"Basınçlı hava","l_zu":"Fren sıkılı","l_frei":"Fren serbest","l_trommel":"Fren kampanası","k2_kicker":"Kombine silindir","k2_titel":"Tek gövdede iki fren","k2_sub":"Çalışma freni ve park freni.","k2_p1":"Kombine silindirin iki kısmı vardır: diyafram kısmı ve yaylı kısım.","k2_p2":"Çalışma freni diyafram kısmı üzerinden çalışır: hava iter, fren tutar.","k2_p3":"Park freni yaylı kısım üzerinden çalışır: el freni valfi onun havasını boşaltır.","k2_p4":"Sonra yay frenler. Serbest bırakmak için yaylı kısma yeniden hava girer.","l_membran":"Diyafram kısmı","l_federteil":"Yaylı kısım","l_betrieb":"Çalışma freni","l_fest":"Park freni","l_entlueftet":"Yaylı kısım boşaldı","k3_kicker":"Basınç yoksa","k3_titel":"Basınç kaybı: yay kendiliğinden frenler","k3_sub":"Kimse fren yapmasa da.","k3_p1":"Yaylı kısım basınç kaybederse, örneğin bir kaçak yüzünden, yay artık tutulmaz.","k3_p2":"Çok düşerse yay freni sıkar.","k3_p3":"Böylece araç kendiliğinden frenler, örneğin bir kaçakta.","k3_p4":"Bu yüzden basınç oluştuktan sonra yola çık.","l_druck":"Yaylı kısımdaki basınç","l_zieht_zu":"Buradan yay sıkar","l_leck":"Basınç düşer","l_aufbau":"Basınç oluşuyor","l_gespannt":"Yay gergin","l_bremst_selbst":"Kendiliğinden frenler","k4_kicker":"Not al","k4_titel":"Akılda kalsın","k4_merk":"Yay frenler, hava serbest bırakır. Basınç yoksa yay kendiliğinden frenler. Basınç oluştuktan sonra yola çık.","l_foto":"Örnek görsel, yapay zekâ ile üretildi","f_feder":"Aksta kombine silindir"}};
// ---- f6-3/szenen.js ----
(function (window) {
/* Szenen des Films 6.3 „Federspeicherbremse“ – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Prinzipbild des Kombizylinders aus kern/pneu.js (kombi) mit den Werten aus kern/modell.js (federspeicher). Keine Herstellerpläne, keine bar-Werte.
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, PN = window.LKW_PNEU, F = BK.FARBE, KU = window.LKW_KUPPELN, el = BK.el, f = BK.f;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Federspeicherbremse" });
    const GRUEN = "#8FD6A6", WARN = "#FF9A5C", GOLD = F.gold, LUFT = PN.C.luft, platz = KU.platz;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); };
    function uhr(T0, dauer, zeichne) { const proxy = { t: 0 }; tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0); zeichne(0); }
    const pille = (st, text, farbe, o2) => BK.pille(st, text, 0, 0, Object.assign({ punkt: farbe }, o2 || {}));
    if (M.federspeicher({ pFeder: 0, pMembran: 0 }).geloest || !M.federspeicher({ pFeder: 1, pMembran: 0 }).geloest || !M.federspeicher({ pFeder: 0, pMembran: 0 }).gebremst) throw new Error("Federspeicher passt nicht zum Modell");

    const ZX = 330, ZY = 400, ZW = 680, ZH = 240;
    function zyl(st) { const B = PN.buehne(st), k = PN.kombi(B, { x: ZX, y: ZY, w: ZW, h: ZH }); return { B: B, k: k, mx: ZX + ZW * 0.21, fx: k.wandX + (k.endeX - k.wandX) / 2 }; }

    /* ---------- K1: Feder bremst, Luft löst ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), Z = zyl(st);
      const pt = pille(st, tx("l_trommel"), GOLD), pf = pille(st, tx("l_feder"), WARN), pl = pille(st, tx("l_luft"), LUFT), pz = pille(st, tx("l_zu"), WARN, { klasse: "gross" }), pr = pille(st, tx("l_frei"), GRUEN, { klasse: "gross" });
      uhr(T0, ch.dauer, function (t) {
        const pF = t < 22 ? 0 : t < 32 ? glatt((t - 22) / 10) : 1, r = Z.k.setze(0, pF);
        platz(pt, 300, 300, fenster(t, 2, ch.dauer - 1, 0.5));
        platz(pf, Z.fx, 330, fenster(t, 3.5, ch.dauer - 1, 0.5));
        platz(pl, Z.fx, 720, fenster(t, 23, ch.dauer - 1, 0.5));
        platz(pz, 540, 900, fenster(t, 8, 23, 0.5) * (r.gebremst ? 1 : 0));
        platz(pr, 540, 900, fenster(t, 31, ch.dauer - 1, 0.5));
      });
    }

    /* ---------- K2: Membranteil und Federteil ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), Z = zyl(st);
      const pm = pille(st, tx("l_membran"), LUFT), pfe = pille(st, tx("l_federteil"), WARN), pb = pille(st, tx("l_betrieb"), GOLD, { klasse: "gross" }), pfs = pille(st, tx("l_fest"), WARN, { klasse: "gross" }), pe = pille(st, tx("l_entlueftet"), WARN);
      const foto = window.LKW_FOTO.karte(st, "federspeicher", tx("f_feder"), tx("l_foto"));
      uhr(T0, ch.dauer, function (t) {
        foto.setze(fenster(t, 0.8, 10.0, 0.7));
        const pF = t < 30 ? 1 : t < 40 ? 1 - glatt((t - 30) / 10) : t < 52 ? 0 : t < 62 ? glatt((t - 52) / 10) : 1;
        const pM = t < 12 ? 0 : t < 18 ? glatt((t - 12) / 6) : t < 24 ? 1 : t < 28 ? 1 - glatt((t - 24) / 4) : 0;
        Z.k.setze(pM, pF);
        platz(pm, Z.mx, 330, fenster(t, 3.5, ch.dauer - 1, 0.5)); platz(pfe, Z.fx, 330, fenster(t, 7, ch.dauer - 1, 0.5));
        platz(pb, 540, 900, fenster(t, 13, 28, 0.5)); platz(pfs, 540, 900, fenster(t, 33, ch.dauer - 1, 0.5));
        platz(pe, Z.fx, 720, fenster(t, 32, 50, 0.5));
      });
    }

    /* ---------- K3: Druckverlust ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), Z = zyl(st), g = Z.B.ueber;
      const bx = 130, by = 170, bw = 820, bh = 44;
      PN.text(g, tx("l_druck"), bx, by - 18, { anker: "start", gr: 28, fett: true });
      el("rect", { x: bx, y: by, width: bw, height: bh, rx: 10, fill: "#2B3631", stroke: PN.C.stahl, "stroke-width": 5 }, g);
      const fuell = el("rect", { x: bx + 3, y: by + 3, width: 0, height: bh - 6, rx: 7, fill: LUFT, opacity: 0.9 }, g);
      const mk = M.FEDER.haltedruck, mx = bx + 3 + (bw - 6) * mk;
      el("line", { x1: mx, y1: by - 10, x2: mx, y2: by + bh + 10, stroke: WARN, "stroke-width": 5, "stroke-dasharray": "8 6" }, g);
      const pg = pille(st, tx("l_zieht_zu"), WARN), pk = pille(st, tx("l_leck"), WARN), pa = pille(st, tx("l_aufbau"), GRUEN), pz = pille(st, tx("l_bremst_selbst"), WARN, { klasse: "gross" }), ps = pille(st, tx("l_gespannt"), GRUEN, { klasse: "gross" });
      const druck = (t) => t < 8 ? 1 : t < 40 ? Math.exp(-(t - 8) / 9) : t < 44 ? Math.exp(-32 / 9) * (1 - glatt((t - 40) / 4)) : t < 56 ? glatt((t - 44) / 12) : 1;
      uhr(T0, ch.dauer, function (t) {
        const pF = druck(t), r = Z.k.setze(0, pF);
        fuell.setAttribute("width", f((bw - 6) * pF));
        platz(pg, mx, 330, fenster(t, 17, 40, 0.5)); platz(pk, 540, 780, fenster(t, 9, 17, 0.5));
        platz(pz, 540, 900, fenster(t, 24, 42, 0.5) * (r.gebremst ? 1 : 0)); platz(pa, 540, 780, fenster(t, 45, ch.dauer - 1, 0.5)); platz(ps, 540, 900, fenster(t, 57, ch.dauer - 1, 0.5));
      });
    }

    /* ---------- K4: Merke ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true), Z = zyl(st);
      uhr(T0, ch.dauer, function (t) { Z.k.setze(0, t < 8 ? 1 : t < 14 ? 1 - glatt((t - 8) / 6) : 0); });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4 };
    const starts = P.starts;
    T.kapitel.forEach((ch, i) => { const sc = o.scenes[i], T0 = starts[i]; bauer[ch.id](sc, i, T0, ch); P.sceneFade(sc, T0, ch.dauer); });
    return { starts: starts, gesamt: P.gesamt, refit: function () {} };
  }
  window.LKWSzenen = { bauen: bauen };
})(window);

})(W);

// ---- kern/host.js ----
/* App-Teil der Lkw-Erklärfilme (wird von bauen.mjs mit den Film-Quellen zu verkehr/lkw-<film>.js gebündelt).
   starte(platz, { sprache }) -> { zerstoeren, zustand, zeitleiste, gesamt }
     sprache  Sprachcode der App (de, tr, en, ar, …); fehlt ein Satz in der Sprache, erscheint Deutsch
   Voraussetzung: GSAP ist als window.gsap geladen (vendor/gsap-3.14.2.min.js). */
const RTL_SPRACHEN = ["ar", "ckb", "ur", "fa", "ps"];
const BARLOW_SPRACHEN = ["ar", "ckb", "ur", "hi", "fa", "ps", "el", "am", "ti"];   // Playfair hat diese Schriften nicht
const SVG = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  neu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6.5 12 11V8a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8z"/></svg>'
};

export function starte(platz, opt) {
  opt = opt || {};
  const lang = opt.sprache || "de";
  const T = W.FILM_TEXT, DE = T.de, FREMD = (W.FILM_SPRACHEN || {})[lang] || {};
  const tx = (k) => FREMD[k] || DE[k] || k;
  const rtl = RTL_SPRACHEN.indexOf(lang) >= 0;
  
  if (!document.getElementById("lk-css")) { const s = document.createElement("style"); s.id = "lk-css"; s.textContent = CSS; document.head.appendChild(s); }
  const el = (tag, cls, text) => { const d = document.createElement(tag); if (cls) d.className = cls; if (text != null) d.textContent = text; return d; };

  const wurzel = el("section", "lk" + (rtl ? " lk-rtl" : "") + (BARLOW_SPRACHEN.indexOf(lang) >= 0 ? " lk-barlow" : "")); wurzel.lang = lang;
  wurzel.setAttribute("aria-label", tx("titel"));
  wurzel.appendChild(el("h2", "lk-kopf", tx("ui_ueber")));
  wurzel.appendChild(el("p", "lk-intro", tx("ui_intro")));
  const kasten = el("div", "lk-kasten"), szenenBox = el("div", "lk-szenen");
  szenenBox.setAttribute("aria-hidden", "true");   // der Film ist Bild; den Text liest man unten (Liste) oder im Bild
  const scenes = T.kapitel.map(() => { const s = el("section", "scene"); szenenBox.appendChild(s); return s; });
  kasten.appendChild(szenenBox);

  // Steuerung (unter dem Bild, nie auf dem Bild)
  const steuer = el("div", "lk-steuer"), reihe = el("div", "lk-reihe");
  const playKnopf = el("button", "lk-knopf lk-play"); playKnopf.type = "button";
  const neuKnopf = el("button", "lk-knopf"); neuKnopf.type = "button"; neuKnopf.innerHTML = SVG.neu + "<span></span>"; neuKnopf.lastChild.textContent = tx("ui_neu");
  const zeitEl = el("span", "lk-zeit");
  reihe.appendChild(playKnopf); reihe.appendChild(neuKnopf); reihe.appendChild(zeitEl);
  const regler = el("input", "lk-regler"); regler.type = "range"; regler.min = 0; regler.step = 1; regler.value = 0;
  regler.setAttribute("aria-label", tx("titel"));
  const kapZeile = el("div", "lk-kapitel"); kapZeile.setAttribute("role", "group"); kapZeile.setAttribute("aria-label", tx("ui_kapitel"));
  const kapKnoepfe = T.kapitel.map((ch, i) => { const b = el("button", "lk-kap", String(i + 1)); b.type = "button"; b.setAttribute("aria-label", tx("ui_kapitel") + " " + (i + 1) + ": " + tx(ch.titel)); kapZeile.appendChild(b); return b; });
  steuer.appendChild(reihe); steuer.appendChild(regler); steuer.appendChild(kapZeile);
  kasten.appendChild(steuer);
  wurzel.appendChild(kasten);

  // Gesamter Text als Liste (Lesen im eigenen Tempo, Bildschirmleser, Übersetzungskontrolle)
  const det = el("details", "lk-text"), sum = el("summary", "", tx("ui_lesen")); det.appendChild(sum);
  T.kapitel.forEach((ch) => {
    det.appendChild(el("h3", "", tx(ch.titel)));
    const zeilen = [];
    if (ch.sub) zeilen.push([ch.sub.k]);
    if (ch.intro) zeilen.push([ch.intro.k]);
    (ch.stufen || []).forEach((s) => { zeilen.push([s.name]); zeilen.push([s.text, s.ref]); zeilen.push([s.plus]); });
    (ch.punkte || []).forEach((p) => zeilen.push([p.k, p.ref]));
    if (ch.merk) zeilen.push([ch.merk.k]);
    zeilen.forEach((z) => { const p = el("p", "", tx(z[0])); if (z[1]) p.appendChild(el("span", "lk-ref", " (" + z[1] + ")")); det.appendChild(p); });
  });
  wurzel.appendChild(det);
  platz.appendChild(wurzel);

  // Zeitleiste
  const tl = gsap.timeline({ paused: true });
  const r = W.LKWSzenen.bauen({ tl: tl, T: T, tx: tx, scenes: scenes });
  const gesamt = r.gesamt, POSTER = r.starts[0] + (T.poster != null ? T.poster : 6);   // Standbild vor dem Start
  regler.max = Math.round(gesamt * 10);
  const mmss = (s) => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  let begonnen = false;
  function knopfText() {
    const spielt = !tl.paused() && tl.progress() < 1;
    const txt = spielt ? tx("ui_pause") : (begonnen && tl.progress() < 1 ? tx("ui_weiter") : tx("ui_start"));
    playKnopf.innerHTML = (spielt ? SVG.pause : SVG.play) + "<span></span>"; playKnopf.lastChild.textContent = txt;
  }
  function anzeigen() {
    const t = tl.time();
    zeitEl.textContent = mmss(t) + " / " + mmss(gesamt);
    regler.value = Math.round(t * 10);
    let k = 0; r.starts.forEach((s, i) => { if (t >= s - 0.01) k = i; });
    kapKnoepfe.forEach((b, i) => { if (i === k) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  }
  tl.eventCallback("onUpdate", anzeigen);
  tl.eventCallback("onComplete", knopfText);
  tl.time(POSTER); tl.pause();
  if (opt.zustand) {                       // Seite wurde neu gezeichnet: dort weitermachen, wo der Film war
    begonnen = !!opt.zustand.begonnen; tl.time(opt.zustand.zeit || POSTER);
    if (opt.zustand.spielt) tl.play();
  }
  anzeigen(); knopfText();

  playKnopf.addEventListener("click", () => {
    if (!tl.paused() && tl.progress() < 1) { tl.pause(); }
    else if (!begonnen || tl.progress() >= 1) { begonnen = true; tl.restart(); }   // erster Start und Wiederholung: von vorn
    else tl.play();
    knopfText();
  });
  neuKnopf.addEventListener("click", () => { begonnen = true; tl.restart(); knopfText(); });
  regler.addEventListener("input", () => { tl.pause(); begonnen = true; tl.time(Number(regler.value) / 10); anzeigen(); knopfText(); });
  kapKnoepfe.forEach((b, i) => b.addEventListener("click", () => { begonnen = true; tl.time(r.starts[i] + 0.9); tl.play(); anzeigen(); knopfText(); }));

  // Bühne auf die Breite des Containers skalieren; ab ~660 px Text neben das Bild
  function groesse() {
    wurzel.classList.toggle("lk-breit", kasten.clientWidth >= 660);
    const w = scenes[0].querySelector(".stagewrap");
    if (w && w.clientWidth) szenenBox.style.setProperty("--lk-s", String(w.clientWidth / 1080));
  }
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(groesse) : null;
  if (ro) ro.observe(kasten); else window.addEventListener("resize", groesse);
  groesse();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { r.refit(); groesse(); });
  // Außerhalb des Bildschirms anhalten (kostet sonst Akku)
  const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((e) => { if (e[0] && !e[0].isIntersecting && !tl.paused()) { tl.pause(); knopfText(); } }, { threshold: 0.05 }) : null;
  if (io) io.observe(wurzel);

  return {
    zerstoeren: function () {
      tl.kill(); if (ro) ro.disconnect(); else window.removeEventListener("resize", groesse); if (io) io.disconnect();
      if (wurzel.parentNode) wurzel.parentNode.removeChild(wurzel);
    },
    zustand: function () { return { zeit: tl.time(), spielt: !tl.paused() && tl.progress() < 1, begonnen: begonnen }; },
    zeitleiste: tl, gesamt: gesamt
  };
}
