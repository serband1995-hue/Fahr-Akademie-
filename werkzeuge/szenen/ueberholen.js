/* =====================================================================
   Szene "Überholen auf der Landstraße" (Musterszene, W2)
   Zwei Fassungen derselben Situation:
     richtig – mit Abstand, Gegenverkehr abwarten, Anlauf, zügig vorbei,
               mit Abstand einscheren
     falsch  – der typische Fehler: zu dicht, ohne Sicht raus, Gegenverkehr
               muss bremsen, zu knapp vor dem Lkw eingeschert
   Texte stehen je Sprache in TEXTE; fehlt eine Sprache, gilt Deutsch.
   ===================================================================== */
import { tempoProfil, spurVerlauf, fahrt, fenster, KMH } from "../../verkehr/motor.js";

const SP = 3.5, ZR = SP / 2, ZL = -SP / 2;       // Spurmitten: rechts +, links −
const L_FS = 4.25, L_LKW = 16.5;                 // Fahrschule (Kompaktwagen), Sattelzug

// Straße: 2,4 km gerade Landstraße, Überholverbot mit Warnlinie davor,
// dazu eine Einmündung von rechts (Feldweg zum Hof) mitten im Verbotsbereich.
function strasse(xV0, xV1){
  const xE = xV0 + 170;
  return {
    von: -500, bis: 2300, spur: SP, seed: 4,
    mitte: [
      { von: -500, bis: xV0 - 120, art: "leit" },
      { von: xV0 - 120, bis: xV0, art: "warn" },
      { von: xV0, bis: xV1, art: "voll" },
      { von: xV1, bis: 2300, art: "leit" }
    ],
    einmuendungen: [{ x: xE, breite: 5.5, seite: 1, laenge: 140 }],
    schilder: [
      // beidseitig aufgestellt, wie außerorts üblich
      { typ: "z276", x: xV0, seite: 1 }, { typ: "z276", x: xV0, seite: -1 },
      { typ: "z280", x: xV1, seite: 1 },
      // für den Gegenverkehr (wir sehen die grauen Rückseiten)
      { typ: "z276", x: xV1 + 10, seite: -1, blick: Math.PI / 2 }, { typ: "z280", x: xV0 - 10, seite: -1, blick: Math.PI / 2 },
      // Vorfahrt gewähren für den Feldweg: rechts am Feldweg, blickt dem Traktor entgegen
      { typ: "z205", x: xE + 4.4, seite: 1, zPos: 3.75 + 2.2, xPos: xE + 4.4, blick: 0 }
    ],
    alleen: [{ von: -480, bis: 120, abstand: 16 }, { von: xV1 + 60, bis: 2280, abstand: 18, seite: -1 }],
    waelder: [{ x0: 700, x1: 1500, z0: -420, z1: -80, anzahl: 520, nadel: 0.55 }],
    bauernhof: { x: xE + 40, z: 150, dreh: 0.08 },
    dorf: { x: 2500, z: -520 },
    windraeder: [{ x: 250, z: 720, tempo: 1.3 }, { x: 520, z: 900, tempo: 1.1 }, { x: 820, z: 760, tempo: 1.25 }]
  };
}

// Zeitpunkt suchen, ab dem eine Bedingung gilt
function ab(t0, bed, t1){ let t = t0; while(t < (t1 || 90) && !bed(t)) t += 0.02; return t; }

function richtig(){
  const vL = 60 / KMH;
  const lkwX = function(t){ return 30 + vL * t; };
  // Fahrschule: 60 hinter dem Lkw mit gut 30 m Abstand (halber Tacho), nach dem ersten
  // Gegenverkehr Anlauf nehmen, dann ausscheren und zügig auf 100.
  const keys = [[0, 60], [4.7, 60], [6.0, 70], [10.4, 100], [80, 100]];
  const tp = tempoProfil(keys);
  const x0 = -10.5, fx = function(t){ return x0 + tp.s(t); };
  const tA = 5.9, xA = fx(tA);                                           // Beginn Ausscheren
  // Einscheren, wenn der Lkw weit genug zurückliegt (im Innenspiegel ganz zu sehen)
  const tB = ab(tA, function(t){ return fx(t) - L_FS / 2 - (lkwX(t) + L_LKW / 2) > 22; });
  const xB = fx(tB), tE = tB + 1.9;
  const xV0 = Math.round(fx(tE + 3) + 160), xV1 = xV0 + 380;
  const tV = ab(tE, function(t){ return fx(t) > xV0 - 20; });
  const lage = spurVerlauf(ZR, [{ x: xA, laenge: 40, z: ZL }, { x: xB, laenge: 46, z: ZR }]);
  const fs = { id: "fs", bau: "pkw", art: "kompakt", farbe: "#f4f4f1", fahrschule: true, kennzeichen: "FA · FS 26",
    pose: fahrt({ x0: x0, tempo: tp, lage: lage, radstand: 2.62 }),
    sig: function(t){
      return {
        blinker: (t >= tA - 1.8 && t < tA + 1.9) ? "links" : (t >= tB - 1.0 && t < tE) ? "rechts" : null,
        schulter: fenster([{ von: tA - 1.1, bis: tA - 0.35, seite: "links" }, { von: tB - 0.9, bis: tB - 0.3, seite: "rechts" }], t) ? (t < tA ? "links" : "rechts") : null,
        spiegel: (t >= tA - 2.4 && t < tA - 1.1) ? "innen" : (t >= tB - 1.8 && t < tB - 0.9) ? "innen" : null
      };
    } };
  const lkw = { id: "lkw", bau: "lkw", farbe: "#28496f", aufbau: "#e2e4e6", pose: fahrt({ x0: 30, tempo: tempoProfil([[0, 60]]), z: ZR, radstand: 3.7 }), sig: function(){ return {}; } };
  // Gegenverkehr: g1 kommt früh (deshalb warten), g2 erst, wenn die Fahrschule längst zurück ist
  const vG1 = 100, vG2 = 95;
  const meet = function(tMeet, v){ return fx(tMeet) + v / KMH * tMeet; };
  const g1 = { id: "g1", bau: "pkw", art: "kombi", farbe: "#2c5aa0", kennzeichen: "OF · GV 100", pose: fahrt({ x0: meet(3.6, vG1), richtung: -1, tempo: tempoProfil([[0, vG1]]), z: ZL, radstand: 2.8 }), sig: function(){ return {}; } };
  const g2 = { id: "g2", bau: "pkw", art: "transporter", farbe: "#e6e2d6", kennzeichen: "OF · TR 95", pose: fahrt({ x0: meet(tE + 4.2, vG2), richtung: -1, tempo: tempoProfil([[0, vG2]]), z: ZL, radstand: 3.4 }), sig: function(){ return {}; } };
  const g3 = { id: "g3", bau: "pkw", art: "suv", farbe: "#3a3f45", kennzeichen: "DA · SU 12", pose: fahrt({ x0: meet(tV + 3, 100), richtung: -1, tempo: tempoProfil([[0, 100]]), z: ZL, radstand: 2.74 }), sig: function(){ return {}; } };
  const xE = xV0 + 170;
  const traktor = { id: "tr", bau: "traktor", farbe: "#3f7d2e", pose: function(){ return { x: xE, z: 3.75 + 2.35, h: Math.PI / 2, v: 0, s: 0, lenk: 0 }; }, sig: function(){ return { rundum: true, blinker: "links" }; } };
  return {
    dauer: Math.ceil(tV + 6), fokus: "fs", strasse: strasse(xV0, xV1),
    fahrzeuge: [fs, lkw, g1, g2, g3, traktor],
    marken: { tA: tA, tB: tB, tE: tE, tV: tV, xV0: xV0 },
    kapitel: [
      { t: 0.2, id: "lkw", kamera: "schraeg", hilfe: "abstand" },
      { t: 2.0, id: "gegen", kamera: "schraeg", hilfe: "sicht" },
      { t: tA - 2.4, id: "sichern", kamera: "oben", hilfe: "sicht" },
      { t: tA, id: "vorbei", kamera: "schraeg" },
      { t: tB - 1.8, id: "einordnen", kamera: "oben", hilfe: "einscheren" },
      { t: tV - 4, id: "verbot", kamera: "schraeg" }
    ],
    // Hilfsflächen zum Verstehen: Abstand, nötige freie Sicht, Abstand beim Einscheren
    hilfen: function(t, stand){ return hilfenFuer(t, stand, this); }
  };
}

function falsch(xV0){
  // Zu dicht (12 m), raus direkt nach dem ersten Gegenverkehr, ohne Anlauf,
  // der Transporter ist schon zu nah: er bremst und blendet auf, die Fahrschule
  // schert knapp vor dem Lkw ein, der Lkw muss bremsen.
  const x0 = 30 - L_LKW / 2 - 12 - L_FS / 2;
  const keys = [[0, 60], [4.35, 60], [5.2, 64], [11.5, 100], [80, 100]];
  const tp = tempoProfil(keys), fx = function(t){ return x0 + tp.s(t); };
  const tA = 4.35, xA = fx(tA);
  // Lkw fährt zunächst 60, bremst, sobald die Fahrschule knapp vor ihm einschert
  let tC = 12, lkwTp = tempoProfil([[0, 60]]);
  for(let n = 0; n < 4; n++){
    const lx = function(t){ return 30 + lkwTp.s(t); };
    tC = ab(tA + 2, function(t){ return fx(t) - L_FS / 2 - (lx(t) + L_LKW / 2) > 3.5; });
    lkwTp = tempoProfil([[0, 60], [tC + 0.5, 60], [tC + 1.8, 46], [tC + 5, 50], [tC + 9, 60], [80, 60]]);
  }
  const xC = fx(tC), tCe = tC + 1.25;
  const tMeet = tCe + 0.9;                                  // Transporter ist 0,9 s nach dem Einscheren da
  const g2tp = tempoProfil([[0, 95], [tC - 2.4, 95], [tC - 0.6, 62], [tMeet + 2, 62], [tMeet + 6, 95], [80, 95]]);
  const lage = spurVerlauf(ZR, [{ x: xA, laenge: 30, z: ZL }, { x: xC, laenge: 24, z: ZR }]);
  const xV1 = xV0 + 380;   // gleiche Straße wie in der richtigen Fassung
  const fs = { id: "fs", bau: "pkw", art: "kompakt", farbe: "#f4f4f1", fahrschule: true, kennzeichen: "FA · FS 26",
    pose: fahrt({ x0: x0, tempo: tp, lage: lage, radstand: 2.62 }),
    // typischer Fehler: kein Schulterblick, Blinker erst beim Ausscheren
    sig: function(t){ return { blinker: (t >= tA - 0.3 && t < tA + 1.3) ? "links" : (t >= tC - 0.2 && t < tCe) ? "rechts" : null }; } };
  const lkw = { id: "lkw", bau: "lkw", farbe: "#28496f", aufbau: "#e2e4e6",
    pose: fahrt({ x0: 30, tempo: lkwTp, z: ZR, radstand: 3.7 }),
    sig: function(t){ return { bremse: t >= tC + 0.5 && t < tC + 3.2, lichthupe: t >= tC + 0.6 && t < tC + 1.4 }; } };
  const meet = function(tm, tpr){ return fx(tm) + tpr.s(tm); };
  const g1 = { id: "g1", bau: "pkw", art: "kombi", farbe: "#2c5aa0", kennzeichen: "OF · GV 100", pose: fahrt({ x0: meet(3.6, tempoProfil([[0, 100]])), richtung: -1, tempo: tempoProfil([[0, 100]]), z: ZL, radstand: 2.8 }), sig: function(){ return {}; } };
  const g2 = { id: "g2", bau: "pkw", art: "transporter", farbe: "#e6e2d6", kennzeichen: "OF · TR 95",
    pose: fahrt({ x0: meet(tMeet, g2tp), richtung: -1, tempo: g2tp, z: ZL, radstand: 3.4 }),
    sig: function(t){ return { bremse: t >= tC - 2.4 && t < tMeet + 2, lichthupe: t >= tC - 2.2 && t < tC - 0.8 }; } };
  const xE = xV0 + 170;
  const traktor = { id: "tr", bau: "traktor", farbe: "#3f7d2e", pose: function(){ return { x: xE, z: 3.75 + 2.35, h: Math.PI / 2, v: 0, s: 0, lenk: 0 }; }, sig: function(){ return { rundum: true, blinker: "links" }; } };
  return {
    dauer: Math.ceil(tMeet + 7), fokus: "fs", strasse: strasse(xV0, xV1),
    fahrzeuge: [fs, lkw, g1, g2, traktor],
    marken: { tA: tA, tC: tC },
    kapitel: [
      { t: 0.2, id: "f_dicht", kamera: "fahrer", hilfe: "abstand" },
      { t: tA - 0.4, id: "f_raus", kamera: "schraeg", hilfe: "sicht" },
      { t: tC - 2.4, id: "f_gegen", kamera: "schraeg", hilfe: "sicht" },
      { t: tC - 0.1, id: "f_knapp", kamera: "oben", hilfe: "einscheren" },
      { t: tMeet + 2.2, id: "f_besser", kamera: "schraeg" }
    ],
    hilfen: function(t, stand){ return hilfenFuer(t, stand, this); }
  };
}

// Welche Hilfsfläche im aktuellen Kapitel zu sehen ist.
//   abstand    – gelber Streifen Fahrschule → Lkw, Beschriftung mit Metern
//   sicht      – linke Spur ~500 m voraus: grün, wenn frei, rot, wenn Gegenverkehr drin ist
//   einscheren – Lücke vor dem Lkw beim Wiedereinordnen
function hilfenFuer(t, stand, v){
  const k = v.kapitel.filter(function(c){ return c.t <= t; }).pop();
  const art = k && k.hilfe;
  const fs = stand.fs, lkw = stand.lkw, out = [];
  if(!fs || !lkw) return out;
  if(art === "abstand" && fs.z > 0.5){
    const a = fs.x + L_FS / 2, b = lkw.x - L_LKW / 2, m = Math.max(0, b - a);
    out.push({ id: "abstand", x0: a, x1: b, z0: ZR - 1.0, z1: ZR + 1.0, farbe: m >= 28 ? "#e0a13a" : "#d2452e",
      text: { de: Math.round(m) + " m Abstand", tr: Math.round(m) + " m mesafe", en: Math.round(m) + " m gap", ar: Math.round(m) + " م مسافة" }, bei: [(a + b) / 2, 0.2, ZR + 2.6] });
  }
  if(art === "sicht"){
    const x0 = fs.x + L_FS / 2, x1 = x0 + 500;
    const belegt = Object.keys(stand).some(function(id){ const s = stand[id]; return s.z < 0 && id !== "fs" && s.x > x0 && s.x < x1 && id !== "tr"; });
    out.push({ id: "sicht", x0: x0, x1: x1, z0: ZL - 1.55, z1: ZL + 1.55, farbe: belegt ? "#d2452e" : "#2e9e5a",
      text: belegt ? { de: "Gegenverkehr – nicht frei", tr: "Karşı trafik – boş değil", en: "Oncoming traffic – not clear", ar: "سير معاكس – الطريق غير خالٍ" } : { de: "500 m frei", tr: "500 m boş", en: "500 m clear", ar: "500 م خالية" },
      bei: [x0 + 60, 0.2, ZL] });
  }
  // Beim Einordnen: grün ab 20 m, vorher gelb ("noch warten"); rot nur, wenn wirklich
  // zu knapp eingeschert wurde (Fahrschule schon zurück auf der rechten Spur).
  if(art === "einscheren" && fs.x > lkw.x){
    const a = lkw.x + L_LKW / 2, b = fs.x - L_FS / 2, m = Math.max(0, b - a), zurueck = fs.z > 0.6;
    const n = Math.round(m);
    const text = m >= 20 ? { de: n + " m: jetzt einordnen", tr: n + " m: şimdi şeride geç", en: n + " m: now move back", ar: n + " م: عُد الآن إلى المسار" }
      : zurueck ? { de: n + " m: viel zu knapp", tr: n + " m: çok yakın", en: n + " m: far too close", ar: n + " م: قريب جدًا" }
      : { de: n + " m: noch warten", tr: n + " m: biraz bekle", en: n + " m: wait a little", ar: n + " م: انتظر قليلًا" };
    if(b > a) out.push({ id: "einscheren", x0: a, x1: b, z0: ZR - 1.0, z1: ZR + 1.0, farbe: m >= 20 ? "#2e9e5a" : zurueck ? "#d2452e" : "#e0a13a",
      text: text, bei: [(a + b) / 2, 0.2, ZR + 2.6] });
  }
  return out;
}

export const TEXTE = {
  de: {
    titel: "Überholen auf der Landstraße",
    kurz: "Sicht prüfen, Gegenverkehr abwarten, zügig überholen, mit Abstand einscheren",
    worum: "Vor dir fährt ein Lkw mit 60 km/h, erlaubt sind 100. Überholen ist eines der gefährlichsten Manöver außerorts: Du fährst auf der Spur des Gegenverkehrs. Es geht nur, wenn die Strecke weit genug frei ist.",
    worumRegel: "§ 5 StVO",
    varianten: { richtig: "So ist es richtig", falsch: "Typischer Fehler" },
    rf: { richtig: "Du siehst gerade, wie es richtig geht. Dieselbe Situation gibt es auch mit dem Fehler, der in der Praxis am häufigsten passiert: zu dicht auffahren und ohne freie Sicht ausscheren.",
      falsch: "Du siehst gerade den typischen Fehler. Achte darauf, wo es kippt: der Abstand, die rote Fläche, die Lichthupe. Danach lohnt sich der direkte Vergleich mit der richtigen Fassung." },
    rfKnopf: { richtig: "Richtige Fassung ansehen", falsch: "Typischen Fehler ansehen" },
    kapitel: {
      lkw: { titel: "Langsamer Lkw vorne", text: "Außerorts, erlaubt sind 100 km/h, vorne fährt ein Lkw mit 60. Genug Abstand halten, mindestens halber Tacho in Metern. So siehst du an ihm vorbei und kannst Anlauf nehmen.", regel: "§ 4 Abs. 1 · § 5 Abs. 2 StVO",
        frage: { text: "Wann darf ich überholen?", optionen: ["Immer, wenn ich schneller bin", "Nur wenn klar ist, dass der Gegenverkehr während des ganzen Überholens nicht behindert wird, und ich wesentlich schneller bin", "Nur rechts"], richtig: 1, erklaerung: "§ 5 Abs. 2 StVO: Überholen nur, wenn eine Behinderung des Gegenverkehrs ausgeschlossen ist und mit wesentlich höherer Geschwindigkeit." } },
      gegen: { titel: "Gegenverkehr", text: "Ein Auto kommt entgegen. Jetzt nicht ausscheren, sondern abwarten. Die grüne oder rote Fläche zeigt, ob die nötigen rund 500 m frei sind.", regel: "§ 5 Abs. 2 StVO",
        frage: { text: "Wie viel freie Strecke brauche ich ungefähr, um einen Lkw mit 60 km/h bei 100 km/h zu überholen?", optionen: ["Etwa 100 m", "Etwa 250 m Überholweg, und der Gegenverkehr kommt in dieser Zeit noch einmal so weit entgegen: rund 500 m Sicht", "Etwa 50 m"], richtig: 1, erklaerung: "Überholweg ≈ (beide Fahrzeuglängen + Abstand davor und danach) × v₁ ÷ (v₁ − v₂) ≈ 100 m × 100 ÷ 40 ≈ 250 m. In derselben Zeit legt der Gegenverkehr noch einmal etwa so viel zurück." } },
      sichern: { titel: "Spiegel, Schulterblick, Blinker", text: "Die Strecke ist frei und übersichtlich, keine durchgezogene Linie. Innen- und Außenspiegel, Schulterblick links, dann links blinken. Schon jetzt etwas Anlauf nehmen.", regel: "§ 5 Abs. 4 · § 5 Abs. 4a StVO" },
      vorbei: { titel: "Zügig vorbei", text: "Ausscheren und zügig beschleunigen. Die Höchstgeschwindigkeit bleibt die Grenze. Ausreichend Seitenabstand zum Lkw halten.", regel: "§ 5 Abs. 2 · § 5 Abs. 4 · § 3 Abs. 3 StVO",
        frage: { text: "Der Lkw wird beim Überholen schneller. Darf er das?", optionen: ["Ja", "Nein, wer überholt wird, darf seine Geschwindigkeit nicht erhöhen"], richtig: 1, erklaerung: "§ 5 Abs. 6 StVO: Wer überholt wird, darf seine Geschwindigkeit nicht erhöhen." } },
      einordnen: { titel: "Blinker rechts, wieder einordnen", text: "Innenspiegel: Erst wenn der Lkw darin ganz zu sehen ist, rechts blinken und einordnen. Nicht knapp vor ihm einscheren.", regel: "§ 5 Abs. 4 · § 5 Abs. 4a StVO" },
      verbot: { titel: "Überholverbot voraus", text: "Erst kündigt die Warnlinie mit kurzen Lücken die durchgezogene Linie an, dann gilt Zeichen 276. Hier mündet rechts ein Feldweg ein, der Traktor dort will auf die Straße. Ein begonnenes Überholen muss vorher abgeschlossen sein.", regel: "Zeichen 276 · Zeichen 295",
        frage: { text: "Darf ich die durchgezogene Mittellinie zum Überholen überfahren?", optionen: ["Ja, kurz", "Nein", "Nur bei Traktoren"], richtig: 1, erklaerung: "Die Fahrstreifenbegrenzung (Zeichen 295) darf nicht überfahren werden." } },
      f_dicht: { titel: "Zu dicht aufgefahren", text: "Nur 12 m Abstand bei 60 km/h. Der Lkw verdeckt die Sicht nach vorne: Ob Gegenverkehr kommt, siehst du so nicht. Richtig wären mindestens 30 m.", regel: "§ 4 Abs. 1 StVO",
        frage: { text: "Wie viel Abstand ist bei 60 km/h richtig (Faustregel)?", optionen: ["6 m", "Halber Tacho: 30 m", "Eine Wagenlänge"], richtig: 1, erklaerung: "Faustregel außerorts: halber Tacho in Metern, also 30 m bei 60 km/h. Das sind etwa 2 Sekunden." } },
      f_raus: { titel: "Raus ohne freie Sicht", text: "Direkt nach dem ersten Gegenverkehr ausgeschert, ohne Schulterblick, ohne Anlauf und ohne zu wissen, was dahinter kommt. Die Fläche ist rot: Der Transporter ist schon zu nah.", regel: "§ 5 Abs. 2 · § 5 Abs. 3 Nr. 1 StVO",
        frage: { text: "Was hätte hier geholfen?", optionen: ["Schneller ausscheren", "Zurückfallen lassen, Abstand vergrößern und erst bei sicher freier Strecke überholen", "Hupen"], richtig: 1, erklaerung: "Bei unklarer Verkehrslage ist Überholen unzulässig (§ 5 Abs. 3 Nr. 1 StVO). Mit mehr Abstand siehst du, ob die Strecke frei ist." } },
      f_gegen: { titel: "Gegenverkehr muss bremsen", text: "Der Transporter bremst und gibt Lichthupe. Wer den Gegenverkehr behindert, hätte nicht überholen dürfen. Jetzt bleibt nur ein gefährliches Einscheren.", regel: "§ 5 Abs. 2 StVO" },
      f_knapp: { titel: "Zu knapp eingeschert", text: "Rein in die Lücke, nur wenige Meter vor dem Lkw. Der Lkw muss bremsen. Wer überholt, darf den Überholten beim Einordnen nicht behindern.", regel: "§ 5 Abs. 4 StVO" },
      f_besser: { titel: "So wäre es richtig gewesen", text: "Abstand halten, Gegenverkehr abwarten und erst bei sicher freier Strecke mit Anlauf überholen. Im Zweifel: nicht überholen. Tipp: Schau dir die Fassung „So ist es richtig“ an.", regel: "§ 5 Abs. 2 · § 5 Abs. 3 StVO" }
    },
    merken: [
      ["Überholen nur, wenn die Strecke übersichtlich ist und der Gegenverkehr während des ganzen Überholens nicht behindert wird, und nur mit wesentlich höherer Geschwindigkeit.", "§ 5 Abs. 2 StVO"],
      ["Bei unklarer Verkehrslage nicht überholen. Im Zweifel: dahinter bleiben.", "§ 5 Abs. 3 Nr. 1 StVO"],
      ["Vor dem Ausscheren: Spiegel, Schulterblick, Blinker. Beim Einordnen den Überholten nicht behindern.", "§ 5 Abs. 4 · Abs. 4a StVO"],
      ["Wer überholt wird, darf nicht schneller werden.", "§ 5 Abs. 6 StVO"],
      ["Faustformel: Bei 100 km/h an einem Lkw mit 60 km/h vorbei brauchst du rund 250 m Überholweg und rund 500 m freie Sicht.", "Faustformel"]
    ]
  }
};

export function szene(){
  const r = richtig();
  return { id: "ueberholen", texte: TEXTE, varianten: { richtig: r, falsch: falsch(r.marken.xV0) } };
}
