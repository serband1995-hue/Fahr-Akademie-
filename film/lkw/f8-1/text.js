/* Film 8.1 „Lenk- und Ruhezeiten“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später, eigene Sitzung).
   Norm: VO (EG) Nr. 561/2006 Art. 4, 6, 7, 8 (Wortlaut Stand Konsolidierung 2020/21, gelesen 08.10.2026 über gesetze.legal, EUR-Lex war nicht erreichbar) und FPersV § 18 Abs. 1 Nr. 7 (gesetze-im-internet.de).
   ⚠ Vor Veröffentlichung gegen die aktuelle Fassung auf EUR-Lex prüfen (spätere Änderungen sind nicht gelesen).
   Die Prüfung der Beispiele (Tage, Wochen) macht kern/modell.js (pruefeTag, pruefeWochen, lenkdauerBei) mit Tests. */
window.FILM_TEXT = {
  film: "lkw-f8-1",
  poster: 20,
  de: {
    titel: "Lenk- und Ruhezeiten",
    ui_ueber: "Überblick: Lenk- und Ruhezeiten",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Die Frage", k1_titel: "Wie lange darf ein Fahrer fahren?", k1_sub: "Für Berufskraftfahrer gilt ein EU-Gesetz.",
    k1_p1: "Wer beruflich Lkw fährt, muss Pausen und Ruhezeiten einhalten.",
    k1_p2: "Der Fahrtenschreiber im Lkw zeichnet alles auf.",
    k1_p3: "Die Regeln stehen in der Verordnung (EG) Nr. 561/2006.",
    l_lenk: "Lenkzeit", l_pause: "Pause", l_ruhe: "Ruhezeit", l_arbeit: "Andere Arbeit",

    k2_kicker: "Am Tag", k2_titel: "Die Lenkzeit", k2_sub: "Lenkzeit ist die Zeit, in der du fährst.",
    k2_p1: "Die tägliche Lenkzeit darf 9 Stunden nicht überschreiten.",
    k2_p2: "Zweimal in der Woche darf sie auf höchstens 10 Stunden verlängert werden.",
    k2_p3: "Tägliche Lenkzeit: alles Fahren zwischen zwei täglichen Ruhezeiten.",
    k2_p4: "Andere Arbeit zählt nicht zur Lenkzeit.",
    l_tag9: "Ein Tag mit 9 Stunden", l_tag10: "Ein Tag mit 10 Stunden",

    k3_kicker: "Pause", k3_titel: "Nach viereinhalb Stunden", k3_sub: "Die Lenkdauer zählt seit der letzten anrechenbaren Pause.",
    k3_p1: "Lenkdauer ist die Fahrzeit zwischen zwei Pausen.",
    k3_p2: "Nach 4,5 Stunden Lenkdauer musst du mindestens 45 Minuten Pause machen.",
    k3_p3: "Du darfst die Pause teilen: erst mindestens 15 Minuten, danach mindestens 30 Minuten.",
    k3_p4: "Erst 30 und dann 15 Minuten zählt nicht.",
    l_ok: "Erlaubt", l_nicht: "Nicht erlaubt", l_p45: "45 Minuten", l_p1530: "15 + 30 Minuten", l_p3015: "30 + 15 Minuten", l_dauer: "Lenkdauer seit der Pause",

    k4_kicker: "Ruhe", k4_titel: "Die tägliche Ruhezeit", k4_sub: "Nach der Arbeit kommt die Erholung.",
    k4_p1: "Innerhalb von 24 Stunden brauchst du eine neue tägliche Ruhezeit.",
    k4_p2: "Regelmäßig sind das mindestens 11 Stunden.",
    k4_p3: "Du darfst sie teilen: erst mindestens 3, danach mindestens 9 Stunden.",
    k4_p4: "Reduziert sind es mindestens 9, aber weniger als 11 Stunden.",
    k4_p5: "Reduzieren darfst du höchstens dreimal zwischen zwei Wochenruhezeiten.",
    l_reg: "Regelmäßig", l_red: "Reduziert", l_kurz: "Zu kurz", l_fenster: "24 Stunden",

    k5_kicker: "In der Woche", k5_titel: "Die Woche", k5_sub: "Lenkstunden je Tag, zwei Wochen im Beispiel.",
    k5_p1: "Eine Woche geht von Montag 0 Uhr bis Sonntag 24 Uhr.",
    k5_p2: "In einer Woche darfst du höchstens 56 Stunden lenken.",
    k5_p3: "In zwei Wochen zusammen höchstens 90 Stunden.",
    k5_p4: "Im Beispiel hat Woche 1 genau 56 Stunden. Woche 2 darf also nur noch 34 haben.",
    k5_p5: "Die regelmäßige Wochenruhe dauert mindestens 45 Stunden. Du darfst sie nicht im Fahrzeug verbringen.",
    k5_p6: "Eine verkürzte Wochenruhe von mindestens 24 Stunden musst du später ausgleichen.",
    l_w1: "Woche 1", l_w2: "Woche 2", l_h: "h", l_wruhe: "Wochenruhe: mindestens 45 h",
    l_mo: "Mo", l_di: "Di", l_mi: "Mi", l_do: "Do", l_fr: "Fr", l_sa: "Sa", l_so: "So",

    k6_kicker: "Fahrschule und Beruf", k6_titel: "Und in der Fahrschule?", k6_sub: "Ein Unterschied, den du kennen solltest.",
    k6_p1: "Im Fahrschul-Lkw, der nicht gewerblich fährt, gelten Lenk- und Ruhezeiten nicht.",
    k6_p2: "Im Beruf danach gelten sie.",
    l_schule: "Fahrschul-Lkw", l_beruf: "Beruf",

    k7_kicker: "Merke", k7_titel: "Zum Mitnehmen",
    k7_merk: "9 Stunden Lenkzeit, nach 4,5 Stunden 45 Minuten Pause, danach 11 Stunden Ruhe. Pro Woche höchstens 56 Stunden."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 28, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.5 }, { k: "k1_p2", t: 11.0 }, { k: "k1_p3", t: 17.5, ref: "VO (EG) Nr. 561/2006" }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 50, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 4.0, ref: "Art. 6 Abs. 1" }, { k: "k2_p2", t: 12.5, ref: "Art. 6 Abs. 1" }, { k: "k2_p3", t: 23.5, ref: "Art. 4 Buchst. k" }, { k: "k2_p4", t: 33.0, ref: "Art. 4 Buchst. e", stil: "gold" }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 58, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 4.0, ref: "Art. 4 Buchst. q" }, { k: "k3_p2", t: 11.0, ref: "Art. 7" }, { k: "k3_p3", t: 21.5, ref: "Art. 7" }, { k: "k3_p4", t: 33.0, stil: "gold" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 62, sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 4.0, ref: "Art. 8 Abs. 2" }, { k: "k4_p2", t: 12.0, ref: "Art. 4 Buchst. g" }, { k: "k4_p3", t: 18.0, ref: "Art. 4 Buchst. g" }, { k: "k4_p4", t: 28.0, ref: "Art. 4 Buchst. g" }, { k: "k4_p5", t: 38.0, ref: "Art. 8 Abs. 4" }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 78, sub: { k: "k5_sub", t: 0.6 },
      punkte: [{ k: "k5_p1", t: 4.0, ref: "Art. 4 Buchst. i" }, { k: "k5_p2", t: 12.0, ref: "Art. 6 Abs. 2" }, { k: "k5_p3", t: 20.0, ref: "Art. 6 Abs. 3" }, { k: "k5_p4", t: 28.0 }, { k: "k5_p5", t: 41.0, ref: "Art. 4 Buchst. h, Art. 8 Abs. 8" }, { k: "k5_p6", t: 57.0, ref: "Art. 8 Abs. 6 und 6b" }] },
    { id: "k6", titel: "k6_titel", kicker: "k6_kicker", dauer: 30, sub: { k: "k6_sub", t: 0.6 },
      punkte: [{ k: "k6_p1", t: 4.0, ref: "§ 18 Abs. 1 Nr. 7 FPersV" }, { k: "k6_p2", t: 16.0, stil: "gold" }] },
    { id: "k7", titel: "k7_titel", kicker: "k7_kicker", dauer: 20, merk: { k: "k7_merk", t: 1.2 } }
  ]
};
