/* Spiel 2: Tempo-Sprint (Familie A: Tippen), umgebaut am 08.10.2026 nach Serbans Wünschen.
   Reines Vergnügungsspiel, keine Schilder mehr: Ein Auto steht auf der Autobahnauffahrt. Auf „Gas geben!“ tippt man so
   schnell man kann auf die große Fläche. Erst bei 60 km/h kommt man auf die Autobahn (kurze Zeit: AUFFAHRT_MS). Danach
   hat man 10 Sekunden, um so viel Strecke wie möglich zu schaffen. Es gibt keine Höchstgeschwindigkeit: wer richtig gut tippt,
   kommt auf 600 bis 700 km/h. Ranking = Strecke in Metern (größer ist besser). Bäume und Häuser fliegen vorbei, alles in einer
   kleinen Schein-3D-Welt (Zeichenfläche, keine Bilddateien).

   Ablauf: Start-Tipp -> Runde beim Server anmelden -> 3 s Countdown -> „Gas geben“ (Auffahrt, höchstens 6 s bis 60 km/h) ->
           10 s Autobahn -> Ergebnis. Wer 60 km/h nicht schafft, kommt nicht drauf: Runde zählt nicht.
   Regeln (reine Rechnung, ohne Bildschirm, unten: neuerLauf / schritt / tippen):
     Tippen   v = v + GAIN * (1 - v / VTOP)       (je schneller, desto weniger bringt ein Tipp; VTOP = 1400 liegt weit über allem Machbaren)
     Rollen   v = v - DECAY pro Sekunde            (ohne Tippen wird man langsamer)
     Strecke  Summe aus Tempo mal Zeit, nur auf der Autobahn
   Mehr als ~16 Tipps pro Sekunde schafft kein Mensch: ein Tipp zählt erst TAP_ABSTAND_MS nach dem letzten gezählten (Mehrfinger
   zählen alle, innerhalb dieser Grenze). Der Server prüft Strecke und Höchsttempo gegen obergrenze(Tipps) -- die Zahlen stehen
   in REGELN UND in werkzeuge/edge-functions/academy-spiele.ts (Konstante SPRINT); die Prüfung vergleicht beide.
   Mensch-Werte (Simulation, Tipps pro Sekunde -> Höchsttempo nach 10 s): 8/s ≈ 290, 10/s ≈ 400, 12/s ≈ 510, 14/s ≈ 600, 15,8/s ≈ 670 km/h.

   Aufräumen: Zeitgeber, Animationsbild und Listener werden in zerstoeren() entfernt; wer die App verlässt (Seite unsichtbar),
   bricht die Runde ab. */
import { rankingKarte, profilKarte } from "./rahmen.js";

export const REGELN = {
  GAIN: 9, VTOP: 1400, DECAY: 40,             // km/h je Tipp (bei v = 0), nie erreichte Grenze, km/h Verlust je Sekunde
  V_AUF: 60,                                  // km/h, die man zum Auffahren braucht
  AUFFAHRT_MS: 6000, STRECKE_MS: 10000, COUNTDOWN_MS: 3000,
  V0_MAX: 70,                                 // Tempo beim Auffahren: knapp über 60 (ein Tipp bringt höchstens GAIN dazu)
  TAP_ABSTAND_MS: 63, TAPS_MAX: 160,          // 160 Tipps in 10 s = 16 pro Sekunde
  OBERGRENZE_ABSTAND_MS: 60,                  // der Server rechnet seine Obergrenze mit diesem (etwas dichteren) Abstand: gilt für jeden ehrlichen Lauf
  MARGE: 1.03, MARGE_M: 5                     // Rundungs- und Zeitschritt-Spielraum der Obergrenze (3 % plus 5 m)
};
export const GESAMT_MIN_MS = REGELN.COUNTDOWN_MS + 400 + REGELN.STRECKE_MS;   // früheste mögliche Ergebnis-Zeit (7 Tipps bis 60 km/h brauchen mindestens 0,4 s)

/* ---- Reine Rechnung ---- */
export function tipp(v) { return Math.min(REGELN.VTOP, v + REGELN.GAIN * (1 - v / REGELN.VTOP)); }
export function rollen(v, ms) { return Math.max(0, v - REGELN.DECAY * ms / 1000); }

/* Ein Lauf ab „Gas geben“: phase "auf" (Auffahrt) -> "str" (Autobahn); ende null | "ok" | "verpasst". t in ms ab Gas geben. */
export function neuerLauf() {
  return { t: 0, v: 0, phase: "auf", tAuf: null, tStr: 0, dist: 0, vmax: 0, tippsAuf: 0, tippsStr: 0, letzterTipp: -1e9, ende: null };
}
/* dt Millisekunden fortschreiben (Rollverlust, Strecke, Phasenende) */
export function schritt(l, dt) {
  if (l.ende || dt <= 0) return;
  l.t += dt;
  const vAlt = l.v;
  l.v = rollen(l.v, dt);
  if (l.phase === "auf") {
    if (l.t >= REGELN.AUFFAHRT_MS) l.ende = "verpasst";
  } else {
    const d = Math.min(dt, REGELN.STRECKE_MS - l.tStr);
    l.dist += (vAlt + l.v) / 2 / 3.6 * d / 1000;          // Trapez: Meter = mittleres Tempo (m/s) mal Sekunden
    l.tStr += d;
    if (l.tStr >= REGELN.STRECKE_MS) l.ende = "ok";
  }
}
/* Ein Tipp (zählt nur, wenn mindestens TAP_ABSTAND_MS seit dem letzten gezählten vergangen sind). true = gezählt */
export function tippen(l) {
  if (l.ende) return false;
  if (l.t - l.letzterTipp < REGELN.TAP_ABSTAND_MS) return false;
  l.letzterTipp = l.t;
  l.v = tipp(l.v);
  if (l.phase === "auf") {
    l.tippsAuf++;
    if (l.v >= REGELN.V_AUF) { l.phase = "str"; l.tAuf = l.t; l.vmax = l.v; }
  } else {
    l.tippsStr++;
    if (l.v > l.vmax) l.vmax = l.v;
  }
  return true;
}
/* Höchste Strecke und höchstes Tempo, die mit n Tipps auf der Autobahn überhaupt möglich sind: Start bei V0_MAX, alle Tipps gleich am
   Anfang im dichtesten Abstand, dazwischen der Rollverlust, danach nur Rollen. Gleiche Rechnung wie sprintObergrenze() im Server.
   Zeitschritt 5 ms; Spielraum MARGE / MARGE_M (ein später Tipp bringt ein winziges Bisschen mehr als ein früher). */
export function obergrenze(n) {
  const R = REGELN, DT = 5;
  let v = R.V0_MAX, m = 0, vmax = v, taps = 0, naechster = 0;
  for (let t = 0; t < R.STRECKE_MS; t += DT) {
    if (taps < n && t >= naechster) { v = Math.min(R.VTOP, v + R.GAIN * (1 - v / R.VTOP)); taps++; naechster += R.OBERGRENZE_ABSTAND_MS; if (v > vmax) vmax = v; }
    const vAlt = v;
    v = Math.max(0, v - R.DECAY * DT / 1000);
    m += (vAlt + v) / 2 / 3.6 * DT / 1000;
  }
  return { v: vmax * R.MARGE, m: m * R.MARGE + R.MARGE_M };
}

/* ================= Schein-3D-Welt (Zeichenfläche) =================
   Kamera hinter dem Auto. Boden: Zeile y gehört zur Tiefe z = CAMH*F/(y-hz). Alles in Metern; x quer zur Fahrtrichtung.
   Autobahn: zwei Fahrspuren von X = -3,5 bis 3,5; rechts daneben die Auffahrt (3,5 m breit, läuft nach 60 m spitz zu, endet bei 90 m). */
const WELT = {
  F: 0.55, CAMH: 2.4, ZC: 6.5, HZ: 0.38,        // Brennweite (mal Breite), Kamerahöhe, Abstand Kamera–Auto, Horizont (mal Höhe)
  HW: 3.5, RAMPE: 3.5, R_VOLL: 60, R_ENDE: 90,   // halbe Autobahnbreite, Rampenbreite, Rampe voll bis …, Rampe zu Ende bei … (Meter ab Start)
  X_RAMPE: 5.25, X_SPUR: 1.75,                    // Mitte der Rampe / der rechten Fahrspur
  MERGE_MS: 1900                                  // Zeit für den Spurwechsel von der Auffahrt auf die Autobahn (länger = weicher)
};
function rampBreite(s) {
  if (s >= WELT.R_ENDE) return 0;
  if (s <= WELT.R_VOLL) return WELT.RAMPE;
  return WELT.RAMPE * (WELT.R_ENDE - s) / (WELT.R_ENDE - WELT.R_VOLL);
}
function zufall(k, salz) { const x = Math.sin(k * 127.1 + salz * 311.7) * 43758.5453; return x - Math.floor(x); }
const sanft = function (x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

/* Zeichnet ein Bild. an = { s (Meter ab Start), v (km/h), carX, rot (Kurswinkel), t (s, nur für andere Autos), bremse (bool) } */
function zeichneWelt(ctx, W, H, an, cache, ruhig) {
  const F = W * WELT.F, hz = H * WELT.HZ, cx = W / 2;
  const camX = an.carX * 0.55;
  const sCam = an.s - WELT.ZC;
  const v = an.v;
  // Himmel (Verlauf wird je Größe einmal angelegt)
  if (cache.W !== W || cache.H !== H) {
    cache.W = W; cache.H = H;
    const g = ctx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, "#6fa3d6"); g.addColorStop(1, "#d6e7f4");
    cache.himmel = g;
  }
  ctx.fillStyle = cache.himmel; ctx.fillRect(0, 0, W, hz + 1);
  // Hügel am Horizont (zwei Schichten, wandern sehr langsam mit der Kurslage)
  for (let ebene = 0; ebene < 2; ebene++) {
    ctx.fillStyle = ebene ? "#6d9a68" : "#8fb4a0";
    ctx.beginPath(); ctx.moveTo(0, hz + 1);
    const hoehe = ebene ? 0.07 : 0.11;
    for (let x = 0; x <= W; x += 12) {
      const u = x / W * 6.28 + ebene * 2.1 - camX * 0.04;
      ctx.lineTo(x, hz - H * (hoehe * (0.55 + 0.25 * Math.sin(u * 1.3) + 0.2 * Math.sin(u * 2.9 + 1))));
    }
    ctx.lineTo(W, hz + 1); ctx.closePath(); ctx.fill();
  }
  // Boden Zeile für Zeile
  const px = function (X, f) { return cx + (X - camX) * f; };
  for (let y = Math.ceil(hz); y < H; y++) {
    const z = WELT.CAMH * F / (y - hz + 0.5);
    const s = sCam + z, f = F / z;
    const streifen = Math.floor(s / 9) & 1;
    ctx.fillStyle = streifen ? "#5d9a4c" : "#66a456"; ctx.fillRect(0, y, W, 1.3);
    const rb = rampBreite(s);
    const xl = px(-WELT.HW, f), xr = px(WELT.HW + rb, f);
    ctx.fillStyle = "#b8b9bd"; ctx.fillRect(xl - 0.9 * f, y, xr - xl + 1.8 * f, 1.3);                  // Randstreifen
    ctx.fillStyle = (Math.floor(s / 6) & 1) ? "#4e5158" : "#555860"; ctx.fillRect(xl, y, xr - xl, 1.3); // Fahrbahn
    ctx.fillStyle = "#f1f1f1";
    const lw = Math.max(1, 0.2 * f);
    ctx.fillRect(xl, y, lw, 1.3);                                                                       // linke Randlinie
    ctx.fillRect(xr - lw, y, lw, 1.3);                                                                  // rechte Randlinie (am Ende der Rampe)
    if ((((s % 18) + 18) % 18) < 6) ctx.fillRect(px(0, f) - lw / 2, y, lw, 1.3);                        // Mittelstrich (gestrichelt)
    if (rb > 0.3 && ((((s % 9) + 9) % 9) < 6)) ctx.fillRect(px(WELT.HW, f) - lw, y, lw * 2, 1.3);        // Leitlinie zur Auffahrt
  }
  // Dinge am Straßenrand und andere Autos von weit nach nah
  const dinge = [];
  const baum = 12, haus = 44;
  for (let k = Math.ceil((sCam + 5) / baum); k <= Math.floor((sCam + 175) / baum); k++) {
    const links = zufall(k, 1) > 0.25, rechts = zufall(k, 2) > 0.3;
    if (links) dinge.push({ s: k * baum + zufall(k, 3) * 4, x: -(8 + zufall(k, 4) * 16), art: "baum", z0: zufall(k, 5) });
    if (rechts) dinge.push({ s: k * baum + zufall(k, 6) * 4, x: 9.5 + zufall(k, 7) * 15, art: "baum", z0: zufall(k, 8) });
  }
  for (let k = Math.ceil((sCam + 5) / haus); k <= Math.floor((sCam + 175) / haus); k++) {
    dinge.push({ s: k * haus + 10 + zufall(k, 9) * 10, x: -(17 + zufall(k, 10) * 10), art: "haus", z0: zufall(k, 11) });
    if (zufall(k, 12) > 0.4) dinge.push({ s: k * haus + 28 + zufall(k, 13) * 8, x: 19 + zufall(k, 14) * 10, art: "haus", z0: zufall(k, 15) });
  }
  // andere Autos auf der linken Spur (fahren 120 km/h = 33,3 m/s), laufen in einem Ring von 230 m
  const fremde = [[12, "#c8372d"], [78, "#e8e8ea"], [150, "#2f5d9e"]];
  fremde.forEach(function (c, i) {
    let dz = c[0] + 33.3 * an.t - sCam;
    dz = ((((dz + 25) % 230) + 230) % 230) - 25;
    if (dz > 4 && dz < 175) dinge.push({ s: sCam + dz, x: -WELT.X_SPUR, art: "auto", farbe: c[1], z0: i });
  });
  dinge.sort(function (a, b) { return b.s - a.s; });
  dinge.forEach(function (d) {
    const z = d.s - sCam; if (z < 4 || z > 175) return;
    const f = F / z, sx = px(d.x, f), sy = hz + WELT.CAMH * F / z;
    if (sx < -f * 14 || sx > W + f * 14) return;
    ctx.globalAlpha = z > 110 ? Math.max(0, 1 - (z - 110) / 65) : 1;
    if (d.art === "baum") baumZeichnen(ctx, sx, sy, f, d.z0);
    else if (d.art === "haus") hausZeichnen(ctx, sx, sy, f, d.z0);
    else autoZeichnen(ctx, sx, sy, f * 0.95, d.farbe, false, 0);
    ctx.globalAlpha = 1;
  });
  // Tempo-Streifen (nur wenn es richtig schnell wird; bei „weniger Bewegung“ viel schwächer)
  if (v > 220) {
    const st = Math.min(1, (v - 220) / 600) * (ruhig ? 0.12 : 0.35);
    ctx.strokeStyle = "rgba(255,255,255," + st.toFixed(3) + ")"; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = zufall(i, 21) * 6.283, r1 = 0.18 + zufall(i, 22) * 0.2, r2 = r1 + 0.18 + zufall(i, 23) * 0.2 * Math.min(1, v / 500);
      const dx = Math.cos(a), dy = Math.sin(a) * 0.55;
      ctx.moveTo(cx + dx * W * r1, hz + dy * H * r1 + H * 0.12); ctx.lineTo(cx + dx * W * r2, hz + dy * H * r2 + H * 0.12);
    }
    ctx.stroke();
  }
  // unser Auto
  const f = F / WELT.ZC, sx = px(an.carX, f), sy = hz + WELT.CAMH * F / WELT.ZC;
  const wackel = ruhig ? 0 : Math.sin(an.t * 31) * Math.min(1.2, v / 350);
  autoZeichnen(ctx, sx, sy + wackel, f, "#e0b13a", an.bremse, an.rot || 0);
}

function baumZeichnen(ctx, sx, sy, f, z0) {
  ctx.fillStyle = "#6b4a2f"; ctx.fillRect(sx - 0.25 * f, sy - 2.4 * f, 0.5 * f, 2.4 * f);
  if (z0 > 0.5) { // Fichte
    ctx.fillStyle = z0 > 0.75 ? "#2f6b3c" : "#3a7a45";
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sx, sy - (6.8 - i * 1.5) * f); ctx.lineTo(sx + (1.2 + i * 0.7) * f, sy - (3.2 - i * 0.8) * f); ctx.lineTo(sx - (1.2 + i * 0.7) * f, sy - (3.2 - i * 0.8) * f); ctx.closePath(); ctx.fill(); }
  } else {        // Laubbaum
    ctx.fillStyle = z0 > 0.25 ? "#4f9a4a" : "#6aa84f";
    ctx.beginPath(); ctx.arc(sx, sy - 4.4 * f, (2 + z0) * f, 0, 6.283); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.beginPath(); ctx.arc(sx - 0.7 * f, sy - 5 * f, 1.2 * f, 0, 6.283); ctx.fill();
  }
}
const HAUS_FARBEN = ["#d9c5a0", "#c9d3d6", "#d8a58f", "#e6dcc6", "#b9c7a8"];
function hausZeichnen(ctx, sx, sy, f, z0) {
  const w = 8 + z0 * 4, h = 5 + z0 * 3;
  ctx.fillStyle = HAUS_FARBEN[Math.floor(z0 * HAUS_FARBEN.length)];
  ctx.fillRect(sx - w / 2 * f, sy - h * f, w * f, h * f);
  ctx.fillStyle = "#8a4b3a";
  ctx.beginPath(); ctx.moveTo(sx - (w / 2 + 0.6) * f, sy - h * f); ctx.lineTo(sx, sy - (h + 2.6) * f); ctx.lineTo(sx + (w / 2 + 0.6) * f, sy - h * f); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#6f8fa8";
  for (let i = 0; i < 3; i++) { ctx.fillRect(sx + (-w / 2 + 0.9 + i * (w - 1.8) / 3) * f, sy - (h - 0.8) * f, 1 * f, 1.2 * f); ctx.fillRect(sx + (-w / 2 + 0.9 + i * (w - 1.8) / 3) * f, sy - (h - 3) * f, 1 * f, 1.2 * f); }
}
/* Auto von hinten. f = Pixel je Meter, (sx, sy) = Mitte der Bodenlinie. rot = Kursdrehung (Bogenmaß). */
function autoZeichnen(ctx, sx, sy, f, farbe, bremse, rot) {
  ctx.save();
  ctx.translate(sx, sy); if (rot) ctx.rotate(rot);
  ctx.fillStyle = "rgba(0,0,0,.28)"; ctx.beginPath(); ctx.ellipse(0, 0.05 * f, 1.15 * f, 0.22 * f, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = "#1c1c20"; ctx.fillRect(-0.95 * f, -0.55 * f, 0.34 * f, 0.55 * f); ctx.fillRect(0.61 * f, -0.55 * f, 0.34 * f, 0.55 * f);   // Reifen
  ctx.fillStyle = farbe;
  ctx.beginPath(); ctx.moveTo(-0.95 * f, -0.4 * f); ctx.lineTo(-0.9 * f, -1.05 * f); ctx.lineTo(0.9 * f, -1.05 * f); ctx.lineTo(0.95 * f, -0.4 * f); ctx.closePath(); ctx.fill();   // Karosserie
  ctx.beginPath(); ctx.moveTo(-0.72 * f, -1.0 * f); ctx.lineTo(-0.55 * f, -1.55 * f); ctx.lineTo(0.55 * f, -1.55 * f); ctx.lineTo(0.72 * f, -1.0 * f); ctx.closePath(); ctx.fill();         // Kabine
  ctx.fillStyle = "#26343f";
  ctx.beginPath(); ctx.moveTo(-0.6 * f, -1.06 * f); ctx.lineTo(-0.46 * f, -1.48 * f); ctx.lineTo(0.46 * f, -1.48 * f); ctx.lineTo(0.6 * f, -1.06 * f); ctx.closePath(); ctx.fill();              // Heckscheibe
  ctx.fillStyle = bremse ? "#ff3a2e" : "#b3261e";
  ctx.fillRect(-0.9 * f, -0.98 * f, 0.34 * f, 0.2 * f); ctx.fillRect(0.56 * f, -0.98 * f, 0.34 * f, 0.2 * f);                                                                                // Rücklichter
  if (bremse) { ctx.fillStyle = "rgba(255,60,40,.35)"; ctx.fillRect(-1.05 * f, -1.1 * f, 2.1 * f, 0.45 * f); }
  ctx.fillStyle = "#f4f4f2"; ctx.fillRect(-0.2 * f, -0.78 * f, 0.4 * f, 0.15 * f);                                                                                                           // Kennzeichen (nur ein heller Streifen)
  ctx.restore();
}

/* Vorführung vor dem Spiel: das Auto beschleunigt auf der Rampe, fädelt ein und gibt Gas. Gibt die Ansicht zu t Sekunden zurück. */
const DEMO_S = 9;
function demoAnsicht(tSek) {
  const t = tSek % DEMO_S;
  const tempoBei = function (u) { return u < 3 ? 85 * sanft(u / 3) : 85 + 105 * sanft((u - 3) / 5); };   // 0 -> 85 km/h in 3 s, dann bis 190
  let s = 0;
  for (let u = 0; u < t; u += 0.02) s += tempoBei(u) / 3.6 * 0.02;
  const v = tempoBei(t);
  const m = sanft((t - 1.8) / (WELT.MERGE_MS / 1000));
  const dm = (sanft((t - 1.8 + 0.02) / (WELT.MERGE_MS / 1000)) - m) / 0.02 * (WELT.X_SPUR - WELT.X_RAMPE);
  return { s: s, v: v, carX: WELT.X_RAMPE + (WELT.X_SPUR - WELT.X_RAMPE) * m, rot: Math.atan(dm / Math.max(8, v / 3.6)) * 1.6, t: tSek, bremse: false, t0: t };
}

export function starte(platz, k) {
  const R = REGELN;
  let zustand = "bereit";        // bereit | start | countdown | lauf | fertig
  let timer = [];
  let raf = 0;
  let runde = null;              // Runden-ID vom Server; null = nichts wird gespeichert
  let nr = 0;                    // Rundenzähler: späte Antworten alter Runden werden verworfen
  let ergId = 0;
  let speicherInfo = "";
  let sperreBis = 0;
  let lauf = null;               // Lauf (reine Rechnung)
  let tLauf0 = 0;                // performance.now() beim Gas-geben
  let letzt = 0;                 // Zeitpunkt des letzten Rechenschritts
  let weltS = 0;                 // gefahrene Meter für die Zeichnung
  let vSicht = 0;                // geglättetes Tempo nur für die Zeichnung (Tipp-Sprünge ruckeln sonst die Landschaft); Tacho und Strecke bleiben echt
  let mergeT = 0;                // ms seit dem Auffahren (Spurwechsel-Bewegung)
  let ergebnisDaten = null;
  let padSperreBis = 0;
  let tastenSperre = 0;
  let szeneT0 = performance.now();
  let demoAb = performance.now();     // Vorführung läuft ab diesem Zeitpunkt (bereit / fertig)
  let anzeige = { zahl: null, rest: null, strecke: null, status: "" };
  const ruhig = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  platz.innerHTML =
    '<div class="sp-tempo-spiel">' +
      '<h2 class="sp-spieltitel">' + k.esc(k.tx("tempoName")) + "</h2>" +
      (k.vorschau ? '<div class="admin-sub sp-uebung">' + k.esc(k.tx("uebung")) + "</div>" : "") +
      '<div class="karte sp-t-buehne">' +
        '<div class="sp-t-hud">' +
          '<div class="sp-t-strecke" dir="ltr"><span class="sp-t-meter">0</span> <small>m</small></div>' +
          '<div class="sp-t-tacho" dir="ltr"><span class="sp-t-zahl">0</span><small>km/h</small></div>' +
          '<div class="sp-t-rest" dir="ltr" aria-hidden="true"></div>' +
        "</div>" +
        '<div class="sp-t-leiste" aria-hidden="true"><i></i></div>' +
        '<div class="sp-t-szene" role="img" aria-label="' + k.esc(k.tx("tempoSzene")) + '">' +
          '<canvas class="sp-t-canvas" width="320" height="160"></canvas>' +
        "</div>" +
        '<div class="sp-t-meldung" role="status" aria-live="polite"></div>' +
      "</div>" +
      '<button type="button" class="sp-t-pad start"></button>' +
      '<p class="admin-sub sp-t-anleitung">' + k.esc(k.tx("tempoBereit")) + "</p>" +
      '<div class="sp-ergebnis" hidden></div>' +
      '<div class="sp-profil-platz"></div>' +
      '<div class="sp-rank-platz"></div>' +
    "</div>";

  const zahlEl = platz.querySelector(".sp-t-zahl");
  const meterEl = platz.querySelector(".sp-t-meter");
  const restEl = platz.querySelector(".sp-t-rest");
  const leiste = platz.querySelector(".sp-t-leiste i");
  const meldung = platz.querySelector(".sp-t-meldung");
  const pad = platz.querySelector(".sp-t-pad");
  const anleitung = platz.querySelector(".sp-t-anleitung");
  const ergebnis = platz.querySelector(".sp-ergebnis");
  const szene = platz.querySelector(".sp-t-szene");
  const canvas = platz.querySelector(".sp-t-canvas");
  const ctx = canvas.getContext("2d");
  const cache = {};
  const rank = rankingKarte(k, "sprint", "m", platz.querySelector(".sp-rank-platz"));
  profilKarte(k, platz.querySelector(".sp-profil-platz"), function () { rank.aktualisieren(); });

  /* ---- Anzeige ---- */
  function setMeldung(text, art) {
    if (anzeige.status === text + "|" + (art || "")) return;
    anzeige.status = text + "|" + (art || "");
    meldung.textContent = text;
    meldung.className = "sp-t-meldung" + (art ? " " + art : "");
  }
  function setPad(art, text) { pad.className = "sp-t-pad " + art; pad.textContent = text; }
  function setRest(ms) {
    const text = k.zahl(Math.max(0, ms) / 1000, 1) + " s";
    if (anzeige.rest !== text) { anzeige.rest = text; restEl.textContent = text; }
  }
  function setZahl(x) { const n = Math.round(x); if (anzeige.zahl !== n) { anzeige.zahl = n; zahlEl.textContent = String(n); } }
  function setStrecke(m) { const n = Math.floor(m); if (anzeige.strecke !== n) { anzeige.strecke = n; meterEl.textContent = String(n); } }
  function leisteSetzen(anteil, art) { leiste.style.width = Math.max(0, Math.min(1, anteil)) * 100 + "%"; leiste.className = art || ""; }

  function stopTimer() { timer.forEach(clearTimeout); timer = []; }
  function imSpiel() { return zustand === "start" || zustand === "countdown" || zustand === "lauf"; }
  function anleitungZeigen() { anleitung.hidden = imSpiel(); }   // unter der Tippfläche: ändert nichts an ihrer Lage

  function bereitMachen() {
    zustand = "bereit"; anleitungZeigen(); lauf = null; weltS = 0; vSicht = 0;
    demoAb = performance.now();
    setZahl(0); setStrecke(0); restEl.textContent = ""; anzeige.rest = null; leisteSetzen(0);
    setMeldung("");
    setPad("start", k.tx("start"));
  }

  /* Bühne (Tacho, Straße, Meldung) UND Tippfläche müssen zusammen im Bild sein: die Bühne wandert nach oben, die
     Tippfläche folgt direkt darunter (Größen in spiele.css sind darauf abgestimmt). */
  function buehneInsBild() {
    try { platz.querySelector(".sp-t-buehne").scrollIntoView({ block: "start" }); } catch (e) {}
  }

  /* ---- Ablauf ---- */
  function starteRunde() {
    const meine = ++nr;
    zustand = "start"; anleitungZeigen(); runde = null; ergebnisDaten = null; speicherInfo = ""; ergId++;
    ergebnis.hidden = true; ergebnis.innerHTML = "";
    lauf = null; weltS = 0; vSicht = 0; mergeT = 0;
    setZahl(0); setStrecke(0); leisteSetzen(0); restEl.textContent = ""; anzeige.rest = null;
    setMeldung(k.tx("tempoGleich"));
    setPad("warte", "…");
    sperreBis = performance.now() + 400;
    buehneInsBild();
    // Die Runde beim Server anmelden, BEVOR es losgeht: dann ist die Serverzeit nie kürzer als die Spielzeit.
    let anmeldung = Promise.resolve(null);
    if (!k.vorschau) {
      anmeldung = Promise.race([
        k.api({ aktion: "start", spiel: "sprint" }).then(function (d) { return d.runde; }).catch(function () { return null; }),
        new Promise(function (ok) { timer.push(setTimeout(function () { ok(null); }, 6000)); })
      ]);
    }
    anmeldung.then(function (r) {
      if (meine !== nr || zustand !== "start") return;
      runde = r;
      countdown();
    });
  }

  function countdown() {
    zustand = "countdown";
    const t0 = performance.now();
    setPad("warte", "3");
    function schritt() {
      if (zustand !== "countdown") return;
      const rest = R.COUNTDOWN_MS - (performance.now() - t0);
      if (rest <= 0) { losGehts(); return; }
      setPad("warte", String(Math.ceil(rest / 1000)));
      timer.push(setTimeout(schritt, 60));
    }
    schritt();
  }

  function losGehts() {
    zustand = "lauf";
    lauf = neuerLauf();
    tLauf0 = letzt = performance.now();
    setPad("tippen", k.tx("tempoTippen"));
    setMeldung(k.tx("tempoGas"), "go");
  }

  /* Das gezeichnete Tempo folgt dem echten mit kurzer Verzögerung (ca. 0,15 s): kein Ruck bei jedem Tipp, die Meter für die Landschaft laufen gleichmäßig. */
  function sichtFortschritt(ziel, dt) {
    const alt = vSicht;
    vSicht += (ziel - vSicht) * (1 - Math.exp(-dt / 150));
    weltS += (alt + vSicht) / 2 / 3.6 * dt / 1000;
  }

  /* Rechnet das Spiel bis `jetzt` fort. Wird vom Bildlauf UND vor jedem Tipp gerufen, damit ein Tipp immer auf dem aktuellen Stand landet. */
  function fortschritt(jetzt) {
    if (zustand !== "lauf") return;
    const dt = Math.max(0, Math.min(250, jetzt - letzt));    // ein hängendes Bild darf nicht plötzlich viel Tempo kosten
    letzt = jetzt;
    schritt(lauf, dt);
    sichtFortschritt(lauf.v, dt);
    if (lauf.phase === "str") mergeT += dt;
    if (lauf.ende) beenden();
  }

  function antippenTempo() {
    fortschritt(performance.now());
    if (zustand !== "lauf") return;
    const vorher = lauf.phase;
    if (tippen(lauf)) {
      if (vorher === "auf" && lauf.phase === "str") { setMeldung(k.tx("tempoDrauf"), "go"); setPad("tippen spurt", k.tx("tempoTippen")); }
      setZahl(lauf.v);
    }
  }

  function beenden() {
    stopTimer(); nr++;
    const l = lauf;
    zustand = "fertig"; anleitungZeigen();
    padSperreBis = performance.now() + 1500;
    demoAb = performance.now() + 2600;           // erst das Ergebnis-Bild stehen lassen, dann wieder die Vorführung
    setZahl(l.v); setRest(0);
    setMeldung("");
    setPad("start", k.tx("nochmal"));
    ergId++;
    if (l.ende === "verpasst") {
      leisteSetzen(1, "warn");
      ergebnisDaten = { verpasst: true };
      zeichneErgebnis();
      return;
    }
    leisteSetzen(1, "spurt"); setStrecke(l.dist);
    const wert = Math.round(l.dist);
    ergebnisDaten = { wert: wert, tipps: l.tippsStr, vmax: Math.round(l.vmax) };
    zeichneErgebnis();
    speichern(wert, l.tippsStr, l.tippsAuf, Math.round(l.vmax));
  }

  /* ---- Ergebnis ---- */
  function zeichneErgebnis() {
    if (!ergebnisDaten) return;
    const e = ergebnisDaten;
    ergebnis.hidden = false;
    if (e.verpasst) {
      ergebnis.innerHTML = '<div class="karte sp-erg"><p class="sp-fehler sp-t-verpasst" role="status">' + k.esc(k.tx("tempoVerpasst")) + "</p></div>";
      return;
    }
    ergebnis.innerHTML =
      '<div class="karte sp-erg">' +
        '<div class="sp-erg-kopf"><div class="sp-label">' + k.esc(k.tx("tempoErgStrecke")) + "</div>" +
          '<div class="sp-gross" dir="ltr">' + e.wert + " <span>m</span></div></div>" +
        '<div class="sp-speicher" role="status">' + speicherInfo + "</div>" +
        '<ul class="sp-t-zahlen">' +
          "<li><span>" + k.esc(k.tx("tempoErgMax")) + '</span><b dir="ltr">' + e.vmax + " km/h</b></li>" +
          "<li><span>" + k.esc(k.tx("tempoErgTipps")) + '</span><b dir="ltr">' + e.tipps + "</b></li>" +
        "</ul>" +
        '<p class="admin-sub sp-hinweis-strasse">' + k.esc(k.tx("tempoHinweis")) + "</p>" +
      "</div>";
  }
  function setzeSpeicherInfo(html) {
    speicherInfo = html;
    const z = ergebnis.querySelector(".sp-speicher");
    if (z) z.innerHTML = html;
  }
  function speichern(wert, tipps, tippsAuf, vmax) {
    if (k.vorschau) { setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("uebung")) + "</span>"); return; }
    if (!runde) { setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>"); return; }
    const meine = runde;
    runde = null;
    setzeSpeicherInfo('<span class="sp-hinweis-klein">' + k.esc(k.tx("laden")) + "</span>");
    const id = ergId;
    k.api({ aktion: "ergebnis", runde: meine, wert: wert, tipps: tipps, tippsAuf: tippsAuf, vmax: vmax }).then(function (d) {
      if (id !== ergId || !document.body.contains(platz)) return;
      let html = "";
      if (d.rekord) html += '<span class="sp-badge neu">' + k.esc(k.tx("tempoNeu")) + "</span> ";
      else html += '<span class="sp-hinweis-klein">' + k.esc(k.tx("tempoBestwert")) + ': <b dir="ltr">' + k.esc(d.bestwert) + " m</b></span> ";
      if (d.platz != null && d.gesamt != null) html += '<span class="sp-badge">' + k.esc(k.tx("platz", { n: d.platz, m: d.gesamt })) + "</span>";
      if (k.profil) k.profil.bestwerte.sprint = d.bestwert;
      setzeSpeicherInfo(html);
      rank.aktualisieren();
    }).catch(function () {
      if (id === ergId && document.body.contains(platz)) setzeSpeicherInfo('<span class="sp-fehler">' + k.esc(k.tx("nichtGespeichert")) + "</span>");
    });
  }

  /* ---- Zeichnen (läuft immer, solange das Spiel offen ist) ---- */
  function groesse() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = szene.clientWidth, h = szene.clientHeight;
    if (!w || !h) return null;
    const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h };
  }
  function frame() {
    raf = requestAnimationFrame(frame);
    const jetzt = performance.now();
    const g = groesse(); if (!g) return;
    let an;
    if (zustand === "lauf") {
      fortschritt(jetzt);
      if (zustand === "lauf") {
        const l = lauf;
        const m = sanft(mergeT / WELT.MERGE_MS), mp = sanft((mergeT + 16) / WELT.MERGE_MS);
        const carX = WELT.X_RAMPE + (WELT.X_SPUR - WELT.X_RAMPE) * (l.phase === "str" ? m : 0);
        const dxdt = l.phase === "str" ? (mp - m) * (WELT.X_SPUR - WELT.X_RAMPE) / 0.016 : 0;
        an = { s: weltS, v: vSicht, carX: carX, rot: Math.atan(dxdt / Math.max(14, vSicht / 3.6)) * 1.0, t: (jetzt - szeneT0) / 1000, bremse: false };
        setZahl(l.v);
        if (l.phase === "auf") {
          leisteSetzen(l.v / R.V_AUF, "warn");
          setRest(R.AUFFAHRT_MS - l.t); setStrecke(0);
          setMeldung(k.tx("tempoGas"), "go");
        } else {
          leisteSetzen(l.tStr / R.STRECKE_MS, "spurt");
          setRest(R.STRECKE_MS - l.tStr); setStrecke(l.dist);
        }
      }
    }
    if (!an) {
      if (zustand === "fertig" && jetzt < demoAb) {
        const l = lauf;
        an = { s: weltS, v: vSicht, carX: l && l.phase === "str" ? WELT.X_SPUR : WELT.X_RAMPE, rot: 0, t: (jetzt - szeneT0) / 1000, bremse: !!(l && l.ende === "verpasst") };
        if (l) { l.v = rollen(l.v, 16); sichtFortschritt(l.v, 16); setZahl(l.v); }
      } else if (zustand === "bereit" || zustand === "fertig") {
        an = demoAnsicht((jetzt - demoAb) / 1000);
      } else {                                // start / countdown: das Auto steht auf der Rampe, die anderen fahren vorbei
        an = { s: 0, v: 0, carX: WELT.X_RAMPE, rot: 0, t: (jetzt - szeneT0) / 1000, bremse: true };
      }
    }
    if (zustand === "bereit" || (zustand === "fertig" && jetzt >= demoAb)) { setZahl(0); }
    zeichneWelt(ctx, g.w, g.h, an, cache, ruhig);
    if (an.t0 != null && an.t0 < 0.25) { ctx.fillStyle = "rgba(0,0,0," + ((0.25 - an.t0) / 0.25 * 0.85).toFixed(2) + ")"; ctx.fillRect(0, 0, g.w, g.h); }   // sanfter Neustart der Vorführung
  }

  /* ---- Eingaben ---- */
  function antippen() {
    const jetzt = performance.now();
    if (zustand === "bereit" || zustand === "fertig") {
      if (zustand === "fertig" && jetzt < padSperreBis) return;       // wildes Weitertippen nach dem Ende startet keine neue Runde
      starteRunde(); return;
    }
    if (zustand === "lauf") antippenTempo();
  }
  pad.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    antippen();
  });
  pad.addEventListener("keydown", function (e) {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (e.repeat) return;
    tastenSperre = performance.now() + 400;   // der Klick, den Tastatur/Screenreader danach auslösen, zählt nicht doppelt
    antippen();
  });
  pad.addEventListener("click", function (e) {
    if (e.detail !== 0 || performance.now() < tastenSperre) return;   // nur Klicks ohne Zeiger (z. B. Screenreader)
    antippen();
  });
  pad.addEventListener("contextmenu", function (e) { e.preventDefault(); });   // langes Drücken öffnet kein Menü
  // Wer die App währenddessen verlässt, bekommt keine verschobene Runde: abbrechen und von vorn
  function sichtbarkeit() {
    if (document.hidden && imSpiel()) { stopTimer(); nr++; bereitMachen(); }
  }
  document.addEventListener("visibilitychange", sichtbarkeit);

  bereitMachen();
  raf = requestAnimationFrame(frame);
  // Querformat am Handy: die Bühne liegt sonst teils unter der Menüleiste -- gleich ins Bild holen
  if (window.innerHeight < 520 && window.innerWidth > window.innerHeight) requestAnimationFrame(buehneInsBild);

  return {
    zerstoeren: function () {
      stopTimer(); nr++; zustand = "bereit";
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      document.removeEventListener("visibilitychange", sichtbarkeit);
    }
  };
}
