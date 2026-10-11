import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import md5 from "https://esm.sh/md5@2.3.0";

// academy-vorschau (26.09.2026, Stufe 4 / W9, Entscheidung E7 = a; 26.09.2026 Bunny-Token-Absicherung)
// Vorschau gesperrter Videos: Der Server gibt NUR die ersten Sekunden heraus.
//   POST {session_token, video_id}  -> { playlist: "<URL>", sekunden }   (Schueler-Session noetig)
//   GET  ?t=<Ticket>                -> gekuerzte HLS-Wiedergabeliste (nur die ersten Stuecke)
//   GET  ?t=<Ticket>&s=<Nr>         -> ein Videostueck, durchgereicht von Bunny
// Die Bunny-Video-ID erscheint nirgends im Browser: Liste und Stuecke laufen ueber diese
// Funktion. Ein Stueck jenseits der Vorschau-Grenze wird abgelehnt. Das Ticket ist
// 15 Minuten gueltig und mit einem Server-Schluessel signiert (HMAC).
//
// Seit der Bunny-Einstellung "CDN-Token-Authentifizierung" verlangt die Pull-Zone selbst
// zusaetzlich ein signiertes Token je Anfrage (nicht mehr nur den Referer-Header). Diese
// Funktion erzeugt das Token serverseitig -- der Schluessel dafuer bleibt in einer
// Umgebungsvariable und verlaesst den Server nie. Ohne BUNNY_TOKEN_AUTH_KEY (z.B. bevor
// die Bunny-Einstellung eingeschaltet ist) laeuft die Anfrage unsigniert wie bisher.
//
// 11.10.2026, LKW-BEREICH: Vorschau nur fuer Videos, deren Fahrzeug der Schueler sehen darf
// (gleiche Regel wie academy-video-token, Teil 1): Fahrzeuge = fahrzeug-Werte der nicht
// archivierten Themen (ohne Themen 'pkw', 'alle' passt immer). Sonst 403
// fahrzeug_nicht_freigegeben. Bei Datenbankfehler gesperrt (503 voruebergehend).

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PULL_ZONE = Deno.env.get("BUNNY_PULL_ZONE") || "vz-d3992a0e-19f.b-cdn.net";
const REFERER = Deno.env.get("AKADEMIE_URL") || "https://serband1995-hue.github.io/";
const TOKEN_KEY = Deno.env.get("BUNNY_TOKEN_AUTH_KEY") || "";
const SELBST = SUPABASE_URL + "/functions/v1/academy-vorschau";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
const enc = new TextEncoder();
function b64url(bytes: Uint8Array) {
  let s = ""; bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlText(t: string) { return b64url(enc.encode(t)); }
function textAusB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
let hmacKey: CryptoKey | null = null;
async function signieren(daten: string) {
  if (!hmacKey) hmacKey = await crypto.subtle.importKey("raw", enc.encode("vorschau:" + SERVICE_ROLE_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", hmacKey, enc.encode(daten))));
}
async function ticketPruefen(t: string) {
  const [daten, sig] = (t || "").split(".");
  if (!daten || !sig || (await signieren(daten)) !== sig) return null;
  const inhalt = JSON.parse(textAusB64url(daten));
  if (!inhalt || !inhalt.v || !inhalt.e || inhalt.e < Math.floor(Date.now() / 1000)) return null;
  return inhalt as { v: string; e: number; n: number };
}

function hexZuBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
// Bunny-Token-Auth ("Directory"-Variante): token = base64url(md5(schluessel + pfad + ablauf)).
// pfad ist NUR der URL-Pfad (ohne Domain, ohne Query). Ohne Schluessel unveraendert
// (Feature bei Bunny dann noch aus -- Referer allein reicht noch).
function signierteUrl(basis: string, pfad: string): string {
  if (!TOKEN_KEY) return basis;
  const ablauf = Math.floor(Date.now() / 1000) + 3600;
  const token = b64url(hexZuBytes(md5(TOKEN_KEY + pfad + ablauf)));
  const trenner = basis.includes("?") ? "&" : "?";
  return basis + trenner + "token=" + token + "&expires=" + ablauf;
}

// Kurzzeit-Speicher je Funktionsinstanz: welche Stuecke gehoeren zur Vorschau.
const listenCache = new Map<string, { basis: string; stuecke: { dauer: number; uri: string }[]; zeit: number }>();
async function vorschauStuecke(guid: string, sekunden: number) {
  const key = guid + "|" + sekunden;
  const c = listenCache.get(key);
  if (c && Date.now() - c.zeit < 10 * 60 * 1000) return c;
  const masterPfad = `/${guid}/playlist.m3u8`;
  const master = await fetch(signierteUrl(`https://${PULL_ZONE}${masterPfad}`, masterPfad), { headers: { Referer: REFERER } });
  if (!master.ok) throw new Error("master " + master.status);
  const mText = await master.text();
  const varianten = mText.split(/\r?\n/).map((z) => z.trim()).filter((z) => z && !z.startsWith("#"));
  const wahl = varianten.find((v) => v.startsWith("480p/")) || varianten.find((v) => v.startsWith("360p/")) || varianten[0];
  if (!wahl) throw new Error("keine Variante");
  const basis = `https://${PULL_ZONE}/${guid}/${wahl.replace(/[^/]+$/, "")}`;
  const mediaPfad = `/${guid}/${wahl}`;
  const media = await fetch(signierteUrl(`https://${PULL_ZONE}${mediaPfad}`, mediaPfad), { headers: { Referer: REFERER } });
  if (!media.ok) throw new Error("media " + media.status);
  const zeilen = (await media.text()).split(/\r?\n/);
  const stuecke: { dauer: number; uri: string }[] = [];
  let summe = 0, dauer = 0;
  for (const z of zeilen) {
    const t = z.trim();
    if (t.startsWith("#EXTINF:")) { dauer = parseFloat(t.slice(8)) || 0; continue; }
    if (!t || t.startsWith("#")) continue;
    if (summe >= sekunden) break;
    stuecke.push({ dauer, uri: t });
    summe += dauer;
  }
  const eintrag = { basis, stuecke, zeit: Date.now() };
  listenCache.set(key, eintrag);
  return eintrag;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    if (req.method === "POST") {
      const { session_token, video_id } = await req.json().catch(() => ({}));
      if (!session_token || !video_id) return json({ error: "Eingabe fehlt", code: "eingabe_fehlt" }, 400);
      const { data: session } = await supa.from("academy_sessions").select("schueler_id, expires_at").eq("session_token", session_token).maybeSingle();
      if (!session) return json({ error: "session_ungueltig", code: "session_ungueltig" }, 401);
      if (new Date(session.expires_at) < new Date()) return json({ error: "session_abgelaufen", code: "session_abgelaufen" }, 401);
      const { data: s, error: sErr } = await supa.from("academy_schueler").select("aktiv, ablauf_am, zugang_pkw, zugang_lkw").eq("id", session.schueler_id).maybeSingle();
      if (sErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if (!s || !s.aktiv) return json({ error: "zugang_gesperrt", code: "zugang_gesperrt" }, 403);
      if (new Date(s.ablauf_am) < new Date()) return json({ error: "zugang_abgelaufen", code: "zugang_abgelaufen" }, 403);
      const { data: v } = await supa.from("academy_videos").select("id, bunny_video_id, ausgeblendet, status").eq("id", video_id).maybeSingle();
      if (!v || !v.bunny_video_id || v.ausgeblendet || v.status !== "live") return json({ error: "Video nicht gefunden", code: "video_fehlt" }, 404);
      // --- Fahrzeug-Pruefung (11.10.2026). Alter Datensatz: zugang_pkw = true, zugang_lkw = false.
      const erlaubt: string[] = [];
      if (s.zugang_pkw !== false) erlaubt.push("pkw");
      if (s.zugang_lkw === true) erlaubt.push("lkw");
      const { data: vt, error: vtErr } = await supa.from("academy_video_tags").select("academy_tags(fahrzeug, archiviert)").eq("video_id", v.id);
      if (vtErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      const fzListe = (vt || []).map((x: any) => x.academy_tags).filter((t: any) => t && t.archiviert !== true).map((t: any) => t.fahrzeug || "pkw");
      const sichtbar = fzListe.length === 0 ? erlaubt.indexOf("pkw") !== -1 : fzListe.some((fz: string) => fz === "alle" || erlaubt.indexOf(fz) !== -1);
      if (!sichtbar) return json({ error: "Dieses Video gehört nicht zu deinem Bereich.", code: "fahrzeug_nicht_freigegeben" }, 403);
      const { data: einst } = await supa.from("academy_einstellungen").select("wert").eq("schluessel", "vorschau_sekunden").maybeSingle();
      const sekunden = Math.min(30, Math.max(5, parseInt(einst?.wert || "10", 10) || 10));
      const daten = b64urlText(JSON.stringify({ v: v.id, e: Math.floor(Date.now() / 1000) + 15 * 60, n: sekunden }));
      const ticket = daten + "." + (await signieren(daten));
      return json({ ok: true, playlist: SELBST + "?t=" + encodeURIComponent(ticket), sekunden });
    }

    // GET: Wiedergabeliste oder Stueck
    const url = new URL(req.url);
    const ticket = await ticketPruefen(url.searchParams.get("t") || "");
    if (!ticket) return new Response("Ticket ungueltig oder abgelaufen", { status: 403, headers: cors });
    const { data: v } = await supa.from("academy_videos").select("bunny_video_id, ausgeblendet, status").eq("id", ticket.v).maybeSingle();
    if (!v || !v.bunny_video_id || v.ausgeblendet || v.status !== "live") return new Response("nicht gefunden", { status: 404, headers: cors });
    const liste = await vorschauStuecke(v.bunny_video_id, ticket.n || 10);
    const t = encodeURIComponent(url.searchParams.get("t") || "");

    const sParam = url.searchParams.get("s");
    if (sParam === null) {
      const ziel = Math.ceil(Math.max(...liste.stuecke.map((x) => x.dauer), 1));
      const text = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-TARGETDURATION:" + ziel, "#EXT-X-MEDIA-SEQUENCE:0", "#EXT-X-PLAYLIST-TYPE:VOD"]
        .concat(liste.stuecke.flatMap((x, i) => ["#EXTINF:" + x.dauer.toFixed(6) + ",", SELBST + "?t=" + t + "&s=" + i]))
        .concat(["#EXT-X-ENDLIST", ""]).join("\n");
      return new Response(text, { status: 200, headers: { ...cors, "Content-Type": "application/vnd.apple.mpegurl", "Cache-Control": "no-store" } });
    }
    const nr = parseInt(sParam, 10);
    if (!(nr >= 0 && nr < liste.stuecke.length)) return new Response("ausserhalb der Vorschau", { status: 403, headers: cors });
    const stueckPfad = liste.basis.replace(`https://${PULL_ZONE}`, "") + liste.stuecke[nr].uri;
    const stueck = await fetch(signierteUrl(liste.basis + liste.stuecke[nr].uri, stueckPfad), { headers: { Referer: REFERER } });
    if (!stueck.ok) return new Response("upstream " + stueck.status, { status: 502, headers: cors });
    return new Response(stueck.body, { status: 200, headers: { ...cors, "Content-Type": stueck.headers.get("Content-Type") || "video/mp2t", "Cache-Control": "private, max-age=900" } });
  } catch (e) {
    return json({ error: String(e), code: "voruebergehend" }, 500);
  }
});
