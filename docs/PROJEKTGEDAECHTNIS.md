# Fahr-Akademie — Projektgedächtnis

Vanilla-JS-App (eine `index.html`, ~9.500 Zeilen) für Fahrschüler. Backend:
Supabase-Projekt `fxgljvhpikjcejhghgbp` (eu-central-1). Nutzer teilweise
minderjährig — entsprechend vorsichtig mit Daten umgehen.

## Arbeitsregeln (nicht verhandelbar)

1. **Fertig bauen, dann kontrolliert Serband** (ersetzt seit 02.10.2026 „erst besprechen,
   auf Los warten“): Aufträge komplett durchziehen – bauen, doppelt prüfen, live stellen –
   und am Ende übersichtlich berichten, was gemacht wurde und was er am Video/in der App
   nachsehen sollte. Er kontrolliert in Ruhe und sagt dann, was geändert wird. Rückfragen nur,
   wenn etwas wirklich nicht entscheidbar ist oder unwiderruflich Daten verloren gingen.
2. **Bei Nummernlisten von Serband gilt nur, was er mit "ja" bestätigt.** Was er
   ausdrücklich ablehnt, bleibt ein Nein, ohne Rückfrage.
3. **Immer die echte Live-Datei aus GitHub laden**, nie einer Kopie im
   Projektwissen vertrauen. War zweimal die Fehlerquelle.
4. **Chirurgische Edits (str_replace) statt Neuschriebe**, wo möglich.
5. **Doppelt prüfen ist Pflicht**, nicht Kür. Zwei echte Bugs wurden nur durch
   den zweiten Durchlauf gefunden.
6. **Geheimnisse nicht durch den Chat schleusen.** Secrets bleiben im Supabase
   Vault oder in Umgebungsvariablen.

## Handy zuerst (26.09.2026)

Die Schüler nutzen die App fast ausschließlich auf dem **Handy**; nur Serband
arbeitet am Tablet. Jede Änderung zuerst auf 360–412 px Breite bauen und prüfen:
nichts abgeschnitten, nichts seitlich wischbar, was wie abgehackt wirkt, keine
Knöpfe auf dem Bild, lange Texte (TR/AR) brechen um. Die automatische Prüfung
dafür (Überstand, Abschneiden, Überdeckung, Knopfgrößen) lief für
"Verkehr verstehen" über alle Szenen und Sprachen.

## Sprachen (29.09.2026)

18 Sprachen (02.10.2026): de, tr, en, ar (rtl), es, ru, sr (lateinisch), ckb (Kurdisch Sorani, rtl),
kmr (Kurdisch Kurmancî), hi, ur (rtl), vi, rif (Tarifit wie in Nador, lateinisch) – und seit 02.10.2026 fa (Farsi, rtl,
Anrede شما, auch für Dari-Sprecher), ps (Paschtu, rtl, تاسو), el (Griechisch), am (Amharisch, Ge'ez-Schrift, höflich እርስዎ),
ti (Tigrinya, eritreisch, Ge'ez, höflich ንስኹም; Ampel = መብራህቲ ትራፊክ). Diese fünf stehen im eigenen Block
SPRACHPAKETE2 (index.html/spieler.js) – der erste Block bleibt unberührt. Darija bewusst nicht
(Entscheidung Serband: Marokkaner lesen Hocharabisch). Flaggen: Kurdisch = Kurdistan-Flagge als kleines SVG
(`SPRACHEN[].bild`, kein Emoji vorhanden; `#` im data:-Bild immer als `%23`, sonst lädt es nicht), Tarifit = Marokko 🇲🇦
(Entscheidung Serband, 01.10.2026). Farsi = Löwe-und-Sonne-Flagge (SVG `LOEWE_SONNE_FLAGGE`), Paschtu 🇦🇫, Griechisch 🇬🇷,
Amharisch 🇪🇹, Tigrinya 🇪🇷 (Entscheidung Serband, 02.10.2026). Mehrdeutige Farbwörter beachten: Paschtu شین = grün UND
blau (blau = آبي), Tarifit azegzaw (blau = aziza). Die Texte der acht neuen
Sprachen stehen im Block SPRACHPAKETE in index.html bzw. spieler.js (erzeugt aus geprüften JSON-Dateien);
die LEEREN Einträge `ru:{}` usw. müssen im I18N-Literal stehen, sonst setzt `if(!I18N[sprache])` beim Start
auf Deutsch zurück. Sorani und Tarifit sollten von Muttersprachlern gegengelesen werden. Web-Recherche eingearbeitet (01.10.2026): Tarifit nach El Aissati (Nador-Lehrbuch)/Serhoual – blau = aziza
(nicht azegzaw), „iwa“ = also (waha = nur!), waqila = vielleicht, weiß = acemlal; Sorani nach Rudaw/K24/Wikipedia –
Ampel = ترافیک لایت, Öl = ڕۆن (nicht زەیت), Kupplung = کلاچ, praktische Prüfung = پراکتیکی. Tarifit (02.10.2026): Ölmessstab = aɛekkaz n uɛebbaṛ n zzit, Haubenstab = aɛekkaz (vorher
„ajdiḍ“ = Vogel, in 6 Untertitelzeilen korrigiert); Blau-Reste azeṛqan → aziza/taziza korrigiert.
Offen für Muttersprachler:
rif ṭumubil→ṭṭumubin, ufus→yeffus (rechts), Lehnwörter ligno/lbulan/lfiṛu/lpanu; ckb مافی تێپەڕین (Vorfahrt), کاپۆ (Motorhaube).
**academy-katalog liefert Übersetzungen nur für `body.sprache`** – mit 13 Sprachen sind es >1000 Zeilen,
Supabase liefert je Abfrage höchstens 1000 (ohne sprache: nur tr/en/ar/es für alte App-Stände). Regel (Serband): **alles, was
Schüler sehen, in allen Sprachen** – kein fester deutscher Text im Schülerteil,
immer `t("…")` mit Schlüssel in allen Sprachen (fehlt einer, erscheint Deutsch).
Nur die Rechtstexte (Impressum, Datenschutz, AGB, Widerruf) und die StVO-PDFs
bleiben deutsch; die Übersicht sagt das in der jeweiligen Sprache. Inhalte aus
der Datenbank (Bereiche, Themen, Videotitel/-beschreibungen) in
`academy_uebersetzungen` – neue Videos brauchen dort alle vier Fremdsprachen.
Textkarten "Nützliches": `NUETZLICH_UE`. Die Verwaltung bleibt deutsch.
Neue Sprache = `SPRACHEN` (+ leerer Eintrag im I18N-Literal), `I18N`, `PRUEFUNGSTAG`, `NUETZLICH_UE`, `UI` in
`verkehr/spieler.js` (+ RTL-Liste dort), `SPRACHEN` in der Edge Function `academy-szene`, Spalte in `untertitel.zeilen` + `vtt()`,
`werkzeuge/szenen-texte/beschriftungen.json`,
`werkzeuge/szenen-texte/<sprache>.json` und die Beschriftungen im
Szenen-Export (`szenen-export.js`, `werkzeuge/szenen/*.js`).
Sprachwahl (30.09.2026): EIN Knopf mit Flagge (Login + Konto), die Auswahl öffnet ein
Blatt (`spracheWaehlen()`); Flagge steht in `SPRACHEN[].flagge` (Arabisch: Jordanien 🇯🇴, 30.09.2026; vorher
neutral "ع").

## Untertitel (30.09.2026)

Nur Technik-Videos und Prüfungsstrecken (Entscheidung Serband). Edge Function
`academy-untertitel` (verify_jwt false; nur Super-Admin-JWT oder intern per pg_net
mit Header `x-intern` = Vault-Geheimnis `untertitel_intern`). Ablauf: Bunny erkennt
NUR Deutsch (`start`, 0,10 $/Min) → deutschen Text korrigieren und mit den
App-Fachbegriffen übersetzen → `hochladen` als Spur mit reinem Sprachcode ("tr") →
`loeschen` der "-auto"-Spuren. Bunnys eigene Übersetzung hatte Fachfehler
(Abblendlicht → Fernlicht) und verrutschte Zeiten – nicht verwenden. Sprachen in
`academy_einstellungen.untertitel_sprachen`. Die App schaltet Untertitel nur bei
Fremdsprachen automatisch ein (`captions=<sprache>`), Deutsch ohne.
**Hochladen immer mit `paket`** (mehrere Spuren + Löschen nacheinander in EINEM
Aufruf): parallele Aufrufe an dasselbe Video überschreiben bei Bunny gegenseitig
die Spurenliste (Dateien da, Player sieht sie nicht). `start` braucht
`targetLanguages: ["de"]` – eine leere Liste lehnt Bunny ab. Die automatische
Erkennung erfindet in Stillen Sätze ("Untertitel im Auftrag des ZDF",
"Copyright WDR", "Das war's für heute") – beim Korrigieren streichen.
Fertig (30.09.2026): ALLE 38 Videos in de/en/tr/ar/es (Entscheidung Serband: alles außer
den Originalprüfungen; kein Video ist stumm). Ausgeschlossen – auch in der Function hart
gesperrt: Bereich "Prüfung" und die IDs in `academy_einstellungen.untertitel_ausgeschlossen`
(B., N. H. ×2, S.). Neue Videos brauchen die Bunny-Erkennung nicht mehr:
`werkzeuge/untertitel/` erkennt den Ton kostenlos, `zeilen_anlegen` legt die ersten
deutschen Zeilen an (nur wenn das Video noch keine hat), dann Deutsch korrigieren,
übersetzen, `abgleich.py --setzen`, `paket` mit `untertitel.vtt(...)`.

**Quelle der Untertitel ist die Tabelle `untertitel.zeilen`** (eigenes Schema, von außen
nicht erreichbar): je Zeile Beginn/Ende, `de` + alle Übersetzungen, `anker` (Wortzeiten).
Bunny-Dateien werden daraus gebaut: `untertitel.vtt(video, sprache, videolänge_s)` teilt
lange Sätze fürs Handy (max. 2 Zeilen à ~40 Zeichen, Stücke ≤ 76 Zeichen), verteilt die
Zeit sprechgenau über die Anker und setzt bei Arabisch das RTL-Zeichen. Neue Sprache =
Spalte ergänzen + `vtt()` + `untertitel_sprachen`; hochladen per `paket` mit
`untertitel.vtt(...)` direkt im SQL. Aussehen (weiße Schrift auf schwarzem Balken, 18 px
am Handy) kommt aus der Bunny-Bibliothek – nichts zu tun.
**Synchron zum Ton** (`werkzeuge/untertitel/`): `ton-erkennen.py` erkennt jedes Wort mit
Zeit (faster-whisper), `abgleich.py` richtet die Zeilen daran aus (globale Ausrichtung im
±6-s-Korridor; gedehnte Wörter vom Ende her gekürzt; Lesezeit max. 17 Zeichen/s; keine
Überlappung). Zugang nur über einen lokalen Schlüssel, dessen SHA-256 VORÜBERGEHEND im
Vault als `untertitel_abgleich_hash` liegt – danach löschen (Stand 02.10.2026: mit Zufallswert
überschrieben, der alte Schlüssel ist nachweislich abgelehnt; Eintrag und die leere Hilfstabelle
`untertitel.hochladen_neu5` können im Dashboard gelöscht werden – Lösch-Befehle über die
Claude-Verbindung hängen an einer Bestätigung).
**CDN-Falle:** Bunny liefert Untertitel mit `max-age` 30 Tage aus und ignoriert `?ver=`.
Überschreibt man eine Spur, sehen Knoten, die sie schon geholt hatten, bis zum Leeren des
Caches die alte. Nach dem Überschreiben: Pull-Zone-Cache in Bunny leeren (braucht den
Konto-Schlüssel, den die Functions nicht haben).

## Vor jedem Bau-Schritt

- Betrifft es die Datenbank: `get_advisors` danach ausführen (security +
  performance).
- Betrifft es eine Edge Function: `verify_jwt` ausdrücklich auf `false`
  (alle 21 Functions sind bewusst öffentlich, machen ihre eigene Prüfung).
- Sicherheitsbehauptungen mit echten Tests beweisen (RLS-Simulation,
  Transaktion + Rollback), nicht nur behaupten.

## Architektur-Grenzen, die man dem Code nicht ansieht

- **Schüler-Login** läuft NICHT über Supabase Auth, sondern über eigene
  Sessions (`academy_sessions`, Telefon+PIN gegen `academy-login`). Nur
  **Admins** nutzen echtes Supabase Auth.
- **Rollen:** `academy_admin_users.rolle` ist `super_admin` oder `schule`.
  RLS-Policies laufen über die SECURITY-DEFINER-Funktionen
  `academy_my_role()` / `academy_my_schule()`.
- **Kandidaten vs. Schüler sind bewusst getrennte Tabellen.**
  `academy_kandidaten` = Rohimport aus Fahrlehrer-Kompass, unfreigeschaltet.
  `academy_schueler` = echter Zugang mit PIN. Die Ein-Klick-Freischaltung
  (`academy-zugang-aktivieren`) macht daraus einen Schüler.
- **Kompass-Brücke:** geteiltes Geheimnis `kompass_bridge_secret` im Vault
  beider Projekte, per `get_decrypted_secret()`. `academy-kandidaten-sync`
  schreibt NIE in `academy_schueler` — nur in `academy_kandidaten`. Ein
  Kompass-Fehler kann also nie bestehende Zugänge/PINs verändern.
- **Prüfungsstrecken gehören zum Vollzugang** (Entscheidung Serband,
  26.09.2026 — ersetzt den früheren Satz "Prüfungsvideos sind bewusst ohne
  Sperre", der nicht mehr dem Code entsprach). Sie sind wie alle anderen
  Videos über `academy-video-token` gesperrt; eine einzelne Strecke kann per
  `academy_videos.gratis` als Kostprobe freigegeben werden.
- **Abmelden nur mit eindeutigem Code** (26.09.2026): Die App meldet Schüler
  nur bei `session_ungueltig`, `session_abgelaufen`, `zugang_gesperrt`,
  `zugang_abgelaufen` oder `schule_pausiert` ab (Feld `code` in der Antwort
  der Edge Functions). Neue Ablehnungsgründe brauchen einen eigenen Code,
  sonst bleibt der Schüler angemeldet — das ist Absicht.
- **Archivieren statt Löschen** (26.09.2026): Schüler bekommen `archiviert_am`
  (Zugang ruht, `aktiv=false`, vorheriger Stand in `archiv_vorher_aktiv`),
  Videos `ausgeblendet=true` (auch `academy-video-token` lehnt sie ab).
  Endgültig löschen: nur Super-Admin, nur mit Eingabe von Name/Titel; die
  Löschrichtlinie für Partner auf `academy_schueler` ist entfernt. Das
  Protokoll-Feld `akteur` setzt ein Trigger aus `auth.uid()`.
- **Kein Lernverlauf in der Verwaltung** (26.09.2026): `academy_fortschritt`
  wird im Admin nicht mehr geladen; "Inaktiv" = keine Anmeldung seit 14 Tagen.
- **Katalog nur für Angemeldete** (26.09.2026): Schüler laden Themen/Videos/
  Prüfer über die Edge Function `academy-katalog` (prüft die Schüler-Session;
  Verwaltung per Admin-JWT für die Vorschau). Der direkte Lesezugriff mit dem
  anon-Key wird mit `db/nach-livegang-stufe3.sql` geschlossen — ERST nachdem
  diese App-Version live ist.
- **Video-Status** (26.09.2026): `academy_videos.status` = entwurf |
  verarbeitung | bereit | live. Nur `live` sehen Schüler (Katalog, Token,
  Vorschau). Hochladen über `academy-upload` (TUS direkt zu Bunny, API-Key
  bleibt auf dem Server), Push erst beim Veröffentlichen.
- **Bunny schützt Dateien nur per Referer** (Stand 26.09.2026, geprüft).
  Deshalb verlässt `bunny_video_id` den Server nur über `academy-video-token`
  (bei Freigabe). Vorschaubilder: `academy-vorschaubild`, Vorschau gesperrter
  Videos: `academy-vorschau` (liefert nur die ersten N Sekunden, N in
  `academy_einstellungen.vorschau_sekunden`).
- **Tippen aufs Video** (03.10.2026, Serband): eigene Fläche `.tipp-flaeche` über dem Bunny-iframe
  (unten 64 px frei für Bunnys Steuerleiste): 1× tippen = Anhalten/Weiter, Doppeltipp links/rechts =
  10 s zurück/vor (über player.js; `st.zeit` aus timeupdate). Erst aktiv, wenn das Video läuft – den
  ersten Start macht Bunny (iPhone braucht den Tipp im Player). Embed mit `chromecast=false&disableAirplay=true`,
  weil die Steuerleiste am Handy zu breit war (Abspielen links abgeschnitten). Die Knöpfe der Leiste
  selbst stellt man nur in der Bunny-Bibliothek ein (Konto-Schlüssel, nicht in den Functions).
- **Kapitel/Fehlerstellen** als jsonb `[{t, titel}]` / `[{t, text}]`; Sprünge im
  Player über das player.js-Protokoll (postMessage). Abspielstelle nur lokal
  (`localStorage.academy_pos`), nie auf dem Server.
- **supabase-js liegt im Repo** (`vendor/`, feste Version). Bei einem Update
  neue Datei mit neuer Versionsnummer anlegen, Script-Tag und `sw.js`
  (STATIC_ASSETS + CACHE_NAME) anpassen.
- **Logo** ist die Datei `logo-264.png` (nicht mehr im HTML eingebettet), im
  Service Worker vorgeladen. Neues Logo = neuer Dateiname + `sw.js` anpassen.
  **App-Icons (07.10.2026):** `icon-192/512.png` = abgerundete Kachel mit transparenten Ecken (Zweck „any“). `icon-*-maskable.png` und
  `apple-touch-icon.png` = dieselbe Kachel (64 % bzw. 80 %) auf Creme `#F5F0E3` (= `background_color`). Warum: Android schneidet maskable-Icons mit
  der Form des Launchers aus und zeigt beim Start (Android 12+, manche Hersteller) die ganze Fläche ohne Maske -- eine randlos beschnittene Kachel gab
  einen harten Block mit dunklen Ecken. Auf Creme verschwindet der Block; der Launcher schneidet nur Creme ab. Gebaut aus dem Original mit Pillow
  (Kachel freigestellt per Flood-Fill von den Ecken). Das Icon eines schon angelegten Home-Bildschirm-Eintrags ändert sich nicht von selbst: entfernen und neu hinzufügen.
- **Anklickbare `<div>`s** bekommen automatisch `role="button"`/`tabindex`
  (`KLICK_FLAECHEN` + `tastaturSystemStarten`). Neue Klickflächen mit
  `data-…`-Attribut dort eintragen — oder gleich `<button>` verwenden.
- **Verkehr verstehen** (`verkehr/`, Stufe 6): eigener 3D-Motor `motor.js` auf
  three.js (`vendor/three-0.186.1.min.js`, fest), Stadt/Autobahn-Welt und
  Verkehrsteilnehmer in `stadt.js`, Bedienung in `spieler.js` (lädt die App erst
  beim Öffnen einer Szene per `import()`). Eine Szene ist eine reine Funktion der
  Zeit – Springen, Anhalten, halbes Tempo ohne Nebenwirkungen. Mitdenken OHNE
  Bewertung (E6 = a): keine Antwortknöpfe, kein Rot/Grün, nichts gespeichert.
  **Szenendaten liegen NICHT im Repo**, sondern in `academy_szenen` (kein
  öffentlicher Lesezugriff; nur Super-Admin liest/ändert Kostprobe/Aktiv).
  Ausgeliefert nur über `academy-szene`: Vollzugang, Kostprobe oder Gratis-Thema
  → ganze Szene, sonst nur Kapitel 1 (`teaser.gesperrt` = Titel der übrigen).
- **Bild-Kacheln in „Verkehr verstehen“** (06.10.2026, Serban): je Kategorie eine Wisch-Zeile
  (`.vk-reihe`, CSS scroll-snap, ca. 1,6 Kacheln sichtbar). Markup baut `renderVerkehrHtml()`,
  das Wischen (Kachel vorn groß/scharf, abgehende klein/weich, Variable `--p` 0..1) und die
  Kurzinfo darunter macht `verkehr/kacheln.js` (per `import()` beim Öffnen). Alle Infotexte einer
  Zeile liegen übereinander im Raster (`.vk-t`), nur einer ist sichtbar → die Höhe springt nie.
  Vorschaubilder: `verkehr/vorschau/<szenen-id>.webp` (480×270, je ~10 KB), Standbilder aus
  den echten 3D-Szenen (Headless-Chromium mit Software-WebGL über den Spieler, Szenendaten mit
  `werkzeuge/szenen-export.js` aus dem Kompass-Repo). Neue Szene = neues Bild gleichen Namens,
  fehlt es, zeigt die Kachel eine ruhige Ersatzfläche. Kostprobe-Szenen stehen in ihrer Zeile
  vorn (Gold-Rahmen); wer keinen Vollzugang hat, sieht gesperrte Bilder gedimmt, Schloss unter
  dem Bild. Kostproben seit 06.10.2026: `ueberholen`, `zebra`, `rettungsgasse`.
  Keine neuen Texte (Titel/Kurztext kommen aus `academy-szene`, Marken aus `vvKostprobe`/`vvNurAnfang`).
  Erzeugt werden die Daten mit `werkzeuge/szenen-export.js` (tastet die
  Kompass-Lernszenen und `werkzeuge/szenen/*.js` ab; Übersetzungen in
  `werkzeuge/szenen-texte/<sprache>.json`, gleiche Struktur wie `texte.de`). Paragraphen-Etiketten (`.vv-regel`, `.par`)
haben `unicode-bidi:plaintext`, sonst wird „§ 11 Abs. 2 StVO“ in RTL-Sprachen verdreht.
  **Cockpit (01.10.2026):** In der Fahrersicht zeichnet `motor.js` Innen- und Außenspiegel live
  (eigene Kameras in kleine Bildpuffer, spiegelverkehrt, jedes 2.–4. Bild) und eine dunkle Leiste;
  Tacho, Blinkerpfeile und Schulterblick-Auge sind HTML in `spieler.js` (Maße aus `welt.cockpitMasse()`).
  Der Spiegel mit Spiegelblick-Signal leuchtet gelb. Handy quer + Fahrersicht = Vollbild.
  **Kamera (01.10.2026, Serband):** Standard ist in ALLEN Szenen „Folgen“ (`schraeg`); der Schalter
  „Kamera folgt der Erklärung“ startet aus – erst wenn man ihn einschaltet, greifen die Kapitel-Kameras
  der Szene (`kapitel[].kamera`, z. B. Übersicht/Oben). `grundKamera` in den Daten wird nicht mehr genutzt.
  Die Kompass-Szenen stammen aus dem öffentlichen Kompass-Repo – die Sperre
  schützt die Akademie-Oberfläche, nicht die Rohdaten.
- **Stimme in „Verkehr verstehen“** (03.10.2026, Serband): Kapiteltexte werden vorgelesen
  (ElevenLabs-Stimme „Julian“ über Higgsfield `text2speech_v2`/`elevenlabs`, Preset
  95429266-c0ac-4137-a209-63b8812b0f23). Dateien im Repo: `verkehr/stimme/<sprache>/<szene>-<kapitel>-<stand>.mp3`
  (48 kbit/s mono) + Verzeichnis `verkehr/stimme/<sprache>.json` `{ "<szene>/<kapitel>": {h, d, f} }`;
  h = `stimmeStand(text)` (djb2 wie `hinweisStand`). Ändert sich ein Kapiteltext, passt h nicht mehr und
  das Kapitel bleibt stumm – neu aufnehmen. Spieler: Knopf „Vorlesen“ (nur wenn es ein Verzeichnis für
  die Sprache gibt; an/aus in `localStorage.vv_stimme`), mit Stimme läuft die Szene in Zeitlupe
  (bis 35 %) und wartet am Kapitelende, bis der Satz zu Ende ist. Fertig: de, tr, ar (je 114 Kapitel).
  Sprechtext ≠ Anzeigetext: „=“ → „:“, „4–7“ → „4 bis 7“; Türkisch „km/h“ → „saatte … kilometre“,
  Klammern als Nebensatz (sonst überspringt die Stimme sie). Kontrolle: faster-whisper (small) +
  Textvergleich (Werkzeuge im Scratchpad, Ablauf: Texte per SQL, Aufnahme, ffmpeg, Verzeichnis, Prüfung).
  Kosten: rund 0,45 Higgsfield-Credits je Kapitel und Sprache.
- **Hinweise im Video** (02.10.2026, Serband): `academy_videos.hinweise` = jsonb
  `[{id, t, titel, text, par, art, aktiv, ue_fuer}]`. Schüler sehen nur `aktiv: true` (filtert
  schon `academy-katalog`, die App nochmal). Oben rechts im Video blendet sich 8 s lang ein
  halbdurchsichtiger §-Knopf ein (Video läuft weiter); Antippen hält an und öffnet ein Blatt.
  Unter dem Video „Wichtige Stellen“ (zugeklappt, Sprung-Liste, Schalter
  `localStorage.academy_hinweise_aus`). Das Wasserzeichen meidet die Ecke oben rechts. Handy quer
  = Video füllt den Bildschirm (`body.video-offen`), damit die Hinweise sichtbar bleiben –
  Bunnys eigenes Vollbild zeigt keine App-Einblendungen. Übersetzungen in
  `academy_uebersetzungen` (art `video`, feld `hinweis:<id>:titel|text`); sie gelten nur, wenn
  `ue_fuer` = `hinweisStand()` des deutschen Textes ist – ändert jemand den deutschen Text, sehen
  Schüler Deutsch statt einer veralteten Übersetzung. Pflege: Verwaltung → Video bearbeiten.
  Werkzeug: `sprachen_werkzeug_setzen('hinweise','de',…)` / `('hinweis_ue',<sprache>,…)`.
  Originalprüfungen haben keine Hinweise (wie bei den Untertiteln).
- **Prüfer nur mit Initialen** (01.10.2026, Entscheidung Serband): `academy_pruefer.name`,
  Videotitel/-beschreibungen (alle Sprachen) und die Titel bei Bunny tragen nur Initialen
  ("N. H."; in ar/ckb/ur mit LRM dahinter, damit der Punkt am Kürzel bleibt). Der volle Name
  steht als Vermerk in `academy_pruefer_vermerk` (RLS: nur Super-Admin; geprüft) und erscheint
  nur in der Verwaltung klein in Klammern. Neue Prüfer: Formular nimmt den vollen Namen, die
  App bildet die Initialen. Keine echten Prüfernamen ins Repo. Bunny-Titel an den App-Titel
  angleichen: `academy-untertitel` Aktion `bunny_titel` mit `setzen:true`.
- **Zweites Supabase-Projekt `oectrvkjunntzsggyhxv`** (Fahrlehrer-Kompass) ist
  ein separates Projekt mit eigenem Chat. Hier nur als Bridge-Partner
  relevant — nicht versehentlich hineinschreiben.

## Spiele (06.10.2026)

Mini-Spiele rund um den Verkehr mit Bestenliste. Beschluss Serban: 10 Spiele, **eines nach dem anderen**, nach jedem
Spiel Abnahme durch ihn, Erfahrungen fließen ins nächste. Gleiche Spieldynamik = gemeinsame Grundlage:
A Reaktion/Tippen (Ampel-Bremsweg, Tempo-Sprint), B Szene+Auswahl (Rechts vor Links, Fahrlehrer-Simulator,
Verkehrskontrolle, Duell), C Bild antippen (Gefahren finden, Fahrzeug-Check), D einzeln (Schilder-Memory, Schilder-Ninja).
Reihenfolge: Ampel-Bremsweg, Tempo-Sprint, Schilder-Memory, Rechts vor Links, Fahrlehrer-Simulator, Verkehrskontrolle,
Gefahren finden, Fahrzeug-Check, Schilder-Ninja, Duell. Fertig: **Ampel-Bremsweg** (Spiel 1, mit Rahmen, für alle live),
**Tempo-Sprint** (Spiel 2, 07.10.2026 gebaut und noch am selben Tag für alle freigegeben, `nurVorschau: false`; Serban: „Mach alles fertig“).
Spiel 3 **Schilder-Memory** und Spiel 4 **Rechts vor Links** (gebaut 07.10.2026, `nurVorschau: true` bis Serban abgenommen hat; siehe unten). Memory-Beschluss von Serban: Schild ↔ Kurzbedeutung, Pop-up mit Bedeutung nach StVO, nur gängige Schilder für Offenbach innerorts (Liste im Chat, noch nicht bestätigt).

**Aufbau**
- `spiele/` wird erst beim Öffnen geladen (wie `verkehr/`): `spiele.js` (Startseite + Weiche), `rahmen.js` (Rahmen für ALLE Spiele:
  Texte, Server-Aufruf, Name/Sichtbarkeit, Bestenliste), `ampel.js` (Spiel 1), `texte.js` (Texte in allen 18 Sprachen, eigener
  Block wie `UI` in `verkehr/spieler.js`), `spiele.css`. Ein neues Spiel = Datei mit `starte(platz, k)` + Eintrag in `SPIELE`
  in `spiele.js` + Schlüssel in ALLEN Sprachen in `texte.js` + Spiel-Eintrag im `SPIELE`-Block der Function.
- In `index.html` nur: Menüpunkt (`spieleSichtbar()`), Navigationsfeld `spiel` im Stapel, `spieleAufruf()`, `spieleEinhaengen()/spieleAufraeumen()`.
- **Einzel-Freigabe je Spiel (07.10.2026):** jeder Eintrag in `SPIELE` (`spiele/spiele.js`) hat `nurVorschau` (true/false). Mit `true` zeigt die Startseite die Karte
  (mit Marke „Vorschau“) und öffnet das Spiel NUR auf Vorschau-Geräten (`opt.vorschauGeraet` = Vorschau der Verwaltung oder `?spiele=1`); ein direkt aufgerufenes
  Spiel mit `nurVorschau` öffnet für normale Schüler nicht (Startseite). Freigabe = `nurVorschau: false` (kleiner eigener Pull Request nach Serbans „ok“).
  `index.html`: `spieleGeraetVorschau()` (Gerät) und `spieleSichtbar()` (Menüpunkt: `SPIELE_FUER_ALLE || Gerät`). Grenze: der Server kennt das Flag nicht – wer die Function
  selbst aufruft, kann auch für ein verstecktes Spiel eine Runde melden (die Bestenliste ist nur im Spiel selbst zu sehen). Testwerte von Serban bleiben nach der Freigabe in der Bestenliste.
- **Sichtbarkeit:** seit 06.10.2026 `SPIELE_FUER_ALLE = true` (Serban: für alle Schüler freigegeben). Mit `false` sähen den Bereich nur die Vorschau der Verwaltung und Geräte mit `?spiele=1`
  in der Adresse (`?spiele=0` schaltet aus; im Browser-Speicher des Geräts, die installierte iPhone-App hat einen eigenen Speicher) – nützlich, um ein NEUES Spiel erst selbst zu prüfen.
  Beim Einbau weiterer Spiele: erst sichtbar machen, wenn Serban abgenommen hat (z. B. Eintrag in `SPIELE` in `spiele.js` mit einer Vorschau-Bedingung versehen).
- **Server:** Edge Function `academy-spiele` (Quelle `werkzeuge/edge-functions/academy-spiele.ts`, `verify_jwt` false, prüft die Schüler-Session
  wie `academy-szene`). Tabellen `academy_spiele_runden`, `academy_spiele_bestwerte`, `academy_spiele_profil` (RLS an, absichtlich ohne Policy: Zugriff nur über
  die Function; `on delete cascade` am Schüler). SQL-Funktionen `academy_spiele_anzeigename`, `academy_spiele_rangliste` (nur service_role).
- **Name im Ranking kommt NIE vom Gerät**, sondern aus dem Schülerkonto: Vorname + erster Buchstabe des letzten Namensteils („Serban D.“).
  Ausblenden per Schalter (`academy_spiele_profil.sichtbar`, Standard sichtbar). Ranking gilt über ALLE Schulen. Archivierte/gesperrte Schüler fehlen.
  **Datenschutzerklärung der App muss um die Bestenliste ergänzt werden** (Vorschlag steht im Bericht vom 06.10.2026).
- **Schutz vor erfundenen Ergebnissen:** jede Runde startet auf dem Server (`start`), ein Ergebnis zählt genau einmal, nur im Wertebereich (Ampel 120–1500 ms),
  nur wenn seit dem Start genug Zeit verging (`vorlauf_ms`, hängt an den Lichtzeiten in `ampel.js`), höchstens 30 Runden/10 min. Ein manipuliertes
  Gerät kann trotzdem einen erlaubten Wert melden – bei Reaktionsspielen nicht ganz zu verhindern.
- Der Ampel-Bremsweg rechnet mit den Fahrschul-Faustformeln (Reaktionsweg (v/10)·3, Bremsweg (v/10)², Nässe Bremsweg ×2) und stellt die
  gemessene Handy-Reaktion daneben: Handy-Reaktionen sind kürzer als im Verkehr (~1 s), sonst entsteht falsche Sicherheit.

**Tempo-Sprint (Spiel 2, umgebaut 08.10.2026 nach Serbans Wünschen)** – `spiele/tempo.js`, Spiel-Id `sprint` (vorher `tempo`)
- Reines Vergnügungsspiel, KEINE Schilder, KEIN Blitzer mehr. Ablauf: Server-Runde anmelden, 3 s Countdown, „Gas geben“: Auffahrt, 6 s Zeit für 60 km/h (sonst „zu langsam“, Runde zählt nicht), dann 10 s Autobahn. Ranking = **Strecke in Metern** (größer ist besser), dazu Höchsttempo und Tipps im Ergebnis.
- Kein Tempolimit nach oben: Tippen `v += 9 · (1 − v/1400)`, ohne Tippen −40 km/h je Sekunde. Mensch (Tipps/s → Höchsttempo/Strecke nach 10 s): 6 → ~160 km/h, 10 → ~400/770 m, 14 → ~600, 15,8 (Grenze) → ~670 km/h/~1150 m. Ein Tipp zählt erst 63 ms nach dem letzten (Mehrfinger).
- Rechnung als reine Funktionen (`neuerLauf`, `schritt`, `tippen`, `obergrenze`), von Spiel UND Prüfungen genutzt. Zeichnung: Schein-3D auf einer Zeichenfläche (Canvas, Zeile für Zeile, Bäume/Häuser/Autos als Sprites), Vorführung vor dem Start (Auto fährt auf die Autobahn auf).
- **Server** (`academy-spiele.ts`, Eintrag `sprint`, Zahlen `SPRINT` = `REGELN`): `ergebnis` nimmt `tipps` (Autobahn), `tippsAuf` (7–100), `vmax`. Prüft: Tempo ≤ `sprintObergrenze(tipps).v`, Strecke ≤ `.m` (Start 70 km/h, alle Tipps zuerst im Abstand 60 ms, 3 % + 5 m Spielraum) und Strecke ≤ vmax·10 s. Vorlauf 13 s. Das alte Spiel `tempo` gibt es im Server nicht mehr; alte km/h-Bestwerte stehen noch unter `tempo` in `academy_spiele_bestwerte` (unbenutzt, auf Wunsch löschen).
- Layout: Tacho, Straße, Meldung UND Tippfläche zusammen in ein Handy-Bild (über der Menüleiste ~90 px): `scrollIntoView(start)` beim Start, Tippfläche `clamp(88px,19vh,170px)`, Szene 16:7, Anleitung unter der Tippfläche (im Lauf ausgeblendet).
  Querformat: Bühne links, Tippfläche rechts.

**Schilder-Memory (Spiel 3, 07.10.2026)** – `spiele/memory.js`, Zeichen in `spiele/schilder.js`
- 12 Karten (3 × 4, quer 6 × 2): 6 von 14 Schildern (`SCHILDER`) als Paar „Schild + Name“, verdeckt gemischt. Nach jedem Treffer erscheint eine Karte mit Schild, Zeichen-Nummer, Name und Erklärung nach StVO (Lerneffekt); Weiter per Knopf.
  Die Uhr steht NUR während der Erklärung, danach läuft sie sofort weiter (sonst wäre Nachdenken gratis). Falsche Karten drehen sich nach 0,9 s zurück (die Zeit läuft dabei).
- Ranking: Zeit in ms, kleiner ist besser, Anzeige in Sekunden (`format` in `spiele.js`, `rankingKarte(…, format)`). Server `memory`: `zuege` und `fehler` (zuege = 6 + fehler), Zeit ≥ 100 ms je Zug + 900 ms je Fehlversuch, Runde darf bis 40 min offen sein (`runde_max_ms`).
- **Schilder: ALLE sind amtliche Bilder** (Wikimedia Commons, Public domain, je Datei die Lizenz abgefragt), abgelegt in `verkehr/vorfahrt-zeichen/`, Herkunft und Dateinamen in `verkehr/vorfahrt-zeichen/QUELLEN.md`. `spiele/schilder.js` liefert nur `<img>`; nichts ist nachgezeichnet (ein erster Entwurf mit selbst gezeichneten Zeichen hatte Fehler, z. B. falsche Richtung des Balkens bei Zeichen 286 – deshalb ersetzt). Die Prüfung `pruefe-academy-spiele.mjs` stellt sicher: jede Datei vorhanden, gültiges SVG, ohne Skripte/externe Verweise, in QUELLEN.md genannt, und im Browser lädt jedes Bild.
  Nachladen von Commons aus der Cloud: Wikimedia sperrt schnell (HTTP 429). Mit 10–60 s Pause und dem direkten Pfad `upload.wikimedia.org/wikipedia/commons/<md5 1>/<md5 1-2>/<Dateiname>` klappt es. Tempo-Sprint braucht Zeichen 274 mit 50/60/80/100/120 (`TEMPO_ZAHLEN`).

**Rechts vor Links (Spiel 4, 07.10.2026)** – `spiele/vorfahrt.js`
- Kreuzung von oben ohne Schilder/Ampel, 2–4 Autos (Aufgabe 1–3: 2, 4–7: 3, 8–10: 4), tippe das Auto, das zuerst fahren darf. Pfeil-Linie und Blinker zeigen den Weg. 15 s Limit, Bonus bis 8 s (100–150 Punkte je richtig). Nach jeder Antwort steht die Regel dabei (grün = richtiges Auto, rot = angetipptes falsches).
- Regeln als reine Rechnung (`konflikt`, `vorrang`, `freieAutos`): Konflikt bei gekreuzten Wegen oder gleicher Ausfahrt; Vorrang = von rechts (auch beim Abbiegen); Ausnahme: Linksabbieger lässt Gegenverkehr (geradeaus/rechts) durch; zwei entgegenkommende Linksabbieger behindern sich nicht (Regel, nicht Zeichnung). Jede Aufgabe hat genau EIN freies Auto; jeder Satz hat ≥ 2 „Gegenverkehr“- und ≥ 3 „von rechts“-Aufgaben.
- Server `vorfahrt`: `richtig` 0–10, Punkte zwischen 100 und 150 je richtiger Aufgabe, Vorlauf 5 s, Runde bis 30 min.
- Prüfungen: Hand-Fälle, ALLE 256 Kreuzungs-Konstellationen (Drehung ändert nichts), 400 zufällige Aufgabensätze.

**Duell gegen Mitschüler (Spiel 10, gebaut 06./07.10.2026, überarbeitet nach unabhängiger Sicherheitsprüfung)** – `spiele/duell.js`, Fragen `spiele/duell-fragen.js` (60 Fragen, 18 Sprachen, ohne Lösung), Server `academy-spiele.ts` (Aktionen `duell_*`), Datenbank `db/duell.sql` (angewendet) + `db/duell-2.sql` (Lösungstabelle, Indizes)
- **Die Lösungen sind PRIVAT, weil das Repo öffentlich ist (GitHub Pages).** Weder Quelltext noch Fragenquelle (`werkzeuge/duell-quelle/`) noch Tests noch Doku enthalten eine Lösung (`meta.mjs` hat kein Feld `richtig`). Sie liegen an zwei Orten:
  (a) in der Datenbank-Tabelle `academy_duell_loesungen` (`frage_id`, `richtig` 0–2; RLS an, keine Policy, nur service_role). Die Edge Function liest sie bei Bedarf und behält sie 5 Minuten im Speicher; zum Gerät gehen sie erst nach der Auswertung (Feld `loesung`).
  (b) als Schlüsseldatei **außerhalb des Repos**: `/home/user/duell-private/loesungen.json` (anderer Ort: Umgebungsvariable `DUELL_LOESUNGEN_PFAD`), dazu die daraus erzeugte `/home/user/duell-private/loesungen.sql`. Nie einchecken, nie in den Chat kopieren.
- **Einspielen / ändern:** (1) Frage in allen 18 Sprachdateien + `meta.mjs` (Quelle als Kommentar) eintragen, (2) Lösung in `loesungen.json` ergänzen, (3) `node werkzeuge/duell-loesungen-erzeugen.mjs` (schreibt `spiele/duell-fragen.js` und `loesungen.sql`; `--pruefen` prüft nur, dass Schlüssel und Pool zusammenpassen), (4) `loesungen.sql` in die Datenbank einspielen (wiederholbar: `on conflict do update`). IDs werden nie umnummeriert oder entfernt; ändern sich bei einer Frage die Antworten, die Lösung im Schlüssel UND in der Tabelle nachziehen. Ist der Schlüssel je im Repo gelandet: Lösungen neu würfeln (Antwortreihenfolge ändern) und die Historie bereinigen.
- **Prüfungen brauchen den Schlüssel:** `werkzeuge/pruefe-duell.mjs`, `pruefe-duell-im-browser.mjs` und `mutationstest-duell.mjs` laden ihn aus der Datei in die Datenbank im Speicher. Fehlt die Datei, lehnen sie mit klarer Meldung ab (FEHL, Exit 1 bzw. 2): nie still überspringen; Prüfungen ohne Lösungen laufen weiter.
- **Regeln des Servers:** Die Uhr einer Runde startet beim ersten `duell_start`; ein erneuter Start derselben offenen Runde (z. B. nach einem Netzfehler, Knopf „Weiterspielen“) liefert dieselben Fragen, die Startzeit bleibt, höchstens 10 Minuten. Wer ein Duell annimmt, muss es innerhalb von 24 Stunden starten, sonst geht es zurück auf „offen“. Höchstens 3 laufende Duelle (auch bei gleichzeitigen Aufrufen). Aufräumen höchstens einmal pro Minute je Instanz (je Lauf höchstens 50 Zeilen), `duell_uebersicht` höchstens 60-mal in 10 Minuten je Schüler. Fremde erfahren nie, ob ein Duell existiert (404 `duell_unbekannt`). Fehler an das Gerät: nur fester Text (`voruebergehend`), nie die Fehlermeldung.

**Prüfen (vor jeder Änderung an Spielen laufen lassen, jedes neue Spiel bekommt Fälle dazu)**
- `node --experimental-strip-types werkzeuge/edge-functions/pruefe-academy-spiele.mjs` – Logik der Function gegen eine Datenbank im Speicher (67 Fälle: Ampel, Tempo-Sprint, Memory, Rechts vor Links inkl. Regeln).
- `node --experimental-strip-types werkzeuge/pruefe-spiele-im-browser.mjs` – echte App im Chromium mit Fingertipp: Menü, Spiel, Fehlstart, Rechnung,
  Bestenliste, Ausblenden, Verlassen mitten in der Runde, Handy hoch/quer/klein/dunkel, alle 18 Sprachen, Einzel-Freigabe, Tempo-Sprint in ECHTER Zeit (ca. 8 min gesamt;
  einzelne Spiele: `NUR=tempo,memory,vorfahrt`). Bilder: `$SPIELE_BILDER`.
- Beide Prüfungen wurden selbst geprüft: mit absichtlich eingebauten Fehlern (Zeitprüfung, Einmal-Einlösung, Wertgrenzen, fremde Runde, Bremse, Rechenfehler) schlagen sie an.

**Gelernt bei Spiel 1 (fließt in jedes weitere Spiel)**
- **Nie einen Testschüler in der echten Datenbank anlegen:** der Trigger `academy_verkauf_buchen` schreibt ins unveränderliche Verkaufsbuch. Stattdessen die
  Function gegen die Nachbildung prüfen (`spiele-im-speicher.mjs`); für einen echten Durchlauf eine Test-Sitzung für ein vorhandenes aktives Konto anlegen, nur
  `start`/`ergebnis` aufrufen (liefern keine Namen), danach Sitzung und Spiel-Zeilen löschen und die Zählung prüfen.
- Messen erst nach Überblendung/Scrollen der App (sonst falsche Layout-Befunde und Geisterbilder auf Fotos). Querformat am Handy: die Bühne zuerst und von selbst ins Bild
  scrollen, sonst deckt die Menüleiste den Knopf zur Hälfte ab.
- Spielnamen vom Gerät mit `hasOwnProperty` prüfen (`__proto__`, `constructor`). Späte Server-Antworten mit einem Zähler verwerfen (`ergId`), sonst überschreiben sie neuere Ergebnisse.
- **Gelernt bei Spiel 3/4:** (1) Start-Knopf eines Spiels MITTEN über das abgeblendete Brett legen (sonst liegt er auf dem 360-px-Handy unter der Menüleiste); (2) die Uhr nie „beim Lesen“ anhalten und dann bis zum nächsten Tipp stehen lassen (sofort nach dem Lesen weiter); (3) Geometrie allein reicht für Verkehrsregeln nicht: zwei entgegenkommende Linksabbieger kreuzen sich in der Zeichnung, dürfen aber voreinander abbiegen → solche Regeln ausdrücklich im Code festlegen und mit allen Konstellationen testen; (4) Erklärungen mit mehreren „Dieses Auto“ brauchen eine Farbmarkierung; (4b) **Verkehrszeichen nie nachzeichnen, immer die amtlichen Dateien nehmen** (Serban: „die müssen echt sein“); (5) neue Server-Spiele brauchen eigene `runde_max_ms` (2 Minuten reichen für Lesespiele nicht); (6) Übersetzungen mit Helfern parallel erzeugen und Platzhalter/Schlüssel automatisch prüfen.
- **Gelernt bei Spiel 2 (Tipp-Spiele, Familie A):** (1) Bei Spielen, in denen man schnell tippt, MUSS die Tippfläche zusammen mit der Anzeige im Bild bleiben – sonst scrollt der Spieler; (2) nach dem Ende
  die Tippfläche kurz sperren (Nachtippen startet sonst sofort eine neue Runde); (3) Mehrfinger/Salven: Mindestabstand zwischen gezählten Tipps im Spiel UND Obergrenze im Server;
  (4) die Obergrenze im Server aus der Spielregel ableiten und mit dem Spielmodell testen, nicht schätzen; (5) Prüfskripte nicht mit Sentinel-Werten (-1e9) bauen – das gab falsche Fehlalarme;
  (6) lange Läufe in echter Zeit prüfen, aber mit eingebautem Bot, der Fingerereignisse schickt (`pointerdown`).
- Tarifit: `lfiṛu` heißt Ampel (nicht Bremse; Bremse = `lfrinu`). Sprachen rif, ckb, kmr, ps, am, ti sind von mir übersetzt, NICHT von Muttersprachlern geprüft.

## Bekannte Fehlerquellen

- `academy_schueler.klasse` ist NOT NULL mit Default `'B'`. Ein explizit
  mitgeschicktes `null` hebelt den Default aus und lässt den Insert
  scheitern (siehe `academy-zugang-aktivieren` v2-Fix).
- Doppelte Variablendeklarationen (`letzter`) haben schon einmal zu weißem
  Bildschirm geführt — vor jedem Merge Syntax prüfen.
- Service Worker: HTML/API-Aufrufe müssen Network First sein, nie Cache
  First — sonst sehen Schüler dauerhaft alte Stände.

## Bei Unklarheit

Nicht raten. Fragen. Eine falsche Annahme kostet mehr Zeit als eine
Rückfrage.
