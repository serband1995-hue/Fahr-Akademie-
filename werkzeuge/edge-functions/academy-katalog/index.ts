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
    if (body && body.session_token) {
      const { data: session, error: sErr } = await supa.from("academy_sessions")
        .select("schueler_id, expires_at").eq("session_token", body.session_token).maybeSingle();
      if (sErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if (!session) return json({ error: "session_ungueltig", code: "session_ungueltig" }, 401);
      if (new Date(session.expires_at) < new Date()) return json({ error: "session_abgelaufen", code: "session_abgelaufen" }, 401);
      const { data: s } = await supa.from("academy_schueler").select("aktiv, ablauf_am").eq("id", session.schueler_id).maybeSingle();
      if (!s || !s.aktiv) return json({ error: "zugang_gesperrt", code: "zugang_gesperrt" }, 403);
      if (new Date(s.ablauf_am) < new Date()) return json({ error: "zugang_abgelaufen", code: "zugang_abgelaufen" }, 403);
      erlaubt = true;
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
    const erlaubteIds = new Set(videoListe.map((v) => v.id));

    return json({
      ok: true,
      tags: tags.data || [],
      videos: videoListe,
      video_tags: (vtags.data || []).filter((x) => erlaubteIds.has(x.video_id)),
      pruefer: pruefer.data || [],
      video_pruefer: (vpr.data || []).filter((x) => erlaubteIds.has(x.video_id)),
      gebiete: gebiete.error ? null : (gebiete.data || []),
      uebersetzungen: ueb.error ? [] : (ueb.data || []),
    });
  } catch (e) {
    return json({ error: String(e), code: "voruebergehend" }, 500);
  }
});
