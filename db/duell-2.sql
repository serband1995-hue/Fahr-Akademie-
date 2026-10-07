-- Spiel 10 "Duell gegen Mitschüler", Teil 2 (07.10.2026): Lösungstabelle + Indizes. Angewendet am 07.10.2026 als Migration spiele_duell_2.
-- (angewendet als Migration "spiele_duell_2" im Projekt fxgljvhpikjcejhghgbp (setzt db/duell.sql voraus), danach get_advisors.
-- Nur NEUE Objekte (Tabelle + Indizes), nichts Bestehendes wird verändert.
--
-- 1. Lösungstabelle: Das Repo ist ÖFFENTLICH. Die richtigen Antworten dürfen deshalb nirgends im Repo stehen (auch nicht in dieser Datei):
--    Sie liegen in der Tabelle academy_duell_loesungen, die NUR die Edge Function academy-spiele (Service Role) liest.
--    RLS an, absichtlich OHNE Policy, anon/authenticated ohne jedes Recht. Die Zeilen (Frage-ID -> Nummer der richtigen Antwort 0-2)
--    kommen aus der PRIVATEN Datei loesungen.sql (erzeugt von werkzeuge/duell-loesungen-erzeugen.mjs, liegt außerhalb des Repos,
--    Standard /home/user/duell-private/loesungen.sql) und werden vom Hauptagenten separat eingespielt. Die Function nimmt für neue
--    Duelle nur Fragen, die in dieser Tabelle stehen; ohne Zeilen kann niemand ein Duell anlegen oder auswerten (503, Runde bleibt offen).
--
-- 2. Teil-Indizes für das Aufräumen der Function (liegengebliebene Runden und nicht gestartete Annahmen). Das Aufräumen läuft höchstens
--    einmal pro Minute je Function-Instanz.

create table public.academy_duell_loesungen (
  frage_id text primary key,
  richtig smallint not null check (richtig between 0 and 2)
);
alter table public.academy_duell_loesungen enable row level security;
revoke all on public.academy_duell_loesungen from anon, authenticated;
comment on table public.academy_duell_loesungen is 'Spiele: Duell, richtige Antwort je Frage-ID (0-2). Geheim: nur die Edge Function academy-spiele (Service Role) liest sie; RLS an, absichtlich ohne Policy. Zeilen kommen aus der privaten Datei loesungen.sql, nie aus dem Repo.';

-- Runden, die ein Ersteller/Gegner gestartet, aber nie abgegeben hat (Aufräumen: Ersteller -> Duell weg, Gegner -> 0 Punkte)
create index academy_spiele_duelle_ersteller_offen_idx on public.academy_spiele_duelle (ersteller_gestartet_am)
  where ersteller_fertig_am is null and ersteller_gestartet_am is not null;
create index academy_spiele_duelle_gegner_offen_idx on public.academy_spiele_duelle (gegner_gestartet_am)
  where gegner_fertig_am is null and gegner_gestartet_am is not null;
-- Angenommen, aber nicht gestartet (nach 24 h geht das Duell zurück auf "offen")
create index academy_spiele_duelle_angenommen_idx on public.academy_spiele_duelle (angenommen_am)
  where status = 'angenommen' and gegner_gestartet_am is null;
