import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });
}

// 26.09.2026: Liefert zusaetzlich alle Freigaben (Pakete, geschenkte Videos, Pruefgebiete),
// damit ein Kauf sofort sichtbar ist und nicht erst nach erneutem Login. "code" nennt den
// Grund maschinenlesbar -- die App meldet nur bei diesen eindeutigen Codes ab.
// Felder, die wegen eines Fehlers nicht ermittelt werden konnten, fehlen in der Antwort
// (statt leer zu sein), damit die App ihren letzten bekannten Stand behaelt.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_token } = await req.json();
    if (!session_token) return json({ error: "session_token_fehlt", code: "session_token_fehlt" }, 400);

    const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: session, error: sessionError } = await supa
      .from("academy_sessions")
      .select("schueler_id, expires_at")
      .eq("session_token", session_token)
      .maybeSingle();

    // Datenbankfehler ist KEIN Grund zum Abmelden.
    if (sessionError) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
    if (!session) return json({ error: "session_ungueltig", code: "session_ungueltig" }, 401);
    if (new Date(session.expires_at) < new Date()) return json({ error: "session_abgelaufen", code: "session_abgelaufen" }, 401);

    const { data: schueler, error: schuelerError } = await supa
      .from("academy_schueler")
      .select("name, telefon, aktiv, ablauf_am, vollzugang, agb_akzeptiert_am, schule_id, klasse, pruefungstermin")
      .eq("id", session.schueler_id)
      .maybeSingle();

    if (schuelerError) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
    if (!schueler) return json({ error: "schueler_nicht_gefunden", code: "schueler_nicht_gefunden" }, 404);
    if (!schueler.aktiv) return json({ error: "zugang_gesperrt", code: "zugang_gesperrt" }, 403);
    if (new Date(schueler.ablauf_am) < new Date()) return json({ error: "zugang_abgelaufen", code: "zugang_abgelaufen" }, 403);

    if (schueler.schule_id) {
      const { data: schule } = await supa
        .from("academy_schulen")
        .select("aktiv")
        .eq("id", schueler.schule_id)
        .maybeSingle();
      if (schule && !schule.aktiv) return json({ error: "schule_pausiert", code: "schule_pausiert" }, 403);
    }

    const antwort: Record<string, unknown> = {
      ok: true,
      name: schueler.name,
      telefon: schueler.telefon,
      ablauf_am: schueler.ablauf_am,
      vollzugang: schueler.vollzugang,
      agb_akzeptiert_am: schueler.agb_akzeptiert_am,
      schule_id: schueler.schule_id || null,
      klasse: schueler.klasse || null,
      pruefungstermin: schueler.pruefungstermin || null,
    };

    try {
      const { data: kf, error: kfError } = await supa.from("academy_klassen_freigabe").select("klasse, freigegeben");
      if (!kfError) {
        const klassenFreigabe = {};
        (kf || []).forEach((r) => { klassenFreigabe[r.klasse] = r.freigegeben; });
        antwort.klassen_freigabe = klassenFreigabe;
      }
    } catch (_e) { /* optional, wie beim Login */ }

    // Pruefgebiete: null = sieht alles (ohne Fahrschule). Bei Fehler Feld weglassen.
    if (!schueler.schule_id) {
      antwort.gebiete = null;
    } else {
      try {
        const { data: sg, error: sgError } = await supa
          .from("academy_schule_gebiete")
          .select("gebiet_id")
          .eq("schule_id", schueler.schule_id);
        if (!sgError) antwort.gebiete = (sg || []).map((r) => r.gebiet_id);
      } catch (_e) { /* Feld fehlt -> App behaelt alten Stand */ }
    }

    // Persoenliche Freischaltungen -- gleiche Logik wie academy-login.
    try {
      const { data: fr, error: frError } = await supa
        .from("academy_freischaltungen")
        .select("art, video_id, academy_pakete(umfang_stufen, aktiv)")
        .eq("schueler_id", session.schueler_id);
      if (!frError) {
        const freigabeVideos: string[] = [];
        const freigabeStufen: string[] = [];
        (fr || []).forEach((f) => {
          if (f.art === "video" && f.video_id) freigabeVideos.push(f.video_id);
          if (f.art === "paket" && f.academy_pakete && f.academy_pakete.aktiv !== false) {
            (f.academy_pakete.umfang_stufen || []).forEach((st) => {
              if (freigabeStufen.indexOf(st) === -1) freigabeStufen.push(st);
            });
          }
        });
        antwort.freigabe_videos = freigabeVideos;
        antwort.freigabe_stufen = freigabeStufen;
      }
    } catch (_e) { /* Feld fehlt -> App behaelt alten Stand */ }

    return json(antwort);
  } catch (e) {
    return json({ error: String(e), code: "voruebergehend" }, 500);
  }
});
