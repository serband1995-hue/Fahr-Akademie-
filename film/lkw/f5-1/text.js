/* Film 5.1 „Schleppkurven: Solo, Lastzug, Sattelzug“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. KEINE Stimme: alles steht als Text im Bild.
   Faktenblatt (jede Aussage mit Norm/Wortlaut): Obsidian-Vault, „Film 5.1 Schleppkurven – Faktenblatt“.
   Norm: § 32d StVZO (Kurvenlaufeigenschaften), Wortlaut geprüft am 07.10.2026 gegen gesetze-im-internet.de. Die Spuren im Bild sind GERECHNET
   (kern/modell.js, Tests in test/modell.test.mjs), die Fahrzeugmaße sind Beispielwerte, keine Daten eines bestimmten Fahrzeugs.

   Aufbau wie beim Film „Vorfahrt“: de = alle Sätze mit Schlüssel (werden in 17 Sprachen übersetzt, Schlüssel bleiben gleich);
   kapitel = Reihenfolge, Zeiten (t = Sekunden ab Kapitelanfang). Paragrafen-Verweise ("ref") sind Zitate und werden NICHT übersetzt.
   Lesezeit: jeder Satz bleibt mindestens 2,0 s + 0,5 s je Wort stehen (Deutsch); geprüft mit `node pruefe-lesezeit.mjs`. */
window.FILM_TEXT = {
  film: "lkw-f5-1",
  de: {
    titel: "Schleppkurven – wo fährt der Anhänger?",
    ui_ueber: "Überblick: Schleppkurven in 4 Minuten",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten",
    ui_pause: "Anhalten",
    ui_weiter: "Weiter",
    ui_neu: "Von vorn",
    ui_kapitel: "Kapitel",
    ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Die Frage",
    k1_titel: "Wohin läuft das Heck?",
    k1_sub: "Ein Lkw biegt rechts ab.",
    k1_p1: "Die Vorderräder fahren eine Kurve.",
    k1_p2: "Aber wo fahren die hinteren Räder? Und wo der Anhänger?",
    k1_p3: "Die Spuren aller Achsen in der Kurve heißen Schleppkurven.",

    k2_kicker: "Der Lkw allein",
    k2_titel: "Die Hinterachse läuft enger",
    k2_sub: "Ein Lkw ohne Anhänger, maßstabsgetreu gezeichnet.",
    k2_p1: "Nur die Vorderachse lenkt. Die Hinterachse läuft hinterher.",
    k2_p2: "Darum läuft die Hinterachse auf einem engeren Radius.",
    k2_p3: "Der Raum zwischen den Spuren wird überstrichen.",
    k2_p4: "Das ist der Gefahrenbereich.",
    l_vorn: "Vorderachse",
    l_hinten: "Hinterachse",
    l_gefahr: "Gefahrenbereich",

    k3_kicker: "Mit Anhänger",
    k3_titel: "Der Lastzug",
    k3_sub: "Lkw mit Anhänger an einer starren Deichsel.",
    k3_p1: "Die Anhängerachse folgt dem Kupplungspunkt, nicht dem Lkw.",
    k3_p2: "In diesem Beispiel läuft sie noch enger als die Hinterachse.",
    k3_p3: "Der Gefahrenbereich wird breiter.",
    l_anhaenger: "Anhängerachse",

    k4_kicker: "Mit Auflieger",
    k4_titel: "Der Sattelzug",
    k4_sub: "Zugmaschine und Auflieger.",
    k4_p1: "Der Auflieger hängt am Königszapfen der Sattelkupplung.",
    k4_p2: "In der Kurve knickt der Auflieger nach und nach ab.",
    k4_p3: "Im Beispiel läuft seine Spur am weitesten innen.",
    l_auflieger: "Achsen des Aufliegers",
    l_knick: "Knickwinkel",

    k5_kicker: "Im Vergleich",
    k5_titel: "Gleiche Kurve, drei Fahrzeuge",
    k5_sub: "Die Vorderachse fährt jedes Mal dieselbe Kurve.",
    k5_p1: "Lkw, Lastzug, Sattelzug: Die hintere Spur rückt immer weiter nach innen.",
    l_lkw: "Lkw",
    l_lastzug: "Lastzug",
    l_sattel: "Sattelzug",

    k6_kicker: "Das Gesetz",
    k6_titel: "Der Kreisring",
    k6_sub: "Wie viel Platz darf ein Fahrzeug brauchen?",
    k6_p1: "Eine Kreisfahrt hat den äußeren Radius 12,50 m.",
    k6_p2: "Die überstrichene Ringfläche darf höchstens 7,20 m breit sein.",
    k6_p3: "Der freie Innenkreis hat also mindestens 5,30 m Radius.",
    k6_p4: "Beim Einlenken aus der Geraden darf kein Teil mehr als 0,80 m nach außen ragen.",
    k6_p5: "Der Beispiel-Sattelzug hält beides ein.",
    l_r_aussen: "12,50 m",
    l_r_ring: "höchstens 7,20 m",
    l_r_innen: "5,30 m",
    l_r_gerade: "0,80 m",

    k7_kicker: "Merke",
    k7_titel: "Zum Mitnehmen",
    k7_merk: "Hinten läuft enger. Zwischen den Spuren ist Gefahrenbereich."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 24,
      sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.2 }, { k: "k1_p2", t: 8.8 }, { k: "k1_p3", t: 16.4 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 36,
      sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 4.5 }, { k: "k2_p2", t: 12.0 }, { k: "k2_p3", t: 19.0 }, { k: "k2_p4", t: 25.5, stil: "gold" }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 34,
      sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 4.5 }, { k: "k3_p2", t: 12.5 }, { k: "k3_p3", t: 21.0, stil: "gold" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 36,
      sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 4.5 }, { k: "k4_p2", t: 12.0 }, { k: "k4_p3", t: 20.0, stil: "gold" }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 20,
      sub: { k: "k5_sub", t: 0.6 },
      punkte: [{ k: "k5_p1", t: 5.0, stil: "gold" }] },
    { id: "k6", titel: "k6_titel", kicker: "k6_kicker", dauer: 66,
      sub: { k: "k6_sub", t: 0.6 },
      punkte: [
        { k: "k6_p1", t: 4.5, ref: "§ 32d Abs. 1 StVZO" },
        { k: "k6_p2", t: 11.5, ref: "§ 32d Abs. 1 StVZO" },
        { k: "k6_p3", t: 19.5, ref: "§ 32d Abs. 1 StVZO: 12,50 m − 7,20 m" },
        { k: "k6_p4", t: 28.0, ref: "§ 32d Abs. 2 StVZO" },
        { k: "k6_p5", t: 49.0, stil: "gold" }] },
    { id: "k7", titel: "k7_titel", kicker: "k7_kicker", dauer: 14,
      merk: { k: "k7_merk", t: 1.2 } }
  ]
};
