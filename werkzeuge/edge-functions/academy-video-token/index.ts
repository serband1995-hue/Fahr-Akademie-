import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BUNNY_LIBRARY_ID = Deno.env.get("BUNNY_LIBRARY_ID");
const BUNNY_TOKEN_AUTH_KEY = Deno.env.get("BUNNY_TOKEN_AUTH_KEY");

// Diese Funktion ist die einzige Stelle, die wirklich zaehlt: eine Sperre nur im
// Frontend liesse sich umgehen. Ohne Token kein Bunny-Stream-Zugriff.
//
// Freigabe-Ebenen, in dieser Reihenfolge geprueft (jede einzelne genuegt):
//   1. vollzugang am Schueler          -> alles (seit 11.10.2026: nur Pkw, siehe unten)
//   2. academy_videos.gratis           -> Kostprobe, einzelnes Video frei
//   3. academy_tags.gratis             -> ganzes Thema frei
//   4. academy_freischaltungen (NEU 18.09.2026):
//        art='video' -> genau dieses Video (gekauft oder geschenkt)
//        art='paket' -> ein Paket, dessen umfang_stufen einen Bereich dieses Videos enthaelt
//
// 15.09.2026, GEBIETE: Videos koennen einem Pruefgebiet zugeordnet sein. Ein Schueler
// einer PARTNER-Fahrschule sieht nur die Gebiete, die seine Schule freigeschaltet hat.
// Bewusst fehlertolerant ("fail open"): ohne Fahrschule, ohne Gebiet am Video oder bei
// einem Datenbankfehler wird NICHT gesperrt.
//
// 26.09.2026: Jede Ablehnung traegt einen "code". Die App meldet nur bei
// session_ungueltig / session_abgelaufen / zugang_gesperrt / zugang_abgelaufen /
// schule_pausiert ab -- alles andere (Gebiet, Vollzugang, Serverfehler) zeigt nur eine Meldung.
//
// 11.10.2026, LKW-BEREICH (docs/LKW-BEREICH-BAUPLAN.md, "Die eine Regel"): Pkw und Lkw sind
// streng getrennt. Fahrzeuge eines Videos = fahrzeug-Werte seiner NICHT archivierten Themen
// (ohne Themen: 'pkw'; 'alle' passt zu beiden). Erlaubt E = {pkw falls zugang_pkw} +
// {lkw falls zugang_lkw} (alter Datensatz ohne Felder: nur pkw). Passt kein Fahrzeug,
// gibt es fahrzeug_nicht_freigegeben (403, KEIN Abmelden) -- vor der Freemium-Pruefung.
// Danach frei, wenn eines gilt:
//   - vollzugang (= Pkw-Vollzugang), pkw in E, Video hat ein Pkw-/Alle-Thema oder keine Themen
//   - vollzugang_lkw, lkw in E, Video hat ein Lkw-/Alle-Thema
//   - video.gratis / ein ERLAUBTES Thema ist gratis / persoenliche Freischaltung
//     (Einzelvideo, oder Paket mit dem Bereich eines ERLAUBTEN Themas)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// 11.10.2026: Erlaubte Fahrzeuge des Schuelers. Fehlt ein Feld (alter Datensatz):
// zugang_pkw gilt als true, zugang_lkw als false.
function erlaubteFahrzeuge(s) {
  const e = [];
  if (s.zugang_pkw !== false) e.push("pkw");
  if (s.zugang_lkw === true) e.push("lkw");
  return e;
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { session_token, video_id } = await req.json();
    if (!session_token || !video_id) return json({ error: "session_token und video_id erforderlich", code: "eingabe_fehlt" }, 400);

    const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: session, error: sessionError } = await supa
      .from("academy_sessions")
      .select("schueler_id, expires_at")
      .eq("session_token", session_token)
      .maybeSingle();

    if (sessionError) return json({ error: "Verbindung zum Server gestört, bitte gleich nochmal versuchen.", code: "voruebergehend" }, 503);
    if (!session) return json({ error: "Session ungültig — bitte neu einloggen", code: "session_ungueltig" }, 401);
    if (new Date(session.expires_at) < new Date()) {
      return json({ error: "Session abgelaufen — bitte neu einloggen", code: "session_abgelaufen" }, 401);
    }

    const { data: schueler, error: schuelerError } = await supa
      .from("academy_schueler")
      .select("aktiv, ablauf_am, schule_id, vollzugang, zugang_pkw, zugang_lkw, vollzugang_lkw")
      .eq("id", session.schueler_id)
      .maybeSingle();

    if (schuelerError) return json({ error: "Verbindung zum Server gestört, bitte gleich nochmal versuchen.", code: "voruebergehend" }, 503);
    if (!schueler) return json({ error: "Zugang nicht gefunden", code: "schueler_nicht_gefunden" }, 403);
    if (!schueler.aktiv) return json({ error: "Zugang gesperrt", code: "zugang_gesperrt" }, 403);
    if (new Date(schueler.ablauf_am) < new Date()) return json({ error: "Zugang abgelaufen", code: "zugang_abgelaufen" }, 403);

    if (schueler.schule_id) {
      const { data: schule } = await supa
        .from("academy_schulen")
        .select("aktiv")
        .eq("id", schueler.schule_id)
        .maybeSingle();
      if (schule && !schule.aktiv) return json({ error: "Zugang der Fahrschule pausiert", code: "schule_pausiert" }, 403);
    }

    const { data: video, error: videoError } = await supa
      .from("academy_videos")
      .select("bunny_video_id, gratis, gebiet_id, ausgeblendet, status")
      .eq("id", video_id)
      .maybeSingle();

    // 26.09.2026: ausgeblendete Videos (ersetzt das Loeschen) sind nicht abspielbar.
    // 26.09.2026 (P2): Entwuerfe und noch verarbeitete Videos sind ebenfalls nicht abspielbar.
    if (videoError || !video || !video.bunny_video_id || video.ausgeblendet === true || (video.status && video.status !== "live")) {
      return json({ error: "Video nicht gefunden oder noch nicht mit Bunny verknüpft", code: "video_fehlt" }, 404);
    }

    // --- Fahrzeug-Pruefung (11.10.2026, Lkw-Bereich) ---
    // Themen IMMER laden (auch bei Vollzugang): ohne sie laesst sich das Fahrzeug nicht pruefen.
    // Bei einem Datenbankfehler bewusst SPERREN statt durchlassen.
    const { data: tagZeilen, error: tagError } = await supa
      .from("academy_video_tags")
      .select("academy_tags(fahrzeug, gratis, archiviert, stufe)")
      .eq("video_id", video_id);
    if (tagError) return json({ error: "Zugriff konnte nicht geprüft werden", code: "voruebergehend" }, 503);

    const erlaubt = erlaubteFahrzeuge(schueler);
    const passt = (fz) => fz === "alle" || erlaubt.indexOf(fz) !== -1;
    const themen = (tagZeilen || [])
      .map((t) => t.academy_tags)
      .filter((t) => t && t.archiviert !== true)
      .map((t) => ({ ...t, fahrzeug: t.fahrzeug || "pkw" }));
    const erlaubteThemen = themen.filter((t) => passt(t.fahrzeug));
    const sichtbar = themen.length === 0 ? erlaubt.indexOf("pkw") !== -1 : erlaubteThemen.length > 0;
    if (!sichtbar) {
      return json({ error: "Dieses Video gehört nicht zu deinem Bereich.", code: "fahrzeug_nicht_freigegeben" }, 403);
    }

    // --- Gebietspruefung (15.09.2026) ---
    if (video.gebiet_id && schueler.schule_id) {
      const { data: freigabe, error: freigabeError } = await supa
        .from("academy_schule_gebiete")
        .select("gebiet_id")
        .eq("schule_id", schueler.schule_id)
        .eq("gebiet_id", video.gebiet_id)
        .maybeSingle();
      if (!freigabeError && !freigabe) {
        return json({
          error: "Dieses Video gehört zu einem anderen Prüfgebiet.",
          code: "gebiet_nicht_freigegeben",
        }, 403);
      }
    }

    // --- Freemium-Pruefung ---
    // 11.10.2026: Vollzugang gilt je Fahrzeug (vollzugang = Pkw, vollzugang_lkw = Lkw).
    const pkwFrei = schueler.vollzugang === true && erlaubt.indexOf("pkw") !== -1 &&
      (themen.length === 0 || themen.some((t) => t.fahrzeug === "pkw" || t.fahrzeug === "alle"));
    const lkwFrei = schueler.vollzugang_lkw === true && erlaubt.indexOf("lkw") !== -1 &&
      themen.some((t) => t.fahrzeug === "lkw" || t.fahrzeug === "alle");

    if (!pkwFrei && !lkwFrei) {
      // 11.10.2026: Gratis-Themen und Paket-Bereiche zaehlen nur aus ERLAUBTEN Themen.
      let istFrei = video.gratis === true || erlaubteThemen.some((t) => t.gratis === true);
      const stufenDesVideos = erlaubteThemen.map((t) => t.stufe).filter(Boolean);

      // --- Persoenliche Freischaltungen (18.09.2026): Einzelvideo oder Paket ---
      if (!istFrei) {
        const { data: frei, error: freiError } = await supa
          .from("academy_freischaltungen")
          .select("art, video_id, academy_pakete(umfang_stufen, aktiv)")
          .eq("schueler_id", session.schueler_id);

        if (freiError) return json({ error: "Zugriff konnte nicht geprüft werden", code: "voruebergehend" }, 503);

        istFrei = (frei || []).some((f) => {
          if (f.art === "video") return f.video_id === video_id;
          if (f.art === "paket") {
            const p = f.academy_pakete;
            if (!p || p.aktiv === false) return false;
            return (p.umfang_stufen || []).some((st) => stufenDesVideos.indexOf(st) !== -1);
          }
          return false;
        });
      }

      if (!istFrei) {
        return json({ error: "Dieses Video gehört zum Vollzugang. Sprich mit deiner Fahrschule, um ihn freizuschalten.", code: "vollzugang_erforderlich" }, 402);
      }
    }

    const expires = Math.floor(Date.now() / 1000) + 60 * 15;
    const rawToken = BUNNY_TOKEN_AUTH_KEY + video.bunny_video_id + expires;
    const token = await sha256Hex(rawToken);

    // "Bereits gesehen" (reine Selbstkontrolle des Schuelers):
    // AUSSCHLIESSLICH fuer den Schueler selbst. Keine Anzeige je Schueler im Admin,
    // keine Auswertung, kein Feedback -- damit bleibt es Selbstkontrolle und wird nicht
    // zur "Ueberwachung des Lernerfolgs" im Sinne des FernUSG (vgl. OLG Koeln 2 U 24/23).
    try {
      await supa.from("academy_fortschritt").insert({
        schueler_id: session.schueler_id,
        video_id: video_id,
        gesehen_am: new Date().toISOString(),
      });
    } catch (_e) { /* Komfort-Funktion, kein Blocker */ }

    return json({
      library_id: BUNNY_LIBRARY_ID,
      bunny_video_id: video.bunny_video_id,
      token: token,
      expires: expires,
    });
  } catch (e) {
    return json({ error: String(e), code: "voruebergehend" }, 500);
  }
});
