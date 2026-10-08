/* Film 6.2 „Abreißen der Kupplung“ – EINE Quelle für allen Text (Deutsch) samt Zeiten. Keine Stimme (Stimmen kommen später in einer eigenen Sitzung).
   Quellen: WABCO-Produktkatalog Druckluftbremsanlage (Anhängerbremsventil, Überströmventil), Haldex Einbauhinweise (Rückschlagventil in der Vorratsleitung), kfz-tech (Anhängersteuerventil, „Reißt die Bremsleitung ab …“),
   amtliche Theoriefragen 2.7.02-302 und 2.7.06-317, Serbands Dropbox-Folien CE (F. 116–120 „Gelb reißt“). Belege und Grenzen: Vault, Faktenblatt Film 6.2.
   Die Fahrt im Bild ist ein Rechenbeispiel (kern/modell.js: abrissFahrt) in Zeitlupe; Geschwindigkeiten und Wege stehen nicht im Bild. Keine Dauer der selbsttätigen Bremsung (keine Quelle nennt eine). */
window.FILM_TEXT = {
  film: "lkw-f6-2",
  poster: 70,
  de: {
    titel: "Abreißen der Kupplung",
    ui_ueber: "Überblick: Wenn die Kupplung abreißt",
    ui_intro: "Ein kurzer Film ohne Ton: Alles steht als Text im Bild. Du kannst jederzeit anhalten oder ein Kapitel wählen.",
    ui_start: "Film starten", ui_pause: "Anhalten", ui_weiter: "Weiter", ui_neu: "Von vorn", ui_kapitel: "Kapitel", ui_lesen: "Den ganzen Text lesen",

    k1_kicker: "Die Fahrt", k1_titel: "Die Kupplung reißt", k1_sub: "Zeitlupe: Lastzug mit Anhänger.",
    k1_p1: "Der Lastzug fährt mit Anhänger.",
    k1_p2: "Plötzlich reißt die Kupplung. Die Luftleitungen reißen mit ab.",
    k1_p3: "Die rote Leitung ist offen: Der Anhänger bremst von selbst.",
    k1_p4: "Die Zugmaschine behält ihre Bremsen.",
    l_zeitlupe: "Zeitlupe", l_riss: "Riss", l_anh_bremst: "Anhänger bremst selbsttätig", l_zug_bremst: "Zugmaschine bremst",

    k2_kicker: "Im Schema", k2_titel: "Was in den Leitungen passiert", k2_sub: "Beide Leitungen reißen ab.",
    k2_p1: "Reißen die Leitungen ab, verliert die rote Leitung ihren Druck.",
    k2_p2: "Das Anhängerbremsventil bremst den Anhänger mit der Luft aus seinem Behälter.",
    k2_p3: "Ein Rückschlagventil hält die Luft im Behälter des Anhängers.",
    k2_p4: "Schutzventile halten den Druck in den Bremskreisen der Zugmaschine.",
    k2_p5: "Wie lange die Bremswirkung hält, hängt vom Luftvorrat im Anhänger ab.",
    l_zug: "Zugmaschine", l_anh: "Anhänger", l_ventil: "Anhängerbremsventil", l_behaelter: "Vorratsbehälter", l_pedal: "Bremspedal", l_selbst: "Bremst selbsttätig", l_voll: "Zugmaschine: Druck bleibt",

    k3_kicker: "Der Sonderfall", k3_titel: "Nur gelb reißt", k3_sub: "Die Bremsleitung ist weg, rot hält.",
    k3_p1: "Reißt nur die gelbe Leitung ab, merkt man beim Fahren nichts.",
    k3_p2: "Erst beim Bremsen fehlt der Gegendruck.",
    k3_p3: "Die Zugmaschine entlüftet dann die rote Leitung und der Anhänger bremst.",
    k3_p4: "Darum nach dem Kuppeln immer die Bremse des Anhängers prüfen.",
    l_gelb_weg: "Gelb abgerissen", l_nichts: "Beim Fahren: nichts zu merken", l_erst_bremsen: "Beim Bremsen: Anhänger bremst",

    k4_kicker: "Merke", k4_titel: "Zum Mitnehmen",
    k4_merk: "Rot reißt: Der Anhänger bremst sofort selbst. Nur gelb reißt: erst beim Bremsen. Die Zugmaschine bleibt bremsfähig."
  },
  kapitel: [
    { id: "k1", titel: "k1_titel", kicker: "k1_kicker", dauer: 52, sub: { k: "k1_sub", t: 0.6 },
      punkte: [{ k: "k1_p1", t: 3.0 }, { k: "k1_p2", t: 9.0 }, { k: "k1_p3", t: 15.0, ref: "WABCO; Theoriefrage 2.7.02-302" }, { k: "k1_p4", t: 22.0, ref: "Theoriefrage 2.7.02-302" }] },
    { id: "k2", titel: "k2_titel", kicker: "k2_kicker", dauer: 66, sub: { k: "k2_sub", t: 0.6 },
      punkte: [{ k: "k2_p1", t: 3.5, ref: "WABCO" }, { k: "k2_p2", t: 11.0, ref: "WABCO; Theoriefrage 2.7.02-302" }, { k: "k2_p3", t: 26.0, ref: "Haldex; Theoriefrage 2.7.02-302" }, { k: "k2_p4", t: 38.0, ref: "WABCO Überströmventil; Theoriefrage 2.7.06-317" }, { k: "k2_p5", t: 52.0 }] },
    { id: "k3", titel: "k3_titel", kicker: "k3_kicker", dauer: 62, sub: { k: "k3_sub", t: 0.6 },
      punkte: [{ k: "k3_p1", t: 3.5, ref: "Folien CE F. 116–120" }, { k: "k3_p2", t: 14.0, ref: "kfz-tech; WABCO" }, { k: "k3_p3", t: 24.0, ref: "Theoriefrage 2.7.06-317; kfz-tech; WABCO Abreißkolben" }, { k: "k3_p4", t: 36.0, ref: "Prüfungsablauf Klasse CE" }] },
    { id: "k4", titel: "k4_titel", kicker: "k4_kicker", dauer: 22, merk: { k: "k4_merk", t: 1.2 } }
  ]
};
