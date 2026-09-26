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
  three.js (`vendor/three-0.186.1.min.js`, fest), Szenen in `verkehr/szenen/`.
  Eine Szene ist eine reine Funktion der Zeit (pose(t), sig(t)) – Springen,
  Anhalten, halbes Tempo ohne Nebenwirkungen. Mitdenken OHNE Bewertung
  (E6 = a): keine Antwortknöpfe, kein Rot/Grün, nichts gespeichert.
  `vorschau.html` ist nur die Musterszene zur Abstimmung (W2), nicht verlinkt.
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
