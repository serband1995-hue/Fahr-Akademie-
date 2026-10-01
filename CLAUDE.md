# Fahr-Akademie — Projektgedächtnis

Vanilla-JS-App (eine `index.html`, ~9.500 Zeilen) für Fahrschüler. Backend:
Supabase-Projekt `fxgljvhpikjcejhghgbp` (eu-central-1). Nutzer teilweise
minderjährig — entsprechend vorsichtig mit Daten umgehen.

## Arbeitsregeln (nicht verhandelbar)

1. **Erst besprechen, Plan zeigen, auf "Los" warten.** "Ja" zu einer Liste ist
   Zustimmung zur Diskussion, keine Bauanweisung.
2. **Bei Nummernlisten gilt nur, was ausdrücklich mit "ja" bestätigt wird.**
   Alles andere ist dauerhaft ein Nein, ohne Rückfrage.
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

13 Sprachen (01.10.2026): de, tr, en, ar (rtl), es, ru, sr (lateinisch), ckb (Kurdisch Sorani, rtl),
kmr (Kurdisch Kurmancî), hi, ur (rtl), vi, rif (Tarifit wie in Nador, lateinisch). Darija bewusst nicht
(Entscheidung Serband: Marokkaner lesen Hocharabisch). Flaggen: Kurdisch = Kurdistan-Flagge, Tarifit =
Amazigh-Flagge, beide als kleines SVG (`SPRACHEN[].bild`), weil es kein Emoji gibt. Die Texte der acht neuen
Sprachen stehen im Block SPRACHPAKETE in index.html bzw. spieler.js (erzeugt aus geprüften JSON-Dateien);
die LEEREN Einträge `ru:{}` usw. müssen im I18N-Literal stehen, sonst setzt `if(!I18N[sprache])` beim Start
auf Deutsch zurück. Sorani und Tarifit sollten von Muttersprachlern gegengelesen werden. Web-Recherche eingearbeitet (01.10.2026): Tarifit nach El Aissati (Nador-Lehrbuch)/Serhoual – blau = aziza
(nicht azegzaw), „iwa“ = also (waha = nur!), waqila = vielleicht, weiß = acemlal; Sorani nach Rudaw/K24/Wikipedia –
Ampel = ترافیک لایت, Öl = ڕۆن (nicht زەیت), Kupplung = کلاچ, praktische Prüfung = پراکتیکی. Offen für Muttersprachler:
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
Vault als `untertitel_abgleich_hash` liegt – danach löschen (Stand: gelöscht).
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
- **Kapitel/Fehlerstellen** als jsonb `[{t, titel}]` / `[{t, text}]`; Sprünge im
  Player über das player.js-Protokoll (postMessage). Abspielstelle nur lokal
  (`localStorage.academy_pos`), nie auf dem Server.
- **supabase-js liegt im Repo** (`vendor/`, feste Version). Bei einem Update
  neue Datei mit neuer Versionsnummer anlegen, Script-Tag und `sw.js`
  (STATIC_ASSETS + CACHE_NAME) anpassen.
- **Logo** ist die Datei `logo-264.jpg` (nicht mehr im HTML eingebettet), im
  Service Worker vorgeladen. Neues Logo = neuer Dateiname + `sw.js` anpassen.
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
  Erzeugt werden die Daten mit `werkzeuge/szenen-export.js` (tastet die
  Kompass-Lernszenen und `werkzeuge/szenen/*.js` ab; Übersetzungen in
  `werkzeuge/szenen-texte/{tr,en,ar,es}.json`, gleiche Struktur wie `texte.de`).
  **Cockpit (01.10.2026):** In der Fahrersicht zeichnet `motor.js` Innen- und Außenspiegel live
  (eigene Kameras in kleine Bildpuffer, spiegelverkehrt, jedes 2.–4. Bild) und eine dunkle Leiste;
  Tacho, Blinkerpfeile und Schulterblick-Auge sind HTML in `spieler.js` (Maße aus `welt.cockpitMasse()`).
  Der Spiegel mit Spiegelblick-Signal leuchtet gelb. Handy quer + Fahrersicht = Vollbild.
  Die Kompass-Szenen stammen aus dem öffentlichen Kompass-Repo – die Sperre
  schützt die Akademie-Oberfläche, nicht die Rohdaten.
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
