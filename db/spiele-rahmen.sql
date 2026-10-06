-- Spiele-Bereich (06.10.2026): Bestwerte, Runden-Prüfung, Sichtbarkeit im Ranking.
-- BEREITS ANGEWENDET als Migration "spiele_rahmen_ranking" im Projekt fxgljvhpikjcejhghgbp (nur zur Nachvollziehbarkeit hier abgelegt).
-- Zugriff NUR über die Edge Function academy-spiele (Service Role). RLS an, absichtlich ohne Policy.

create table public.academy_spiele_runden (
  id uuid primary key default gen_random_uuid(),
  schueler_id text not null references public.academy_schueler(id) on delete cascade,
  spiel text not null check (spiel ~ '^[a-z0-9_]{1,30}$'),
  gestartet_am timestamptz not null default now(),
  benutzt boolean not null default false
);
create index academy_spiele_runden_schueler_idx on public.academy_spiele_runden (schueler_id, gestartet_am desc);
alter table public.academy_spiele_runden enable row level security;
comment on table public.academy_spiele_runden is 'Spiele: jede Runde wird vom Server gestartet und genau einmal abgeschlossen (Schutz gegen erfundene Ergebnisse). Alte Runden werden beim Start aufgeräumt.';

create table public.academy_spiele_bestwerte (
  schueler_id text not null references public.academy_schueler(id) on delete cascade,
  spiel text not null check (spiel ~ '^[a-z0-9_]{1,30}$'),
  wert integer not null,
  erreicht_am timestamptz not null default now(),
  versuche integer not null default 1,
  primary key (schueler_id, spiel)
);
alter table public.academy_spiele_bestwerte enable row level security;
comment on table public.academy_spiele_bestwerte is 'Spiele: bester Wert je Schüler und Spiel (Reaktionszeit in ms usw.). Wird mit dem Schüler gelöscht.';

create table public.academy_spiele_profil (
  schueler_id text primary key references public.academy_schueler(id) on delete cascade,
  sichtbar boolean not null default true,
  geaendert_am timestamptz not null default now()
);
alter table public.academy_spiele_profil enable row level security;
comment on table public.academy_spiele_profil is 'Spiele: Schüler kann sich aus dem Ranking ausblenden (Standard: sichtbar mit Vorname + 1 Buchstabe).';

revoke all on public.academy_spiele_runden, public.academy_spiele_bestwerte, public.academy_spiele_profil from anon, authenticated;

-- Anzeigename: Vorname + erster Buchstabe des letzten Namensteils ("Serban D.")
create or replace function public.academy_spiele_anzeigename(p_name text)
returns text language sql immutable security definer set search_path = '' as $$
  select case
    when coalesce(array_length(w, 1), 0) >= 2
      then left(w[1], 15) || ' ' || upper(left(w[array_length(w, 1)], 1)) || '.'
    else coalesce(nullif(left(w[1], 15), ''), 'Spieler')
  end
  from (select regexp_split_to_array(btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')), ' ') as w) x;
$$;

-- Rangliste: nur sichtbare, aktive, nicht archivierte Schüler; Gleichstand -> wer es zuerst geschafft hat
create or replace function public.academy_spiele_rangliste(p_spiel text, p_aufsteigend boolean, p_limit integer, p_ich text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 10), 1), 50);
  v_erg jsonb;
begin
  with sicht as (
    select b.schueler_id, public.academy_spiele_anzeigename(s.name) as name, b.wert, b.erreicht_am
    from public.academy_spiele_bestwerte b
    join public.academy_schueler s on s.id = b.schueler_id
    left join public.academy_spiele_profil p on p.schueler_id = b.schueler_id
    where b.spiel = p_spiel and coalesce(p.sichtbar, true) and s.aktiv and s.archiviert_am is null
  ), rang as (
    select schueler_id, name, wert,
      (row_number() over (order by case when p_aufsteigend then wert else -wert end, erreicht_am))::integer as platz
    from sicht
  )
  select jsonb_build_object(
    'top', coalesce((select jsonb_agg(jsonb_build_object('platz', platz, 'name', name, 'wert', wert, 'ich', schueler_id = p_ich) order by platz)
                     from rang where platz <= v_limit), '[]'::jsonb),
    'ich', (select jsonb_build_object('platz', platz, 'wert', wert) from rang where schueler_id = p_ich),
    'gesamt', (select count(*) from rang)
  ) into v_erg;
  return v_erg;
end;
$$;

revoke all on function public.academy_spiele_anzeigename(text) from public, anon, authenticated;
revoke all on function public.academy_spiele_rangliste(text, boolean, integer, text) from public, anon, authenticated;
grant execute on function public.academy_spiele_anzeigename(text) to service_role;
grant execute on function public.academy_spiele_rangliste(text, boolean, integer, text) to service_role;
