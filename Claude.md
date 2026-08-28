# Fahr-Akademie — Projektgedächtnis

Vanilla-JS-App (eine `index.html`, ~3.740 Zeilen) für Fahrschüler. Backend:
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
  (alle 17 Functions sind bewusst öffentlich, machen ihre eigene Prüfung).
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
- **Prüfungsvideos sind bewusst ohne Sperre.** Falls je ein Quiz oder ein
  Lernpfad mit Sperre gebaut wird: Prüfungsstrecken (`academy_pruefer`)
  bleiben frei zugänglich, das ist expliziter Wunsch.
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
