/* =====================================================================
   Verkehr verstehen: Szenen aus den Kompass-Lernszenen in 3D
   Die Szenen kommen als Daten (JSON): Flächen, Linien, Objekte, Schilder
   und die vorberechneten Bahnen aller Verkehrsteilnehmer.
   Koordinaten wie im Motor: x nach vorne, y nach oben, z nach rechts.
   ===================================================================== */
import { THREE, zufall, bauePkw, baueLkw, baueTraktor, bausteine } from "./motor.js";

const B = bausteine;

/* ---------------------------------------------------------------------
   Texturen (Welt-Koordinaten in Metern)
   --------------------------------------------------------------------- */
const TX = {};
function gemalt(name, w, h, malen){ if(!TX[name]) TX[name] = B.leinwand(w, h, malen); return TX[name]; }
function weltTextur(c, meter){
  const t = B.textur(c, [1, 1]);
  t.repeat.set(1 / meter, 1 / meter);
  return t;
}
function belag(name, basis, streu, n, extra){
  return gemalt(name, 512, 512, function(ctx, w, h){
    const rnd = zufall(name.length * 7 + 3);
    B.rauschen(ctx, w, h, basis, streu, n, rnd);
    if(extra) extra(ctx, w, h, rnd);
  });
}
function asphaltStadt(){
  return belag("asphaltStadt", "#50545a", 0.2, 30000, function(ctx, w, h, rnd){
    // Flicken und leichte Flecken wie auf echter Fahrbahn
    for(let i = 0; i < 5; i++){
      const x = rnd() * w, y = rnd() * h, r = 40 + rnd() * 90, gr = ctx.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, rnd() < 0.5 ? "rgba(20,20,22,.07)" : "rgba(255,255,255,.03)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  });
}
function gehwegTextur(){
  // Gehwegplatten 40 × 40 cm mit Fugen
  return gemalt("gehweg", 256, 256, function(ctx, w, h){
    const rnd = zufall(19);
    B.rauschen(ctx, w, h, "#b6b3ab", 0.16, 7000, rnd);
    const n = 6, s = w / n;
    for(let i = 0; i < n; i++) for(let j = 0; j < n; j++){
      ctx.fillStyle = "rgba(0,0,0," + (0.02 + rnd() * 0.05) + ")"; ctx.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
    }
    ctx.strokeStyle = "rgba(60,58,52,.45)"; ctx.lineWidth = 2;
    for(let i = 0; i <= n; i++){ ctx.beginPath(); ctx.moveTo(i * s, 0); ctx.lineTo(i * s, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * s); ctx.lineTo(w, i * s); ctx.stroke(); }
  });
}
function pflasterTextur(){
  return gemalt("pflaster", 256, 256, function(ctx, w, h){
    const rnd = zufall(23);
    ctx.fillStyle = "#6e7074"; ctx.fillRect(0, 0, w, h);
    const s = 16;
    for(let y = 0; y < h; y += s) for(let x = -(y / s % 2) * s / 2; x < w; x += s){
      const g = 120 + (rnd() * 40 | 0);
      ctx.fillStyle = "rgb(" + g + "," + (g + 2) + "," + (g + 6) + ")";
      ctx.beginPath(); ctx.moveTo(x + 2, y + 1); ctx.lineTo(x + s - 1, y + 2); ctx.lineTo(x + s - 2, y + s - 1); ctx.lineTo(x + 1, y + s - 2); ctx.closePath(); ctx.fill();
    }
  });
}

/* ---------------------------------------------------------------------
   Materialien je Flächenart
   --------------------------------------------------------------------- */
function flaechenMaterial(welt, art, farbe){
  const key = "fl_" + art + (farbe || "");
  welt.stadtM = welt.stadtM || {};
  if(welt.stadtM[key]) return welt.stadtM[key];
  let m;
  const std = function(o){ o.roughness = o.roughness === undefined ? 0.95 : o.roughness; o.metalness = 0; o.depthWrite = false; return new THREE.MeshStandardMaterial(o); };
  if(art === "asphalt" || art === "sperr" || art === "baustelle") m = std({ map: weltTextur(asphaltStadt(), 8) });
  else if(art === "asphalt2") m = std({ map: weltTextur(asphaltStadt(), 8), color: 0xc8c8c8 });
  else if(art === "parken") m = std({ map: weltTextur(asphaltStadt(), 8), color: 0xd8dade });
  else if(art === "gehweg") m = std({ map: weltTextur(gehwegTextur(), 2.4), roughness: 0.9 });
  else if(art === "pflaster") m = std({ map: weltTextur(pflasterTextur(), 2) });
  else if(art === "rad") m = std({ map: weltTextur(asphaltStadt(), 8), color: new THREE.Color(farbe || "#c0654a") });
  else if(art === "weiss") m = std({ color: 0xf1f0ea, roughness: 0.65 });
  else if(art === "beton") m = std({ color: 0x9a9c9f });
  else m = std({ map: weltTextur(B.grasTextur(), 4), color: new THREE.Color(art === "insel" ? "#e6f2dc" : "#f0f6ea") });
  welt.stadtM[key] = m;
  return m;
}

/* ---------------------------------------------------------------------
   Geometrie-Helfer
   --------------------------------------------------------------------- */
// Polygon [[x, z], ...] als flache Fläche auf Höhe y
function flaechenGeo(polys, y){
  const geos = polys.map(function(poly){
    const s = new THREE.Shape(poly.map(function(p){ return new THREE.Vector2(p[0], -p[1]); }));
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
    return g.index ? g.toNonIndexed() : g;
  });
  return zusammen(geos);
}
function zusammen(geos){
  let n = 0; geos.forEach(function(g){ n += g.attributes.position.count; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  let o = 0;
  geos.forEach(function(g){
    if(!g.attributes.normal) g.computeVertexNormals();
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    if(g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
    o += g.attributes.position.count; g.dispose();
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.computeBoundingSphere();
  return geo;
}
// Polylinie mit Bogenlänge
function linienPfad(pts){
  const L = [0];
  for(let i = 1; i < pts.length; i++) L[i] = L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  function an(s){
    s = Math.max(0, Math.min(L[L.length - 1], s));
    let i = 1; while(i < L.length - 1 && L[i] < s) i++;
    const d = (L[i] - L[i - 1]) || 1, k = (s - L[i - 1]) / d;
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
  }
  // Stützpunkte zwischen s0 und s1 (inklusive der Ecken dazwischen)
  function stueck(s0, s1){
    const out = [an(s0)];
    for(let i = 1; i < L.length - 1; i++) if(L[i] > s0 && L[i] < s1) out.push(pts[i]);
    out.push(an(s1));
    return out;
  }
  return { laenge: L[L.length - 1], an: an, stueck: stueck };
}
// Band (flach) entlang einer Polylinie, Breite b, Höhe y -> Dreiecke
function band(pts, b, y, pos, uv){
  const n = pts.length; if(n < 2) return;
  const off = [];
  for(let i = 0; i < n; i++){
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)];
    let dx = c[0] - a[0], dz = c[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    off.push([-dz * b / 2, dx * b / 2]);
  }
  let s = 0;
  for(let i = 0; i < n - 1; i++){
    const p = pts[i], q = pts[i + 1], o1 = off[i], o2 = off[i + 1];
    const s2 = s + Math.hypot(q[0] - p[0], q[1] - p[1]);
    const A = [p[0] - o1[0], y, p[1] - o1[1]], Bp = [p[0] + o1[0], y, p[1] + o1[1]], C = [q[0] + o2[0], y, q[1] + o2[1]], D = [q[0] - o2[0], y, q[1] - o2[1]];
    pos.push(A[0], A[1], A[2], C[0], C[1], C[2], Bp[0], Bp[1], Bp[2], A[0], A[1], A[2], D[0], D[1], D[2], C[0], C[1], C[2]);
    if(uv) uv.push(s, 0, s2, 1, s, 1, s, 0, s2, 0, s2, 1);
    s = s2;
  }
}
// senkrechte Wand entlang einer Polylinie (beidseitig sichtbar über DoubleSide)
function wand(pts, y0, y1, pos, versatz){
  for(let i = 0; i < pts.length - 1; i++){
    const p = pts[i], q = pts[i + 1];
    let ox = 0, oz = 0;
    if(versatz){ let dx = q[0] - p[0], dz = q[1] - p[1]; const l = Math.hypot(dx, dz) || 1; ox = -dz / l * versatz; oz = dx / l * versatz; }
    const a = [p[0] + ox, p[1] + oz], b = [q[0] + ox, q[1] + oz];
    pos.push(a[0], y0, a[1], b[0], y0, b[1], b[0], y1, b[1], a[0], y0, a[1], b[0], y1, b[1], a[0], y1, a[1]);
  }
}
function geoAus(pos, uv){
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv || new Array(pos.length / 3 * 2).fill(0), 2));
  g.computeVertexNormals();
  return g;
}
// Polygon auf einen x-Streifen [a, b] zuschneiden (Sperrflächen-Schraffur)
function clipX(poly, a, b){
  function clip(P, inside, cut){
    const out = [];
    for(let i = 0; i < P.length; i++){
      const c = P[i], p = P[(i + P.length - 1) % P.length];
      const ci = inside(c), pi = inside(p);
      if(ci){ if(!pi) out.push(cut(p, c)); out.push(c); } else if(pi) out.push(cut(p, c));
    }
    return out;
  }
  const at = function(x){ return function(p, c){ const k = (x - p[0]) / ((c[0] - p[0]) || 1e-9); return [x, p[1] + (c[1] - p[1]) * k]; }; };
  let r = clip(poly, function(p){ return p[0] >= a; }, at(a));
  if(r.length) r = clip(r, function(p){ return p[0] <= b; }, at(b));
  return r;
}
function strichMuster(art){ return art === "leit" ? [6, 12] : art === "breit" ? [6, 6] : art === "leit_io" ? [3, 6] : art === "warte" ? [0.5, 0.25] : art === "schmal" ? [1, 1] : null; }

/* ---------------------------------------------------------------------
   Verkehrszeichen (gleiche Zeichnung wie im Fahrlehrer-Kompass, doppelt aufgelöst)
   --------------------------------------------------------------------- */
function schildBild(typ){
  return gemalt("sch_" + typ, 256, 256, function(g){
    g.scale(2, 2); g.textAlign = "center"; g.textBaseline = "middle";
    const blau = "#1f5fa8", PI8 = Math.PI / 8;
    const rund = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
      if (typ === "z330") { // Autobahn
        rund(6, 6, 116, 116, 12); g.fillStyle = blau; g.fill(); g.lineWidth = 5; g.strokeStyle = "#fff"; g.stroke();
        g.fillStyle = "#fff"; g.beginPath(); g.moveTo(64, 26); g.lineTo(56, 26); g.lineTo(30, 104); g.lineTo(52, 104); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(64, 26); g.lineTo(72, 26); g.lineTo(98, 104); g.lineTo(76, 104); g.closePath(); g.fill();
        g.fillStyle = blau; g.fillRect(62, 34, 4, 70); g.fillStyle = "#fff"; g.fillRect(40, 56, 48, 7);
      } else if (typ === "z331") { // Kraftfahrstraße (nicht verwendet, Reserve)
        rund(6, 6, 116, 116, 12); g.fillStyle = blau; g.fill();
      } else if (typ === "z332") { // Ausfahrttafel
        rund(4, 24, 120, 80, 10); g.fillStyle = blau; g.fill(); g.lineWidth = 4; g.strokeStyle = "#fff"; g.stroke();
        g.fillStyle = "#fff"; g.font = "bold 22px sans-serif"; g.fillText("Ausfahrt", 64, 50);
        g.lineWidth = 6; g.strokeStyle = "#fff"; g.beginPath(); g.moveTo(40, 88); g.lineTo(88, 70); g.stroke();
        g.beginPath(); g.moveTo(90, 69); g.lineTo(76, 66); g.lineTo(82, 80); g.closePath(); g.fillStyle = "#fff"; g.fill();
      } else if (typ === "z333") { // Pfeilzeichen Ausfahrt
        rund(10, 10, 108, 108, 10); g.fillStyle = blau; g.fill(); g.lineWidth = 4; g.strokeStyle = "#fff"; g.stroke();
        g.fillStyle = "#fff"; g.font = "bold 17px sans-serif"; g.fillText("Ausfahrt", 64, 34);
        g.lineWidth = 9; g.beginPath(); g.moveTo(40, 100); g.lineTo(84, 58); g.stroke();
        g.beginPath(); g.moveTo(94, 48); g.lineTo(64, 54); g.lineTo(88, 78); g.closePath(); g.fill();
      } else if (typ === "z450_3" || typ === "z450_2" || typ === "z450_1") { // Ankündigungsbaken
        const n = +typ.slice(-1); g.fillStyle = "#fff"; g.fillRect(34, 4, 60, 120); g.strokeStyle = "#999"; g.lineWidth = 2; g.strokeRect(34, 4, 60, 120);
        g.save(); g.beginPath(); g.rect(34, 4, 60, 120); g.clip(); g.strokeStyle = "#d4202a"; g.lineWidth = 12;
        for (let i = 0; i < n; i++) { const y = 26 + i * 34; g.beginPath(); g.moveTo(30, y + 26); g.lineTo(98, y - 8); g.stroke(); }
        g.restore();
      } else if (typ === "vorweg") { // Vorwegweiser Ausfahrt (vereinfachte Darstellung)
        rund(2, 18, 124, 92, 8); g.fillStyle = blau; g.fill(); g.lineWidth = 3; g.strokeStyle = "#fff"; g.stroke();
        g.fillStyle = "#fff"; g.font = "bold 19px sans-serif"; g.fillText("Musterstadt", 64, 46);
        g.font = "bold 22px sans-serif"; g.fillText("1000 m", 64, 82);
      } else if (typ === "weg") {
        rund(2, 18, 124, 92, 8); g.fillStyle = blau; g.fill(); g.lineWidth = 3; g.strokeStyle = "#fff"; g.stroke();
        g.fillStyle = "#fff"; g.font = "bold 19px sans-serif"; g.fillText("Musterstadt", 64, 46);
        g.font = "bold 22px sans-serif"; g.fillText("500 m", 64, 82);
      } else if (typ.startsWith("z274_")) { // zulässige Höchstgeschwindigkeit
        g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fillStyle = "#fff"; g.fill(); g.lineWidth = 14; g.strokeStyle = "#d4202a"; g.stroke();
        g.fillStyle = "#111"; g.font = "bold 46px sans-serif"; g.fillText(typ.slice(5), 64, 67);
      } else if (typ === "z224") {                                   // Haltestelle
        g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fillStyle = "#f4c800"; g.fill(); g.lineWidth = 10; g.strokeStyle = "#1f8a4c"; g.stroke();
        g.fillStyle = "#1f8a4c"; g.font = "bold 64px sans-serif"; g.fillText("H", 64, 68);
      } else if (typ === "z276" || typ === "z280") {                 // Überholverbot / Ende
        const ende = typ === "z280";
        g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fillStyle = "#fff"; g.fill(); g.lineWidth = ende ? 4 : 14; g.strokeStyle = ende ? "#333" : "#d4202a"; g.stroke();
        const auto = (x, farbe) => { g.fillStyle = farbe; rund(x - 13, 40, 26, 50, 7); g.fill(); g.fillStyle = "#fff"; g.fillRect(x - 9, 48, 18, 10); g.fillStyle = farbe; g.fillRect(x - 15, 60, 3, 10); g.fillRect(x + 12, 60, 3, 10); };
        auto(46, ende ? "#8a8a8a" : "#d4202a"); auto(82, ende ? "#8a8a8a" : "#111");
        if (ende) { g.strokeStyle = "#333"; g.lineWidth = 3; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(26 + i * 6, 108 + i * 6); g.lineTo(102 + i * 6, 20 + i * 6); g.stroke(); } }
      } else if (typ === "zone30") {                                  // Zeichen 274.1 Tempo-30-Zone
        rund(10, 4, 108, 120, 8); g.fillStyle = "#fff"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#222"; g.stroke();
        g.beginPath(); g.arc(64, 52, 36, 0, 7); g.fillStyle = "#fff"; g.fill(); g.lineWidth = 9; g.strokeStyle = "#d4202a"; g.stroke();
        g.fillStyle = "#111"; g.font = "bold 32px sans-serif"; g.fillText("30", 64, 54); g.font = "bold 22px sans-serif"; g.fillText("ZONE", 64, 108);
      } else if (typ === "z205") {                                   // Vorfahrt gewähren
        g.beginPath(); g.moveTo(8, 14); g.lineTo(120, 14); g.lineTo(64, 118); g.closePath(); g.fillStyle = "#d4202a"; g.fill();
        g.beginPath(); g.moveTo(28, 26); g.lineTo(100, 26); g.lineTo(64, 94); g.closePath(); g.fillStyle = "#fff"; g.fill();
      } else if (typ === "z206") {                                   // Halt! Vorfahrt gewähren
        g.beginPath(); for (let i = 0; i < 8; i++) { const a = PI8 * (2 * i + 1); g.lineTo(64 + 58 * Math.cos(a), 64 + 58 * Math.sin(a)); } g.closePath(); g.fillStyle = "#fff"; g.fill();
        g.beginPath(); for (let i = 0; i < 8; i++) { const a = PI8 * (2 * i + 1); g.lineTo(64 + 53 * Math.cos(a), 64 + 53 * Math.sin(a)); } g.closePath(); g.fillStyle = "#c8202a"; g.fill();
        g.fillStyle = "#fff"; g.font = "bold 34px sans-serif"; g.fillText("STOP", 64, 66);
      } else if (typ === "z215") {                                   // Kreisverkehr
        g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fillStyle = blau; g.fill(); g.lineWidth = 4; g.strokeStyle = "#fff"; g.stroke();
        g.strokeStyle = "#fff"; g.lineWidth = 9; g.fillStyle = "#fff";
        for (let i = 0; i < 3; i++) { const a0 = -Math.PI / 2 + i * 2 * Math.PI / 3; g.beginPath(); g.arc(64, 64, 30, a0 + 0.35, a0 + 1.6); g.stroke(); const a1 = a0 + 0.35, px = 64 + 30 * Math.cos(a1), py = 64 + 30 * Math.sin(a1); g.beginPath(); g.moveTo(px + 12 * Math.cos(a1), py + 12 * Math.sin(a1)); g.lineTo(px - 12 * Math.cos(a1), py - 12 * Math.sin(a1)); g.lineTo(px + 14 * Math.sin(a1), py - 14 * Math.cos(a1)); g.closePath(); g.fill(); }
      } else if (typ === "z306") {                                   // Vorfahrtstraße
        g.save(); g.translate(64, 64); g.rotate(Math.PI / 4); g.fillStyle = "#fff"; g.fillRect(-42, -42, 84, 84); g.strokeStyle = "#333"; g.lineWidth = 2; g.strokeRect(-42, -42, 84, 84); g.fillStyle = "#f4c800"; g.fillRect(-28, -28, 56, 56); g.restore();
      } else if (typ === "z350") {                                   // Fußgängerüberweg
        rund(8, 8, 112, 112, 10); g.fillStyle = blau; g.fill(); g.lineWidth = 4; g.strokeStyle = "#fff"; g.stroke();
        g.beginPath(); g.moveTo(64, 18); g.lineTo(110, 104); g.lineTo(18, 104); g.closePath(); g.fillStyle = "#fff"; g.fill();
        g.fillStyle = "#111"; for (let i = 0; i < 4; i++) g.fillRect(34 + i * 16, 92, 9, 6);
        g.beginPath(); g.arc(66, 44, 6, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = "#111"; g.lineCap = "round";
        g.beginPath(); g.moveTo(65, 52); g.lineTo(61, 70); g.lineTo(52, 86); g.moveTo(61, 70); g.lineTo(70, 78); g.lineTo(72, 88); g.moveTo(64, 56); g.lineTo(54, 64); g.moveTo(64, 56); g.lineTo(74, 64); g.stroke();
      } else if (typ === "z531") { // Einengungstafel: rechter Fahrstreifen endet
        rund(6, 6, 116, 116, 10); g.fillStyle = "#f4c800"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#333"; g.stroke();
        g.fillStyle = "#111"; g.fillRect(34, 22, 12, 88); g.beginPath(); g.moveTo(74, 110); g.lineTo(86, 110); g.lineTo(86, 64); g.quadraticCurveTo(86, 46, 58, 34); g.lineTo(58, 22); g.lineTo(46, 40); g.lineTo(58, 56); g.lineTo(58, 44); g.quadraticCurveTo(74, 52, 74, 64); g.closePath(); g.fill();
      }
  });
}
function schildRueckseite(typ){
  return gemalt("schr_" + typ, 256, 256, function(g){
    g.drawImage(schildBild(typ), 0, 0);
    g.globalCompositeOperation = "source-in"; g.fillStyle = "#8f959b"; g.fillRect(0, 0, 256, 256);
  });
}
// Größe (Breite, Höhe) und Unterkante in Metern
function schildMass(typ, autobahn){
  if(typ === "vorweg" || typ === "weg") return { w: 3.4, h: 3.4, unten: 1.2, pfosten: 2 };
  if(typ === "z332") return { w: 2.8, h: 2.8, unten: 1.0, pfosten: 2 };
  if(typ.indexOf("z450") === 0) return { w: 1.1, h: 1.1, unten: 0.25, pfosten: 0 };
  if(typ === "z333") return { w: 1.4, h: 1.4, unten: 1.2, pfosten: 1 };
  if(typ === "z330") return { w: 1.3, h: 1.3, unten: 1.6, pfosten: 1 };
  const d = autobahn ? 1.05 : 0.75;
  return { w: d, h: d, unten: typ === "zone30" ? 1.6 : 2.0, pfosten: 1 };
}

/* ---------------------------------------------------------------------
   Welt aufbauen
   --------------------------------------------------------------------- */
// def = strasse aus den Szenendaten (Kompass-Koordinaten: [x, y] -> hier [x, z])
// opt.spuren: Liste von Bahnen [[x, z, dx, dz], ...] zum Ausrichten der Schilder
export function baueKompassWelt(welt, def, opt){
  opt = opt || {};
  const M = welt.M, g = new THREE.Group(), fest = new THREE.Group();
  const autobahn = opt.kategorie === "autobahn";
  const bx = def.bereich || [-100, 100];
  const mx = (bx[0] + bx[1]) / 2, breite = Math.max(400, bx[1] - bx[0] + 600);
  // Grundfläche (Wiese) weit über den Bereich hinaus
  const grund = new THREE.Mesh(new THREE.PlaneGeometry(breite, breite).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: weltTextur(B.grasTextur(), 4), color: new THREE.Color(def.boden3d || "#6f9a55").lerp(new THREE.Color("#ffffff"), 0.35), roughness: 1, depthWrite: false }));
  grund.position.set(mx, -0.02, 0); grund.receiveShadow = true; grund.renderOrder = -0.95; g.add(grund);

  // Flächen in Zeichenreihenfolge; gleiche Art hintereinander wird zusammengefasst
  const fl = (def.flaechen || []).filter(function(f){ return !(f.art === "gruen" && !f.zeigen3d); });
  let lauf = null;
  const laeufe = [];
  fl.forEach(function(f){
    const k = f.art + (f.farbe || "");
    if(lauf && lauf.k === k) lauf.polys.push(f.poly); else { lauf = { k: k, art: f.art, farbe: f.farbe, polys: [f.poly] }; laeufe.push(lauf); }
  });
  laeufe.forEach(function(l, i){
    const m = new THREE.Mesh(flaechenGeo(l.polys, 0), flaechenMaterial(welt, l.art, l.farbe));
    m.renderOrder = -0.9 + i * 0.001; m.receiveShadow = true; g.add(m);
    if(l.art === "sperr" || l.art === "baustelle"){
      // Schraffur wie auf der Straße: Querstreifen alle 4 m
      const streifen = [];
      l.polys.forEach(function(poly){
        const xs = poly.map(function(p){ return p[0]; });
        for(let x = Math.min.apply(null, xs); x < Math.max.apply(null, xs); x += 4){ const c = clipX(poly, x, x + 1.2); if(c.length >= 3) streifen.push(c); }
      });
      if(streifen.length){
        const sm = new THREE.Mesh(flaechenGeo(streifen, 0), new THREE.MeshStandardMaterial({ color: l.art === "baustelle" ? 0xe9b82a : 0xefefe9, roughness: 0.65, depthWrite: false }));
        sm.renderOrder = -0.9 + i * 0.001 + 0.0005; sm.receiveShadow = true; g.add(sm);
      }
    }
  });

  // Markierungen
  const nachFarbe = {};
  (def.linien || []).forEach(function(l){
    if(l.art === "planke") return;
    const farbe = l.farbe || "#f2f2ee", b = l.b || 0.15, P = linienPfad(l.pts), m = strichMuster(l.art);
    const liste = nachFarbe[farbe] || (nachFarbe[farbe] = []);
    if(!m){ band(l.pts, b, 0, liste); return; }
    const per = m[0] + m[1];
    for(let s = 0; s < P.laenge; s += per) band(P.stueck(s, Math.min(P.laenge, s + m[0])), b, 0, liste);
  });
  Object.keys(nachFarbe).forEach(function(farbe){
    if(!nachFarbe[farbe].length) return;
    const mk = new THREE.Mesh(geoAus(nachFarbe[farbe]), new THREE.MeshStandardMaterial({ color: new THREE.Color(farbe), roughness: 0.6, depthWrite: false, side: THREE.DoubleSide }));
    mk.renderOrder = -0.5; mk.receiveShadow = true; g.add(mk);
  });

  // Schutzplanken: Pfosten alle 2 m, Holm aus Stahl
  const planken = (def.linien || []).filter(function(l){ return l.art === "planke"; });
  if(planken.length){
    const holm = [], pfosten = [];
    planken.forEach(function(l){
      wand(l.pts, 0.5, 0.82, holm, 0);
      const P = linienPfad(l.pts);
      for(let s = 0; s < P.laenge; s += 2) pfosten.push(P.an(s));
    });
    const stahl = new THREE.MeshStandardMaterial({ color: 0xc3c8cd, metalness: 0.75, roughness: 0.35, side: THREE.DoubleSide });
    const hm = new THREE.Mesh(geoAus(holm), stahl); hm.castShadow = true; hm.receiveShadow = true; fest.add(hm);
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.8, 0.12), stahl, pfosten.length);
    const dm = new THREE.Object3D();
    pfosten.forEach(function(p, i){ dm.position.set(p[0], 0.4, p[1]); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); });
    im.castShadow = true; g.add(im);
  }

  // Bordsteine (12 cm hoch) und erhöhte Inseln
  const kante = new THREE.MeshStandardMaterial({ color: 0xb9b8b2, roughness: 0.85 });
  const kanteOben = new THREE.MeshStandardMaterial({ color: 0xbebdb7, roughness: 0.85, side: THREE.DoubleSide });
  const bord = (def.bordsteine && def.bordsteine.length) ? def.bordsteine : (autobahn || opt.kategorie === "ueberland" ? [] : autoBordsteine(fl));
  if(bord.length){
    const oben = [], seiten = [];
    bord.forEach(function(bs){
      band(bs.pts, 0.18, 0.12, oben);
      wand(bs.pts, 0, 0.12, seiten, 0.09); wand(bs.pts, 0, 0.12, seiten, -0.09);
    });
    const bm = new THREE.Mesh(geoAus(oben), kanteOben); bm.receiveShadow = true; fest.add(bm);
    const sm = new THREE.Mesh(geoAus(seiten), new THREE.MeshStandardMaterial({ color: 0xa6a59f, roughness: 0.9, side: THREE.DoubleSide })); sm.receiveShadow = true; fest.add(sm);
  }
  (def.flaechen || []).filter(function(f){ return f.art === "insel" || (f.art === "gruen2" && flaeche(f.poly) < 90); }).forEach(function(f){
    const s = new THREE.Shape(f.poly.map(function(p){ return new THREE.Vector2(p[0], -p[1]); }));
    const eg = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false, curveSegments: 4 });
    eg.rotateX(-Math.PI / 2);
    const im = new THREE.Mesh(eg, [flaechenMaterial(welt, "insel_oben"), kante]);
    im.receiveShadow = true; im.castShadow = true; g.add(im);
  });

  // Häuser, Bäume, Poller, Ampeln
  const objekte = def.objekte || [];
  const wandMat = {}, dachMat = {};
  objekte.filter(function(o){ return o.art === "haus"; }).forEach(function(o){
    const wm = wandMat[o.farbe] || (wandMat[o.farbe] = new THREE.MeshStandardMaterial({ color: new THREE.Color(o.farbe || "#d9cfbf"), roughness: 0.92 }));
    const dmM = dachMat[o.dach] || (dachMat[o.dach] = new THREE.MeshStandardMaterial({ color: new THREE.Color(o.dach || "#a7553f"), roughness: 0.8, flatShading: true }));
    fest.add(stadtHaus(M, o, wm, dmM));
  });
  const baeume = objekte.filter(function(o){ return o.art === "baum"; }).map(function(o){ const r = o.r || 2.2; return { x: o.x, z: o.y, h: 2.6 + r * 2.2, art: "laub" }; });
  if(autobahn || opt.kategorie === "ueberland") landschaft(def, baeume);
  if(baeume.length) g.add(B.baueBaeume(M, baeume, zufall(5), function(b){ return Math.abs(b.z) < 70 && Math.abs(b.x - mx) < 400; }));
  const poller = objekte.filter(function(o){ return o.art === "poller" || o.art === "bake" || o.art === "kegel"; });
  if(poller.length){
    const pm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.09, 0.9, 10), new THREE.MeshStandardMaterial({ color: 0x5f6368, metalness: 0.4, roughness: 0.5 }), poller.length);
    const rm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.083, 0.083, 0.08, 10), M.rueckstrahler, poller.length);
    const dm = new THREE.Object3D();
    poller.forEach(function(o, i){ dm.position.set(o.x, 0.45, o.y); dm.updateMatrix(); pm.setMatrixAt(i, dm.matrix); dm.position.y = 0.78; dm.updateMatrix(); rm.setMatrixAt(i, dm.matrix); });
    pm.castShadow = true; g.add(pm, rm);
  }
  const ampeln = objekte.filter(function(o){ return o.art === "ampel"; }).map(function(o){ return baueAmpel(M, o); });
  ampeln.forEach(function(a){ g.add(a.gruppe); });
  welt.ticker = (welt.ticker || []).filter(function(fn){ return !fn.stadt; });
  const tick = function(t){ ampeln.forEach(function(a){ a.stellen(t); }); }; tick.stadt = true;
  welt.ticker.push(tick);

  // Schilder: Blickrichtung aus den Bahnen (dem Verkehr zugewandt, der sie rechts passiert)
  (def.schilder || []).forEach(function(sc){ fest.add(baueStadtSchild(M, sc, ausrichtung(sc, opt.spuren || []), autobahn)); });

  // Horizont: Hügel, Wolken
  if(!welt.wolken){ welt.wolken = B.baueWolken(M); welt.szene.add(welt.wolken); }
  const hr = zufall(9);
  for(let n = 0; n < 14; n++){
    const hg = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.huegel);
    const ang = n / 14 * Math.PI * 2 + hr() * 0.3, dist = 1500 + hr() * 500;
    hg.position.set(mx + Math.cos(ang) * dist, -2, Math.sin(ang) * dist);
    hg.scale.set(260 + hr() * 380, 40 + hr() * 90, 220 + hr() * 280); hg.castShadow = false;
    g.add(hg);
  }
  B.verschmelzen(fest, function(){ return false; });
  g.add(fest);
  welt.szene.add(g);
  return g;
}

function flaeche(poly){ let a = 0; for(let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]); return Math.abs(a / 2); }
// Bordsteine automatisch: dort, wo eine Fahrbahnfläche an Gehweg oder Grün grenzt
const FAHRBAHN = { asphalt: 1, asphalt2: 1, parken: 1, weiss: 1, sperr: 1, baustelle: 1, pflaster: 1 };
function oberste(fl, x, z){
  for(let i = fl.length - 1; i >= 0; i--) if(punktIn(fl[i].poly, x, z)) return fl[i].art;
  return "gruen";
}
function punktIn(poly, x, z){
  let c = false;
  for(let i = 0, j = poly.length - 1; i < poly.length; j = i++){
    const a = poly[i], b = poly[j];
    if(((a[1] > z) !== (b[1] > z)) && (x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0])) c = !c;
  }
  return c;
}
function autoBordsteine(fl){
  const out = [];
  fl.forEach(function(f){
    if(!FAHRBAHN[f.art] || f.art === "weiss") return;
    const P = f.poly;
    for(let i = 0; i < P.length; i++){
      const a = P[i], b = P[(i + 1) % P.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if(L < 0.2) continue;
      const nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L;
      // Stücke von höchstens 2 m prüfen: außen Gehweg/Grün, innen Fahrbahn
      const n = Math.ceil(L / 2);
      for(let k = 0; k < n; k++){
        const t0 = k / n, t1 = (k + 1) / n, mx = a[0] + (b[0] - a[0]) * (t0 + t1) / 2, mz = a[1] + (b[1] - a[1]) * (t0 + t1) / 2;
        const s1 = oberste(fl, mx + nx * 0.35, mz + nz * 0.35), s2 = oberste(fl, mx - nx * 0.35, mz - nz * 0.35);
        const aussen = FAHRBAHN[s1] ? s2 : s1, innen = FAHRBAHN[s1] ? s1 : s2;
        if(!FAHRBAHN[innen] || FAHRBAHN[aussen] || aussen === "rad") continue;
        out.push({ pts: [[a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1]] });
      }
    }
  });
  return out;
}
// Autobahn und Landstraße: Bäume und Sträucher abseits der Fahrbahn
function landschaft(def, baeume){
  const rnd = zufall(33), bx = def.bereich || [-300, 300];
  let zMin = Infinity, zMax = -Infinity;
  (def.flaechen || []).forEach(function(f){ if(f.art === "gruen") return; f.poly.forEach(function(p){ zMin = Math.min(zMin, p[1]); zMax = Math.max(zMax, p[1]); }); });
  if(!isFinite(zMin)){ zMin = -15; zMax = 15; }
  const frei = function(x, z){
    return !(def.flaechen || []).some(function(f){
      if(f.art === "gruen" || f.art === "gruen2") return false;
      return innen(f.poly, x, z, 6);
    });
  };
  for(let n = 0; n < 420; n++){
    const x = bx[0] - 200 + rnd() * (bx[1] - bx[0] + 400), seite = rnd() < 0.5 ? 1 : -1;
    const z = seite > 0 ? zMax + 14 + rnd() * rnd() * 260 : zMin - 14 - rnd() * rnd() * 260;
    if(!frei(x, z)) continue;
    baeume.push({ x: x, z: z, h: 8 + rnd() * 9, art: rnd() < 0.25 ? "nadel" : "laub" });
  }
}
// Punkt in Polygon (mit Rand r als grober Abstand über die Bounding-Box)
function innen(poly, x, z, r){
  let minx = Infinity, maxx = -Infinity, minz = Infinity, maxz = -Infinity;
  poly.forEach(function(p){ minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); minz = Math.min(minz, p[1]); maxz = Math.max(maxz, p[1]); });
  if(x < minx - r || x > maxx + r || z < minz - r || z > maxz + r) return false;
  let c = false;
  for(let i = 0, j = poly.length - 1; i < poly.length; j = i++){
    const a = poly[i], b = poly[j];
    if(((a[1] > z) !== (b[1] > z)) && (x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0])) c = !c;
  }
  if(c) return true;
  // grob: auch knapp daneben zählt als "belegt"
  return [[r, 0], [-r, 0], [0, r], [0, -r]].some(function(o){ return punktIn(poly, x + o[0], z + o[1]); });
}

function stadtHaus(M, o, wandMat, dachMat){
  const g = new THREE.Group();
  const L = o.l, Bt = o.b, H = o.hoehe || 7;
  const k = B.kiste(L, H, Bt, wandMat, 0, H / 2, 0); k.receiveShadow = true; g.add(k);
  // Sockel etwas dunkler
  g.add(B.kiste(L + 0.04, 0.5, Bt + 0.04, M.kunststoff, 0, 0.25, 0));
  // Fenster je Geschoss (3 m) auf allen vier Seiten
  const geschosse = Math.max(1, Math.floor((H - 0.6) / 3));
  [[L, Bt / 2 + 0.012, 0], [L, -Bt / 2 - 0.012, Math.PI], [Bt, L / 2 + 0.012, Math.PI / 2], [Bt, -L / 2 - 0.012, -Math.PI / 2]].forEach(function(s){
    const n = Math.max(1, Math.round(s[0] / 3.1));
    for(let i = 0; i < n; i++) for(let e = 0; e < geschosse; e++){
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.35), M.fenster);
      const u = -s[0] / 2 + (i + 0.5) * s[0] / n, y = 1.5 + e * 3;
      if(s[2] === 0 || s[2] === Math.PI){ f.position.set(u, y, s[1]); f.rotation.y = s[2]; }
      else { f.position.set(s[1], y, u); f.rotation.y = s[2]; }
      g.add(f);
    }
  });
  if(H <= 10 && Math.min(L, Bt) <= 13){
    // Satteldach über die lange Seite
    const lang = L >= Bt, w = lang ? Bt : L, d = lang ? L : Bt, hoch = Math.min(4.5, w * 0.42);
    const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.35, 0); s.lineTo(w / 2 + 0.35, 0); s.lineTo(0, hoch); s.closePath();
    const dg = new THREE.ExtrudeGeometry(s, { depth: d + 0.5, bevelEnabled: false }); dg.translate(0, 0, -(d + 0.5) / 2);
    const dm = new THREE.Mesh(dg, dachMat); dm.position.y = H; if(lang) dm.rotation.y = Math.PI / 2; dm.castShadow = true; g.add(dm);
  } else {
    g.add(B.kiste(L + 0.3, 0.45, Bt + 0.3, dachMat, 0, H + 0.2, 0));
  }
  g.position.set(o.x, 0, o.y); g.rotation.y = -(o.h || 0);
  return g;
}

const LAMPE = { rot: [1, 0, 0], rotgelb: [1, 1, 0], gelb: [0, 1, 0], gruen: [0, 0, 1], aus: [0, 0, 0] };
function ampelFarbe(o, t){ const ph = o.phasen || []; for(let i = 0; i < ph.length; i++) if(t < ph[i][0]) return ph[i][1]; return ph.length ? ph[ph.length - 1][1] : "rot"; }
function baueAmpel(M, o){
  const g = new THREE.Group();
  const n = o.fuss ? 2 : 3, hk = n * 0.33 + 0.12, z0 = 2.3;
  g.add(B.kiste(0.12, z0 + hk, 0.12, M.mast, 0, (z0 + hk) / 2, 0));
  const geh = B.kiste(0.26, hk, 0.36, M.schwarz, 0.12, z0 + hk / 2, 0); g.add(geh);
  const farben = o.fuss ? [0xff3b2f, 0x39d06a] : [0xff3b2f, 0xffc21a, 0x39d06a];
  const mats = farben.map(function(c){ return new THREE.MeshStandardMaterial({ color: new THREE.Color(c).multiplyScalar(0.25), emissive: c, emissiveIntensity: 0, roughness: 0.3 }); });
  mats.forEach(function(m, i){
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), m);
    l.position.set(0.255, z0 + hk - 0.2 - i * 0.33, 0); l.rotation.y = Math.PI / 2; g.add(l);
    // Blende über der Lampe
    const sch = B.kiste(0.12, 0.02, 0.24, M.schwarz, 0.3, z0 + hk - 0.08 - i * 0.33, 0); g.add(sch);
  });
  if(o.gruenpfeil){
    // Zeichen 720: grüner Pfeil auf schwarzem Blech rechts neben dem Rotlicht
    const c = B.leinwand(128, 128, function(ctx){
      ctx.fillStyle = "#111316"; ctx.fillRect(0, 0, 128, 128); ctx.fillStyle = "#2fbf5a";
      ctx.beginPath(); ctx.moveTo(22, 54); ctx.lineTo(70, 54); ctx.lineTo(70, 34); ctx.lineTo(106, 64); ctx.lineTo(70, 94); ctx.lineTo(70, 74); ctx.lineTo(22, 74); ctx.closePath(); ctx.fill();
    });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshStandardMaterial({ map: B.textur(c), roughness: 0.6 }));
    p.position.set(0.27, z0 + hk - 0.2, 0.36); p.rotation.y = Math.PI / 2; g.add(p);
  }
  g.position.set(o.x, 0, o.y); g.rotation.y = -(o.h || 0);
  g.traverse(function(m){ if(m.isMesh) m.castShadow = true; });
  return { gruppe: g, stellen: function(t){
    const f = LAMPE[ampelFarbe(o, t)] || LAMPE.aus, an = o.fuss ? [f[0], f[2]] : f;
    mats.forEach(function(m, i){ m.emissiveIntensity = an[i] ? 3.2 : 0; m.color.setHex(an[i] ? farben[i] : 0x1a1a1a); });
  } };
}

// Blickrichtung eines Schildes: gegen die Fahrtrichtung des nächsten Verkehrs, der rechts daran vorbeifährt
function ausrichtung(sc, spuren){
  let best = null, bd = 1e9;
  spuren.forEach(function(sp, si){
    for(let i = 0; i < sp.length; i++){
      const p = sp[i], dx = sc.x - p[0], dz = sc.y - p[1];
      const vor = dx * p[2] + dz * p[3], rechts = -dx * p[3] + dz * p[2];
      if(vor < 3 || vor > 45 || rechts < 0.5 || rechts > 16) continue;
      const d = vor * 0.4 + rechts + si * 0.5;
      if(d < bd){ bd = d; best = [p[2], p[3]]; }
    }
  });
  return best ? Math.atan2(-best[0], -best[1]) : -Math.PI / 2;
}
function baueStadtSchild(M, sc, rotY, autobahn){
  const g = new THREE.Group(), m = schildMass(sc.typ, autobahn);
  const vorne = new THREE.MeshStandardMaterial({ map: B.textur(schildBild(sc.typ)), transparent: true, alphaTest: 0.5, roughness: 0.45 });
  const hinten = new THREE.MeshStandardMaterial({ map: B.textur(schildRueckseite(sc.typ)), transparent: true, alphaTest: 0.5, roughness: 0.6 });
  const pl = new THREE.PlaneGeometry(m.w, m.h);
  const yM = m.unten + m.h / 2;
  const f = new THREE.Mesh(pl, vorne), h = new THREE.Mesh(pl, hinten);
  f.position.y = h.position.y = yM; f.position.z = 0.03; h.position.z = -0.01; h.rotation.y = Math.PI; f.castShadow = true;
  g.add(f, h);
  const hoch = m.unten + m.h * 0.85;
  if(m.pfosten === 2){ [-1, 1].forEach(function(s){ const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, hoch, 10), M.mast); p.position.set(s * m.w * 0.32, hoch / 2, 0); p.castShadow = true; g.add(p); }); }
  else if(m.pfosten === 1){ const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, hoch, 10), M.mast); p.position.set(0, hoch / 2, 0); p.castShadow = true; g.add(p); }
  g.position.set(sc.x, 0, sc.y); g.rotation.y = rotY;
  return g;
}

/* ---------------------------------------------------------------------
   Verkehrsteilnehmer
   --------------------------------------------------------------------- */
function leereLichter(){
  const d = {};
  return { mats: { front: d, heck: d, bremse: {}, blinkL: {}, blinkR: {} }, glanzFront: [], glanzHeck: [], glanzBlinkL: [], glanzBlinkR: [] };
}
function hash(s){ let h = 7; for(let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
const BUCHST = "ABCDEFGHKLMNPRSTUVWZ";
function kennzeichen(id){ const h = hash(id); return ["OF", "DA", "F", "HU", "GG"][h % 5] + " · " + BUCHST[(h >> 3) % 20] + BUCHST[(h >> 8) % 20] + " " + (10 + (h >> 12) % 89); }

export function baueTeilnehmer(M, f, i){
  let bau;
  const seed = 20 + i;
  if(f.typ === "fahrschule") bau = bauePkw(M, { art: f.art || "kompakt", farbe: f.farbe, fahrschule: true, kennzeichen: f.kennzeichen || "FA · FS 26", seed: seed });
  else if(f.typ === "pkw") bau = bauePkw(M, { art: f.art || ["kompakt", "kombi", "suv", "kompakt", "kombi"][hash(f.id) % 5], farbe: f.farbe, kennzeichen: f.kennzeichen || kennzeichen(f.id), seed: seed });
  else if(f.typ === "transporter") bau = bauePkw(M, { art: "transporter", farbe: f.farbe, kennzeichen: f.kennzeichen || kennzeichen(f.id), seed: seed });
  else if(f.typ === "lkw") bau = baueLkw(M, { farbe: f.farbe, aufbau: f.aufbau || "#e2e4e6", seed: seed, kennzeichen: f.kennzeichen || kennzeichen(f.id) });
  else if(f.typ === "traktor") bau = baueTraktor(M, { farbe: f.farbe });
  else if(f.typ === "bus") bau = baueBus(M, f);
  else if(f.typ === "rtw") bau = baueRtw(M, f, seed);
  else if(f.typ === "rad") bau = baueRadfahrer(M, f);
  else if(f.typ === "ball") bau = baueBall(f);
  else if(f.typ === "fussgaenger" || f.typ === "kind") bau = bauePerson(M, f, f.typ === "kind");
  else bau = bauePkw(M, { farbe: f.farbe, seed: seed });
  if(f.geist){
    // Vergleichsfahrt: halbdurchsichtig
    bau.gruppe.traverse(function(o){
      if(!o.isMesh || !o.material) return;
      const alt = o.material, neu = Array.isArray(alt) ? alt.map(function(m){ return m.clone(); }) : alt.clone();
      (Array.isArray(neu) ? neu : [neu]).forEach(function(m){ m.transparent = true; m.opacity = 0.42; m.depthWrite = false; });
      o.material = neu; o.castShadow = false;
    });
  }
  return bau;
}

function baueBus(M, f){
  const g = new THREE.Group(), L = 12, Bt = 2.55, H = 3.05, halb = L / 2;
  const lack = new THREE.MeshStandardMaterial({ color: new THREE.Color(f.farbe || "#f2c230"), metalness: 0.35, roughness: 0.4 });
  // Aufbau mit gerundeten Ecken (Seitenprofil extrudiert)
  const s = new THREE.Shape(), r = 0.35, y0 = 0.35;
  s.moveTo(-halb, y0); s.lineTo(halb - 0.1, y0); s.lineTo(halb, y0 + 0.4); s.lineTo(halb, H - r); s.quadraticCurveTo(halb, H, halb - r, H); s.lineTo(-halb + r, H); s.quadraticCurveTo(-halb, H, -halb, H - r); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: Bt - 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
  geo.translate(0, 0, -(Bt - 0.1) / 2);
  const k = new THREE.Mesh(geo, lack); k.castShadow = true; k.receiveShadow = true; g.add(k);
  // Fensterband beidseitig, Türen rechts
  [1, -1].forEach(function(sz){
    const z = (Bt / 2 + 0.01) * sz;
    const q = [[-halb + 0.5, 1.25], [halb - 0.9, 1.25], [halb - 0.9, 2.6], [-halb + 0.5, 2.6]];
    const o = sz > 0 ? [q[0], q[3], q[2], q[1]] : q;
    g.add(B.viereck([o[0][0], o[0][1], z], [o[1][0], o[1][1], z], [o[2][0], o[2][1], z], [o[3][0], o[3][1], z], M.glas));
    for(let x = -halb + 1.8; x < halb - 1.2; x += 1.6) g.add(B.kiste(0.08, 1.35, 0.02, lack, x, 1.93, z + 0.005 * sz));
  });
  [halb - 1.6, -0.6].forEach(function(x){ g.add(B.kiste(1.2, 2.2, 0.02, M.glas, x, 1.5, Bt / 2 + 0.025)); g.add(B.kiste(0.04, 2.2, 0.03, M.kunststoff, x, 1.5, Bt / 2 + 0.035)); });
  // Frontscheibe, Heckscheibe
  g.add(B.viereck([halb + 0.012, 1.1, -Bt / 2 + 0.12], [halb + 0.012, 1.1, Bt / 2 - 0.12], [halb + 0.012, 2.8, Bt / 2 - 0.12], [halb + 0.012, 2.8, -Bt / 2 + 0.12], M.glas));
  g.add(B.viereck([-halb - 0.012, 1.7, Bt / 2 - 0.2], [-halb - 0.012, 1.7, -Bt / 2 + 0.2], [-halb - 0.012, 2.6, -Bt / 2 + 0.2], [-halb - 0.012, 2.6, Bt / 2 - 0.2], M.glas));
  g.add(B.kiste(0.12, 0.3, Bt, M.kunststoff, halb, 0.5, 0)); g.add(B.kiste(0.12, 0.3, Bt, M.kunststoff, -halb, 0.5, 0));
  // Zielanzeige / Schulbus-Schild
  const text = f.schulbus ? "SCHULBUS" : "12 Bahnhof";
  const anz = new THREE.MeshStandardMaterial({ map: B.textur(B.schriftTextur(text, { w: 512, h: 96, grund: "#111", farbe: "#ffb020", gross: 0.62 })), emissive: 0xffb020, emissiveIntensity: 0.25, emissiveMap: B.textur(B.schriftTextur(text, { w: 512, h: 96, grund: "#111", farbe: "#ffb020", gross: 0.62 })) });
  const za = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.34), anz); za.rotation.y = Math.PI / 2; za.position.set(halb + 0.02, 2.85, 0); g.add(za);
  if(f.schulbus){
    // Kennzeichnung für Schulbusse (orange Tafel mit Kindern) vorne und hinten
    const c = B.leinwand(256, 256, function(ctx){
      ctx.fillStyle = "#f28c1a"; ctx.fillRect(0, 0, 256, 256); ctx.strokeStyle = "#111"; ctx.lineWidth = 10; ctx.strokeRect(8, 8, 240, 240);
      ctx.fillStyle = "#111";
      [[92, 1], [160, 0.85]].forEach(function(p){ const x = p[0], k = p[1]; ctx.beginPath(); ctx.arc(x, 78 + (1 - k) * 40, 20 * k, 0, 7); ctx.fill(); ctx.fillRect(x - 18 * k, 104 + (1 - k) * 40, 36 * k, 64 * k); ctx.fillRect(x - 16 * k, 168 + (1 - k) * 40, 12 * k, 48 * k); ctx.fillRect(x + 4 * k, 168 + (1 - k) * 40, 12 * k, 48 * k); });
    });
    const tm = new THREE.MeshStandardMaterial({ map: B.textur(c), roughness: 0.5 });
    const v = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), tm); v.rotation.y = Math.PI / 2; v.position.set(halb + 0.03, 0.95, 0.55); g.add(v);
    const h = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), tm); h.rotation.y = -Math.PI / 2; h.position.set(-halb - 0.03, 1.2, 0); g.add(h);
  }
  const lichter = { glanzFront: [], glanzHeck: [], glanzBlinkL: [], glanzBlinkR: [] };
  const matS = M.scheinwerfer(), matR = M.ruecklicht(), matB = M.ruecklicht(), matBL = M.blinker(), matBR = M.blinker();
  lichter.mats = { front: matS, heck: matR, bremse: matB, blinkL: matBL, blinkR: matBR };
  [1, -1].forEach(function(sz){
    g.add(B.kiste(0.06, 0.16, 0.34, matS, halb + 0.04, 0.8, (Bt / 2 - 0.3) * sz));
    g.add(B.kiste(0.06, 0.1, 0.14, sz < 0 ? matBL : matBR, halb + 0.04, 0.8, (Bt / 2 - 0.06) * sz));
    g.add(B.kiste(0.06, 0.3, 0.14, matR, -halb - 0.04, 1.0, (Bt / 2 - 0.12) * sz));
    g.add(B.kiste(0.06, 0.14, 0.14, matB, -halb - 0.04, 0.72, (Bt / 2 - 0.12) * sz));
    g.add(B.kiste(0.06, 0.14, 0.14, sz < 0 ? matBL : matBR, -halb - 0.04, 1.3, (Bt / 2 - 0.12) * sz));
    [halb + 0.15, -halb - 0.15].forEach(function(bx){
      const gb = new THREE.Sprite(M.glanzGelb.clone()); gb.position.set(bx, bx > 0 ? 0.8 : 1.3, (Bt / 2 - 0.08) * sz); gb.scale.set(0.8, 0.8, 1);
      g.add(gb); (sz < 0 ? lichter.glanzBlinkL : lichter.glanzBlinkR).push(gb);
    });
    const gh = new THREE.Sprite(M.glanzRot.clone()); gh.position.set(-halb - 0.2, 0.72, (Bt / 2 - 0.12) * sz); gh.scale.set(0.8, 0.8, 1); g.add(gh); lichter.glanzHeck.push(gh);
  });
  const raeder = [];
  [[halb - 2.7, true], [halb - 2.7 - 5.9, false]].forEach(function(a){
    [1, -1].forEach(function(sz){
      const lenk = new THREE.Group(); lenk.position.set(a[0], 0.5, (Bt / 2 - 0.22) * sz);
      const r = B.rad(M, 0.5, 0.32, { seite: sz, speichen: 8, dunkel: true }); lenk.add(r); g.add(lenk);
      raeder.push({ dreh: r, lenk: a[1] ? lenk : null, r: 0.5 });
    });
  });
  const fahrer = B.insasse(M, zufall(3)); fahrer.gruppe.position.set(halb - 1.2, 1.05, -0.6); g.add(fahrer.gruppe);
  for(let x = -halb + 1.5; x < halb - 2.5; x += 2.2){ const p = B.insasse(M, zufall(x * 10 + 50 | 0)); p.gruppe.position.set(x, 1.05, (x * 7 | 0) % 2 ? 0.7 : -0.7); g.add(p.gruppe); }
  const radGr = raeder.map(function(r){ return r.lenk; });
  B.verschmelzen(g, function(o){ return o.isSprite || o === fahrer.kopf || radGr.indexOf(o) !== -1; });
  return { gruppe: g, raeder: raeder, lichter: lichter, kopf: fahrer.kopf, laenge: L, breite: Bt, hoehe: H, augen: { x: halb - 1.1, y: 2.4, z: -0.6 } };
}

function baueRtw(M, f, seed){
  const bau = bauePkw(M, { art: "transporter", farbe: f.farbe || "#f4f4f1", kennzeichen: "OF · RD 112", seed: seed });
  const g = bau.gruppe, L = bau.laenge, Bt = bau.breite;
  // Leuchtstreifen und Blaulichtbalken
  const rot = new THREE.MeshStandardMaterial({ color: 0xd8262a, roughness: 0.45 });
  [1, -1].forEach(function(s){ g.add(B.kiste(L * 0.92, 0.22, 0.02, rot, 0, 1.05, (Bt / 2 + 0.03) * s)); });
  const blau = new THREE.MeshStandardMaterial({ color: 0x1b3a8a, emissive: 0x3a74ff, emissiveIntensity: 0, roughness: 0.3 });
  const balken = B.kiste(0.3, 0.14, 1.3, blau, L * 0.25, 2.66, 0); g.add(balken);
  const hinten = B.kiste(0.2, 0.12, 0.3, blau, -L / 2 + 0.2, 2.64, 0.7); g.add(hinten);
  const hinten2 = B.kiste(0.2, 0.12, 0.3, blau, -L / 2 + 0.2, 2.64, -0.7); g.add(hinten2);
  const txt = new THREE.MeshStandardMaterial({ map: B.textur(B.schriftTextur("RETTUNGSDIENST", { w: 768, h: 110, farbe: "#d8262a", grund: "#f4f4f1", gross: 0.6 })), roughness: 0.5 });
  [1, -1].forEach(function(s){ const p = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.37), txt); p.position.set(-0.4, 1.7, (Bt / 2 + 0.03) * s); if(s < 0) p.rotation.y = Math.PI; g.add(p); });
  bau.lichter.rundum = blau;
  return bau;
}

// Mensch zu Fuß: Beine und Arme schwingen mit dem zurückgelegten Weg
function bauePerson(M, f, kind){
  const g = new THREE.Group(), k = kind ? 0.68 : 1, rnd = zufall(hash(f.id));
  const kleid = new THREE.MeshStandardMaterial({ color: new THREE.Color(f.farbe || "#3a6ea5"), roughness: 0.85 });
  const hose = new THREE.MeshStandardMaterial({ color: kind ? 0x3b4a66 : [0x2d3340, 0x3b4a66, 0x4a3f33][hash(f.id) % 3], roughness: 0.9 });
  const haut = rnd() < 0.3 ? M.hautDunkel : M.haut;
  const huefte = 0.92 * k;
  const bein = function(sz){
    const p = new THREE.Group(); p.position.set(0, huefte, 0.1 * k * sz);
    const o = new THREE.Mesh(new THREE.CapsuleGeometry(0.065 * k, huefte - 0.16 * k, 4, 8), hose); o.position.y = -huefte / 2 + 0.02; o.castShadow = true; p.add(o);
    const s = B.kiste(0.24 * k, 0.08 * k, 0.1 * k, M.schwarz, 0.05 * k, -huefte + 0.04 * k, 0); p.add(s);
    g.add(p); return p;
  };
  const arm = function(sz){
    const p = new THREE.Group(); p.position.set(0, huefte + 0.5 * k, 0.24 * k * sz);
    const o = new THREE.Mesh(new THREE.CapsuleGeometry(0.05 * k, 0.5 * k, 4, 8), kleid); o.position.y = -0.3 * k; o.castShadow = true; p.add(o);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.05 * k, 8, 6), haut); h.position.y = -0.6 * k; p.add(h);
    g.add(p); return p;
  };
  const bl = bein(-1), br = bein(1), al = arm(-1), ar = arm(1);
  const rumpf = new THREE.Mesh(new THREE.CapsuleGeometry(0.17 * k, 0.4 * k, 4, 10), kleid);
  rumpf.position.y = huefte + 0.3 * k; rumpf.scale.set(0.75, 1, 1.15); rumpf.castShadow = true; g.add(rumpf);
  const kopf = new THREE.Group(); kopf.position.y = huefte + 0.78 * k;
  const ge = new THREE.Mesh(new THREE.SphereGeometry(0.11 * k, 14, 10), haut); ge.castShadow = true; kopf.add(ge);
  const ha = new THREE.Mesh(new THREE.SphereGeometry(0.117 * k, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), M.haar); ha.rotation.z = 0.3; ha.position.x = -0.01; kopf.add(ha);
  g.add(kopf);
  if(kind){ const rs = B.kiste(0.14, 0.3, 0.3, new THREE.MeshStandardMaterial({ color: 0xe0b020, roughness: 0.7 }), -0.16, huefte + 0.35 * k, 0); g.add(rs); }
  const schritt = 1.3 * k;
  return { gruppe: g, raeder: [], lichter: null, laenge: 0.45, breite: 0.6, hoehe: 1.75 * k, augen: { x: 0.1, y: 1.6 * k, z: 0 },
    animiere: function(p){
      const w = (p.s || 0) / schritt * Math.PI * 2, a = Math.min(1, (p.v || 0) / 0.9) * 0.55;
      bl.rotation.z = Math.sin(w) * a; br.rotation.z = -Math.sin(w) * a;
      al.rotation.z = -Math.sin(w) * a * 0.8; ar.rotation.z = Math.sin(w) * a * 0.8;
      rumpf.position.y = huefte + 0.3 * k + Math.abs(Math.cos(w)) * 0.02 * a;
    } };
}

function baueRadfahrer(M, f){
  const g = new THREE.Group();
  const rahmenM = new THREE.MeshStandardMaterial({ color: new THREE.Color(f.farbe || "#2f7d5a"), metalness: 0.5, roughness: 0.35 });
  const raeder = [];
  [0.52, -0.52].forEach(function(x){
    const w = new THREE.Group(); w.position.set(x, 0.34, 0);
    const reifen = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 28), M.gummi); w.add(reifen);
    for(let i = 0; i < 6; i++){ const sp = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.62, 0.008), M.chrom); sp.rotation.z = i / 6 * Math.PI; w.add(sp); }
    g.add(w); raeder.push({ dreh: w, lenk: null, r: 0.34 });
  });
  const stab = function(a, b, d){
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(d || 0.02, d || 0.02, l, 6), rahmenM);
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0); m.rotation.z = -Math.atan2(dx, dy); g.add(m);
  };
  const tr = [0.02, 0.36], sattel = [-0.12, 0.86], lenkK = [0.42, 0.9];
  stab([-0.52, 0.34], tr); stab(tr, sattel); stab(sattel, [-0.52, 0.34]); stab(tr, [0.36, 0.78]); stab([0.36, 0.78], sattel); stab([0.52, 0.34], lenkK);
  g.add(B.kiste(0.05, 0.03, 0.5, M.kunststoff, lenkK[0], lenkK[1] + 0.02, 0));
  g.add(B.kiste(0.24, 0.05, 0.12, M.kunststoff, sattel[0], sattel[1] + 0.03, 0));
  // Fahrer: Oberkörper leicht nach vorne, Beine treten
  const kleid = new THREE.MeshStandardMaterial({ color: new THREE.Color(["#c0392b", "#2f5d8a", "#e6a23c"][hash(f.id) % 3]), roughness: 0.8 });
  const rumpf = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.42, 4, 10), kleid);
  rumpf.position.set(0.06, 1.2, 0); rumpf.rotation.z = -0.45; rumpf.scale.set(0.8, 1, 1.1); g.add(rumpf);
  const kopf = new THREE.Group(); kopf.position.set(0.3, 1.58, 0);
  kopf.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), M.haut));
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.125, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.4 })); helm.position.y = 0.02; kopf.add(helm);
  g.add(kopf);
  [1, -1].forEach(function(s){ const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.45, 4, 6), kleid); a.position.set(0.3, 1.18, 0.16 * s); a.rotation.z = -1.0; g.add(a); });
  const hose = new THREE.MeshStandardMaterial({ color: 0x2d3340, roughness: 0.9 });
  const beine = [1, -1].map(function(s){
    const p = new THREE.Group(); p.position.set(sattel[0] + 0.02, sattel[1] + 0.02, 0.1 * s);
    const o = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.36, 4, 6), hose); o.position.y = -0.2; p.add(o);
    const u = new THREE.Group(); u.position.y = -0.42; p.add(u);
    const uo = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.34, 4, 6), hose); uo.position.y = -0.2; u.add(uo);
    g.add(p); return { o: p, u: u, s: s };
  });
  g.traverse(function(m){ if(m.isMesh) m.castShadow = true; });
  return { gruppe: g, raeder: raeder, lichter: null, laenge: 1.8, breite: 0.6, hoehe: 1.75, augen: { x: 0.3, y: 1.6, z: 0 },
    animiere: function(p){
      const w = (p.s || 0) / 2.1 * Math.PI * 2;
      beine.forEach(function(b){ const ph = w + (b.s > 0 ? 0 : Math.PI); b.o.rotation.z = 0.55 + Math.sin(ph) * 0.45; b.u.rotation.z = -0.9 - Math.cos(ph) * 0.45; });
    } };
}

function baueBall(f){
  const g = new THREE.Group();
  const c = B.leinwand(128, 64, function(ctx){ ctx.fillStyle = f.farbe || "#e53935"; ctx.fillRect(0, 0, 128, 64); ctx.fillStyle = "#fff"; ctx.fillRect(0, 26, 128, 12); ctx.fillRect(58, 0, 12, 64); });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 12), new THREE.MeshStandardMaterial({ map: B.textur(c), roughness: 0.5 }));
  const dreh = new THREE.Group(); dreh.position.y = 0.15; dreh.add(ball); ball.castShadow = true; g.add(dreh);
  return { gruppe: g, raeder: [{ dreh: dreh, lenk: null, r: 0.15 }], lichter: null, laenge: 0.3, breite: 0.3, hoehe: 0.3, augen: { x: 0, y: 0.3, z: 0 } };
}
