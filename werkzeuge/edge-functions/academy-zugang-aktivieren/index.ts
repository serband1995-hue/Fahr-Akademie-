// Fahr-Akademie — academy-zugang-aktivieren (v5, 15.09.2026)
// Bereich 8.4: Ein-Klick-Freischaltung. Macht in EINEM Aufruf:
//   1. Kandidat -> echter Schueler (PIN erzeugen, 6 Monate Laufzeit)
//   2. PIN-Mail verschicken (Resend), falls E-Mail hinterlegt
//   3. Wartende Kompass-Empfehlung einloesen + Push nachholen (Bereich 7.2)
//   4. Alles im Aenderungsverlauf protokollieren (Bereich 8.7)
// Auth: gleiches Muster wie academy-send-pin (eingeloggter Admin, server-seitig geprueft).
//
// v2-Fix: academy_schueler.klasse ist NOT NULL mit Default 'B'. Ein explizit
// mitgeschicktes null haette den Default ausgehebelt und den Insert zerbrochen.
// Optionale Felder werden jetzt nur gesetzt, wenn wirklich ein Wert vorliegt.
//
// v3-Fix (28.08.2026): Seit dem Freemium-Umbau bekommt academy_schueler.vollzugang
// beim Insert sonst den Spalten-Standard FALSE -- das haette "Ein-Klick-Freischaltung"
// aus der Kandidatenliste faelschlich auf "nur Fahrzeug-Check" gesetzt, obwohl diese
// Funktion eine VOLLSTAENDIGE Aktivierung meint (Dialog sagt "Zugang freischalten").
// Deshalb hier explizit vollzugang:true mitgeben.
//
// v5 (15.09.2026): Automatischer Vollzugang war falsch -- jeder Klick buchte 100 EUR
// (Fall Alexandru Darie). Jetzt entscheidet der Admin: body.vollzugang === true -> Vollzugang,
// alles andere (auch fehlend) -> Startzugang. Vollzugang wird immer explizit gesetzt,
// damit nie ein Spalten-Standard entscheidet.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = "Fahr-Akademie <noreply@fahr-akademie.info>";
const VAPID_PUBLIC_KEY = "BBO28AhtL8Ydemd-uwI-_9e3ICTPzJZLuB6gefW89gip0sh6AynP1fjimBa6rMlf9qlp-6-J74E2AWND8uXEjKg";
const DEEP_LINK_BASE = "https://serband1995-hue.github.io/Fahr-Akademie-/";
const LAUFZEIT_MONATE = 6;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function randomPin(): string {
  const bytes = new Uint32Array(1);
  let v: number;
  do {
    crypto.getRandomValues(bytes);
    v = bytes[0];
  } while (v >= 4294960000);
  return String(v % 10000).padStart(4, "0");
}

function normalizeTelefon(raw: string): string {
  let t = (raw || "").replace(/[\s\-\/]/g, "");
  if (t.startsWith("+49")) t = "0" + t.slice(3);
  else if (t.startsWith("0049")) t = "0" + t.slice(4);
  return t;
}

function escapeHtml(s: string): string {
  return String(s || "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const callerToken = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: callerData, error: callerError } = await supa.auth.getUser(callerToken);
    if (callerError || !callerData?.user) return json({ error: "Nicht eingeloggt" }, 401);

    const { data: callerRole } = await supa
      .from("academy_admin_users").select("rolle, schule_id, name")
      .eq("user_id", callerData.user.id).maybeSingle();
    if (!callerRole) return json({ error: "Kein Admin-Zugang" }, 403);

    const body = await req.json();
    const { kandidat_id, email_override, fahrlehrer_id, klasse_override } = body || {};
    const mitVollzugang = (body || {}).vollzugang === true;
    // 11.10.2026, Lkw-Bereich: Art des Schuelers (Pkw / Lkw / beides) und Lkw-Vollzugang.
    // Nur echte true/false uebernehmen -- fehlt etwas, setzt der DB-Trigger den Bereich aus der
    // Klasse (C, CE, C1, C1E -> Lkw). vollzugang bleibt der Pkw-Vollzugang.
    const art = (body || {}).art;
    const mitVollzugangLkw = (body || {}).vollzugang_lkw === true;
    if (!kandidat_id) return json({ error: "kandidat_id ist Pflichtfeld" }, 400);

    const { data: kand } = await supa
      .from("academy_kandidaten")
      .select("id, name, telefon, email, klasse, schule_id, schueler_id")
      .eq("id", kandidat_id).maybeSingle();
    if (!kand) return json({ error: "Kandidat nicht gefunden" }, 404);

    if (callerRole.rolle !== "super_admin" && kand.schule_id !== callerRole.schule_id) {
      return json({ error: "Kein Zugriff auf diesen Kandidaten" }, 403);
    }
    if (kand.schueler_id) {
      return json({ error: "Dieser Kandidat hat bereits einen Zugang" }, 409);
    }

    const telefonNorm = normalizeTelefon(kand.telefon);
    const email = (email_override || kand.email || "").trim() || null;

    const { data: schonDa } = await supa
      .from("academy_schueler").select("id, name")
      .eq("telefon", telefonNorm).maybeSingle();
    if (schonDa) {
      await supa.from("academy_kandidaten")
        .update({ schueler_id: schonDa.id, konvertiert_am: new Date().toISOString() })
        .eq("id", kand.id);
      return json({ error: "Für diese Telefonnummer existiert bereits ein Zugang (" + schonDa.name + ")", bereits_vorhanden: true }, 409);
    }

    const pin = randomPin();
    const jetzt = new Date();
    const ablauf = new Date(jetzt);
    ablauf.setMonth(ablauf.getMonth() + LAUFZEIT_MONATE);
    const neueId = crypto.randomUUID();

    // Nur Pflichtfelder fest setzen. Optionale Felder werden ausgelassen, wenn leer,
    // damit die Datenbank-Defaults greifen (klasse ist NOT NULL DEFAULT 'B').
    // vollzugang bewusst IMMER explizit -- siehe v5-Kommentar oben.
    const datensatz: Record<string, unknown> = {
      id: neueId,
      name: kand.name,
      telefon: telefonNorm,
      pin: pin,
      erstellt_am: jetzt.toISOString(),
      ablauf_am: ablauf.toISOString(),
      aktiv: true,
      vollzugang: mitVollzugang,
    };
    if (email) datensatz.email = email;
    const klasse = (klasse_override || kand.klasse || "").trim();
    if (klasse) datensatz.klasse = klasse.toUpperCase();
    if (fahrlehrer_id) datensatz.fahrlehrer_id = fahrlehrer_id;
    if (art === "pkw" || art === "lkw" || art === "beide") {
      datensatz.zugang_pkw = art !== "lkw";
      datensatz.zugang_lkw = art !== "pkw";
    }
    datensatz.vollzugang_lkw = mitVollzugangLkw;

    const { error: insErr } = await supa.from("academy_schueler").insert(datensatz);
    if (insErr) return json({ error: "Zugang konnte nicht angelegt werden: " + insErr.message }, 500);

    await supa.from("academy_kandidaten")
      .update({ schueler_id: neueId, konvertiert_am: jetzt.toISOString() })
      .eq("id", kand.id);

    await supa.from("academy_aenderungen").insert({
      akteur: callerRole.name || callerData.user.email || "Admin",
      aktion: "zugang_freigeschaltet",
      objekt_typ: "schueler",
      objekt_id: neueId,
      objekt_name: kand.name,
      details: "Freischaltung aus Kandidatenliste (" + (mitVollzugang ? "Vollzugang" : "Startzugang") + (mitVollzugangLkw ? ", Lkw-Vollzugang" : "") + (art ? ", Bereich " + art : "") + "), gültig bis " + ablauf.toISOString().slice(0, 10),
    });

    let mailStatus = "keine_email_hinterlegt";
    if (email) {
      const { data: resendKey } = await supa.rpc("get_decrypted_secret", { secret_name: "resend_api_key" });
      if (!resendKey) {
        mailStatus = "resend_key_fehlt";
      } else {
        const html = `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#3a7350;">Fahr-Akademie — Dein Zugang</h2>
            <p>Hallo ${escapeHtml(kand.name)},</p>
            <p>dein Zugang zur Fahr-Akademie ist freigeschaltet. So loggst du dich ein:</p>
            <ul>
              <li>Telefonnummer: <strong>${escapeHtml(telefonNorm)}</strong></li>
              <li>PIN: <strong style="font-size:20px;letter-spacing:2px;">${escapeHtml(pin)}</strong></li>
            </ul>
            <p>Hier geht's direkt zur App: <a href="${DEEP_LINK_BASE}">${DEEP_LINK_BASE}</a></p>
            <p>Dein Zugang ist ${LAUFZEIT_MONATE} Monate gültig. Bitte gib deine PIN nicht weiter — der Zugang
            ist persönlich auf dich ausgestellt und nur für dich gedacht.</p>
            <p>Viel Erfolg bei der Prüfung!</p>
          </div>`;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject: "Dein Zugang zur Fahr-Akademie", html }),
        });
        mailStatus = res.ok ? "gesendet" : ("resend_fehler: " + (await res.text()).slice(0, 200));
      }
    }

    let empfehlungStatus = "keine";
    let pushGesendetAn = 0;
    const { data: offeneEmpf } = await supa
      .from("academy_empfehlung")
      .select("id, stufe, tag_id, nachricht, pruefungstermin")
      .eq("telefon", telefonNorm).is("eingeloest_am", null)
      .order("erstellt_am", { ascending: false }).limit(1);

    if (offeneEmpf && offeneEmpf.length > 0) {
      const e = offeneEmpf[0];
      await supa.from("academy_empfehlung")
        .update({ eingeloest_am: new Date().toISOString() }).eq("id", e.id);
      if (e.pruefungstermin) {
        await supa.from("academy_schueler")
          .update({ pruefungstermin: e.pruefungstermin }).eq("id", neueId);
      }
      empfehlungStatus = "eingeloest";

      const { data: subs } = await supa
        .from("academy_push_subscriptions").select("*").eq("schueler_id", neueId);
      if (subs && subs.length > 0) {
        const { data: vapidKey } = await supa.rpc("get_decrypted_secret", { secret_name: "vapid_private_key" });
        if (vapidKey) {
          webpush.setVapidDetails("mailto:fahrlehrerserband@gmail.com", VAPID_PUBLIC_KEY, vapidKey);
          let link = DEEP_LINK_BASE;
          if (e.stufe) {
            link += "?stufe=" + encodeURIComponent(e.stufe);
            if (e.tag_id) link += "&tag=" + encodeURIComponent(e.tag_id);
          }
          const payload = JSON.stringify({
            title: "Fahr-Akademie",
            body: e.nachricht || "Dein Zugang ist freigeschaltet — dein empfohlenes Video wartet auf dich.",
            url: link,
          });
          for (const s of subs) {
            try {
              await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } }, payload);
              pushGesendetAn++;
            } catch (err) {
              const code = (err as any)?.statusCode;
              if (code === 410 || code === 404) await supa.from("academy_push_subscriptions").delete().eq("id", s.id);
            }
          }
        }
      }
    }

    return json({
      ok: true,
      schueler_id: neueId,
      name: kand.name,
      telefon: telefonNorm,
      pin: pin,
      vollzugang: mitVollzugang,
      vollzugang_lkw: mitVollzugangLkw,
      ablauf_am: ablauf.toISOString(),
      mail: mailStatus,
      empfehlung: empfehlungStatus,
      push_gesendet_an: pushGesendetAn,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
