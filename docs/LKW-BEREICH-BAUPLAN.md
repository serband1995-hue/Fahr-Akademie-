# Bauplan Lkw-Bereich (11.10.2026)

Auftrag Serban: Lkw-Bereich streng getrennt vom Pkw-Bereich, in derselben App. Pkw-Schüler kommt ohne
Zugang nicht in Lkw, Lkw-Schüler nicht in Pkw. Wer nur Lkw kauft, bekommt nur Lkw. Lkw-Technikvideos
von Anfang an frei, der Rest gesperrt (auch später Hochgeladenes). Gleiches Design wie Pkw (Kacheln,
Wischen, Weg), aber mit Lkw-Symbolen. Spiele, Nützliches, Rechtliches, Hilfe für alle.
Entscheidungen Serban: ein Schüler darf BEIDE haben (Umschalter). Lkw-Vollzugang = eigener Verkauf, 110 EUR.
Klassen A und D: nichts dafür bauen (bleiben wie heute = Pkw).

## Datenbank (Datei db/lkw-bereich.sql – wird vom Hauptagenten eingespielt)
- `academy_tags.fahrzeug` text: 'pkw' | 'lkw' | 'alle' (Standard 'pkw').
- `academy_schueler.zugang_pkw`, `zugang_lkw` (boolean, NOT NULL, mindestens einer true),
  `vollzugang_lkw` (boolean, Standard false), `verkaufspreis_lkw` (numeric, optional).
  Das alte `vollzugang` = Pkw-Vollzugang. Ein Trigger setzt beim Anlegen zugang_* aus der Klasse
  (C, CE, C1, C1E -> nur Lkw, sonst nur Pkw) und erzwingt: vollzugang -> zugang_pkw, vollzugang_lkw -> zugang_lkw.
- Lkw-Bereiche (Feld `stufe`, beginnt immer mit "Lkw: "):
  `STUFEN_LKW = ["Lkw: Fahrzeug & Technik","Lkw: Kuppeln & Rangieren","Lkw: Fahren im Verkehr","Lkw: Lenk- und Ruhezeiten","Lkw: Prüfung"]`
  Themen in "Lkw: Fahrzeug & Technik" sind gratis.
- Erste Lkw-Themen (ids): lkw_abfahrtkontrolle, lkw_druckluftbremse, lkw_technik, lkw_kuppeln, lkw_rangieren,
  lkw_toter_winkel, lkw_abstand, lkw_lenkzeiten, lkw_fahrtenschreiber, lkw_pruefungsfahrt.
- Einstellung `preis_lkw` = 110. Lkw-Verkauf bucht ein Trigger (Notiz beginnt mit "Lkw-Vollzugang").

## Die eine Regel (Server UND App müssen exakt gleich rechnen)
Fahrzeuge eines Videos = Menge der `fahrzeug`-Werte seiner NICHT archivierten Themen.
Ein Video ohne (nicht archivierte) Themen zählt als 'pkw'. 'alle' passt zu pkw und lkw.
Erlaubte Fahrzeuge des Schülers E = {pkw falls zugang_pkw} ∪ {lkw falls zugang_lkw}
(fehlt das Feld, z. B. alter Datensatz: zugang_pkw gilt als true, zugang_lkw als false).

1. Sichtbar/abspielbar überhaupt nur, wenn das Video mindestens ein Thema mit fahrzeug in E oder 'alle' hat
   (bzw. ohne Themen und pkw ∈ E). Sonst Ablehnung, Code `fahrzeug_nicht_freigegeben` (HTTP 403). Dieser Code
   führt in der App NICHT zur Abmeldung.
2. Frei, wenn EINES gilt:
   - Pkw-Vollzugang (vollzugang) und das Video hat ein Pkw- oder Alle-Thema (oder keine Themen) und pkw ∈ E
   - Lkw-Vollzugang (vollzugang_lkw) und das Video hat ein Lkw- oder Alle-Thema und lkw ∈ E
   - video.gratis (Kostprobe)
   - eines seiner erlaubten Themen (fahrzeug in E oder 'alle') ist gratis
   - persönliche Freischaltung: Einzelvideo, oder Paket mit einem Bereich (stufe) eines erlaubten Themas
   Sonst `vollzugang_erforderlich` (402) wie bisher.

## App-Grundidee
- Aktives Fahrzeug `aktivesFahrzeug()` = 'pkw' oder 'lkw' (localStorage `academy_fahrzeug`, nur erlaubte Werte;
  Standard: erstes erlaubtes, Pkw zuerst). Vorschau der Verwaltung und Demo-Modus: beide erlaubt.
- Nach dem Laden des Katalogs werden `allTags`, `allVideos`, `videoTags` auf das aktive Fahrzeug gefiltert
  (Themen: fahrzeug == aktiv oder 'alle'; Videos: die mindestens ein solches Thema haben, ohne Themen nur bei pkw).
  Die ungefilterten Listen bleiben für die Freigabe-Rechnung erhalten. `STUFEN_ORDER` zeigt die Bereiche des
  aktiven Fahrzeugs. So zeigen Start, Weg, Kacheln, Menü, Themen, Suche, Strecken automatisch nur ein Fahrzeug.
- Umschalter Pkw/Lkw oben in der Kopfleiste, nur wenn beide erlaubt; sonst kleines festes Schild "Pkw" bzw. "Lkw".
- Lkw-Ansicht: Kacheln und Weg mit Lkw statt Auto. „Verkehr verstehen“ zeigt bei Lkw nur die Lkw-Erklärfilme
  (LKW_FILME), bei Pkw nur die 3D-Szenen und den Vorfahrt-Film. Lkw-Filme sieht nur, wer Lkw-Zugang hat.
- Vollzugang-Anzeigen (Krone, Werbekarte, „Zugang anfragen“) richten sich nach dem aktiven Fahrzeug.
- Alles, was Schüler sehen, in allen 18 Sprachen über t("…"). Verwaltung bleibt Deutsch.
- Handy zuerst: 360–412 px und quer, nichts abgeschnitten, nichts scrollt seitlich.
