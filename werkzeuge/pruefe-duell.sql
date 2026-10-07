-- SQL-Prüfung der Migrationen db/duell.sql und db/duell-2.sql (06./07.10.2026) gegen eine WEGWERF-Datenbank mit echtem PostgreSQL.
-- NIEMALS gegen das echte Supabase-Projekt ausführen: die Datei bricht ab, sobald academy_schueler Zeilen enthält, und schreibt Testzeilen.
--
-- Vorbereitung (einmal, lokaler PostgreSQL 16, Datenbank t1):
--   create role anon; create role authenticated; create role service_role;
--   create table public.academy_schueler (id text primary key, name text, aktiv boolean not null default true, archiviert_am timestamptz);
--   psql -d t1 -f db/spiele-rahmen.sql   (legt die Rahmen-Tabellen und academy_spiele_anzeigename an; braucht die Tabelle oben)
--   psql -d t1 -f db/duell.sql
--   psql -d t1 -f db/duell-2.sql   (Lösungstabelle + Teil-Indizes; ohne die Lösungen selbst: die liegen privat außerhalb des Repos)
-- Aufruf:  psql -d t1 -v ON_ERROR_STOP=1 -f werkzeuge/pruefe-duell.sql
-- Ausgabe: je Prüfung eine Zeile "ok ..."; bei einem Fehler bricht psql mit der Meldung ab.
begin;

do $$ begin
  if exists (select 1 from public.academy_schueler) then raise exception 'academy_schueler ist nicht leer: nur gegen eine leere Wegwerf-Datenbank ausführen'; end if;
end $$;

insert into public.academy_schueler (id, name, aktiv, archiviert_am) values
  ('s1', 'Mira Kaya', true, null), ('s2', 'Jonas Weber', true, null), ('s3', 'Ali Reza Karimi', true, null),
  ('s4', 'Karl Gesperrt', false, null), ('s5', 'Nora Archiv', true, now());
insert into public.academy_spiele_profil (schueler_id, sichtbar) values ('s2', false);   -- s2 ist im Ranking ausgeblendet

create temp table t_f as select array['q01','q02','q03','q04','q05','q06','q07','q08']::text[] as f;

-- ===== Tabelle: Regeln =====
do $$ declare f text[] := (select f from t_f); begin
  insert into public.academy_spiele_duelle (ersteller, fragen) values ('s1', f);
  begin insert into public.academy_spiele_duelle (ersteller, fragen) values ('s1', f[1:7]); raise exception 'FEHLER: 7 Fragen angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_spiele_duelle (ersteller, fragen) values ('s1', array_append(f, 'q09')); raise exception 'FEHLER: 9 Fragen angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_spiele_duelle (ersteller, gegner, fragen, status) values ('s1', 's1', f, 'angenommen'); raise exception 'FEHLER: Duell gegen sich selbst angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_spiele_duelle (ersteller, gegner, fragen, status) values ('s1', 's2', f, 'offen'); raise exception 'FEHLER: offen mit Gegner angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_spiele_duelle (ersteller, fragen, status) values ('s1', f, 'angenommen'); raise exception 'FEHLER: angenommen ohne Gegner angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_spiele_duelle (ersteller, fragen, status) values ('s1', f, 'irgendwas'); raise exception 'FEHLER: unbekannter Status angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_spiele_duelle (ersteller, gegner, fragen, status) values ('s1', 's2', f, 'fertig'); raise exception 'FEHLER: fertig ohne beide Ergebnisse angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_spiele_duelle (ersteller, fragen, punkte_ersteller) values ('s1', f, 9999); raise exception 'FEHLER: Punkte über 5000 angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_spiele_duelle (ersteller, fragen, ersteller_fertig_am) values ('s1', f, now()); raise exception 'FEHLER: Ergebnis ohne Start angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_spiele_duelle (ersteller, fragen) values ('gibtesnicht', f); raise exception 'FEHLER: unbekannter Schüler angenommen';
  exception when foreign_key_violation then null; end;
  raise notice 'ok  Tabelle: 7 Regeln (8 Fragen, nicht gegen sich selbst, offen <=> ohne Gegner, fertig nur mit beiden Ergebnissen, Punktegrenze, Reihenfolge, Fremdschlüssel)';
end $$;
delete from public.academy_spiele_duelle;

-- ===== Funktionen: Sichtbarkeit =====
do $$ declare f text[] := (select f from t_f); n jsonb; o jsonb; begin
  n := public.academy_duell_namen(array['s1','s2','s3','s4','s5','gibtesnicht']);
  if n <> '{"s1": "Mira K.", "s3": "Ali K."}'::jsonb then raise exception 'FEHLER namen: %', n; end if;
  if public.academy_duell_namen(null) <> '{}'::jsonb or public.academy_duell_namen('{}') <> '{}'::jsonb then raise exception 'FEHLER namen leer'; end if;
  raise notice 'ok  academy_duell_namen: nur sichtbare, aktive, nicht archivierte Schüler; nur Vorname + 1 Buchstabe';

  -- offene Herausforderungen: s1 fertig+offen (zählt), s2 versteckt, s3 noch nicht gespielt, s4 gesperrt, s5 archiviert, ein abgelaufenes und ein vergebenes
  insert into public.academy_spiele_duelle (id, ersteller, fragen, ersteller_gestartet_am, ersteller_fertig_am, punkte_ersteller, richtig_ersteller, erstellt_am) values
    ('00000000-0000-4000-8000-000000000001', 's1', f, now(), now(), 900, 7, now() - interval '1 hour'),
    ('00000000-0000-4000-8000-000000000002', 's2', f, now(), now(), 900, 7, now()),
    ('00000000-0000-4000-8000-000000000003', 's3', f, null, null, null, null, now()),
    ('00000000-0000-4000-8000-000000000004', 's4', f, now(), now(), 900, 7, now()),
    ('00000000-0000-4000-8000-000000000005', 's5', f, now(), now(), 900, 7, now()),
    ('00000000-0000-4000-8000-000000000006', 's1', f, now(), now(), 500, 4, now() - interval '8 days'),
    ('00000000-0000-4000-8000-000000000008', 's3', f, now(), now(), 800, 6, now() - interval '30 minutes');
  insert into public.academy_spiele_duelle (id, ersteller, gegner, status, fragen, ersteller_gestartet_am, ersteller_fertig_am, punkte_ersteller, richtig_ersteller, erstellt_am) values
    ('00000000-0000-4000-8000-000000000007', 's1', 's3', 'angenommen', f, now(), now(), 900, 7, now());
  o := public.academy_duell_offene('s2', now() - interval '7 days', 20);   -- s2 ist selbst ausgeblendet, darf aber lesen
  if jsonb_array_length(o) <> 2 then raise exception 'FEHLER offene: %', o; end if;
  if o->0->>'id' <> '00000000-0000-4000-8000-000000000008' or o->1->>'id' <> '00000000-0000-4000-8000-000000000001' then raise exception 'FEHLER Reihenfolge (neueste zuerst): %', o; end if;
  if o->0->>'name' <> 'Ali K.' or o->1->>'name' <> 'Mira K.' then raise exception 'FEHLER Namen: %', o; end if;
  if (select array_agg(k order by k) from jsonb_object_keys(o->0) k) <> array['erstellt_am','id','name'] then raise exception 'FEHLER: mehr Felder als id/name/erstellt_am: %', o->0; end if;
  if jsonb_array_length(public.academy_duell_offene('s1', now() - interval '7 days', 20)) <> 1 then raise exception 'FEHLER: eigenes Duell steht in der eigenen Liste'; end if;
  if jsonb_array_length(public.academy_duell_offene('s3', now() - interval '7 days', 1)) <> 1 then raise exception 'FEHLER limit'; end if;
  if jsonb_array_length(public.academy_duell_offene('s2', now() - interval '9 days', 20)) <> 3 then raise exception 'FEHLER: p_ab (Verfall) wird nicht beachtet'; end if;
  if public.academy_duell_offene('s2', now() - interval '7 days', null) is null or jsonb_typeof(public.academy_duell_offene('nobody', now(), 5)) <> 'array' then raise exception 'FEHLER leer'; end if;
  raise notice 'ok  academy_duell_offene: nur gespielte, offene, nicht verfallene Duelle sichtbarer Schüler; nicht die eigenen; neueste zuerst; nur id/name/erstellt_am';
end $$;
delete from public.academy_spiele_duelle;

-- ===== Löschen mit dem Schüler (Datensparsamkeit) =====
do $$ declare f text[] := (select f from t_f); begin
  insert into public.academy_schueler (id, name) values ('s9', 'Tom Weg');
  insert into public.academy_spiele_duelle (ersteller, gegner, status, fragen) values ('s1', 's9', 'angenommen', f), ('s9', null, 'offen', f);
  delete from public.academy_schueler where id = 's9';
  if (select count(*) from public.academy_spiele_duelle) <> 0 then raise exception 'FEHLER: Duelle blieben nach dem Löschen des Schülers stehen'; end if;
  raise notice 'ok  on delete cascade: beim Löschen eines Schülers verschwinden seine Duelle (als Ersteller und als Gegner)';
end $$;

-- ===== Zugriff nur für die Edge Function =====
do $$ begin
  if not (select relrowsecurity from pg_class where oid = 'public.academy_spiele_duelle'::regclass) then raise exception 'FEHLER: RLS aus'; end if;
  if exists (select 1 from pg_policies where tablename = 'academy_spiele_duelle') then raise exception 'FEHLER: es gibt eine Policy (sollte absichtlich keine geben)'; end if;
  if has_table_privilege('anon', 'public.academy_spiele_duelle', 'select,insert,update,delete') or has_table_privilege('authenticated', 'public.academy_spiele_duelle', 'select,insert,update,delete') then raise exception 'FEHLER: anon/authenticated haben Tabellenrechte'; end if;
  if has_function_privilege('anon', 'public.academy_duell_namen(text[])', 'execute') or has_function_privilege('authenticated', 'public.academy_duell_namen(text[])', 'execute')
     or has_function_privilege('anon', 'public.academy_duell_offene(text,timestamptz,integer)', 'execute') or has_function_privilege('authenticated', 'public.academy_duell_offene(text,timestamptz,integer)', 'execute') then raise exception 'FEHLER: anon/authenticated dürfen die Funktionen ausführen'; end if;
  if not has_function_privilege('service_role', 'public.academy_duell_namen(text[])', 'execute') or not has_function_privilege('service_role', 'public.academy_duell_offene(text,timestamptz,integer)', 'execute') then raise exception 'FEHLER: service_role darf nicht'; end if;
  if (select count(*) from pg_proc p where p.proname in ('academy_duell_namen', 'academy_duell_offene') and p.prosecdef and p.proconfig @> array['search_path=""']) <> 2 then raise exception 'FEHLER: security definer / search_path leer fehlt'; end if;
  if exists (select 1 from pg_proc p where p.proname in ('academy_duell_namen', 'academy_duell_offene') and has_function_privilege('public', p.oid, 'execute')) then raise exception 'FEHLER: PUBLIC darf ausführen'; end if;
  raise notice 'ok  Zugriff: RLS an ohne Policy, anon/authenticated/public ohne Rechte, nur service_role darf die Funktionen, security definer mit leerem search_path';
end $$;

-- ===== wirklich als anon/authenticated versuchen =====
do $$ begin
  set local role anon;
  begin perform count(*) from public.academy_spiele_duelle; raise exception 'FEHLER: anon konnte lesen'; exception when insufficient_privilege then null; end;
  begin perform public.academy_duell_offene('s1', now(), 5); raise exception 'FEHLER: anon konnte Funktion aufrufen'; exception when insufficient_privilege then null; end;
  reset role; set local role authenticated;
  begin perform count(*) from public.academy_spiele_duelle; raise exception 'FEHLER: authenticated konnte lesen'; exception when insufficient_privilege then null; end;
  begin perform public.academy_duell_namen(array['s1']); raise exception 'FEHLER: authenticated konnte Funktion aufrufen'; exception when insufficient_privilege then null; end;
  reset role; set local role service_role;
  perform public.academy_duell_namen(array['s1']);
  reset role;
  raise notice 'ok  als anon/authenticated gesperrt, als service_role erlaubt';
end $$;

-- ===== db/duell-2.sql: Lösungstabelle, Indizes, Zustandswechsel der Function (07.10.2026) =====
do $$ begin
  insert into public.academy_duell_loesungen (frage_id, richtig) values ('t01', 0), ('t02', 1), ('t03', 2);
  begin insert into public.academy_duell_loesungen (frage_id, richtig) values ('t04', 3); raise exception 'FEHLER: Lösung 3 angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_duell_loesungen (frage_id, richtig) values ('t05', -1); raise exception 'FEHLER: Lösung -1 angenommen';
  exception when check_violation then null; end;
  begin insert into public.academy_duell_loesungen (frage_id, richtig) values ('t06', null); raise exception 'FEHLER: Lösung null angenommen';
  exception when not_null_violation then null; end;
  begin insert into public.academy_duell_loesungen (frage_id, richtig) values ('t01', 1); raise exception 'FEHLER: doppelte Frage-ID angenommen';
  exception when unique_violation then null; end;
  insert into public.academy_duell_loesungen (frage_id, richtig) values ('t01', 2) on conflict (frage_id) do update set richtig = excluded.richtig;   -- so spielt loesungen.sql ein (wiederholbar)
  if (select richtig from public.academy_duell_loesungen where frage_id = 't01') <> 2 then raise exception 'FEHLER: on conflict do update'; end if;
  raise notice 'ok  academy_duell_loesungen: Frage-ID eindeutig, Lösung nur 0-2 und nicht null, wiederholbares Einspielen';
end $$;
do $$ begin
  if not (select relrowsecurity from pg_class where oid = 'public.academy_duell_loesungen'::regclass) then raise exception 'FEHLER: RLS aus (Lösungstabelle)'; end if;
  if exists (select 1 from pg_policies where tablename = 'academy_duell_loesungen') then raise exception 'FEHLER: Policy auf der Lösungstabelle (es darf absichtlich keine geben)'; end if;
  if has_table_privilege('anon', 'public.academy_duell_loesungen', 'select,insert,update,delete') or has_table_privilege('authenticated', 'public.academy_duell_loesungen', 'select,insert,update,delete') then raise exception 'FEHLER: anon/authenticated haben Rechte auf die Lösungstabelle'; end if;
  set local role anon;
  begin perform count(*) from public.academy_duell_loesungen; raise exception 'FEHLER: anon konnte die Lösungen lesen'; exception when insufficient_privilege then null; end;
  reset role; set local role authenticated;
  begin perform count(*) from public.academy_duell_loesungen; raise exception 'FEHLER: authenticated konnte die Lösungen lesen'; exception when insufficient_privilege then null; end;
  reset role;
  raise notice 'ok  Lösungstabelle: RLS an ohne Policy, anon/authenticated ohne jedes Recht (auch real versucht)';
end $$;
do $$ begin
  if (select count(*) from pg_indexes where schemaname = 'public' and tablename = 'academy_spiele_duelle' and indexname in ('academy_spiele_duelle_ersteller_offen_idx', 'academy_spiele_duelle_gegner_offen_idx', 'academy_spiele_duelle_angenommen_idx')) <> 3 then raise exception 'FEHLER: Teil-Indizes fehlen'; end if;
  if (select count(*) from pg_index i join pg_class c on c.oid = i.indexrelid where c.relname in ('academy_spiele_duelle_ersteller_offen_idx', 'academy_spiele_duelle_gegner_offen_idx', 'academy_spiele_duelle_angenommen_idx') and i.indpred is not null) <> 3 then raise exception 'FEHLER: die drei Indizes sind keine Teil-Indizes'; end if;
  raise notice 'ok  3 Teil-Indizes (ersteller_gestartet_am, gegner_gestartet_am, angenommen_am) vorhanden';
end $$;
do $$ declare f text[] := (select f from t_f); begin
  -- N3: angenommen, nicht gestartet -> zurück auf offen (so setzt die Function es zurück); die Constraints müssen das zulassen
  insert into public.academy_spiele_duelle (id, ersteller, gegner, status, fragen, angenommen_am, ersteller_gestartet_am, ersteller_fertig_am, punkte_ersteller, richtig_ersteller)
    values ('00000000-0000-4000-8000-0000000000a1', 's1', 's3', 'angenommen', f, now() - interval '25 hours', now(), now(), 900, 7);
  update public.academy_spiele_duelle set gegner = null, status = 'offen', angenommen_am = null
    where status = 'angenommen' and gegner_gestartet_am is null and angenommen_am < now() - interval '24 hours';
  if (select status from public.academy_spiele_duelle where id = '00000000-0000-4000-8000-0000000000a1') <> 'offen' then raise exception 'FEHLER: Zurücksetzen auf offen'; end if;
  -- M4: beide Ergebnisse da, Status nicht fertig -> fertig (fertig_am gesetzt)
  insert into public.academy_spiele_duelle (id, ersteller, gegner, status, fragen, angenommen_am, ersteller_gestartet_am, ersteller_fertig_am, punkte_ersteller, richtig_ersteller, gegner_gestartet_am, gegner_fertig_am, punkte_gegner, richtig_gegner)
    values ('00000000-0000-4000-8000-0000000000a2', 's1', 's3', 'angenommen', f, now(), now(), now(), 900, 7, now(), now(), 0, 0);
  update public.academy_spiele_duelle set status = 'fertig', fertig_am = now() where id in (select id from public.academy_spiele_duelle where status <> 'fertig' and ersteller_fertig_am is not null and gegner_fertig_am is not null limit 50);
  if (select status from public.academy_spiele_duelle where id = '00000000-0000-4000-8000-0000000000a2') <> 'fertig' then raise exception 'FEHLER: Reparatur auf fertig'; end if;
  raise notice 'ok  Zustandswechsel der Function (offen zurücksetzen, fertig reparieren) verletzen keine Constraint';
end $$;
delete from public.academy_spiele_duelle;

rollback;
