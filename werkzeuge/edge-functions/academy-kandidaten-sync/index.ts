// Fahr-Akademie — academy-kandidaten-sync (v3 = Version 7 im Projekt, 10.10.2026)
// Holt die Schülerliste AKTIV bei Fahrlehrer-Kompass ab (Pull statt Push).
// Vorteil gegenüber Push: Zeitplan, Wiederholung und Fehlerprotokoll liegen hier,
// Kompass braucht nur Lese-Schnittstellen.
//
// v2-Fix: Kompass liefert als Klasse die Ausbildungsform (B, B197, Automatik),
// nicht die Führerscheinklasse. B197 und Automatik sind fachlich beide Klasse B
// (B197 = Automatik-Ausbildung mit Schaltberechtigung, Automatik = Schlüsselzahl 78).
// Ohne Umsetzung landete "AUTOMATIK" als Klasse in der Datenbank -- Datenmüll, der
// später bei Preisen und klassenabhängigen Inhalten Probleme macht.
// Die Original-Ausbildungsform geht nicht verloren, sie wandert in die Notiz.
//
// v3 (10.10.2026): zusätzlich Prüfungstermine. Zweite Lese-Schnittstelle im Kompass
// (kompass-termine-export, gleiche Adresse mit anderem Funktionsnamen, gleiches Geheimnis) liefert je Telefonnummer
// den frühesten geplanten Praxisprüfungs-Termin. Daraus wird academy_schueler.pruefungstermin gesetzt (Countdown in der App,
// Push-Erinnerung 5 Tage vorher). Ändert sich ein Termin, wird erinnerung_gesendet_am zurückgesetzt, damit die Erinnerung
// für den neuen Termin wieder kommt. Ein Fehler beim Termin-Abruf bricht den Schüler-Abgleich NICHT ab.
//
// Sicherheitsgrenze: Diese Funktion SCHREIBT in academy_kandidaten, academy_aenderungen und -- nur für die Prüfungstermine --
// in die Spalten pruefungstermin und erinnerung_gesendet_am von academy_schueler. Zugänge, PINs und Laufzeiten fasst sie nie an.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeTelefon, telefonPlausibel, planeAbgleich, berlinHeute } from "./termine.ts";

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_UEBERNEHMEN = 2000;
const ABRUF_TIMEOUT_MS = 20000;

// Bekannte Führerscheinklassen der Akademie (academy_klassen_freigabe).
const BEKANNTE_KLASSEN = ["B", "BE", "C", "CE", "A", "A1", "A2", "AM"];

function svc() { return createClient(SUPA_URL, SERVICE_KEY); }

async function getSecret(name: string): Promise<string | null> {
  const { data, error } = await svc().rpc("get_decrypted_secret", { secret_name: name });
  if (error) return null;
  return data || null;
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aB = enc.encode(a), bB = enc.encode(b);
  if (aB.length !== bB.length) {
    let d = 0; for (let i = 0; i < bB.length; i++) d |= bB[i];
    return false;
  }
  let diff = 0;
  for (let i = 0; i < aB.length; i++) diff |= aB[i] ^ bB[i];
  return diff === 0;
}

function emailPlausibel(e: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }

// Ausbildungsform -> Führerscheinklasse. Gibt zusaetzlich die Original-Form zurueck,
// damit die Information nicht verlorengeht.
function normalizeKlasse(roh: unknown): { klasse: string | null; form: string | null } {
  const t = String(roh || "").trim();
  if (!t) return { klasse: null, form: null };
  const gross = t.toUpperCase();

  // Automatik-Varianten der Klasse B
  if (gross === "B197" || gross === "B 197" || gross === "AUTOMATIK" || gross === "B AUTOMATIK") {
    return { klasse: "B", form: t };
  }
  if (BEKANNTE_KLASSEN.indexOf(gross) !== -1) {
    return { klasse: gross, form: (gross === t.toUpperCase() && gross !== t) ? t : null };
  }
  // Unbekannte Form: Klasse bewusst NICHT raten. Lieber leer lassen (dann greift
  // der Datenbank-Standard 'B') und die Originalangabe in der Notiz festhalten,
  // damit du siehst, dass da etwas Ungewohntes kam.
  return { klasse: null, form: t };
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bridge-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors } });
}

// Holt die Termine beim Kompass und gleicht sie mit academy_schueler ab. Gibt nur Zaehler zurueck (keine Namen, keine Nummern).
async function termineAbgleichen(supa: ReturnType<typeof createClient>, kompassUrl: string, bridgeSecret: string,
  schueler: { id: string; telefon: string | null; pruefungstermin: string | null }[]) {
  const erg = { gesetzt: 0, entfernt: 0, gebremst: false, ungueltig: 0, mehrdeutig: 0, fehler: null as string | null };
  const url = kompassUrl.replace("kompass-schueler-export", "kompass-termine-export");
  if (url === kompassUrl) { erg.fehler = "termine_adresse_nicht_ableitbar"; return erg; }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ABRUF_TIMEOUT_MS);
  let liste: unknown;
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-bridge-secret": bridgeSecret }, body: JSON.stringify({ quelle: "fahr-akademie" }), signal: ctrl.signal });
    if (!res.ok) { erg.fehler = "termine_http_" + res.status; return erg; }
    liste = (await res.json())?.termine;
  } catch (e) {
    erg.fehler = (e as any)?.name === "AbortError" ? "termine_zeitueberschreitung" : "termine_nicht_erreichbar";
    return erg;
  } finally { clearTimeout(timer); }
  if (!Array.isArray(liste)) { erg.fehler = "termine_antwort_ohne_liste"; return erg; }

  const plan = planeAbgleich(schueler, liste, berlinHeute());
  erg.gebremst = plan.entfernenGebremst; erg.ungueltig = plan.ungueltig; erg.mehrdeutig = plan.mehrdeutig;
  for (const z of plan.setzen) {
    const { error } = await supa.from("academy_schueler").update({ pruefungstermin: z.datum, erinnerung_gesendet_am: null }).eq("id", z.id);
    if (error) { erg.fehler = "termine_schreiben"; } else erg.gesetzt++;
  }
  for (const id of plan.entfernen) {
    const { error } = await supa.from("academy_schueler").update({ pruefungstermin: null }).eq("id", id);
    if (error) { erg.fehler = "termine_schreiben"; } else erg.entfernt++;
  }
  return erg;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const supa = svc();
  const start = Date.now();

  try {
    const bridgeSecret = await getSecret("kompass_bridge_secret");
    const provided = req.headers.get("x-bridge-secret") || "";
    let akteur = "Cron (automatisch)";
    let berechtigt = !!bridgeSecret && timingSafeEqual(provided, bridgeSecret);

    if (!berechtigt) {
      const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      const { data: u } = await supa.auth.getUser(token);
      if (u?.user) {
        const { data: rolle } = await supa
          .from("academy_admin_users").select("rolle, name")
          .eq("user_id", u.user.id).maybeSingle();
        if (rolle?.rolle === "super_admin") {
          berechtigt = true;
          akteur = rolle.name || u.user.email || "Admin";
        }
      }
    }
    if (!berechtigt) return json({ ok: false, error: "unauthorized" }, 401);

    const kompassUrl = await getSecret("kompass_export_url");
    if (!kompassUrl) {
      return json({ ok: false, error: "kompass_export_url_fehlt" }, 503);
    }
    if (!bridgeSecret) return json({ ok: false, error: "bridge_secret_fehlt" }, 503);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ABRUF_TIMEOUT_MS);
    let liste: any[];
    try {
      const res = await fetch(kompassUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-bridge-secret": bridgeSecret },
        body: JSON.stringify({ quelle: "fahr-akademie" }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const txt = (await res.text()).slice(0, 300);
        await supa.from("academy_aenderungen").insert({
          akteur, aktion: "kandidaten_sync_fehlgeschlagen", objekt_typ: "kandidat",
          details: "Kompass antwortete mit HTTP " + res.status + ": " + txt,
        });
        return json({ ok: false, error: "kompass_fehler", status: res.status, antwort: txt }, 502);
      }
      const daten = await res.json();
      liste = daten?.schueler;
    } catch (e) {
      const grund = (e as any)?.name === "AbortError" ? "Zeitüberschreitung" : String(e);
      await supa.from("academy_aenderungen").insert({
        akteur, aktion: "kandidaten_sync_fehlgeschlagen", objekt_typ: "kandidat",
        details: "Kompass nicht erreichbar: " + grund,
      });
      return json({ ok: false, error: "kompass_nicht_erreichbar", grund }, 502);
    } finally {
      clearTimeout(timer);
    }

    if (!Array.isArray(liste)) return json({ ok: false, error: "antwort_ohne_schueler_array" }, 502);
    if (liste.length > MAX_UEBERNEHMEN) {
      return json({ ok: false, error: "zu_viele", erhalten: liste.length, maximum: MAX_UEBERNEHMEN }, 400);
    }

    let neu = 0, aktualisiert = 0, unveraendert = 0, uebersprungen = 0, schon_zugang = 0, ohne_email = 0;
    const probleme: string[] = [];
    const unbekannteFormen = new Set<string>();

    const { data: vorhandene } = await supa
      .from("academy_kandidaten").select("id, name, telefon, email, klasse, notiz, konvertiert_am");
    const nachTelefon = new Map<string, any>();
    (vorhandene || []).forEach((k) => nachTelefon.set(k.telefon, k));

    const { data: schuelerAlle } = await supa.from("academy_schueler").select("id, telefon, pruefungstermin");
    const schuelerNachTelefon = new Map<string, string>();
    (schuelerAlle || []).forEach((s) => schuelerNachTelefon.set(s.telefon, s.id));

    for (const roh of liste) {
      const name = String(roh?.name || "").trim();
      const telefon = normalizeTelefon(String(roh?.telefon || ""));
      const emailRoh = String(roh?.email || "").trim();
      const email = emailRoh && emailPlausibel(emailRoh) ? emailRoh : null;
      const { klasse, form } = normalizeKlasse(roh?.klasse);
      if (form && klasse === null) unbekannteFormen.add(form);
      if (!email) ohne_email++;

      if (!name || !telefonPlausibel(telefon)) {
        uebersprungen++;
        if (probleme.length < 20) probleme.push((name || "(ohne Name)") + ": Telefonnummer fehlt oder unplausibel");
        continue;
      }

      const notiz = form ? ("Ausbildungsform laut Kompass: " + form) : null;
      const da = nachTelefon.get(telefon);
      const schuelerId = schuelerNachTelefon.get(telefon);

      if (da) {
        // Bereits freigeschaltete Kandidaten NICHT mehr anfassen -- sonst wuerde der
        // naechtliche Lauf den erledigten Status immer wieder ueberschreiben.
        if (da.konvertiert_am) { schon_zugang++; continue; }

        const patch: Record<string, unknown> = {};
        if (da.name !== name) patch.name = name;
        if (email && da.email !== email) patch.email = email;   // nie mit leer ueberschreiben
        if (klasse && da.klasse !== klasse) patch.klasse = klasse;
        if (notiz && da.notiz !== notiz) patch.notiz = notiz;
        if (schuelerId) {
          patch.schueler_id = schuelerId;
          patch.konvertiert_am = new Date().toISOString();
          schon_zugang++;
        }
        if (Object.keys(patch).length === 0) { unveraendert++; continue; }
        patch.quelle = "kompass";
        const { error } = await supa.from("academy_kandidaten").update(patch).eq("id", da.id);
        if (error) { uebersprungen++; if (probleme.length < 20) probleme.push(name + ": " + error.message); }
        else aktualisiert++;
      } else {
        const einfuegen: Record<string, unknown> = { name, telefon, email, klasse, notiz, quelle: "kompass" };
        if (schuelerId) {
          einfuegen.schueler_id = schuelerId;
          einfuegen.konvertiert_am = new Date().toISOString();
          schon_zugang++;
        }
        const { error } = await supa.from("academy_kandidaten").insert(einfuegen);
        if (error) { uebersprungen++; if (probleme.length < 20) probleme.push(name + ": " + error.message); }
        else neu++;
      }
    }

    if (unbekannteFormen.size > 0) {
      probleme.push("Unbekannte Ausbildungsformen (Klasse offen gelassen): " + Array.from(unbekannteFormen).join(", "));
    }

    // Prüfungstermine (v3): eigener Abruf, darf den Schüler-Abgleich nie verhindern.
    let termine = { gesetzt: 0, entfernt: 0, gebremst: false, ungueltig: 0, mehrdeutig: 0, fehler: null as string | null };
    try {
      termine = await termineAbgleichen(supa, kompassUrl, bridgeSecret, (schuelerAlle || []) as any);
    } catch (e) { termine.fehler = "termine_unerwartet"; }
    if (termine.fehler) probleme.push("Prüfungstermine: " + termine.fehler);
    if (termine.gebremst) probleme.push("Prüfungstermine: Entfernen gebremst (Export leer oder mehr als die Hälfte der künftigen Termine fehlt)");
    if (termine.mehrdeutig) probleme.push("Prüfungstermine: " + termine.mehrdeutig + " Schüler mit gleicher Telefonnummer übersprungen");

    const dauer = Math.round((Date.now() - start) / 100) / 10;
    const zusammenfassung = `${liste.length} erhalten → ${neu} neu, ${aktualisiert} aktualisiert, ` +
      `${unveraendert} unverändert, ${schon_zugang} mit Zugang, ${uebersprungen} übersprungen; ` +
      `Prüfungstermine: ${termine.gesetzt} gesetzt, ${termine.entfernt} entfernt (${dauer}s)`;

    if (neu || aktualisiert || uebersprungen || termine.gesetzt || termine.entfernt || termine.fehler) {
      await supa.from("academy_aenderungen").insert({
        akteur, aktion: "kandidaten_sync", objekt_typ: "kandidat", details: zusammenfassung,
      });
    }

    return json({
      ok: true, erhalten: liste.length, neu, aktualisiert, unveraendert,
      hat_schon_zugang: schon_zugang, uebersprungen, ohne_email, probleme,
      pruefungstermine: termine,
      dauer_sekunden: dauer, zusammenfassung,
    });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
