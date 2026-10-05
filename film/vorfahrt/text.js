/* Eine Quelle für allen Text im Film (Deutsch) samt Zeiten. KEINE Stimme: alles steht als Text im Bild.
   Fachgrundlage: StVO, geprüft am 05.10.2026 gegen gesetze-im-internet.de (stvo_2013):
   § 8 Abs. 1, 1a, 2 · § 9 Abs. 1, 3, 4 · § 10 · § 36 Abs. 1, 2 · § 37 Abs. 1, 2 · § 45 Abs. 1c.

   Aufbau
   - de:       alle Sätze mit Schlüssel (diese Texte werden in die 17 anderen Sprachen übersetzt, Schlüssel bleiben gleich)
   - kapitel:  Reihenfolge, Zeiten (t = Sekunden ab Kapitelanfang), Verweise auf Schlüssel
   - Paragrafen-Verweise ("ref") sind Zitate und werden NICHT übersetzt.

   Zeiten (Lesezeit): Jeder Satz bleibt mindestens 2,0 s + 0,5 s je Wort stehen (Deutsch). Das gibt Luft für die
   längste Sprache; geprüft wird das mit `node pruefe-lesezeit.mjs` (Zeichen pro Sekunde je Sprache).
   Stehen die Autos still (warten), ist das Absicht: Der Satz darf in Ruhe gelesen werden. */
window.FILM_TEXT = {
  de: {
    titel: "Vorfahrt – wer fährt zuerst?",
    ui_ueber: "Überblick: Vorfahrt in 5 Minuten",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten",
    ui_pause: "Anhalten",
    ui_weiter: "Weiter",
    ui_neu: "Von vorn",
    ui_kapitel: "Kapitel",
    ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Die Frage",
    k1_titel: "Wer fährt zuerst?",
    k1_sub: "Eine Kreuzung. Keine Ampel, keine Schilder, kein Polizist.",
    k1_p1: "Drei Autos kommen gleichzeitig an. Alle wollen geradeaus.",
    k1_p2: "Wer darf zuerst fahren?",
    k1_p3: "Die Antwort kommt am Ende. Dafür brauchst du eine Idee: die Vorfahrtspyramide.",

    k2_kicker: "Die Ordnung",
    k2_titel: "Die Vorfahrtspyramide",
    k2_intro: "Es gibt eine feste Reihenfolge. Was höher steht, geht vor.",
    k2_vorrang: "Vorrang",
    s1_name: "Polizei",
    s1_text: "Zeichen und Weisungen der Polizei gehen allen anderen Regeln, Ampeln und Schildern vor.",
    s1_plus: "Auch dann musst du selbst aufpassen.",
    s2_name: "Ampel",
    s2_text: "Lichtzeichen gehen Vorfahrtschildern und rechts vor links vor.",
    s2_plus: "Auch bei Grün musst du aufpassen.",
    s3_name: "Schilder",
    s3_text: "Vorfahrt gewähren, Halt, Vorfahrtstraße: Wo diese Schilder stehen, gilt rechts vor links nicht.",
    s3_plus: "Du erkennst sie an der Form: Dreieck, Achteck, Raute.",
    s4_name: "Rechts vor links",
    s4_text: "Gibt es nichts Höheres: Wer von rechts kommt, hat Vorfahrt.",
    s4_plus: "Das gilt an Kreuzungen und Einmündungen – es ist die Grundlage.",
    k2_merk: "Was höher steht, gewinnt.",

    k3_kicker: "Die Grundregel",
    k3_titel: "Rechts vor links",
    k3_pill: "von rechts",
    k3_p1: "Wer von rechts kommt, hat Vorfahrt – an Kreuzungen und Einmündungen ohne Schilder und Ampel.",
    k3_p2: "Wer warten muss, wird früh langsamer. So sieht jeder: Ich warte.",
    k3_p3: "Das Auto von rechts hat Vorfahrt. Das andere Auto wartet.",
    k3_p4: "Du fährst erst weiter, wenn du den anderen weder gefährdest noch wesentlich behinderst.",
    k3_p5: "Aus der Gegenrichtung gilt dasselbe: Auch dort hat Vorfahrt, wer von rechts kommt.",
    k3_p6: "Typischer Fehler: nicht nach rechts schauen oder einfach vordrängeln.",
    k3_merk: "Rechts vor links gilt nur, wenn nichts Höheres etwas anderes sagt.",

    k4_kicker: "Gegenverkehr",
    k4_titel: "Links abbiegen",
    k4_pill: "voreinander",
    k4_p1: "Rechtzeitig blinken, zur Mitte einordnen, nach hinten schauen.",
    k4_p2: "Dann wartest du: Der Gegenverkehr geht vor.",
    k4_p3: "Gegenverkehr, der geradeaus fährt: durchlassen.",
    k4_p4: "Auch Gegenverkehr, der rechts abbiegt: durchlassen.",
    k4_p5: "Erst wenn du niemanden behinderst oder gefährdest, biegst du ab.",
    k4_p6: "Zwei Linksabbieger von gegenüber biegen in der Regel voreinander ab.",
    k4_p7: "Nur wenn Verkehrslage oder Kreuzung es verlangen, biegen sie hintereinander ab.",
    k4_merk: "Linksabbieger lassen den Gegenverkehr durch.",

    k5_kicker: "Tempo 30",
    k5_titel: "Die 30er-Zone",
    k5_p1: "Schild 274.1: Hier beginnt die Tempo-30-Zone. Du darfst höchstens 30 km/h fahren.",
    k5_p2: "In der Zone gilt an Kreuzungen grundsätzlich rechts vor links – meistens ohne Vorfahrtschilder.",
    k5_p3: "Parkende Autos nehmen dir die Sicht? Taste dich langsam hinein, bis du alles übersehen kannst.",
    k5_p4: "Fahre langsam und sei bremsbereit – auch wenn du Vorfahrt hast.",
    k5_merk: "Wer von rechts kommt, hat Vorfahrt.",

    k6_kicker: "Zum Schluss",
    k6_titel: "Zurück zur Frage",
    k6_a1: "Das Auto rechts im Bild fährt zuerst: Von seiner rechten Seite kommt niemand.",
    k6_a2: "Dann das Auto unten: Das Auto von rechts ist weg.",
    k6_a3: "Zuletzt das Auto links: Auch hier ist das Auto von rechts weg.",
    k6_merk: "Was höher steht, gewinnt. Gibt es nichts Höheres: rechts vor links.",
    k6_b1: "Eigene Regeln haben: Kreisverkehr, Grundstücksausfahrt, Feld- und Waldweg.",
    k6_b2: "Gibt es Polizei, Ampel oder Schilder, entscheiden zuerst sie – nicht rechts vor links.",
    k6_b3: "Jetzt üben: Die 3D-Szenen in der Fahr-Akademie zeigen es aus jedem Blickwinkel."
  },

  kapitel: [
    { id: "k1", dauer: 29, kicker: "k1_kicker", titel: "k1_titel", sub: { t: 2.4, k: "k1_sub" },
      punkte: [
        { t: 9.0, k: "k1_p1" },
        { t: 15.5, k: "k1_p2" },
        { t: 20.0, k: "k1_p3", stil: "gold" }
      ] },
    { id: "k2", dauer: 73, kicker: "k2_kicker", titel: "k2_titel", intro: { t: 0.6, k: "k2_intro" }, vorrang: "k2_vorrang",
      stufen: [
        { t: 7.0, nr: "1", name: "s1_name", text: "s1_text", plus: "s1_plus", ref: "§ 36 Abs. 1 StVO" },
        { t: 21.0, nr: "2", name: "s2_name", text: "s2_text", plus: "s2_plus", ref: "§ 37 Abs. 1, 2 StVO" },
        { t: 35.0, nr: "3", name: "s3_name", text: "s3_text", plus: "s3_plus", ref: "§ 8 Abs. 1 StVO · Z. 205 · 206 · 306" },
        { t: 49.0, nr: "4", name: "s4_name", text: "s4_text", plus: "s4_plus", ref: "§ 8 Abs. 1 Satz 1 StVO" }
      ],
      merk: { t: 63.0, k: "k2_merk" } },
    { id: "k3", dauer: 60, kicker: "k3_kicker", titel: "k3_titel", pill: "k3_pill",
      punkte: [
        { t: 1.0, k: "k3_p1", ref: "§ 8 Abs. 1 StVO" },
        { t: 10.5, k: "k3_p2", ref: "§ 8 Abs. 2 StVO" },
        { t: 18.5, k: "k3_p3" },
        { t: 25.5, k: "k3_p4", ref: "§ 8 Abs. 2 StVO" },
        { t: 34.5, k: "k3_p5" },
        { t: 43.0, k: "k3_p6" }
      ],
      merk: { t: 51.5, k: "k3_merk" } },
    { id: "k4", dauer: 55, kicker: "k4_kicker", titel: "k4_titel", pill: "k4_pill",
      punkte: [
        { t: 1.0, k: "k4_p1", ref: "§ 9 Abs. 1 StVO" },
        { t: 8.0, k: "k4_p2" },
        { t: 13.5, k: "k4_p3", ref: "§ 9 Abs. 3 StVO" },
        { t: 19.0, k: "k4_p4", ref: "§ 9 Abs. 4 StVO" },
        { t: 25.0, k: "k4_p5" },
        { t: 32.5, k: "k4_p6", ref: "§ 9 Abs. 4 StVO" },
        { t: 39.5, k: "k4_p7", ref: "§ 9 Abs. 4 StVO" }
      ],
      merk: { t: 47.5, k: "k4_merk" } },
    { id: "k5", dauer: 42, kicker: "k5_kicker", titel: "k5_titel",
      punkte: [
        { t: 1.5, k: "k5_p1", ref: "Z. 274.1 StVO" },
        { t: 10.5, k: "k5_p2", ref: "§ 8 Abs. 1 · § 45 Abs. 1c StVO" },
        { t: 19.5, k: "k5_p3", ref: "§ 8 Abs. 2 StVO" },
        { t: 29.0, k: "k5_p4" }
      ],
      merk: { t: 35.0, k: "k5_merk" } },
    { id: "k6", dauer: 60, kicker: "k6_kicker", titel: "k6_titel",
      punkte: [
        { t: 1.5, k: "k6_a1" },
        { t: 10.5, k: "k6_a2" },
        { t: 18.5, k: "k6_a3" },
        { t: 35.5, k: "k6_b1", ref: "§ 8 Abs. 1 Nr. 2, Abs. 1a · § 10 StVO" },
        { t: 42.0, k: "k6_b2" },
        { t: 51.0, k: "k6_b3", stil: "gold" }
      ],
      merk: { t: 26.0, k: "k6_merk" } }
  ]
};
