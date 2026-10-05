# Erklärfilm „Vorfahrt – wer fährt zuerst?“

Motion-Graphics-Film aus Code (kein KI-Bild, keine Credits). Gebaut mit [HyperFrames](https://github.com/heygen-com/hyperframes)
(Open Source, lokal, ohne Konto). Plan und Entscheidungen: Obsidian-Vault, Notiz *Fahr-Akademie – Plan Erklärfilm Vorfahrt*.

## Dateien
| Datei | Zweck |
|---|---|
| `text.js` | **Eine Quelle** für Bildschirmtext, Sprechertext und Untertitel (Deutsch) samt Zeiten |
| `baukasten.js` | Bausteine: Kreuzung, Autos (Blinker, Bremslicht), Schilder, Polizist, Ampel, Bewegungs-Hilfen |
| `index.html` | Der Film: 6 Kapitel auf einer Zeitleiste (GSAP), 1920×1080, 30 fps, ca. 3:17 |
| `export-text.mjs` | `node export-text.mjs` → `out/untertitel-de.vtt` und `out/sprechertext-de.txt` |
| `assets/zeichen/` | Amtliche Verkehrszeichen (Wikimedia Commons, gemeinfrei), siehe unten |
| `assets/fonts/`, `assets/lib/` | Playfair Display, Barlow (OFL) und GSAP, lokal damit nichts aus dem Netz geladen wird |
| `out/` | Ergebnisse (MP4, Standbild, Untertitel) |

## Bauen
```bash
cd film/vorfahrt
npx hyperframes lint                # Prüfung
npx hyperframes snapshot . --at 10,55,120   # Standbilder zur Sichtprüfung
npx hyperframes render . -q standard -o out/vorfahrt-de-stumm.mp4   # ca. 3–4 Minuten
node export-text.mjs                # Untertitel + Sprechertext
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
- **Stimme:** noch nicht eingesprochen (erst nach Freigabe des Textes, einmal, Stimme „Julian“). Die Zeiten in `text.js` sind auf ca. 2,1 Wörter pro Sekunde ausgelegt.
- **In-App-Fassung** (18 Sprachen aus `t()`): kommt nach Freigabe des MP4.
- **Bunny-Upload / Eintrag in der Akademie:** nur auf ausdrückliche Anweisung (keine Schreibzugriffe auf die Akademie-Datenbank aus dieser Arbeit).
