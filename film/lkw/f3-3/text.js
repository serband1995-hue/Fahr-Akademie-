/* Film 3.3 „Gelb zuerst, rot nie allein“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Quelle: DGUV Information 214-080 „Kuppeln“ (S. 20, 28/29; Kap. 2.2.1 Schritt 9 und 11, 2.3.1 Schritt 11), BG Verkehr („Richtige Reihenfolge beim Anschließen der Luftleitungen rettet Leben“; „Abstellen und kuppeln“),
   Prüfungsablauf Klasse CE, Theoriefragen 2.7.07-319/-320; Funktionsbeschreibung Zweileitungsbremse: Serbands Dropbox-Folien CE (Abend 6), WABCO-Katalog (Anhängerbremsventil). Belege im Vault, Faktenblatt Film 3.3.
   Der Film zeigt die FOLGE (Rot löst die Betriebsbremse des Anhängers, ohne Sicherung rollt der Zug), nicht den Ventilvorgang im Detail. Keine Zahlen im Bild.
   Druck und Bewegung kommen aus kern/modell.js (anhaengerBremse, kuppelnZustand, rollen) mit Tests. */
window.FILM_TEXT = {
  film: "lkw-f3-3",
  fotos: ["kupplungskoepfe"],
  poster: 60,
  de: {
    titel: "Gelb zuerst, rot nie allein",
    l_foto: "Beispielbild, KI-erzeugt", f_koepfe: "Gelb, rot und Elektrik",
    ui_ueber: "Überblick: Druckluftleitungen beim Kuppeln",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Die Leitungen", k1_titel: "Zwei Leitungen, zwei Aufgaben", k1_sub: "Schema der Zweileitungsbremse.",
    k1_p1: "Rot ist die Vorratsleitung: Sie füllt den Vorratsbehälter des Anhängers.",
    k1_p2: "Gelb ist die Bremsleitung: Sie überträgt das Bremssignal.",
    k1_p3: "Sind beide verbunden, bremst der Anhänger mit, wenn die Zugmaschine bremst.",
    l_rot: "Rot: Vorrat", l_gelb: "Gelb: Bremssignal", l_zug: "Zugmaschine", l_anh: "Anhänger", l_pedal: "Bremspedal", l_behaelter: "Vorratsbehälter", l_ventil: "Anhängerbremsventil",

    k2_kicker: "Die Gefahr", k2_titel: "Rot löst die Bremse", k2_sub: "Was passiert, wenn rot allein verbunden ist?",
    k2_p1: "Ein abgekuppelter Anhänger ist gebremst: In der Vorratsleitung fehlt der Druck.",
    k2_p2: "Wird rot angeschlossen, löst die Betriebsbremse des Anhängers.",
    k2_p3: "Ohne gelb kommt kein Bremssignal von der Zugmaschine.",
    k2_p4: "Erst mit gelb bremst der Anhänger wieder mit.",
    l_gebremst: "Anhänger gebremst", l_geloest: "Bremse gelöst", l_kein_signal: "Kein Bremssignal", l_bremst_mit: "Bremst mit",

    k3_kicker: "Am Hang", k3_titel: "Rot allein: der Zug rollt", k3_sub: "Keine Feststellbremse, keine Keile.",
    k3_p1: "Hier ist nichts gesichert: keine Feststellbremse, keine Keile.",
    k3_p2: "Rot wird allein angeschlossen. Die Betriebsbremse des Anhängers löst.",
    k3_p3: "Der Zug setzt sich in Bewegung, schon bei kleinem Gefälle.",
    k3_p4: "Rollt der Zug, trenne die rote Leitung. Versuche nie, ins Führerhaus zu gelangen.",
    l_nichts: "Nichts gesichert", l_rollt: "Der Zug rollt", l_rot_trennen: "Rot trennen",

    k4_kicker: "Richtig", k4_titel: "Erst sichern, dann gelb, dann rot", k4_sub: "Dieselbe Stelle, jetzt richtig.",
    k4_p1: "Erst sichern: Feststellbremsen und Keile.",
    k4_p2: "Dann gelb anschließen: die Bremsleitung.",
    k4_p3: "Dann rot: die Vorratsleitung. Der Zug bleibt stehen.",
    k4_p4: "Bei kombinierten Kupplungsköpfen gibt es keine Reihenfolge: Beide werden gleichzeitig angeschlossen.",
    k4_p5: "Die Feststellbremse der Zugmaschine gibt Druck auf gelb: Der Anhänger bleibt gebremst.",
    l_gesichert: "Gesichert", l_steht: "Der Zug steht", l_kombi: "Kombinierter Kopf",

    k5_kicker: "Abkuppeln", k5_titel: "Umgekehrt: erst rot ab", k5_sub: "Beim Trennen kommt rot zuerst.",
    k5_p1: "Beim Abkuppeln wird zuerst rot getrennt, dann gelb.",
    k5_p2: "Der Anhänger bremst danach selbsttätig. Das reicht zum Sichern nicht, denn die Luft entweicht mit der Zeit.",
    k5_p3: "Auch dann: Feststellbremsen und Keile.",
    l_rot_ab: "Rot zuerst ab", l_gelb_ab: "Dann gelb ab", l_reicht_nicht: "Reicht nicht zum Sichern",

    k6_kicker: "Merke", k6_titel: "Zum Mitnehmen",
    k6_merk: "Vorher sichern. Gelb zuerst, rot nie allein. Beim Abkuppeln erst rot, dann gelb."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 66, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.5, ref: "DGUV Information 214-080" }, { k: "k1_p2", t: 16.0 }, { k: "k1_p3", t: 28.0 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 80, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5 }, { k: "k2_p2", t: 16.0, ref: "DGUV Information 214-080" }, { k: "k2_p3", t: 30.0 }, { k: "k2_p4", t: 52.0 }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 70, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5 }, { k: "k3_p2", t: 12.0, ref: "DGUV Information 214-080" }, { k: "k3_p3", t: 24.0, stil: "gold" }, { k: "k3_p4", t: 38.0, ref: "DGUV Information 214-080" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 68, sub: { k: "k4_sub", t: 0.6 },
      punkte: [{ k: "k4_p1", t: 3.5, ref: "DGUV Information 214-080; BG Verkehr" }, { k: "k4_p2", t: 14.0 }, { k: "k4_p5", t: 24.0, ref: "Folien CE, Abend 6" }, { k: "k4_p3", t: 34.0 }, { k: "k4_p4", t: 46.0, ref: "Theoriefrage 2.7.07-320" }] },
    { id: "k5", titel: "k5_titel", kicker: "k5_kicker", dauer: 54, sub: { k: "k5_sub", t: 0.6 },
      punkte: [{ k: "k5_p1", t: 3.5, ref: "DGUV Information 214-080; Theoriefrage 2.7.07-319" }, { k: "k5_p2", t: 20.0, ref: "DGUV Information 214-080, S. 20 und 33" }, { k: "k5_p3", t: 38.0 }] },
    { id: "k6", titel: "k6_titel", kicker: "k6_kicker", dauer: 20, merk: { k: "k6_merk", t: 1.2 } }
  ]
};
