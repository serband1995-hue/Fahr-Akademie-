/* Film 6.3 „Federspeicherbremse“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Quellen: kfz-tech (Druckluft-Handbremse: „Die Druckluft wird also zum Lösen der Bremse gebraucht“, „Die Feder wirkt bei Druckverlust automatisch auf die Bremsbacken“), WABCO-Produktkatalog (Handbremsventil, Überströmventil),
   Wikipedia Federspeicherbremse/Membranzylinder, Serbands Dropbox-Folien CE (Feststellbremse, „erst losfahren, wenn der Druck aufgebaut ist“). Belege und Grenzen: Vault, Faktenblatt Film 6.3.
   Prinzipbild eines Kombizylinders, vereinfacht; Drücke sind Anteile (0 bis voll), keine bar-Werte. Modell: kern/modell.js (federspeicher) mit Tests. Keine Aussagen zu Hebelrichtung, Notlösen oder Anhänger-Löseknöpfen (bauartabhängig). */
window.FILM_TEXT = {
  film: "lkw-f6-3",
  poster: 40,
  de: {
    titel: "Federspeicherbremse",
    ui_ueber: "Überblick: Feder bremst, Luft löst",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Das Prinzip", k1_titel: "Die Feder bremst", k1_sub: "Schnitt durch den Federspeicherteil (vereinfacht).",
    k1_p1: "Im Federspeicherzylinder sitzt eine starke Feder.",
    k1_p2: "Ohne Druckluft drückt die Feder die Bremse zu.",
    k1_p3: "Druckluft im Federteil spannt die Feder. Die Bremse löst.",
    k1_p4: "Also: Die Feder bremst, die Luft löst.",
    l_feder: "Feder", l_luft: "Druckluft", l_zu: "Bremse zu", l_frei: "Bremse frei", l_trommel: "Bremstrommel",

    k2_kicker: "Der Kombizylinder", k2_titel: "Zwei Bremsen in einem Gehäuse", k2_sub: "Betriebsbremse und Feststellbremse.",
    k2_p1: "Der Kombizylinder hat zwei Teile: den Membranteil und den Federteil.",
    k2_p2: "Die Betriebsbremse arbeitet über den Membranteil: Luft drückt, die Bremse greift.",
    k2_p3: "Die Feststellbremse arbeitet über den Federteil: Das Handbremsventil entlüftet ihn.",
    k2_p4: "Dann bremst die Feder. Zum Lösen kommt wieder Luft in den Federteil.",
    l_membran: "Membranteil", l_federteil: "Federteil", l_betrieb: "Betriebsbremse", l_fest: "Feststellbremse", l_entlueftet: "Federteil entlüftet",

    k3_kicker: "Wenn Druck fehlt", k3_titel: "Druckverlust: die Feder bremst von selbst", k3_sub: "Auch ohne dass jemand bremst.",
    k3_p1: "Verliert die Anlage Druck, sinkt auch der Druck im Federteil.",
    k3_p2: "Fällt er zu tief, drückt die Feder die Bremse zu.",
    k3_p3: "So bremst das Fahrzeug von selbst, zum Beispiel bei einem Leck.",
    k3_p4: "Darum erst losfahren, wenn der Druck aufgebaut ist.",
    l_druck: "Druck im Federteil", l_zieht_zu: "Ab hier zieht die Feder zu", l_leck: "Druck sinkt", l_aufbau: "Druck baut sich auf", l_gespannt: "Feder gespannt", l_bremst_selbst: "Bremst von selbst",

    k4_kicker: "Merke", k4_titel: "Zum Mitnehmen",
    k4_merk: "Feder bremst, Luft löst. Ohne Druck bremst die Feder von selbst. Erst losfahren, wenn der Druck aufgebaut ist."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 56, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.5, ref: "kfz-tech; Wikipedia Federspeicherbremse" }, { k: "k1_p2", t: 13.0, ref: "kfz-tech" }, { k: "k1_p3", t: 24.0, ref: "kfz-tech: „Die Druckluft wird also zum Lösen der Bremse gebraucht“" }, { k: "k1_p4", t: 42.0 }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 66, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5, ref: "Wikipedia Membranzylinder; Atzlinger" }, { k: "k2_p2", t: 12.0, ref: "Wikipedia Membranzylinder" }, { k: "k2_p3", t: 30.0, ref: "WABCO Handbremsventil" }, { k: "k2_p4", t: 46.0, ref: "kfz-tech" }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 64, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5, ref: "Wikipedia Federspeicherbremse" }, { k: "k3_p2", t: 16.0, ref: "kfz-tech" }, { k: "k3_p3", t: 30.0, ref: "Wikipedia Federspeicherbremse; kfz-tech" }, { k: "k3_p4", t: 44.0, ref: "Folien CE; WABCO Überströmventil" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 22, merk: { k: "k4_merk", t: 1.2 } }
  ]
};
