import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// academy-katalog (26.09.2026, Stufe 3 / S1)
// Liefert den Video-Katalog nur noch an angemeldete Schueler (eigene Session) oder an
// eingeloggte Verwaltungs-Konten (Vorschau "Als Schueler ansehen"). Vorher las die App
// alles direkt mit dem oeffentlichen Schluessel -- damit waren Video-IDs, Pruefernamen
// und Pruefungsergebnisse fuer jeden im Internet abrufbar.
// Ausgeblendete Videos und archivierte Themen kommen gar nicht erst mit.
// 01.10.2026: Uebersetzungen nur noch in der gewaehlten Sprache (body.sprache). Mit 13
// Sprachen sind es ueber 1000 Zeilen -- die Datenbank liefert je Abfrage hoechstens 1000,
// dann fehlten zufaellig Titel. Aeltere App-Staende ohne body.sprache bekommen wie bisher
// tr/en/ar/es.
// 02.10.2026: Hinweise im Video (academy_videos.hinweise) -- nur freigegebene (aktiv: true)
// gehen hinaus; Entwuerfe bleiben auf dem Server. Aeltere App-Staende (ohne body.sprache)
// kennen keine Hinweise und bekommen deren Uebersetzungen nicht (sonst > 1000 Zeilen).
// 11.10.2026, LKW-BEREICH (docs/LKW-BEREICH-BAUPLAN.md, "Die eine Regel"): Schueler bekommen
// nur Themen mit fahrzeug in ihren erlaubten Fahrzeugen E oder 'alle' und nur Videos, die
// mindestens ein solches (nicht archiviertes) Thema haben -- ohne Themen nur bei pkw in E.
// video_tags/video_pruefer passend gefiltert, Uebersetzungen bleiben vollstaendig (klein).
// Verwaltung (Admin-JWT) bekommt weiter alles. Neu im Ergebnis: erlaubte_fahrzeuge.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ALTE_SPRACHEN = ["tr", "en", "ar", "es"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // --- Wer fragt? ---
    let erlaubt = false;
    let fahrzeuge = null; // 11.10.2026: null = Verwaltung, sieht alles
    if (body && body.session_token) {
      const { data: session, error: sErr } = await supa.from("academy_sessions")
        .select("schueler_id, expires_at").eq("session_token", body.session_token).maybeSingle();
      if (sErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if (!session) return json({ error: "session_ungueltig", code: "session_ungueltig" }, 401);
      if (new Date(session.expires_at) < new Date()) return json({ error: "session_abgelaufen", code: "session_abgelaufen" }, 401);
      const { data: s, error: e2 } = await supa.from("academy_schueler").select("aktiv, ablauf_am, zugang_pkw, zugang_lkw").eq("id", session.schueler_id).maybeSingle();
      // 11.10.2026: Datenbankfehler ist kein Grund zum Abmelden.
      if (e2) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if (!s || !s.aktiv) return json({ error: "zugang_gesperrt", code: "zugang_gesperrt" }, 403);
      if (new Date(s.ablauf_am) < new Date()) return json({ error: "zugang_abgelaufen", code: "zugang_abgelaufen" }, 403);
      erlaubt = true;
      // 11.10.2026: fehlt ein Feld (alter Datensatz), gilt zugang_pkw = true, zugang_lkw = false.
      fahrzeuge = [];
      if (s.zugang_pkw !== false) fahrzeuge.push("pkw");
      if (s.zugang_lkw === true) fahrzeuge.push("lkw");
    } else {
      const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "").trim();
      if (jwt) {
        const { data: u } = await supa.auth.getUser(jwt);
        if (u && u.user) {
          const { data: rolle } = await supa.from("academy_admin_users").select("rolle").eq("user_id", u.user.id).maybeSingle();
          if (rolle) erlaubt = true;
        }
      }
    }
    if (!erlaubt) return json({ error: "nicht_angemeldet", code: "nicht_angemeldet" }, 401);

    const sprache = body && typeof body.sprache === "string" && /^[a-z]{2,3}$/.test(body.sprache) ? body.sprache : null;
    let uebQ = supa.from("academy_uebersetzungen").select("*");
    uebQ = sprache ? uebQ.eq("sprache", sprache) : uebQ.in("sprache", ALTE_SPRACHEN).not("feld", "like", "hinweis:%");

    const [tags, videos, vtags, pruefer, vpr, gebiete, ueb] = await Promise.all([
      supa.from("academy_tags").select("*").eq("archiviert", false).order("reihenfolge"),
      supa.from("academy_videos").select("*").eq("ausgeblendet", false).eq("status", "live").not("bunny_video_id", "is", null).order("reihenfolge"),
      supa.from("academy_video_tags").select("video_id, tag_id"),
      supa.from("academy_pruefer").select("id, name"),
      supa.from("academy_video_pruefer").select("video_id, pruefer_id"),
      supa.from("academy_gebiete").select("*").order("name"),
      sprache === "de" ? Promise.resolve({ data: [], error: null }) : uebQ,
    ]);
    if (tags.error || videos.error) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);

    // Interne Felder nicht mitschicken -- vor allem NICHT die Bunny-Video-ID: Bunny schuetzt
    // die Dateien derzeit nur ueber den Referer, wer die ID kennt, kann das Video laden.
    // Abspielen laeuft ueber academy-video-token (nur mit Freigabe), das Vorschaubild ueber
    // academy-vorschaubild.
    const bildBasis = SUPABASE_URL + "/functions/v1/academy-vorschaubild?k=1&v=";
    const videoListe = (videos.data || []).map((v) => {
      const k = { ...v };
      delete k.push_gesendet;
      delete k.bunny_video_id;
      k.hinweise = Array.isArray(v.hinweise) ? v.hinweise.filter((h) => h && h.aktiv === true) : [];
      k.hat_video = true;
      k.thumb = bildBasis + encodeURIComponent(v.id);
      return k;
    });
    // --- Fahrzeug-Filter (11.10.2026), nur fuer Schueler ---
    let tagListe = tags.data || [];
    let sichtbareVideos = videoListe;
    let fremdeThemen = new Set();
    if (fahrzeuge) {
      // Ohne Zuordnungen laesst sich nicht filtern: lieber kurz Fehler als fremde Videos.
      if (vtags.error) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      const passt = (t) => { const fz = t.fahrzeug || "pkw"; return fz === "alle" || fahrzeuge.indexOf(fz) !== -1; };
      const themaNachId = new Map(tagListe.map((t) => [t.id, t])); // nur nicht archivierte
      fremdeThemen = new Set(tagListe.filter((t) => !passt(t)).map((t) => t.id));
      const themenJeVideo = new Map();
      (vtags.data || []).forEach((x) => {
        const t = themaNachId.get(x.tag_id);
        if (!t) return;
        if (!themenJeVideo.has(x.video_id)) themenJeVideo.set(x.video_id, []);
        themenJeVideo.get(x.video_id).push(t);
      });
      sichtbareVideos = videoListe.filter((v) => {
        const th = themenJeVideo.get(v.id) || [];
        return th.length === 0 ? fahrzeuge.indexOf("pkw") !== -1 : th.some(passt);
      });
      tagListe = tagListe.filter(passt);
    }
    const erlaubteIds = new Set(sichtbareVideos.map((v) => v.id));

    return json({
      ok: true,
      tags: tagListe,
      videos: sichtbareVideos,
      video_tags: (vtags.data || []).filter((x) => erlaubteIds.has(x.video_id) && !fremdeThemen.has(x.tag_id)),
      pruefer: pruefer.data || [],
      video_pruefer: (vpr.data || []).filter((x) => erlaubteIds.has(x.video_id)),
      gebiete: gebiete.error ? null : (gebiete.data || []),
      uebersetzungen: ueb.error ? [] : (ueb.data || []),
      erlaubte_fahrzeuge: fahrzeuge || ["pkw", "lkw"],
    });
  } catch (e) {
    return json({ error: String(e), code: "voruebergehend" }, 500);
  }
});
