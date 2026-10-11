-- Lkw-Bereich streng getrennt vom Pkw-Bereich (11.10.2026, Auftrag Serban 10.10.2026)
-- Entscheidungen Serban: ein Schueler darf beide Bereiche haben (Umschalter), Lkw-Vollzugang
-- kostet 110 EUR und wird eigens verkauft, Klassen A und D bleiben aussen vor.
--
-- 1. Jedes Thema gehoert zu einem Fahrzeug: pkw | lkw | alle. Bestehende Themen = pkw.
-- 2. Jeder Schueler hat zugang_pkw / zugang_lkw (darf er in den Bereich?) und
--    vollzugang_lkw (bezahlter Lkw-Vollzugang). Das bisherige vollzugang ist der Pkw-Vollzugang.
--    Fehlen die Angaben beim Anlegen, entscheidet die Klasse: C, CE, C1, C1E -> Lkw, sonst Pkw.
--    Wer Vollzugang fuer ein Fahrzeug hat, hat immer auch Zugang zu dessen Bereich.
-- 3. Lkw-Vollzugang bucht einen eigenen Verkauf (Preis: verkaufspreis_lkw, sonst Einstellung
--    preis_lkw = 110). Die 24-Stunden-Sperre gegen Doppelbuchung gilt je Fahrzeug.
-- 4. Lkw-Bereiche (stufe beginnt mit "Lkw: ") und erste Lkw-Themen. Neue Themen im Bereich
--    "Lkw: Fahrzeug & Technik" sind von Anfang an gratis (Serban: Lkw-Technik frei).

alter table public.academy_tags add column if not exists fahrzeug text not null default 'pkw';
alter table public.academy_tags drop constraint if exists academy_tags_fahrzeug_check;
alter table public.academy_tags add constraint academy_tags_fahrzeug_check check (fahrzeug in ('pkw', 'lkw', 'alle'));

alter table public.academy_schueler
  add column if not exists zugang_pkw boolean,
  add column if not exists zugang_lkw boolean,
  add column if not exists vollzugang_lkw boolean not null default false,
  add column if not exists verkaufspreis_lkw numeric;

update public.academy_schueler
   set zugang_pkw = coalesce(zugang_pkw, vollzugang is true or upper(coalesce(klasse, 'B')) not in ('C', 'CE', 'C1', 'C1E')),
       zugang_lkw = coalesce(zugang_lkw, upper(coalesce(klasse, 'B')) in ('C', 'CE', 'C1', 'C1E'));

create or replace function public.academy_schueler_fahrzeug_zugang()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  v_lkw boolean := upper(coalesce(new.klasse, 'B')) in ('C', 'CE', 'C1', 'C1E');
begin
  if tg_op = 'INSERT' then
    new.zugang_pkw := coalesce(new.zugang_pkw, not v_lkw);
    new.zugang_lkw := coalesce(new.zugang_lkw, v_lkw);
  else
    new.zugang_pkw := coalesce(new.zugang_pkw, old.zugang_pkw, not v_lkw);
    new.zugang_lkw := coalesce(new.zugang_lkw, old.zugang_lkw, v_lkw);
  end if;
  new.vollzugang_lkw := coalesce(new.vollzugang_lkw, false);
  if new.vollzugang is true then new.zugang_pkw := true; end if;
  if new.vollzugang_lkw is true then new.zugang_lkw := true; end if;
  -- Ohne jeden Bereich saehe der Schueler gar nichts: dann gilt die Klasse.
  if not (new.zugang_pkw or new.zugang_lkw) then
    new.zugang_pkw := not v_lkw;
    new.zugang_lkw := v_lkw;
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_academy_schueler_fahrzeug on public.academy_schueler;
create trigger trg_academy_schueler_fahrzeug
  before insert or update on public.academy_schueler
  for each row execute function public.academy_schueler_fahrzeug_zugang();

alter table public.academy_schueler
  alter column zugang_pkw set not null,
  alter column zugang_lkw set not null;
alter table public.academy_schueler drop constraint if exists academy_schueler_ein_bereich;
alter table public.academy_schueler add constraint academy_schueler_ein_bereich check (zugang_pkw or zugang_lkw);

insert into public.academy_einstellungen (schluessel, wert, beschreibung)
values ('preis_lkw', '110', 'Preis Lkw-Vollzugang in EUR (Direktverkauf, ohne eigenen Preis am Schueler)')
on conflict (schluessel) do nothing;

-- Pkw-Verkauf: die 24-Stunden-Sperre zaehlt Lkw-Belege nicht mit.
create or replace function public.academy_vollzugang_verkauf_buchen()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_schule_name     text;
  v_fahrlehrer_name text;
  v_preis           numeric(10,2);
  v_standardpreis   numeric(10,2);
  v_provision       numeric(10,2);
begin
  -- Nur reagieren, wenn vollzugang wirklich NEU auf true wechselt.
  if new.vollzugang is not true or old.vollzugang is true then
    return new;
  end if;

  -- 26.09.2026: Innerhalb von 24 h nach einem Beleg fuer denselben Schueler keinen
  -- zweiten buchen (Rueckgaengig nach versehentlichem Entziehen = keine Doppelabrechnung).
  -- 11.10.2026: Lkw-Belege zaehlen hier nicht (eigener Verkauf).
  if exists (select 1 from academy_verkaeufe
              where schueler_id = new.id and verkauft_am > now() - interval '24 hours'
                and coalesce(notiz, '') not like 'Lkw-Vollzugang%') then
    return new;
  end if;

  if new.schule_id is not null then
    select name, preis_schueler, provision_serband
      into v_schule_name, v_standardpreis, v_provision
      from academy_schulen
     where id = new.schule_id;
    v_preis := coalesce(new.verkaufspreis, v_standardpreis);
  else
    select nullif(wert,'')::numeric(10,2)
      into v_standardpreis
      from academy_einstellungen
     where schluessel = 'preis_direktverkauf';
    v_preis := coalesce(new.verkaufspreis, v_standardpreis);
    v_provision := v_preis;
  end if;

  if new.fahrlehrer_id is not null then
    select name into v_fahrlehrer_name
      from academy_fahrlehrer where id = new.fahrlehrer_id;
  end if;

  insert into academy_verkaeufe (
    schueler_id, schueler_name, schueler_telefon,
    schule_id, schule_name, fahrlehrer_id, fahrlehrer_name,
    verkauft_am, verkaufspreis, provision, quelle, notiz
  ) values (
    new.id, new.name, new.telefon,
    new.schule_id, v_schule_name, new.fahrlehrer_id, v_fahrlehrer_name,
    now(), v_preis, v_provision, 'manuell',
    case when new.verkaufspreis is not null
         then 'Vollzugang freigeschaltet, Preis vom Partner eingetragen'
         else 'Vollzugang freigeschaltet, Standardpreis der Schule' end
  );

  return new;
end;
$function$;

-- Lkw-Verkauf: beim Anlegen mit Lkw-Vollzugang und beim Wechsel auf Lkw-Vollzugang.
-- quelle 'manuell', weil der Eindeutig-Index academy_verkaeufe_erstverkauf_idx nur einen
-- automatischen Erstverkauf je Schueler zulaesst (der gehoert dem Pkw-Zugang).
create or replace function public.academy_lkw_verkauf_buchen()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_schule_name     text;
  v_fahrlehrer_name text;
  v_preis           numeric(10,2);
  v_standardpreis   numeric(10,2);
  v_provision       numeric(10,2);
begin
  if new.vollzugang_lkw is not true then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.vollzugang_lkw is true then
    return new;
  end if;
  if exists (select 1 from academy_verkaeufe
              where schueler_id = new.id and verkauft_am > now() - interval '24 hours'
                and coalesce(notiz, '') like 'Lkw-Vollzugang%') then
    return new;
  end if;

  select nullif(wert,'')::numeric(10,2) into v_standardpreis
    from academy_einstellungen where schluessel = 'preis_lkw';
  v_preis := coalesce(new.verkaufspreis_lkw, v_standardpreis, 110);

  if new.schule_id is not null then
    select name, least(provision_serband, v_preis)
      into v_schule_name, v_provision
      from academy_schulen
     where id = new.schule_id;
  else
    v_provision := v_preis;
  end if;

  if new.fahrlehrer_id is not null then
    select name into v_fahrlehrer_name
      from academy_fahrlehrer where id = new.fahrlehrer_id;
  end if;

  insert into academy_verkaeufe (
    schueler_id, schueler_name, schueler_telefon,
    schule_id, schule_name, fahrlehrer_id, fahrlehrer_name,
    verkauft_am, verkaufspreis, provision, quelle, notiz
  ) values (
    new.id, new.name, new.telefon,
    new.schule_id, v_schule_name, new.fahrlehrer_id, v_fahrlehrer_name,
    now(), v_preis, coalesce(v_provision, v_preis), 'manuell',
    case when new.verkaufspreis_lkw is not null
         then 'Lkw-Vollzugang freigeschaltet, Preis eingetragen'
         else 'Lkw-Vollzugang freigeschaltet, Standardpreis' end
  );

  return new;
end;
$function$;

drop trigger if exists trg_academy_lkw_verkauf on public.academy_schueler;
create trigger trg_academy_lkw_verkauf
  after insert or update of vollzugang_lkw on public.academy_schueler
  for each row execute function public.academy_lkw_verkauf_buchen();

-- Neue Themen im Bereich "Lkw: Fahrzeug & Technik" sind gratis (spaeter abschaltbar).
create or replace function public.academy_tags_lkw_technik_gratis()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.stufe = 'Lkw: Fahrzeug & Technik' then
    new.gratis := true;
    new.fahrzeug := 'lkw';
  elsif new.stufe like 'Lkw: %' then
    new.fahrzeug := 'lkw';
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_academy_tags_lkw on public.academy_tags;
create trigger trg_academy_tags_lkw
  before insert on public.academy_tags
  for each row execute function public.academy_tags_lkw_technik_gratis();

-- Erste Lkw-Themen (Serban kann sie in der Verwaltung umbenennen oder ergaenzen)
insert into public.academy_tags (id, label, stufe, reihenfolge, gratis, archiviert, fahrzeug) values
  ('lkw_abfahrtkontrolle', 'Abfahrtkontrolle Lkw',               'Lkw: Fahrzeug & Technik',   1001, true,  false, 'lkw'),
  ('lkw_druckluftbremse',  'Druckluftbremse prüfen',             'Lkw: Fahrzeug & Technik',   1002, true,  false, 'lkw'),
  ('lkw_technik',          'Technik am Lkw',                     'Lkw: Fahrzeug & Technik',   1003, true,  false, 'lkw'),
  ('lkw_kuppeln',          'Ankuppeln und Abkuppeln',            'Lkw: Kuppeln & Rangieren',  1011, false, false, 'lkw'),
  ('lkw_rangieren',        'Rangieren und Rückwärtsfahren',      'Lkw: Kuppeln & Rangieren',  1012, false, false, 'lkw'),
  ('lkw_toter_winkel',     'Toter Winkel und Abbiegen',          'Lkw: Fahren im Verkehr',    1021, false, false, 'lkw'),
  ('lkw_abstand',          'Abstand, Bremsweg und Gefälle',      'Lkw: Fahren im Verkehr',    1022, false, false, 'lkw'),
  ('lkw_lenkzeiten',       'Lenk- und Ruhezeiten',               'Lkw: Lenk- und Ruhezeiten', 1031, false, false, 'lkw'),
  ('lkw_fahrtenschreiber', 'Fahrtenschreiber bedienen',          'Lkw: Lenk- und Ruhezeiten', 1032, false, false, 'lkw'),
  ('lkw_pruefungsfahrt',   'Prüfungsfahrt Lkw',                  'Lkw: Prüfung',              1041, false, false, 'lkw')
on conflict (id) do nothing;

-- Nachtrag (11.10.2026, get_advisors): Trigger-Funktionen nicht per API aufrufbar.
revoke execute on function public.academy_lkw_verkauf_buchen() from public, anon, authenticated;
revoke execute on function public.academy_schueler_fahrzeug_zugang() from public, anon, authenticated;
revoke execute on function public.academy_tags_lkw_technik_gratis() from public, anon, authenticated;
