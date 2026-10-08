// Prüft das Rechenmodell gegen Handrechnung und Gesetz. Aufruf: node --test film/lkw/test/
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const M = createRequire(import.meta.url)("../kern/modell.js");
const { FAHRZEUGE: FZ } = M;
const nah = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ""} erwartet ${b}, war ${a} (Toleranz ${tol})`);

// Kreisfahrt: Vorderachse auf Radius RF, nach einer Runde sind alle Radien stationär
function kreis(fz, RF) {
  const b = M.bahn([{ gerade: 30 }, { bogen: RF, winkel: 4 * Math.PI, rechts: true }]);
  const sim = M.simuliere(fz, b, -5, 30 + RF * 4 * Math.PI, 0.02);
  const z = sim.zustaende[sim.zustaende.length - 1], C = { x: 30, y: RF };
  const d = (p) => Math.hypot(p.x - C.x, p.y - C.y);
  return { sim, z, C, rF: d(z.F), rA: d(z.A), rK: z.K && d(z.K), rT: z.T && d(z.T) };
}

test("Radien stimmen mit der Handrechnung überein (Solo, Lastzug, Sattelzug)", () => {
  for (const id of ["solo", "lastzug", "sattelzug"]) {
    const fz = FZ[id], RF = 11.15, soll = M.radien(fz, RF), k = kreis(fz, RF);
    nah(k.rF, RF, 1e-3, id + " Vorderachse"); nah(k.rA, soll.A, 0.03, id + " Hinterachse");
    if (fz.anh) { nah(k.rK, soll.K, 0.03, id + " Kupplungspunkt"); nah(k.rT, soll.T, 0.03, id + " Anhängerachse"); }
  }
});

test("Starre Strecken bleiben starr (Radstand, Kupplung, Deichsel/Zapfenabstand)", () => {
  for (const id of ["solo", "lastzug", "sattelzug"]) {
    const fz = FZ[id], b = M.bahn([{ gerade: 25 }, { bogen: 11.15, winkel: Math.PI / 2, rechts: true }, { gerade: 40 }]);
    const sim = M.simuliere(fz, b, -8, 25 + 17.5 + 40, 0.02);
    sim.zustaende.forEach((z) => {
      nah(Math.hypot(z.F.x - z.A.x, z.F.y - z.A.y), fz.L, 1e-9, "Radstand");
      if (fz.anh) nah(Math.hypot(z.K.x - z.T.x, z.K.y - z.T.y), fz.D, 1e-9, "Abstand Kupplung-Anhängerachse");
    });
  }
});

test("Rechtskurve: Hinterachsen liegen INNEN (näher am Mittelpunkt, also rechts/Süden) und enger als die Vorderachse", () => {
  const b = M.bahn([{ gerade: 20 }, { bogen: 11.15, winkel: Math.PI / 2, rechts: true }]);
  const C = { x: 20, y: 11.15 };
  for (const id of ["solo", "lastzug", "sattelzug"]) {
    const fz = FZ[id], sim = M.simuliere(fz, b, -5, 20 + 17.5, 0.02), z = sim.bei(20 + 17.5 * 0.5);
    const d = (p) => Math.hypot(p.x - C.x, p.y - C.y);
    assert.ok(d(z.A) < d(z.F), id + ": Hinterachse enger als Vorderachse");
    assert.ok(z.F.h > 0 && z.F.h < Math.PI / 2, "Richtung dreht im Uhrzeigersinn (Rechtskurve)");
  }
  // Reihenfolge der Spuren (gleiche Vorderachsbahn): kleinster Abstand der letzten Achse zum Kurvenmittelpunkt über die ganze Kurve
  const minR = (id) => { const fz = FZ[id], sim = M.simuliere(fz, M.bahn([{ gerade: 20 }, { bogen: 10.75, winkel: Math.PI / 2, rechts: true }, { gerade: 30 }]), -6, 20 + 16.9 + 30, 0.02); const C = { x: 20, y: 10.75 }; let m = 1e9; sim.zustaende.forEach((z) => { if (z.F.x > 19.9 && z.F.y < 10.75 + 1) { const p = fz.anh ? z.T : z.A; m = Math.min(m, Math.hypot(p.x - C.x, p.y - C.y)); } }); return m; };
  assert.ok(minR("sattelzug") < minR("lastzug") && minR("lastzug") < minR("solo"), "Spur wird von Lkw über Lastzug zum Sattelzug enger: " + ["solo", "lastzug", "sattelzug"].map(minR).map((v) => v.toFixed(2)).join(" / "));
});

test("Gegenprobe mit absichtlich falscher Eingabe: größerer Radstand muss enger laufen, Linkskurve spiegelt", () => {
  const lang = { ...FZ.solo, L: 6.5 }, kurz = FZ.solo;
  assert.ok(kreis(lang, 11.15).rA < kreis(kurz, 11.15).rA - 0.5, "längerer Radstand -> kleinere Hinterachs-Radien");
  const links = M.bahn([{ gerade: 20 }, { bogen: 11.15, winkel: Math.PI / 2, rechts: false }]);
  const z = M.simuliere(FZ.solo, links, -5, 37.5, 0.02).bei(37.5);
  assert.ok(z.F.h < 0 && z.F.y < 0, "Linkskurve dreht gegen den Uhrzeigersinn und geht nach Norden");
  // eine absichtlich zu kurze Kette würde die Prüfung der Radien verfehlen: Soll-Radius mit L=4,8 passt NICHT zum Fahrzeug mit L=6,5
  nah(kreis(lang, 11.15).rA, M.radien(lang, 11.15).A, 0.01, "falsches Soll wäre aufgefallen");
  assert.ok(Math.abs(kreis(lang, 11.15).rA - M.radien(kurz, 11.15).A) > 0.5, "falsche Eingabe wird erkannt");
});

test("Beispiel-Fahrzeuge halten die Längengrenzen ein (§ 32 Abs. 3, 4 StVZO) und die Breite (§ 32 Abs. 1)", () => {
  assert.ok(M.gesamtLaenge(FZ.sattelzug) <= 15.5, "Sattelzug ≤ 15,50 m: " + M.gesamtLaenge(FZ.sattelzug));
  assert.ok(M.gesamtLaenge(FZ.lastzug) <= 18.0, "Lastzug ≤ 18,00 m (einfache Grenze, § 32 Abs. 4 Nr. 3a): " + M.gesamtLaenge(FZ.lastzug));
  assert.ok(M.gesamtLaenge(FZ.solo) <= 12.0 && M.gesamtLaenge(FZ.solo) >= 8.0, "Lkw 8 bis 12 m");
  assert.ok(FZ.lastzug.anh.vorn + FZ.lastzug.anh.hinten >= 7.5 - 1.6, "Anhänger-Aufbau lang genug");
  Object.values(FZ).forEach((f) => assert.ok(f.breite <= 2.55, "Breite ≤ 2,55 m"));
  // vorderer Überhangradius des Aufliegers um den Zapfen: ≤ 2,04 m (§ 32 Abs. 4 Nr. 2)
  const vorn = FZ.sattelzug.anh.vorn - FZ.sattelzug.D, r = Math.hypot(vorn, FZ.sattelzug.breite / 2);
  assert.ok(r <= 2.04, "vorderer Überhangradius Auflieger " + r.toFixed(3));
});

// Kreisfahrt mit geführter Ecke (so verlangt es § 32d Abs. 1 Satz 2): Bahn der äußersten vorderen Ecke = Gerade, dann Kreis 12,50 m
function ring(fz) {
  const b = M.bahn([{ gerade: 40 }, { bogen: 12.5, winkel: 4 * Math.PI, rechts: true }]);
  const sim = M.simuliere(fz, b, -25, 40 + 12.5 * 4 * Math.PI, 0.02, "ecke"), C = { x: 40, y: 12.5 };
  return { sim, C, z: sim.zustaende[sim.zustaende.length - 1] };
}
function radienKoerper(fz, z, C) {
  let mn = 1e9, mx = 0;
  M.koerper(fz, z).forEach((t) => { for (let i = 0; i < 4; i++) { const a = t.poly[i], b = t.poly[(i + 1) % 4]; for (let u = 0; u <= 1; u += 0.005) { const p = { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }, d = Math.hypot(p.x - C.x, p.y - C.y); mn = Math.min(mn, d); mx = Math.max(mx, d); } } });
  return { mn, mx };
}

test("§ 32d Abs. 1: Ringfläche bei Kreisfahrt (Ecke auf 12,50 m) höchstens 7,20 m breit, alle drei Beispiele", () => {
  for (const id of ["solo", "lastzug", "sattelzug"]) {
    const fz = FZ[id], r = ring(fz), m = radienKoerper(fz, r.z, r.C), breite = m.mx - m.mn;
    nah(m.mx, 12.5, 0.02, id + " Außenradius gemessen");
    assert.ok(breite <= 7.2, `${id}: Ringbreite ${breite.toFixed(2)} m ≤ 7,20 m`);
    assert.ok(m.mn >= 5.3, `${id}: Innenkreis ${m.mn.toFixed(2)} m ≥ 5,30 m`);
    // Formel und Simulation stimmen überein
    nah(m.mn, M.innenRadius(fz, M.vorderachsRadius(fz, 12.5)), 0.02, id + " Innenradius gegen Formel");
  }
  // Gegenprobe: ein viel zu langer Radstand würde die 7,20 m reißen
  const zuLang = { ...FZ.solo, L: 9.0 }, r = ring(zuLang), m = radienKoerper(zuLang, r.z, r.C);
  assert.ok(m.mx - m.mn > 7.2, "Prüfung schlägt bei zu langem Fahrzeug an: " + (m.mx - m.mn).toFixed(2));
});

test("§ 32d Abs. 2: Einfahren aus der tangierenden Geraden, höchstens 0,8 m über die Gerade nach außen", () => {
  for (const id of ["solo", "lastzug", "sattelzug"]) {
    const fz = FZ[id], r = ring(fz), ueber = M.maxUeberschnitt(r.sim, { x: 0, y: 0 }, 0, 40 + 12.5 * 2 * Math.PI);
    assert.ok(ueber <= 0.8, `${id}: Überschnitt ${ueber.toFixed(3)} m ≤ 0,80 m`);
    const m = radienKoerper(fz, r.z, r.C);
    console.log(`  ${id}: Überschnitt ${Math.max(0, ueber).toFixed(2)} m · Ringbreite ${(m.mx - m.mn).toFixed(2)} m · Innenradius ${m.mn.toFixed(2)} m · Länge ${M.gesamtLaenge(fz).toFixed(2)} m · Vorderachse R ${M.vorderachsRadius(fz, 12.5).toFixed(2)} m`);
  }
  // Gegenprobe: Heck mit riesigem Überhang schwenkt weiter aus als erlaubt
  const lang = { ...FZ.solo, hinten: 7.0 }, r = ring(lang);
  assert.ok(M.maxUeberschnitt(r.sim, { x: 0, y: 0 }, 0, 40 + 12.5 * 2 * Math.PI) > 0.8, "Prüfung schlägt bei riesigem Heck an");
});

test("Heck schwenkt beim Einlenken nach außen aus (Solo): messbar, aber klein (unter 0,8 m)", () => {
  const fz = FZ.solo, b = M.bahn([{ gerade: 30 }, { bogen: 10.75, winkel: Math.PI / 2, rechts: true }, { gerade: 20 }]);
  const sim = M.simuliere(fz, b, -10, 30 + 16.9 + 20, 0.02);
  const u = M.maxUeberschnitt(sim, { x: 0, y: -fz.breite / 2 }, 0, 1e9);
  assert.ok(u > 0.02 && u < 0.8, "Ausschwenken " + u.toFixed(3) + " m");
  console.log("  Solo: Heck schwenkt " + u.toFixed(2) + " m nach außen");
});

test("Folgefahrt (Film 5.4): mit 50 m Lücke kommt der Lkw hinter dem Pkw zum Stehen, mit 20 m nicht; Gegenprobe ohne Reaktionszeit", () => {
  const basis = { v0: 80 / 3.6, aVorn: 8, aHinten: 5, reaktion: 1.0, dauer: 14 };
  const gut = M.folgefahrt({ ...basis, luecke: 50 }), knapp = M.folgefahrt({ ...basis, luecke: 20 });
  assert.equal(gut.kollision, null, "50 m: keine Berührung");
  assert.ok(gut.minAbstand > 5, "50 m: Rest-Abstand " + gut.minAbstand.toFixed(1));
  assert.ok(gut.bei(14).vH === 0 && gut.bei(14).vV === 0, "beide stehen");
  assert.ok(knapp.kollision != null, "20 m: der Lkw erreicht den Pkw");
  // Gegenprobe: ohne Reaktionszeit und mit gleicher Verzögerung wird der Rest-Abstand nie kleiner als die Lücke
  const ideal = M.folgefahrt({ ...basis, luecke: 20, reaktion: 0, aHinten: 8 });
  assert.ok(ideal.minAbstand >= 19.99, "gleiche Verzögerung ohne Reaktionszeit: Abstand bleibt " + ideal.minAbstand.toFixed(2));
  console.log("  Folgefahrt 50 m: Rest-Abstand " + gut.minAbstand.toFixed(1) + " m; 20 m: Berührung nach " + knapp.kollision.toFixed(2) + " s");
});

test("Sozialvorschriften (Film 8.1): gültige Tage bestehen, Gegenproben mit absichtlich falscher Eingabe schlagen an", () => {
  const h = (x) => x * 60;
  const gut = [{ art: "fahren", min: h(4.5) }, { art: "pause", min: 45 }, { art: "fahren", min: h(4.5) }, { art: "arbeit", min: h(1) }, { art: "ruhe", min: h(11) }];
  const r = M.pruefeTag(gut); assert.ok(r.ok && r.lenkMin === 540 && r.ruhe === "regelmaessig", JSON.stringify(r));
  // geteilte Pause 15 + 30 (richtige Reihenfolge) zählt, 30 + 15 nicht
  const geteilt = (a, b) => [{ art: "fahren", min: h(2) }, { art: "pause", min: a }, { art: "fahren", min: h(2.5) }, { art: "pause", min: b }, { art: "fahren", min: h(2) }, { art: "ruhe", min: h(11) }];
  assert.ok(M.pruefeTag(geteilt(15, 30)).ok, "15 + 30 ist erlaubt");
  assert.ok(!M.pruefeTag(geteilt(30, 15)).ok, "30 + 15 reicht nicht");
  assert.ok(!M.pruefeTag([{ art: "fahren", min: h(4.6) }, { art: "pause", min: 45 }, { art: "ruhe", min: h(11) }]).ok, "4,6 h ohne Pause");
  assert.ok(!M.pruefeTag([{ art: "fahren", min: h(4.5) }, { art: "pause", min: 40 }, { art: "fahren", min: h(1) }, { art: "ruhe", min: h(11) }]).ok, "40 min Pause reicht nicht");
  // Tageslenkzeit 9 h, 10 h nur mit Verlängerung
  const zehn = [{ art: "fahren", min: h(4.5) }, { art: "pause", min: 45 }, { art: "fahren", min: h(4.5) }, { art: "pause", min: 45 }, { art: "fahren", min: h(1) }, { art: "ruhe", min: h(11) }];
  assert.ok(!M.pruefeTag(zehn).ok && M.pruefeTag(zehn, { verlaengert: true }).ok, "10 h nur zweimal pro Woche erlaubt");
  // Tagesruhe im 24-h-Fenster: 13 h Schicht + 11 h Ruhe regelmäßig, 15 h + 9 h reduziert, 16 h + 8 h Verstoß
  const tag = (arbeit, ruhe) => [{ art: "arbeit", min: h(arbeit) }, { art: "ruhe", min: h(ruhe) }];
  assert.equal(M.pruefeTag(tag(13, 11)).ruhe, "regelmaessig"); assert.equal(M.pruefeTag(tag(15, 9)).ruhe, "reduziert"); assert.equal(M.pruefeTag(tag(16, 9)).ruhe, "zuKurz");
  assert.equal(M.pruefeTag(tag(13, 12)).ruhe, "regelmaessig");
  // Woche: 56 h und 90 h über zwei Wochen
  assert.ok(M.pruefeWochen([[9, 9, 10, 10, 9, 9, 0], [9, 9, 8, 8, 0, 0, 0]]).ok, "56 + 34 = 90 ist erlaubt");
  assert.ok(!M.pruefeWochen([[9, 9, 10, 10, 9, 9, 0], [9, 9, 8, 8, 1, 0, 0]]).ok, "56 + 35 = 91 ist zu viel");
  assert.ok(!M.pruefeWochen([[10, 10, 10, 9, 9, 0, 0]]).ok, "dreimal 10 h in einer Woche");
  assert.ok(!M.pruefeWochen([[9, 9, 9, 9, 9, 9, 3]]).ok, "57 h in einer Woche");
});

test("Lenkdauer-Messer (Film 8.1) folgt der Prüfung: nach 45 min und nach 15 + 30 min zurück auf 0, nach 30 + 15 min nicht", () => {
  const h = (x) => x * 60, ev = (a, b) => [{ art: "fahren", min: h(2) }, { art: "pause", min: a }, { art: "fahren", min: h(2.5) }, { art: "pause", min: b }, { art: "fahren", min: 30 }];
  assert.equal(M.lenkdauerBei(ev(15, 30), h(2) + 15 + h(2.5) + 30).seit, 0, "15 + 30 setzt zurück");
  assert.equal(M.lenkdauerBei(ev(30, 15), h(2) + 30 + h(2.5) + 15).seit, h(4.5), "30 + 15 setzt nicht zurück");
  assert.equal(M.lenkdauerBei([{ art: "fahren", min: h(4.5) }, { art: "pause", min: 45 }], h(4.5) + 45).seit, 0);
  assert.ok(M.lenkdauerBei(ev(30, 15), h(2) + 30 + h(2.5) + 15 + 30).seit > h(4.5), "weiterfahren über 4:30");
});

test("Tagesruhe geteilt: erst mind. 3 h, dann mind. 9 h = regelmäßig (Gegenproben: 3+8, 2+9, falsche Reihenfolge)", () => {
  const tag = (a, b) => [{ art: "arbeit", min: 480 }, { art: "ruhe", min: a * 60 }, { art: "arbeit", min: 24 * 60 - 480 - a * 60 - b * 60 }, { art: "ruhe", min: b * 60 }];
  assert.equal(M.pruefeTag(tag(3, 9)).ruhe, "regelmaessigGeteilt");
  assert.equal(M.pruefeTag(tag(3, 9)).ok, true);
  assert.equal(M.pruefeTag(tag(3, 8)).ok, false);
  assert.equal(M.pruefeTag(tag(2, 9)).ok, false);
  assert.equal(M.pruefeTag(tag(9, 3)).ok, false);
});
