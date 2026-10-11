-- Testdaten der Server-Gegenprobe Lkw-Bereich (11.10.2026) entfernen.
-- Bereits unschaedlich gemacht (Verkauf 0 EUR, Schueler gesperrt, Videos ausgeblendet);
-- dieses Skript loescht sie ganz. Einmal im Supabase SQL Editor ausfuehren.
delete from academy_verkaeufe where schueler_id in ('ztest_pkw','ztest_lkw');
delete from academy_fortschritt where schueler_id in ('ztest_pkw','ztest_lkw');
delete from academy_sessions where schueler_id in ('ztest_pkw','ztest_lkw');
delete from academy_video_tags where video_id in ('ztest_lkw_frei','ztest_lkw_bezahl');
delete from academy_videos where id in ('ztest_lkw_frei','ztest_lkw_bezahl');
delete from academy_login_versuche where telefon in ('09990000001','09990000002');
delete from academy_schueler where id in ('ztest_pkw','ztest_lkw');
