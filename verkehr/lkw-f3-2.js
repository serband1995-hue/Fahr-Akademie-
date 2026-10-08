/* GENERIERT von film/lkw/bauen.mjs – nicht von Hand ändern (Quellen: film/lkw/kern/*, film/lkw/f3-2/*).
   Erklärfilm „f3-2“ für „Lkw und Zug verstehen“: Animation läuft live (GSAP) und wird aus dem Rechenmodell gezeichnet, nur der Text wechselt je Sprache. Keine Videodatei.
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

W.LKW_FOTOS = {"sattelkupplung":"data:image/jpeg;base64,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"};
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

// ---- f3-2/text.js ----
(function (window) {
/* Film 3.2 „Abkuppeln“ (Sattelzug) – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Quelle der Schrittfolge: DGUV Information 214-080 „Kuppeln“ (Kap. 2.3.2 Absatteln), BG Verkehr „Abstellen und kuppeln“, Prüfungsablauf „Verbinden und Trennen“ Klasse CE, Theoriefrage 2.7.07-319.
   Recherche und Belege: Vault, Faktenblatt Film 3.2. Keine Zahlen im Bild (Vorziehen in cm und Absenken in cm stehen nur in einer Quelle und bleiben draußen). */
window.FILM_TEXT = {
  film: "lkw-f3-2",
  fotos: ["sattelkupplung"],
  poster: 60,
  de: {
    titel: "Abkuppeln eines Sattelzugs",
    l_foto: "Beispielbild, KI-erzeugt", f_sattel: "Die Sattelkupplung",
    ui_ueber: "Überblick: Abkuppeln eines Sattelzugs",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Abkuppeln", k1_titel: "Gestreckt abstellen", k1_sub: "Sattelzug: Der Zug steht gerade.",
    k1_p1: "Der Zug steht möglichst gestreckt.",
    k1_p2: "Vor der Zugmaschine bleibt Platz, um später gerade wieder anzukuppeln.",
    l_gestreckt: "Gestreckt", l_platz: "Platz zum geraden Ankuppeln",

    k1b_kicker: "Sichern", k1b_titel: "Erst sichern", k1b_sub: "Beide Feststellbremsen, dazu Keile.",
    k1b_p1: "Steht der Zug, wird zuerst die Feststellbremse der Zugmaschine betätigt.",
    k1b_p2: "Danach die des Aufliegers: roten Knopf ziehen.",
    k1b_p3: "Dazu kommen Unterlegkeile an einer starren Achse.",
    l_fest_zug: "Feststellbremse Zugmaschine", l_fest_auf: "Feststellbremse Auflieger", l_keile: "Unterlegkeile",

    k2_kicker: "Stützen", k2_titel: "Stützwinden ausfahren", k2_sub: "Der Auflieger muss danach sicher stehen.",
    k2_p1: "Die Stützwinden werden ausgefahren: bei Luftfederung, bis die Füße den Boden berühren, bei Blattfederung, bis die Federn der Zugmaschine entlastet sind.",
    k2_p2: "Der Boden muss tragen. Sonst werden die Füße unterbaut.",
    k2_p3: "Der Auflieger wird nicht von der Sattelkupplung abgehoben.",
    l_stuetzen: "Stützwinden aus", l_tragfaehig: "Boden trägt", l_nicht_abheben: "Nicht abheben",

    k3_kicker: "Leitungen", k3_titel: "Erst rot, dann gelb", k3_sub: "Vorratsleitung zuerst trennen.",
    k3_p1: "Zuerst wird rot getrennt: die Vorratsleitung.",
    k3_p2: "Dann kommt gelb: die Bremsleitung.",
    k3_p3: "Auch das Elektrokabel wird getrennt. Die Köpfe kommen in die Parkdosen.",
    k3_p4: "Beim Trennen von rot bremst der Anhänger selbsttätig. Das reicht zum Sichern nicht.",
    k3_p5: "Die Luft geht mit der Zeit verloren. Darum bleiben Feststellbremse und Keile.",
    l_rot_ab: "Rot ab: Vorratsleitung", l_gelb_ab: "Gelb ab: Bremsleitung", l_elektro_ab: "Elektrik ab", l_reicht_nicht: "Reicht nicht zum Sichern",

    k4_kicker: "Wegfahren", k4_titel: "Kupplung öffnen", k4_sub: "Langsam und gerade vorziehen.",
    k4_p1: "Die Sicherung der Sattelkupplung wird ausgehängt, die Kupplung geöffnet.",
    k4_p2: "Die Zugmaschine fährt langsam und gerade ein Stück vor.",
    k4_p3: "Bei Luftfederung wird sie dann etwas abgesenkt und fährt ganz heraus.",
    k4_p4: "So schlägt das Heck der Zugmaschine nicht hoch.",
    l_oeffnen: "Kupplung öffnen", l_vorziehen: "Gerade vorziehen", l_absenken: "Absenken, dann heraus",

    k5_kicker: "Merke", k5_titel: "Zum Mitnehmen",
    k5_merk: "Gestreckt abstellen, beide Feststellbremsen, Keile, Stützwinden aus. Erst rot, dann gelb ab. Rot allein sichert nicht."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 34, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.0, ref: "DGUV Information 214-080" }, { k: "k1_p2", t: 12.0, ref: "DGUV Information 214-080" }] },
    { id: "k1b", titel: "k1b_titel", kicker: "k1b_kicker", dauer: 50, sub: { k: "k1b_sub", t: 0.6 },
      punkte: [{ k: "k1b_p1", t: 3.0, ref: "DGUV Information 214-080" }, { k: "k1b_p2", t: 15.0 }, { k: "k1b_p3", t: 28.0 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 50, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5, ref: "DGUV Information 214-080" }, { k: "k2_p2", t: 22.0 }, { k: "k2_p3", t: 32.0 }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 74, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5, ref: "DGUV Information 214-080; Theoriefrage 2.7.07-319" }, { k: "k3_p2", t: 14.0 }, { k: "k3_p3", t: 24.0 }, { k: "k3_p4", t: 38.0, ref: "DGUV Information 214-080", stil: "gold" }, { k: "k3_p5", t: 54.0, ref: "DGUV Information 214-080", stil: "gold" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 70, sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 3.5, ref: "DGUV Information 214-080" }, { k: "k4_p2", t: 16.0 }, { k: "k4_p3", t: 30.0, ref: "DGUV Information 214-080" }, { k: "k4_p4", t: 46.0 }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 22, merk: { k: "k5_merk", t: 1.2 } }
  ]
};

})(W);

W.FILM_SPRACHEN = {"en":{"titel":"Uncoupling an articulated lorry","ui_ueber":"Overview: uncoupling an articulated lorry","ui_intro":"A short film without sound: everything is shown as text on screen. You can pause at any time or pick a chapter.","ui_start":"Start film","ui_pause":"Pause","ui_weiter":"Resume","ui_neu":"Restart","ui_kapitel":"Chapters","ui_lesen":"Read the full text","k1_kicker":"Uncoupling","k1_titel":"Park in a straight line","k1_sub":"Articulated lorry: the vehicle stands straight.","k1_p1":"The vehicle stands in a straight line, if possible.","k1_p2":"Leave space in front of the tractor unit so it can later be coupled straight again.","l_gestreckt":"In line","l_platz":"Room to couple","k1b_kicker":"Secure","k1b_titel":"Secure first","k1b_sub":"Both parking brakes, plus chocks.","k1b_p1":"When the vehicle stands, the parking brake of the tractor unit is applied first.","k1b_p2":"Then that of the semi-trailer: pull the red knob.","k1b_p3":"Wheel chocks are also placed at a rigid axle.","l_fest_zug":"Tractor parking brake","l_fest_auf":"Semi-trailer parking brake","l_keile":"Wheel chocks","k2_kicker":"Support","k2_titel":"Extend the landing gear","k2_sub":"The semi-trailer must then stand securely.","k2_p1":"The landing gear is extended: with air suspension until the feet touch the ground, with leaf springs until the tractor unit's springs are relieved.","k2_p2":"The ground must bear the load. Otherwise the feet are packed underneath.","k2_p3":"The semi-trailer is not lifted off the fifth wheel coupling.","l_stuetzen":"Landing gear down","l_tragfaehig":"Ground bears load","l_nicht_abheben":"Do not lift","k3_kicker":"Lines","k3_titel":"First red, then yellow","k3_sub":"Disconnect the supply line first.","k3_p1":"Red is disconnected first: the supply line.","k3_p2":"Then comes yellow: the brake line.","k3_p3":"The electrical cable is disconnected as well. The heads go into the parking sockets.","k3_p4":"When red is disconnected, the trailer brakes automatically. That is not enough to secure it.","k3_p5":"The air is lost over time. That is why the parking brake and chocks stay.","l_rot_ab":"Red off: supply line","l_gelb_ab":"Yellow off: brake line","l_elektro_ab":"Electrics off","l_reicht_nicht":"Not enough to secure","k4_kicker":"Pulling away","k4_titel":"Open the coupling","k4_sub":"Pull forward slowly and straight.","k4_p1":"The lock of the fifth wheel coupling is released and the coupling is opened.","k4_p2":"The tractor unit drives slowly and straight forward a short way.","k4_p3":"With air suspension it is then lowered a little and drives out completely.","k4_p4":"This way the rear of the tractor unit does not jump up.","l_oeffnen":"Open coupling","l_vorziehen":"Pull forward straight","l_absenken":"Lower, then drive out","k5_kicker":"Remember","k5_titel":"To take away","k5_merk":"Park in a straight line, both parking brakes, chocks, landing gear down. First red, then yellow off. Red alone does not secure.","l_foto":"Example image, AI-generated","f_sattel":"The fifth wheel coupling"},"sr":{"titel":"Razdvajanje šlepera","ui_ueber":"Pregled: razdvajanje šlepera","ui_intro":"Kratak film bez zvuka: sve piše na ekranu. Možeš da zaustaviš film ili da izabereš poglavlje kad god želiš.","ui_start":"Pokreni film","ui_pause":"Zaustavi","ui_weiter":"Nastavi","ui_neu":"Od početka","ui_kapitel":"Poglavlja","ui_lesen":"Pročitaj ceo tekst","k1_kicker":"Razdvajanje","k1_titel":"Parkiraj ravno","k1_sub":"Šleper: vozilo stoji ravno.","k1_p1":"Vozilo stoji što je moguće ravnije.","k1_p2":"Ispred tegljača ostaje mesta da se kasnije opet spoji ravno.","l_gestreckt":"Ravno","l_platz":"Mesto za spajanje","k1b_kicker":"Osiguranje","k1b_titel":"Prvo osiguraj","k1b_sub":"Obe parkirne kočnice i klinovi.","k1b_p1":"Kad vozilo stoji, prvo se povlači parkirna kočnica tegljača.","k1b_p2":"Zatim ona na poluprikolici: povuci crveno dugme.","k1b_p3":"Pored toga se postavljaju klinovi ispod točkova na krutoj osovini.","l_fest_zug":"Kočnica tegljača","l_fest_auf":"Kočnica poluprikolice","l_keile":"Klinovi (podmetači)","k2_kicker":"Oslanjanje","k2_titel":"Spusti oslonce","k2_sub":"Poluprikolica posle mora da stoji sigurno.","k2_p1":"Oslonci se izvlače: kod vazdušnog oslanjanja dok stopala ne dodirnu tlo, kod lisnatih opruga dok se opruge tegljača ne rasterete.","k2_p2":"Tlo mora da nosi. Inače se stopala podmeću.","k2_p3":"Poluprikolica se ne podiže sa spojnice sedla.","l_stuetzen":"Oslonci spušteni","l_tragfaehig":"Tlo nosi","l_nicht_abheben":"Ne podizati","k3_kicker":"Vodovi","k3_titel":"Prvo crveni, pa žuti","k3_sub":"Prvo razdvoj napojni vod.","k3_p1":"Prvo se razdvaja crveni: napojni vod.","k3_p2":"Zatim ide žuti: kočioni vod.","k3_p3":"Razdvaja se i električni kabl. Glave idu u parkirne utičnice.","k3_p4":"Kad se crveni razdvoji, prikolica sama koči. To nije dovoljno za osiguranje.","k3_p5":"Vazduh vremenom izlazi. Zato parkirna kočnica i klinovi ostaju.","l_rot_ab":"Crveni skini: napojni","l_gelb_ab":"Žuti skini: kočioni","l_elektro_ab":"Električni kabl skinut","l_reicht_nicht":"Ne osigurava dovoljno","k4_kicker":"Odlazak","k4_titel":"Otvori spojnicu","k4_sub":"Polako i ravno povuci napred.","k4_p1":"Osigurač spojnice sedla se otkači, spojnica se otvori.","k4_p2":"Tegljač polako i ravno vozi malo napred.","k4_p3":"Kod vazdušnog oslanjanja se zatim malo spusti i potpuno izađe.","k4_p4":"Tako zadnji deo tegljača ne poskoči uvis.","l_oeffnen":"Otvori spojnicu","l_vorziehen":"Ravno povući napred","l_absenken":"Spusti, pa izađi","k5_kicker":"Zapamti","k5_titel":"Za poneti","k5_merk":"Parkiraj ravno, obe parkirne kočnice, klinovi, oslonci spušteni. Prvo crveni, pa žuti skini. Samo crveni ne osigurava.","l_foto":"Primer slike, napravljen veštačkom inteligencijom","f_sattel":"Spojnica sedla"},"tr":{"titel":"Çekici ile yarı römorku ayırmak","ui_ueber":"Genel bakış: çekici ile yarı römorku ayırmak","ui_intro":"Sessiz kısa bir film: Her şey görüntüde yazıyla yer alır. İstediğin zaman durdurabilir veya bir bölüm seçebilirsin.","ui_start":"Filmi başlat","ui_pause":"Durdur","ui_weiter":"Devam","ui_neu":"Baştan","ui_kapitel":"Bölümler","ui_lesen":"Metnin tamamını oku","k1_kicker":"Ayırma","k1_titel":"Düz park et","k1_sub":"Tır: Araç düz duruyor.","k1_p1":"Araç mümkün olduğunca düz durur.","k1_p2":"Çekicinin önünde, sonra tekrar düz birleştirmek için yer kalır.","l_gestreckt":"Düz","l_platz":"Düz birleştirme alanı","k1b_kicker":"Emniyet","k1b_titel":"Önce emniyete al","k1b_sub":"İki park freni ve takozlar.","k1b_p1":"Araç durunca önce çekicinin park freni çekilir.","k1b_p2":"Sonra yarı römorkunki: kırmızı düğmeyi çek.","k1b_p3":"Ayrıca rijit bir akstaki tekerleklerin önüne takoz konur.","l_fest_zug":"Çekicinin park freni","l_fest_auf":"Römorkun park freni","l_keile":"Takozlar","k2_kicker":"Destek","k2_titel":"Destek ayaklarını indir","k2_sub":"Yarı römork bundan sonra sağlam durmalıdır.","k2_p1":"Destek ayakları indirilir: hava süspansiyonunda ayaklar zemine değene kadar, yaprak yaylı süspansiyonda çekicinin yayları rahatlayana kadar.","k2_p2":"Zemin taşımalıdır. Yoksa tabanların altına destek konur.","k2_p3":"Yarı römork beşinci teker kuplajından kaldırılmaz.","l_stuetzen":"Destekler aşağıda","l_tragfaehig":"Zemin taşıyor","l_nicht_abheben":"Kaldırma","k3_kicker":"Hatlar","k3_titel":"Önce kırmızı, sonra sarı","k3_sub":"Önce besleme hattını ayır.","k3_p1":"Önce kırmızı ayrılır: besleme hattı.","k3_p2":"Sonra sarı gelir: fren hattı.","k3_p3":"Elektrik kablosu da ayrılır. Başlıklar park yuvalarına konur.","k3_p4":"Kırmızı ayrılınca römork kendiliğinden frenler. Bu, emniyet için yetmez.","k3_p5":"Hava zamanla kaçar. Bu yüzden park freni ve takozlar kalır.","l_rot_ab":"Kırmızı çıkar: besleme","l_gelb_ab":"Sarı çıkar: fren hattı","l_elektro_ab":"Elektrik çıkar","l_reicht_nicht":"Emniyete yetmez","k4_kicker":"Uzaklaşma","k4_titel":"Kuplajı aç","k4_sub":"Yavaş ve düz ileri çek.","k4_p1":"Beşinci teker kuplajının emniyeti çıkarılır, kuplaj açılır.","k4_p2":"Çekici yavaşça ve düz bir miktar ileri gider.","k4_p3":"Hava süspansiyonunda biraz alçaltılır ve tamamen çıkar.","k4_p4":"Böylece çekicinin arka kısmı yukarı sıçramaz.","l_oeffnen":"Kuplajı aç","l_vorziehen":"Düz ileri çek","l_absenken":"Alçalt, sonra çık","k5_kicker":"Unutma","k5_titel":"Akılda kalsın","k5_merk":"Düz park et, iki park freni, takozlar, destek ayakları aşağı. Önce kırmızıyı, sonra sarıyı çıkar. Tek başına kırmızı emniyet sağlamaz.","l_foto":"Örnek görsel, yapay zekâ ile üretildi","f_sattel":"Beşinci teker kuplajı"}};
// ---- f3-2/szenen.js ----
(function (window) {
/* Szenen des Films 3.2 „Abkuppeln“ (Sattelzug) – EIN Code für den MP4-Film (index.html) und die App (gebaut mit ../bauen.mjs).
   Schrittfolge nach DGUV Information 214-080 (Kap. 2.3.2 Absatteln); Höhen aus kern/modell.js (SATTEL, sattelUnterfahren).
   bauen({ tl, T, tx, scenes, logo }) -> { starts, gesamt, refit } */
(function (window) {
  "use strict";
  function bauen(o) {
    const tl = o.tl, T = o.T, tx = o.tx, M = window.LKW_MODELL, BK = window.LKW_BK, KU = window.LKW_KUPPELN, F = BK.FARBE, el = BK.el, f = BK.f;
    const P = window.LKW_PANEL.neu({ tl: tl, T: T, tx: tx, logo: o.logo, fussName: "Abkuppeln" });
    const starts = P.starts, FZ = M.FAHRZEUGE.sattelzug, SA = M.SATTEL, MA = KU.MASS;
    const GRUEN = "#8FD6A6", WARN = "#FF9A5C", GOLD = F.gold, GELB = KU.GELB, ROT = KU.ROT, platz = KU.platz, leiter = KU.leiter, seite = KU.seite;
    const klemme = (u) => Math.max(0, Math.min(1, u)), fenster = (t, a, b, d) => Math.min(klemme((t - a) / (d || 0.5)), klemme((b - t) / (d || 0.5)));
    const glatt = (u) => { u = klemme(u); return u * u * (3 - 2 * u); }, lerp = (a, b, u) => a + (b - a) * u;
    function uhr(T0, dauer, zeichne) { const proxy = { t: 0 }; tl.to(proxy, { t: dauer, duration: dauer, ease: "none", onUpdate: function () { zeichne(proxy.t); } }, T0); zeichne(0); }
    const pille = (st, text, farbe, o2) => BK.pille(st, text, 0, 0, Object.assign({ punkt: farbe }, o2 || {}));
    const LUFT_KONTAKT = SA.unterkante - SA.plattenOben, LUFT_TIEF = -0.12, A_GEKUPPELT = -SA.e;
    if (!M.sattelUnterfahren(LUFT_TIEF).passtUnter || M.sattelUnterfahren(LUFT_KONTAKT).hebtAuf) throw new Error("Höhenbeispiel passt nicht zum Modell");
    // Knopf der Feststellbremse (rot) am Auflieger und „P“-Zeichen der Zugmaschine
    function knoepfe(W) {
      const kz = el("g", { opacity: 0 }, W.gVorn); el("circle", { cx: 4.1, cy: -1.55, r: 0.38, fill: ROT, stroke: "#23262A", "stroke-width": 0.05 }, kz);
      const t = el("text", { x: 4.1, y: -1.33, "text-anchor": "middle", "font-size": 0.5, "font-weight": 700, "font-family": "Barlow, sans-serif", fill: "#FAF6EC" }, kz); t.textContent = "P";
      const ka = el("g", { opacity: 0 }, W.gVorn); el("line", { x1: 0.9, y1: -1.0, x2: 0.9, y2: -1.3, stroke: "#8D949C", "stroke-width": 0.14 }, ka); el("circle", { cx: 0.9, cy: -0.95, r: 0.32, fill: ROT, stroke: "#23262A", "stroke-width": 0.04 }, ka);
      return { zug: kz, auf: ka };
    }

    /* ---------- K1: gestreckt abstellen (Draufsicht) ---------- */
    function K1(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), W = BK.welt(st, { S: 40, ox: 160, oy: 540, raster: false, id: "k1" }), fz = BK.fahrzeug(W.gFz, FZ, W);
      const A = { x: FZ.D - SA.e, y: 0 };
      fz.setze({ A: A, hz: 0, F: { x: A.x + FZ.L, y: 0, h: 0 }, T: { x: 0, y: 0 }, ha: 0 }, 0, false, 0);
      const mitte = BK.el("line", { stroke: "rgba(143,214,166,.8)", "stroke-width": 3, "stroke-dasharray": "14 10", opacity: 0 }, W.gUeber), q0 = W.px(-4, 0), q1 = W.px(24, 0);
      mitte.setAttribute("x1", f(q0[0])); mitte.setAttribute("y1", f(q0[1])); mitte.setAttribute("x2", f(q1[0])); mitte.setAttribute("y2", f(q1[1]));
      const x0 = A.x + FZ.L + FZ.vorn, fr = el("rect", { x: W.px(x0 + 0.5, -2.2)[0], y: W.px(0, -2.2)[1], width: 9 * 40, height: 4.4 * 40, rx: 12, fill: "rgba(143,214,166,.14)", stroke: GRUEN, "stroke-width": 4, "stroke-dasharray": "14 10", opacity: 0 }, W.gUeber);
      const pg = BK.pille(st, tx("l_gestreckt"), 300, 330, { punkt: GRUEN }), pp = BK.pille(st, tx("l_platz"), 800, 420, { punkt: GRUEN });
      uhr(T0, ch.dauer, function (t) { const a1 = fenster(t, 3, ch.dauer - 1, 0.6), a2 = fenster(t, 12, ch.dauer - 1, 0.6); mitte.setAttribute("opacity", a1); fr.setAttribute("opacity", a2); pg.style.opacity = a1; pp.style.opacity = a2; });
    }

    /* ---------- K1b: sichern (Seitenansicht) ---------- */
    function K1b(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 51, -0.5, 2.0), W = V.W, kn = knoepfe(W);
      V.zm.setze(A_GEKUPPELT, LUFT_KONTAKT); V.zm.kupplung(1); V.au.setze(0, { stuetze: 0, keil: 0 });
      const pz = pille(st, tx("l_fest_zug"), ROT), pa = pille(st, tx("l_fest_auf"), ROT), pk = pille(st, tx("l_keile"), GOLD), l1 = leiter(W, ROT), l2 = leiter(W, ROT), l3 = leiter(W, GOLD);
      uhr(T0, ch.dauer, function (t) {
        const a1 = fenster(t, 3, ch.dauer - 1, 0.6), a2 = fenster(t, 15, ch.dauer - 1, 0.6), a3 = fenster(t, 28, ch.dauer - 1, 0.6);
        kn.zug.style.opacity = a1; kn.auf.style.opacity = a2; V.au.setze(0, { stuetze: 0, keil: a3 > 0.5 ? 1 : 0 });
        const k = W.px(4.1, -1.55), k2 = W.px(0.9, -1.0), kk = W.px(MA.auflieger.achsX - 2.05, -0.15);
        platz(pz, 760, 190, a1); l1.setze(760, 224, k[0], k[1], a1);
        platz(pa, 380, 340, a2); l2.setze(380, 374, k2[0], k2[1], a2);
        platz(pk, 330, kk[1] + 150, a3); l3.setze(330, kk[1] + 118, kk[0], kk[1], a3);
      });
    }

    /* ---------- K2: Stützwinden ausfahren ---------- */
    function K2(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 72, 0.5, 2.0), W = V.W, kn = knoepfe(W);
      V.zm.setze(A_GEKUPPELT, LUFT_KONTAKT); V.zm.kupplung(1); kn.zug.style.opacity = 1; kn.auf.style.opacity = 1;
      const bohle = el("rect", { x: MA.auflieger.stuetzX - 0.55, y: 0.0, width: 1.1, height: 0.1, fill: "#B08A5A", stroke: "#6B4F2A", "stroke-width": 0.03, opacity: 0 }, W.gVorn);
      const kontakt = el("line", { x1: -0.2, y1: -SA.unterkante, x2: 1.3, y2: -SA.unterkante, stroke: GOLD, "stroke-width": 0.05 }, W.gVorn);
      const ps = pille(st, tx("l_stuetzen"), GOLD), pt = pille(st, tx("l_tragfaehig"), GRUEN), pn = pille(st, tx("l_nicht_abheben"), WARN), l1 = leiter(W, GOLD), l2 = leiter(W, GRUEN), l3 = leiter(W, WARN);
      uhr(T0, ch.dauer, function (t) {
        const e = glatt((t - 5) / 9);
        V.au.setze(0, { stuetze: e, keil: 1 }); V.zm.setze(A_GEKUPPELT, LUFT_KONTAKT);
        const s = W.px(MA.auflieger.stuetzX, -0.5), b = W.px(MA.auflieger.stuetzX, 0.05), h = W.px(0.55, -SA.unterkante);
        bohle.setAttribute("opacity", 0);
        const a1 = fenster(t, 4, 40, 0.6), a2 = fenster(t, 17, ch.dauer - 1, 0.6), a3 = fenster(t, 28, ch.dauer - 1, 0.6);
        platz(ps, 320, 190, a1); l1.setze(320, 224, s[0], s[1], a1);
        platz(pt, 320, 790, a2); l2.setze(320, 758, b[0], b[1], a2);
        platz(pn, 760, 190, a3); l3.setze(760, 224, h[0], h[1], a3);
      });
    }

    /* ---------- K3: Leitungen trennen (Nahaufnahme, dann Gesamtbild) ---------- */
    function K3(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false);
      const Vn = seite(st, 190, 2.2, 2.35), Wn = Vn.W, Vw = seite(st, 51, -0.5, 2.0), Ww = Vw.W, knw = knoepfe(Ww);
      Vn.zm.setze(A_GEKUPPELT, LUFT_KONTAKT); Vn.zm.kupplung(1); Vn.au.setze(0, { stuetze: 1, keil: 1 });
      Vw.zm.setze(A_GEKUPPELT, LUFT_KONTAKT); Vw.zm.kupplung(1); Vw.au.setze(0, { stuetze: 1, keil: 1 }); knw.zug.style.opacity = 1; knw.auf.style.opacity = 1;
      const farben = [ROT, GELB, "#B9BEC4"], sch = farben.map((c) => KU.schlauch(Wn, c, { laenge: 1.05 }));
      const anker = (k) => KU.ankerWelt(0, k), dose = (k) => ({ x: MA.steckdose.x, y: MA.steckdose.y[k] }), ruhe = (k) => KU.ruheWelt(0, k);
      const idx = [1, 0, 2], wann = [[6, 13], [16, 22], [25, 31]];       // rot, gelb, Elektrik (Index in den Steckdosen: gelb 0, rot 1, Elektrik 2)
      const pr = pille(st, tx("l_rot_ab"), ROT), pg = pille(st, tx("l_gelb_ab"), GELB), pe = pille(st, tx("l_elektro_ab"), "#B9BEC4"), lr = leiter(Wn, ROT), lg = leiter(Wn, GELB), le = leiter(Wn, "#B9BEC4");
      const pb = pille(st, tx("l_reicht_nicht"), WARN, { klasse: "gross" }), pw = pille(st, "", GOLD);
      // Gesamtbild: Bremslicht des Aufliegers (selbsttätige Bremsung), Druck sinkt mit der Zeit
      const bl = el("ellipse", { cx: MA.auflieger.achsX, cy: -0.5, rx: 2.1, ry: 0.85, fill: "none", stroke: WARN, "stroke-width": 0.1, "stroke-dasharray": "0.3 0.2", opacity: 0 }, Ww.gVorn);
      const wn = Vn.W.svg, ww = Ww.svg;
      uhr(T0, ch.dauer, function (t) {
        const nah = t < 36 ? 1 : 1 - glatt((t - 36) / 1.5);
        wn.style.opacity = nah; ww.style.opacity = 1 - nah;
        sch.forEach((s, k) => { const ik = idx[k], u = glatt((t - wann[k][0]) / (wann[k][1] - wann[k][0])), r = ruhe(ik), d = dose(ik), a = anker(ik); s.setze(a, { x: lerp(d.x, r.x, u), y: lerp(d.y, r.y, u) - Math.sin(Math.PI * u) * 0.35 }); });
        const g = Wn.px(MA.steckdose.x, MA.steckdose.y[1]), gl = Wn.px(MA.steckdose.x, MA.steckdose.y[0]), e = Wn.px(MA.steckdose.x, MA.steckdose.y[2]);
        const a0 = fenster(t, 4, 35, 0.6) * nah, a1 = fenster(t, 14, 35, 0.6) * nah, a2 = fenster(t, 24, 35, 0.6) * nah;
        platz(pr, g[0] - 330, g[1] + 130, a0); lr.setze(g[0] - 330, g[1] + 100, g[0], g[1], a0);
        platz(pg, gl[0] - 330, gl[1] - 160, a1); lg.setze(gl[0] - 330, gl[1] - 134, gl[0], gl[1], a1);
        platz(pe, e[0] - 250, e[1] + 250, a2); le.setze(e[0] - 250, e[1] + 224, e[0], e[1], a2);
        const brems = fenster(t, 38, 54, 0.6) * (1 - nah) > 0 || (t > 38 && t < 54);
        bl.setAttribute("opacity", (t > 38 && t < 54) ? 0.6 + 0.4 * Math.sin(t * 6) : 0); Vw.au.setze(0, { stuetze: 1, keil: 1, bremst: false });
        platz(pb, 540, 840, fenster(t, 54, ch.dauer - 1, 0.6));
        pw.style.opacity = 0;
      });
    }

    /* ---------- K4: Kupplung öffnen und wegfahren ---------- */
    function K4(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, false), V = seite(st, 62, 1.6, 2.0), W = V.W;
      const po = pille(st, tx("l_oeffnen"), GOLD), pv = pille(st, tx("l_vorziehen"), GOLD), pa = pille(st, tx("l_absenken"), GOLD), l1 = leiter(W, GOLD), l2 = leiter(W, GOLD), l3 = leiter(W, GOLD);
      const A_VOR = A_GEKUPPELT + 0.9, A_ENDE = 4.4;
      const pfeil = el("path", { d: "M0 -3.9 L0.9 -3.9 L0.9 -4.15 L1.5 -3.75 L0.9 -3.35 L0.9 -3.6 L0 -3.6 Z", fill: GOLD, opacity: 0 }, W.gVorn);
      V.au.setze(0, { stuetze: 1, keil: 1 });
      const foto = window.LKW_FOTO.karte(st, "sattelkupplung", tx("f_sattel"), tx("l_foto"));
      uhr(T0, ch.dauer, function (t) {
        foto.setze(fenster(t, 0.8, 5.8, 0.7));
        const zu = 1 - glatt((t - 6) / 5);
        const x = t < 16 ? A_GEKUPPELT : t < 24 ? lerp(A_GEKUPPELT, A_VOR, glatt((t - 16) / 8)) : t < 38 ? A_VOR : lerp(A_VOR, A_ENDE, glatt((t - 38) / 22));
        const luft = t < 30 ? LUFT_KONTAKT : t < 35 ? lerp(LUFT_KONTAKT, LUFT_TIEF, glatt((t - 30) / 5)) : LUFT_TIEF;
        V.zm.setze(x, luft); V.zm.kupplung(zu); V.au.setze(0, { stuetze: 1, keil: 1 });
        pfeil.setAttribute("opacity", (t > 17 && t < 24) || (t > 40 && t < 58) ? 1 : 0); pfeil.setAttribute("transform", "translate(" + f(x + 3.6) + " 0)");
        const ho = W.px(-0.4, -1.34), vz = W.px(x + 3.0, -3.3), ab = W.px(x + 0.4, -1.2 - Math.max(0, luft));
        const a1 = fenster(t, 4, 15, 0.6), a2 = fenster(t, 17, 30, 0.6), a3 = fenster(t, 30, 50, 0.6);
        platz(po, ho[0] - 100, ho[1] + 250, a1); l1.setze(ho[0] - 100, ho[1] + 218, ho[0], ho[1], a1);
        platz(pv, vz[0], 190, a2); l2.setze(vz[0], 224, vz[0], vz[1], a2);
        platz(pa, 330, 790, a3); l3.setze(330, 758, ab[0], ab[1], a3);
      });
    }

    /* ---------- K5: Merke ---------- */
    function K5(sc, i, T0, ch) {
      const st = P.buehne(sc), p = P.standardPanel(sc, ch, i, T0, true), V = seite(st, 51, -2.5, 2.0), kn = knoepfe(V.W);
      V.zm.setze(40, LUFT_TIEF); V.au.setze(0, { stuetze: 1, keil: 1 }); kn.auf.style.opacity = 1;
    }

    const bauer = { k1: K1, k1b: K1b, k2: K2, k3: K3, k4: K4, k5: K5 };
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
