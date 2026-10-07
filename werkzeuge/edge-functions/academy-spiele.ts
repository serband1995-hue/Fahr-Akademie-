import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// academy-spiele (06.10.2026): Rahmen für die Mini-Spiele ("Spiele" im Menü).
// Quelle liegt hier im Repo, ausgespielt wird sie als Edge Function (verify_jwt: false -- die
// Function prüft die Schüler-Session selbst, wie academy-szene).
//
//   { aktion: "uebersicht" }                    -> Anzeigename, Sichtbarkeit, eigene Bestwerte
//   { aktion: "profil", sichtbar: true|false }  -> im Ranking sichtbar / ausgeblendet
//   { aktion: "start", spiel }                  -> neue Runde; liefert eine einmalige Runden-ID
//   { aktion: "ergebnis", runde, wert, … }    -> Ergebnis einer Runde, prüft Plausibilität, speichert Bestwert
//                                                  (zusätzlich je Spiel: tipps/tippsAuf/vmax = Tempo-Sprint, zuege + fehler = Memory, richtig = Rechts vor Links)
//   { aktion: "rangliste", spiel, limit }       -> beste Spieler (nur sichtbare), eigene Platzierung
//
// Der Name im Ranking kommt NIE vom Gerät, sondern aus dem Schülerkonto: Vorname + erster
// Buchstabe des Nachnamens (SQL academy_spiele_anzeigename). Dadurch gibt es keine frei
// gewählten Namen und keinen Schimpfwort-Filter.
// Schutz vor erfundenen Ergebnissen: jede Runde startet auf dem Server, ein Ergebnis zählt
// einmal, nur wenn genug Zeit vergangen ist und der Wert im menschlich möglichen Bereich liegt.
// Ein manipuliertes Gerät kann trotzdem einen Wert im erlaubten Bereich melden -- das lässt sich
// bei Reaktionsspielen nicht ganz verhindern; die Grenzen halten es unauffällig.
// Ablehnungen tragen einen "code"; die App meldet nur bei session_ungueltig / session_abgelaufen /
// zugang_gesperrt / zugang_abgelaufen / schule_pausiert ab.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// Tempo-Sprint (umgebaut 08.10.2026, Spiel-Id "sprint"): dieselben Zahlen wie REGELN in spiele/tempo.js (die Prüfung pruefe-academy-spiele.mjs vergleicht beides).
const SPRINT = { GAIN: 9, VTOP: 1400, DECAY: 40, V0_MAX: 70, V_AUF: 60, TAPS_MAX: 160, TIPPS_AUF_MIN: 7, TIPPS_AUF_MAX: 100, ABSTAND_MS: 60, STRECKE_MS: 10_000, MARGE: 1.03, MARGE_M: 5 };
// Höchste Strecke (m) und höchstes Tempo (km/h), die mit n Tipps auf der Autobahn überhaupt möglich sind: Start bei V0_MAX, alle Tipps gleich am
// Anfang im dichtesten Abstand, dazwischen der Rollverlust; 5-ms-Schritte, dazu 3 % und 5 m Spielraum (gleiche Rechnung wie obergrenze() in tempo.js).
function sprintObergrenze(n: number): { v: number; m: number } {
  const DT = 5;
  let v = SPRINT.V0_MAX, m = 0, vmax = v, taps = 0, naechster = 0;
  for (let t = 0; t < SPRINT.STRECKE_MS; t += DT) {
    if (taps < n && t >= naechster) { v = Math.min(SPRINT.VTOP, v + SPRINT.GAIN * (1 - v / SPRINT.VTOP)); taps++; naechster += SPRINT.ABSTAND_MS; if (v > vmax) vmax = v; }
    const vAlt = v;
    v = Math.max(0, v - SPRINT.DECAY * DT / 1000);
    m += (vAlt + v) / 2 / 3.6 * DT / 1000;
  }
  return { v: vmax * SPRINT.MARGE, m: m * SPRINT.MARGE + SPRINT.MARGE_M };
}

// Schilder-Memory (07.10.2026): dieselben Zahlen wie PAARE / ZUG_MIN_MS / ZURUECK_MS in spiele/memory.js (die Prüfung vergleicht sie).
const MEMORY = { PAARE: 6, ZUG_MIN_MS: 100, ZURUECK_MS: 900 };
// Rechts vor Links (07.10.2026): 10 Aufgaben, je richtig 100 bis 150 Punkte (siehe punkteFuer in spiele/vorfahrt.js).
const VORFAHRT = { AUFGABEN: 10, MIN_PUNKTE: 100, MAX_PUNKTE: 150 };
const istGanz = (x: unknown): x is number => typeof x === "number" && Number.isInteger(x);
// Fahrlehrer-Simulator (07.10.2026): 8 Runden mit je 2 Fragen = 16 Teilantworten, je richtige 50 bis 75 Punkte (siehe punkteFuer in spiele/fahrlehrer.js).
const FAHRLEHRER = { TEILE: 16, MIN_PUNKTE: 50, MAX_PUNKTE: 75 };
// Verkehrskontrolle (07.10.2026): 8 Fahrzeuge, je 5 Entscheidungen (4 Stationen + Gesamtentscheidung), je richtige Entscheidung 20 bis 30 Punkte
// (siehe punkteFuer in spiele/kontrolle.js); falscher Alarm zieht ab, je Fahrzeug nie unter 0.
const KONTROLLE = { ENTSCHEIDUNGEN: 40, MAX_JE_ENTSCHEIDUNG: 30 };
// Gefahren finden (07.10.2026): 4 Bilder je 4–6 Gefahren, je Bild 30 s. Je gefundener Gefahr 100 Punkte, je Tipp ohne Gefahr −30 (ein Bild nie unter 0),
// alle Gefahren eines Bildes gefunden: bis +60 Zeitbonus (2 je übrige Sekunde). Ein Tipp ohne Gefahr kostet 2 s Zeit, also höchstens 15 je Bild.
// Dieselben Zahlen wie in spiele/gefahren.js (BILDER_JE_RUNDE, MIN_JE_BILD, MAX_JE_BILD, PKT_GEFAHR, ABZUG_TIPP, BONUS_MAX); pruefe-gefahren.mjs vergleicht sie.
const GEFAHREN = { BILDER: 4, MIN_JE_BILD: 4, MAX_JE_BILD: 6, PKT: 100, ABZUG: 30, BONUS_MAX: 60, FEHL_JE_BILD: 15 };
// Fahrzeug-Check (08.10.2026): 4 Bilder je 4–6 Mängel, je Bild 40 s. Je gefundenem Mangel 100 Punkte, je Tipp ohne Mangel −30 (ein Bild nie unter 0),
// alle Mängel eines Bildes gefunden: bis +80 Zeitbonus (2 je übrige Sekunde). Ein Tipp ohne Mangel kostet 2 s Zeit, also höchstens 20 je Bild.
// Dieselben Zahlen wie in spiele/fahrzeug.js (BILDER_JE_RUNDE, MIN_JE_BILD, MAX_JE_BILD, PKT_MANGEL, ABZUG_TIPP, BONUS_MAX); pruefe-fahrzeug.mjs vergleicht sie.
const FAHRZEUG = { BILDER: 4, MIN_JE_BILD: 4, MAX_JE_BILD: 6, PKT: 100, ABZUG: 30, BONUS_MAX: 80, FEHL_JE_BILD: 20 };
// Schilder-Wisch (08.10.2026, Id "ninja"): 3 Runden mit je 9 richtigen und 8 falschen Schildern, je Runde höchstens 25 s. Je richtig gewischtem Schild +10,
// je falsch gewischtem −15 (eine Runde nie unter 0), alle 9 richtigen und kein falsches: +20 Bonus. Höchstens 3 x 110 = 330 Punkte.
// Dieselben Zahlen wie in spiele/ninja.js (RUNDEN, N_RICHTIG, N_FALSCH, PKT_RICHTIG, ABZUG_FALSCH, BONUS_VOLL, MIN_RUNDE_MS); pruefe-ninja.mjs vergleicht sie.
const NINJA = { RUNDEN: 3, N_RICHTIG: 9, N_FALSCH: 8, PKT: 10, ABZUG: 15, BONUS: 20, MIN_RUNDE_MS: 12_000 };

// Je Spiel: Richtung des Rankings und menschlich mögliche Grenzen.
//  aufsteigend true  = kleiner ist besser (Reaktionszeit in ms); false = größer ist besser (Strecke in m, Punkte)
//  vorlauf_ms        = so lange dauert die Runde MINDESTENS, bevor der Wert entsteht
//                      Ampel: Lichter + kürzeste Wartezeit; Tempo-Sprint: Countdown 3 s + Auffahrt (mindestens 0,4 s) + Autobahn 10 s
//  wert_ist_zeit     = true: der Wert (ms) kommt NACH dem Vorlauf dazu (Ampel); false: der Wert ist keine Zeit (Tempo-Sprint)
//  runde_max_ms      = so lange darf eine Runde offen sein (Standard RUNDE_MAX_MS); Memory und Rechts vor Links dauern länger
//  pruefe            = zusätzliche Plausibilität; gibt einen Fehlernamen zurück oder null
const SPIELE: Record<string, {
  aufsteigend: boolean; min: number; max: number; vorlauf_ms: number; wert_ist_zeit: boolean; runde_max_ms?: number;
  pruefe?: (wert: number, body: Record<string, unknown>) => string | null;
}> = {
  ampel: { aufsteigend: true, min: 120, max: 1500, vorlauf_ms: 4600, wert_ist_zeit: true },
  // Tempo-Sprint: Wert = Strecke in Metern auf der Autobahn (10 s), größer ist besser. Zusätzlich: tipps (Autobahn), tippsAuf (Auffahrt), vmax (km/h).
  // Mehr als 16 Tipps pro Sekunde (160 in 10 s) schafft kein Mensch; ohne Höchsttempo, aber Strecke und Tempo müssen zur Spielregel passen.
  sprint: {
    aufsteigend: false, min: 5, max: Math.ceil(sprintObergrenze(SPRINT.TAPS_MAX).m), vorlauf_ms: 13_000, wert_ist_zeit: false,
    pruefe: (wert, body) => {
      const { tipps, tippsAuf, vmax } = body;
      if (!istGanz(tipps) || tipps < 0) return "tipps_ungueltig";
      if (tipps > SPRINT.TAPS_MAX) return "zu_viele_tipps";
      if (!istGanz(tippsAuf) || tippsAuf < SPRINT.TIPPS_AUF_MIN || tippsAuf > SPRINT.TIPPS_AUF_MAX) return "tipps_auffahrt_ungueltig";   // ohne 60 km/h kommt niemand auf die Autobahn
      if (!istGanz(vmax) || vmax < SPRINT.V_AUF) return "tempo_ungueltig";
      const grenze = sprintObergrenze(tipps);
      if (vmax > Math.ceil(grenze.v)) return "tempo_unmoeglich";
      if (wert > Math.ceil(grenze.m)) return "strecke_unmoeglich";
      if (wert > Math.floor(vmax / 3.6 * 10) + 1) return "strecke_passt_nicht_zum_tempo";    // 10 s mit höchstens vmax
      return null;
    },
  },
  // Schilder-Memory: Wert = Zeit in ms mit laufender Uhr (ohne Lesen der Erklärungen), kleiner ist besser.
  // Jeder Zug (zwei aufgedeckte Karten) ist ein Treffer oder ein Fehlversuch: zuege = PAARE + fehler. Nach jedem Fehlversuch bleibt die
  // Uhr mindestens ZURUECK_MS an, bevor wieder aufgedeckt werden darf.
  memory: {
    aufsteigend: true, min: 1500, max: 1_800_000, vorlauf_ms: 0, wert_ist_zeit: true, runde_max_ms: 2_400_000,
    pruefe: (wert, body) => {
      const { zuege, fehler } = body;
      if (!istGanz(zuege) || !istGanz(fehler) || fehler < 0 || fehler > 500) return "zuege_ungueltig";
      if (zuege !== MEMORY.PAARE + fehler) return "zuege_passen_nicht";
      if (wert < zuege * MEMORY.ZUG_MIN_MS + fehler * MEMORY.ZURUECK_MS) return "zu_schnell_fuer_zuege";
      return null;
    },
  },
  // Rechts vor Links: Wert = Punkte 0–1500; richtig = Anzahl richtiger Aufgaben (0–10), je richtig 100–150 Punkte.
  vorfahrt: {
    aufsteigend: false, min: 0, max: VORFAHRT.AUFGABEN * VORFAHRT.MAX_PUNKTE, vorlauf_ms: 5000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const r = body.richtig;
      if (!istGanz(r) || r < 0 || r > VORFAHRT.AUFGABEN) return "richtig_ungueltig";
      if (wert < r * VORFAHRT.MIN_PUNKTE || wert > r * VORFAHRT.MAX_PUNKTE) return "punkte_passen_nicht";
      return null;
    },
  },
  // Fahrlehrer-Simulator: Wert = Punkte 0–1200; richtig = Anzahl richtiger Teilantworten (0–16), je richtige 50–75 Punkte.
  fahrlehrer: {
    aufsteigend: false, min: 0, max: FAHRLEHRER.TEILE * FAHRLEHRER.MAX_PUNKTE, vorlauf_ms: 12_000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const r = body.richtig;
      if (!istGanz(r) || r < 0 || r > FAHRLEHRER.TEILE) return "richtig_ungueltig";
      if (wert < r * FAHRLEHRER.MIN_PUNKTE || wert > r * FAHRLEHRER.MAX_PUNKTE) return "punkte_passen_nicht";
      return null;
    },
  },
  // Verkehrskontrolle: Wert = Punkte 0–1200; richtig = Anzahl richtiger Entscheidungen (0–40), höchstens 30 Punkte je richtiger Entscheidung.
  // Vorlauf 30 s: 8 Fahrzeuge brauchen mindestens 72 Fingertipps (je Fahrzeug 4 Stationen antippen + 4 Urteile + 1 Gesamturteil).
  kontrolle: {
    aufsteigend: false, min: 0, max: KONTROLLE.ENTSCHEIDUNGEN * KONTROLLE.MAX_JE_ENTSCHEIDUNG, vorlauf_ms: 30_000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const r = body.richtig;
      if (!istGanz(r) || r < 0 || r > KONTROLLE.ENTSCHEIDUNGEN) return "richtig_ungueltig";
      if (wert > r * KONTROLLE.MAX_JE_ENTSCHEIDUNG) return "punkte_passen_nicht";
      return null;
    },
  },
  // Gefahren finden: Wert = Punkte 0–2640; gefunden = Gefahren insgesamt (0–24), fehltipps = Tipps ohne Gefahr (0–60), vollstaendig = Bilder mit allen Gefahren (0–4).
  gefahren: {
    aufsteigend: false, min: 0, max: GEFAHREN.BILDER * (GEFAHREN.MAX_JE_BILD * GEFAHREN.PKT + GEFAHREN.BONUS_MAX), vorlauf_ms: 8000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const g = body.gefunden, f = body.fehltipps, v = body.vollstaendig;
      if (!istGanz(g) || g < 0 || g > GEFAHREN.BILDER * GEFAHREN.MAX_JE_BILD) return "gefunden_ungueltig";
      if (!istGanz(v) || v < 0 || v > GEFAHREN.BILDER || v * GEFAHREN.MIN_JE_BILD > g) return "vollstaendig_ungueltig";
      if (!istGanz(f) || f < 0 || f > GEFAHREN.BILDER * GEFAHREN.FEHL_JE_BILD) return "fehltipps_ungueltig";
      if (wert > g * GEFAHREN.PKT + v * GEFAHREN.BONUS_MAX) return "punkte_zu_hoch";
      if (wert < g * GEFAHREN.PKT - f * GEFAHREN.ABZUG) return "punkte_zu_niedrig";
      return null;
    },
  },
  // Schilder-Wisch: Wert = Punkte 0–330; richtig = richtig gewischte Schilder (0–27), falsch = falsch gewischte (0–24), voll = fehlerfreie Runden (0–3).
  // Vorlauf: 3 Runden dauern mindestens je MIN_RUNDE_MS (das letzte Schild erscheint frühestens nach 12 s); das Lesen der Erklärungen kommt dazu.
  ninja: {
    aufsteigend: false, min: 0, max: NINJA.RUNDEN * (NINJA.N_RICHTIG * NINJA.PKT + NINJA.BONUS), vorlauf_ms: NINJA.RUNDEN * NINJA.MIN_RUNDE_MS, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const r = body.richtig, f = body.falsch, v = body.voll;
      if (!istGanz(r) || r < 0 || r > NINJA.RUNDEN * NINJA.N_RICHTIG) return "richtig_ungueltig";
      if (!istGanz(f) || f < 0 || f > NINJA.RUNDEN * NINJA.N_FALSCH) return "falsch_ungueltig";
      if (!istGanz(v) || v < 0 || v > NINJA.RUNDEN || v * NINJA.N_RICHTIG > r) return "voll_ungueltig";
      if (v > NINJA.RUNDEN - Math.ceil(f / NINJA.N_FALSCH)) return "voll_passt_nicht";
      if (wert > r * NINJA.PKT + v * NINJA.BONUS) return "punkte_zu_hoch";
      if (wert < r * NINJA.PKT - f * NINJA.ABZUG + v * NINJA.BONUS) return "punkte_zu_niedrig";
      return null;
    },
  },
  // Fahrzeug-Check: Wert = Punkte 0–2720; gefunden = Mängel insgesamt (0–24), fehltipps = Tipps ohne Mangel (0–80), vollstaendig = Bilder mit allen Mängeln (0–4).
  fahrzeug: {
    aufsteigend: false, min: 0, max: FAHRZEUG.BILDER * (FAHRZEUG.MAX_JE_BILD * FAHRZEUG.PKT + FAHRZEUG.BONUS_MAX), vorlauf_ms: 8000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const g = body.gefunden, f = body.fehltipps, v = body.vollstaendig;
      if (!istGanz(g) || g < 0 || g > FAHRZEUG.BILDER * FAHRZEUG.MAX_JE_BILD) return "gefunden_ungueltig";
      if (!istGanz(v) || v < 0 || v > FAHRZEUG.BILDER || v * FAHRZEUG.MIN_JE_BILD > g) return "vollstaendig_ungueltig";
      if (!istGanz(f) || f < 0 || f > FAHRZEUG.BILDER * FAHRZEUG.FEHL_JE_BILD) return "fehltipps_ungueltig";
      if (wert > g * FAHRZEUG.PKT + v * FAHRZEUG.BONUS_MAX) return "punkte_zu_hoch";
      if (wert < g * FAHRZEUG.PKT - f * FAHRZEUG.ABZUG) return "punkte_zu_niedrig";
      return null;
    },
  },
};
const RUNDE_MAX_MS = 120_000;          // länger offen gelassene Runde zählt nicht mehr
const RUNDEN_PRO_10_MIN = 30;          // Bremse gegen Dauerfeuer

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const supa = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

    // --- Wer fragt? (Schüler-Session, gleiche Prüfung wie academy-szene) ---
    if (typeof body.session_token !== "string" || !body.session_token) return json({ error: "nicht_angemeldet", code: "nicht_angemeldet" }, 401);
    const { data: session, error: sErr } = await supa.from("academy_sessions").select("schueler_id, expires_at").eq("session_token", body.session_token).maybeSingle();
    if (sErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
    if (!session) return json({ error: "session_ungueltig", code: "session_ungueltig" }, 401);
    if (new Date(session.expires_at) < new Date()) return json({ error: "session_abgelaufen", code: "session_abgelaufen" }, 401);
    const { data: s, error: e2 } = await supa.from("academy_schueler").select("id, name, aktiv, ablauf_am, schule_id, archiviert_am").eq("id", session.schueler_id).maybeSingle();
    if (e2) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
    if (!s) return json({ error: "schueler_nicht_gefunden", code: "schueler_nicht_gefunden" }, 403);
    if (!s.aktiv) return json({ error: "zugang_gesperrt", code: "zugang_gesperrt" }, 403);
    if (new Date(s.ablauf_am) < new Date()) return json({ error: "zugang_abgelaufen", code: "zugang_abgelaufen" }, 403);
    if (s.schule_id) {
      const { data: schule } = await supa.from("academy_schulen").select("aktiv").eq("id", s.schule_id).maybeSingle();
      if (schule && !schule.aktiv) return json({ error: "schule_pausiert", code: "schule_pausiert" }, 403);
    }
    const ich: string = s.id;

    const spielOk = (v: unknown): v is string => typeof v === "string" && Object.prototype.hasOwnProperty.call(SPIELE, v);
    const anzeigename = async () => {
      const { data } = await supa.rpc("academy_spiele_anzeigename", { p_name: s.name });
      return typeof data === "string" ? data : "Spieler";
    };
    const sichtbarLesen = async () => {
      const { data } = await supa.from("academy_spiele_profil").select("sichtbar").eq("schueler_id", ich).maybeSingle();
      return data ? data.sichtbar !== false : true;
    };

    if (body.aktion === "uebersicht") {
      const { data: best, error } = await supa.from("academy_spiele_bestwerte").select("spiel, wert").eq("schueler_id", ich);
      if (error) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      const bestwerte: Record<string, number> = {};
      (best || []).forEach((b: { spiel: string; wert: number }) => { bestwerte[b.spiel] = b.wert; });
      return json({ ok: true, anzeigename: await anzeigename(), sichtbar: await sichtbarLesen(), bestwerte });
    }

    if (body.aktion === "profil") {
      if (typeof body.sichtbar !== "boolean") return json({ error: "eingabe_fehlt", code: "eingabe_fehlt" }, 400);
      const { error } = await supa.from("academy_spiele_profil").upsert({ schueler_id: ich, sichtbar: body.sichtbar, geaendert_am: new Date().toISOString() });
      if (error) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      return json({ ok: true, sichtbar: body.sichtbar });
    }

    if (body.aktion === "start") {
      if (!spielOk(body.spiel)) return json({ error: "spiel_unbekannt", code: "eingabe_fehlt" }, 400);
      // alte Runden aufräumen (nach einem Tag wertlos), dann Bremse prüfen
      await supa.from("academy_spiele_runden").delete().eq("schueler_id", ich).lt("gestartet_am", new Date(Date.now() - 86_400_000).toISOString());
      const { count, error: cErr } = await supa.from("academy_spiele_runden").select("id", { count: "exact", head: true })
        .eq("schueler_id", ich).gt("gestartet_am", new Date(Date.now() - 600_000).toISOString());
      if (cErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if ((count || 0) >= RUNDEN_PRO_10_MIN) return json({ error: "zu_viele_runden", code: "zu_viele_runden" }, 429);
      const { data, error } = await supa.from("academy_spiele_runden").insert({ schueler_id: ich, spiel: body.spiel }).select("id").single();
      if (error || !data) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      return json({ ok: true, runde: data.id });
    }

    if (body.aktion === "ergebnis") {
      const wert = body.wert;
      if (typeof body.runde !== "string" || !/^[0-9a-f-]{36}$/.test(body.runde)) return json({ error: "runde_fehlt", code: "eingabe_fehlt" }, 400);
      if (typeof wert !== "number" || !Number.isInteger(wert)) return json({ error: "wert_ungueltig", code: "ergebnis_ungueltig" }, 400);
      const { data: r, error: rErr } = await supa.from("academy_spiele_runden").select("id, spiel, gestartet_am, benutzt").eq("id", body.runde).eq("schueler_id", ich).maybeSingle();
      if (rErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if (!r) return json({ error: "runde_unbekannt", code: "ergebnis_ungueltig" }, 400);
      const regel = SPIELE[r.spiel];
      if (!regel) return json({ error: "spiel_unbekannt", code: "eingabe_fehlt" }, 400);
      if (wert < regel.min || wert > regel.max) return json({ error: "wert_ausserhalb", code: "ergebnis_ungueltig" }, 400);
      if (regel.pruefe) {
        const fehler = regel.pruefe(wert, body);
        if (fehler) return json({ error: fehler, code: "ergebnis_ungueltig" }, 400);
      }
      const vergangen = Date.now() - new Date(r.gestartet_am).getTime();
      // Der Wert kann erst NACH dem Vorlauf entstehen (Ampel: Lichter + Wartezeit + Reaktion). 250 ms Luft für Uhren und Netz.
      if (vergangen < regel.vorlauf_ms + (regel.wert_ist_zeit ? wert : 0) - 250) return json({ error: "zu_schnell", code: "ergebnis_ungueltig" }, 400);
      if (vergangen > (regel.runde_max_ms ?? RUNDE_MAX_MS)) return json({ error: "runde_abgelaufen", code: "ergebnis_ungueltig" }, 400);
      // Runde genau einmal einlösen (atomar: nur der erste Aufruf bekommt die Zeile zurück)
      const { data: eingeloest, error: uErr } = await supa.from("academy_spiele_runden").update({ benutzt: true }).eq("id", r.id).eq("benutzt", false).select("id");
      if (uErr) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      if (!eingeloest || !eingeloest.length) return json({ error: "runde_schon_benutzt", code: "ergebnis_ungueltig" }, 400);

      const { data: alt } = await supa.from("academy_spiele_bestwerte").select("wert, versuche").eq("schueler_id", ich).eq("spiel", r.spiel).maybeSingle();
      const besser = !alt || (regel.aufsteigend ? wert < alt.wert : wert > alt.wert);
      if (besser) {
        const { error } = await supa.from("academy_spiele_bestwerte").upsert({ schueler_id: ich, spiel: r.spiel, wert, erreicht_am: new Date().toISOString(), versuche: (alt ? alt.versuche : 0) + 1 });
        if (error) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      } else {
        await supa.from("academy_spiele_bestwerte").update({ versuche: alt.versuche + 1 }).eq("schueler_id", ich).eq("spiel", r.spiel);
      }
      const bestwert = besser ? wert : alt!.wert;
      const { data: rang } = await supa.rpc("academy_spiele_rangliste", { p_spiel: r.spiel, p_aufsteigend: regel.aufsteigend, p_limit: 1, p_ich: ich });
      return json({ ok: true, wert, bestwert, rekord: besser, platz: rang && rang.ich ? rang.ich.platz : null, gesamt: rang ? rang.gesamt : null });
    }

    if (body.aktion === "rangliste") {
      if (!spielOk(body.spiel)) return json({ error: "spiel_unbekannt", code: "eingabe_fehlt" }, 400);
      const limit = Number.isInteger(body.limit) ? Math.min(Math.max(body.limit, 1), 50) : 10;
      const { data, error } = await supa.rpc("academy_spiele_rangliste", { p_spiel: body.spiel, p_aufsteigend: SPIELE[body.spiel].aufsteigend, p_limit: limit, p_ich: ich });
      if (error) return json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
      return json({ ok: true, top: data.top, ich: data.ich, gesamt: data.gesamt });
    }

    return json({ error: "aktion unbekannt", code: "eingabe_fehlt" }, 400);
  } catch (e) {
    return json({ error: String(e), code: "voruebergehend" }, 500);
  }
});
