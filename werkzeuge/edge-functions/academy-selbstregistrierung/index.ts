// Fahr-Akademie -- academy-selbstregistrierung (12.09.2026)
//
// WARUM ES DIESE FUNKTION GIBT:
// Bisher legte Serband jeden Schueler von Hand an. Das heisst: er erreicht nur, wen er
// gerade in der Fahrstunde sieht -- 2 bis 3 pro Woche. Seine WhatsApp-Gruppe hat aber
// ueber 70 Leute. Der Flaschenhals war also nie das Interesse, sondern die Handarbeit.
// Mit dieser Funktion traegt sich der Schueler selbst ein und bekommt sofort Zugang zum
// KOSTENLOSEN Bereich. Kein Vollzugang -- den gibt es weiterhin nur gegen Bezahlung.
//
// SICHERHEITSGRENZE (wichtig):
// Diese Funktion ist oeffentlich erreichbar. Sie darf deshalb NIEMALS Vollzugang vergeben,
// niemals bestehende Schueler veraendern und niemals eine fremde Schule zuordnen.
// Sie legt ausschliesslich NEUE Schueler mit vollzugang=false an.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Bremsen gegen Missbrauch. Ohne sie koennte jemand die Datenbank mit Fantasie-Zugaengen
// fluten -- im Gratis-Tarif sind 500 MB schnell voll, und die Schuelerliste waere wertlos.
const MAX_PRO_STUNDE_GESAMT = 30;   // ueber alle Anfragen hinweg
const MAX_PRO_IP_PRO_TAG = 5;
const LAUFZEIT_TAGE_GRATIS = 180;   // gleiche Laufzeit wie bezahlte Zugaenge

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors } });
}

function svc() { return createClient(SUPA_URL, SERVICE_KEY); }

// Telefonnummern kommen in allen Schreibweisen. Ohne Vereinheitlichung legt derselbe
// Mensch zwei Zugaenge an (+49176... und 0176...) und der Login findet ihn nicht wieder.
function normalizeTelefon(raw: string): string {
  let t = (raw || "").replace(/[\s\-\/()]/g, "");
  if (t.startsWith("+49")) t = "0" + t.slice(3);
  else if (t.startsWith("0049")) t = "0" + t.slice(4);
  else if (t.startsWith("49") && t.length > 10) t = "0" + t.slice(2);
  return t;
}
function telefonPlausibel(t: string): boolean { return /^0\d{6,14}$/.test(t); }
function emailPlausibel(e: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }

// Vierstellige PIN. Kryptografisch sicher erzeugt, nicht mit Math.random --
// bei 10.000 Moeglichkeiten waere eine vorhersagbare Reihenfolge ein echtes Risiko.
function erzeugePin(): string {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return String(b[0] % 10000).padStart(4, "0");
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const supa = svc();
  // IP nur als Pruefsumme speichern, nie im Klartext -- sie ist ein personenbezogenes
  // Datum, und fuer die Missbrauchsbremse genuegt der Vergleich von Pruefsummen.
  const ipRoh = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unbekannt";
  const ipHash = await sha256Hex(ipRoh + "|fahr-akademie");

  async function protokoll(telefon: string | null, erfolg: boolean, grund: string) {
    try {
      await supa.from("academy_registrierungen_log")
        .insert({ telefon, ip_hash: ipHash, erfolg, grund });
    } catch (_e) { /* Protokoll darf die Anmeldung nie blockieren */ }
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim().slice(0, 120);
    const telefon = normalizeTelefon(String(body?.telefon || ""));
    const emailRoh = String(body?.email || "").trim().slice(0, 200);
    const email = emailRoh && emailPlausibel(emailRoh) ? emailRoh : null;
    const klasseRoh = String(body?.klasse || "B").trim().toUpperCase();
    const klasse = ["B", "BE", "A", "A1", "A2", "AM", "C", "CE"].includes(klasseRoh) ? klasseRoh : "B";
    const werbeCode = String(body?.code || "").trim().toUpperCase().slice(0, 20) || null;

    if (!name || name.length < 2) {
      await protokoll(telefon || null, false, "name_fehlt");
      return json({ ok: false, error: "Bitte gib deinen Namen ein." }, 400);
    }
    if (!telefonPlausibel(telefon)) {
      await protokoll(telefon || null, false, "telefon_unplausibel");
      return json({ ok: false, error: "Bitte gib eine gültige Handynummer ein (z. B. 0176 12345678)." }, 400);
    }

    // --- Bremse 1: Gesamtzahl pro Stunde ---
    const vorEinerStunde = new Date(Date.now() - 3600_000).toISOString();
    const { count: gesamtStunde } = await supa
      .from("academy_registrierungen_log")
      .select("id", { count: "exact", head: true })
      .eq("erfolg", true).gte("zeitpunkt", vorEinerStunde);
    if ((gesamtStunde || 0) >= MAX_PRO_STUNDE_GESAMT) {
      await protokoll(telefon, false, "limit_gesamt");
      return json({ ok: false, error: "Gerade sind sehr viele Anmeldungen unterwegs. Bitte versuch es in einer Stunde nochmal." }, 429);
    }

    // --- Bremse 2: pro Anschluss und Tag ---
    const vorEinemTag = new Date(Date.now() - 86400_000).toISOString();
    const { count: proIp } = await supa
      .from("academy_registrierungen_log")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash).eq("erfolg", true).gte("zeitpunkt", vorEinemTag);
    if ((proIp || 0) >= MAX_PRO_IP_PRO_TAG) {
      await protokoll(telefon, false, "limit_ip");
      return json({ ok: false, error: "Von diesem Anschluss wurden heute schon mehrere Zugänge angelegt." }, 429);
    }

    // --- Gibt es die Nummer schon? ---
    // Bewusst KEINE Aenderung am bestehenden Zugang: eine oeffentliche Funktion darf
    // fremde Daten nicht anfassen. Stattdessen freundlich auf den Login verweisen.
    const { data: schonDa } = await supa
      .from("academy_schueler").select("id").eq("telefon", telefon).maybeSingle();
    if (schonDa) {
      await protokoll(telefon, false, "bereits_vorhanden");
      return json({
        ok: false, code: "bereits_vorhanden",
        error: "Für diese Nummer gibt es schon einen Zugang. Melde dich einfach an — oder lass dir die PIN neu schicken.",
      }, 409);
    }

    // --- Anlegen ---
    const id = "s" + Date.now();
    const pin = erzeugePin();
    const ablauf = new Date(Date.now() + LAUFZEIT_TAGE_GRATIS * 86400_000).toISOString();

    const { error: insErr } = await supa.from("academy_schueler").insert({
      id, name, telefon, email, pin, klasse,
      fahrlehrer_id: "serband",   // Direktverkauf, keine fremde Schule
      ablauf_am: ablauf,
      aktiv: true,
      vollzugang: false,          // NIEMALS true aus dieser oeffentlichen Funktion
    });
    if (insErr) {
      await protokoll(telefon, false, "insert_fehler: " + insErr.message);
      return json({ ok: false, error: "Das hat leider nicht geklappt. Versuch es bitte nochmal." }, 500);
    }

    // --- Werbecode einloesen, falls mitgegeben ---
    let werbungOk = false;
    if (werbeCode) {
      const { data: w } = await supa
        .from("academy_weiterempfehlung")
        .select("code, werber_id, eingeloest_am")
        .eq("code", werbeCode).maybeSingle();
      // Nur einloesen, wenn der Code existiert, noch frei ist und nicht der eigene ist.
      if (w && !w.eingeloest_am && w.werber_id !== id) {
        await supa.from("academy_weiterempfehlung")
          .update({ geworben_id: id, eingeloest_am: new Date().toISOString() })
          .eq("code", werbeCode);
        werbungOk = true;
      }
    }

    await supa.from("academy_aenderungen").insert({
      akteur: "Selbstregistrierung", aktion: "schueler_selbst_angelegt", objekt_typ: "schueler",
      objekt_id: id, objekt_name: name,
      details: "Gratis-Zugang, Klasse " + klasse + (email ? ", E-Mail vorhanden" : ", OHNE E-Mail") +
               (werbungOk ? ", Werbecode " + werbeCode : ""),
    });

    await protokoll(telefon, true, "ok");

    // PIN per Mail schicken -- nur wenn eine Adresse da ist. Ein Fehler hier darf die
    // Anmeldung nicht scheitern lassen: der Schueler sieht die PIN ohnehin am Bildschirm.
    let mailVersendet = false;
    if (email) {
      try {
        const r = await fetch(SUPA_URL + "/functions/v1/academy-send-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SERVICE_KEY },
          body: JSON.stringify({ schueler_id: id, intern: true }),
        });
        mailVersendet = r.ok;
      } catch (_e) { mailVersendet = false; }
    }

    return json({
      ok: true, name, telefon, pin, klasse,
      ablauf_am: ablauf,
      mail_versendet: mailVersendet,
      werbung_eingeloest: werbungOk,
    });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
