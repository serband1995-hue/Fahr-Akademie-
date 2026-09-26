/* =====================================================================
   Verkehr verstehen · 3D-Motor (26.09.2026, W3)
   Echte 3D-Darstellung mit three.js (feste Version im Repo, vendor/).
   Alles hier ist selbst gebaut: keine fremden Modelle, keine echten
   Automarken. Masse in Metern, Zeit in Sekunden.

   Koordinaten: x = Fahrtrichtung der Fahrschule, y = oben,
   z = rechts (von der Fahrschule aus gesehen). Rechte Spur also z > 0.

   Eine Szene ist eine reine Funktion der Zeit: jedes Fahrzeug liefert
   pose(t) und signale(t). Dadurch kann man beliebig springen,
   anhalten und langsamer abspielen, ohne dass etwas "wegläuft".
   ===================================================================== */
import * as THREE from "../vendor/three-0.186.1.min.js";
export { THREE };

export const KMH = 3.6;

/* ---------------------------------------------------------------------
   Hilfen fuer Bewegung
   --------------------------------------------------------------------- */

// Geschwindigkeit stueckweise linear zwischen Stuetzstellen [[t, km/h], ...].
// s(t) ist der exakt integrierte Weg, v(t) die Geschwindigkeit in m/s.
export function tempoProfil(keys){
  const k = keys.map(function(p){ return [p[0], p[1] / KMH]; });
  const S = [0];
  for(let i = 1; i < k.length; i++) S[i] = S[i - 1] + (k[i][0] - k[i - 1][0]) * (k[i][1] + k[i - 1][1]) / 2;
  function v(t){
    if(t <= k[0][0]) return k[0][1];
    for(let i = 1; i < k.length; i++){
      if(t <= k[i][0]){ const f = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return k[i - 1][1] + f * (k[i][1] - k[i - 1][1]); }
    }
    return k[k.length - 1][1];
  }
  function s(t){
    if(t <= k[0][0]) return (t - k[0][0]) * k[0][1];
    for(let i = 1; i < k.length; i++){
      if(t <= k[i][0]){
        const dt = t - k[i - 1][0], a = (k[i][1] - k[i - 1][1]) / (k[i][0] - k[i - 1][0]);
        return S[i - 1] + k[i - 1][1] * dt + a * dt * dt / 2;
      }
    }
    const n = k.length - 1;
    return S[n] + (t - k[n][0]) * k[n][1];
  }
  return { v: v, s: s, keys: keys };
}

function glatt(f){ f = Math.max(0, Math.min(1, f)); return f * f * f * (f * (f * 6 - 15) + 10); }

// Seitenlage auf der Strecke: Start-Spur z0 und Spurwechsel [{x, laenge, z}]
// (x = wo der Wechsel beginnt, laenge = Strecke in Metern bis zur neuen Spur).
export function spurVerlauf(z0, wechsel){
  const w = (wechsel || []).slice().sort(function(a, b){ return a.x - b.x; });
  return function(x){
    let z = z0;
    for(let i = 0; i < w.length; i++){
      const c = w[i];
      if(x <= c.x) return z;
      if(x < c.x + c.laenge) return z + (c.z - z) * glatt((x - c.x) / c.laenge);
      z = c.z;
    }
    return z;
  };
}

// Ein Fahrzeug auf einer geraden Strasse: x0 = Startpunkt, richtung +1/-1,
// tempo = tempoProfil, lage = spurVerlauf (Funktion von x).
export function fahrt(opt){
  const dir = opt.richtung || 1, tp = opt.tempo, lage = opt.lage || function(){ return opt.z || 0; };
  function roh(t){ const s = tp.s(t); const x = opt.x0 + dir * s; return { x: x, z: lage(x), s: s }; }
  function winkel(t){
    const a = roh(t - 0.05), b = roh(t + 0.05);
    const dx = b.x - a.x, dz = b.z - a.z;
    if(Math.abs(dx) + Math.abs(dz) < 1e-6) return dir > 0 ? 0 : Math.PI;
    return -Math.atan2(dz, dx); // three.js: rotation.y > 0 dreht nach links (-z)
  }
  return function pose(t){
    const p = roh(t), h = winkel(t);
    // Lenkeinschlag aus der Kruemmung: Winkelaenderung je Meter mal Radstand
    const h1 = winkel(t - 0.15), h2 = winkel(t + 0.15);
    const ds = Math.max(0.05, Math.abs(tp.s(t + 0.15) - tp.s(t - 0.15)));
    let dh = h2 - h1; if(dh > Math.PI) dh -= 2 * Math.PI; if(dh < -Math.PI) dh += 2 * Math.PI;
    return { x: p.x, z: p.z, h: h, v: tp.v(t), s: p.s, lenk: Math.atan((opt.radstand || 2.7) * dh / ds) };
  };
}

// Zeitfenster [{von, bis, ...}] -> das zur Zeit t aktive (oder null)
export function fenster(liste, t){
  if(!liste) return null;
  for(let i = 0; i < liste.length; i++) if(t >= liste[i].von && t < liste[i].bis) return liste[i];
  return null;
}

/* ---------------------------------------------------------------------
   Zufall mit festem Startwert (gleiche Landschaft bei jedem Aufruf)
   --------------------------------------------------------------------- */
export function zufall(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------------
   Texturen, auf Leinwand gemalt (keine Bilddateien noetig)
   --------------------------------------------------------------------- */
function leinwand(w, h, malen){
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  malen(c.getContext("2d"), w, h);
  return c;
}
function textur(c, wdh){
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if(wdh){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(wdh[0], wdh[1]); }
  return t;
}
function rauschen(ctx, w, h, basis, streu, n, rnd){
  ctx.fillStyle = basis; ctx.fillRect(0, 0, w, h);
  for(let i = 0; i < n; i++){
    const x = rnd() * w, y = rnd() * h, g = (rnd() - 0.5) * streu;
    ctx.fillStyle = g > 0 ? "rgba(255,255,255," + g + ")" : "rgba(0,0,0," + (-g) + ")";
    const s = 1 + rnd() * 2; ctx.fillRect(x, y, s, s);
  }
}
const TEX = {};
function asphaltTextur(){
  if(TEX.asphalt) return TEX.asphalt;
  const rnd = zufall(7);
  const c = leinwand(512, 512, function(ctx, w, h){
    rauschen(ctx, w, h, "#55575a", 0.22, 26000, rnd);
    // Fahrspuren: in der Radspur ist der Belag dunkler und glatter
    [0.2, 0.37, 0.63, 0.8].forEach(function(f){
      const gr = ctx.createLinearGradient(0, f * h - 22, 0, f * h + 22);
      gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(18,18,20,.16)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr; ctx.fillRect(0, f * h - 22, w, 44);
    });
    // feine Bitumen-Risse: typisch fuer eine aeltere Landstrasse
    ctx.strokeStyle = "rgba(15,15,16,.35)"; ctx.lineWidth = 1.2;
    for(let i = 0; i < 5; i++){
      ctx.beginPath(); let x = rnd() * w, y = rnd() * h; ctx.moveTo(x, y);
      for(let j = 0; j < 6; j++){ x += (rnd() - 0.5) * 50; y += (rnd() - 0.3) * 40; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  });
  return (TEX.asphalt = c);
}
function grasTextur(){
  if(TEX.gras) return TEX.gras;
  const rnd = zufall(11);
  const c = leinwand(256, 256, function(ctx, w, h){
    rauschen(ctx, w, h, "#6d8f45", 0.25, 9000, rnd);
    for(let i = 0; i < 900; i++){
      ctx.strokeStyle = ["#5d7f3a", "#7fa052", "#8aa85a", "#56753a"][i % 4];
      ctx.lineWidth = 1; ctx.beginPath(); const x = rnd() * w, y = rnd() * h;
      ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * 3, y - 2 - rnd() * 4); ctx.stroke();
    }
  });
  return (TEX.gras = c);
}
function bankettTextur(){
  if(TEX.bankett) return TEX.bankett;
  const rnd = zufall(13);
  const c = leinwand(128, 128, function(ctx, w, h){ rauschen(ctx, w, h, "#8b8472", 0.35, 5000, rnd); });
  return (TEX.bankett = c);
}
// Flickenteppich aus Feldern fuer die Ferne
function felderTextur(){
  if(TEX.felder) return TEX.felder;
  const rnd = zufall(21);
  const farben = ["#c8b25a", "#7aa04c", "#5f8a3c", "#8a6c49", "#a7b35a", "#d6c26a", "#6f9446", "#9c8a52"];
  const c = leinwand(1024, 512, function(ctx, w, h){
    ctx.fillStyle = "#6f9446"; ctx.fillRect(0, 0, w, h);
    for(let i = 0; i < 70; i++){
      const fw = 60 + rnd() * 200, fh = 30 + rnd() * 110, x = rnd() * w, y = rnd() * h, f = farben[(rnd() * farben.length) | 0];
      ctx.save(); ctx.translate(x, y); ctx.rotate((rnd() - 0.5) * 0.5);
      ctx.fillStyle = f; ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
      ctx.strokeStyle = "rgba(0,0,0,.07)"; ctx.lineWidth = 1;
      for(let yy = -fh / 2; yy < fh / 2; yy += 3){ ctx.beginPath(); ctx.moveTo(-fw / 2, yy); ctx.lineTo(fw / 2, yy); ctx.stroke(); }
      ctx.restore();
    }
  });
  return (TEX.felder = c);
}
function schildTextur(typ){
  const key = "schild_" + typ;
  if(TEX[key]) return TEX[key];
  const c = leinwand(256, 256, function(ctx){
    ctx.clearRect(0, 0, 256, 256);
    const autoHinten = function(x, y, farbe, s){
      ctx.fillStyle = farbe;
      ctx.beginPath(); ctx.moveTo(x - 26 * s, y + 20 * s); ctx.lineTo(x - 26 * s, y - 2 * s); ctx.lineTo(x - 18 * s, y - 22 * s);
      ctx.lineTo(x + 18 * s, y - 22 * s); ctx.lineTo(x + 26 * s, y - 2 * s); ctx.lineTo(x + 26 * s, y + 20 * s); ctx.closePath(); ctx.fill();
      ctx.fillRect(x - 24 * s, y + 18 * s, 10 * s, 12 * s); ctx.fillRect(x + 14 * s, y + 18 * s, 10 * s, 12 * s);
      ctx.fillStyle = "#fff"; ctx.fillRect(x - 15 * s, y - 16 * s, 30 * s, 11 * s);
    };
    if(typ === "z276" || typ === "z280"){
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(128, 128, 124, 0, Math.PI * 2); ctx.fill();
      if(typ === "z276"){
        ctx.strokeStyle = "#c1121c"; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(128, 128, 110, 0, Math.PI * 2); ctx.stroke();
        autoHinten(88, 126, "#c1121c", 1.15); autoHinten(168, 126, "#1a1a1a", 1.15);
      } else {
        ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(128, 128, 120, 0, Math.PI * 2); ctx.stroke();
        autoHinten(88, 126, "#8a8a8a", 1.15); autoHinten(168, 126, "#8a8a8a", 1.15);
        ctx.save(); ctx.beginPath(); ctx.arc(128, 128, 118, 0, Math.PI * 2); ctx.clip();
        ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 6;
        for(let i = -2; i <= 2; i++){ ctx.beginPath(); ctx.moveTo(40 + i * 22, 230 + i * 0); ctx.lineTo(220 + i * 22, 30); ctx.stroke(); }
        ctx.restore();
      }
      ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(128, 128, 125, 0, Math.PI * 2); ctx.stroke();
    } else if(typ === "z205"){
      ctx.fillStyle = "#c1121c"; ctx.beginPath(); ctx.moveTo(8, 20); ctx.lineTo(248, 20); ctx.lineTo(128, 236); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(52, 44); ctx.lineTo(204, 44); ctx.lineTo(128, 182); ctx.closePath(); ctx.fill();
    } else if(typ === "rueck_rund" || typ === "rueck_dreieck"){
      ctx.fillStyle = "#9aa0a6";
      if(typ === "rueck_rund"){ ctx.beginPath(); ctx.arc(128, 128, 124, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(8, 20); ctx.lineTo(248, 20); ctx.lineTo(128, 236); ctx.closePath(); ctx.fill(); }
    }
  });
  return (TEX[key] = c);
}
function schriftTextur(text, opt){
  opt = opt || {};
  const w = opt.w || 512, h = opt.h || 128;
  return leinwand(w, h, function(ctx){
    ctx.fillStyle = opt.grund || "#fff"; ctx.fillRect(0, 0, w, h);
    if(opt.rand){ ctx.strokeStyle = opt.rand; ctx.lineWidth = h * 0.06; ctx.strokeRect(h * 0.04, h * 0.04, w - h * 0.08, h - h * 0.08); }
    if(opt.eu){ ctx.fillStyle = "#1d4fa3"; ctx.fillRect(0, 0, h * 0.42, h); ctx.fillStyle = "#fff"; ctx.font = "bold " + (h * 0.28) + "px sans-serif"; ctx.textAlign = "center"; ctx.fillText("D", h * 0.21, h * 0.86); }
    ctx.fillStyle = opt.farbe || "#111"; ctx.font = (opt.fett === false ? "" : "bold ") + (h * (opt.gross || 0.62)) + "px " + (opt.schrift || "sans-serif");
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, (opt.eu ? h * 0.21 : 0) + w / 2, h * 0.54);
  });
}
function glanzTextur(){
  if(TEX.glanz) return TEX.glanz;
  const c = leinwand(64, 64, function(ctx){
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  });
  return (TEX.glanz = c);
}

/* ---------------------------------------------------------------------
   Materialien (einmal pro Welt, geteilt)
   --------------------------------------------------------------------- */
function materialien(){
  const M = {};
  M.gummi = new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.92 });
  M.felge = new THREE.MeshStandardMaterial({ color: 0xb9bec4, metalness: 0.85, roughness: 0.32 });
  M.felgeDunkel = new THREE.MeshStandardMaterial({ color: 0x3a3d42, metalness: 0.6, roughness: 0.45 });
  M.glas = new THREE.MeshStandardMaterial({ color: 0x14202b, metalness: 0.9, roughness: 0.08, envMapIntensity: 1.4 });
  M.spiegel = new THREE.MeshStandardMaterial({ color: 0x9fb2c2, metalness: 1, roughness: 0.05, envMapIntensity: 1.6 });
  M.kunststoff = new THREE.MeshStandardMaterial({ color: 0x232427, roughness: 0.75 });
  M.chrom = new THREE.MeshStandardMaterial({ color: 0xdadde1, metalness: 1, roughness: 0.18 });
  M.innen = new THREE.MeshStandardMaterial({ color: 0x2a2b2e, roughness: 0.85 });
  M.haut = new THREE.MeshStandardMaterial({ color: 0xd8a47f, roughness: 0.7 });
  M.hautDunkel = new THREE.MeshStandardMaterial({ color: 0x8d5a3c, roughness: 0.7 });
  M.haar = new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.9 });
  M.pulli = [0x2f5d8a, 0x8a3b2f, 0x3d6b45, 0x5a4a7a, 0xc9a13b].map(function(c){ return new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }); });
  M.scheinwerfer = function(){ return new THREE.MeshStandardMaterial({ color: 0xeef3f7, emissive: 0xfff6e0, emissiveIntensity: 0, metalness: 0.3, roughness: 0.2 }); };
  M.ruecklicht = function(){ return new THREE.MeshStandardMaterial({ color: 0x7a0b0e, emissive: 0xff1a12, emissiveIntensity: 0.15, roughness: 0.35 }); };
  M.blinker = function(){ return new THREE.MeshStandardMaterial({ color: 0xc9781a, emissive: 0xff8a00, emissiveIntensity: 0, roughness: 0.3 }); };
  M.weiss = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.55 });
  M.markierung = new THREE.MeshStandardMaterial({ color: 0xf1f0ea, roughness: 0.65, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  M.pfosten = new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.5 });
  M.schwarz = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });
  M.rueckstrahler = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.3 });
  M.rueckstrahlerGelb = new THREE.MeshStandardMaterial({ color: 0xe0a020, emissive: 0xffa000, emissiveIntensity: 0, roughness: 0.3 });
  M.mast = new THREE.MeshStandardMaterial({ color: 0x9da3a8, metalness: 0.6, roughness: 0.4 });
  M.rinde = new THREE.MeshStandardMaterial({ color: 0x5a4330, roughness: 0.95 });
  M.laub = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
  M.wand = new THREE.MeshStandardMaterial({ color: 0xece6d8, roughness: 0.9 });
  M.dachRot = new THREE.MeshStandardMaterial({ color: 0x9c3b27, roughness: 0.8, flatShading: true });
  M.dachGrau = new THREE.MeshStandardMaterial({ color: 0x4d4f52, roughness: 0.8, flatShading: true });
  M.holz = new THREE.MeshStandardMaterial({ color: 0x7a3f2a, roughness: 0.9 });
  M.fenster = new THREE.MeshStandardMaterial({ color: 0x27323b, roughness: 0.3, metalness: 0.5, emissive: 0xffc870, emissiveIntensity: 0 });
  M.windrad = new THREE.MeshStandardMaterial({ color: 0xf1f2f3, roughness: 0.5 });
  M.huegel = new THREE.MeshStandardMaterial({ color: 0x5d7f48, roughness: 1, flatShading: true });
  M.glanz = new THREE.SpriteMaterial({ map: textur(glanzTextur()), color: 0xfff1d6, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
  M.glanzRot = new THREE.SpriteMaterial({ map: textur(glanzTextur()), color: 0xff3020, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
  M.glanzGelb = new THREE.SpriteMaterial({ map: textur(glanzTextur()), color: 0xffa020, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
  return M;
}

/* ---------------------------------------------------------------------
   Kleine Bausteine
   --------------------------------------------------------------------- */
function kiste(w, h, d, mat, x, y, z){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x || 0, y || 0, z || 0);
  m.castShadow = true;
  return m;
}
// Viereck aus vier Punkten (Glas, Schilder); Normale zeigt Richtung "aussen"
function viereck(a, b, c, d, mat){
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], d[0], d[1], d[2]], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}
// Flaechen aus vielen Rechtecken [x0, x1, z0, z1] in EINER Geometrie (Markierungen)
function rechteckFlaeche(rechtecke, y){
  const pos = [], idx = [], uv = [];
  rechtecke.forEach(function(r, i){
    const x0 = r[0], x1 = r[1], z0 = r[2], z1 = r[3], o = i * 4;
    pos.push(x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z1);
    uv.push(0, 0, 1, 0, 1, 1, 0, 1);
    idx.push(o, o + 2, o + 1, o, o + 3, o + 2);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function boden(x0, x1, z0, z1, y, mat){
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
  m.receiveShadow = true;
  return m;
}

/* ---------------------------------------------------------------------
   Leistung: statische Teile einer Gruppe je Material zu EINER Geometrie
   verschmelzen (aus 150 Einzelteilen werden ~12 Zeichenaufrufe).
   behalten(obj) = true -> Objekt bleibt eigenstaendig (Raeder, Kopf, Sprites).
   --------------------------------------------------------------------- */
function alsNichtIndiziert(geo){
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  if(!g.attributes.normal) g.computeVertexNormals();
  if(!g.attributes.uv) g.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  Object.keys(g.attributes).forEach(function(k){ if(k !== "position" && k !== "normal" && k !== "uv") g.deleteAttribute(k); });
  return g;
}
function verschmelzen(gruppe, behalten){
  gruppe.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(gruppe.matrixWorld).invert();
  const topf = new Map(), weg = [];
  gruppe.traverse(function(o){
    if(o === gruppe || !o.isMesh || o.isInstancedMesh) return;
    let p = o, frei = true;
    while(p && p !== gruppe){ if(behalten(p)) { frei = false; break; } p = p.parent; }
    if(!frei) return;
    const m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    const g = alsNichtIndiziert(o.geometry); g.applyMatrix4(m);
    if(!topf.has(o.material)) topf.set(o.material, []);
    topf.get(o.material).push(g); weg.push(o);
  });
  weg.forEach(function(o){ o.parent.remove(o); });
  topf.forEach(function(liste, mat){
    let n = 0; liste.forEach(function(g){ n += g.attributes.position.count; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    let o = 0;
    liste.forEach(function(g){
      pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); uv.set(g.attributes.uv.array, o * 2);
      o += g.attributes.position.count; g.dispose();
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = !(mat.transparent) && mat !== undefined; mesh.receiveShadow = true;
    gruppe.add(mesh);
  });
}
// Rad: Einzelteile je Material verschmelzen, das Rad dreht sich als Ganzes
function radVerschmelzen(r){
  const kinder = r.children.slice();
  const g = new THREE.Group();
  kinder.forEach(function(c){ g.add(c); });
  verschmelzen(g, function(){ return false; });
  g.children.slice().forEach(function(c){ r.add(c); });
  return r;
}

/* ---------------------------------------------------------------------
   Fahrzeuge
   Jeder Bau liefert { gruppe, raeder[], lichter, kopf?, laenge }.
   raeder: { dreh: Object3D (rollt), lenk: Object3D|null, r }.
   --------------------------------------------------------------------- */
function rad(M, r, breite, opt){
  opt = opt || {};
  const g = new THREE.Group();
  const reifen = new THREE.Mesh(new THREE.CylinderGeometry(r, r, breite, 28, 1), M.gummi);
  reifen.rotation.x = Math.PI / 2; reifen.castShadow = true; g.add(reifen);
  // Reifenflanke leicht abgerundet: zweiter, schmalerer Ring
  const flanke = new THREE.Mesh(new THREE.TorusGeometry(r * 0.93, breite * 0.22, 5, 22), M.gummi);
  flanke.position.z = breite / 2 * (opt.seite || 1) * 0.92; g.add(flanke);
  const felge = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.64, r * 0.64, breite * 1.02, 24), opt.dunkel ? M.felgeDunkel : M.felge);
  felge.rotation.x = Math.PI / 2; g.add(felge);
  // Speichen, damit man das Drehen sieht
  const n = opt.speichen || 5;
  for(let i = 0; i < n; i++){
    const sp = new THREE.Mesh(new THREE.BoxGeometry(r * 0.12, r * 0.95, 0.04), M.felgeDunkel);
    sp.position.z = breite / 2 * (opt.seite || 1) + 0.012 * (opt.seite || 1);
    sp.rotation.z = i / n * Math.PI * 2;
    g.add(sp);
  }
  const nabe = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.16, r * 0.16, breite * 1.08, 12), M.chrom);
  nabe.rotation.x = Math.PI / 2; g.add(nabe);
  return radVerschmelzen(g);
}

// Person im Auto: Kopf (drehbar fuer den Schulterblick) und Oberkoerper
function insasse(M, rnd){
  const g = new THREE.Group();
  const pulli = M.pulli[(rnd() * M.pulli.length) | 0];
  const rumpf = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.32, 4, 10), pulli);
  rumpf.position.y = 0.18; rumpf.scale.set(1, 1, 1.25); g.add(rumpf);
  const kopf = new THREE.Group(); kopf.position.y = 0.62;
  const gesicht = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), rnd() < 0.3 ? M.hautDunkel : M.haut);
  gesicht.scale.set(1, 1.12, 0.95); kopf.add(gesicht);
  const haare = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), M.haar);
  haare.position.set(-0.012, 0.02, 0); haare.rotation.z = 0.25; kopf.add(haare);
  const nase = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 6), gesicht.material);
  nase.rotation.z = -Math.PI / 2; nase.position.set(0.105, 0, 0); kopf.add(nase);
  g.add(kopf);
  return { gruppe: g, kopf: kopf };
}

// Pkw-Profile: Seitenansicht (x = von hinten nach vorne in Anteilen von L, y in m),
// Fensterlinie und Radpositionen. Keine echte Marke, typische Proportionen.
const PKW = {
  kompakt: { L: 4.25, B: 1.80, r: 0.315, hinten: 0.72, radstand: 2.62,
    profil: [[0, 0.36], [0.005, 0.72], [0.03, 0.94], [0.1, 1.02], [0.2, 1.40], [0.58, 1.46], [0.72, 1.06], [0.95, 0.88], [1, 0.68], [0.995, 0.36]],
    fenster: [[0.125, 1.05], [0.215, 1.36], [0.575, 1.40], [0.695, 1.08]], heckscheibe: [[0.1, 1.03], [0.2, 1.39]], frontscheibe: [[0.72, 1.07], [0.58, 1.45]], saeule: 0.44 },
  kombi: { L: 4.72, B: 1.83, r: 0.325, hinten: 0.95, radstand: 2.80,
    profil: [[0, 0.36], [0.004, 0.76], [0.02, 1.0], [0.04, 1.43], [0.60, 1.47], [0.745, 1.06], [0.96, 0.87], [1, 0.66], [0.995, 0.36]],
    fenster: [[0.05, 1.04], [0.055, 1.38], [0.595, 1.42], [0.725, 1.08]], heckscheibe: [[0.02, 1.02], [0.04, 1.42]], frontscheibe: [[0.745, 1.07], [0.60, 1.46]], saeule: 0.40 },
  suv: { L: 4.62, B: 1.88, r: 0.36, hinten: 0.86, radstand: 2.74,
    profil: [[0, 0.44], [0.005, 0.88], [0.03, 1.18], [0.07, 1.66], [0.62, 1.71], [0.76, 1.24], [0.96, 1.05], [1, 0.82], [0.995, 0.44]],
    fenster: [[0.085, 1.24], [0.09, 1.60], [0.615, 1.65], [0.74, 1.27]], heckscheibe: [[0.03, 1.2], [0.07, 1.65]], frontscheibe: [[0.76, 1.25], [0.62, 1.70]], saeule: 0.42 },
  transporter: { L: 5.40, B: 2.02, r: 0.35, hinten: 1.05, radstand: 3.40,
    profil: [[0, 0.42], [0, 2.46], [0.02, 2.55], [0.76, 2.55], [0.80, 2.40], [0.88, 1.36], [0.98, 1.08], [1, 0.80], [0.995, 0.42]],
    fenster: [[0.79, 1.40], [0.785, 2.1], [0.80, 2.36], [0.865, 1.42]], heckscheibe: null, frontscheibe: [[0.88, 1.38], [0.80, 2.38]], saeule: null, kastenHinten: true }
};

function pkwKoerper(P, lackMat){
  const L = P.L, y0 = 0.26, r = P.r, R = r + 0.055;
  const xH = P.hinten, xV = P.hinten + P.radstand;
  const s = new THREE.Shape();
  const pt = P.profil.map(function(p){ return [p[0] * L, p[1]]; });
  s.moveTo(pt[0][0], y0);
  for(let i = 0; i < pt.length; i++) s.lineTo(pt[i][0], pt[i][1]);
  s.lineTo(pt[pt.length - 1][0], y0);
  // Unterkante mit Radlaeufen, von vorne nach hinten
  const a0 = Math.asin(Math.max(-1, Math.min(1, (y0 - r) / R)));
  [xV, xH].forEach(function(cx){
    s.lineTo(cx + R * Math.cos(a0), y0);
    s.absarc(cx, r, R, a0, Math.PI - a0, false);
  });
  s.lineTo(pt[0][0], y0);
  const tiefe = P.B - 0.12;
  const geo = new THREE.ExtrudeGeometry(s, { depth: tiefe, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4, curveSegments: 14 });
  geo.translate(-L / 2, 0, -tiefe / 2);
  const m = new THREE.Mesh(geo, lackMat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

export function bauePkw(M, opt){
  opt = opt || {};
  const P = PKW[opt.art || "kompakt"];
  const rnd = zufall(opt.seed || 1);
  const L = P.L, B = P.B, halb = L / 2;
  const g = new THREE.Group();
  const lack = new THREE.MeshStandardMaterial({ color: new THREE.Color(opt.farbe || "#8a929a"), metalness: 0.55, roughness: 0.32, envMapIntensity: 1.1 });
  g.add(pkwKoerper(P, lack));
  const zs = B / 2 + 0.006; // Glas liegt knapp aussen auf der Karosserie
  const X = function(f){ return f * L - halb; };
  // Seitenscheiben (links und rechts), mit Tuersaeule
  [1, -1].forEach(function(seite){
    const f = P.fenster, z = zs * seite;
    const q = seite > 0 ? [f[0], f[3], f[2], f[1]] : [f[0], f[1], f[2], f[3]];
    g.add(viereck([X(q[0][0]), q[0][1], z], [X(q[1][0]), q[1][1], z], [X(q[2][0]), q[2][1], z], [X(q[3][0]), q[3][1], z], M.glas));
    if(P.saeule){
      const sx = X(P.saeule);
      const s1 = kiste(0.09, 0.40, 0.012, M.kunststoff, sx, (f[0][1] + f[1][1]) / 2 + 0.02, z + 0.004 * seite);
      g.add(s1);
    }
  });
  // Front- und Heckscheibe als schraege Flaechen ueber die ganze Breite
  const scheibe = function(p, q, breite, versatz){
    const a = [X(p[0]), p[1]], b = [X(q[0]), q[1]];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    let nx = dy / l, ny = -dx / l; // Normale
    if(versatz < 0){ nx = -nx; ny = -ny; }
    const o = Math.abs(versatz);
    const w = breite / 2;
    const A = [a[0] + nx * o, a[1] + ny * o], Bp = [b[0] + nx * o, b[1] + ny * o];
    return viereck([A[0], A[1], -w], [Bp[0], Bp[1], -w], [Bp[0], Bp[1], w], [A[0], A[1], w], M.glas);
  };
  const fs = scheibe(P.frontscheibe[0], P.frontscheibe[1], B - 0.22, 0.058);
  fs.geometry.computeVertexNormals(); g.add(fs);
  if(P.heckscheibe) g.add(scheibe(P.heckscheibe[1], P.heckscheibe[0], B - 0.28, 0.058));
  // Stossfaenger, Kuehlergrill, Schweller
  g.add(kiste(0.14, 0.26, B - 0.02, M.kunststoff, halb - 0.02, 0.40, 0));
  g.add(kiste(0.14, 0.24, B - 0.02, M.kunststoff, -halb + 0.02, 0.42, 0));
  g.add(kiste(0.06, 0.12, B * 0.42, M.schwarz, halb + 0.03, 0.62, 0));
  g.add(kiste(L * 0.42, 0.09, 0.03, M.kunststoff, X(0.5), 0.31, B / 2 + 0.04));
  g.add(kiste(L * 0.42, 0.09, 0.03, M.kunststoff, X(0.5), 0.31, -B / 2 - 0.04));
  // Leuchten
  const vY = P.profil[7] ? P.profil[7][1] - 0.12 : 0.74;
  const lichter = { front: [], heck: [], bremse: [], blinkL: [], blinkR: [], glanzFront: [], glanzHeck: [], glanzBlinkL: [], glanzBlinkR: [] };
  const matS = M.scheinwerfer(), matR = M.ruecklicht(), matB = M.ruecklicht(), matBL = M.blinker(), matBR = M.blinker();
  lichter.mats = { front: matS, heck: matR, bremse: matB, blinkL: matBL, blinkR: matBR };
  const frontY = P.kastenHinten ? 1.0 : Math.min(0.78, vY);
  [1, -1].forEach(function(seite){
    const z = (B / 2 - 0.26) * seite;
    g.add(kiste(0.08, 0.11, 0.34, matS, halb + 0.005, frontY, z));
    g.add(kiste(0.07, 0.07, 0.10, seite < 0 ? matBL : matBR, halb - 0.005, frontY - 0.01, (B / 2 - 0.04) * seite));
    const hy = P.kastenHinten ? 0.95 : 0.9;
    g.add(kiste(0.07, 0.14, 0.30, matR, -halb - 0.01, hy, (B / 2 - 0.2) * seite));
    g.add(kiste(0.07, 0.07, 0.18, seite < 0 ? matBL : matBR, -halb - 0.012, hy - 0.13, (B / 2 - 0.2) * seite));
    const gs = new THREE.Sprite(M.glanz.clone()); gs.position.set(halb + 0.25, frontY, z); gs.scale.set(1.1, 1.1, 1); g.add(gs); lichter.glanzFront.push(gs);
    const gh = new THREE.Sprite(M.glanzRot.clone()); gh.position.set(-halb - 0.2, hy, (B / 2 - 0.2) * seite); gh.scale.set(0.8, 0.8, 1); g.add(gh); lichter.glanzHeck.push(gh);
    [halb + 0.12, -halb - 0.14].forEach(function(bx){
      const gb = new THREE.Sprite(M.glanzGelb.clone()); gb.position.set(bx, bx > 0 ? frontY : hy - 0.13, (B / 2 - 0.1) * seite); gb.scale.set(0.7, 0.7, 1);
      g.add(gb); (seite < 0 ? lichter.glanzBlinkL : lichter.glanzBlinkR).push(gb);
    });
  });
  // dritte Bremsleuchte oben
  const oben = P.heckscheibe ? P.heckscheibe[1] : [0.02, 2.5];
  g.add(kiste(0.05, 0.04, 0.34, matB, X(oben[0]) - 0.02, oben[1] - 0.03, 0));
  // Aussenspiegel mit Blinker-Wiederholer
  const sx = X(P.frontscheibe[0][0]) - 0.1, sy = P.frontscheibe[0][1] + 0.06;
  [1, -1].forEach(function(seite){
    const arm = kiste(0.10, 0.05, 0.12, M.kunststoff, sx, sy, (B / 2 + 0.05) * seite); g.add(arm);
    const geh = kiste(0.14, 0.13, 0.22, lack, sx - 0.02, sy + 0.04, (B / 2 + 0.16) * seite); g.add(geh);
    g.add(kiste(0.02, 0.10, 0.18, M.spiegel, sx - 0.095, sy + 0.04, (B / 2 + 0.16) * seite));
    g.add(kiste(0.08, 0.02, 0.10, seite < 0 ? matBL : matBR, sx, sy - 0.02, (B / 2 + 0.22) * seite));
  });
  // Kennzeichen (frei erfunden, keine echte Zulassung)
  const kz = opt.kennzeichen || "FA · AK 26";
  const kzMat = new THREE.MeshStandardMaterial({ map: textur(schriftTextur(kz, { w: 520, h: 112, eu: true, rand: "#111", gross: 0.56 })), roughness: 0.5 });
  const kzv = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.112), kzMat); kzv.rotation.y = Math.PI / 2; kzv.position.set(halb + 0.095, 0.44, 0); g.add(kzv);
  const kzh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.112), kzMat); kzh.rotation.y = -Math.PI / 2; kzh.position.set(-halb - 0.095, 0.62, 0); g.add(kzh);
  // Raeder
  const raeder = [];
  [[P.hinten, false], [P.hinten + P.radstand, true]].forEach(function(a){
    [1, -1].forEach(function(seite){
      const lenk = new THREE.Group(); lenk.position.set(a[0] - halb, P.r, (B / 2 - 0.13) * seite);
      const r = rad(M, P.r, 0.22, { seite: seite, dunkel: opt.dunkleFelgen }); lenk.add(r); g.add(lenk);
      raeder.push({ dreh: r, lenk: a[1] ? lenk : null, r: P.r });
    });
  });
  // Innenraum: Fahrer links, bei der Fahrschule rechts der Fahrlehrer
  const sitzX = X(P.saeule || 0.66) + (P.kastenHinten ? 0 : 0.1);
  const fahrer = insasse(M, rnd); fahrer.gruppe.position.set(sitzX, 0.56, -0.37); g.add(fahrer.gruppe);
  if(opt.beifahrer !== false && (opt.fahrschule || rnd() < 0.35)){ const b = insasse(M, rnd); b.gruppe.position.set(sitzX, 0.56, 0.37); g.add(b.gruppe); }
  // Armaturenbrett und Lenkrad (sieht man in der Fahrersicht)
  const fsB = P.frontscheibe[0], fsO = P.frontscheibe[1];
  const armX = X(fsB[0]) - 0.28, armY = fsB[1] - 0.16;
  const arm = kiste(0.5, 0.2, B - 0.22, M.innen, armX, armY, 0); arm.castShadow = false; g.add(arm);
  const lr = new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.024, 8, 32), M.innen);
  lr.position.set(armX - 0.42, armY + 0.02, -0.37);
  lr.rotation.set(0, Math.PI / 2, 0); lr.rotateX(-0.42); g.add(lr);
  const lrNabe = kiste(0.05, 0.08, 0.12, M.innen, armX - 0.40, armY + 0.02, -0.37); g.add(lrNabe);
  // Dachhimmel (nur von innen sichtbar: zeigt nach unten)
  const dhY = Math.max(fsO[1], P.fenster[2][1]) - 0.07;
  const dh = new THREE.Mesh(new THREE.PlaneGeometry(X(fsO[0]) - X(P.fenster[1][0]) + 0.1, B - 0.2), new THREE.MeshStandardMaterial({ color: 0xc9c4b8, roughness: 1 }));
  dh.rotation.x = Math.PI / 2; dh.position.set((X(fsO[0]) + X(P.fenster[1][0])) / 2, dhY, 0); g.add(dh);
  // A-Saeulen innen und Innenspiegel
  [1, -1].forEach(function(seite){
    const a = [X(fsB[0]), fsB[1]], b = [X(fsO[0]), fsO[1]], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const sae = kiste(0.07, l, 0.08, M.innen, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (B / 2 - 0.1) * seite);
    sae.rotation.z = Math.atan2(b[0] - a[0], b[1] - a[1]) * -1; sae.castShadow = false; g.add(sae);
  });
  const isp = kiste(0.025, 0.06, 0.2, M.kunststoff, X(fsO[0]) + 0.02, fsO[1] - 0.13, 0.05); isp.castShadow = false; g.add(isp);
  g.add(kiste(0.005, 0.05, 0.18, M.spiegel, X(fsO[0]) + 0.005, fsO[1] - 0.13, 0.05));
  // Fahrschul-Dachschild: dreieckiges Profil quer ueber dem Dach
  if(opt.fahrschule){
    const dachY = Math.max.apply(null, P.profil.map(function(p){ return p[1]; }));
    const dachX = X((P.fenster[1][0] + P.fenster[2][0]) / 2 + 0.03);
    const schild = new THREE.Shape(); schild.moveTo(-0.17, 0); schild.lineTo(0.17, 0); schild.lineTo(0.02, 0.30); schild.lineTo(-0.02, 0.30); schild.closePath();
    const sg = new THREE.ExtrudeGeometry(schild, { depth: 1.0, bevelEnabled: false }); sg.translate(0, 0, -0.5);
    const sm = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0xf7f7f2, roughness: 0.5 })); sm.position.set(dachX, dachY + 0.06, 0); sm.castShadow = true; g.add(sm);
    const txt = new THREE.MeshStandardMaterial({ map: textur(schriftTextur("FAHRSCHULE", { w: 640, h: 140, farbe: "#1d4fa3", grund: "#ffffff", gross: 0.62 })), roughness: 0.5 });
    const ang = Math.atan2(0.15, 0.30);
    [1, -1].forEach(function(s){
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.30), txt);
      p.position.set(dachX + 0.095 * s, dachY + 0.06 + 0.15, 0);
      p.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; p.rotateX(-ang);
      g.add(p);
    });
    g.add(kiste(0.3, 0.04, 0.9, M.kunststoff, dachX, dachY + 0.05, 0));
  }
  const radGr = raeder.map(function(r){ return r.lenk || r.dreh.parent; });
  verschmelzen(g, function(o){ return o.isSprite || o === fahrer.kopf || radGr.indexOf(o) !== -1; });
  return { gruppe: g, raeder: raeder, lichter: lichter, kopf: fahrer.kopf, laenge: L, breite: B, hoehe: Math.max.apply(null, P.profil.map(function(p){ return p[1]; })), augen: { x: sitzX + 0.06, y: 1.16 + (P.kastenHinten ? 0.55 : (P === PKW.suv ? 0.2 : 0)), z: -0.37 }, lack: lack };
}

// Sattelzug, 16,5 m: Fahrerhaus (Frontlenker) + Kofferauflieger
export function baueLkw(M, opt){
  opt = opt || {};
  const rnd = zufall(opt.seed || 3);
  const L = 16.5, B = 2.55, halb = L / 2;
  const g = new THREE.Group();
  const kabLack = new THREE.MeshStandardMaterial({ color: new THREE.Color(opt.farbe || "#2c4f7c"), metalness: 0.5, roughness: 0.35 });
  const koffer = new THREE.MeshStandardMaterial({ color: new THREE.Color(opt.aufbau || "#dfe2e5"), roughness: 0.55, metalness: 0.15 });
  // Fahrerhaus: Profil mit leicht geneigter Front
  const kx0 = halb - 2.35, kx1 = halb;
  const ks = new THREE.Shape();
  ks.moveTo(kx0, 1.05); ks.lineTo(kx0, 3.72); ks.lineTo(kx0 + 0.25, 3.92); ks.lineTo(kx1 - 0.25, 3.92); ks.lineTo(kx1 - 0.05, 3.6); ks.lineTo(kx1, 1.35); ks.lineTo(kx1 - 0.08, 1.05); ks.closePath();
  const kg = new THREE.ExtrudeGeometry(ks, { depth: B - 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }); kg.translate(0, 0, -(B - 0.1) / 2);
  const kab = new THREE.Mesh(kg, kabLack); kab.castShadow = true; kab.receiveShadow = true; g.add(kab);
  // Frontscheibe, Seitenfenster, Kuehlergrill, Sonnenblende, Stossfaenger
  g.add(viereck([kx1 + 0.012, 2.35, -B / 2 + 0.12], [kx1 + 0.012, 2.35, B / 2 - 0.12], [kx1 - 0.04, 3.45, B / 2 - 0.12], [kx1 - 0.04, 3.45, -B / 2 + 0.12], M.glas));
  [1, -1].forEach(function(s){
    const z = (B / 2 + 0.006) * s;
    const q = [[kx1 - 1.0, 2.3], [kx1 - 0.12, 2.3], [kx1 - 0.10, 3.35], [kx1 - 1.0, 3.35]];
    const o = s > 0 ? [q[0], q[3], q[2], q[1]] : q;
    g.add(viereck([o[0][0], o[0][1], z], [o[1][0], o[1][1], z], [o[2][0], o[2][1], z], [o[3][0], o[3][1], z], M.glas));
    // grosse Aussenspiegel an Buegeln
    g.add(kiste(0.06, 0.06, 0.35, M.kunststoff, kx1 - 0.2, 3.0, (B / 2 + 0.17) * s));
    g.add(kiste(0.10, 0.62, 0.24, M.kunststoff, kx1 - 0.24, 2.75, (B / 2 + 0.36) * s));
    g.add(kiste(0.08, 0.30, 0.20, M.kunststoff, kx1 - 0.24, 2.18, (B / 2 + 0.33) * s));
    // Einstieg
    g.add(kiste(0.5, 0.05, 0.25, M.kunststoff, kx1 - 0.6, 0.75, (B / 2 - 0.1) * s));
  });
  g.add(kiste(0.06, 0.9, B * 0.62, M.schwarz, kx1 + 0.02, 1.85, 0));
  for(let i = 0; i < 5; i++) g.add(kiste(0.03, 0.035, B * 0.6, M.chrom, kx1 + 0.05, 1.5 + i * 0.17, 0));
  g.add(kiste(0.22, 0.12, B - 0.05, kabLack, kx1 - 0.05, 3.55, 0));
  g.add(kiste(0.3, 0.45, B, M.kunststoff, kx1 - 0.05, 0.78, 0));
  // Dachspoiler bis auf Aufliegerhoehe
  const sp = new THREE.Shape(); sp.moveTo(kx0 + 0.1, 3.92); sp.lineTo(kx1 - 0.6, 3.92); sp.lineTo(kx0 + 0.25, 4.0); sp.lineTo(kx0 + 0.1, 4.0); sp.closePath();
  const spg = new THREE.ExtrudeGeometry(sp, { depth: B - 0.2, bevelEnabled: false }); spg.translate(0, 0, -(B - 0.2) / 2);
  g.add(new THREE.Mesh(spg, kabLack));
  // Rahmen, Tank, Kotfluegel
  g.add(kiste(L * 0.42, 0.28, 0.9, M.schwarz, halb - 3.6, 0.95, 0));
  [1, -1].forEach(function(s){
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.3, 16), M.chrom); tank.rotation.z = Math.PI / 2; tank.position.set(halb - 3.1, 0.75, 0.9 * s); tank.castShadow = true; g.add(tank);
    g.add(kiste(0.9, 0.08, 0.35, M.kunststoff, halb - 4.9, 1.18, (B / 2 - 0.15) * s));
  });
  // Auflieger (13,6 m Koffer)
  const ax1 = halb - 2.75, ax0 = -halb;
  const auf = kiste(ax1 - ax0, 2.8, B, koffer, (ax0 + ax1) / 2, 1.2 + 1.4, 0); auf.receiveShadow = true; g.add(auf);
  g.add(kiste(ax1 - ax0, 0.14, B + 0.02, M.kunststoff, (ax0 + ax1) / 2, 1.2, 0));
  // Rippen an der Seite
  for(let x = ax0 + 0.6; x < ax1; x += 1.2){ [1, -1].forEach(function(s){ g.add(kiste(0.05, 2.7, 0.02, koffer, x, 2.6, (B / 2 + 0.01) * s)); }); }
  // Seitlicher Unterfahrschutz, Seitenmarkierungsleuchten, Konturmarkierung (gelb)
  [1, -1].forEach(function(s){
    g.add(kiste(6.0, 0.08, 0.04, M.mast, -1.5, 0.95, (B / 2 - 0.05) * s));
    g.add(kiste(6.0, 0.08, 0.04, M.mast, -1.5, 0.62, (B / 2 - 0.05) * s));
    g.add(kiste(ax1 - ax0 - 0.4, 0.05, 0.01, M.rueckstrahlerGelb, (ax0 + ax1) / 2, 1.34, (B / 2 + 0.012) * s));
    for(let x = ax0 + 0.8; x < ax1; x += 2.8) g.add(kiste(0.12, 0.07, 0.05, M.rueckstrahlerGelb, x, 1.08, (B / 2 + 0.02) * s));
  });
  // Heck: Unterfahrschutz, Leuchten, rote Konturmarkierung, Kennzeichen
  g.add(kiste(0.12, 0.14, B - 0.3, M.mast, ax0 - 0.05, 0.62, 0));
  const lichter = { front: [], heck: [], bremse: [], blinkL: [], blinkR: [], glanzFront: [], glanzHeck: [], glanzBlinkL: [], glanzBlinkR: [] };
  const matS = M.scheinwerfer(), matR = M.ruecklicht(), matB = M.ruecklicht(), matBL = M.blinker(), matBR = M.blinker();
  lichter.mats = { front: matS, heck: matR, bremse: matB, blinkL: matBL, blinkR: matBR };
  [1, -1].forEach(function(s){
    g.add(kiste(0.08, 0.16, 0.42, matS, kx1 + 0.06, 1.12, (B / 2 - 0.35) * s));
    g.add(kiste(0.08, 0.1, 0.14, s < 0 ? matBL : matBR, kx1 + 0.06, 1.12, (B / 2 - 0.08) * s));
    g.add(kiste(0.06, 0.16, 0.34, matR, ax0 - 0.03, 1.0, (B / 2 - 0.3) * s));
    g.add(kiste(0.06, 0.14, 0.16, matB, ax0 - 0.03, 1.0, (B / 2 - 0.62) * s));
    g.add(kiste(0.06, 0.14, 0.16, s < 0 ? matBL : matBR, ax0 - 0.03, 1.0, (B / 2 - 0.08) * s));
    g.add(kiste(0.02, 2.6, 0.05, M.rueckstrahler, ax0 - 0.01, 2.6, (B / 2 - 0.03) * s));
    const gs = new THREE.Sprite(M.glanz.clone()); gs.position.set(kx1 + 0.3, 1.12, (B / 2 - 0.35) * s); gs.scale.set(1.3, 1.3, 1); g.add(gs); lichter.glanzFront.push(gs);
    const gh = new THREE.Sprite(M.glanzRot.clone()); gh.position.set(ax0 - 0.25, 1.0, (B / 2 - 0.4) * s); gh.scale.set(1.0, 1.0, 1); g.add(gh); lichter.glanzHeck.push(gh);
    [kx1 + 0.2, ax0 - 0.2].forEach(function(bx){
      const gb = new THREE.Sprite(M.glanzGelb.clone()); gb.position.set(bx, bx > 0 ? 1.12 : 1.0, (B / 2 - 0.08) * s); gb.scale.set(0.8, 0.8, 1);
      g.add(gb); (s < 0 ? lichter.glanzBlinkL : lichter.glanzBlinkR).push(gb);
    });
  });
  g.add(kiste(0.02, 0.05, B - 0.1, M.rueckstrahler, ax0 - 0.01, 3.95, 0));
  g.add(kiste(0.03, 2.7, 0.03, M.kunststoff, ax0 - 0.012, 2.6, 0));
  [-0.95, -0.35, 0.35, 0.95].forEach(function(z){ g.add(kiste(0.04, 2.6, 0.035, M.chrom, ax0 - 0.025, 2.6, z)); g.add(kiste(0.05, 0.08, 0.1, M.mast, ax0 - 0.03, 1.9, z)); });
  [1.6, 2.6, 3.6].forEach(function(y){ [1, -1].forEach(function(s){ g.add(kiste(0.04, 0.1, 0.14, M.mast, ax0 - 0.02, y, (B / 2 - 0.06) * s)); }); });
  const kzMat = new THREE.MeshStandardMaterial({ map: textur(schriftTextur(opt.kennzeichen || "FA · LK 60", { w: 520, h: 112, eu: true, rand: "#111", gross: 0.56 })), roughness: 0.5 });
  const kzh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.112), kzMat); kzh.rotation.y = -Math.PI / 2; kzh.position.set(ax0 - 0.07, 0.85, 0.5); g.add(kzh);
  const kzv = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.112), kzMat); kzv.rotation.y = Math.PI / 2; kzv.position.set(kx1 + 0.12, 0.72, 0); g.add(kzv);
  // Raeder: Zugmaschine 2 Achsen, Auflieger 3 Achsen (Zwillings-/Breitreifen)
  const raeder = [];
  const achsen = [[halb - 1.45, true, 0.52, 0.32], [halb - 5.15, false, 0.52, 0.5], [ax0 + 2.6, false, 0.48, 0.42], [ax0 + 3.91, false, 0.48, 0.42], [ax0 + 5.22, false, 0.48, 0.42]];
  achsen.forEach(function(a){
    [1, -1].forEach(function(s){
      const lenk = new THREE.Group(); lenk.position.set(a[0], a[2], (B / 2 - a[3] / 2 - 0.05) * s);
      const r = rad(M, a[2], a[3], { seite: s, speichen: 8, dunkel: !a[1] }); lenk.add(r); g.add(lenk);
      raeder.push({ dreh: r, lenk: a[1] ? lenk : null, r: a[2] });
    });
  });
  const fahrer = insasse(M, rnd); fahrer.gruppe.position.set(kx1 - 0.85, 1.55, -0.6); g.add(fahrer.gruppe);
  const radGr = raeder.map(function(r){ return r.lenk; });
  verschmelzen(g, function(o){ return o.isSprite || o === fahrer.kopf || radGr.indexOf(o) !== -1; });
  return { gruppe: g, raeder: raeder, lichter: lichter, kopf: fahrer.kopf, laenge: L, breite: B, hoehe: 4.0, augen: { x: kx1 - 0.8, y: 2.9, z: -0.6 } };
}

// Traktor (steht in der Szene an einer Einmuendung)
export function baueTraktor(M, opt){
  opt = opt || {};
  const g = new THREE.Group();
  const lack = new THREE.MeshStandardMaterial({ color: new THREE.Color(opt.farbe || "#3f7d2e"), metalness: 0.3, roughness: 0.45 });
  g.add(kiste(1.9, 0.75, 0.9, lack, 0.55, 1.05, 0));
  g.add(kiste(0.12, 0.6, 0.75, M.schwarz, 1.52, 1.02, 0));
  g.add(kiste(1.1, 0.25, 1.3, lack, -0.55, 1.12, 0));
  // Kabine: vier Pfosten, Dach, Glas
  [[-0.1, 0.62], [-0.1, -0.62], [-1.05, 0.62], [-1.05, -0.62]].forEach(function(p){ g.add(kiste(0.07, 1.35, 0.07, M.schwarz, p[0], 1.95, p[1])); });
  g.add(kiste(1.15, 0.08, 1.4, lack, -0.57, 2.66, 0));
  g.add(viereck([-0.08, 1.35, -0.6], [-0.08, 1.35, 0.6], [-0.08, 2.6, 0.6], [-0.08, 2.6, -0.6], M.glas));
  g.add(kiste(0.12, 0.8, 0.06, M.schwarz, 1.25, 1.75, 0.3));
  const raeder = [];
  [[1.1, 0.48, 0.32, true], [-0.75, 0.82, 0.48, false]].forEach(function(a){
    [1, -1].forEach(function(s){
      const lenk = new THREE.Group(); lenk.position.set(a[0], a[1], (0.78 + a[2] / 2) * s);
      const r = rad(M, a[1], a[2], { seite: s, speichen: 6, dunkel: false });
      r.children[2].material = new THREE.MeshStandardMaterial({ color: 0xd9b42a, roughness: 0.5 });
      lenk.add(r); g.add(lenk); raeder.push({ dreh: r, lenk: a[3] ? lenk : null, r: a[1] });
    });
  });
  const lichter = { front: [], heck: [], bremse: [], blinkL: [], blinkR: [], glanzFront: [], glanzHeck: [], glanzBlinkL: [], glanzBlinkR: [] };
  const matS = M.scheinwerfer(), matR = M.ruecklicht(), matBL = M.blinker(), matBR = M.blinker();
  lichter.mats = { front: matS, heck: matR, bremse: matR, blinkL: matBL, blinkR: matBR };
  [1, -1].forEach(function(s){ g.add(kiste(0.06, 0.12, 0.18, matS, 1.52, 1.25, 0.32 * s)); g.add(kiste(0.08, 0.08, 0.08, s < 0 ? matBL : matBR, -0.1, 2.62, 0.66 * s)); g.add(kiste(0.06, 0.1, 0.12, matR, -1.12, 1.12, 0.55 * s)); });
  const rundum = kiste(0.14, 0.12, 0.14, M.blinker(), -0.57, 2.76, 0.5); g.add(rundum); lichter.rundum = rundum.material;
  const fahrer = insasse(M, zufall(5)); fahrer.gruppe.position.set(-0.6, 1.3, 0); g.add(fahrer.gruppe);
  const radGr = raeder.map(function(r){ return r.lenk; });
  verschmelzen(g, function(o){ return o.isSprite || o === fahrer.kopf || o.material === lichter.rundum || radGr.indexOf(o) !== -1; });
  return { gruppe: g, raeder: raeder, lichter: lichter, kopf: fahrer.kopf, laenge: 3.6, breite: 2.1, hoehe: 2.8, augen: { x: -0.5, y: 2.2, z: 0 } };
}

/* ---------------------------------------------------------------------
   Landstrasse mit Umgebung
   --------------------------------------------------------------------- */
// def: { von, bis, spur, mitte:[{von, bis, art:"leit"|"warn"|"voll"}], einmuendungen:[{x, breite, seite}],
//        schilder:[{typ, x, seite, rueckseite?}], bauernhof:{x, z}, dorf:{x, z}, windraeder:[{x, z}] }
export function baueLandstrasse(welt, def){
  const M = welt.M, g = new THREE.Group();
  const sp = def.spur || 3.5, x0 = def.von, x1 = def.bis, len = x1 - x0;
  const rand = sp + 0.25;                              // Fahrbahnkante
  const asphalt = new THREE.MeshStandardMaterial({ map: textur(asphaltTextur(), [len / 9, 1]), roughness: 0.93, metalness: 0 });
  const fahrbahn = boden(x0, x1, -rand, rand, 0, asphalt); g.add(fahrbahn);
  const bankettMat = new THREE.MeshStandardMaterial({ map: textur(bankettTextur(), [len / 3, 1]), roughness: 1 });
  g.add(boden(x0, x1, rand, rand + 0.9, -0.03, bankettMat));
  g.add(boden(x0, x1, -rand - 0.9, -rand, -0.03, bankettMat));
  const grasMat = new THREE.MeshStandardMaterial({ map: textur(grasTextur(), [len / 4, 60 / 4]), roughness: 1 });
  g.add(boden(x0, x1, rand + 0.9, rand + 60, -0.05, grasMat));
  g.add(boden(x0, x1, -rand - 60, -rand - 0.9, -0.05, grasMat));
  const felder = new THREE.MeshStandardMaterial({ map: textur(felderTextur(), [2, 1]), roughness: 1, polygonOffset: true, polygonOffsetFactor: 6, polygonOffsetUnits: 6 });
  g.add(boden(x0 - 1500, x1 + 1500, -2600, 2600, -0.35, felder));

  // Markierungen in echten Massen: Schmalstrich 0,12 m.
  // Leitlinie ausserorts 6 m Strich / 12 m Luecke, Warnlinie 6 m / 3 m (kuendigt die
  // durchgezogene Fahrstreifenbegrenzung an), Fahrbahnbegrenzung durchgezogen.
  const R = [], b = 0.12;
  const einm = def.einmuendungen || [];
  const inEinm = function(x, seite){ return einm.some(function(e){ return e.seite === seite && Math.abs(x - e.x) < e.breite / 2 + 2.5; }); };
  [1, -1].forEach(function(seite){
    const z = (sp + 0.06) * seite;
    let x = x0;
    while(x < x1){
      if(inEinm(x, seite)){
        // an der Einmuendung: Randlinie unterbrochen (kurze Striche)
        R.push([x, x + 1, z - b / 2, z + b / 2]); x += 2; continue;
      }
      let e = x + 10; einm.forEach(function(em){ if(em.seite === seite && em.x - em.breite / 2 - 2.5 > x) e = Math.min(e, em.x - em.breite / 2 - 2.5); });
      e = Math.min(e, x1); R.push([x, e, z - b / 2, z + b / 2]); x = e;
    }
  });
  (def.mitte || []).forEach(function(m){
    if(m.art === "voll"){ R.push([m.von, m.bis, -b / 2, b / 2]); return; }
    const strich = 6, luecke = m.art === "warn" ? 3 : 12;
    for(let x = m.von; x < m.bis; x += strich + luecke) R.push([x, Math.min(x + strich, m.bis), -b / 2, b / 2]);
  });
  // Wartelinie (Zeichen 341) an Einmuendungen: 0,5 m breit, Striche 0,5 m, Luecken 0,25 m
  einm.forEach(function(e){
    const z = (rand + 0.45) * e.seite;
    for(let x = e.x - e.breite / 2 + 0.2; x < e.x + e.breite / 2 - 0.2; x += 0.75) R.push([x, x + 0.5, z - 0.25, z + 0.25]);
    // Einmuendende Strasse
    const zA = rand * e.seite, zE = (rand + (e.laenge || 60)) * e.seite;
    const m = boden(e.x - e.breite / 2, e.x + e.breite / 2, Math.min(zA, zE), Math.max(zA, zE), 0.002, asphalt.clone());
    // Textur um 90° drehen, damit die Fahrspuren in Richtung des Feldwegs laufen
    const tx = textur(asphaltTextur(), [(e.laenge || 60) / 9, 1]); tx.center.set(0.5, 0.5); tx.rotation = Math.PI / 2;
    m.material.map = tx; g.add(m);
  });
  const mark = new THREE.Mesh(rechteckFlaeche(R, 0.012), M.markierung); mark.receiveShadow = true; g.add(mark);

  // Leitpfosten alle 50 m auf beiden Seiten (Zeichen 620). Rechts ein rechteckiger,
  // auf der Gegenseite zwei runde Rueckstrahler.
  const nP = Math.ceil(len / 50) * 2;
  const pf = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 1.0, 0.1), M.pfosten, nP);
  const band = new THREE.InstancedMesh(new THREE.BoxGeometry(0.128, 0.25, 0.108), M.schwarz, nP);
  const eckig = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.045, 0.18), M.rueckstrahler, nP);
  const rund = new THREE.InstancedMesh(new THREE.CircleGeometry(0.028, 12), M.rueckstrahler, nP * 2);
  pf.castShadow = true;
  const dm = new THREE.Object3D(); let i = 0, j = 0;
  for(let x = x0 + 25; x < x1; x += 50){
    [1, -1].forEach(function(seite){
      if(inEinm(x, seite)) return;
      const z = (rand + 1.25) * seite;
      dm.position.set(x, 0.5, z); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); pf.setMatrixAt(i, dm.matrix);
      dm.position.set(x, 0.85, z); dm.updateMatrix(); band.setMatrixAt(i, dm.matrix);
      // rechteckig: zum Verkehr, fuer den der Pfosten rechts steht
      const fr = seite > 0 ? -1 : 1;
      dm.position.set(x + fr * 0.066, 0.85, z); dm.rotation.set(0, fr > 0 ? Math.PI / 2 : -Math.PI / 2, 0); dm.updateMatrix(); eckig.setMatrixAt(i, dm.matrix);
      [0.9, 0.8].forEach(function(yy){ dm.position.set(x - fr * 0.066, yy, z); dm.rotation.set(0, fr > 0 ? -Math.PI / 2 : Math.PI / 2, 0); dm.updateMatrix(); rund.setMatrixAt(j++, dm.matrix); });
      i++;
    });
  }
  pf.count = band.count = eckig.count = i; rund.count = j;
  g.add(pf, band, eckig, rund);

  // Verkehrszeichen: Aufstellung ausserorts, Unterkante 2 m, Durchmesser 0,6 m
  (def.schilder || []).forEach(function(s){ g.add(baueSchild(M, s, rand)); });

  // Baeume: Alleen nah an der Strasse, Gruppen und ein Waldrand in der Ferne
  const rnd = zufall(def.seed || 99);
  const baeume = [];
  (def.alleen || []).forEach(function(a){
    for(let x = a.von; x < a.bis; x += a.abstand || 14){
      [1, -1].forEach(function(seite){
        if(a.seite && a.seite !== seite) return;
        if(inEinm(x, seite)) return;
        baeume.push({ x: x + (rnd() - 0.5) * 2, z: (rand + 5.5 + rnd() * 1.5) * seite, h: 8 + rnd() * 4, art: "laub" });
      });
    }
  });
  for(let n = 0; n < 260; n++){
    const x = x0 - 400 + rnd() * (len + 800), seite = rnd() < 0.5 ? 1 : -1, z = (22 + rnd() * rnd() * 380) * seite;
    baeume.push({ x: x, z: z, h: 7 + rnd() * 9, art: rnd() < 0.22 ? "nadel" : "laub" });
  }
  (def.waelder || []).forEach(function(w){
    for(let n = 0; n < (w.anzahl || 300); n++) baeume.push({ x: w.x0 + rnd() * (w.x1 - w.x0), z: w.z0 + rnd() * (w.z1 - w.z0), h: 14 + rnd() * 10, art: rnd() < (w.nadel || 0.5) ? "nadel" : "laub" });
  });
  g.add(baueBaeume(M, baeume, rnd));
  g.add(baueRandgruen(M, x0, x1, rand, inEinm));
  if(!welt.wolken){ welt.wolken = baueWolken(M); welt.szene.add(welt.wolken); }

  // Huegel am Horizont
  const hr = zufall(5);
  for(let n = 0; n < 16; n++){
    const hg = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.huegel);
    const ang = n / 16 * Math.PI * 2 + hr() * 0.3, dist = 1700 + hr() * 500;
    hg.position.set((x0 + x1) / 2 + Math.cos(ang) * dist * 1.4, -2, Math.sin(ang) * dist);
    hg.scale.set(300 + hr() * 400, 50 + hr() * 110, 250 + hr() * 300);
    g.add(hg);
  }
  if(def.bauernhof) g.add(baueHof(M, def.bauernhof));
  if(def.dorf) g.add(baueDorf(M, def.dorf));
  const rotoren = [];
  (def.windraeder || []).forEach(function(w){ const wr = baueWindrad(M, w); g.add(wr.gruppe); welt.dreher.push(wr); rotoren.push(wr.rotor); });
  // Alles Unbewegliche zusammenfassen (Haeuser, Schilder, Huegel, Flaechen)
  verschmelzen(g, function(o){ return rotoren.indexOf(o) !== -1; });
  g.children.forEach(function(o){ if(o.isMesh && !o.isInstancedMesh && o.material && (o.material === M.huegel)) o.castShadow = false; });
  welt.szene.add(g);
  return g;
}

function baueSchild(M, s, rand){
  const g = new THREE.Group();
  const seite = s.seite || 1, z = (rand + 1.9) * seite;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 10), M.mast); mast.position.set(s.x, 1.3, z); mast.castShadow = true; g.add(mast);
  const vorne = new THREE.MeshStandardMaterial({ map: textur(schildTextur(s.typ)), transparent: true, alphaTest: 0.5, roughness: 0.45 });
  const hinten = new THREE.MeshStandardMaterial({ map: textur(schildTextur(s.typ === "z205" ? "rueck_dreieck" : "rueck_rund")), transparent: true, alphaTest: 0.5, roughness: 0.6 });
  const pl = new THREE.PlaneGeometry(0.6, 0.6);
  const f = new THREE.Mesh(pl, vorne), h = new THREE.Mesh(pl, hinten);
  // Schild blickt dem Verkehr entgegen: fuer +x-Verkehr nach -x; "blick" kann das ueberschreiben (Einmuendung)
  const blick = s.blick !== undefined ? s.blick : -Math.PI / 2;
  f.position.set(s.x, 2.3, z); f.rotation.y = blick; f.castShadow = true;
  h.position.set(s.x, 2.3, z); h.rotation.y = blick + Math.PI;
  f.translateZ(0.012); h.translateZ(0.012);
  if(s.zPos !== undefined){ mast.position.z = f.position.z = h.position.z = s.zPos; if(s.xPos !== undefined){ mast.position.x = f.position.x = h.position.x = s.xPos; } }
  g.add(f, h);
  return g;
}

function baueBaeume(M, liste, rnd, nahFn){
  const g = new THREE.Group();
  const laub = liste.filter(function(b){ return b.art === "laub"; }), nadel = liste.filter(function(b){ return b.art === "nadel"; });
  const stamm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.26, 1, 7), M.rinde, liste.length);
  const KB = 6; // Laubballen je nahem Baum
  const nah = nahFn || function(b){ return Math.abs(b.z) < 45; };
  const krone = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M.laub, laub.filter(nah).length * KB);
  const kroneFern = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M.laub, laub.length * 3);
  const kegel = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 8, 1), M.laub, nadel.length * 2);
  stamm.castShadow = krone.castShadow = kegel.castShadow = true;
  const dm = new THREE.Object3D(), c = new THREE.Color();
  let si = 0, ki = 0, ni = 0, fi = 0;
  const gruen = [0x4f7a34, 0x5b8a3a, 0x3f6a2c, 0x6a9142, 0x46703a, 0x587f2e];
  liste.forEach(function(b){
    const st = b.art === "nadel" ? b.h * 0.3 : b.h * 0.42;
    dm.position.set(b.x, st / 2, b.z); dm.rotation.set(0, rnd() * 6, 0); dm.scale.set(1 + b.h / 14, st, 1 + b.h / 14); dm.updateMatrix(); stamm.setMatrixAt(si++, dm.matrix);
    if(b.art === "laub"){
      const r0 = b.h * 0.3, grund = gruen[(rnd() * gruen.length) | 0];
      if(!nah(b)){
        for(let k = 0; k < 3; k++){
          const a = rnd() * Math.PI * 2, d = k === 0 ? 0 : r0 * 0.55;
          dm.position.set(b.x + Math.cos(a) * d, st + r0 * (k === 0 ? 0.95 : 0.7), b.z + Math.sin(a) * d);
          const s = r0 * (k === 0 ? 1.0 : 0.7); dm.scale.set(s, s * 0.85, s); dm.rotation.set(rnd() * 3, rnd() * 3, 0); dm.updateMatrix();
          kroneFern.setMatrixAt(fi, dm.matrix); c.setHex(grund); c.offsetHSL(0, 0, (rnd() - 0.5) * 0.06); kroneFern.setColorAt(fi, c); fi++;
        }
        return;
      }
      for(let k = 0; k < KB; k++){
        // ein grosser Ballen in der Mitte, die anderen darum verteilt, oben kleiner
        const a = rnd() * Math.PI * 2, d = k === 0 ? 0 : r0 * (0.45 + rnd() * 0.4), hy = k === 0 ? 0.9 : 0.5 + rnd() * 1.1;
        dm.position.set(b.x + Math.cos(a) * d, st + r0 * hy, b.z + Math.sin(a) * d);
        const s = r0 * (k === 0 ? 0.95 : 0.5 + rnd() * 0.3);
        dm.scale.set(s, s * (0.78 + rnd() * 0.3), s); dm.rotation.set(rnd() * 3, rnd() * 3, 0); dm.updateMatrix();
        krone.setMatrixAt(ki, dm.matrix); c.setHex(grund); c.offsetHSL((rnd() - 0.5) * 0.02, 0, (rnd() - 0.5) * 0.08 + (hy > 1 ? 0.03 : -0.02)); krone.setColorAt(ki, c); ki++;
      }
    } else {
      for(let k = 0; k < 2; k++){
        const hh = b.h * (0.62 - k * 0.2), rr = b.h * (0.2 - k * 0.05);
        dm.position.set(b.x, st + hh / 2 + k * b.h * 0.25, b.z); dm.scale.set(rr, hh, rr); dm.rotation.set(0, rnd() * 3, 0); dm.updateMatrix();
        kegel.setMatrixAt(ni, dm.matrix); c.setHex([0x2f5a2c, 0x35602f, 0x2a4f28][(rnd() * 3) | 0]); kegel.setColorAt(ni, c); ni++;
      }
    }
  });
  krone.count = ki; kegel.count = ni; kroneFern.count = fi;
  kroneFern.castShadow = true;
  g.add(stamm, krone, kroneFern, kegel);
  return g;
}

// Grasbueschel, Wildblumen und kleine Steine auf dem Bankett und am Grabenrand
function baueRandgruen(M, x0, x1, rand, inEinm){
  const g = new THREE.Group(), rnd = zufall(17);
  const n = Math.floor((x1 - x0) * 1.8);
  const busch = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.2, 0), M.laub, n);
  const blume = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 6, 4), M.laub, Math.floor(n / 4));
  const dm = new THREE.Object3D(), c = new THREE.Color();
  let i = 0, j = 0;
  for(let k = 0; k < n; k++){
    const x = x0 + rnd() * (x1 - x0), seite = rnd() < 0.5 ? 1 : -1;
    if(inEinm(x, seite)) continue;
    const z = (rand + 0.75 + rnd() * rnd() * 7) * seite;
    const s = 0.6 + rnd() * 1.1;
    dm.position.set(x, 0.04 * s, z); dm.scale.set(s * 1.3, s * (0.45 + rnd() * 0.5), s * 1.3); dm.rotation.set((rnd() - 0.5) * 0.4, rnd() * 3, (rnd() - 0.5) * 0.4); dm.updateMatrix();
    busch.setMatrixAt(i, dm.matrix); c.setHex([0x5d7f3a, 0x6f9146, 0x7f9a4e, 0x8c9a58, 0x556f35][(rnd() * 5) | 0]); busch.setColorAt(i, c); i++;
    if(j < blume.count && rnd() < 0.25){
      dm.position.set(x + (rnd() - 0.5) * 0.4, 0.3 + rnd() * 0.2, z + (rnd() - 0.5) * 0.4); dm.scale.set(1, 1, 1); dm.updateMatrix();
      blume.setMatrixAt(j, dm.matrix); c.setHex([0xf2f0e6, 0xf5d547, 0xc54b8c, 0x6f7fd8, 0xe8e2d0][(rnd() * 5) | 0]); blume.setColorAt(j, c); j++;
    }
  }
  busch.count = i; blume.count = j; busch.receiveShadow = true;
  g.add(busch, blume);
  return g;
}
// Wolken: weiche Flecken als Billboards, weit oben
function wolkenTextur(){
  if(TEX.wolke) return TEX.wolke;
  const rnd = zufall(41);
  const c = leinwand(256, 128, function(ctx, w, h){
    for(let i = 0; i < 26; i++){
      const x = w * (0.18 + rnd() * 0.64), y = h * (0.45 + (rnd() - 0.5) * 0.35), r = 18 + rnd() * 30;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  });
  return (TEX.wolke = c);
}
function baueWolken(M){
  const g = new THREE.Group(), rnd = zufall(43);
  const mat = new THREE.SpriteMaterial({ map: textur(wolkenTextur()), transparent: true, depthWrite: false, fog: false, opacity: 0.95 });
  M.wolke = mat;
  for(let i = 0; i < 26; i++){
    const sp = new THREE.Sprite(mat);
    const a = rnd() * Math.PI * 2, d = 900 + rnd() * 2200;
    sp.position.set(800 + Math.cos(a) * d, 260 + rnd() * 380, Math.sin(a) * d);
    const s = 400 + rnd() * 700; sp.scale.set(s, s * 0.42, 1);
    g.add(sp);
  }
  g.renderOrder = -0.5;
  return g;
}

function haus(M, w, d, h, dach, x, z, rot, opt){
  opt = opt || {};
  const g = new THREE.Group();
  const wand = kiste(w, h, d, opt.wand || M.wand, 0, h / 2, 0); wand.receiveShadow = true; g.add(wand);
  const s = new THREE.Shape(); s.moveTo(-d / 2 - 0.4, 0); s.lineTo(d / 2 + 0.4, 0); s.lineTo(0, dach); s.closePath();
  const dg = new THREE.ExtrudeGeometry(s, { depth: w + 0.6, bevelEnabled: false }); dg.translate(0, 0, -(w + 0.6) / 2);
  const dm = new THREE.Mesh(dg, opt.dach || M.dachRot); dm.rotation.y = Math.PI / 2; dm.position.y = h; dm.castShadow = true; g.add(dm);
  // Fenster in zwei Reihen
  const fn = Math.max(1, Math.floor(w / 2.6));
  for(let i = 0; i < fn; i++){
    for(let r = 0; r < (h > 5 ? 2 : 1); r++){
      const fx = -w / 2 + (i + 0.5) * w / fn;
      [1, -1].forEach(function(s2){ const f = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.2), M.fenster); f.position.set(fx, 1.6 + r * 2.7, (d / 2 + 0.01) * s2); if(s2 < 0) f.rotation.y = Math.PI; g.add(f); });
    }
  }
  g.position.set(x, 0, z); g.rotation.y = rot || 0;
  return g;
}
function baueHof(M, p){
  const g = new THREE.Group();
  g.add(haus(M, 12, 9, 6, 4.5, 0, 0, 0.1));
  g.add(haus(M, 22, 13, 7, 5, -4, -24, 0.1, { wand: M.holz, dach: M.dachGrau }));
  const silo = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 14, 20), M.mast); silo.position.set(14, 7, -20); silo.castShadow = true; g.add(silo);
  const kappe = new THREE.Mesh(new THREE.ConeGeometry(3.1, 2, 20), M.mast); kappe.position.set(14, 15, -20); g.add(kappe);
  g.position.set(p.x, 0, p.z); g.rotation.y = p.dreh || 0;
  return g;
}
function baueDorf(M, p){
  const g = new THREE.Group(), rnd = zufall(31);
  for(let i = 0; i < 18; i++) g.add(haus(M, 9 + rnd() * 5, 8 + rnd() * 3, 5 + rnd() * 3, 4 + rnd() * 2, (rnd() - 0.5) * 180, (rnd() - 0.5) * 120, rnd() * 0.6 - 0.3, { dach: rnd() < 0.7 ? M.dachRot : M.dachGrau }));
  // Kirchturm
  const turm = kiste(6, 30, 6, M.wand, 10, 15, 0); g.add(turm);
  const spitze = new THREE.Mesh(new THREE.ConeGeometry(4.6, 14, 4), M.dachGrau); spitze.position.set(10, 37, 0); spitze.rotation.y = Math.PI / 4; g.add(spitze);
  g.add(haus(M, 20, 11, 9, 7, 24, 0, 0));
  g.position.set(p.x, 0, p.z);
  return g;
}
function baueWindrad(M, p){
  const g = new THREE.Group();
  const turm = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.6, 110, 16), M.windrad); turm.position.y = 55; g.add(turm);
  const gondel = kiste(9, 3.4, 3.6, M.windrad, 1.5, 111, 0); g.add(gondel);
  const rotor = new THREE.Group(); rotor.position.set(-3.5, 111, 0);
  const nabe = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 12), M.windrad); nabe.scale.set(1.4, 1, 1); rotor.add(nabe);
  for(let i = 0; i < 3; i++){
    const f = new THREE.Shape(); f.moveTo(-1.4, 0); f.lineTo(1.6, 0); f.lineTo(0.35, 55); f.lineTo(-0.2, 55); f.closePath();
    const b = new THREE.Mesh(new THREE.ExtrudeGeometry(f, { depth: 0.4, bevelEnabled: false }), M.windrad);
    b.rotation.z = i / 3 * Math.PI * 2; b.rotation.y = Math.PI / 2; rotor.add(b);
    b.rotation.set(i / 3 * Math.PI * 2, Math.PI / 2, 0, "YXZ");
  }
  g.add(rotor);
  g.position.set(p.x, 0, p.z); g.rotation.y = p.dreh || 0.3;
  return { gruppe: g, rotor: rotor, tempo: p.tempo || 1.4 };
}

/* ---------------------------------------------------------------------
   Welt: Renderer, Himmel, Licht, Tageszeiten, Kameras
   --------------------------------------------------------------------- */
const TAGESZEIT = {
  tag:        { oben: 0x5f9bd6, horizont: 0xdfeaf2, nebel: 0xd6e2ea, nah: 260, fern: 2400, hemi: 0.75, himmel: 0xd2e4f5, grund: 0x6b7f4a, sonne: 0xfff3dd, sonneI: 2.6, hoehe: 48, richtung: -0.6, licht: false, belichtung: 1.0, fenster: 0 },
  daemmerung: { oben: 0x2c3a6b, horizont: 0xf0a26a, nebel: 0xc08a72, nah: 200, fern: 1600, hemi: 0.35, himmel: 0x8a8cb8, grund: 0x3d3a2e, sonne: 0xff9a55, sonneI: 1.25, hoehe: 7, richtung: 2.5, licht: true, belichtung: 1.05, fenster: 0.8 },
  nacht:      { oben: 0x02050c, horizont: 0x16213a, nebel: 0x0c1422, nah: 70, fern: 950, hemi: 0.22, himmel: 0x34466e, grund: 0x080b0c, sonne: 0x9db4ff, sonneI: 0.32, hoehe: 40, richtung: 1.2, licht: true, belichtung: 1.15, fenster: 1.4 }
};

export function erstelleWelt(canvas, opt){
  opt = opt || {};
  let gl;
  try{ gl = canvas.getContext("webgl2") || canvas.getContext("webgl"); } catch(e){ gl = null; }
  if(!gl) throw new Error("kein_webgl");
  const qualitaet = { stufe: opt.qualitaet || "hoch" };
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, context: gl, antialias: true, powerPreference: "high-performance" });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const szene = new THREE.Scene();
  const kamera = new THREE.PerspectiveCamera(50, 1, 0.08, 6000);
  const M = materialien();
  const welt = { renderer: renderer, szene: szene, kamera: kamera, M: M, fahrzeuge: [], dreher: [], qualitaet: qualitaet, zeitStufe: "tag" };

  // Himmel als Kuppel mit Farbverlauf
  const himmelMat = new THREE.ShaderMaterial({
    uniforms: { oben: { value: new THREE.Color() }, horizont: { value: new THREE.Color() }, unten: { value: new THREE.Color() } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 oben; uniform vec3 horizont; uniform vec3 unten; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(horizont, oben, pow(clamp(h,0.0,1.0), 0.55)) : mix(horizont, unten, clamp(-h*6.0,0.0,1.0)); gl_FragColor = vec4(c, 1.0); }",
    side: THREE.BackSide, depthWrite: false, fog: false
  });
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(4500, 32, 16), himmelMat);
  himmel.renderOrder = -1; szene.add(himmel);
  // Sterne fuer die Nacht
  const sternPos = []; const sr = zufall(77);
  for(let i = 0; i < 900; i++){ const a = sr() * Math.PI * 2, e = Math.asin(0.08 + sr() * 0.92); sternPos.push(Math.cos(a) * Math.cos(e) * 4000, Math.sin(e) * 4000, Math.sin(a) * Math.cos(e) * 4000); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sternPos, 3));
  const sterne = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0 }));
  szene.add(sterne);
  szene.fog = new THREE.Fog(0xffffff, 200, 2000);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x445533, 0.6); szene.add(hemi);
  const sonne = new THREE.DirectionalLight(0xffffff, 2);
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  const sc = sonne.shadow.camera; sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 10; sc.far = 600;
  sonne.shadow.bias = -0.0004; sonne.shadow.normalBias = 0.03;
  szene.add(sonne, sonne.target);
  // Scheinwerferlicht der Fahrschule (nur in Daemmerung/Nacht an)
  const spots = [1, -1].map(function(){ const s = new THREE.SpotLight(0xfff2d8, 0, 120, 0.42, 0.45, 1.3); szene.add(s, s.target); return s; });
  welt.spots = spots;
  const pmrem = new THREE.PMREMGenerator(renderer);

  welt.setzeTageszeit = function(name){
    const p = TAGESZEIT[name] || TAGESZEIT.tag; welt.zeitStufe = name;
    himmelMat.uniforms.oben.value.setHex(p.oben); himmelMat.uniforms.horizont.value.setHex(p.horizont); himmelMat.uniforms.unten.value.setHex(p.grund);
    szene.fog.color.setHex(p.nebel); szene.fog.near = p.nah; szene.fog.far = p.fern;
    hemi.color.setHex(p.himmel); hemi.groundColor.setHex(p.grund); hemi.intensity = p.hemi;
    sonne.color.setHex(p.sonne); sonne.intensity = p.sonneI;
    const e = p.hoehe * Math.PI / 180;
    welt.sonnenRichtung = new THREE.Vector3(Math.cos(e) * Math.cos(p.richtung), Math.sin(e), Math.cos(e) * Math.sin(p.richtung));
    renderer.toneMappingExposure = p.belichtung;
    sterne.material.opacity = name === "nacht" ? 0.9 : 0;
    welt.lichtAn = p.licht;
    M.rueckstrahler.emissiveIntensity = name === "nacht" ? 0.9 : name === "daemmerung" ? 0.35 : 0;
    M.rueckstrahlerGelb.emissiveIntensity = M.rueckstrahler.emissiveIntensity;
    M.fenster.emissiveIntensity = p.fenster;
    if(M.wolke){ M.wolke.color.setHex(name === "nacht" ? 0x1a2233 : name === "daemmerung" ? 0xf2b08a : 0xffffff); M.wolke.opacity = name === "nacht" ? 0 : 0.95; }
    spots.forEach(function(s){ s.intensity = p.licht ? (name === "nacht" ? 90 : 35) : 0; });
    // Umgebung fuer Spiegelungen in Lack und Glas aus dem Himmel erzeugen
    const env = new THREE.Scene(); env.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), himmelMat.clone()));
    env.children[0].material.uniforms = { oben: { value: himmelMat.uniforms.oben.value.clone() }, horizont: { value: himmelMat.uniforms.horizont.value.clone() }, unten: { value: new THREE.Color(p.grund).multiplyScalar(0.8) } };
    if(welt.envZiel) welt.envZiel.dispose();
    welt.envZiel = pmrem.fromScene(env, 0.02);
    szene.environment = welt.envZiel.texture;
    szene.environmentIntensity = name === "nacht" ? 0.15 : name === "daemmerung" ? 0.55 : 1;
  };

  welt.setzeQualitaet = function(stufe){
    qualitaet.stufe = stufe;
    const dpr = window.devicePixelRatio || 1;
    renderer.setPixelRatio(stufe === "hoch" ? Math.min(dpr, 2) : stufe === "mittel" ? Math.min(dpr, 1.25) : 1);
    renderer.shadowMap.enabled = stufe !== "niedrig";
    const ms = stufe === "hoch" ? 2048 : 1024;
    if(sonne.shadow.mapSize.x !== ms){ sonne.shadow.mapSize.set(ms, ms); if(sonne.shadow.map){ sonne.shadow.map.dispose(); sonne.shadow.map = null; } }
    szene.traverse(function(o){ if(o.material && o.material.needsUpdate !== undefined) o.material.needsUpdate = true; });
    welt.groesse();
  };

  welt.groesse = function(){
    const el = canvas.parentElement || canvas;
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    renderer.setSize(w, h, false);
    kamera.aspect = w / h; kamera.updateProjectionMatrix();
  };

  // Fahrzeug in die Welt setzen: bau = Rueckgabe von bauePkw/baueLkw..., fahrt = pose(t), sig = signale(t)
  welt.fahrzeug = function(id, bau, pose, signale){
    const f = { id: id, bau: bau, pose: pose, signale: signale || function(){ return {}; } };
    szene.add(bau.gruppe); welt.fahrzeuge.push(f);
    return f;
  };
  // Speicher freigeben: Geometrien immer; Materialien/Texturen nur, wenn sie nicht geteilt sind
  const geteilt = new Set(Object.keys(M).map(function(k){ return M[k]; }).filter(function(m){ return m && m.isMaterial; }));
  function freigeben(wurzel){
    wurzel.traverse(function(o){
      if(o.geometry) o.geometry.dispose();
      if(!o.material || o.isSprite) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(function(m){ if(geteilt.has(m)) return; if(m.map) m.map.dispose(); m.dispose(); });
    });
  }
  welt.freigeben = freigeben;
  welt.leereFahrzeuge = function(){
    welt.fahrzeuge.forEach(function(f){ szene.remove(f.bau.gruppe); freigeben(f.bau.gruppe); });
    welt.fahrzeuge = [];
  };

  // Stand zur Zeit t berechnen (Position, Raeder, Lichter, Kopf)
  welt.stellen = function(t){
    const nacht = welt.lichtAn;
    welt.fahrzeuge.forEach(function(f){
      const p = f.pose(t), s = f.signale(t) || {};
      f.stand = p;
      const g = f.bau.gruppe;
      g.position.set(p.x, 0, p.z); g.rotation.y = p.h;
      g.visible = p.sichtbar !== false;
      if(f.bau.animiere) f.bau.animiere(p, t, s);
      f.bau.raeder.forEach(function(r){
        r.dreh.rotation.z = -(p.s || 0) / r.r;
        if(r.lenk) r.lenk.rotation.y = Math.max(-0.6, Math.min(0.6, (p.lenk || 0) * 2.2));
      });
      const L = f.bau.lichter, an = Math.floor(t * 1.5 * 2) % 2 === 0; // Blinker 1,5 Hz (90 je Minute)
      if(!L) return;
      const bl = (s.blinker === "links" || s.warnblink) && an, br = (s.blinker === "rechts" || s.warnblink) && an;
      const lh = s.lichthupe ? (Math.floor(t * 5) % 2 === 0) : false;
      L.mats.front.emissiveIntensity = lh ? 6 : nacht ? 3 : 0;
      L.mats.heck.emissiveIntensity = nacht ? 1.2 : 0.12;
      L.mats.bremse.emissiveIntensity = s.bremse ? 3.5 : (L.mats.bremse === L.mats.heck ? L.mats.heck.emissiveIntensity : 0.05);
      L.mats.blinkL.emissiveIntensity = bl ? 4 : 0;
      L.mats.blinkR.emissiveIntensity = br ? 4 : 0;
      L.glanzFront.forEach(function(sp){ sp.material.opacity = lh ? 1 : nacht ? 0.9 : 0; });
      L.glanzHeck.forEach(function(sp){ sp.material.opacity = s.bremse ? (nacht ? 1 : 0.55) : nacht ? 0.45 : 0; });
      L.glanzBlinkL.forEach(function(sp){ sp.material.opacity = bl ? (nacht ? 1 : 0.7) : 0; });
      L.glanzBlinkR.forEach(function(sp){ sp.material.opacity = br ? (nacht ? 1 : 0.7) : 0; });
      if(L.rundum) L.rundum.emissiveIntensity = s.rundum && (Math.floor(t * 3) % 2 === 0) ? 5 : 0;
      if(f.bau.kopf){
        const soll = s.schulter === "links" ? 1.35 : s.schulter === "rechts" ? -1.35 : s.spiegel === "links" ? 0.55 : s.spiegel === "rechts" ? -0.55 : s.spiegel === "innen" ? -0.35 : 0;
        f.bau.kopf.rotation.y = soll;
      }
    });
    welt.dreher.forEach(function(d){ d.rotor.rotation.x = t * d.tempo; });
    (welt.ticker || []).forEach(function(fn){ fn(t); });
  };

  // Kameras: "oben" (Draufsicht), "schraeg" (von hinten oben), "fahrer" (Fahrersicht)
  const kam = { art: "schraeg", pos: new THREE.Vector3(), ziel: new THREE.Vector3(), sollPos: new THREE.Vector3(), sollZiel: new THREE.Vector3(), weich: 0 };
  welt.kamera.art = "schraeg";
  welt.setzeKamera = function(art, sofort){ kam.art = art; kam.weich = sofort ? 0 : 1; };
  welt.kameraArt = function(){ return kam.art; };
  function kameraSoll(fokus){
    const p = fokus.stand, h = p.h, fx = Math.cos(-h), fz = Math.sin(-h);
    if(kam.art === "fahrer"){
      const a = fokus.bau.augen, g = fokus.bau.gruppe;
      const v = new THREE.Vector3(a.x, a.y, a.z).applyMatrix4(g.matrixWorld);
      kam.sollPos.copy(v);
      kam.sollZiel.set(v.x + fx * 40, v.y - 0.9, v.z + fz * 40);
      kamera.fov = 62;
    } else if(kam.art === "oben"){
      const ko = welt.kameraOpt || {}, fe = ko.fest;
      if(fe && ko.obenFest){
        kam.sollPos.set(fe.x, ko.obenHoehe || 40, fe.z + 0.01); kam.sollZiel.set(fe.x, 0, fe.z);
      } else if(ko.folgeZ){
        const v = ko.obenVor === undefined ? 6 : ko.obenVor;
        kam.sollPos.set(p.x + fx * v, ko.obenHoehe || 40, p.z + fz * v + 0.01); kam.sollZiel.set(p.x + fx * v, 0, p.z + fz * v);
      } else {
        kam.sollPos.set(p.x + fx * 9, 64, 0.01);
        kam.sollZiel.set(p.x + fx * 9, 0, 0);
      }
      kamera.fov = 44;
    } else if(kam.art === "uebersicht" && welt.kameraOpt && welt.kameraOpt.fest){
      // feste Sicht schraeg von oben auf eine Kreuzung oder Parkluecke
      const fe = welt.kameraOpt.fest, bx = Math.cos(fe.blick), bz = Math.sin(fe.blick);
      kam.sollPos.set(fe.x - bx * fe.abstand, fe.hoehe, fe.z - bz * fe.abstand);
      kam.sollZiel.set(fe.x + bx * fe.abstand * 0.12, 0, fe.z + bz * fe.abstand * 0.12);
      kamera.fov = 50;
    } else {
      const ko = welt.kameraOpt || {};
      if(ko.stadt){
        kam.sollPos.set(p.x - fx * 11, 5.2, p.z - fz * 11);
        kam.sollZiel.set(p.x + fx * 16, 0.9, p.z + fz * 16);
        kamera.fov = 52;
        return;
      }
      kam.sollPos.set(p.x - fx * 17, 7.5, p.z - fz * 17 + 1.5);
      kam.sollZiel.set(p.x + fx * 28, 1.2, p.z + fz * 28 - 0.8);
      kamera.fov = 48;
    }
  }
  welt.render = function(fokusId, dt){
    const fokus = welt.fahrzeuge.find(function(f){ return f.id === fokusId; }) || welt.fahrzeuge[0];
    szene.updateMatrixWorld();
    if(fokus && fokus.stand){
      kameraSoll(fokus);
      if(kam.weich > 0 && kam.art !== "fahrer_fest"){
        const k = Math.min(1, (dt || 0.016) * 3.2);
        kam.pos.lerp(kam.sollPos, k); kam.ziel.lerp(kam.sollZiel, k);
        kam.weich -= (dt || 0.016) * 1.4;
        if(kam.weich <= 0){ kam.pos.copy(kam.sollPos); kam.ziel.copy(kam.sollZiel); }
      } else { kam.pos.copy(kam.sollPos); kam.ziel.copy(kam.sollZiel); }
      kamera.position.copy(kam.pos); kamera.up.set(kam.art === "oben" ? 1 : 0, kam.art === "oben" ? 0 : 1, 0);
      const koU = welt.kameraOpt || {};
      if(kam.art === "oben" && koU.fest && koU.obenFest) kamera.up.set(Math.cos(koU.fest.blick), 0, Math.sin(koU.fest.blick));
      kamera.lookAt(kam.ziel); kamera.updateProjectionMatrix();
      // In der Fahrersicht das eigene Dachschild/Kopf nicht vor die Linse holen
      if(fokus.bau.kopf) fokus.bau.kopf.visible = kam.art !== "fahrer";
      const L = fokus.bau.lichter;
      [L.glanzFront, L.glanzBlinkL, L.glanzBlinkR].forEach(function(a){ a.forEach(function(sp){ sp.visible = kam.art !== "fahrer"; }); });
      // Sonne und Schattenbereich wandern mit
      const fp = fokus.stand, vor = kam.art === "oben" ? 22 : 25, ko = welt.kameraOpt || {};
      let cx = fp.x + Math.cos(-fp.h) * vor, cz = fp.z;
      if(ko.fest && (kam.art === "uebersicht" || (kam.art === "oben" && ko.obenFest))){ cx = ko.fest.x; cz = ko.fest.z; }
      else if(ko.stadt){ cx = fp.x + Math.cos(-fp.h) * 12; cz = fp.z + Math.sin(-fp.h) * 12; }
      const sr = welt.sonnenRichtung || new THREE.Vector3(0.3, 0.8, -0.4);
      const tx = Math.round(cx / 1.2) * 1.2, tz = Math.round(cz / 1.2) * 1.2;
      sonne.target.position.set(tx, 0, tz);
      sonne.position.set(tx + sr.x * 300, sr.y * 300, tz + sr.z * 300);
      // Scheinwerfer der Fahrschule
      const g = fokus.bau.gruppe;
      [1, -1].forEach(function(s, i){
        const q = new THREE.Vector3(fokus.bau.laenge / 2, 0.75, 0.55 * s).applyMatrix4(g.matrixWorld);
        const z = new THREE.Vector3(fokus.bau.laenge / 2 + 30, 0, 1.2 * s).applyMatrix4(g.matrixWorld);
        spots[i].position.copy(q); spots[i].target.position.copy(z);
      });
    }
    himmel.position.copy(kamera.position); sterne.position.copy(kamera.position);
    renderer.render(szene, kamera);
  };

  // Punkt in Bildschirm-Koordinaten (fuer Beschriftungen ueber dem Bild)
  welt.aufsBild = function(x, y, z){
    const v = new THREE.Vector3(x, y, z).project(kamera);
    const el = renderer.domElement;
    return { x: (v.x + 1) / 2 * el.clientWidth, y: (1 - v.y) / 2 * el.clientHeight, sichtbar: v.z < 1 && v.z > -1 };
  };

  // Hilfsflaechen (halbtransparent auf der Fahrbahn): { id, farbe }
  const hilfen = {};
  welt.alleHilfenAus = function(){ Object.keys(hilfen).forEach(function(id){ hilfen[id].visible = false; }); };
  welt.hilfe = function(id, sichtbar, x0, x1, z0, z1, farbe, deckkraft){
    let m = hilfen[id];
    if(!m){
      m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.32, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -4 }));
      m.rotation.x = -Math.PI / 2; m.renderOrder = 2; szene.add(m); hilfen[id] = m;
    }
    m.visible = !!sichtbar;
    if(!sichtbar) return;
    m.position.set((x0 + x1) / 2, 0.03, (z0 + z1) / 2); m.scale.set(Math.max(0.01, x1 - x0), Math.max(0.01, z1 - z0), 1);
    m.material.color.set(farbe || "#2e9e5a"); m.material.opacity = deckkraft || 0.32;
  };

  welt.setzeTageszeit("tag");
  welt.setzeQualitaet(qualitaet.stufe);
  return welt;
}

// Bausteine fuer weitere Module (Stadt-Szenen)
export const bausteine = { leinwand: leinwand, textur: textur, rauschen: rauschen, asphaltTextur: asphaltTextur, grasTextur: grasTextur, schildTextur: schildTextur,
  schriftTextur: schriftTextur, kiste: kiste, viereck: viereck, verschmelzen: verschmelzen, rad: rad, insasse: insasse, baueBaeume: baueBaeume, baueWolken: baueWolken, glanzTextur: glanzTextur };
