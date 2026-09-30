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

Fünf Sprachen: de, tr, en, ar (rtl), **es**. Regel (Serband): **alles, was
Schüler sehen, in allen Sprachen** – kein fester deutscher Text im Schülerteil,
immer `t("…")` mit Schlüssel in allen Sprachen (fehlt einer, erscheint Deutsch).
Nur die Rechtstexte (Impressum, Datenschutz, AGB, Widerruf) und die StVO-PDFs
bleiben deutsch; die Übersicht sagt das in der jeweiligen Sprache. Inhalte aus
der Datenbank (Bereiche, Themen, Videotitel/-beschreibungen) in
`academy_uebersetzungen` – neue Videos brauchen dort alle vier Fremdsprachen.
Textkarten "Nützliches": `NUETZLICH_UE`. Die Verwaltung bleibt deutsch.
Neue Sprache = `SPRACHEN`, `I18N`, `PRUEFUNGSTAG`, `NUETZLICH_UE`, `UI` in
`verkehr/spieler.js`, `SPRACHEN` in der Edge Function `academy-szene`,
`werkzeuge/szenen-texte/<sprache>.json` und die Beschriftungen im
Szenen-Export (`szenen-export.js`, `werkzeuge/szenen/*.js`).
Sprachwahl (30.09.2026): EIN Knopf mit Flagge (Login + Konto), die Auswahl öffnet ein
Blatt (`spracheWaehlen()`); Flagge steht in `SPRACHEN[].flagge` (Arabisch vorerst
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
Fremdsprachen automatisch ein (`captions=<sprache>`), Deutsch ohne. Fertig:
`v_kontrollleuchten` (de/tr/en/ar/es).

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
  Die Kompass-Szenen stammen aus dem öffentlichen Kompass-Repo – die Sperre
  schützt die Akademie-Oberfläche, nicht die Rohdaten.
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
