import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// academy-szene (26.09.2026, Stufe 6 / W8): "Verkehr verstehen"
// Die 3D-Szenen liegen in academy_szenen (kein oeffentlicher Lesezugriff).
//   { aktion: "liste" }        -> Uebersicht aller aktiven Szenen, je Szene "frei" ja/nein
//   { aktion: "szene", id }    -> ganze Szene, wenn frei; sonst nur das erste Kapitel (Kostprobe)
// Frei ist eine Szene bei Vollzugang, wenn sie als Kostprobe markiert ist oder eines ihrer
// Themen gratis ist. Verwaltung (Admin-JWT) bekommt immer alles (Vorschau).
// Ablehnungen tragen einen "code" wie bei den anderen Functions; die App meldet nur bei
// session_ungueltig / session_abgelaufen / zugang_gesperrt / zugang_abgelaufen / schule_pausiert ab.
// 29.09.2026: Spanisch (es) dazu.
// 01.10.2026: ru, sr, ckb (Sorani), kmr (Kurmancî), hi, ur, vi, rif (Tarifit) dazu.
// 02.10.2026: fa (Farsi), ps (Paschtu), el (Griechisch), am (Amharisch), ti (Tigrinya) dazu.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
const SPRACHEN = ["de", "tr", "en", "ar", "es", "ru", "sr", "ckb", "kmr", "hi", "ur", "vi", "rif", "fa", "ps", "el", "am", "ti"];

// Kostprobe: erste Fassung bis zum Beginn von Kapitel 2
function kostprobe(d, sprache) {
  const v = d.varianten[0];
  const tEnde = v.kapitel.length > 1 ? v.kapitel[1].t : v.dauer;
  const n = Math.ceil(tEnde / v.dt) + 1;
  const fahrzeuge = v.fahrzeuge.map((f) => {
    const o = { ...f };
    if (o.P) o.P = o.P.slice(0, n * 5);
    if (o.SIG) o.SIG = o.SIG.slice(0, n);
    return o;
  });
  const texte = {};
  Object.keys(d.texte || {}).forEach((sp) => {
    const t = d.texte[sp] || {};
    const k0 = v.kapitel[0] && t.kapitel ? t.kapitel[v.kapitel[0].id] : null;
    texte[sp] = { titel: t.titel, kurz: t.kurz, worum: t.worum, worumRegel: t.worumRegel, kapitel: k0 ? { [v.kapitel[0].id]: k0 } : {} };
  });
  const tx = (d.texte && (d.texte[sprache] || d.texte.de)) || {};
  const txDe = (d.texte && d.texte.de) || {};
  const gesperrt = v.kapitel.slice(1).map((k) => ((tx.kapitel && tx.kapitel[k.id]) || (txDe.kapitel && txDe.kapitel[k.id]) || {}).titel || "");
  return {
    v: d.v, id: d.id, kategorie: d.kategorie, texte,
    varianten: [{ ...v, dauer: tEnde, fahrzeuge, kapitel: v.kapitel.slice(0, 1), hilfen: v.hilfen ? v.hilfen.slice(0, n) : null }],
    teaser: { gesperrt, fassungen: d.varianten.length },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const sprache = SPRACHEN.indexOf(body.sprache) !== -1 ? body.sprache : "de";

    // --- Wer fragt? ---
    let vollzugang = false, admin = false;
    if (body.session_token) {
      const { data: session, error: sErr } = await supa.from("academy_sessions").select("schueler_id, expires_at").eq("session_token", body.session_token).maybeSingle();
      if (sErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if (!session) return json({ error: "session_ungueltig", code: "session_ungueltig" }, 401);
      if (new Date(session.expires_at) < new Date()) return json({ error: "session_abgelaufen", code: "session_abgelaufen" }, 401);
      const { data: s, error: e2 } = await supa.from("academy_schueler").select("aktiv, ablauf_am, schule_id, vollzugang").eq("id", session.schueler_id).maybeSingle();
      if (e2) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if (!s) return json({ error: "schueler_nicht_gefunden", code: "schueler_nicht_gefunden" }, 403);
      if (!s.aktiv) return json({ error: "zugang_gesperrt", code: "zugang_gesperrt" }, 403);
      if (new Date(s.ablauf_am) < new Date()) return json({ error: "zugang_abgelaufen", code: "zugang_abgelaufen" }, 403);
      if (s.schule_id) {
        const { data: schule } = await supa.from("academy_schulen").select("aktiv").eq("id", s.schule_id).maybeSingle();
        if (schule && !schule.aktiv) return json({ error: "schule_pausiert", code: "schule_pausiert" }, 403);
      }
      vollzugang = s.vollzugang === true;
    } else {
      const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "").trim();
      if (jwt) {
        const { data: u } = await supa.auth.getUser(jwt);
        if (u && u.user) {
          const { data: rolle } = await supa.from("academy_admin_users").select("rolle").eq("user_id", u.user.id).maybeSingle();
          if (rolle) admin = true;
        }
      }
      if (!admin) return json({ error: "nicht_angemeldet", code: "nicht_angemeldet" }, 401);
    }

    // Gratis-Themen (wie bei den Videos): eine Szene zu einem freien Thema ist frei
    const { data: tags, error: tErr } = await supa.from("academy_tags").select("id, gratis, archiviert");
    if (tErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
    const freieThemen = new Set((tags || []).filter((t) => t.gratis === true && t.archiviert !== true).map((t) => t.id));
    const istFrei = (z) => admin || vollzugang || z.kostprobe === true || (z.themen || []).some((t) => freieThemen.has(t));

    if (body.aktion === "liste") {
      const { data, error } = await supa.from("academy_szenen")
        .select("id, kategorie, reihenfolge, titel, kurz, themen, kostprobe, dauer:daten->varianten->0->dauer, kapitel:daten->varianten->0->kapitel, texte:daten->texte")
        .eq("aktiv", true).order("reihenfolge");
      if (error) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      return json({ ok: true, szenen: (data || []).map((z) => {
        const t = (z.texte && (z.texte[sprache] || z.texte.de)) || {};
        return { id: z.id, kategorie: z.kategorie, titel: t.titel || z.titel, kurz: t.kurz || z.kurz, themen: z.themen, kostprobe: z.kostprobe,
          frei: istFrei(z), dauer: z.dauer, kapitel: Array.isArray(z.kapitel) ? z.kapitel.length : 0 };
      }) });
    }

    if (body.aktion === "szene") {
      if (typeof body.id !== "string" || !/^[a-z0-9_]{1,40}$/.test(body.id)) return json({ error: "id fehlt", code: "eingabe_fehlt" }, 400);
      const { data: z, error } = await supa.from("academy_szenen").select("id, themen, kostprobe, aktiv, daten").eq("id", body.id).maybeSingle();
      if (error) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if (!z || !z.aktiv) return json({ error: "szene_fehlt", code: "szene_fehlt" }, 404);
      if (istFrei(z)) return json({ ok: true, voll: true, szene: z.daten });
      return json({ ok: true, voll: false, szene: kostprobe(z.daten, sprache) });
    }
    return json({ error: "aktion unbekannt", code: "eingabe_fehlt" }, 400);
  } catch (e) {
    return json({ error: String(e), code: "voruebergehend" }, 500);
  }
});
