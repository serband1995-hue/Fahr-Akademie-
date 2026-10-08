# Erklärfilme „Lkw und Zug verstehen“ (Klasse C und CE)

Motion-Graphics aus Code (kein KI-Bild, 0 Credits), Text im Bild, keine Stimme. Aufbau und Look wie der Film „Vorfahrt“ (`film/vorfahrt/`).
Plan, Fakten und Entscheidungen: Obsidian-Vault, Notizen *Plan Bereich Klasse C und CE* und *Film 5.1 Schleppkurven – Faktenblatt*.

**Der Unterschied zu „Vorfahrt“:** Hier ist nichts von Hand animiert. Alle Fahrbewegungen kommen aus einem **Rechenmodell** (Kinematik), die Zeichnung ist eine reine Funktion von Modell und Zeit. Falsche Lenkrichtung oder zu enge Kurven sind dadurch nicht möglich, und über 15 Tests prüfen das Modell gegen Handrechnung und Gesetz.

## Ordner
| Pfad | Zweck |
|---|---|
| `kern/modell.js` | Rechenmodell: Bahn der Vorderachse, Verfolgerkette für Hinterachse, Kupplungspunkt, Anhänger/Auflieger; Beispielfahrzeuge; Messungen (Ringbreite, Überschnitt, Längen). Läuft im Browser und in Node |
| `kern/baukasten.js` | Zeichnen: Bühne (Raster, Maßstabsbalken), Fahrzeuge in Draufsicht (Blinker nur rechts, Bremslicht nur beim Bremsen, Vorderräder folgen der Bewegung), Spuren, Gefahrenbereich, Fläche, Pillen, Maßpfeile |
| `kern/seite.js`, `kern/zeit.js` | Seitenansicht (Straße, Lkw, Bus, Pkw, Maßklammer) und Zeitbilder (24-Stunden-Leiste, Messer, Wochenkalender) |
| `kern/panel.js` | Text-Feld (Titel, Sätze, Merksatz) und Ein-/Ausblenden, gemeinsam für alle Filme |
| `kern/host.js`, `kern/app.css` | App-Teil: Abspielen, Regler, Kapitelknöpfe, Sprache, RTL, Text zum Lesen (aus „Vorfahrt“ übernommen, Klassen `lk-…`) |
| `kern/buehne.css` | Aussehen der Bühne und des Text-Felds (MP4 und App gemeinsam) |
| `f5-2/`, `f5-4/`, `f8-1/` | Filme Toter Winkel, Abstand, Lenk- und Ruhezeiten (gleicher Aufbau wie `f5-1/`) |
| `f5-1/` | Film 5.1: `text.js` (Text und Zeiten), `szenen.js`, `index.html` (MP4-Layout 1920×1080), `sprachen/` (kommt nach der Freigabe des deutschen Textes) |
| `test/modell.test.mjs` | Tests des Rechenmodells (Handrechnung, Gesetz, Gegenproben) |
| `bauen.mjs` | `node film/lkw/bauen.mjs f5-1` → `verkehr/lkw-f5-1.js` (nicht von Hand ändern) |
| `render.mjs` | MP4 (stumm) rendern, ca. 25 Minuten für 3:50 |
| `pruefe-lesezeit.mjs` | Lesezeit und Vollständigkeit der Übersetzungen |

## Befehle
```bash
node --test film/lkw/test/modell.test.mjs                          # Rechenmodell prüfen
node film/lkw/pruefe-lesezeit.mjs f5-1                             # Lesezeit prüfen
node film/lkw/bauen.mjs f5-1                                       # App-Datei erzeugen
PLAYWRIGHT_PATH=/pfad/zu/playwright/index.mjs node film/lkw/render.mjs f5-1 /tmp/f5-1.mp4   # MP4
```
Ansehen ohne App: `verkehr/lkw-vorschau.html` (nicht in der App verlinkt, `?sprache=en` wählt die Sprache).

## Pflichtregeln für jeden neuen Film
1. Zuerst das **Faktenblatt** im Vault, dann Text, dann zwei unabhängige Prüfer gegen Primärquellen.
2. Fahrzeugbewegung **nur aus `modell.js`**. Neue Fahrzeugart = neuer Eintrag in `FAHRZEUGE` plus Test (Längen, Radien).
3. Logik je Bild: Rechtsverkehr, Fahrerseite links, Blinker passend, Bremslicht nur beim Bremsen, Druckluft gelb = Bremsleitung, rot = Vorratsleitung.
4. Keine Zahl im Bild, die nicht belegt ist. Beispielwerte als „Beispiel“ kennzeichnen.
5. Text nur über `text.js` (Schlüssel). **Lkw-Filme nur in 4 Sprachen** (Entscheidung Serban 08.10.2026): Deutsch, Englisch, Türkisch, Serbisch (`sprachen/en.json`, `tr.json`, `sr.json`, Rückübersetzung durch zweiten Prüfer, Muttersprachler-Gegenlesen offen). Stimmen kommen später in einer eigenen Sitzung (nichts jetzt generieren).
6. Handy 360/412 px und quer: nichts abgeschnitten, nichts seitlich wischbar (`scrollWidth = clientWidth`).
