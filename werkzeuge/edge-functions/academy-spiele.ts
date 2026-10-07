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
//   Duell gegen Mitschüler (Spiel 10, asynchron; Tabelle academy_spiele_duelle, db/duell.sql):
//   { aktion: "duell_uebersicht" }              -> Bilanz, eigene Duelle (letzte 20), offene Herausforderungen anderer (nur Anzeigename)
//   { aktion: "duell_neu" }                     -> neues Duell anlegen (Server zieht 8 feste Fragen-IDs); liefert die Duell-ID
//   { aktion: "duell_annehmen", duell }         -> offene Herausforderung annehmen (atomar, nur einer bekommt sie)
//   { aktion: "duell_start", duell }            -> eigene Runde starten (Uhr läuft ab dem ersten Aufruf); liefert die 8 Fragen-IDs OHNE Lösung.
//                                                  Erneut aufrufbar, solange die Runde offen und nicht abgelaufen ist (Netzfehler): dieselben Fragen, dieselbe Uhr.
//   { aktion: "duell_ende", duell, antworten }  -> 8 × { a: 0|1|2|null, ms } auswerten; Punkte rechnet der Server; liefert die Lösungen
// Die richtigen Antworten liegen NICHT im Quelltext (das Repo ist öffentlich), sondern in der Tabelle academy_duell_loesungen (db/duell-2.sql, nur service_role).
// Die Function liest sie bei Bedarf und behält sie 5 Minuten im Speicher; zum Client gehen sie erst nach der Auswertung (Feld loesung).
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
// Gefahren finden (07.10.2026): 4 Bilder je 4–5 Gefahren, je Bild 30 s. Je gefundener Gefahr 100 Punkte, je Tipp ohne Gefahr −30 (ein Bild nie unter 0),
// alle Gefahren eines Bildes gefunden: bis +60 Zeitbonus (2 je übrige Sekunde). Ein Tipp ohne Gefahr kostet 2 s Zeit, also höchstens 15 je Bild.
// Dieselben Zahlen wie in spiele/gefahren.js (BILDER_JE_RUNDE, MIN_JE_BILD, MAX_JE_BILD, PKT_GEFAHR, ABZUG_TIPP, BONUS_MAX, MAX_GEFUNDEN = Summe der 4 größten Bilder = MAX_GESAMT); pruefe-gefahren.mjs vergleicht sie.
// BONUS_JE_BILD = BONUS_MAX − 2: der Zeitbonus entsteht erst nach der ersten Sekunde.
const GEFAHREN = { BILDER: 4, MIN_JE_BILD: 4, MAX_JE_BILD: 5, MAX_GESAMT: 17, PKT: 100, ABZUG: 30, BONUS_MAX: 60, BONUS_JE_BILD: 58, FEHL_JE_BILD: 15 };
// Fahrzeug-Check (07.10.2026): 4 Bilder je 4–5 Mängel, je Bild 40 s. Je gefundenem Mangel 100 Punkte, je Tipp ohne Mangel −30 (ein Bild nie unter 0),
// alle Mängel eines Bildes gefunden: bis +80 Zeitbonus (2 je übrige Sekunde). Ein Tipp ohne Mangel kostet 2 s Zeit, also höchstens 20 je Bild.
// Dieselben Zahlen wie in spiele/fahrzeug.js (BILDER_JE_RUNDE, MIN_JE_BILD, MAX_JE_BILD, PKT_MANGEL, ABZUG_TIPP, BONUS_MAX, MAX_GEFUNDEN = Summe der 4 größten Bilder = MAX_GESAMT); pruefe-fahrzeug.mjs vergleicht sie.
// BONUS_JE_BILD = BONUS_MAX − 2: der Zeitbonus entsteht erst nach der ersten Sekunde.
const FAHRZEUG = { BILDER: 4, MIN_JE_BILD: 4, MAX_JE_BILD: 5, MAX_GESAMT: 20, PKT: 100, ABZUG: 30, BONUS_MAX: 80, BONUS_JE_BILD: 78, FEHL_JE_BILD: 20 };
// Schilder-Wisch (07.10.2026, Id "ninja"): 3 Runden mit je 9 richtigen und 8 falschen Schildern, je Runde höchstens 25 s. Je richtig gewischtem Schild +10,
// je falsch gewischtem −15 (eine Runde nie unter 0), alle 9 richtigen und kein falsches: +20 Bonus. Höchstens 3 x 110 = 330 Punkte.
// Dieselben Zahlen wie in spiele/ninja.js (RUNDEN, N_RICHTIG, N_FALSCH, PKT_RICHTIG, ABZUG_FALSCH, BONUS_VOLL, MIN_RUNDE_MS); pruefe-ninja.mjs vergleicht sie. VORLAUF_MS (45 s) steht nur hier, pruefe-ninja.mjs prüft ihn gegen den echten Fahrplan.
const NINJA = { RUNDEN: 3, N_RICHTIG: 9, N_FALSCH: 8, PKT: 10, ABZUG: 15, BONUS: 20, MIN_RUNDE_MS: 12_000, VORLAUF_MS: 45_000 };

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
    aufsteigend: false, min: 0, max: FAHRLEHRER.TEILE * FAHRLEHRER.MAX_PUNKTE, vorlauf_ms: 15_000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const r = body.richtig;
      if (!istGanz(r) || r < 0 || r > FAHRLEHRER.TEILE) return "richtig_ungueltig";
      if (wert < r * FAHRLEHRER.MIN_PUNKTE || wert > r * FAHRLEHRER.MAX_PUNKTE) return "punkte_passen_nicht";
      return null;
    },
  },
  // Verkehrskontrolle: Wert = Punkte 0–1200; richtig = Anzahl richtiger Entscheidungen (0–40), höchstens 30 Punkte je richtiger Entscheidung.
  // Vorlauf 20 s: 8 Fahrzeuge brauchen mindestens 80 Fingertipps (je Fahrzeug 4 Stationen antippen + 4 Urteile + 1 Gesamturteil + „Weiter“).
  kontrolle: {
    aufsteigend: false, min: 0, max: KONTROLLE.ENTSCHEIDUNGEN * KONTROLLE.MAX_JE_ENTSCHEIDUNG, vorlauf_ms: 20_000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const r = body.richtig;
      if (!istGanz(r) || r < 0 || r > KONTROLLE.ENTSCHEIDUNGEN) return "richtig_ungueltig";
      if (wert > r * KONTROLLE.MAX_JE_ENTSCHEIDUNG) return "punkte_passen_nicht";
      return null;
    },
  },
  // Gefahren finden: Wert = Punkte 0–1932; gefunden = Gefahren insgesamt (0–17, ehrliches Maximum des Bilderpools), fehltipps = Tipps ohne Gefahr (0–60), vollstaendig = Bilder mit allen Gefahren (0–4).
  gefahren: {
    aufsteigend: false, min: 0, max: GEFAHREN.MAX_GESAMT * GEFAHREN.PKT + GEFAHREN.BILDER * GEFAHREN.BONUS_JE_BILD, vorlauf_ms: 5000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const g = body.gefunden, f = body.fehltipps, v = body.vollstaendig;
      if (!istGanz(g) || g < 0 || g > GEFAHREN.MAX_GESAMT) return "gefunden_ungueltig";
      if (!istGanz(v) || v < 0 || v > GEFAHREN.BILDER || v * GEFAHREN.MIN_JE_BILD > g) return "vollstaendig_ungueltig";
      if (!istGanz(f) || f < 0 || f > GEFAHREN.BILDER * GEFAHREN.FEHL_JE_BILD) return "fehltipps_ungueltig";
      if (wert > g * GEFAHREN.PKT + v * GEFAHREN.BONUS_JE_BILD) return "punkte_zu_hoch";
      if (wert < g * GEFAHREN.PKT - f * GEFAHREN.ABZUG) return "punkte_zu_niedrig";
      return null;
    },
  },
  // Schilder-Wisch: Wert = Punkte 0–330; richtig = richtig gewischte Schilder (0–27), falsch = falsch gewischte (0–24), voll = fehlerfreie Runden (0–3).
  // Vorlauf: das letzte Schild einer Runde erscheint erst bei 25 s − Dauer − 0,5 s (frühestens 14,75 / 16,7 / 18,2 s mit reduzierter Bewegung, sonst später); 3 Runden dauern also mindestens
  // ca. 49,6 s, dazu kommt das Lesen der Erklärungen. VORLAUF_MS = 45 s lässt Abstand (Uhr der Rechner, Rundung). MIN_RUNDE_MS ist nur eine grobe Untergrenze.
  ninja: {
    aufsteigend: false, min: 0, max: NINJA.RUNDEN * (NINJA.N_RICHTIG * NINJA.PKT + NINJA.BONUS), vorlauf_ms: NINJA.VORLAUF_MS, wert_ist_zeit: false, runde_max_ms: 1_800_000,
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
  // Fahrzeug-Check: Wert = Punkte 0–2312; gefunden = Mängel insgesamt (0–20, ehrliches Maximum des Bilderpools), fehltipps = Tipps ohne Mangel (0–80), vollstaendig = Bilder mit allen Mängeln (0–4).
  fahrzeug: {
    aufsteigend: false, min: 0, max: FAHRZEUG.MAX_GESAMT * FAHRZEUG.PKT + FAHRZEUG.BILDER * FAHRZEUG.BONUS_JE_BILD, vorlauf_ms: 5000, wert_ist_zeit: false, runde_max_ms: 1_800_000,
    pruefe: (wert, body) => {
      const g = body.gefunden, f = body.fehltipps, v = body.vollstaendig;
      if (!istGanz(g) || g < 0 || g > FAHRZEUG.MAX_GESAMT) return "gefunden_ungueltig";
      if (!istGanz(v) || v < 0 || v > FAHRZEUG.BILDER || v * FAHRZEUG.MIN_JE_BILD > g) return "vollstaendig_ungueltig";
      if (!istGanz(f) || f < 0 || f > FAHRZEUG.BILDER * FAHRZEUG.FEHL_JE_BILD) return "fehltipps_ungueltig";
      if (wert > g * FAHRZEUG.PKT + v * FAHRZEUG.BONUS_JE_BILD) return "punkte_zu_hoch";
      if (wert < g * FAHRZEUG.PKT - f * FAHRZEUG.ABZUG) return "punkte_zu_niedrig";
      return null;
    },
  },
};
const RUNDE_MAX_MS = 120_000;          // länger offen gelassene Runde zählt nicht mehr
const RUNDEN_PRO_10_MIN = 30;          // Bremse gegen Dauerfeuer

// ===== Duell gegen Mitschüler (Spiel 10) =====
// Zahlen wie REGELN in spiele/duell.js (die Prüfung werkzeuge/pruefe-duell.mjs vergleicht beides).
//  Punkte je Frage: richtig = 100 + Tempo-Bonus (0–50, linear in BONUS_MS); falsch oder keine Antwort = 0. Höchstens 8 × 150 = 1200.
//  Zeiten kommen vom Gerät, sind aber begrenzt: kein Wert unter MIN_MS (sonst zählt MIN_MS), keine Summe über der echten Zeit seit dem Start,
//  und wer viel länger gebraucht hat, als er meldet, bekommt keinen Bonus (nur die Grundpunkte).
const DUELL = {
  FRAGEN: 8, MAX_LAUFEND: 3, VERFALL_TAGE: 7, LISTE: 20,
  LIMIT_MS: 20_000, BONUS_MS: 10_000, PUNKTE_RICHTIG: 100, BONUS_MAX: 50, MIN_MS: 700,
  RUNDE_MAX_MS: 600_000,                   // so lange darf eine gestartete Runde offen sein; danach zählt sie 0 Punkte (Gegner-Seite) bzw. das Duell verfällt (Ersteller)
  LUFT_MS: 3_000, UEBERHANG_MS: 15_000,    // Netz/Uhr-Spielraum; erlaubte Pausen außerhalb der Fragezeit (8 × 0,45 s Pause + Start/Ende über das Netz); mehr heißt: kein Tempo-Bonus
  FERTIG_TAGE: 90, UNBEANTWORTET_TAGE: 14, // danach wird die Zeile gelöscht (Datensparsamkeit)
  ANNAHME_FRIST_MS: 86_400_000,            // wer ein Duell annimmt und nicht innerhalb von 24 h startet, verliert es (es geht zurück an die offenen Herausforderungen)
  LOESUNGEN_CACHE_MS: 300_000,             // so lange behält die Function die Lösungstabelle im Speicher
  AUFRAEUM_ABSTAND_MS: 60_000,             // Aufräumen höchstens einmal pro Minute je Function-Instanz
  UEBERSICHT_PRO_ZEHN_MIN: 60,               // Bremse für duell_uebersicht je Schüler (im Speicher der Instanz)
  MAX_ZEILEN_JE_LAUF: 50,                  // so viele Zeilen rechnet eine Aufräum-Schleife höchstens ab
};
const DUELL_LOESUNGEN_TABELLE = "academy_duell_loesungen";
// Lösungstabelle (Frage-ID -> Nummer der richtigen Antwort 0-2) aus der Datenbank, 5 Minuten im Speicher. Bei einem Lesefehler gilt die alte Kopie weiter.
let loesungenCache: { am: number; karte: Record<string, number> } | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function duellLoesungen(supa: any): Promise<Record<string, number> | null> {
  if (loesungenCache && Date.now() - loesungenCache.am < DUELL.LOESUNGEN_CACHE_MS) return loesungenCache.karte;
  const { data, error } = await supa.from(DUELL_LOESUNGEN_TABELLE).select("frage_id, richtig").limit(1000);
  if (error || !Array.isArray(data)) return loesungenCache ? loesungenCache.karte : null;
  const karte: Record<string, number> = {};
  for (const z of data as { frage_id: unknown; richtig: unknown }[]) if (typeof z.frage_id === "string" && (z.richtig === 0 || z.richtig === 1 || z.richtig === 2)) karte[z.frage_id] = z.richtig;
  if (!Object.keys(karte).length) return loesungenCache ? loesungenCache.karte : null;
  loesungenCache = { am: Date.now(), karte };
  return karte;
}
let letztesAufraeumen = 0;                                       // Zeitpunkt des letzten erfolgreichen Aufräumens dieser Instanz
const uebersichtZeiten = new Map<string, number[]>();            // Schüler -> Zeitpunkte seiner duell_uebersicht-Aufrufe (letzte 10 Minuten)
function uebersichtErlaubt(ich: string): boolean {
  const jetzt = Date.now(), ab = jetzt - 600_000;
  const liste = (uebersichtZeiten.get(ich) || []).filter((z) => z > ab);
  if (liste.length >= DUELL.UEBERSICHT_PRO_ZEHN_MIN) { uebersichtZeiten.set(ich, liste); return false; }
  liste.push(jetzt); uebersichtZeiten.set(ich, liste);
  if (uebersichtZeiten.size > 5000) for (const [k, v] of uebersichtZeiten) if (!v.some((z) => z > ab)) uebersichtZeiten.delete(k);   // Speicher klein halten
  return true;
}
const UUID_FORM = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const DUELL_SPALTEN = "id, erstellt_am, ersteller, gegner, status, angenommen_am, ersteller_gestartet_am, ersteller_fertig_am, punkte_ersteller, richtig_ersteller, gegner_gestartet_am, gegner_fertig_am, punkte_gegner, richtig_gegner, fertig_am";
const DUELL_TABELLE = "academy_spiele_duelle";

// Punkte einer Frage (reine Rechnung, wird auch von der Prüfung genutzt)
function duellPunkte(richtig: boolean, ms: number, mitBonus: boolean): number {
  if (!richtig) return 0;
  if (!mitBonus) return DUELL.PUNKTE_RICHTIG;
  const eff = Math.max(ms, DUELL.MIN_MS);
  return DUELL.PUNKTE_RICHTIG + Math.floor(DUELL.BONUS_MAX * Math.max(0, 1 - eff / DUELL.BONUS_MS));
}
const duellUrteil = (ich: number, er: number) => ich > er ? "sieg" : ich < er ? "niederlage" : "unentschieden";
// gleichverteilte Zufallszahl 0..max-1 (ohne Modulo-Schieflage)
function zufallBis(max: number): number {
  const grenze = Math.floor(0x1_0000_0000 / max) * max;
  const a = new Uint32Array(1);
  do { crypto.getRandomValues(a); } while (a[0] >= grenze);
  return a[0] % max;
}
// n verschiedene IDs aus der Liste (Teilmischung), bevorzugt solche, die nicht in "meiden" stehen
function duellZiehen(ids: string[], n: number, meiden: Set<string>): string[] {
  let pool = ids.filter((i) => !meiden.has(i));
  if (pool.length < n) pool = ids.slice();
  for (let i = 0; i < n; i++) {
    const j = i + zufallBis(pool.length - i);
    const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
  }
  return pool.slice(0, n);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function duellAktion(supa: any, ich: string, body: Record<string, unknown>, sichtbarLesen: () => Promise<boolean>, anzeigename: () => Promise<string>): Promise<Response> {
  const T = DUELL_TABELLE;
  const db503 = () => json({ error: "datenbankfehler", code: "voruebergehend" }, 503);
  const nein = (code: string, status = 400) => json({ error: code, code }, status);
  const jetztIso = () => new Date(Date.now()).toISOString();   // wie Date.now() (die Prüfung stellt die Uhr vor)
  const vorTagen = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  const vorMs = (ms: number) => new Date(Date.now() - ms).toISOString();
  const verfallGrenze = () => vorTagen(DUELL.VERFALL_TAGE);
  const verfallen = (d: { erstellt_am: string; status: string }) => d.status !== "fertig" && new Date(d.erstellt_am).getTime() <= Date.now() - DUELL.VERFALL_TAGE * 86_400_000;
  const duellId = (v: unknown): v is string => typeof v === "string" && UUID_FORM.test(v);
  // Annahme älter als 24 h und die Runde des Gegners nie gestartet: das Duell gehört ihm nicht mehr
  const annahmeZuAlt = (d: { gegner_gestartet_am?: string | null; angenommen_am?: string | null }) =>
    !d.gegner_gestartet_am && !!d.angenommen_am && new Date(d.angenommen_am).getTime() <= Date.now() - DUELL.ANNAHME_FRIST_MS;

  // Beide Seiten fertig -> Duell fertig (mehrfach aufrufbar). false = Datenbankfehler; das Aufräumen holt es später nach.
  const fertigPruefen = async (id: string): Promise<boolean> => {
    const { data, error } = await supa.from(T).select("status, ersteller_fertig_am, gegner_fertig_am").eq("id", id).maybeSingle();
    if (error) return false;
    if (data && data.status !== "fertig" && data.ersteller_fertig_am && data.gegner_fertig_am) {
      const r = await supa.from(T).update({ status: "fertig", fertig_am: jetztIso() }).eq("id", id).neq("status", "fertig");
      if (r.error) return false;
    }
    return true;
  };
  // Aufräumen (höchstens einmal pro Minute je Function-Instanz; Schleifen höchstens MAX_ZEILEN_JE_LAUF Zeilen):
  //  - alte Zeilen löschen
  //  - Ersteller hat gestartet, aber nie abgegeben (kein Gegner möglich): Duell verfällt (Zeile weg)
  //  - Gegner hat gestartet, aber nie abgegeben: 0 Punkte für ihn (er hat die Fragen gesehen) -> der Ersteller gewinnt
  //  - angenommen, aber 24 h nicht gestartet: zurück auf "offen" (Gegner weg)
  //  - beide Ergebnisse da, Status aber nicht "fertig" (Fehler nach der Auswertung): auf "fertig" setzen
  const aufraeumen = async (erzwingen = false): Promise<boolean> => {
    if (!erzwingen && Date.now() - letztesAufraeumen < DUELL.AUFRAEUM_ABSTAND_MS) return true;
    const MAX = DUELL.MAX_ZEILEN_JE_LAUF;
    const r1 = await supa.from(T).delete().eq("status", "fertig").lt("erstellt_am", vorTagen(DUELL.FERTIG_TAGE));
    const r2 = await supa.from(T).delete().neq("status", "fertig").lt("erstellt_am", vorTagen(DUELL.UNBEANTWORTET_TAGE));
    const r3 = await supa.from(T).delete().is("ersteller_fertig_am", null).lt("ersteller_gestartet_am", vorMs(DUELL.RUNDE_MAX_MS));
    const s4 = await supa.from(T).select("id").is("gegner_fertig_am", null).lt("gegner_gestartet_am", vorMs(DUELL.RUNDE_MAX_MS)).limit(MAX);
    const r5 = await supa.from(T).update({ gegner: null, status: "offen", angenommen_am: null })
      .eq("status", "angenommen").is("gegner_gestartet_am", null).lt("angenommen_am", vorMs(DUELL.ANNAHME_FRIST_MS)).select("id");
    const s6 = await supa.from(T).select("id").neq("status", "fertig").not("ersteller_fertig_am", "is", null).not("gegner_fertig_am", "is", null).limit(MAX);
    if (r1.error || r2.error || r3.error || s4.error || r5.error || s6.error) return false;
    const idsGegner = ((s4.data || []) as { id: string }[]).map((z) => z.id);
    if (idsGegner.length) {
      const r4 = await supa.from(T).update({ gegner_fertig_am: jetztIso(), punkte_gegner: 0, richtig_gegner: 0 }).in("id", idsGegner).is("gegner_fertig_am", null).select("id");
      if (r4.error) return false;
      for (const z of ((r4.data || []) as { id: string }[]).slice(0, MAX)) await fertigPruefen(z.id);
    }
    const idsFertig = ((s6.data || []) as { id: string }[]).map((z) => z.id);
    if (idsFertig.length) {
      const r6 = await supa.from(T).update({ status: "fertig", fertig_am: jetztIso() }).in("id", idsFertig).neq("status", "fertig");
      if (r6.error) return false;
    }
    letztesAufraeumen = Date.now();
    return true;
  };
  // Eine einzelne Runde ist länger als RUNDE_MAX_MS offen: Ersteller -> das Duell verfällt (Zeile weg); Gegner -> 0 Punkte, das Duell wird fertig
  const rundeAbrechnen = async (id: string, seite: "ersteller" | "gegner"): Promise<void> => {
    if (seite === "ersteller") { await supa.from(T).delete().eq("id", id).eq("ersteller", ich).is("ersteller_fertig_am", null); return; }
    const r = await supa.from(T).update({ gegner_fertig_am: jetztIso(), punkte_gegner: 0, richtig_gegner: 0 }).eq("id", id).eq("gegner", ich).is("gegner_fertig_am", null).select("id");
    if (!r.error) await fertigPruefen(id);
  };
  const laufendZaehlen = async (): Promise<number | null> => {
    const grenze = verfallGrenze();
    const a = await supa.from(T).select("id", { count: "exact", head: true }).eq("ersteller", ich).neq("status", "fertig").gt("erstellt_am", grenze);
    const b = await supa.from(T).select("id", { count: "exact", head: true }).eq("gegner", ich).neq("status", "fertig").gt("erstellt_am", grenze);
    if (a.error || b.error) return null;
    return (a.count || 0) + (b.count || 0);
  };
  const zuSchnell = async (): Promise<boolean | null> => {
    const grenze = vorMs(600_000);
    const a = await supa.from(T).select("id", { count: "exact", head: true }).eq("ersteller", ich).gt("erstellt_am", grenze);
    const b = await supa.from(T).select("id", { count: "exact", head: true }).eq("gegner", ich).gt("angenommen_am", grenze);
    if (a.error || b.error) return null;
    return (a.count || 0) + (b.count || 0) >= RUNDEN_PRO_10_MIN;
  };
  const namenHolen = async (ids: string[]): Promise<Record<string, string>> => {
    const eindeutig = Array.from(new Set(ids.filter((x) => typeof x === "string")));
    if (!eindeutig.length) return {};
    const { data } = await supa.rpc("academy_duell_namen", { p_ids: eindeutig });
    return data && typeof data === "object" ? data : {};
  };

  if (body.aktion === "duell_uebersicht") {
    if (!uebersichtErlaubt(ich)) return nein("zu_viele_runden", 429);
    if (!(await aufraeumen())) return db503();
    const sp = DUELL_SPALTEN;
    const grenze90 = vorTagen(DUELL.FERTIG_TAGE);
    const e = await supa.from(T).select(sp).eq("ersteller", ich).gt("erstellt_am", grenze90).order("erstellt_am", { ascending: false }).limit(500);
    const g = await supa.from(T).select(sp).eq("gegner", ich).gt("erstellt_am", grenze90).order("erstellt_am", { ascending: false }).limit(500);
    if (e.error || g.error) return db503();
    type Z = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    const alle: { d: Z; seite: "ersteller" | "gegner" }[] = [
      ...((e.data || []) as Z[]).map((d) => ({ d, seite: "ersteller" as const })),
      ...((g.data || []) as Z[]).map((d) => ({ d, seite: "gegner" as const })),
    ].sort((x, y) => String(y.d.erstellt_am).localeCompare(String(x.d.erstellt_am)));
    const bilanz = { siege: 0, unentschieden: 0, niederlagen: 0 };
    const laufend: unknown[] = [], fertig: unknown[] = [];
    const andere: string[] = [];
    const eintraege: { eintrag: Z; andere: string | null }[] = [];
    for (const { d, seite } of alle) {
      const ander = seite === "ersteller" ? "gegner" : "ersteller";
      const meine = d["punkte_" + seite], deren = d["punkte_" + ander];
      if (d.status === "fertig") {
        const u = duellUrteil(meine, deren);
        if (u === "sieg") bilanz.siege++; else if (u === "niederlage") bilanz.niederlagen++; else bilanz.unentschieden++;
        eintraege.push({ andere: d[ander], eintrag: { id: d.id, rolle: seite, zustand: "fertig", ergebnis: u, punkte_ich: meine, richtig_ich: d["richtig_" + seite], punkte_gegner: deren, richtig_gegner: d["richtig_" + ander], erstellt_am: d.erstellt_am, fertig_am: d.fertig_am } });
        continue;
      }
      if (verfallen(d) && !(d[seite + "_gestartet_am"] && !d[seite + "_fertig_am"])) continue;   // verfallen (außer eine Runde läuft noch)
      if (seite === "gegner" && annahmeZuAlt(d)) continue;                                      // angenommen, aber 24 h nicht gestartet: das Aufräumen setzt es zurück
      let zustand: string;
      if (d[seite + "_fertig_am"]) zustand = d.gegner ? "gegner_spielt" : "wartet_auf_gegner";
      else if (d[seite + "_gestartet_am"]) zustand = "laeuft";
      else zustand = "du_bist_dran";
      const eintrag: Z = { id: d.id, rolle: seite, zustand, punkte_ich: d["punkte_" + seite] ?? null, richtig_ich: d["richtig_" + seite] ?? null, erstellt_am: d.erstellt_am, verfaellt_am: new Date(new Date(d.erstellt_am).getTime() + DUELL.VERFALL_TAGE * 86_400_000).toISOString() };
      // Runde noch offen (Weiterspielen möglich): gestartet, nicht abgegeben und nicht länger als RUNDE_MAX_MS her
      if (zustand === "laeuft") eintrag.runde_offen = Date.now() - new Date(d[seite + "_gestartet_am"]).getTime() <= DUELL.RUNDE_MAX_MS;
      eintraege.push({ andere: d[ander], eintrag });
    }
    for (const x of eintraege) if (x.andere) andere.push(x.andere);
    const namen = await namenHolen(andere);
    for (const x of eintraege) {
      x.eintrag.name = x.andere && Object.prototype.hasOwnProperty.call(namen, x.andere) ? namen[x.andere] : null;
      (x.eintrag.zustand === "fertig" ? fertig : laufend).push(x.eintrag);
    }
    // laufende zuerst (zuerst die, bei denen ich dran bin), dann die fertigen; insgesamt höchstens LISTE
    (laufend as Z[]).sort((x, y) => (x.zustand === "du_bist_dran" ? 0 : 1) - (y.zustand === "du_bist_dran" ? 0 : 1));
    const meine = [...laufend, ...fertig].slice(0, DUELL.LISTE);
    const { data: offene, error: oErr } = await supa.rpc("academy_duell_offene", { p_ich: ich, p_ab: verfallGrenze(), p_limit: DUELL.LISTE });
    if (oErr) return db503();
    return json({ ok: true, anzeigename: await anzeigename(), sichtbar: await sichtbarLesen(), bilanz, laufend: laufend.length, max_laufend: DUELL.MAX_LAUFEND, meine, offene: Array.isArray(offene) ? offene : [] });
  }

  if (body.aktion === "duell_neu") {
    if (!(await sichtbarLesen())) return nein("duell_ausgeblendet", 403);
    if (!(await aufraeumen())) return db503();
    const zs = await zuSchnell(); if (zs === null) return db503();
    if (zs) return nein("zu_viele_runden", 429);
    const lauf = await laufendZaehlen(); if (lauf === null) return db503();
    if (lauf >= DUELL.MAX_LAUFEND) return nein("duell_zu_viele", 409);
    // Fragen-IDs kommen aus der Lösungstabelle (nur Fragen, deren Lösung der Server kennt)
    const loesungen = await duellLoesungen(supa); if (!loesungen) return db503();
    // zuletzt selbst gestellte Fragen meiden (Wiederholungen vermeiden, solange der Fragenpool dafür reicht)
    const { data: zuletzt } = await supa.from(T).select("fragen").eq("ersteller", ich).order("erstellt_am", { ascending: false }).limit(3);
    const meiden = new Set<string>();
    for (const z of (zuletzt || []) as { fragen: string[] }[]) for (const f of z.fragen || []) meiden.add(f);
    const fragen = duellZiehen(Object.keys(loesungen), DUELL.FRAGEN, meiden);
    if (fragen.length !== DUELL.FRAGEN) return json({ error: "fragenpool_zu_klein", code: "voruebergehend" }, 503);
    const { data, error } = await supa.from(T).insert({ ersteller: ich, fragen }).select("id").single();
    if (error || !data) return db503();
    // Gleichzeitige Anfragen: nach dem Anlegen noch einmal zählen; wer über dem Limit liegt, nimmt seine Zeile wieder zurück
    const nachher = await laufendZaehlen();
    if (nachher === null || nachher > DUELL.MAX_LAUFEND) {
      await supa.from(T).delete().eq("id", data.id).eq("ersteller", ich).is("ersteller_gestartet_am", null);
      return nachher === null ? db503() : nein("duell_zu_viele", 409);
    }
    return json({ ok: true, duell: data.id });
  }

  if (body.aktion === "duell_annehmen") {
    if (!duellId(body.duell)) return nein("eingabe_fehlt");
    const id = body.duell;
    if (!(await aufraeumen())) return db503();
    const zs = await zuSchnell(); if (zs === null) return db503();
    if (zs) return nein("zu_viele_runden", 429);
    const lauf = await laufendZaehlen(); if (lauf === null) return db503();
    if (lauf >= DUELL.MAX_LAUFEND) return nein("duell_zu_viele", 409);
    const { data: d, error: dErr } = await supa.from(T).select("id, erstellt_am, ersteller, gegner, status, ersteller_fertig_am").eq("id", id).maybeSingle();
    if (dErr) return db503();
    if (!d) return nein("duell_unbekannt", 404);
    if (d.ersteller === ich) return nein("eigenes_duell", 400);
    // Nicht-Beteiligte erfahren nie, ob es das Duell gibt und wem es gehört: ein schon vergebenes Duell sieht für sie aus wie ein unbekanntes
    if (d.gegner) return d.gegner === ich ? nein("duell_vergeben", 409) : nein("duell_unbekannt", 404);
    if (verfallen(d)) return nein("duell_verfallen", 410);
    if (!d.ersteller_fertig_am) return nein("duell_unbekannt", 404);   // der Ersteller hat noch nicht gespielt: für andere unsichtbar
    // nur Herausforderungen von Schülern annehmen, die im Ranking sichtbar sind (wie in der Liste)
    const namen = await namenHolen([d.ersteller]);
    if (!Object.prototype.hasOwnProperty.call(namen, d.ersteller)) return nein("duell_unbekannt", 404);
    // atomar: nur der erste Aufruf bekommt die Zeile zurück
    const { data: u, error: uErr } = await supa.from(T).update({ gegner: ich, status: "angenommen", angenommen_am: jetztIso() })
      .eq("id", id).eq("status", "offen").is("gegner", null).neq("ersteller", ich).gt("erstellt_am", verfallGrenze()).select("id");
    if (uErr) return db503();
    if (!u || !u.length) {
      const { data: jetzt } = await supa.from(T).select("gegner").eq("id", id).maybeSingle();
      return jetzt && jetzt.gegner === ich ? nein("duell_vergeben", 409) : nein("duell_unbekannt", 404);
    }
    // Gleichzeitige Anfragen: nach dem Setzen noch einmal zählen. Über dem Limit -> diese Annahme zurückgeben, solange der Gegner noch nicht gestartet hat.
    // Hat er schon gestartet, bleibt das Duell bei ihm (das Limit gilt dann großzügig): ein gestartetes Duell wird nie zerstört.
    const nachher = await laufendZaehlen();
    if (nachher === null || nachher > DUELL.MAX_LAUFEND) {
      const rb = await supa.from(T).update({ gegner: null, status: "offen", angenommen_am: null }).eq("id", id).eq("gegner", ich).eq("status", "angenommen").is("gegner_gestartet_am", null).select("id");
      if (rb.error) return db503();
      if (rb.data && rb.data.length) return nachher === null ? db503() : nein("duell_zu_viele", 409);
    }
    return json({ ok: true, duell: id, name: namen[d.ersteller] });
  }

  if (body.aktion === "duell_start" || body.aktion === "duell_ende") {
    if (!duellId(body.duell)) return nein("eingabe_fehlt");
    const id = body.duell;
    const { data: d, error: dErr } = await supa.from(T).select("id, erstellt_am, ersteller, gegner, fragen, status, angenommen_am, ersteller_gestartet_am, ersteller_fertig_am, punkte_ersteller, richtig_ersteller, gegner_gestartet_am, gegner_fertig_am, punkte_gegner, richtig_gegner").eq("id", id).maybeSingle();
    if (dErr) return db503();
    // fremde Duelle sehen genauso aus wie nicht vorhandene
    if (!d || (d.ersteller !== ich && d.gegner !== ich)) return nein("duell_unbekannt", 404);
    const seite: "ersteller" | "gegner" = d.ersteller === ich ? "ersteller" : "gegner";
    const ander = seite === "ersteller" ? "gegner" : "ersteller";
    // Gegner hat angenommen, aber nicht innerhalb von 24 h gestartet: das Duell geht zurück an die offenen Herausforderungen
    if (seite === "gegner" && annahmeZuAlt(d)) {
      await supa.from(T).update({ gegner: null, status: "offen", angenommen_am: null }).eq("id", id).eq("gegner", ich).eq("status", "angenommen").is("gegner_gestartet_am", null);
      return nein("duell_unbekannt", 404);
    }
    // Verfall (7 Tage) zählt nur für Runden, die noch nicht begonnen haben: wer kurz vorher gestartet hat, darf seine Runde (höchstens RUNDE_MAX_MS) beenden
    const laeuft = !!d[seite + "_gestartet_am"] && !d[seite + "_fertig_am"];
    if (verfallen(d) && !laeuft) return nein("duell_verfallen", 410);

    if (body.aktion === "duell_start") {
      if (d[seite + "_fertig_am"]) return nein("duell_schon_gespielt", 409);
      // Runde offen: erneuter Aufruf (z. B. nach einem Netzfehler) liefert dieselben Fragen; die Uhr läuft seit dem ersten Start weiter und wird NICHT neu gestellt
      const weiter = async (gestartetAm: string, fragen: string[]) => {
        if (Date.now() - new Date(gestartetAm).getTime() > DUELL.RUNDE_MAX_MS) { await rundeAbrechnen(id, seite); return nein("runde_abgelaufen", 410); }
        return json({ ok: true, duell: id, fragen, limit_ms: DUELL.LIMIT_MS, fortgesetzt: true });
      };
      if (d[seite + "_gestartet_am"]) return await weiter(d[seite + "_gestartet_am"], d.fragen);
      // Runde starten (atomar: nur der erste Aufruf setzt die Startzeit)
      const { data: u, error } = await supa.from(T).update({ [seite + "_gestartet_am"]: jetztIso() }).eq("id", id).eq(seite, ich).is(seite + "_gestartet_am", null).gt("erstellt_am", verfallGrenze()).select("id");
      if (error) return db503();
      if (!u || !u.length) {
        // Wettlauf mit einem gleichzeitigen Aufruf derselben Seite: nachsehen, ob die Runde jetzt offen ist
        const { data: n, error: nErr } = await supa.from(T).select("fragen, " + seite + "_gestartet_am, " + seite + "_fertig_am").eq("id", id).eq(seite, ich).maybeSingle();
        if (nErr) return db503();
        if (!n) return nein("duell_unbekannt", 404);   // das Duell gehört dieser Seite nicht mehr (z. B. gerade zurück auf offen gesetzt)
        if (n[seite + "_gestartet_am"] && !n[seite + "_fertig_am"]) return await weiter(n[seite + "_gestartet_am"], n.fragen);
        return nein("duell_schon_gespielt", 409);
      }
      return json({ ok: true, duell: id, fragen: d.fragen, limit_ms: DUELL.LIMIT_MS });
    }

    // ---- duell_ende ----
    const arr = body.antworten;
    if (!Array.isArray(arr) || arr.length !== DUELL.FRAGEN) return nein("eingabe_fehlt");
    const antworten: { a: number | null; ms: number }[] = [];
    for (const x of arr) {
      if (typeof x !== "object" || x === null || Array.isArray(x)) return nein("ergebnis_ungueltig");
      const { a, ms } = x as Record<string, unknown>;
      if (!(a === null || (istGanz(a) && a >= 0 && a <= 2))) return nein("ergebnis_ungueltig");
      if (!istGanz(ms) || ms < 0 || ms > DUELL.LIMIT_MS + 1000) return nein("ergebnis_ungueltig");
      antworten.push({ a: a as number | null, ms });
    }
    if (!d[seite + "_gestartet_am"]) return nein("duell_nicht_gestartet", 409);
    if (d[seite + "_fertig_am"]) return nein("duell_schon_gespielt", 409);
    const vergangen = Date.now() - new Date(d[seite + "_gestartet_am"]).getTime();
    if (vergangen > DUELL.RUNDE_MAX_MS) { await rundeAbrechnen(id, seite); return nein("runde_abgelaufen", 410); }
    if (vergangen < DUELL.FRAGEN * DUELL.MIN_MS - 500) return nein("zu_schnell", 400);
    const summe = antworten.reduce((s, x) => s + x.ms, 0);
    if (summe > vergangen + DUELL.LUFT_MS) return nein("zeit_unmoeglich", 400);           // mehr Zeit gemeldet, als seit dem Start vergangen ist
    const summeEff = antworten.reduce((s, x) => s + Math.max(x.ms, DUELL.MIN_MS), 0);
    const mitBonus = vergangen - summeEff <= DUELL.UEBERHANG_MS;                          // viel länger gebraucht als gemeldet -> kein Tempo-Bonus
    const loesungen = await duellLoesungen(supa); if (!loesungen) return db503();       // ohne Lösungstabelle wird nichts gewertet (die Runde bleibt offen)
    let punkte = 0, richtig = 0;
    const loesung: number[] = [];
    (d.fragen as string[]).forEach((fid, i) => {
      const r = Object.prototype.hasOwnProperty.call(loesungen, fid) ? loesungen[fid] : null;
      loesung.push(r === null ? -1 : r);
      const ok = r === null ? true : antworten[i].a === r;     // unbekannte Frage (Pool geändert): zählt für beide Seiten als richtig
      if (ok) richtig++;
      punkte += duellPunkte(ok, antworten[i].ms, mitBonus);
    });
    // Runde genau einmal auswerten (atomar)
    const { data: u, error } = await supa.from(T).update({ [seite + "_fertig_am"]: jetztIso(), ["punkte_" + seite]: punkte, ["richtig_" + seite]: richtig })
      .eq("id", id).eq(seite, ich).not(seite + "_gestartet_am", "is", null).is(seite + "_fertig_am", null).select("id");
    if (error) return db503();
    if (!u || !u.length) return nein("duell_schon_gespielt", 409);
    await fertigPruefen(id);   // schlägt das fehl, steht das Ergebnis trotzdem; das Aufräumen setzt den Status später nach
    const { data: neu } = await supa.from(T).select("status, punkte_" + ander + ", richtig_" + ander + ", " + ander).eq("id", id).maybeSingle();
    const antwort: Record<string, unknown> = { ok: true, duell: id, punkte, richtig, fragen: d.fragen, loesung, bonus: mitBonus, fertig: false };
    if (neu && neu.status === "fertig") {
      const namen = await namenHolen([neu[ander]]);
      Object.assign(antwort, { fertig: true, ergebnis: duellUrteil(punkte, neu["punkte_" + ander]), punkte_gegner: neu["punkte_" + ander], richtig_gegner: neu["richtig_" + ander], name: Object.prototype.hasOwnProperty.call(namen, neu[ander]) ? namen[neu[ander]] : null });
    }
    return json(antwort);
  }

  return nein("aktion unbekannt");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // Der Body muss ein JSON-Objekt sein (nicht null, Liste, Text, Zahl und auch kein kaputtes JSON)
    let roh: unknown = null;
    try { roh = await req.json(); } catch (_e) { roh = null; }
    if (typeof roh !== "object" || roh === null || Array.isArray(roh)) return json({ error: "eingabe_fehlt", code: "eingabe_fehlt" }, 400);
    // deno-lint-ignore no-explicit-any
    const body = roh as Record<string, any>;
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

    if (typeof body.aktion === "string" && body.aktion.startsWith("duell_")) return await duellAktion(supa, ich, body, sichtbarLesen, anzeigename);

    return json({ error: "aktion unbekannt", code: "eingabe_fehlt" }, 400);
  } catch (e) {
    // Dem Client gehört nur ein fester Text, nie die Fehlermeldung (sie könnte Interna verraten); ins Log darf sie.
    console.error("academy-spiele:", e instanceof Error ? e.message : "fehler");
    return json({ error: "voruebergehend", code: "voruebergehend" }, 500);
  }
});
