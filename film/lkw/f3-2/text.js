/* Film 3.2 „Abkuppeln“ (Sattelzug) – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Quelle der Schrittfolge: DGUV Information 214-080 „Kuppeln“ (Kap. 2.3.2 Absatteln), BG Verkehr „Abstellen und kuppeln“, Prüfungsablauf „Verbinden und Trennen“ Klasse CE, Theoriefrage 2.7.07-319.
   Recherche und Belege: Vault, Faktenblatt Film 3.2. Keine Zahlen im Bild (Vorziehen in cm und Absenken in cm stehen nur in einer Quelle und bleiben draußen). */
window.FILM_TEXT = {
  film: "lkw-f3-2",
  poster: 60,
  de: {
    titel: "Abkuppeln eines Sattelzugs",
    ui_ueber: "Überblick: Abkuppeln eines Sattelzugs",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Abkuppeln", k1_titel: "Gestreckt abstellen", k1_sub: "Sattelzug: Der Zug steht gerade.",
    k1_p1: "Der Zug steht möglichst gestreckt.",
    k1_p2: "Vor der Zugmaschine bleibt Platz, um später gerade wieder anzukuppeln.",
    l_gestreckt: "Gestreckt", l_platz: "Platz zum geraden Ankuppeln",

    k1b_kicker: "Sichern", k1b_titel: "Erst sichern", k1b_sub: "Beide Feststellbremsen, dazu Keile.",
    k1b_p1: "Steht der Zug, wird zuerst die Feststellbremse der Zugmaschine betätigt.",
    k1b_p2: "Danach die des Aufliegers: roten Knopf ziehen.",
    k1b_p3: "Dazu kommen Unterlegkeile an einer starren Achse.",
    l_fest_zug: "Feststellbremse Zugmaschine", l_fest_auf: "Feststellbremse Auflieger", l_keile: "Unterlegkeile",

    k2_kicker: "Stützen", k2_titel: "Stützwinden ausfahren", k2_sub: "Der Auflieger muss danach sicher stehen.",
    k2_p1: "Die Stützwinden werden ausgefahren: bei Luftfederung, bis die Füße den Boden berühren, bei Blattfederung, bis die Federn der Zugmaschine entlastet sind.",
    k2_p2: "Der Boden muss tragen. Sonst werden die Füße unterbaut.",
    k2_p3: "Der Auflieger wird nicht von der Sattelkupplung abgehoben.",
    l_stuetzen: "Stützwinden aus", l_tragfaehig: "Boden trägt", l_nicht_abheben: "Nicht abheben",

    k3_kicker: "Leitungen", k3_titel: "Erst rot, dann gelb", k3_sub: "Vorratsleitung zuerst trennen.",
    k3_p1: "Zuerst wird rot getrennt: die Vorratsleitung.",
    k3_p2: "Dann kommt gelb: die Bremsleitung.",
    k3_p3: "Auch das Elektrokabel wird getrennt. Die Köpfe kommen in die Parkdosen.",
    k3_p4: "Beim Trennen von rot bremst der Anhänger selbsttätig. Das reicht zum Sichern nicht.",
    k3_p5: "Die Luft geht mit der Zeit verloren. Darum bleiben Feststellbremse und Keile.",
    l_rot_ab: "Rot ab: Vorratsleitung", l_gelb_ab: "Gelb ab: Bremsleitung", l_elektro_ab: "Elektrik ab", l_reicht_nicht: "Reicht nicht zum Sichern",

    k4_kicker: "Wegfahren", k4_titel: "Kupplung öffnen", k4_sub: "Langsam und gerade vorziehen.",
    k4_p1: "Die Sicherung der Sattelkupplung wird ausgehängt, die Kupplung geöffnet.",
    k4_p2: "Die Zugmaschine fährt langsam und gerade ein Stück vor.",
    k4_p3: "Bei Luftfederung wird sie dann etwas abgesenkt und fährt ganz heraus.",
    k4_p4: "So schlägt das Heck der Zugmaschine nicht hoch.",
    l_oeffnen: "Kupplung öffnen", l_vorziehen: "Gerade vorziehen", l_absenken: "Absenken, dann heraus",

    k5_kicker: "Merke", k5_titel: "Zum Mitnehmen",
    k5_merk: "Gestreckt abstellen, beide Feststellbremsen, Keile, Stützwinden aus. Erst rot, dann gelb ab. Rot allein sichert nicht."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 34, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.0, ref: "DGUV Information 214-080" }, { k: "k1_p2", t: 12.0, ref: "DGUV Information 214-080" }] },
    { id: "k1b", titel: "k1b_titel", kicker: "k1b_kicker", dauer: 50, sub: { k: "k1b_sub", t: 0.6 },
      punkte: [{ k: "k1b_p1", t: 3.0, ref: "DGUV Information 214-080" }, { k: "k1b_p2", t: 15.0 }, { k: "k1b_p3", t: 28.0 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 50, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5, ref: "DGUV Information 214-080" }, { k: "k2_p2", t: 22.0 }, { k: "k2_p3", t: 32.0 }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 74, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5, ref: "DGUV Information 214-080; Theoriefrage 2.7.07-319" }, { k: "k3_p2", t: 14.0 }, { k: "k3_p3", t: 24.0 }, { k: "k3_p4", t: 38.0, ref: "DGUV Information 214-080", stil: "gold" }, { k: "k3_p5", t: 54.0, ref: "DGUV Information 214-080", stil: "gold" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 70, sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 3.5, ref: "DGUV Information 214-080" }, { k: "k4_p2", t: 16.0 }, { k: "k4_p3", t: 30.0, ref: "DGUV Information 214-080" }, { k: "k4_p4", t: 46.0 }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 22, merk: { k: "k5_merk", t: 1.2 } }
  ]
};
