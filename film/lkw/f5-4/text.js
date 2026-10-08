/* Film 5.4 „Abstand: 50 Meter auf der Autobahn“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Norm: § 4 Abs. 1, 2, 3 StVO, Wortlaut geprüft am 08.10.2026 gegen gesetze-im-internet.de (stvo_2013 § 4).
   Die Fahrzeugbewegungen im Bild kommen aus dem Rechenmodell (kern/modell.js, folgefahrt); Beispielwerte, keine Zahlen im Film außer 50 m, 3,5 t, 50 km/h, 7 m.
   Aufbau und Regeln wie film/lkw/f5-1/text.js. */
window.FILM_TEXT = {
  film: "lkw-f5-4",
  poster: 40,
  de: {
    titel: "Abstand – wie viel braucht ein Lkw?",
    ui_ueber: "Überblick: Abstand für Lkw in 3 Minuten",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Die Frage", k1_titel: "Wie viel Abstand braucht ein Lkw?", k1_sub: "Ein Lkw folgt einem Auto.",
    k1_p1: "Vor dem Lkw fährt ein Auto.",
    k1_p2: "Wie groß muss der Abstand sein?",
    k1_p3: "Das Gesetz kennt eine Grundregel, eine feste Zahl und eine Regel für lange Züge.",

    k2_kicker: "Die Grundregel", k2_titel: "Anhalten können", k2_sub: "Das gilt für alle Fahrzeuge.",
    k2_p1: "Der Abstand muss in der Regel so groß sein, dass du hinter dem Vordermann halten kannst, wenn er plötzlich bremst.",
    k2_p2: "Hier reicht der Abstand: Der Lkw hält hinter dem Auto.",
    k2_p3: "Hier nicht: Der Lkw kommt nicht mehr rechtzeitig zum Stehen.",
    k2_p4: "Wer vorausfährt, darf nicht ohne zwingenden Grund stark bremsen.",
    l_genug: "Genug Abstand", l_zuwenig: "Zu wenig Abstand",

    k3_kicker: "Autobahn", k3_titel: "Mindestens 50 Meter", k3_sub: "Eine feste Zahl für schwere Lkw und Busse.",
    k3_p1: "Auf Autobahnen müssen Lkw mit mehr als 3,5 t zulässiger Gesamtmasse mindestens 50 m Abstand halten.",
    k3_p2: "Das gilt, wenn die Geschwindigkeit mehr als 50 km/h beträgt.",
    k3_p3: "Für Kraftomnibusse gilt das unabhängig vom Gewicht.",
    k3_p4: "Weniger als 50 m ist nicht erlaubt.",
    l_mindest: "Mindestens 50 m", l_zukurz: "Weniger als 50 m",

    k4_kicker: "Außerorts", k4_titel: "Die Sieben", k4_sub: "Ein Zug ist ein Lkw mit Anhänger. Die 7 sind Meter, keine Tonnen.",
    k4_p1: "Ein Zug, der länger als 7 m ist, muss außerorts so viel Abstand halten, dass ein überholendes Kraftfahrzeug einscheren kann.",
    k4_p2: "Das gilt nicht, wenn in deiner Richtung mehr als ein Fahrstreifen vorhanden ist.",
    k4_p3: "Es gilt auch nicht auf Strecken mit Überholverbot.",
    k4_p4: "Und nicht, wenn du selbst zum Überholen ausscherst und das angekündigt hast.",
    l_platz: "Platz zum Einscheren", l_zug: "Zug länger als 7 m",

    k5_kicker: "Merke", k5_titel: "Zum Mitnehmen",
    k5_merk: "Autobahn: mindestens 50 m für Lkw über 3,5 t und Busse. Außerorts mit langem Zug: Platz zum Einscheren."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 24, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.0 }, { k: "k1_p2", t: 8.5 }, { k: "k1_p3", t: 14.5 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 52, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5, ref: "§ 4 Abs. 1 StVO" }, { k: "k2_p2", t: 17.5 }, { k: "k2_p3", t: 26.8 }, { k: "k2_p4", t: 41.0, ref: "§ 4 Abs. 1 StVO", stil: "gold" }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 46, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5, ref: "§ 4 Abs. 3 StVO" }, { k: "k3_p2", t: 14.5, ref: "§ 4 Abs. 3 StVO" }, { k: "k3_p3", t: 23.0 }, { k: "k3_p4", t: 28.5, stil: "gold" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 64, sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 4.0, ref: "§ 4 Abs. 2 StVO" }, { k: "k4_p2", t: 18.0, ref: "§ 4 Abs. 2 Nr. 2 StVO" }, { k: "k4_p3", t: 29.5, ref: "§ 4 Abs. 2 Nr. 3 StVO" }, { k: "k4_p4", t: 39.5, ref: "§ 4 Abs. 2 Nr. 1 StVO" }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 16, merk: { k: "k5_merk", t: 1.2 } }
  ]
};
