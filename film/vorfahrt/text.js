/* Eine Quelle für Bildschirmtext, Sprechertext und Untertitel (Deutsch).
   Fachgrundlage: StVO, geprüft am 05.10.2026 gegen gesetze-im-internet.de (stvo_2013):
   § 8 Abs. 1, 1a, 2 · § 9 Abs. 1, 3, 4 · § 10 · § 36 Abs. 1, 2 · § 37 Abs. 1 · § 45 Abs. 1c.
   t = Sekunden ab Kapitelanfang. Sprechertext ist noch NICHT eingesprochen (Stimme erst nach Freigabe). */
window.FILM_TEXT = {
  titel: "Vorfahrt – wer fährt zuerst?",
  merksatz: "Was höher steht, gewinnt.",
  kapitel: [
    { id: "k1", dauer: 18, kicker: "Die Frage", titel: "Wer fährt zuerst?",
      untertitel: "Drei Autos. Keine Ampel. Keine Schilder.",
      punkte: [{ t: 12.5, text: "Gleich wissen wir es.", stil: "gold" }],
      sprecher: [
        { t: 1.0, text: "Eine Kreuzung. Keine Ampel, keine Schilder." },
        { t: 4.5, text: "Drei Autos kommen an – und alle wollen geradeaus." },
        { t: 9.0, text: "Wer fährt zuerst?" },
        { t: 11.5, text: "Das klären wir gleich. Dafür brauchst du nur eine Idee: die Vorfahrtspyramide." }
      ] },
    { id: "k2", dauer: 39, kicker: "1 · Die Ordnung", titel: "Die Vorfahrtspyramide",
      stufen: [
        { t: 3.4, nr: "1", name: "Polizei", text: "Zeichen und Weisungen der Polizei gehen allen anderen Regeln vor.", ref: "§ 36 Abs. 1 StVO" },
        { t: 11.0, nr: "2", name: "Ampel", text: "Lichtzeichen gehen Vorfahrtschildern und rechts vor links vor.", ref: "§ 37 Abs. 1 StVO" },
        { t: 18.0, nr: "3", name: "Schilder", text: "Vorfahrt gewähren, Halt, Vorfahrtstraße: Sie heben rechts vor links auf.", ref: "§ 8 Abs. 1 StVO · z. B. Zeichen 205, 206, 306" },
        { t: 25.5, nr: "4", name: "Rechts vor links", text: "Gibt es nichts Höheres: Wer von rechts kommt, hat Vorfahrt.", ref: "§ 8 Abs. 1 Satz 1 StVO" }
      ],
      merk: { t: 34.0, text: "Was höher steht, gewinnt." },
      sprecher: [
        { t: 0.6, text: "Stell dir eine Pyramide vor." },
        { t: 3.4, text: "Ganz oben steht die Polizei. Ihre Zeichen und Weisungen gehen allen anderen Regeln vor." },
        { t: 11.0, text: "Darunter die Ampel: Lichtzeichen gehen den Vorfahrtschildern und rechts vor links vor." },
        { t: 18.0, text: "Dann die Schilder: Vorfahrt gewähren, Halt und die Vorfahrtstraße." },
        { t: 25.5, text: "Und ganz unten, die Grundlage: rechts vor links. Sie gilt, wenn nichts Höheres etwas anderes sagt." },
        { t: 34.0, text: "Merk dir: Was höher steht, gewinnt." }
      ] },
    { id: "k3", dauer: 40, kicker: "2 · Rechts vor links", titel: "Rechts vor links",
      punkte: [
        { t: 2.0, text: "Wer von rechts kommt, hat Vorfahrt.", ref: "§ 8 Abs. 1 StVO" },
        { t: 15.0, text: "Wer warten muss, wird früh langsamer. So sieht man: Ich warte.", ref: "§ 8 Abs. 2 StVO" },
        { t: 26.0, text: "Erst schauen, dann fahren: Wer Vorfahrt hat, darf nicht behindert werden.", ref: "§ 8 Abs. 2 StVO" }
      ],
      merk: { t: 34.5, text: "Gilt an Kreuzungen und Einmündungen – wenn nichts Höheres dagegen steht." },
      sprecher: [
        { t: 1.0, text: "Rechts vor links. An Kreuzungen und Einmündungen ohne Schilder und Ampel hat Vorfahrt, wer von rechts kommt." },
        { t: 9.6, text: "Das goldene Auto kommt von rechts – es fährt zuerst." },
        { t: 15.0, text: "Wer warten muss, wird früh langsamer. So sieht jeder: Ich warte." },
        { t: 21.0, text: "Dasselbe von der anderen Seite." },
        { t: 26.0, text: "Du schaust nach rechts und fährst erst, wenn du niemanden behinderst oder gefährdest." }
      ] },
    { id: "k4", dauer: 41, kicker: "3 · Gegenverkehr", titel: "Links abbiegen",
      punkte: [
        { t: 1.0, text: "Rechtzeitig blinken, zur Mitte einordnen, nach hinten schauen.", ref: "§ 9 Abs. 1 StVO" },
        { t: 10.4, text: "Gegenverkehr geradeaus: durchlassen.", ref: "§ 9 Abs. 3 StVO" },
        { t: 16.8, text: "Auch Gegenverkehr, der rechts abbiegt.", ref: "§ 9 Abs. 4 StVO" },
        { t: 27.5, text: "Zwei Linksabbieger von gegenüber: in der Regel voreinander.", ref: "§ 9 Abs. 4 StVO" }
      ],
      merk: { t: 36.5, text: "Linksabbieger lassen den Gegenverkehr durch." },
      sprecher: [
        { t: 1.0, text: "Jetzt links abbiegen. Du blinkst rechtzeitig, ordnest dich zur Mitte ein und achtest auf den Verkehr hinter dir." },
        { t: 10.4, text: "Dann gilt: Der Gegenverkehr fährt zuerst. Erst das Auto, das geradeaus fährt," },
        { t: 16.8, text: "und auch das Auto von gegenüber, das rechts abbiegt." },
        { t: 22.0, text: "Erst wenn du niemanden behinderst oder gefährdest, biegst du ab." },
        { t: 27.5, text: "Biegen zwei Fahrzeuge von gegenüber beide links ab, fahren sie in der Regel voreinander ab." }
      ] },
    { id: "k5", dauer: 29, kicker: "4 · Tempo 30", titel: "Die 30er-Zone",
      punkte: [
        { t: 1.5, text: "Schild 274.1: Hier beginnt die Tempo-30-Zone.", ref: "Zeichen 274.1" },
        { t: 7.6, text: "An Kreuzungen gilt grundsätzlich rechts vor links.", ref: "§ 8 Abs. 1 · § 45 Abs. 1c StVO" },
        { t: 14.8, text: "Sicht verdeckt? Langsam hineintasten – bis du alles übersiehst.", ref: "§ 8 Abs. 2 StVO" }
      ],
      merk: { t: 23.4, text: "Wer von rechts kommt, hat Vorfahrt." },
      sprecher: [
        { t: 1.0, text: "Die Tempo-30-Zone. Das Schild sagt dir: Hier darfst du höchstens 30 fahren." },
        { t: 7.6, text: "An Kreuzungen gilt in der Zone grundsätzlich rechts vor links – meistens ohne Vorfahrtschilder." },
        { t: 14.8, text: "Parkende Autos nehmen die Sicht? Dann tastest du dich langsam hinein, bis du alles übersehen kannst." },
        { t: 23.4, text: "Wer von rechts kommt, hat Vorfahrt." }
      ] },
    { id: "k6", dauer: 30, kicker: "Zum Schluss", titel: "Zurück zur Frage",
      punkte: [
        { t: 3.4, text: "Das rechte Auto fährt zuerst: Von rechts kommt niemand.", gruppe: "a" },
        { t: 9.0, text: "Dann das untere: Sein Nachbar von rechts ist weg.", gruppe: "a" },
        { t: 11.0, text: "Zuletzt das linke Auto.", gruppe: "a" },
        { t: 21.0, text: "Eigene Regeln haben: Kreisverkehr, Grundstücksausfahrt, Feld- und Waldweg.", ref: "§ 8 Abs. 1 Nr. 2, Abs. 1a · § 10 StVO", gruppe: "b" },
        { t: 25.6, text: "Jetzt üben: die 3D-Szenen „Rechts vor links (Tempo-30-Zone)“ und „Linksabbiegen mit Gegenverkehr“.", gruppe: "b", stil: "gold" }
      ],
      merk: { t: 14.6, text: "Was höher steht, gewinnt. Gibt es nichts Höheres: rechts vor links." },
      sprecher: [
        { t: 1.0, text: "Zurück zur Frage." },
        { t: 3.4, text: "Das rechte Auto fährt zuerst. Von rechts kommt niemand." },
        { t: 9.0, text: "Dann das untere. Zuletzt das linke." },
        { t: 14.4, text: "Was höher steht, gewinnt. Gibt es nichts Höheres, gilt rechts vor links." },
        { t: 21.0, text: "Kreisverkehr, Grundstücksausfahrt, Feld- und Waldweg haben eigene Regeln." },
        { t: 25.6, text: "Jetzt üben: Die 3D-Szenen." }
      ] }
  ]
};
