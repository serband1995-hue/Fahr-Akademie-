-- ============================================================
-- Bewertungen für die Webseite www.fahrlehrer-serband.de
-- Stand: 30.09.2026, eingespielt als Migration website_bewertungen
--
-- Pflege: Verwaltung → Reiter „Bewertungen“ (nur Super-Admin).
-- Besucher der Webseite lesen NICHT die Tabelle, sondern nur die
-- sichtbaren Einträge über website_bewertungen_liste() (anon-Key).
-- Tabelle: RLS an, anon hat keinerlei Rechte; authenticated nur
-- über Richtlinien, die academy_my_role() = 'super_admin' verlangen.
-- ============================================================

create table public.website_bewertungen (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  text text not null check (char_length(btrim(text)) between 1 and 4000),
  sterne smallint not null default 5 check (sterne between 1 and 5),
  sichtbar boolean not null default true,
  erstellt_am timestamptz not null default now(),
  aktualisiert_am timestamptz not null default now()
);
comment on table public.website_bewertungen is 'Google-Bewertungen für die Webseite, Wortlaut unverändert, Name gekürzt. Pflege nur Super-Admin.';

alter table public.website_bewertungen enable row level security;
revoke all on table public.website_bewertungen from anon;
revoke all on table public.website_bewertungen from public;
grant select, insert, update, delete on table public.website_bewertungen to authenticated;

create policy website_bewertungen_admin_lesen on public.website_bewertungen
  for select to authenticated using ((select public.academy_my_role()) = 'super_admin');
create policy website_bewertungen_admin_anlegen on public.website_bewertungen
  for insert to authenticated with check ((select public.academy_my_role()) = 'super_admin');
create policy website_bewertungen_admin_aendern on public.website_bewertungen
  for update to authenticated using ((select public.academy_my_role()) = 'super_admin')
  with check ((select public.academy_my_role()) = 'super_admin');
create policy website_bewertungen_admin_loeschen on public.website_bewertungen
  for delete to authenticated using ((select public.academy_my_role()) = 'super_admin');

create index website_bewertungen_sichtbar_idx on public.website_bewertungen (erstellt_am desc) where sichtbar;

-- Für die Webseite: nur sichtbare Einträge, nur die nötigen Felder, neueste zuerst
create or replace function public.website_bewertungen_liste()
 returns table(name text, text text, sterne smallint)
 language sql
 stable
 security definer
 set search_path to ''
as $function$
  select b.name, b.text, b.sterne
  from public.website_bewertungen b
  where b.sichtbar
  order by b.erstellt_am desc
  limit 200;
$function$;
revoke all on function public.website_bewertungen_liste() from public;
grant execute on function public.website_bewertungen_liste() to anon;
-- Migration website_bewertungen_liste_nur_anon: angemeldete Konten brauchen die Liste nicht
revoke execute on function public.website_bewertungen_liste() from authenticated;

-- Startbestand: die 37 Bewertungen vom 29.09.2026 (Reihenfolge wie auf der Seite).
-- Eingespielt am 30.09.2026, Wortlaut per md5 gegen die Webseite geprüft.
insert into public.website_bewertungen (name, text, sterne, erstellt_am) values
  ('Даша К.', 'Da ich gestern meine praktische Prüfung bestanden habe, möchte ich der Fahrschule Boost und meinem tollen Fahrlehrer Serband eine Bewertung hinterlassen.

Ich kann die Fahrschule Boost jedem, der gerade auf der Suche nach einer Fahrschule ist, wirklich nur empfehlen! Das Interior, die Professionalität und die Menschen dort sind einfach nur top!
Die süßen Mädels aus dem Büro-Team, Kristina, Jelena und Isra, sind alle so lieb und hilfsbereit, und auch die Fahrlehrer sind unfassbar nett.

Ganz besonders hervorheben möchte ich aber meinen Fahrlehrer Serband. In der ersten Theoriestunde wusste ich sofort, dass er der perfekte Fahrlehrer für mich sein würde und das war wirklich die beste Entscheidung! Wir haben ständig während den Fahrstunden gelacht und Serband hat es immer wieder geschafft, mir ein Lächeln aufs Gesicht zu zaubern, selbst wenn ich nach einem Fehler mal traurig oder emotional war. Natürlich konnte er auch ernst und geduldig sein, wenn es drauf ankam. Er hat mir alles gewissenhaft beigebracht und mich immer wieder korrigiert. Und ganz nebenbei hat er uns beiden das ein oder andere Mal auch das Leben gerettet 😂

Danke Serband für die schönste und lustigste Fahrzeit, die ich mir wünschen konnte und danke an das ganze Boost-Team für die tolle Zeit mit euch🧡', 5, now() - interval '0 seconds'),
  ('A D', 'Das ganze Team der Fahrschule Boost ist mega freundlich, und ich habe mich dort sehr gut aufgehoben gefühlt. Besonders danken möchte ich meinem Fahrlehrer Serband, der sich die Mühe gemacht hat, meinen Charakter kennenzulernen, um mir die bestmögliche Ausbildung zu bieten. Er hat sogar eine App entwickelt, um herauszufinden, welche Art von Ausbildung man braucht. Dadurch hatte ich perfekt auf mich angepasste Fahrstunden und konnte meinen Führerschein direkt beim ersten Versuch bestehen. Außerdem ist Serband immer ruhig geblieben und hat nie geschrien, sondern alles geduldig erklärt. Die Fahrstunden haben wirklich Spaß gemacht, und von meiner anfänglichen Angst war später nichts mehr übrig. Ich kann nur noch einmal sagen: Danke, sehrrrrr!', 5, now() - interval '1 seconds'),
  ('Baran Y.', 'Sehr gute Fahrschule besonders die fahrlehrer Evren und Serband sind top fahrlehrer die ihr herz am rechten fleck haben, man fühlt sich bei beiden ab der ersten minute sehr wohl.', 5, now() - interval '2 seconds'),
  ('Paula M.', 'Ich kann die Fahrschule Boost nur von ganzem Herzen weiterempfehlen.

Ich hatte das Glück Serband als Fahrlehrer zu haben. Er hat sich immer viel Mühe gegeben und sogar einen eigenen Ausbildungsplan erstellt, der mich perfekt auf die Prüfung vorbereitet hat.

Mit ihm hat man immer etwas zu lachen, gleichzeitig kann man aber auch über ernstere Themen sprechen. Er hat stets ein offenes Ohr für seine Fahrschüler und nimmt sich Zeit, wenn man Fragen oder Sorgen hat.

Besonders beeindruckt hat mich, dass er einen immer motiviert und pusht, wenn man selbst schon ans Aufgeben denkt. Er bleibt geduldig, freundlich und verliert nie die Nerven.

Danke für die tolle Unterstützung und die angenehme Zeit während der Fahrschulzeit. Ohne dich hätte ich es wahrscheinlich nicht so entspannt geschafft.

Liebe Grüße', 5, now() - interval '3 seconds'),
  ('Maydaa T.', 'Ich habe gerade meine praktische Prüfung bestanden und könnte nicht glücklicher sein! Ein riesiges Dankeschön an die Fahrschule und ganz besonders an meinen Fahrlehrer Serband.
Serband ist einfach fantastisch. Er nutzt eine eigene App mit einer klaren Checkliste für alles, was man für die Prüfung üben muss – das gibt extrem viel Struktur und Sicherheit. Er erklärt alles absolut perfekt, bringt eine enorme Geduld mit und sorgt immer dafür, dass man sich am Steuer wohl und sicher fühlt.
Besonders fair: Er drängt einem keine unnötigen Fahrstunden auf. Die Anzahl der Stunden war absolut perfekt abgestimmt – genau so viel wie nötig, um perfekt vorbereitet zu sein.
Wer eine professionelle, strukturierte und entspannte Fahrausbildung sucht, ist bei Serband genau richtig. Absolut empfehlenswert!', 5, now() - interval '4 seconds'),
  ('Mira', 'Ich kann die Fahrschule nur weiterempfehlen!! Ich habe mich von Anfang an total willkommen und gut aufgehoben gefühlt. Außerdem probiert die Fahrschule alle ihre Schüler so gut wie möglich zu unterstützen .

Besonders aber muss ich mich bei meinem Fahrlehrer Serband bedanken. Er ist einfach immer zu mindestens 110 % dabei und gibt alles dafür seinen Schülern eine angenehme und einfache Ausbildung zu ermöglichen. Er hat sich immer bemüht alles persönlich auf eine anzupassen und selber neuen Methoden und Techniken zu entwickeln um alle seine Schüler möglichst einfach zum Führerschein zu bekommen. Im Auto hat man sich nie unwohl gefühlt. Dazu beigetragen hat (zum Teil), dass es total okay war Fehler zu machen und unsicher zu sein.

Dankeschön für diese tolle Zeit und die ganze Unterstützung !!', 5, now() - interval '5 seconds'),
  ('Sarah W.', 'Super Fahrschule, besonders Serband ist wirklich ein absoluter Herzensmensch und mit Abstand der beste Fahrlehrer, den man sich wünschen kann. Er ist unglaublich liebevoll, geduldig und hat immer ein offenes Ohr. Man fühlt sich bei ihm vom ersten Moment an wohl und ernst genommen. Seine ruhige Art nimmt einem jede Nervosität und motiviert einen, immer sein Bestes zu geben. Er ist so nh Maus. Herzlich, aufmerksam und immer gut gelaunt.
Er hat sogar eine eigene App speziell für seine Fahrschüler entwickelt. Daran erkennt man, welchen hohen Stellenwert seine Fahrschüler für ihn haben und wie viel Mühe und Herzblut er in ihre Ausbildung steckt. Er gibt sich nicht nur während der Fahrstunden größte Mühe, sondern unterstützt seine Fahrschüler auch darüber hinaus auf jede erdenkliche Weise. Genau das macht ihn zu einem außergewöhnlichen Fahrlehrer.', 5, now() - interval '6 seconds'),
  ('Naga C.', 'I passed my driving test today and I just have to say something about Serband.
I came in with zero confidence. Literally zero. And he never doubted me – not even when I was ready to give up on myself. He never put me down, always explained the why behind everything, never just said „do it like this." You could feel he genuinely cared.
What impressed me the most: he knows every student differently. He knows how to talk to you, what drives you and what makes you nervous.
That''s rare.
The lessons were actually fun. I didn''t expect that.
Thank you Serband. You believed in me when I couldn''t believe in myself.
Fahrschule Boost, Offenbach – highly recommended. 🙌', 5, now() - interval '7 seconds'),
  ('Saboor Z.', 'I am really happy that I started my driving license here. First I was exciting how to do this?
But my great teacher Mr. Serband Abdullah really worked hard with me, and today I passed my exam.
Thanks for every thing.', 5, now() - interval '8 seconds'),
  ('sidereal.', 'Passed my driving test today and I have to give credit where it''s due.
I was the type who overthought everything. Every mirror, every intersection – my brain wouldn''t stop. Serband never made me feel bad for that. He broke things down in a way that actually made sense and slowly the panic turned into confidence.
What stood out was his consistency. Same calm energy every single lesson, no matter how rough it went. That''s what got me through.
First try. Couldn''t have done it without him.
Fahrschule Boost Offenbach 🙌 highly recommended.', 5, now() - interval '9 seconds'),
  ('Mia S.', 'Die Fahrschule kann ich auf jeden Fall weiterempfehlen.
Man wird dort direkt freundlich aufgenommen und die Atmosphäre ist echt entspannt. Das ganze Team ist super nett und hilfsbereit, wodurch man sich sofort wohlfühlt.

Vor allem ein riesiges Dankeschön an meinen Fahrlehrer Serband. Er war immer locker, geduldig und hat alles verständlich erklärt. Beim Fahren hat er mir immer Sicherheit gegeben und mich top auf die Prüfung vorbereitet.

Vielen Dank für die tolle Zeit und die ganze Unterstützung!', 5, now() - interval '10 seconds'),
  ('Halima E.', 'Ich bin wirklich mehr als zufrieden mit der Fahrschule Boost in Offenbach und kann sie nur jedem weiterempfehlen! Ich komme selbst aus Diezenbach, und es war definitiv eine der besten Entscheidungen mich bei dieser Fahrschule angemeldet zu haben.
Das ganze Team ist einfach super nett und total entspannt. Man fühlt sich direkt wohl und willkommen. Die Stimmung während der Fahrstunden und allgemein in der Fahrschule war immer angenehm und locker.
Ein ganz besonderes Dankeschön geht natürlich an meinen Fahrlehrer Serband!!! Dank ihm habe ich meinen Führerschein bestanden.
Er erklärt alles unglaublich gut und verständlich, bleibt immer ruhig und motiviert einen die ganze Zeit. Er ist mit Abstand einer der nettesten, lustigsten und entspanntesten Lehrer, die ich je hatte.
Die Fahrstunden haben wirklich Spaß gemacht, und gleichzeitig habe ich sehr viel gelernt. Man merkt einfach, dass dort alles mit Herz gemacht wird. Vielen Dank an das ganze Team von Fahrschule Boost ihr macht einen Super Job. 💕', 5, now() - interval '11 seconds'),
  ('Imad K.', 'Ich kann die Fahrschule wirklich nur weiterempfehlen!
Das ganze Team ist super freundlich, hilfsbereit und man fühlt sich von Anfang an gut aufgehoben. Die Atmosphäre ist entspannt und angenehm, sodass man sich direkt wohlfühlt.
Ein großes Dankeschön geht auch an meinen Fahrlehrer Serband. Sein Unterricht ist abwechslungsreich und kreativ gestaltet, sodass es nie langweilig wird. Er nimmt sich immer viel Zeit, erklärt alles ruhig und verständlich selbst wenn man etwas mehrmals nachfragen muss. Dabei bleibt er immer geduldig und wird nie laut, was einem echt Sicherheit gibt.
Außerdem bringt er viel Humor in den Unterricht, was das Lernen deutlich angenehmer macht. Man merkt einfach, dass er pädagogisch richtig was drauf hat und genau weiß, wie er auf seine Schüler eingehen muss.
Insgesamt war es eine richtig schöne und entspannte Zeit klare Empfehlung!', 5, now() - interval '12 seconds'),
  ('Igor P.', 'Serband ist ein richtig guter Fahrlehrer, den ich auf jeden Fall weiterempfehlen kann. Er erklärt alles verständlich und bleibt auch in stressigen Situationen ruhig und geduldig. Dadurch fühlt man sich beim Fahren sicher und gut aufgehoben.

Besonders gut fand ich, dass er einem die Nervosität nimmt und einen Schritt für Schritt auf die Prüfung vorbereitet. Er gibt hilfreiche Tipps, die man sich leicht merken kann, und motiviert einen, auch wenn mal etwas nicht sofort klappt.

Dank ihm habe ich meine Prüfung bestanden vielen Dank dafür!', 5, now() - interval '13 seconds'),
  ('Mihaela K.', 'Ich habe heute meine Prüfung bestanden und möchte mich herzlich bei meinem Fahrlehrer Serband bedanken. Er hat mich immer aufgemuntert und motiviert, selbst in den Momenten, in denen ich nicht an mich geglaubt habe. Er hatte immer ein offenes Ohr für mich und ist geduldig auf alle meine Fragen eingegangen. Die Fahrstunden haben immer Spaß gemacht und waren gleichzeitig sehr lehrreich. Er hat alles verständlich erklärt und mir die Angst vor schwierigen Situationen im Straßenverkehr genommen. Besonders schätze ich, dass er nicht nur während der Fahrstunden für mich da war, sondern mir auch hilfreiche Erklärvideos geschickt hat und mich auch außerhalb der Stunden unterstützt hat. Dank ihm fühle ich mich jetzt sicher und gut vorbereitet im Straßenverkehr. Ich bin sehr dankbar für die gemeinsame Zeit und werde sie in guter Erinnerung behalten. Ich kann ihn wirklich jedem weiterempfehlen. Auch die gesamte Fahrschule fand ich toll. Alle waren sehr nett und hilfsbereit.', 5, now() - interval '14 seconds'),
  ('Javed P.', 'Ich möchte mich von Herzen bei meinem Fahrlehrer Serband und der ganzen Fahrschule Boost bedanken. Serband ist wirklich mehr als nur ein Fahrlehrer, er ist jemand, der seine Schüler ernst nimmt und für sie da ist. Er hat mir alles geduldig und ruhig erklärt, egal wie stressig die Situation war. Während ich manchmal innerlich schon den Notausgang gesucht habe, blieb er einfach entspannt und hatte alles im Griff.

Am meisten berührt hat mich aber, dass er auch zugehört hat, wenn es mal nicht ums Autofahren ging. Wenn ich Zweifel hatte oder dachte, dass ich das alles nie packe, hat er mich wieder aufgebaut und ja, auch zum Lachen gebracht. Das hat mir unglaublich gutgetan und mir viel Sicherheit gegeben.

Auch die Fahrschule Boost selbst war top: super freundlich, hilfsbereit und man fühlt sich dort sofort gut aufgehoben.

Ganz klare 5 Sterne von mir. Ich kann Serband und die ganze Fahrschule wirklich jedem empfehlen. Ich bin sehr dankbar für diese Zeit.', 5, now() - interval '15 seconds'),
  ('Ghoudani R.', 'Ich habe heute meinen Führerschein bestanden und bin einfach nur überglücklich! Ein ganz großes Dankeschön geht an meinen Fahrlehrer Serband.
Er war von Anfang an unglaublich geduldig, ruhig und verständnisvoll. Egal wie nervös ich war, er hat mir immer die Sicherheit gegeben, dass ich es schaffen kann. Seine Erklärungen waren klar und verständlich, und er hat sich immer die Zeit genommen, alles in Ruhe zu erklären.
Besonders gefallen hat mir seine freundliche Art und sein Humor – dadurch haben die Fahrstunden sogar richtig Spaß gemacht. Dank ihm habe ich mich immer sicher gefühlt und war bestens auf die Prüfung vorbereitet.

Ich kann Serband wirklich jedem weiterempfehlen! Vielen Dank für die tolle Unterstützung auf meinem Weg zum Führerschein!', 5, now() - interval '16 seconds'),
  ('A.b', 'Ich kann die Fahrschule Boost und vor allem den Fahrlehrer Serband nur wärmstens empfehlen!
Die Fahrstunden waren einfach der Hammer! Sie waren super lustig und haben mir mega viel Spaß gemacht.
Serband ist nicht nur extrem geduldig und locker, er ist für mich der beste Fahrlehrer auf der ganzen Welt! Er schafft es, dass man ohne Stress lernt und sich in jeder Situation wohlfühlt. Ich hätte mir keinen besseren Lehrer wünschen können.
Vielen Dank für die tolle Zeit und die super Vorbereitung! Wer einen entspannten Weg zum Führerschein sucht, muss zu Serband!', 5, now() - interval '17 seconds'),
  ('D.K', 'Super nettes Team! Doch besonders möchte ich den Fahrlehrer Serband loben. Er hat wirklich die Ruhe weg und man merkt, dass er 110 Prozent gibt seine Schüler auf die Prüfung vorzubereiten. Auch Abseits der Fahrschule einfach ein super Typ! Vielen Dank Serband und natürlich dem gesamten Team !', 5, now() - interval '18 seconds'),
  ('H.h', 'Ich habe heute meine Prüfung bestanden und das durch den besten Fahrlehrer serband ! Er ist der netteste, coolste und lustigste Fahrlehrer man kann mit ihm das fahren entspannt lernen und muss sich null Stressen. Durch seine Tipps und Tricks hab ich heute die Prüfung bestanden und bin ihm vom Herzen dankbar! Die restlichen Fahrlehrer und Mitarbeiter sind ebenso sehr sympathische Menschen und muntern jemanden auch auf. Man merkt es geht um mehr als nur Arbeit, ich hatte das Gefühl es ist wie eine kleine Familie weil alle miteinander gut umgehen und immer nett zu jemanden sind. Ich empfehle euch diese Fahrschule zu besuchen, weil ihr die beste Erfahrung Machen werdet. Macht euer Führerschein HIER!', 5, now() - interval '19 seconds'),
  ('J.k', 'Ich habe meinen Führerschein bei der Fahrschule Boost gemacht und kann sie wirklich nur weiterempfehlen von Anfang bis Ende war alles super organisiert vom Theorieunterricht bis zur praktischen Prüfung. Besonders bedanken möchte ich mich bei meinem Fahrlehrer Serband. Er hat unglaublich viel Geduld, erklärt alles verständlich und bleibt auch in stressigen Situationen ruhig und freundlich. Dank seiner Unterstützung habe ich mich bestens auf die Prüfung vorbereitet gefühlt und sie direkt bestanden! 🚗💪

Wer also eine Fahrschule sucht, bei der man sich wohlfühlt und professionell betreut wird, ist bei Fahrschule Boost und Fahrlehrer Serband genau richtig', 5, now() - interval '20 seconds'),
  ('A.A', 'Als ich meine Fahrschule wechseln musste und zur Fahrschule Boost kam, war es das Beste was passieren konnte.
Vor allem meinem Fahrlehrer Serband verdanke ich viel! Durch ihn durfte ich lernen, wie viel Spaß es macht, Auto zu fahren ohne jedes Mal Angst davor haben zu müssen, den nächsten Fehler zu machen. Zu keinem Zeitpunkt habe ich mich unwohl oder ängstlich gefühlt. Im Gegenteil, ich habe mich jedes Mal aufs Neue auf die Fahrstunden gefreut. Und auch wenn mal etwas nicht gut gelaufen ist, hat mir Serband nie das Gefühl gegeben, dass ich es nicht schaffen kann.
Er hat mir alles verständlich erklärt, war immer super geduldig (auch wenn ich einiges zum hunderten Mal falsch gemacht habe) und das ganze in einer so lockeren und witzigen Art, das man einfach nur mit Freude in die Fahrschule gekommen ist.
Hätte ich zu Beginn bei ihm das Fahren gelernt, wäre alles sehr viel entspannter gewesen.
Umso glücklicher bin ich, dass ich diese Fahrschule auf Anhieb gefunden habe.
Deshalb auch ein großen Dank an Kristina und Isra und überhaupt der ganzen Fahrschule!
Ich glaub, ohne euch hätte ich es nicht mehr in der Zeit geschafft, dafür danke ich euch von Herzen.', 5, now() - interval '21 seconds'),
  ('G.h', 'Heute habe ich meine praktische Fahrprüfung bestanden und hatte eine sehr positive Erfahrung mit der Fahrschule. Sie sind ein äußerst professionelles, gut organisiertes und starkes Team. Mein besonderer Dank gilt meinem Fahrlehrer Serband, der sich mit viel Sorgfalt, Professionalität und echter Freundlichkeit viel Zeit für mich genommen hat. Ich bin ihm sehr dankbar 🙏🏽. Ohne seine Unterstützung hätte ich das Autofahren nicht so sicher und entspannt lernen können. Vielen Dank, Serband!', 5, now() - interval '22 seconds'),
  ('S.A', 'Also mal ehrlich... diese Fahrschule ist einfach der Hammer! Alle mega nett, locker drauf und man fühlt sich direkt wohl. SERBAND!
Dieser Typ ist einfach der GOAT der beste Fahrlehrer Deutschlands ,kein Witz! So geduldig, cool, witzig und erklärt alles, als wäre Autofahren das Einfachste der Welt. Mit ihm macht jede Fahrstunde Spaß null Stress, null Panik, einfach nur gute Laune und Lernen auf Champion Niveau!
Hätte ich Serband von Anfang an gehabt, ich schwöre, ich hätte direkt nach der Theorie meine Prüfung im Schlaf bestanden wäre er da mein Fahrlehrer gewesen.

Danke an Boost und an den besten Fahrlehrer Deutschlands Serband, du bist eine Legende! 🔥', 5, now() - interval '23 seconds'),
  ('N.B', 'Ich war super zufrieden mit der Fahrschule.
Kristina und Isra im Büro sind unglaublich lieb, herzlich und nehmen sich für jeden einzelnen viel Zeit, um alles in Ruhe und verständlich zu erklären. Man fühlt sich bei ihnen direkt gut aufgehoben.Mein Fahrlehrer Serband war für mich einfach der Beste. Er hat sich immer Zeit genommen, mir alles geduldig erklärt und war bei jeder Schwierigkeit für mich da. Mit seiner ruhigen Art, seiner Unterstützung und Motivation hat er mir sehr geholfen. Ohne ihn hätte ich meinen Führerschein ganz sicher nicht geschafft.Ich bin sehr dankbar für diese tolle Betreuung und kann die Fahrschule von Herzen weiterempfehlen', 5, now() - interval '24 seconds'),
  ('I.S', 'Ich habe meinen Führerschein bei der Fahrschule Boost in Offenbach gemacht und kann die Fahrschule und meinen Fahrlehrer Serband wirklich nur empfehlen.

Alles ist gut organisiert, freundlich und zuverlässig.
Serband ist ein ruhiger, geduldiger und fachlich sehr starker Lehrer.

Er weiß genau, wann man bereit ist, und gibt einem nie unnötige Fahrstunden. Dank seiner Art, alles klar und stressfrei zu erklären, habe ich meine Prüfung direkt beim ersten Mal bestanden.
Top Fahrschule, top Fahrlehrer verdient 5 Sterne. 🚗🔥', 5, now() - interval '25 seconds'),
  ('C.L', 'Ich bin so unglaublich glücklich, endlich meinen Führerschein zu haben – und dafür möchte ich euch von Herzen danken.

Vor allem meinem Fahrlehrer Serband: Deine Geduld, dein warmherziger Umgang und dein Humor haben mir die Sicherheit gegeben, an mich selbst zu glauben. Du hast mich immer wieder aufgebaut und mir das Gefühl gegeben, dass ich es schaffen kann. Dafür danke ich dir von ganzem Herzen.🫶🏻

Ein großes Dankeschön auch an Kristina, Jelena und Isra und das gesamte Team der BOOST Fahrschule. Bei euch hatten wir immer einen Ansprechpartner, wenn es Probleme oder Fragen gab – und ihr habt wirklich immer die beste Lösung gesucht. Dieses Gefühl von Unterstützung hat alles einfacher gemacht.

Ich werde eure Hilfe und diese Zeit nie vergessen🙏 – absolute Empfehlung!', 5, now() - interval '26 seconds'),
  ('Semih', 'Serband ist einfach ein mega entspannter Fahrlehrer. Er bleibt immer ruhig und geduldig, selbst wenn man mal Fehler macht oder was nicht direkt checkt. Das hat mir richtig geholfen, nicht gestresst zu sein und einfach in meinem Tempo besser zu werden.
Was ich auch nice fand: Er ist echt lustig drauf. Die Fahrstunden waren nie langweilig oder unangenehm, sondern eher entspannt und teilweise sogar witzig. Trotzdem hat er immer drauf geachtet, dass man alles versteht und sicher fährt.
Wenn ich irgendwas nicht gecheckt hab, hat er sich Zeit genommen und es so erklärt, dass es wirklich Sinn macht. Man merkt einfach, dass er will, dass man es wirklich kann und nicht nur irgendwie durch die Prüfung kommt.
Am Ende bin ich mit nem guten Gefühl in die Prüfung gegangen und hab direkt bestanden.
Kann ihn wirklich jedem empfehlen, der entspannt und sicher fahren lernen will.', 5, now() - interval '27 seconds'),
  ('D.L', 'Mein größter Dank gilt meinem Fahrlehrer Serband. Ich habe heute meine Fahrprüfung bestanden, und das verdanke ich ganz klar seiner hervorragenden und intensiven Vorbereitung auf die Prüfung. Er hat mir genau das beigebracht, was wichtig ist, und mir dadurch viel Sicherheit gegeben 😊.

Während der Fahrstunden habe ich mich bei ihm immer wohlgefühlt. Er ist sehr geduldig, erklärt alles verständlich und schafft eine entspannte Atmosphäre. Gleichzeitig waren die Stunden auch oft sehr lustig, ohne dass das Lernen zu kurz kam im Gegenteil, ich habe unglaublich viel gelernt.

Für mich persönlich ist Serband der beste Fahrlehrer dieser Fahrschule, und ich kann ihn wirklich nur weiterempfehlen.Auch die Fahrschule kann ich weiterempfehlen. Vielen Dank für alles und für die tolle Unterstützung auf dem Weg zum Führerschein!', 5, now() - interval '28 seconds'),
  ('Lotte', 'Ich hatte eine sehr tolle Zeit bei der Fahrschule und hatte das Gefühl, dass sich alle sehr bemüht haben mich gut auf den Führerschein vorzubereiten.
Vor allem mein Fahrlehrer Serband hat sich viel Mühe gegeben. Die Atmosphäre im Auto ist total entspannt und man kann mit ihm über alles reden. Ich durfte auch immer Freunde mitnehmen und habe mich dadurch sehr wohl im Auto gefühlt. Also ein großes Dankeschön an Serband und die Fahrschule.', 5, now() - interval '29 seconds'),
  ('Olia A.', 'Ich kann meinen Fahrlehrer Serband wirklich von Herzen weiterempfehlen 😍 Ich habe heute die Prüfung beim ersten Mal bestanden 🎉 Er war immer geduldig, verständnisvoll und hat mich auch in den Momenten motiviert, in denen ich selbst an mir gezweifelt habe. Die Fahrstunden waren nicht nur lehrreich, sondern haben auch richtig Spaß gemacht. Mit der Zeit ist er für mich nicht nur ein Fahrlehrer, sondern auch ein guter Freund geworden.

Danke dir Serband für deine Geduld, deine Unterstützung und dafür, dass du immer an mich geglaubt hast! Ich hätte mir keinen besseren Fahrlehrer wünschen können.🫶', 5, now() - interval '30 seconds'),
  ('Abdul M.', 'Eine absolut empfehlenswerte Fahrschule. Sehr professionell, zuverlässig und immer freundlich. Besonders mein Fahrlehrer Serband verdient ein großes Lob: Er erklärt klar, bleibt geduldig und unterstützt einen wirklich auf dem Weg zum Führerschein. Auch in stressigen Momenten behält er Ruhe und gibt einem Sicherheit. Ich fühle mich hier bestens aufgehoben und kann die Fahrschule und Serband nur weiterempfehlen.', 5, now() - interval '31 seconds'),
  ('Markus K.', 'Fahrschule Boost in Offenbach – diese Bewertung geht vor allem an meinen Fahrlehrer Serband!
Ich komme aus Mannheim und habe schon dort von Serband gehört, meine Freunde haben so begeistert von ihm erzählt, dass sein Name die 100 km bis nach Mannheim geschafft hat.
Jetzt weiß ich auch warum!
Ich war anfangs ein echter Angsthase und hatte große Zweifel, ob ich den Führerschein überhaupt schaffen kann. Serband hat es geschafft, mir meine Ängste zu nehmen und wieder an mich selbst zu glauben.
Seine lockere, lustige und ruhige Art, seine Geduld und vor allem seine unglaubliche Menschenkenntnis machen ihn für mich zu einem herausragenden Fahrlehrer. Er wusste immer genau, wie er mir etwas erklären musste, und war nie sauer oder gestresst. Bei ihm habe ich mich immer sicher und wohlgefühlt.
Seine selbst entwickelte App für die Praxis war ebenfalls eine riesige Hilfe und zeigt, wie engagiert er ist.
Serband, danke für deine Geduld, Motivation und dafür, dass du an mich geglaubt hast, als ich es selbst nicht konnte.
Für mich bist du der beste Fahrlehrer weltweit Serband! ❤️

Grüße aus Mannheim
Markus', 5, now() - interval '32 seconds'),
  ('Mohammad A.', 'I had an excellent experience at this driving school! A special thank you to my instructor Serband, who taught me in both English and German and always encouraged me throughout my journey. He taught me so much and always motivated me by saying, “You can do it!” His patience, friendly nature, positive attitude, and good ethics gave me great confidence.

A big thank you to Cesar as well for his support and excellent teaching. I would also like to thank Kristina from the office team for always being so friendly, helpful, and supportive.

Thank you to the whole team for helping me achieve my driving license in Germany!
🚗🇩🇪 I highly recommend this driving school! 🙏⭐', 5, now() - interval '33 seconds'),
  ('Sara T.', 'dass ich mich für die fahrschule boost entschieden habe, war die beste entscheidung überhaupt. von der atmosphäre bis hin zu meinem besten fahrlehrer serband war einfach alles perfekt.

als ich mich anfangs bei der fahrschule angemeldet und die ersten male am theorieunterricht teilgenommen habe, war ich noch ziemlich unsicher, weil ich autofahren ehrlich gesagt überhaupt nicht mochte und mir das ganze eher sorgen gemacht hat. als serband dann die theoriestunde fortgeführt hat, hat er es direkt geschafft, mir ein sehr sehr sicheres gefühl zu geben und mir zu zeigen, dass ich bei ihm sicher aufgehoben bin.

auch bei den fahrstunden hat sich das immer wieder bestätigt. er hat mir von anfang an die angst genommen, mich immer motiviert und mir auch dann mut gemacht, wenn ich selbst nicht an mich geglaubt habe. durch ihn habe ich irgendwann nicht nur angefangen, autofahren zu mögen, sondern mich sogar richtig darauf gefreut, in die fahrstunde zu gehen.

das schönste daran war aber, dass wir uns mit der zeit einfach unglaublich gut verstanden haben. aus fahrlehrer und fahrschülerin sind irgendwann gefühlt beste freunde geworden. wir haben in jeder fahrstunde gelacht, über alles mögliche geredet und ich konnte mit wirklich jedem problem zu ihm kommen. serband hat den besten humor.

ich bin einfach unglaublich froh, dass ich bei boost gelandet bin und vor allem, dass ich serband als fahrlehrer bekommen habe. ich hätte mir wirklich keinen besseren wünschen können', 5, now() - interval '34 seconds'),
  ('Laura S.', 'Ich habe heute meine praktische Prüfung bestanden und bin einfach extrem glücklich!
Ich bin sehr dankbar, Serband als meinen Fahrlehrer gehabt zu haben. Durch seine ruhige, geduldige und sympathische Art habe ich mich seit Tag 1 richtig wohl und gut aufgehoben gefühlt. Er hat mich super auf die Prüfung vorbereitet und mir immer die nötige Ruhe gegeben.
Besonders hilfreich war auch die von ihm selbst gegründete Fahr-Akademie App.
Die Videos zu verschiedenen Verkehrssituationen und Technikfragen haben mir sehr geholfen, mich zusätzlich zum Fahrunterricht gezielt auf die Prüfung vorzubereiten.
Vielen Dank für die tolle Unterstützung!
Ich kann die Fahrschule Boost und Serband als Fahrlehrer wirklich nur weiterempfehlen!', 5, now() - interval '35 seconds'),
  ('Mare S.', 'Ich habe heute meine praktische Prüfung bestanden und könnte nicht glücklicher sein 🥺
Als Erstes möchte ich mich von Herzen bei der gesamten Fahrschule bedanken. Alle sind super nett sowie freundlich und gehen sofort auf deine Wünsche beziehungsweise Probleme ein.
Ein ganz besonderes Dankeschön geht natürlich an meinen Fahrlehrer Serband. Er war immer unglaublich ruhig, geduldig und freundlich. Gleichzeitig war aber auch jede Fahrstunde mit ihm lustig. Er hat sich immer Zeit genommen, einem die Sachen genauer zu erklären, auch wenn man es nach dem zehnten Mal noch nicht verstanden hat, und hat mich nie unter Druck gesetzt. Gerade dadurch habe ich mich beim Fahren immer sicher gefühlt.Ebenso hatte er immer ein offenes Ohr für einen und hat einen nie verurteilt.
Außerdem möchte ich die Akademie besonders hervorheben. Ich fand es richtig hilfreich außerhalb der Fahrstunden noch so viele Möglichkeiten zu haben, sich weiter vorzubereiten. Die Videos waren super erklärt und haben mir sehr geholfen, bestimmte Situationen oder Themen noch einmal besser zu verstehen, denn man kann sich die Videos jederzeit noch einmal anschauen, gerade wenn man bei einer Situation unsicher war, wobei Serband einem auch immer geholfen hat.
Besonders schön fand ich auch die App, denn durch das Beantworten der Fragen konnte man herausfinden, was für ein Lerntyp man ist.
Dadurch konnte Serband besser einschätzen, was für ein Typ Mensch beziehungsweise Lerntyp man ist und konnte dadurch noch individueller auf einen eingehen, wofür ich wirklich dankbar bin, denn ich habe so etwas davor noch nie gesehen.
Ich bin sehr dankbar für die tolle Unterstützung 🥺während der Fahrschulzeit und kann die Fahrschule, besonders Serband von Herzen weiterempfehlen🙌🏻', 5, now() - interval '36 seconds');
