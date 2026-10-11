import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { telefonKandidaten } from "./tel.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_FEHLVERSUCHE = 5;
const SPERR_MINUTEN = 15;
const RESET_FENSTER_MINUTEN = 15;
// 09.09.2026, Betrugsschutz Punkt 1: Sperrfrist nach einem Geraetewechsel.
const GERAETEWECHSEL_COOLDOWN_MINUTEN = 10;
// 11.10.2026, LKW-BEREICH: Die App schickt body.fahrzeug ("pkw" | "lkw") vom Login-Schalter.
// Fehlt der Zugang fuer das gewaehlte Fahrzeug -> 403 fahrzeug_falsch. Geprueft NACH der PIN
// (verraet sonst, ob eine Nummer existiert) und VOR dem Loeschen alter Sessions / dem
// Geraetewechsel (ein falscher Schalter darf kein anderes Geraet abmelden). Ohne body.fahrzeug
// (alte App) wie bisher. Antwort liefert zugang_pkw / zugang_lkw / vollzugang_lkw mit
// (alter Datensatz ohne Felder: zugang_pkw = true, zugang_lkw = false).

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { telefon, pin, geraete_id, fahrzeug } = await req.json();
    if (!telefon || !pin) return json({ error: "Telefonnummer und PIN erforderlich" }, 400);

    const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    // 26.09.2026: Nummer in jeder Schreibweise akzeptieren (+49, 0049, Leerzeichen, Striche).
    // Es kommen nur Treffer dazu -- die bisherige Schreibweise wird weiter zuerst geprueft.
    const tel = telefonKandidaten(telefon);
    // Fehlversuche zaehlen je kanonischer Nummer, damit andere Schreibweisen die Sperre nicht umgehen.
    const versuchKey = tel.kanon;
    const geraeteId = geraete_id ? String(geraete_id).slice(0, 64) : null;
    const now = new Date();

    const { data: versuch } = await supa
      .from("academy_login_versuche")
      .select("fehlversuche, letzter_versuch, gesperrt_bis")
      .eq("telefon", versuchKey)
      .maybeSingle();

    if (versuch?.gesperrt_bis && new Date(versuch.gesperrt_bis) > now) {
      const minutenRest = Math.ceil((new Date(versuch.gesperrt_bis).getTime() - now.getTime()) / 60000);
      return json({ error: `Zu viele Fehlversuche. Bitte versuche es in ${minutenRest} Minute(n) erneut.`, code: "zu_viele_versuche" }, 429);
    }

    async function fehlversuchZaehlen() {
      let neueFehlversuche = 1;
      if (versuch) {
        const minutenSeitLetztem = (now.getTime() - new Date(versuch.letzter_versuch).getTime()) / 60000;
        neueFehlversuche = minutenSeitLetztem > RESET_FENSTER_MINUTEN ? 1 : versuch.fehlversuche + 1;
      }
      const gesperrtBis = neueFehlversuche >= MAX_FEHLVERSUCHE
        ? new Date(now.getTime() + SPERR_MINUTEN * 60000).toISOString()
        : null;
      await supa.from("academy_login_versuche").upsert({
        telefon: versuchKey,
        fehlversuche: neueFehlversuche,
        letzter_versuch: now.toISOString(),
        gesperrt_bis: gesperrtBis,
      });
    }

    const { data: treffer, error } = await supa
      .from("academy_schueler")
      .select("id, name, telefon, pin, aktiv, ablauf_am, schule_id, agb_akzeptiert_am, klasse, pruefungstermin, vollzugang, zugang_pkw, zugang_lkw, vollzugang_lkw, login_anzahl, letzte_geraete_id, letzter_geraetewechsel_am, geraetewechsel_anzahl")
      .in("telefon", tel.alle);

    if (error) return json({ error: "Datenbankfehler" }, 500);

    // Genaue Schreibweise zuerst, dann die kanonische, dann was sonst passt.
    const liste = treffer || [];
    const schueler = liste.find((s) => s.telefon === tel.alt) || liste.find((s) => s.telefon === tel.kanon) || liste[0] || null;

    if (!schueler || schueler.pin !== String(pin).trim()) {
      await fehlversuchZaehlen();
      return json({ error: "Telefonnummer oder PIN falsch", code: "pin_falsch" }, 401);
    }

    if (!schueler.aktiv) {
      return json({ error: "Dieser Zugang wurde gesperrt. Bitte wende dich an deine Fahrschule.", code: "zugang_gesperrt" }, 403);
    }
    if (new Date(schueler.ablauf_am) < now) {
      return json({ error: "Dein Zugang ist abgelaufen. Bitte wende dich an deine Fahrschule für eine Verlängerung.", code: "zugang_abgelaufen" }, 403);
    }

    if (schueler.schule_id) {
      const { data: schule } = await supa
        .from("academy_schulen")
        .select("aktiv")
        .eq("id", schueler.schule_id)
        .maybeSingle();
      if (schule && !schule.aktiv) {
        return json({ error: "Der Zugang deiner Fahrschule ist derzeit pausiert. Bitte wende dich an deine Fahrschule.", code: "schule_pausiert" }, 403);
      }
    }

    // --- Fahrzeug-Schalter (11.10.2026) ---
    const zugangPkw = schueler.zugang_pkw !== false;
    const zugangLkw = schueler.zugang_lkw === true;
    if (fahrzeug === "lkw" && !zugangLkw) {
      return json({ error: "Diese Zugangsdaten gelten nicht für den Lkw-Bereich.", code: "fahrzeug_falsch" }, 403);
    }
    if (fahrzeug === "pkw" && !zugangPkw) {
      return json({ error: "Diese Zugangsdaten gelten nicht für den Pkw-Bereich.", code: "fahrzeug_falsch" }, 403);
    }

    // --- Betrugsschutz Punkt 1: Cool-down bei Geraetewechsel ---
    const istGeraeteWechsel = !!(geraeteId && schueler.letzte_geraete_id && schueler.letzte_geraete_id !== geraeteId);
    if (istGeraeteWechsel && schueler.letzter_geraetewechsel_am) {
      const minutenSeitWechsel = (now.getTime() - new Date(schueler.letzter_geraetewechsel_am).getTime()) / 60000;
      if (minutenSeitWechsel < GERAETEWECHSEL_COOLDOWN_MINUTEN) {
        const rest = Math.ceil(GERAETEWECHSEL_COOLDOWN_MINUTEN - minutenSeitWechsel);
        return json({
          error: `Dieser Zugang wurde gerade auf einem anderen Gerät verwendet. Bitte versuche es in ${rest} Minute(n) erneut. Ein Zugang gilt nur für eine Person.`,
          code: "geraetewechsel_sperre",
        }, 429);
      }
    }

    await supa.from("academy_login_versuche").delete().in("telefon", Array.from(new Set([versuchKey, tel.alt])));

    // --- Ein-Geraet-Sperre: alle bisherigen Sessions dieses Schuelers verwerfen ---
    await supa.from("academy_sessions").delete().eq("schueler_id", schueler.id);

    const sessionToken = randomToken();
    const expiresAt = schueler.ablauf_am;

    const { error: sessionError } = await supa.from("academy_sessions").insert({
      session_token: sessionToken,
      schueler_id: schueler.id,
      expires_at: expiresAt,
    });
    if (sessionError) return json({ error: "Session konnte nicht erstellt werden" }, 500);

    // --- Zaehler fortschreiben (Punkt 2) ---
    try {
      const update = {
        login_anzahl: (schueler.login_anzahl || 0) + 1,
        letzter_login_am: now.toISOString(),
      };
      if (geraeteId) {
        update.letzte_geraete_id = geraeteId;
        if (istGeraeteWechsel) {
          update.letzter_geraetewechsel_am = now.toISOString();
          update.geraetewechsel_anzahl = (schueler.geraetewechsel_anzahl || 0) + 1;
        } else if (!schueler.letzte_geraete_id) {
          update.letzter_geraetewechsel_am = now.toISOString();
        }
      }
      await supa.from("academy_schueler").update(update).eq("id", schueler.id);
    } catch (_e) { /* Zaehler ist Beiwerk, kein Blocker */ }

    // Ab hier die gespeicherte Nummer verwenden (Empfehlungen sind unter ihr abgelegt).
    const gespeichertTel = schueler.telefon;

    let empfehlung = null;
    try {
      const { data: e } = await supa
        .from("academy_empfehlung")
        .select("stufe, tag_id, nachricht, erstellt_am")
        .eq("telefon", gespeichertTel)
        .order("erstellt_am", { ascending: false })
        .limit(1);
      if (e && e.length > 0 && (e[0].stufe || e[0].tag_id)) empfehlung = e[0];

      await supa.from("academy_empfehlung")
        .update({ eingeloest_am: now.toISOString() })
        .eq("telefon", gespeichertTel)
        .is("eingeloest_am", null);
    } catch (_e) { /* Empfehlung ist optional */ }

    let klassenFreigabe = {};
    try {
      const { data: kf } = await supa.from("academy_klassen_freigabe").select("klasse, freigegeben");
      (kf || []).forEach((r) => { klassenFreigabe[r.klasse] = r.freigegeben; });
    } catch (_e) { /* optional */ }

    // --- Prüfgebiete (15.09.2026) ---
    // gebiete = null bedeutet "sieht alles" (Schüler ohne Fahrschule). Eine leere Liste
    // würde "gar nichts sehen" bedeuten und wäre für Zahlende fatal.
    let gebiete = null;
    if (schueler.schule_id) {
      try {
        const { data: sg, error: sgError } = await supa
          .from("academy_schule_gebiete")
          .select("gebiet_id")
          .eq("schule_id", schueler.schule_id);
        if (!sgError) gebiete = (sg || []).map((r) => r.gebiet_id);
      } catch (_e) { /* im Fehlerfall bleibt gebiete null = alles sichtbar */ }
    }

    // --- Persönliche Freischaltungen (18.09.2026): gekaufte Pakete und geschenkte Videos ---
    // Reine ANZEIGE-Hilfe für die App. Die verbindliche Prüfung macht academy-video-token.
    const freigabeVideos = [];
    const freigabeStufen = [];
    try {
      const { data: fr } = await supa
        .from("academy_freischaltungen")
        .select("art, video_id, academy_pakete(umfang_stufen, aktiv)")
        .eq("schueler_id", schueler.id);
      (fr || []).forEach((f) => {
        if (f.art === "video" && f.video_id) freigabeVideos.push(f.video_id);
        if (f.art === "paket" && f.academy_pakete && f.academy_pakete.aktiv !== false) {
          (f.academy_pakete.umfang_stufen || []).forEach((st) => {
            if (freigabeStufen.indexOf(st) === -1) freigabeStufen.push(st);
          });
        }
      });
    } catch (_e) { /* ohne Freigaben verhält sich alles wie bisher */ }

    return json({
      session_token: sessionToken,
      name: schueler.name,
      telefon: gespeichertTel,
      ablauf_am: schueler.ablauf_am,
      agb_akzeptiert_am: schueler.agb_akzeptiert_am,
      klasse: schueler.klasse || null,
      pruefungstermin: schueler.pruefungstermin || null,
      empfehlung: empfehlung,
      klassen_freigabe: klassenFreigabe,
      vollzugang: schueler.vollzugang,
      zugang_pkw: zugangPkw,
      zugang_lkw: zugangLkw,
      vollzugang_lkw: schueler.vollzugang_lkw === true,
      schule_id: schueler.schule_id || null,
      gebiete: gebiete,
      freigabe_videos: freigabeVideos,
      freigabe_stufen: freigabeStufen,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
