/* Film 6.1 „Zweikreis- und Zweileitungsbremse“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Quellen: WABCO-Produktkatalog Druckluftbremsanlage (Zweileitungsbremse, Anhängerbremsventil, Überströmventil), Haldex Einbauhinweise, kfz-tech (Fachbuch Druckluftbremse), Wikipedia Zweikreisbremsanlage/Vierkreisschutzventil,
   amtliche Theoriefragen 2.7.02-304, 2.7.06-317, Serbands Dropbox-Folien C3–C6 (Zweikreisbremse achsweise) und CE (Zweileitungsbremse). Belege und Grenzen: Vault, Faktenblatt Film 6.1.
   Prinzipbilder, keine Herstellerpläne; Drücke sind Anteile (0 bis voll), keine bar-Werte. Modell: kern/modell.js (zweikreis, anhaengerBremse) mit Tests. */
window.FILM_TEXT = {
  film: "lkw-f6-1",
  poster: 70,
  de: {
    titel: "Zweikreis- und Zweileitungsbremse",
    ui_ueber: "Überblick: Zweikreis- und Zweileitungsbremse",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Der Lkw", k1_titel: "Zwei Bremskreise", k1_sub: "Schema: ein Kreis je Achse.",
    k1_p1: "Die Betriebsbremse des Lkw hat zwei voneinander getrennte Bremskreise.",
    k1_p2: "Im Beispiel gehört ein Kreis zur Vorderachse und einer zur Hinterachse.",
    k1_p3: "Tritt der Fahrer aufs Pedal, bekommen beide Kreise Druck.",
    k1_p4: "Wird ein Kreis undicht, entweicht seine Luft. Der andere Kreis behält seinen Druck.",
    k1_p5: "Der Lkw bremst weiter, aber schwächer. Der Bremsweg wird länger.",
    k1_p6: "Der Fahrer bremst ab und hält an.",
    l_kreis1: "Kreis 1", l_kreis2: "Kreis 2", l_bremsventil: "Bremsventil", l_vorderachse: "Vorderachse", l_hinterachse: "Hinterachse", l_pedal: "Bremspedal", l_wirkung: "Bremswirkung", l_leck: "Leck", l_geringer: "Bremswirkung geringer",

    k2_kicker: "Der Anhänger", k2_titel: "Die Zweileitungsbremse", k2_sub: "Schema: Zugmaschine und Anhänger.",
    k2_p1: "Zum Anhänger führen zwei Druckluftleitungen.",
    k2_p2: "Rot ist die Vorratsleitung. Sie hält den Vorratsbehälter des Anhängers gefüllt.",
    k2_p3: "Gelb ist die Bremsleitung. Ihr Druck steigt nur beim Bremsen.",
    k2_p4: "Der Anhänger bremst mit der Luft aus seinem eigenen Behälter. Gelb sagt nur, wie stark.",
    k2_p5: "Lässt der Fahrer das Pedal los, entlüftet gelb und die Anhängerbremse löst.",
    l_zug: "Zugmaschine", l_anh: "Anhänger", l_ventil: "Anhängerbremsventil", l_behaelter: "Vorratsbehälter", l_rot: "Rot: Vorrat", l_gelb: "Gelb: Bremssignal",

    k3_kicker: "Der Grund", k3_titel: "Sicher auch im Notfall", k3_sub: "Was passiert, wenn rot ausfällt?",
    k3_p1: "Fällt der Druck in der roten Leitung ab, bremst der Anhänger von selbst.",
    k3_p2: "Er nutzt die Luft aus seinem eigenen Vorratsbehälter.",
    k3_p3: "Darum ist ein abgekuppelter Anhänger gebremst.",
    l_selbst: "Bremst selbsttätig", l_verbunden: "Rot verbunden", l_getrennt: "Rot getrennt",

    k4_kicker: "Merke", k4_titel: "Zum Mitnehmen",
    k4_merk: "Zwei Bremskreise: Fällt einer aus, bremst der andere. Rot füllt, gelb bremst. Fällt rot ab, bremst der Anhänger selbst."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 84, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.5, ref: "Theoriefrage 2.7.02-304" }, { k: "k1_p2", t: 14.0 }, { k: "k1_p3", t: 25.0 }, { k: "k1_p4", t: 38.0, ref: "Theoriefrage 2.7.02-304" }, { k: "k1_p5", t: 54.0 }, { k: "k1_p6", t: 70.0 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 74, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5 }, { k: "k2_p2", t: 12.0, ref: "WABCO, Haldex" }, { k: "k2_p3", t: 24.0, ref: "WABCO" }, { k: "k2_p4", t: 36.0, ref: "WABCO" }, { k: "k2_p5", t: 49.0, ref: "WABCO" }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 56, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5, ref: "WABCO" }, { k: "k3_p2", t: 12.0 }, { k: "k3_p3", t: 26.0, ref: "WABCO; Theoriefrage 2.7.02-302" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 20, merk: { k: "k4_merk", t: 1.2 } }
  ]
};
