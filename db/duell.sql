-- Spiel 10 "Duell gegen Mitschüler" (Wissensduell, asynchron): Tabelle + zwei Lese-Funktionen.
-- angewendet am 07.10.2026 als Migration spiele_duell (Projekt fxgljvhpikjcejhghgbp). Weiter geht es in db/duell-2.sql (Lösungstabelle, Indizes).
-- Nur NEUE Objekte, nichts Bestehendes wird verändert; setzt db/spiele-rahmen.sql voraus
-- (academy_spiele_profil, academy_spiele_anzeigename).
-- Zugriff NUR über die Edge Function academy-spiele (Service Role), wie bei den anderen Spiele-Tabellen:
-- RLS an, absichtlich OHNE Policy; Funktionen nur für service_role, search_path leer.
--
-- Ablauf (Details: werkzeuge/edge-functions/academy-spiele.ts, Aktionen duell_*):
--   offen        Ersteller hat das Duell angelegt (Server zieht 8 feste Fragen-IDs), Gegner fehlt
--   angenommen   ein Mitschüler hat es angenommen (gegner gesetzt)
--   fertig       beide Seiten haben gespielt; Ergebnis steht (Punkte gegeneinander)
-- Jede Seite startet GENAU EINMAL (*_gestartet_am wird beim Start gesetzt) und wird genau einmal ausgewertet (*_fertig_am).
-- Verfallen (nach 7 Tagen ohne Ergebnis) wird aus erstellt_am berechnet; die Function räumt alte Zeilen auf.
-- schueler_id-Spalten sind text (academy_schueler.id ist text, nicht uuid).

create table public.academy_spiele_duelle (
  id uuid primary key default gen_random_uuid(),
  erstellt_am timestamptz not null default now(),
  ersteller text not null references public.academy_schueler(id) on delete cascade,
  gegner text references public.academy_schueler(id) on delete cascade,
  fragen text[] not null check (array_length(fragen, 1) = 8),
  status text not null default 'offen' check (status in ('offen', 'angenommen', 'fertig')),
  angenommen_am timestamptz,
  ersteller_gestartet_am timestamptz,
  ersteller_fertig_am timestamptz,
  punkte_ersteller integer check (punkte_ersteller between 0 and 5000),
  richtig_ersteller smallint check (richtig_ersteller between 0 and 8),
  gegner_gestartet_am timestamptz,
  gegner_fertig_am timestamptz,
  punkte_gegner integer check (punkte_gegner between 0 and 5000),
  richtig_gegner smallint check (richtig_gegner between 0 and 8),
  fertig_am timestamptz,
  -- niemand spielt gegen sich selbst
  constraint duell_nicht_selbst check (gegner is null or gegner <> ersteller),
  -- offen <=> noch kein Gegner
  constraint duell_gegner_zu_status check ((status = 'offen') = (gegner is null)),
  -- ein Ergebnis gibt es nur zu einer gestarteten Seite
  constraint duell_ersteller_reihenfolge check (ersteller_fertig_am is null or ersteller_gestartet_am is not null),
  constraint duell_gegner_reihenfolge check (gegner_fertig_am is null or (gegner_gestartet_am is not null and gegner is not null)),
  -- fertig <=> beide Seiten haben ein Ergebnis
  constraint duell_fertig_vollstaendig check (status <> 'fertig' or (ersteller_fertig_am is not null and gegner_fertig_am is not null and fertig_am is not null))
);
create index academy_spiele_duelle_ersteller_idx on public.academy_spiele_duelle (ersteller, erstellt_am desc);
create index academy_spiele_duelle_gegner_idx on public.academy_spiele_duelle (gegner, erstellt_am desc) where gegner is not null;
create index academy_spiele_duelle_offen_idx on public.academy_spiele_duelle (erstellt_am desc) where status = 'offen' and ersteller_fertig_am is not null;
create index academy_spiele_duelle_alt_idx on public.academy_spiele_duelle (erstellt_am);
alter table public.academy_spiele_duelle enable row level security;
revoke all on public.academy_spiele_duelle from anon, authenticated;
comment on table public.academy_spiele_duelle is 'Spiele: Wissensduell zwischen zwei Schülern (asynchron). Nur Punkte und Zeitpunkte, keine einzelnen Antworten. Zugriff nur über die Edge Function academy-spiele. Fertige Duelle werden nach 90 Tagen gelöscht, unbeantwortete nach 14 Tagen; mit dem Schüler werden auch seine Duelle gelöscht.';

-- Namen für die Anzeige: nur Vorname + 1 Buchstabe und NUR für Schüler, die im Ranking sichtbar sind (aktiv, nicht archiviert, nicht ausgeblendet).
-- Ergebnis: {"<schueler_id>": "Mira K.", ...}; wer fehlt, wird in der App als "Mitschüler" gezeigt.
create or replace function public.academy_duell_namen(p_ids text[])
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(s.id, public.academy_spiele_anzeigename(s.name)), '{}'::jsonb)
  from public.academy_schueler s
  left join public.academy_spiele_profil p on p.schueler_id = s.id
  where s.id = any (coalesce(p_ids, '{}'::text[]))
    and coalesce(p.sichtbar, true) and s.aktiv and s.archiviert_am is null;
$$;

-- Offene Herausforderungen: Ersteller hat seine Runde gespielt, noch kein Gegner, nicht verfallen (p_ab = frühester Zeitpunkt),
-- nicht von mir selbst, Ersteller im Ranking sichtbar. Liefert NUR id, Anzeigename und Zeitpunkt.
create or replace function public.academy_duell_offene(p_ich text, p_ab timestamptz, p_limit integer)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'erstellt_am', x.erstellt_am) order by x.erstellt_am desc), '[]'::jsonb)
  from (
    select d.id, public.academy_spiele_anzeigename(s.name) as name, d.erstellt_am
    from public.academy_spiele_duelle d
    join public.academy_schueler s on s.id = d.ersteller
    left join public.academy_spiele_profil p on p.schueler_id = d.ersteller
    where d.status = 'offen' and d.gegner is null and d.ersteller_fertig_am is not null
      and d.ersteller <> p_ich and d.erstellt_am > p_ab
      and coalesce(p.sichtbar, true) and s.aktiv and s.archiviert_am is null
    order by d.erstellt_am desc
    limit least(greatest(coalesce(p_limit, 20), 1), 50)
  ) x;
$$;

revoke all on function public.academy_duell_namen(text[]) from public, anon, authenticated;
revoke all on function public.academy_duell_offene(text, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.academy_duell_namen(text[]) to service_role;
grant execute on function public.academy_duell_offene(text, timestamptz, integer) to service_role;
