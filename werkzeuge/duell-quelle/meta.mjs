// Quelle des Fragenpools für Spiel 10 „Duell gegen Mitschüler“ (06./07.10.2026): ID, Verkehrszeichen, feste Antworten, rechtliche Quelle.
// Die Texte (Frage, Antworten, Erklärung) stehen je Sprache in werkzeuge/duell-quelle/<sprache>.mjs.
//
//   id        q01 … : darf NIE umnummeriert oder gelöscht werden (laufende Duelle verweisen darauf); neue Fragen = neue IDs am Ende
//   bild      amtliches Verkehrszeichen aus verkehr/vorfahrt-zeichen/ (Schlüssel von spiele/schilder.js) oder null
//   a         (optional) Antworten, die in allen Sprachen gleich sind (Zahlen mit Einheit); {,} wird je Sprache zu Komma oder Punkt.
//             Ohne `a` stehen die drei Antworten in den Sprachdateien.
//
// DIE LÖSUNG (Nummer der richtigen Antwort 0, 1 oder 2) STEHT BEWUSST NICHT HIER und nirgends im Repo: das Repo ist öffentlich (GitHub Pages).
// Sie liegt im privaten Schlüssel /home/user/duell-private/loesungen.json (siehe werkzeuge/duell-schluessel.mjs, docs/PROJEKTGEDAECHTNIS.md, Abschnitt Spiele)
// und in der Datenbank-Tabelle academy_duell_loesungen (db/duell-2.sql). werkzeuge/duell-loesungen-erzeugen.mjs erzeugt aus Quelle + Schlüssel
// spiele/duell-fragen.js (ohne Lösung) und die privaten INSERTs.
//
// Fachliche Grundlage: Alle Antworten sind gesichert (Gesetzestext auf gesetze-im-internet.de, Stand 07.10.2026 abgerufen), keine Bußgelder,
// nichts mit regional oder zeitlich unsicherer Antwort. Die Quelle steht je Frage im Kommentar (StVO = Straßenverkehrs-Ordnung, StVG = Straßenverkehrsgesetz,
// „Anlage 1“ = Gefahrzeichen, „Anlage 2“ = Vorschriftzeichen, „Anlage 3“ = Richtzeichen der StVO). Faustformeln wie im Ampel-Bremsweg-Spiel.
export const META = [
  { id: "q01", bild: "z206" },   // Halt! Vorfahrt gewähren: anhalten (§ 8 Abs. 1, Anlage 2 Zeichen 206)
  { id: "q02", bild: "z205" },   // Vorfahrt gewähren (§ 8 Abs. 1, Anlage 2 Zeichen 205)
  { id: "q03", bild: "z306" },   // Vorfahrtstraße (Anlage 3 lfd. Nr. 2, Zeichen 306)
  { id: "q04", bild: "z267" },   // Verbot der Einfahrt (Anlage 2 Zeichen 267)
  { id: "q05", bild: "z283" },   // Absolutes Haltverbot (Anlage 2 Zeichen 283)
  { id: "q06", bild: "z286" },   // Eingeschränktes Haltverbot (Anlage 2 Zeichen 286; § 12 Abs. 2: wer länger als 3 Minuten hält, parkt)
  { id: "q07", bild: "z2741" },  // Tempo-30-Zone (Anlage 2 lfd. Nr. 50, Zeichen 274.1)
  { id: "q08", bild: "z215" },   // Kreisverkehr (§ 8 Abs. 1a, Anlage 2 Zeichen 215)
  { id: "q09", bild: "z220" },   // Einbahnstraße (Anlage 2 lfd. Nr. 9, Zeichen 220)
  { id: "q10", bild: "z350" },   // Fußgängerüberweg (§ 26 Abs. 1, Anlage 3 Zeichen 350)
  { id: "q11", bild: "z101" },   // Gefahrstelle (Anlage 1 lfd. Nr. 1, Zeichen 101)
  { id: "q12", bild: "z237" },   // Radweg (Anlage 2 lfd. Nr. 16, Zeichen 237)
  { id: "q13", bild: "z250" },   // Verbot für Fahrzeuge aller Art (Anlage 2 Zeichen 250)
  { id: "q14", bild: "z282" },   // Ende sämtlicher Streckenverbote (Anlage 2 lfd. Nr. 60, Zeichen 282)
  { id: "q15", bild: null, a: ["30 km/h", "50 km/h", "60 km/h"] },          // innerorts (§ 3 Abs. 3 Nr. 1)
  { id: "q16", bild: null, a: ["100 km/h", "120 km/h", "130 km/h"] },       // außerorts Pkw (§ 3 Abs. 3 Nr. 2 Buchst. c)
  { id: "q17", bild: null, a: ["80 km/h", "100 km/h", "130 km/h"] },        // Richtgeschwindigkeit Autobahn (Autobahn-Richtgeschwindigkeits-Verordnung: 130 km/h)
  { id: "q18", bild: null },     // rechts vor links (§ 8 Abs. 1)
  { id: "q19", bild: null },     // Handy (§ 23 Abs. 1a)
  { id: "q20", bild: null },     // Gurt (§ 21a Abs. 1)
  { id: "q21", bild: null },     // Kinder (§ 21 Abs. 1a)
  { id: "q22", bild: null },     // Alkohol und Cannabis in der Probezeit / unter 21 (§ 24c StVG: Alkohol UND Tetrahydrocannabinol)
  { id: "q23", bild: null },     // Probezeit Dauer (§ 2a StVG: 2 Jahre)
  { id: "q24", bild: null },     // Abstand (§ 4 Abs. 1)
  { id: "q25", bild: null, a: ["25 m", "40 m", "50 m"] },                   // Bremsweg 50 km/h (Faustformel (v/10)²)
  { id: "q26", bild: null },     // doppeltes Tempo -> vierfacher Bremsweg (Faustformel)
  { id: "q27", bild: null, a: ["5 m", "15 m", "25 m"] },                    // Reaktionsweg 50 km/h (Faustformel (v/10)·3)
  { id: "q28", bild: null },     // Überholen vor unübersichtlicher Kurve verboten (§ 5 Abs. 2)
  { id: "q29", bild: null, a: ["0{,}5 m", "1 m", "1{,}5 m"] },              // Radfahrer überholen innerorts (§ 5 Abs. 4: mindestens 1,5 m)
  { id: "q30", bild: null, a: ["2 m", "5 m", "15 m"] },                     // Parken vor Kreuzungen: bis zu 5 m (8 m bei baulich angelegtem Radweg rechts) (§ 12 Abs. 3 Nr. 1); die 15 m gehören zur Haltestelle, nicht zur Kreuzung
  { id: "q31", bild: null, a: ["15 m", "30 m", "50 m"] },                   // Haltestelle: Parken bis 15 m vor und hinter Zeichen 224 verboten (Anlage 2 lfd. Nr. 14)
  { id: "q32", bild: null },     // Rettungsgasse (§ 11 Abs. 2)
  { id: "q33", bild: null },     // Blaulicht mit Einsatzhorn (§ 38 Abs. 1)
  { id: "q34", bild: null },     // Gelb (§ 37 Abs. 2 Nr. 1)
  { id: "q35", bild: null },     // Grünpfeil: erst anhalten, dann abbiegen, wenn niemand gefährdet oder behindert wird; Warten bis Grün ist erlaubt, aber nicht Pflicht (§ 37 Abs. 2 Nr. 1)
  { id: "q36", bild: null },     // Polizist vor Ampel (§ 36 Abs. 1)
  { id: "q37", bild: null },     // Abbiegen: Fußgänger durchlassen (§ 9 Abs. 3)
  { id: "q38", bild: null },     // Linksabbiegen: Gegenverkehr (§ 9 Abs. 3)
  { id: "q39", bild: null },     // Autobahn: Vorfahrt der durchgehenden Fahrbahn (§ 18 Abs. 3)
  { id: "q40", bild: null, a: ["≈ 10 m", "≈ 100 m", "≈ 1000 m"] },          // Warndreieck außerorts (§ 15: bei schnellem Verkehr in etwa 100 m Entfernung; Richtwerte der Verwaltungsvorschrift zu § 15)
  { id: "q41", bild: null },     // verkehrsberuhigter Bereich (Anlage 3 lfd. Nr. 12, Zeichen 325.1: Schrittgeschwindigkeit)
  { id: "q42", bild: null },     // Anfahren vom Fahrbahnrand (§ 10)
  { id: "q43", bild: null },     // Winterreifenpflicht (§ 2 Abs. 3a)
  { id: "q44", bild: null, a: ["150 m", "100 m", "50 m"] },                 // Nebelschlussleuchte (§ 17 Abs. 3: Sichtweite unter 50 m)
  // ---- 07.10.2026: neue Fragen (Pool von 44 auf 60) ----
  { id: "q45", bild: "z276" },   // Überholverbot für Kraftfahrzeuge aller Art (Anlage 2 lfd. Nr. 53, Zeichen 276; Zeichen 277 gilt nur für Kfz über 3,5 t)
  { id: "q46", bild: "z301" },   // Vorfahrt: an der nächsten Kreuzung/Einmündung (Anlage 3 lfd. Nr. 1, Zeichen 301); Zeichen 306 gilt über mehrere Kreuzungen (lfd. Nr. 2)
  { id: "q47", bild: "z239" },   // Gehweg: nur Fußgänger (Anlage 2 lfd. Nr. 18, Zeichen 239)
  { id: "q48", bild: "z222" },   // Rechts vorbei (Anlage 2 lfd. Nr. 10, Zeichen 222: vorgeschriebene Vorbeifahrt)
  { id: "q49", bild: "z209" },   // Vorgeschriebene Fahrtrichtung rechts (Anlage 2 lfd. Nr. 5, Zeichen 209: der vorgeschriebenen Fahrtrichtung folgen)
  { id: "q50", bild: "z136" },   // Kinder (Anlage 1 lfd. Nr. 17, Zeichen 136; § 3 Abs. 2a: gegenüber Kindern Geschwindigkeit vermindern, bremsbereit sein; kein Vorrang, kein Haltegebot)
  { id: "q51", bild: null },     // Kreisverkehr (Zeichen 215 unter 205): beim Einfahren ist der Fahrtrichtungsanzeiger unzulässig (§ 8 Abs. 1a)
  { id: "q52", bild: null, a: ["50–100 m", "150–250 m", "500–600 m"] },     // Gefahrzeichen außerorts im Allgemeinen 150 bis 250 m vor der Gefahrstelle (§ 40 Abs. 2)
  { id: "q53", bild: null, a: ["10 m", "5 m", "20 m"] },                    // bis zu 10 m vor einem Lichtzeichen nicht halten, wenn es dadurch verdeckt wird (§ 37 Abs. 1)
  { id: "q54", bild: null, a: ["30 km/h", "50 km/h", "80 km/h"] },          // Sichtweite unter 50 m durch Nebel, Schneefall, Regen: höchstens 50 km/h (§ 3 Abs. 1)
  { id: "q55", bild: null },     // an Fußgängerüberwegen darf nicht überholt werden (§ 26 Abs. 3)
  { id: "q56", bild: null },     // stockender Verkehr: trotz Grün nicht in die Kreuzung einfahren, wenn dort gewartet werden müsste (§ 11 Abs. 1)
  { id: "q57", bild: null },     // Rechtsfahrgebot: möglichst weit rechts, nicht nur bei Gegenverkehr (§ 2 Abs. 2)
  { id: "q58", bild: null },     // Halten unzulässig an engen und unübersichtlichen Straßenstellen (§ 12 Abs. 1 Nr. 1)
  { id: "q59", bild: null },     // Rechtsabbiegen: rechtzeitig möglichst weit rechts einordnen (§ 9 Abs. 1)
  { id: "q60", bild: null },     // Straße mit durchgehender, ausreichender Beleuchtung: Abblendlicht, nicht Standlicht allein, nicht Fernlicht (§ 17 Abs. 2)
];
export const SPRACHEN = ["de", "tr", "en", "ar", "es", "ru", "sr", "ckb", "kmr", "hi", "ur", "vi", "rif", "fa", "ps", "el", "am", "ti"];
export const KOMMA = ["de", "tr", "es", "ru", "sr", "vi", "el", "kmr", "rif"];   // wie rahmen.js
