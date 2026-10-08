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
