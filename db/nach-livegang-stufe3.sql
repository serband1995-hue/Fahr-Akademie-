-- Stufe 3 / S1 + E4a (vorbereitet 26.09.2026)
-- ERST AUSFUEHREN, WENN die App-Version mit academy-katalog LIVE ist (GitHub Pages).
-- Vorher wuerde die alte App einen leeren Katalog sehen.
--
-- Wirkung: Video-IDs, Pruefernamen und Pruefer-Zuordnungen sind nicht mehr ohne
-- Anmeldung lesbar. Schueler bekommen den Katalog ueber die Edge Function
-- academy-katalog (prueft die Schueler-Session), die Verwaltung liest weiter direkt
-- (eingeloggt, Rolle super_admin oder schule).
-- Themen, Gebiete und Uebersetzungen bleiben lesbar (keine sensiblen Daten).

drop policy if exists "Videos lesbar für alle" on public.academy_videos;
create policy "Videos: Verwaltung liest" on public.academy_videos
  for select to authenticated using (academy_my_role() in ('super_admin','schule'));

drop policy if exists "Pruefer lesbar fuer alle" on public.academy_pruefer;
create policy "Pruefer: Verwaltung liest" on public.academy_pruefer
  for select to authenticated using (academy_my_role() in ('super_admin','schule'));

drop policy if exists "VideoPruefer lesbar fuer alle" on public.academy_video_pruefer;
create policy "VideoPruefer: Verwaltung liest" on public.academy_video_pruefer
  for select to authenticated using (academy_my_role() in ('super_admin','schule'));

-- Pruefung danach (muss 0/0/0 ergeben):
-- begin; set local role anon;
-- select (select count(*) from academy_videos), (select count(*) from academy_pruefer), (select count(*) from academy_video_pruefer);
-- rollback;
