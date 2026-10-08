/* Film 3.1 „Ankuppeln“ (Sattelzug) – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Quelle der Schrittfolge: DGUV Information 214-080 „Kuppeln“ (Kap. 2.3.1 Aufsatteln), BG Verkehr „Abstellen und kuppeln“, Prüfungsablauf „Verbinden und Trennen“ Klasse CE (Fahrschule Dünhöft).
   Recherche und Belege: Vault, Faktenblatt Film 3.1. Keine Zahlen im Bild (Luftspalt, Abstände, Längen sind in den Quellen uneinheitlich).
   Höhen und Bewegungen kommen aus kern/modell.js (SATTEL, sattelUnterfahren, sattelTreffer, kuppelnZustand, rollen) mit Tests. */
window.FILM_TEXT = {
  film: "lkw-f3-1",
  poster: 60,
  de: {
    titel: "Ankuppeln eines Sattelzugs",
    ui_ueber: "Überblick: Ankuppeln eines Sattelzugs",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Ankuppeln", k1_titel: "Erst sichern", k1_sub: "Sattelzug: Zugmaschine und Auflieger.",
    k1_p1: "Der Auflieger steht gesichert: Die Feststellbremse ist gezogen.",
    k1_p2: "Dazu kommen Unterlegkeile an einer starren Achse.",
    k1_p3: "Zwischen den Fahrzeugen darf niemand stehen.",
    l_fest: "Feststellbremse gezogen", l_keile: "Unterlegkeile", l_niemand: "Niemand dazwischen",

    k2_kicker: "Von oben", k2_titel: "Gerade heranfahren", k2_sub: "Die Zugmaschine fährt rückwärts an den Auflieger.",
    k2_p1: "Die Zugmaschine fährt gerade und fluchtend an den Auflieger heran.",
    k2_p2: "Steht sie schief, trifft der Zapfen die Sattelkupplung nicht richtig.",
    k2_p3: "Gerade heranfahren: Der Zapfen trifft die Kupplung.",
    l_schief: "Schief", l_gerade: "Gerade", l_zapfen_nicht: "Zapfen trifft nicht", l_zapfen_ja: "Zapfen trifft",

    k3_kicker: "Von der Seite", k3_titel: "Unterfahren und kuppeln", k3_sub: "Höhe, Kupplung, Anfahrruck.",
    k3_p1: "Die Zugmaschine ist so hoch, dass die Sattelplatte unter den Zapfen und die Aufgleitplatte passt.",
    k3_p2: "Die Sattelkupplung ist geöffnet und einfahrbereit.",
    k3_p3: "Rückwärts fahren, bis die Kupplung greift. Den Auflieger dabei nicht anheben.",
    k3_p4: "Ein kurzer Anfahrruck zeigt, ob der Zapfen hält.",
    k3_p5: "Er ersetzt die Sichtkontrolle nicht.",
    l_hoch: "Passt darunter", l_offen: "Kupplung offen", l_nicht_anheben: "Auflieger nicht anheben", l_ruck: "Kurzer Anfahrruck",

    k4_kicker: "Kontrolle", k4_titel: "Sichtkontrolle", k4_sub: "Erst die Zugmaschine sichern, dann prüfen.",
    k4_p1: "Steht der Zug, wird die Feststellbremse der Zugmaschine betätigt.",
    k4_p2: "Sichtkontrolle: Die Aufgleitplatte liegt ohne Luftspalt auf der Sattelkupplung.",
    k4_p3: "Die Sicherung der Kupplung ist eingefallen.",
    k4_p4: "Ist sie nicht selbsttätig, wird sie zusätzlich gesichert, zum Beispiel mit einem Karabinerhaken.",
    k4_p5: "Stimmt etwas nicht: Kupplung öffnen, vorziehen und von vorn beginnen.",
    l_fest_zug: "Feststellbremse Zugmaschine", l_ohne_spalt: "Kein Luftspalt", l_eingefallen: "Sicherung eingefallen",

    k5_kicker: "Leitungen", k5_titel: "Erst gelb, dann rot", k5_sub: "Bremsleitung und Vorratsleitung anschließen.",
    k5_p1: "Vorher müssen die Feststellbremsen betätigt und die Keile angelegt sein.",
    k5_p2: "Zuerst kommt gelb: die Bremsleitung.",
    k5_p3: "Dann kommt rot: die Vorratsleitung.",
    k5_p4: "Dazu wird das Elektrokabel angeschlossen.",
    k5_p5: "Die Leitungen hängen nicht durch und scheuern nirgends.",
    l_gelb: "Gelb: Bremsleitung", l_rot: "Rot: Vorratsleitung", l_elektro: "Elektrik und ABS", l_vorher: "Erst sichern",

    k6_kicker: "Abfahrbereit", k6_titel: "Fertig machen", k6_sub: "Stützwinden, Bremsen, Prüfung.",
    k6_p1: "Die Stützwinden gehen in Fahrstellung, die Kurbel wird gesichert.",
    k6_p2: "Erst jetzt wird die Feststellbremse des Aufliegers gelöst.",
    k6_p3: "Dann werden die Keile entfernt.",
    k6_p4: "Beleuchtung und Bremse des Anhängers werden geprüft.",
    k6_p5: "Abfahrkontrolle: Niemand auf der Ladefläche, die Ladearbeiten sind beendet.",
    l_stuetzen: "Stützwinden hoch", l_fest_los: "Feststellbremse gelöst", l_keile_weg: "Keile entfernt", l_licht: "Licht und Bremse geprüft",

    k7_kicker: "Merke", k7_titel: "Zum Mitnehmen",
    k7_merk: "Sichern, gerade heranfahren, Sichtkontrolle, erst gelb, dann rot. Danach Stützwinden hoch, Bremse lösen, prüfen."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 40, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.0, ref: "DGUV Information 214-080" }, { k: "k1_p2", t: 12.0, ref: "DGUV Information 214-080" }, { k: "k1_p3", t: 22.0, ref: "DGUV Information 214-080" }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 44, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5, ref: "DGUV Information 214-080" }, { k: "k2_p2", t: 14.0 }, { k: "k2_p3", t: 28.0, stil: "gold" }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 80, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5, ref: "DGUV Information 214-080" }, { k: "k3_p2", t: 15.0 }, { k: "k3_p3", t: 24.0 }, { k: "k3_p4", t: 52.0 }, { k: "k3_p5", t: 62.0 }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 66, sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 3.5 }, { k: "k4_p2", t: 14.0 }, { k: "k4_p3", t: 26.0 }, { k: "k4_p4", t: 35.0 }, { k: "k4_p5", t: 50.0 }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 66, sub: { k: "k5_sub", t: 0.6 },
      punkte: [{ k: "k5_p1", t: 3.5, ref: "DGUV Information 214-080" }, { k: "k5_p2", t: 14.0, ref: "BG Verkehr" }, { k: "k5_p3", t: 24.0 }, { k: "k5_p4", t: 34.0 }, { k: "k5_p5", t: 44.0 }] },
    { id: "k6", titel: "k6_titel", kicker: "k6_kicker", dauer: 66, sub: { k: "k6_sub", t: 0.6 },
      punkte: [{ k: "k6_p1", t: 3.5 }, { k: "k6_p2", t: 14.0 }, { k: "k6_p3", t: 26.0 }, { k: "k6_p4", t: 36.0 }, { k: "k6_p5", t: 48.0 }] },
    { id: "k7", titel: "k7_titel", kicker: "k7_kicker", dauer: 22, merk: { k: "k7_merk", t: 1.2 } }
  ]
};
