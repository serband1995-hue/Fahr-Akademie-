# Erklärfilm „Vorfahrt – wer fährt zuerst?“

Motion-Graphics-Film aus Code (kein KI-Bild, keine Credits). Gebaut mit [HyperFrames](https://github.com/heygen-com/hyperframes)
(Open Source, lokal, ohne Konto). Plan und Entscheidungen: Obsidian-Vault, Notiz *Fahr-Akademie – Plan Erklärfilm Vorfahrt*.

## Dateien
| Datei | Zweck |
|---|---|
| `text.js` | **Eine Quelle** für allen Text (Deutsch, mit Schlüsseln) und alle Zeiten. Keine Stimme: alles steht im Bild |
| `szenen.js` | Die sechs Kapitel (Bewegung, Text-Einblendung). Gemeinsam für MP4 und App |
| `baukasten.js` | Bausteine: Kreuzung, Autos, Schilder, Polizist, Ampel, Bewegungs-Hilfen |
| `buehne.css` | Aussehen der Bühne (gemeinsam) |
| `index.html` | MP4-Fassung (HyperFrames): Bild links, Text rechts, 1920×1080 |
| `app-host.js`, `app.css` | App-Fassung: Bild oben, Text darunter, Steuerung, 18 Sprachen |
| `app-bauen.mjs` | `node app-bauen.mjs` → erzeugt `../../verkehr/vorfahrt-film.js` (nicht von Hand ändern) und kopiert die Zeichen |
| `sprachen/<code>.json` | Übersetzungen (gleiche Schlüssel wie `text.js`), kommen nach der Freigabe des deutschen Textes |
| `assets/` | Zeichen (Wikimedia, gemeinfrei), Schriften, GSAP (in der App: `vendor/gsap-3.14.2.min.js`) |

## Bauen
```bash
cd film/vorfahrt
npx hyperframes lint                # Prüfung
npx hyperframes snapshot . --at 10,55,120   # Standbilder zur Sichtprüfung
npx hyperframes render . -q standard -o out/vorfahrt-de-stumm.mp4   # ca. 3–4 Minuten
node app-bauen.mjs                  # App-Datei neu erzeugen (nach jeder Änderung an Text/Szenen)
```
Voraussetzungen: Node 22, FFmpeg, Chrome Headless Shell (`npx hyperframes browser ensure`).
Telemetrie aus: `HYPERFRAMES_NO_TELEMETRY=1`.

## Aufbau der Szenen
Bühne 1080×1080 (Draufsicht, Norden oben, Rechtsverkehr), rechts ein Textfeld. Spuren: Ost-fahrend y=595, West-fahrend y=485,
Nord-fahrend x=595, Süd-fahrend x=485; Kreuzungsfeld x/y 430–650. Drehung: Ost 0°, Süd 90°, West 180°, Nord −90°.
Neue Szene = neue Funktion in `index.html` (aus Bausteinen), Text in `text.js` ergänzen. Nichts davon liest die große `index.html` der App.

## Fachliche Grundlage (geprüft am 05.10.2026, gesetze-im-internet.de, StVO)
§ 8 Abs. 1, 1a, 2 · § 9 Abs. 1, 3, 4 · § 10 · § 36 Abs. 1, 2 · § 37 Abs. 1 · § 45 Abs. 1c.
Zweiter, unabhängiger Durchlauf: Aussagen und Szenenlogik gegen die Gesetzestexte; Korrekturen sind in `text.js` eingearbeitet
(„hat Vorfahrt“ statt „fährt zuerst“, „niemanden behindern oder gefährden“ statt „Kreuzung frei“, Linksabbieger-Merksatz).

## Verkehrszeichen (alle gemeinfrei, Wikimedia Commons)
- Zeichen 205 – Vorfahrt gewähren (StVO 1970), Zeichen 206 – Halt! Vorfahrt gewähren! (StVO 2017)
- Zeichen 274.1 – Beginn einer Tempo 30-Zone (StVO 2013)
- Zeichen 306 – Vorfahrtstraße (StVO 1970), falls vorhanden in `assets/zeichen/`

## Offen / bewusst noch nicht gemacht
- Deutscher Text wartet auf Freigabe durch Serban; danach 17 Sprachen (`sprachen/*.json`), dann MP4 neu rendern.
- Bunny-Upload / Eintrag in der Akademie: nur auf ausdrückliche Anweisung (keine Schreibzugriffe auf die Datenbank aus dieser Arbeit).
