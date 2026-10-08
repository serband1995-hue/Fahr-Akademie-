/* GENERIERT von film/lkw/bauen.mjs – nicht von Hand ändern (Quellen: film/lkw/kern/*, film/lkw/f5-2/*).
   Erklärfilm „f5-2“ für „Lkw und Zug verstehen“: Animation läuft live (GSAP) und wird aus dem Rechenmodell gezeichnet, nur der Text wechselt je Sprache. Keine Videodatei.
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
  const ABBIEGEN = { R: 10.75, S0: 32, dt: 0.05, yb: 2.4, vb: 4.0, xb0: 9, s0: 9, v0: 5.0, v1: 3.5, ta: 2.0, vSchritt: 1.8, sBremse: 21.7, aBremse: 1.5, stopp: 0.35 };
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
  function sichtPolygone(fz) {
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
      const k = SICHT.he / (SICHT.he - o.h), ex = (p, f) => ({ x: sf.auge.x + f * (p.x - sf.auge.x), y: sf.auge.y + f * (p.y - sf.auge.y) });
      const dA = Math.hypot(o.A.x - sf.auge.x, o.A.y - sf.auge.y), dB = Math.hypot(o.B.x - sf.auge.x, o.B.y - sf.auge.y), far = 12;
      out.scheibe.push({ id: o.id, pts: [ex(o.A, k), ex(o.B, k), ex(o.B, Math.max(k, far / dB)), ex(o.A, Math.max(k, far / dA))] });
    });
    return out;
  }

  const api = { lenkdauerBei: lenkdauerBei, pruefeTag: pruefeTag, pruefeWochen: pruefeWochen, folgefahrt: folgefahrt, FAHRZEUGE: FAHRZEUGE, bahn: bahn, simuliere: simuliere, koerper: koerper, rechteck: rechteck, maxUeberschnitt: maxUeberschnitt, gesamtLaenge: gesamtLaenge, radien: radien, vorderachsRadius: vorderachsRadius, innenRadius: innenRadius, abstandLinks: abstandLinks, folge: folge, SICHT: SICHT, sichtfeld: sichtfeld, insFahrzeug: insFahrzeug, polyAbstand: polyAbstand, verdecktVorn: verdecktVorn, radfahrerAbbiegen: radfahrerAbbiegen, ABBIEGEN: ABBIEGEN, sichtPolygone: sichtPolygone };
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
  window.LKW_SEITE = { szene: szene, bus: bus, lkw: lkw, pkw: pkw, klammer: klammer };
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

// ---- f5-2/text.js ----
(function (window) {
/* Film 5.2 „Toter Winkel“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Norm: § 9 Abs. 3 und Abs. 6 StVO (Wortlaut gelesen am 08.10.2026 über buzer.de, Fassung V. v. 20.04.2020; ❓ vor Veröffentlichung gegen gesetze-im-internet.de prüfen).
   Die Sichtfelder im Bild sind ein VEREINFACHTES Modell (kern/modell.js, sichtfeld): Haupt- und Weitwinkelspiegel, Scheiben, kein Frontspiegel, keine Kamera.
   Die Abbiegeszene (Radfahrer, Lkw) kommt aus kern/modell.js (radfahrerAbbiegen) mit Tests. Keine Zahlen im Bild außer 3,5 t. */
window.FILM_TEXT = {
  film: "lkw-f5-2",
  poster: 40,
  de: {
    titel: "Toter Winkel",
    ui_ueber: "Überblick: der tote Winkel beim Lkw",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Von der Seite", k1_titel: "Der Fahrer sitzt hoch", k1_sub: "Vereinfachte Zeichnung eines Lkw.",
    k1_p1: "Die Augen des Fahrers sind weit über der Straße.",
    k1_p2: "Das Fahrerhaus verdeckt den Boden direkt vor dem Lkw.",
    k1_p3: "Direkt vor dem Lkw kann ein Kind ganz verdeckt sein.",
    k1_p4: "Je weiter weg es steht, desto eher siehst du es.",
    l_auge: "Auge des Fahrers", l_boden: "Boden verdeckt", l_kind_weg: "Kind verdeckt", l_kind_da: "Kind sichtbar",

    k2_kicker: "Von oben", k2_titel: "Spiegel zeigen nicht alles", k2_sub: "Beispiel mit Haupt- und Weitwinkelspiegel, ohne Frontspiegel.",
    k2_p1: "Die Spiegel zeigen die Seiten und den Bereich hinter dem Fahrerhaus.",
    k2_p2: "Durch die Scheiben sieht der Fahrer nach vorn und etwas zur Seite.",
    k2_p3: "Dazwischen bleiben Flächen ohne Sicht: der tote Winkel.",
    k2_p4: "Rechts neben und vor dem Fahrerhaus ist er besonders groß.",
    k2_p5: "Auch direkt hinter dem Lkw ist ein Bereich verdeckt.",
    l_spiegel: "Spiegel", l_scheibe: "Blick durch die Scheibe", l_toter: "Toter Winkel", l_rechts: "Rechts neben dem Fahrerhaus", l_hinten: "Hinter dem Lkw", l_vorn: "Vor dem Fahrerhaus",

    k3_kicker: "Rechts abbiegen", k3_titel: "Der Radfahrer neben dem Lkw", k3_sub: "Der Lkw biegt rechts ab. Ein Radfahrer fährt geradeaus.",
    k3_p1: "Der Radfahrer fährt rechts neben dem Lkw.",
    k3_p2: "Zuerst sieht der Fahrer ihn im Spiegel und durch die Seitenscheibe.",
    k3_p3: "Jetzt liegt der Radfahrer im toten Winkel.",
    k3_p4: "Der Fahrer biegt ab, ohne noch einmal zu schauen.",
    k3_p5: "Der Lkw schwenkt in den Radstreifen. Der Radfahrer ist in Gefahr.",
    l_sp_sicht: "Im Spiegel zu sehen", l_sch_sicht: "Durch die Scheibe zu sehen", l_verdeckt: "Im toten Winkel", l_gefahr: "Gefahr!",

    k4_kicker: "So geht es richtig", k4_titel: "Warten und durchlassen", k4_sub: "Dieselbe Situation, jetzt richtig.",
    k4_p1: "Radfahrer, die neben dir geradeaus fahren, musst du durchfahren lassen.",
    k4_p2: "Der Fahrer schaut in den Spiegel und sieht den Radfahrer.",
    k4_p3: "Er hält an. Der Radfahrer fährt vorbei.",
    k4_p4: "Erst wenn der Weg frei ist, biegt er ab, langsam im Schritttempo.",
    k4_p5: "Mit einem Lkw über 3,5 t musst du innerorts beim Rechtsabbiegen Schrittgeschwindigkeit fahren, wenn mit Radverkehr oder querenden Fußgängern zu rechnen ist.",
    l_warten: "Warten",

    k5_kicker: "Merke", k5_titel: "Zum Mitnehmen",
    k5_merk: "Vor dem Abbiegen in den Spiegel schauen, Radfahrer durchlassen, innerorts mit Lkw über 3,5 t Schritttempo."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 44, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.5 }, { k: "k1_p2", t: 11.0 }, { k: "k1_p3", t: 24.5 }, { k: "k1_p4", t: 32.0 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 64, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 4.0 }, { k: "k2_p2", t: 14.0 }, { k: "k2_p3", t: 24.0 }, { k: "k2_p4", t: 36.0 }, { k: "k2_p5", t: 48.0 }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 52, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 1.8 }, { k: "k3_p2", t: 7.6 }, { k: "k3_p3", t: 19.0 }, { k: "k3_p4", t: 25.0 }, { k: "k3_p5", t: 33.0, stil: "gold" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 64, sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 2.0, ref: "§ 9 Abs. 3 StVO" }, { k: "k4_p2", t: 9.0 }, { k: "k4_p3", t: 16.0 }, { k: "k4_p4", t: 33.5 }, { k: "k4_p5", t: 44.0, ref: "§ 9 Abs. 6 StVO", stil: "gold" }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 18, merk: { k: "k5_merk", t: 1.2 } }
  ]
};

})(W);

W.FILM_SPRACHEN = {"en":{"titel":"Blind spot","ui_ueber":"Overview: the truck blind spot","ui_intro":"A short film without sound: everything is shown as text on screen. You can pause at any time or pick a chapter.","ui_start":"Start film","ui_pause":"Pause","ui_weiter":"Resume","ui_neu":"Restart","ui_kapitel":"Chapters","ui_lesen":"Read the full text","k1_kicker":"From the side","k1_titel":"The driver sits high","k1_sub":"Simplified drawing of a truck.","k1_p1":"The driver's eyes are far above the road.","k1_p2":"The cab hides the ground right in front of the truck.","k1_p3":"A child right in front of the truck can be completely hidden.","k1_p4":"The farther away it stands, the sooner you see it.","l_auge":"Driver's eye","l_boden":"Ground hidden","l_kind_weg":"Child hidden","l_kind_da":"Child visible","k2_kicker":"From above","k2_titel":"Mirrors do not show everything","k2_sub":"Example with main and wide-angle mirror, without front mirror.","k2_p1":"The mirrors show the sides and the area behind the cab.","k2_p2":"Through the windows the driver sees ahead and a little to the side.","k2_p3":"In between are areas with no view: the blind spot.","k2_p4":"To the right of and in front of the cab it is especially large.","k2_p5":"An area directly behind the truck is also hidden.","l_spiegel":"Mirror","l_scheibe":"View through window","l_toter":"Blind spot","l_rechts":"Right of the cab","l_hinten":"Behind the truck","l_vorn":"In front of the cab","k3_kicker":"Turning right","k3_titel":"The cyclist next to the truck","k3_sub":"The truck turns right. A cyclist rides straight ahead.","k3_p1":"The cyclist rides to the right of the truck.","k3_p2":"At first the driver sees the cyclist in the mirror and through the side window.","k3_p3":"Now the cyclist is in the blind spot.","k3_p4":"The driver turns without looking once more.","k3_p5":"The truck swings into the bike lane. The cyclist is in danger.","l_sp_sicht":"Visible in mirror","l_sch_sicht":"Visible through window","l_verdeckt":"In the blind spot","l_gefahr":"Danger!","k4_kicker":"This is how it's done right","k4_titel":"Wait and let them pass","k4_sub":"The same situation, now done right.","k4_p1":"You must let cyclists who ride straight ahead next to you pass.","k4_p2":"The driver looks in the mirror and sees the cyclist.","k4_p3":"He stops. The cyclist rides past.","k4_p4":"Only when the way is clear does he turn, slowly at walking speed.","k4_p5":"With a truck over 3.5 t, you must drive at walking speed when turning right in built-up areas if you must expect cyclists or crossing pedestrians.","l_warten":"Wait","k5_kicker":"Remember","k5_titel":"Take-away","k5_merk":"Look in the mirror before turning, let cyclists pass, and in built-up areas drive at walking speed with a truck over 3.5 t."},"sr":{"titel":"Mrtvi ugao","ui_ueber":"Pregled: mrtvi ugao kod kamiona","ui_intro":"Kratak film bez zvuka: sve piše na ekranu. Možeš da zaustaviš film ili da izabereš poglavlje kad god želiš.","ui_start":"Pokreni film","ui_pause":"Zaustavi","ui_weiter":"Nastavi","ui_neu":"Od početka","ui_kapitel":"Poglavlja","ui_lesen":"Pročitaj ceo tekst","k1_kicker":"Sa strane","k1_titel":"Vozač sedi visoko","k1_sub":"Pojednostavljen crtež kamiona.","k1_p1":"Oči vozača su visoko iznad puta.","k1_p2":"Kabina zaklanja tlo odmah ispred kamiona.","k1_p3":"Dete odmah ispred kamiona može biti potpuno zaklonjeno.","k1_p4":"Što je dalje, to ćeš ga pre videti.","l_auge":"Oko vozača","l_boden":"Tlo zaklonjeno","l_kind_weg":"Dete zaklonjeno","l_kind_da":"Dete vidljivo","k2_kicker":"Odozgo","k2_titel":"Ogledala ne pokazuju sve","k2_sub":"Primer sa glavnim ogledalom i ogledalom širokog ugla, bez prednjeg ogledala.","k2_p1":"Ogledala pokazuju strane i prostor iza kabine.","k2_p2":"Kroz stakla vozač vidi napred i malo u stranu.","k2_p3":"Između ostaju površine bez vidljivosti: mrtvi ugao.","k2_p4":"Desno pored kabine i ispred nje on je posebno velik.","k2_p5":"I neposredno iza kamiona jedan prostor je zaklonjen.","l_spiegel":"Ogledalo","l_scheibe":"Pogled kroz staklo","l_toter":"Mrtvi ugao","l_rechts":"Desno od kabine","l_hinten":"Iza kamiona","l_vorn":"Ispred kabine","k3_kicker":"Skretanje udesno","k3_titel":"Biciklista pored kamiona","k3_sub":"Kamion skreće udesno. Biciklista vozi pravo.","k3_p1":"Biciklista vozi desno pored kamiona.","k3_p2":"Prvo ga vozač vidi u ogledalu i kroz bočno staklo.","k3_p3":"Sada je biciklista u mrtvom uglu.","k3_p4":"Vozač skreće, a da ne pogleda još jednom.","k3_p5":"Kamion zalazi u biciklističku traku. Biciklista je u opasnosti.","l_sp_sicht":"Vidi se u ogledalu","l_sch_sicht":"Vidi se kroz staklo","l_verdeckt":"U mrtvom uglu","l_gefahr":"Opasnost!","k4_kicker":"Ovako je ispravno","k4_titel":"Čekaj i propusti","k4_sub":"Ista situacija, sada ispravno.","k4_p1":"Biciklistu koji vozi pravo pored tebe moraš da propustiš.","k4_p2":"Vozač pogleda u ogledalo i vidi biciklistu.","k4_p3":"Zaustavi se. Biciklista prolazi.","k4_p4":"Tek kada je put slobodan, skreće, polako, brzinom hoda (korak).","k4_p5":"Kamionom preko 3,5 t moraš u naselju pri skretanju udesno da voziš brzinom hoda (korak), ako treba računati na bicikliste ili pešake koji prelaze put.","l_warten":"Čekaj","k5_kicker":"Zapamti","k5_titel":"Za poneti","k5_merk":"Pre skretanja pogledaj u ogledalo, propusti bicikliste, u naselju kamionom preko 3,5 t vozi brzinom hoda (korak)."},"tr":{"titel":"Ölü açı","ui_ueber":"Genel bakış: kamyonda ölü açı","ui_intro":"Sessiz kısa bir film: Her şey görüntüde yazıyla yer alır. İstediğin zaman durdurabilir veya bir bölüm seçebilirsin.","ui_start":"Filmi başlat","ui_pause":"Durdur","ui_weiter":"Devam","ui_neu":"Baştan","ui_kapitel":"Bölümler","ui_lesen":"Metnin tamamını oku","k1_kicker":"Yandan","k1_titel":"Sürücü yüksekte oturur","k1_sub":"Bir kamyonun basitleştirilmiş çizimi.","k1_p1":"Sürücünün gözleri yolun çok üstündedir.","k1_p2":"Sürücü kabini, kamyonun hemen önündeki zemini gizler.","k1_p3":"Kamyonun hemen önündeki bir çocuk tamamen gizlenebilir.","k1_p4":"Ne kadar uzakta durursa, onu o kadar erken görürsün.","l_auge":"Sürücünün gözü","l_boden":"Zemin görünmüyor","l_kind_weg":"Çocuk görünmüyor","l_kind_da":"Çocuk görünüyor","k2_kicker":"Yukarıdan","k2_titel":"Aynalar her şeyi göstermez","k2_sub":"Ana ayna ve geniş açılı ayna ile örnek, ön ayna yok.","k2_p1":"Aynalar yanları ve sürücü kabininin arkasındaki alanı gösterir.","k2_p2":"Sürücü camlardan öne ve biraz yana doğru görür.","k2_p3":"Arada görüş olmayan alanlar kalır: ölü açı.","k2_p4":"Sürücü kabininin sağında ve önünde özellikle büyüktür.","k2_p5":"Kamyonun hemen arkasında da gizli bir alan vardır.","l_spiegel":"Ayna","l_scheibe":"Camdan görüş","l_toter":"Ölü açı","l_rechts":"Kabinin sağı","l_hinten":"Kamyonun arkası","l_vorn":"Kabinin önü","k3_kicker":"Sağa dönüş","k3_titel":"Kamyonun yanındaki bisikletli","k3_sub":"Kamyon sağa dönüyor. Bir bisikletli düz gidiyor.","k3_p1":"Bisikletli kamyonun sağında gidiyor.","k3_p2":"Sürücü onu önce aynada ve yan camdan görür.","k3_p3":"Şimdi bisikletli ölü açıda.","k3_p4":"Sürücü bir kez daha bakmadan döner.","k3_p5":"Kamyon bisiklet şeridine kayar. Bisikletli tehlikede.","l_sp_sicht":"Aynada görünüyor","l_sch_sicht":"Camdan görünüyor","l_verdeckt":"Ölü açıda","l_gefahr":"Tehlike!","k4_kicker":"Doğrusu böyle","k4_titel":"Bekle ve geçmesine izin ver","k4_sub":"Aynı durum, bu sefer doğru.","k4_p1":"Yanında düz giden bisikletlilerin geçmesine izin vermelisin.","k4_p2":"Sürücü aynaya bakar ve bisikletliyi görür.","k4_p3":"Durur. Bisikletli geçip gider.","k4_p4":"Yol ancak açıldığında yavaşça, yürüme hızıyla (adım hızı) döner.","k4_p5":"3,5 t üzeri bir kamyonla yerleşim yerinde sağa dönerken, bisikletlilerle veya yolu geçen yayalarla karşılaşma ihtimali varsa yürüme hızıyla (adım hızı) gitmelisin.","l_warten":"Bekle","k5_kicker":"Unutma","k5_titel":"Akılda kalsın","k5_merk":"Dönmeden önce aynaya bak, bisikletlilerin geçmesine izin ver, yerleşim yerinde 3,5 t üzeri kamyonla yürüme hızıyla (adım hızı) git."}};
// ---- f5-2/szenen.js ----
(function (window) {
/* Szenen des Films 5.2 „Toter Winkel“ – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Alles kommt aus dem Rechenmodell (kern/modell.js): Sichtfeld des Fahrers (sichtfeld, sichtPolygone, verdecktVorn) und die Abbiegeszene mit
   Radfahrer (radfahrerAbbiegen, Art A = ohne neuen Blick, Art B = warten und durchlassen). Die Szenen zeichnen nur; sie behaupten nichts, was das Modell nicht gerechnet hat.
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, SE = window.LKW_SEITE, F = BK.FARBE, el = BK.el, f = BK.f;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Toter Winkel" });
    const starts = P.starts, FZ = M.FAHRZEUGE.solo, SF = M.sichtfeld(FZ), POLY = M.sichtPolygone(FZ);
    const GRUEN = "#8FD6A6", WARN = "#FF9A5C", BLAU = "#7FC6E8", GOLD = F.gold;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); };
    function uhr(T0, dauer, zeichne) {
      const proxy = { t: 0 };
      tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0);
      zeichne(0);
    }
    const pille = (st, text, x, y, farbe, o2) => BK.pille(st, text, x, y, Object.assign({ punkt: farbe }, o2 || {}));
    const zeige = (p, a) => { p.style.opacity = a; };
    const pfad = (pts, s) => "M" + pts.map((p) => f(p.x * (s || 1)) + " " + f(p.y * (s || 1))).join(" L") + " Z";
    const interp = (kf, t) => {   // Zeitverlauf: Stützpunkte [[Filmzeit, Rechenzeit], ...], dazwischen linear
      if (t <= kf[0][0]) return kf[0][1];
      for (let i = 1; i < kf.length; i++) if (t <= kf[i][0]) { const a = kf[i - 1], b = kf[i]; return b[0] === a[0] ? b[1] : a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); }
      return kf[kf.length - 1][1];
    };

    /* ---------- Radfahrer von oben (Ursprung Mitte, x vorn) ---------- */
    function radfahrer(layer, W) {
      const g = el("g", null, layer), S = W.S;
      g.style.filter = "drop-shadow(0 " + (5 / S).toFixed(3) + "px " + (5 / S).toFixed(3) + "px rgba(0,0,0,.4))";
      const ring = el("ellipse", { cx: 0, cy: 0, rx: 1.35, ry: 0.85, fill: "none", stroke: WARN, "stroke-width": 0.1, opacity: 0, "stroke-dasharray": "0.3 0.2" }, g);
      el("rect", { x: -0.98, y: -0.07, width: 0.34, height: 0.14, rx: 0.06, fill: "#1B1D1A" }, g);   // Rücklicht-Seite nicht nötig: neutrales Rad hinten
      el("rect", { x: -1.0, y: -0.06, width: 0.38, height: 0.12, rx: 0.05, fill: "#23262A" }, g);
      el("rect", { x: 0.58, y: -0.06, width: 0.38, height: 0.12, rx: 0.05, fill: "#23262A" }, g);
      el("line", { x1: -0.7, y1: 0, x2: 0.75, y2: 0, stroke: "#B9BEC4", "stroke-width": 0.07, "stroke-linecap": "round" }, g);          // Rahmen
      el("line", { x1: 0.68, y1: -0.3, x2: 0.68, y2: 0.3, stroke: "#23262A", "stroke-width": 0.06, "stroke-linecap": "round" }, g);      // Lenker
      el("line", { x1: 0.05, y1: -0.2, x2: 0.66, y2: -0.28, stroke: "#59A8A0", "stroke-width": 0.1, "stroke-linecap": "round" }, g);      // Arme
      el("line", { x1: 0.05, y1: 0.2, x2: 0.66, y2: 0.28, stroke: "#59A8A0", "stroke-width": 0.1, "stroke-linecap": "round" }, g);
      el("ellipse", { cx: 0.02, cy: 0, rx: 0.17, ry: 0.3, fill: "#59A8A0", stroke: "#2E6B66", "stroke-width": 0.04 }, g);                 // Schultern
      el("circle", { cx: 0.2, cy: 0, r: 0.15, fill: "#F2C16E", stroke: "#8F5A14", "stroke-width": 0.04 }, g);                              // Kopf mit Helm (ohne Gesicht)
      return { g: g, setze: function (x, y) { const p = W.px(x, y); g.setAttribute("transform", "translate(" + f(p[0]) + " " + f(p[1]) + ") scale(" + S + ")"); }, ring: ring };
    }
    // Sichtfelder (Spiegelkeile blau, Blick durch die Scheibe grün) in Fahrzeugkoordinaten; die Gruppe wird mit dem Lkw bewegt
    function sichtGruppe(layer, W, az) {
      const g = el("g", { opacity: 0 }, layer), gm = el("g", { opacity: 0 }, g), gs = el("g", { opacity: 0 }, g);
      POLY.scheibe.forEach((q) => el("path", { d: pfad(q.pts), fill: "rgba(143,214,166,.20)", stroke: "rgba(143,214,166,.55)", "stroke-width": 0.06 }, gs));
      POLY.spiegel.forEach((q) => el("path", { d: pfad(q.pts), fill: "rgba(127,198,232,.26)", stroke: "rgba(127,198,232,.65)", "stroke-width": 0.06 }, gm));
      return { g: g, spiegel: gm, scheibe: gs, setze: function (z) { const A = W.px(z.A.x, z.A.y); g.setAttribute("transform", "translate(" + f(A[0]) + " " + f(A[1]) + ") rotate(" + f(z.hz * BK.DEG) + ") scale(" + W.S + ")"); } };
    }
    const stat = (x, y) => ({ A: { x: x, y: y }, hz: 0, F: { x: x + FZ.L, y: y, h: 0 } });

    /* ---------- K1: Fahrer sitzt hoch (Seitenansicht, gerechnete Sichtlinie) ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const V = SE.szene(st, { S: 50, px0: 400, boden: 720 }); V.kamera(0);
      const lk = SE.lkw(V, 6.6); lk.setze(0, false, 0);
      const svg = V.gUeber.ownerSVGElement, defs = el("defs", null, svg);
      const pat = el("pattern", { id: "sch52", width: 0.3, height: 0.3, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
      el("rect", { width: 0.3, height: 0.3, fill: "rgba(237,174,79,.22)" }, pat); el("rect", { width: 0.12, height: 0.3, fill: "rgba(237,174,79,.8)" }, pat);
      const G = el("g", { transform: "translate(400 720) scale(50)" }, V.gUeber);
      const E = { x: SF.auge.x - FZ.L - FZ.vorn, y: -M.SICHT.he }, Q = { x: 0, y: -M.SICHT.hw }, H = { x: M.verdecktVorn(0), y: 0 };
      // Hatch unter der Sichtlinie: Boden, den der Fahrer nicht sieht
      const hatch = el("path", { d: "M0 -" + M.SICHT.hw + " L" + H.x + " 0 L0 0 Z", fill: "url(#sch52)", opacity: 0 }, G);
      const strahl = el("line", { x1: E.x, y1: E.y, x2: E.x, y2: E.y, stroke: GOLD, "stroke-width": 0.05, "stroke-dasharray": "0.22 0.16", "stroke-linecap": "round" }, G);
      const auge = el("g", { opacity: 0 }, G); el("circle", { cx: E.x, cy: E.y, r: 0.17, fill: F.creme, stroke: "#23262A", "stroke-width": 0.05 }, auge); el("circle", { cx: E.x + 0.04, cy: E.y, r: 0.07, fill: "#23262A" }, auge);
      // Kind (ohne Gesicht), 1,2 m
      const kind = el("g", { opacity: 0 }, G), HK = 1.2, kf = "#F2C16E";
      el("rect", { x: -0.11, y: -0.5, width: 0.07, height: 0.5, rx: 0.03, fill: kf }, kind); el("rect", { x: 0.04, y: -0.5, width: 0.07, height: 0.5, rx: 0.03, fill: kf }, kind);
      el("rect", { x: -0.16, y: -0.98, width: 0.32, height: 0.52, rx: 0.1, fill: kf }, kind); el("circle", { cx: 0, cy: -(HK - 0.14), r: 0.14, fill: kf }, kind);
      const geist = el("rect", { x: -0.3, y: -HK - 0.08, width: 0.6, height: HK + 0.16, rx: 0.2, fill: "none", stroke: WARN, "stroke-width": 0.05, "stroke-dasharray": "0.14 0.1" }, kind);
      const pa = pille(st, tx("l_auge"), 230, 400, F.creme), pb = pille(st, tx("l_boden"), 720, 330, GOLD), pk1 = pille(st, tx("l_kind_weg"), 0, 0, WARN), pk2 = pille(st, tx("l_kind_da"), 0, 0, GRUEN);
      const xE = V.px(E.x), yE = 720 + E.y * 50, ln = BK.leitlinie(V, 230, 436, xE, yE, F.creme), lb = BK.leitlinie(V, 700, 366, V.px(1.9), 700, GOLD);
      const xk = (t) => t < 14 ? 14 : t < 26 ? 14 - 13.4 * (t - 14) / 12 : t < 33.5 ? 0.6 : t < 41 ? 0.6 + 7.4 * (t - 33.5) / 7.5 : 8;
      uhr(T0, ch.dauer, function (t) {
        const u = klemme((t - 5) / 3);
        strahl.setAttribute("x2", f(E.x + (H.x - E.x) * u)); strahl.setAttribute("y2", f(E.y + (H.y - E.y) * u)); strahl.style.opacity = klemme((t - 5) / 0.5);
        auge.style.opacity = klemme((t - 3.5) / 0.6); zeige(pa, fenster(t, 3.8, 40, 0.5)); ln.style.opacity = fenster(t, 3.8, 40, 0.5);
        hatch.style.opacity = klemme((t - 11.5) / 1.2); zeige(pb, fenster(t, 12.5, 40, 0.5)); lb.style.opacity = fenster(t, 12.5, 40, 0.5);
        const x = xk(t), sichtbar = x >= M.verdecktVorn(1.2) - 1e-9;
        kind.setAttribute("transform", "translate(" + f(x) + " 0)"); kind.style.opacity = klemme((t - 13.5) / 0.6);
        geist.style.opacity = sichtbar ? 0 : 1;
        const px = V.px(x), py = 720 - HK * 50 - 120;
        pk1.style.left = pk2.style.left = f(Math.min(920, Math.max(px + 110, 580))) + "px"; pk1.style.top = pk2.style.top = f(py) + "px";
        zeige(pk1, t > 14 && !sichtbar ? klemme((t - 14) / 0.4) : 0); zeige(pk2, t > 14 && sichtbar ? klemme((t - 14) / 0.4) : 0);
      });
    }

    /* ---------- K2: Draufsicht, Sichtfelder und toter Winkel ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const W = BK.welt(st, { S: 28, ox: 392, oy: 540, fussOpazitaet: 0.9, id: "k2" });
      const fz = BK.fahrzeug(W.gFz, FZ, W); fz.setze(stat(0, 0), 0, false, 0);
      const sg = sichtGruppe(W.gBand, W); sg.setze(stat(0, 0)); sg.g.style.opacity = 1;
      // Toter Winkel: Boden, den keine Sichtquelle erreicht (Zellen 0,1 m, gerechnet mit sichtfeld.quelle)
      const ctx = W.ctx, cell = 0.1, c = W.S * cell + 1;
      ctx.fillStyle = W.muster;
      for (let x = -13; x <= 16; x += cell) for (let y = -7; y <= 7; y += cell) if (SF.quelle(x, y, 0) === null) { const q = W.px(x, y); ctx.fillRect(q[0], q[1], c, c); }
      W.canvas.style.opacity = 0;
      const lp = (text, wx, wy, farbe, px, py) => { const q = W.px(wx, wy), e = pille(st, text, px, py, farbe), l = BK.leitlinie(W, px, py + (py < q[1] ? 34 : -34), q[0], q[1], farbe); return { e: e, l: l, an: (a) => { zeige(e, a); l.style.opacity = a; } }; };
      const pS = lp(tx("l_spiegel"), 5.02, 1.65, BLAU, 760, 760), pW = lp(tx("l_scheibe"), 8.0, -2.2, GRUEN, 760, 300);
      const pT = pille(st, tx("l_toter"), 540, 150, GOLD, { klasse: "gross" });
      const pR = lp(tx("l_rechts"), 7.0, 3.6, GOLD, 760, 900), pV = lp(tx("l_vorn"), 8.2, 0, GOLD, 760, 150), pH = lp(tx("l_hinten"), -8, 0, GOLD, 220, 400);
      uhr(T0, ch.dauer, function (t) {
        sg.spiegel.style.opacity = glatt((t - 5) / 1.5); sg.scheibe.style.opacity = glatt((t - 15) / 1.5);
        pS.an(fenster(t, 6, 24, 0.5)); pW.an(fenster(t, 16, 24, 0.5));
        W.canvas.style.opacity = 0.9 * glatt((t - 25) / 1.5);
        zeige(pT, fenster(t, 26, 36, 0.5)); pR.an(fenster(t, 37, ch.dauer - 1, 0.5)); pV.an(fenster(t, 37.5, ch.dauer - 1, 0.5)); pH.an(fenster(t, 49, ch.dauer - 1, 0.5));
      });
    }

    /* ---------- K3 / K4: Rechtsabbiegen mit Radfahrer (Rechenmodell radfahrerAbbiegen) ---------- */
    const OFF = 30;   // Rechenkoordinate x − OFF = Bühnenkoordinate (Kurvenanfang bei x = 2 m)
    function abbiegen(sc, i, T0, ch, art) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const W = BK.welt(st, { S: 36, ox: 540, oy: 380, raster: false, id: "k" + i });
      const R = M.radfahrerAbbiegen(art), fr = R.frames, dt = R.P.dt;
      const raster = st.querySelector(".raster"), base = el("g", null, null); raster.insertBefore(base, raster.firstChild);
      const X = (x) => W.px(x, 0)[0], Y = (y) => W.px(0, y)[1], px26 = W.S;
      // Straßenbild: Gras, Fahrbahnen, Radstreifen, Gehweg mit gerundeter Ecke (Radius 8 m), Markierungen
      const rc = 10, sx = 11, sw = 7;
      el("rect", { x: -3000, y: -1000, width: 7000, height: 4000, fill: "#34513A" }, base);
      el("rect", { x: X(-70), y: Y(-5.25), width: X(48) - X(-70), height: Y(1.75) - Y(-5.25), fill: "#4A524C" }, base);              // Hauptstraße (zwei Fahrstreifen)
      el("rect", { x: X(sx), y: Y(-5.25), width: sw * px26, height: 1200, fill: "#4A524C" }, base);                                   // Seitenstraße
      el("path", { d: "M" + X(sx - rc) + " " + Y(3.25) + " L" + X(sx) + " " + Y(3.25) + " L" + X(sx) + " " + Y(3.25 + rc) + " A" + rc * px26 + " " + rc * px26 + " 0 0 0 " + X(sx - rc) + " " + Y(3.25) + " Z", fill: "#4A524C" }, base);   // Ausrundung
      el("rect", { x: X(-70), y: Y(1.75), width: X(48) - X(-70), height: (1.5) * px26, fill: "#8E5A4E" }, base);                         // Radstreifen
      const gw = el("path", { d: "M" + X(-70) + " " + Y(4.375) + " L" + X(sx - rc) + " " + Y(4.375) + " A" + (rc - 1.125) * px26 + " " + (rc - 1.125) * px26 + " 0 0 1 " + X(sx - 1.125) + " " + Y(3.25 + rc) + " L" + X(sx - 1.125) + " 1200", fill: "none", stroke: "#8A8F88", "stroke-width": 2.25 * px26 }, base);   // Gehweg
      el("rect", { x: X(sx + sw), y: Y(3.25), width: 2.25 * px26, height: 1200, fill: "#8A8F88" }, base);                                // Gehweg Ostseite
      el("rect", { x: X(sx + sw), y: Y(3.25), width: X(48) - X(sx + sw), height: 2.25 * px26, fill: "#8A8F88" }, base);
      const strich = (x1, y1, x2, y2, d, w, c) => el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: c || "rgba(250,246,236,.85)", "stroke-width": w || 3, "stroke-dasharray": d || "none" }, base);
      strich(X(-70), Y(-1.75), X(sx), Y(-1.75), "26 22");                                  // Mittellinie Hauptstraße
      strich(X(sx + sw), Y(-1.75), X(48), Y(-1.75), "26 22");
      strich(X(-70), Y(1.75), X(sx - rc), Y(1.75), "none", 3);                             // Radstreifenlinie
      strich(X(sx + sw / 2), Y(5.5), X(sx + sw / 2), 1200, "26 22");                      // Mittellinie Seitenstraße
      // Hinweis „Radstreifen“: Fahrradsymbol (Piktogramm) kommt nicht vor; die Farbe zeigt ihn
      const lkw = BK.fahrzeug(W.gFz, FZ, W), rad = radfahrer(W.gFz, W), sg = sichtGruppe(W.gBand, W), pan = [base, W.gBand, W.gFz, W.gSpur, W.gUeber];
      const pLabel = pille(st, tx("l_sp_sicht"), 0, 0, GRUEN), pGefahr = pille(st, tx("l_gefahr"), 540, 930, WARN, { klasse: "gross" }), pWarten = pille(st, tx("l_warten"), 540, 960, F.creme, { klasse: "gross" });
      // stabile Sichtanzeige (nur wechseln, wenn der neue Zustand 0,5 s anhält)
      const stabil = []; { let akt = fr[0].sicht, kand = akt, seit = 0; fr.forEach((q, k) => { if (q.sicht !== kand) { kand = q.sicht; seit = 0; } else seit += dt; if (kand !== akt && seit >= 0.45) akt = kand; stabil.push(akt); }); }
      const kf = art === "A" ? [[0, 0], [4, 0], [13, 2.95], [19, 5.95], [24, 5.95], [25, 5.95], [36, R.frames[fr.length - 1].t], [ch.dauer, R.frames[fr.length - 1].t]]
        : [[0, 0], [4, 0], [16, 2.5], [25, 5.9], [33, R.losBei], [52, fr[fr.length - 1].t], [ch.dauer, fr[fr.length - 1].t]];
      uhr(T0, ch.dauer, function (t) {
        const idx = Math.max(0, Math.min(fr.length - 1, Math.round(interp(kf, t) / dt))), q = fr[idx], z = q.z;
        const zz = { A: { x: z.A.x - OFF, y: z.A.y }, hz: z.hz, F: { x: z.F.x - OFF, y: z.F.y, h: z.F.h } };
        const bl = Math.floor(t * 2.5) % 2 === 0, brems = art === "A" ? (idx > 0 && q.v < fr[Math.max(0, idx - 1)].v + 1e-9 && q.t < 2.0) : (q.t >= 2.5 && q.t < R.losBei - 0.3);
        const xc = Math.min(11, zz.F.x + 2), yc = Math.max(0, zz.F.y - 7), dxp = -xc * W.S, dyp = -yc * W.S;
        pan.forEach((g) => g.setAttribute("transform", "translate(" + f(dxp) + " " + f(dyp) + ")"));
        lkw.setze(zz, bl ? 1 : 0, brems, 0); sg.setze(zz);
        sg.g.style.opacity = 0.7 * glatt((t - 1.0) / 1.0); sg.spiegel.style.opacity = 1; sg.scheibe.style.opacity = 1;
        rad.setze(q.bx - OFF, q.by, 0);
        const sicht = stabil[idx], farbe = sicht === "verdeckt" ? WARN : GRUEN, txt = sicht === "spiegel" ? tx("l_sp_sicht") : sicht === "scheibe" ? tx("l_sch_sicht") : tx("l_verdeckt");
        pLabel.lastChild.nodeValue = txt; pLabel.querySelector("i").style.background = farbe; pLabel.style.borderColor = farbe;
        const pp = W.px(q.bx - OFF, q.by); pLabel.style.left = f(Math.max(290, Math.min(790, pp[0] + dxp))) + "px"; pLabel.style.top = f(pp[1] + dyp + 120) + "px"; const auf = pp[0] + dxp > 60 && pp[0] + dxp < 1020 && pp[1] + dyp > 0 && pp[1] + dyp < 1000;
        zeige(pLabel, auf ? glatt((t - 2) / 0.6) : 0);
        rad.ring.style.opacity = sicht === "verdeckt" && auf ? 0.6 + 0.4 * Math.sin(t * 6) : 0;
        const ende = art === "A" && R.kontakt && idx === fr.length - 1;
        zeige(pGefahr, art === "A" ? (ende ? fenster(t, 35, ch.dauer, 0.4) * (0.75 + 0.25 * Math.sin(t * 7)) : 0) : 0);
        zeige(pWarten, art === "B" ? fenster(t, 25.5, 32.5, 0.5) : 0);
      });
    }
    function K3(sc, i, T0, ch) { abbiegen(sc, i, T0, ch, "A"); }
    function K4(sc, i, T0, ch) { abbiegen(sc, i, T0, ch, "B"); }

    /* ---------- K5: Merke ---------- */
    function K5(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true);
      const W = BK.welt(st, { S: 26, ox: 364, oy: 540, raster: false, id: "k5" });
      const lkw = BK.fahrzeug(W.gFz, FZ, W); lkw.setze(stat(-5, 0), 1, false, 0);
      const sg = sichtGruppe(W.gBand, W); sg.setze(stat(-5, 0)); sg.g.style.opacity = 1; sg.spiegel.style.opacity = 1;
      const rad = radfahrer(W.gFz, W); rad.setze(3, 2.4, 0);
      uhr(T0, ch.dauer, function (t) { lkw.setze(stat(-5, 0), Math.floor(t * 2.5) % 2 === 0 ? 1 : 0, false, 0); });
    }

    const bauer = { k1: K1, k2: K2, k3: K3, k4: K4, k5: K5 };
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
