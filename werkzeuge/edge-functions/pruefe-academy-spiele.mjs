// Prüft die Logik der Edge Function academy-spiele OHNE echte Datenbank (06.10.2026).
// Unterbau: spiele-im-speicher.mjs (die Uhr wird vorgestellt, damit "5 Sekunden später" nicht 5 Sekunden dauert).
//
// Aufruf:  node --experimental-strip-types werkzeuge/edge-functions/pruefe-academy-spiele.mjs
// Neues Spiel = Zeile im SPIELE-Block der Function UND hier Fälle ergänzen.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db, rufe, warte, hier } from "./spiele-im-speicher.mjs";
import { REGELN, LERN_MS, GESAMT_MS, lage, tipp, rollen, blitzer, obergrenze } from "../../spiele/tempo.js";
import { SCHILDER, PAARE, ZURUECK_MS, ZUG_MIN_MS, mischen, neueKarten, passen } from "../../spiele/memory.js";
import * as V from "../../spiele/vorfahrt.js";
import { SCHILD_IDS, SCHILD_DATEIEN, TEMPO_ZAHLEN, schildBild, zeichen274, zeichen282 } from "../../spiele/schilder.js";
import { TEXTE } from "../../spiele/texte.js";
import { existsSync } from "node:fs";

// ---- Grundausstattung ----
const inEinerStunde = new Date(Date.now() + 3_600_000).toISOString();
const gestern = new Date(Date.now() - 86_400_000).toISOString();
db.academy_schulen.push({ id: "s1", aktiv: true }, { id: "s2", aktiv: false });
const schueler = (id, extra) => db.academy_schueler.push({ id, name: "Vorname " + id, aktiv: true, ablauf_am: new Date(Date.now() + 30 * 86_400_000).toISOString(), schule_id: "s1", archiviert_am: null, ...extra });
const sitzung = (token, sid, ablauf) => db.academy_sessions.push({ session_token: token, schueler_id: sid, expires_at: ablauf || inEinerStunde });
schueler("a"); sitzung("tok-a", "a");
schueler("b"); sitzung("tok-b", "b");
schueler("gesperrt", { aktiv: false }); sitzung("tok-g", "gesperrt");
schueler("abgelaufen", { ablauf_am: gestern }); sitzung("tok-z", "abgelaufen");
schueler("pause", { schule_id: "s2" }); sitzung("tok-p", "pause");
sitzung("tok-alt", "a", gestern);

let ok = 0;
const pruefe = async (name, f) => { try { await f(); ok++; console.log("  ok   " + name); } catch (e) { console.log("  FEHL " + name + "\n       " + e.message); process.exitCode = 1; } };
const A = (o) => ({ session_token: "tok-a", ...o });

console.log("Zugang");
await pruefe("ohne Token -> nicht_angemeldet 401", async () => { const r = await rufe({ aktion: "uebersicht" }); assert.equal(r.status, 401); assert.equal(r.code, "nicht_angemeldet"); });
await pruefe("falscher Token -> session_ungueltig", async () => { const r = await rufe({ session_token: "nix", aktion: "uebersicht" }); assert.equal(r.code, "session_ungueltig"); });
await pruefe("abgelaufene Session -> session_abgelaufen", async () => { const r = await rufe({ session_token: "tok-alt", aktion: "uebersicht" }); assert.equal(r.code, "session_abgelaufen"); });
await pruefe("gesperrter Schüler -> zugang_gesperrt", async () => { const r = await rufe({ session_token: "tok-g", aktion: "uebersicht" }); assert.equal(r.code, "zugang_gesperrt"); });
await pruefe("abgelaufener Zugang -> zugang_abgelaufen", async () => { const r = await rufe({ session_token: "tok-z", aktion: "uebersicht" }); assert.equal(r.code, "zugang_abgelaufen"); });
await pruefe("pausierte Schule -> schule_pausiert", async () => { const r = await rufe({ session_token: "tok-p", aktion: "uebersicht" }); assert.equal(r.code, "schule_pausiert"); });
await pruefe("Admin-JWT ohne Session-Token wird nicht durchgelassen", async () => { const res = await globalThis.__handler(new Request("http://x/", { method: "POST", headers: { Authorization: "Bearer irgendwas" }, body: JSON.stringify({ aktion: "uebersicht" }) })); assert.equal(res.status, 401); });

console.log("Runde starten und abschließen");
let runde;
await pruefe("start liefert Runden-ID", async () => { const r = await rufe(A({ aktion: "start", spiel: "ampel" })); assert.equal(r.ok, true); assert.match(r.runde, /^[0-9a-f-]{36}$/); runde = r.runde; });
await pruefe("unbekanntes Spiel wird abgelehnt", async () => { const r = await rufe(A({ aktion: "start", spiel: "gibtesnicht" })); assert.equal(r.status, 400); });
await pruefe("Spielname wie __proto__ wird abgelehnt", async () => { const r = await rufe(A({ aktion: "start", spiel: "__proto__" })); assert.equal(r.status, 400); const r2 = await rufe(A({ aktion: "start", spiel: "constructor" })); assert.equal(r2.status, 400); });
await pruefe("sofortiges Ergebnis (zu schnell) wird abgelehnt", async () => { const r = await rufe(A({ aktion: "ergebnis", runde, wert: 250 })); assert.equal(r.status, 400); assert.equal(r.error, "zu_schnell"); });
await pruefe("Wert zu klein / zu groß / keine ganze Zahl / Text / negativ", async () => {
  warte(5000);
  for (const [w, fehler] of [[50, "wert_ausserhalb"], [119, "wert_ausserhalb"], [1501, "wert_ausserhalb"], [250.5, "wert_ungueltig"], ["250", "wert_ungueltig"], [-300, "wert_ausserhalb"], [null, "wert_ungueltig"]]) {
    const r = await rufe(A({ aktion: "ergebnis", runde, wert: w })); assert.equal(r.status, 400, String(w)); assert.equal(r.error, fehler, String(w));
  }
});
await pruefe("Runde eines anderen Schülers zählt nicht", async () => { const r = await rufe({ session_token: "tok-b", aktion: "ergebnis", runde, wert: 250 }); assert.equal(r.error, "runde_unbekannt"); });
await pruefe("gültiges Ergebnis: Rekord, Platz 1", async () => { const r = await rufe(A({ aktion: "ergebnis", runde, wert: 250 })); assert.equal(r.ok, true); assert.equal(r.rekord, true); assert.equal(r.bestwert, 250); assert.equal(r.platz, 1); });
await pruefe("dieselbe Runde zweimal -> abgelehnt", async () => { const r = await rufe(A({ aktion: "ergebnis", runde, wert: 100 + 20 })); assert.equal(r.status, 400); assert.equal(r.error, "runde_schon_benutzt"); });
await pruefe("schlechterer Wert ändert den Bestwert nicht", async () => {
  const s = await rufe(A({ aktion: "start", spiel: "ampel" })); warte(5200);
  const r = await rufe(A({ aktion: "ergebnis", runde: s.runde, wert: 400 })); assert.equal(r.rekord, false); assert.equal(r.bestwert, 250);
});
await pruefe("besserer Wert wird neuer Bestwert, Versuche zählen", async () => {
  const s = await rufe(A({ aktion: "start", spiel: "ampel" })); warte(5000);
  const r = await rufe(A({ aktion: "ergebnis", runde: s.runde, wert: 210 })); assert.equal(r.rekord, true); assert.equal(r.bestwert, 210);
  assert.equal(db.academy_spiele_bestwerte.find((b) => b.schueler_id === "a").versuche, 3);
});
await pruefe("Wartezeit zählt: 500 ms nach nur 4,7 s ist unmöglich, nach 5 s möglich", async () => {
  const s = await rufe(A({ aktion: "start", spiel: "ampel" })); warte(4700);
  const r1 = await rufe(A({ aktion: "ergebnis", runde: s.runde, wert: 500 })); assert.equal(r1.error, "zu_schnell");
  warte(300);
  const r2 = await rufe(A({ aktion: "ergebnis", runde: s.runde, wert: 500 })); assert.equal(r2.ok, true);
});
await pruefe("zu lange offene Runde (über 2 Minuten) zählt nicht", async () => {
  const s = await rufe(A({ aktion: "start", spiel: "ampel" })); warte(125_000);
  const r = await rufe(A({ aktion: "ergebnis", runde: s.runde, wert: 200 })); assert.equal(r.error, "runde_abgelaufen");
});
await pruefe("Runden-ID ohne gültige Form wird abgelehnt", async () => { const r = await rufe(A({ aktion: "ergebnis", runde: "'; drop table x; --", wert: 200 })); assert.equal(r.status, 400); });

console.log("Tempo-Sprint: Spielregeln (Zahlen im Spiel und im Server)");
await pruefe("Zahlen im Server = Zahlen im Spiel (GAIN, VTOP, V0_MAX, TAPS_MAX, Vorlauf)", async () => {
  const q = readFileSync(join(hier, "academy-spiele.ts"), "utf8");
  const m = q.match(/const TEMPO = \{ GAIN: ([\d.]+), VTOP: (\d+), DECAY: (\d+), V0_MAX: (\d+), TAPS_MAX: (\d+), ABSTAND_MS: (\d+) \};/);
  assert.ok(m, "TEMPO-Zeile nicht gefunden");
  assert.deepEqual([+m[1], +m[2], +m[3], +m[4], +m[5], +m[6]], [REGELN.GAIN, REGELN.VTOP, REGELN.DECAY, REGELN.V0_MAX, REGELN.TAPS_MAX, REGELN.OBERGRENZE_ABSTAND_MS]);
  assert.ok(REGELN.OBERGRENZE_ABSTAND_MS <= REGELN.TAP_ABSTAND_MS, "Obergrenze rechnet mit dichterem Abstand als das Spiel erlaubt");
  assert.match(q, new RegExp("tempo: \\{\\s*aufsteigend: false, min: 0, max: TEMPO.VTOP, vorlauf_ms: " + String(GESAMT_MS).replace(/(\d)(\d{3})$/, "$1_$2") + ","));
  assert.equal(GESAMT_MS, 43_000);
  const mehrAlsMoeglich = Math.floor((REGELN.SPURT_MS - 1) / REGELN.TAP_ABSTAND_MS) + 1;   // so viele Tipps passen bei Mindestabstand höchstens in den Endspurt
  assert.ok(REGELN.TAPS_MAX >= mehrAlsMoeglich && REGELN.TAPS_MAX <= mehrAlsMoeglich + 2, "TAPS_MAX " + REGELN.TAPS_MAX + " passt nicht zum Mindestabstand (" + mehrAlsMoeglich + ")");
});
await pruefe("Zeitplan: Schilder, Ankündigung, Kulanz, Endspurt, Ende", () => {
  assert.equal(LERN_MS, 30_000);
  let l = lage(0); assert.equal(l.phase, "lern"); assert.equal(l.limit, 80); assert.equal(l.blitzerAktiv, false); assert.equal(l.ankuendigung, false);
  assert.equal(lage(2499).blitzerAktiv, false); assert.equal(lage(2500).blitzerAktiv, true, "Blitzer erst nach der Kulanzzeit");
  assert.equal(lage(2999).ankuendigung, false); l = lage(3000); assert.equal(l.ankuendigung, true); assert.equal(l.naechstes, 100);
  assert.equal(lage(5000).limit, 100); assert.equal(lage(5000).segmentZeit, 0);
  assert.equal(lage(29_999).naechstes, "frei", "vor dem letzten Schild: nächstes = Zeichen 282");
  l = lage(30_000); assert.equal(l.phase, "spurt"); assert.equal(l.frei, true); assert.equal(lage(39_999).phase, "spurt"); assert.equal(lage(40_000).phase, "ende");
  assert.equal(REGELN.LIMITS.at(-1), Math.max(...REGELN.LIMITS), "das letzte Schild ist das höchste (V0_MAX rechnet damit)");
  assert.ok(REGELN.V0_MAX >= REGELN.LIMITS.at(-1) + REGELN.TOL + REGELN.GAIN, "V0_MAX deckt Limit + Toleranz + einen Tipp");
});
await pruefe("Blitzer: erst über Schild + 5 km/h", () => { assert.equal(blitzer(85, 80), false); assert.equal(blitzer(85.01, 80), true); assert.equal(blitzer(60, 80), false); });
await pruefe("Tipp: je schneller, desto weniger; nie über VTOP; Rollen nie unter 0", () => {
  assert.ok(tipp(0) - 0 > tipp(200) - 200); assert.equal(tipp(REGELN.VTOP), REGELN.VTOP); assert.ok(tipp(279) <= REGELN.VTOP);
  assert.equal(rollen(3, 5000), 0); assert.equal(rollen(100, 1000), 100 - REGELN.DECAY);
});

/* Ein ganzes Spiel in 1-ms-Schritten durchrechnen (dieselben Funktionen wie im Spiel).
   haltenBis: Verhalten in der Lernphase ("halten" = knapp unter dem Schild, "dauer" = immer tippen, "nichts" = nie tippen)
   rate: Tipps pro Sekunde im Endspurt (0 = keine). */
function simuliere(lernen, rate) {
  let v = REGELN.V_START, sperre = -1e9, letzterTipp = -1e9, naechster = 0, maxV = 0, tipps = 0, blitze = 0, v0Spurt = null, sperrenVerletzt = 0;
  for (let t = 0; t < LERN_MS + REGELN.SPURT_MS; t++) {
    v = rollen(v, 1);
    const l = lage(t);
    if (l.phase === "lern" && l.blitzerAktiv && blitzer(v, l.limit) && t >= sperre) { blitze++; v *= REGELN.BLITZ_FAKTOR; sperre = t + REGELN.SPERRE_MS; }
    if (l.phase === "spurt" && v0Spurt === null) { v0Spurt = v; maxV = v; sperre = -1e9; naechster = t; }
    let tippt = false;
    if (l.phase === "lern") tippt = lernen === "dauer" || (lernen === "halten" && v < l.limit - 8);
    else if (rate > 0 && t >= naechster) { tippt = true; naechster += 1000 / rate; }
    if (tippt && t >= sperre && t - letzterTipp >= REGELN.TAP_ABSTAND_MS) {
      letzterTipp = t; v = tipp(v);
      if (l.phase === "spurt") { tipps++; if (v > maxV) maxV = v; }
    } else if (tippt && t < sperre) sperrenVerletzt++;
  }
  return { maxV, wert: Math.round(maxV), tipps, blitze, v0Spurt };
}
await pruefe("Lernphase: ohne Tippen nie ein Blitzer; knapp unter dem Schild halten nie ein Blitzer (auch bei Abbremsen 100→80→60)", () => {
  assert.equal(simuliere("nichts", 0).blitze, 0);
  const r = simuliere("halten", 8);
  assert.equal(r.blitze, 0, "Blitzer trotz Halten");
  assert.ok(r.v0Spurt > 100 && r.v0Spurt <= REGELN.V0_MAX, "Tempo am Start des Endspurts " + r.v0Spurt);
});
await pruefe("Lernphase: dauernd Tippen löst Blitzer aus und sperrt das Tippen", () => {
  const r = simuliere("dauer", 8); assert.ok(r.blitze >= 3, "Blitzer: " + r.blitze);
  assert.ok(r.v0Spurt <= REGELN.V0_MAX);
});
await pruefe("Spielbare Tempi: gemächlich ~160, flott ~235, sehr gut ~285, Grenze ~300 km/h (wer richtig gut ist, wird SEHR schnell)", () => {
  const a = simuliere("halten", 6).wert, b = simuliere("halten", 10).wert, g = simuliere("halten", 14).wert, c = simuliere("halten", 15.8).wert;
  assert.ok(a >= 140 && a <= 185, "6/s: " + a);
  assert.ok(b >= 215 && b <= 255, "10/s: " + b);
  assert.ok(g >= 270 && g <= 310, "14/s: " + g);
  assert.ok(c >= 285 && c <= 330 && c < REGELN.VTOP, "15,8/s: " + c);
  assert.ok(a < b && b < g && g < c, "jede Stufe bringt mehr: " + [a, b, g, c].join(" / "));
  assert.ok(g - b >= 30 && c - a >= 120, "Spielraum zwischen Gut und Durchschnitt");
});
await pruefe("Jeder ehrliche Lauf bleibt unter der Obergrenze seiner Tipps (Server lehnt keine ehrliche Runde ab)", () => {
  for (const lernen of ["halten", "dauer", "nichts"]) for (const rate of [0, 3, 6, 8, 10, 12, 14, 15.8]) {
    const r = simuliere(lernen, rate);
    assert.ok(r.tipps <= REGELN.TAPS_MAX, "Tipps " + r.tipps);
    assert.ok(r.maxV <= obergrenze(r.tipps) + 1e-9, lernen + " " + rate + ": " + r.maxV + " > " + obergrenze(r.tipps));
    assert.ok(r.wert <= Math.ceil(obergrenze(r.tipps)) + 1);
  }
});

console.log("Tempo-Sprint: Server");
warte(700_000);   // Rundenzähler der früheren Fälle verfällt
const tempoRunde = async (token = "tok-a") => { const s = await rufe({ session_token: token, aktion: "start", spiel: "tempo" }); assert.equal(s.ok, true); return s.runde; };
const tempoErg = (runde, wert, tipps, token = "tok-a") => rufe({ session_token: token, aktion: "ergebnis", runde, wert, ...(tipps === undefined ? {} : { tipps }) });
let tr;
await pruefe("start für tempo liefert Runden-ID", async () => { tr = await tempoRunde(); assert.match(tr, /^[0-9a-f-]{36}$/); });
await pruefe("sofort melden (ehrlich aussehende Werte) -> zu_schnell", async () => { const r = await tempoErg(tr, 150, 100); assert.equal(r.status, 400); assert.equal(r.error, "zu_schnell"); });
await pruefe("42 s nach dem Start ist unmöglich (Countdown 3 + Lernphase 30 + Endspurt 10 = 43 s)", async () => { warte(42_000); const r = await tempoErg(tr, 150, 100); assert.equal(r.error, "zu_schnell"); });
await pruefe("ohne / falsche tipps -> tipps_ungueltig; zu viele -> zu_viele_tipps", async () => {
  for (const t of [undefined, null, "80", 1.5, -1, NaN, true]) { const r = await tempoErg(tr, 150, t); assert.equal(r.status, 400, String(t)); assert.equal(r.error, "tipps_ungueltig", String(t)); }
  const z = await tempoErg(tr, 150, REGELN.TAPS_MAX + 1); assert.equal(z.error, "zu_viele_tipps");
  const z2 = await tempoErg(tr, 150, 100000); assert.equal(z2.error, "zu_viele_tipps");
});
await pruefe("Wert außerhalb 0–420 -> wert_ausserhalb; Wert keine ganze Zahl -> wert_ungueltig", async () => {
  for (const w of [-1, 421, 1000]) assert.equal((await tempoErg(tr, w, 100)).error, "wert_ausserhalb", String(w));
  assert.equal((await tempoErg(tr, 150.5, 100)).error, "wert_ungueltig");
});
await pruefe("Tempo, das mit so wenigen Tipps nicht möglich ist -> tempo_unmoeglich", async () => {
  assert.equal((await tempoErg(tr, 250, 10)).error, "tempo_unmoeglich");
  assert.equal((await tempoErg(tr, 200, 0)).error, "tempo_unmoeglich");
  assert.equal((await tempoErg(tr, 345, 160)).error, "tempo_unmoeglich");
});
await pruefe("gültiges Ergebnis nach 43 s: Rekord, Platz 1 (größer ist besser)", async () => {
  warte(1_500);
  const r = await tempoErg(tr, 180, 120); assert.equal(r.ok, true, JSON.stringify(r)); assert.equal(r.rekord, true); assert.equal(r.bestwert, 180); assert.equal(r.platz, 1);
});
await pruefe("dieselbe Runde zweimal -> abgelehnt", async () => { assert.equal((await tempoErg(tr, 180, 120)).error, "runde_schon_benutzt"); });
await pruefe("niedrigerer Wert ist kein Rekord, Bestwert bleibt", async () => {
  const r2 = await tempoRunde(); warte(43_000);
  const r = await tempoErg(r2, 140, 70); assert.equal(r.rekord, false); assert.equal(r.bestwert, 180);
});
await pruefe("höherer Wert wird neuer Bestwert; Ranking: Höchsttempo zuerst", async () => {
  const r2 = await tempoRunde(); warte(43_000);
  const r = await tempoErg(r2, 205, 155); assert.equal(r.rekord, true); assert.equal(r.bestwert, 205);
  const b = await tempoRunde("tok-b"); warte(43_000);
  assert.equal((await tempoErg(b, 190, 140, "tok-b")).platz, 2);
  const liste = await rufe({ session_token: "tok-a", aktion: "rangliste", spiel: "tempo" });
  assert.deepEqual(liste.top.map((z) => z.wert), [205, 190]); assert.equal(liste.top[0].ich, true);
  const u = await rufe({ session_token: "tok-a", aktion: "uebersicht" }); assert.equal(u.bestwerte.tempo, 205);
});
await pruefe("Grenze genau: Obergrenze(n) + 1 zählt, +2 nicht (n = 0, 1, 10, 50, 100, 160)", async () => {
  for (const n of [0, 1, 10, 50, 100, 160]) {
    const grenze = Math.min(REGELN.VTOP, Math.ceil(obergrenze(n)) + 1);
    const ok1 = await tempoRunde(); warte(43_000);
    const a = await tempoErg(ok1, grenze, n); assert.equal(a.ok, true, "n=" + n + " wert=" + grenze + " " + JSON.stringify(a));
    if (grenze + 1 <= REGELN.VTOP) {
      const ok2 = await tempoRunde(); warte(43_000);
      const b = await tempoErg(ok2, grenze + 1, n); assert.equal(b.error, "tempo_unmoeglich", "n=" + n);
    }
  }
});
await pruefe("echte Läufe aus dem Spiel-Modell (Tippen mit 4–15,8 pro Sekunde) werden angenommen", async () => {
  warte(700_000);
  for (const rate of [4, 8, 12, 15.8]) {
    const sim = simuliere("halten", rate);
    const r = await tempoRunde(); warte(43_000);
    const a = await tempoErg(r, sim.wert, sim.tipps); assert.equal(a.ok, true, "rate " + rate + " -> " + sim.wert + "/" + sim.tipps + " " + JSON.stringify(a));
  }
});
await pruefe("tipps bei der Ampel werden ignoriert (kein Einfluss), Ampel-Regeln unverändert", async () => {
  warte(700_000);
  const s = await rufe({ session_token: "tok-a", aktion: "start", spiel: "ampel" }); warte(5200);
  const r = await rufe({ session_token: "tok-a", aktion: "ergebnis", runde: s.runde, wert: 300, tipps: 99999 }); assert.equal(r.ok, true);
});
await pruefe("tempo-Runde wird nicht als ampel-Ergebnis verbucht (Wert 150 als Ampel wäre erlaubt, als Tempo gilt tempo-Grenze)", async () => {
  const r = await tempoRunde(); warte(43_000);
  assert.equal((await tempoErg(r, 150, undefined)).error, "tipps_ungueltig");
});

/* ===================== Spiel 3: Schilder-Memory ===================== */
console.log("Schilder-Memory: Logik");
const kette = (a) => a.map((x) => JSON.stringify(x)).join("|");
const zufallsquelle = (seed) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };   // gleichmäßig verteilt, gleiche Folge je Startwert
await pruefe("Zahlen im Server = Zahlen im Spiel (PAARE, ZUG_MIN_MS, ZURUECK_MS)", async () => {
  const q = readFileSync(join(hier, "academy-spiele.ts"), "utf8");
  const m = q.match(/const MEMORY = \{ PAARE: (\d+), ZUG_MIN_MS: (\d+), ZURUECK_MS: (\d+) \};/);
  assert.ok(m, "MEMORY-Zeile nicht gefunden");
  assert.deepEqual([+m[1], +m[2], +m[3]], [PAARE, ZUG_MIN_MS, ZURUECK_MS]);
});
await pruefe("14 Schilder, jedes mit Bild und Texten (Name + Erklärung) in allen 18 Sprachen", async () => {
  assert.equal(SCHILDER.length, 14);
  assert.equal(new Set(SCHILDER.map((x) => x.id)).size, 14, "doppelte Schild-id");
  for (const sc of SCHILDER) {
    assert.ok(SCHILD_IDS.includes(sc.id), "kein Bild für " + sc.id);
    assert.ok(schildBild(sc.id, { beschriftung: "x" }).startsWith("<img "), "Bild ist kein <img> " + sc.id);
    for (const l of Object.keys(TEXTE)) for (const suffix of ["l", "m"]) assert.ok(TEXTE[l][sc.id + suffix] && TEXTE[l][sc.id + suffix].trim(), l + " " + sc.id + suffix);
    assert.ok(/^\d{3}(\.\d)?$/.test(sc.nr), "Zeichennummer " + sc.nr);
  }
});
await pruefe("Alle Verkehrszeichen sind AMTLICHE Bilddateien (nichts nachgezeichnet): vorhanden, gültiges SVG, ohne Skripte/externe Verweise, in QUELLEN.md genannt", async () => {
  const ordner = join(hier, "../../verkehr/vorfahrt-zeichen");
  const quellen = readFileSync(join(ordner, "QUELLEN.md"), "utf8");
  assert.ok(SCHILD_DATEIEN.length >= 19, "zu wenige Bilder: " + SCHILD_DATEIEN.length);
  for (const f of SCHILD_DATEIEN) {
    const pfad = join(ordner, f);
    assert.ok(existsSync(pfad), "Datei fehlt: " + f);
    const t = readFileSync(pfad, "utf8");
    assert.ok(/<svg[\s>]/.test(t) && t.trim().endsWith("</svg>"), "kein vollständiges SVG: " + f);
    assert.ok(t.length > 800 && t.length < 200_000, "Größe " + f + " " + t.length);
    assert.ok(!/<script|onload\s*=|<foreignObject|javascript:/i.test(t), "gefährlicher Inhalt in " + f);
    assert.ok(!/(?:xlink:)?href\s*=\s*["']https?:/i.test(t), "externer Verweis in " + f);
    assert.ok(quellen.includes(f), "nicht in QUELLEN.md: " + f);
  }
  // keine Reste von selbst Gezeichnetem: schilder.js liefert nur <img>
  for (const id of SCHILD_IDS) assert.ok(schildBild(id, {}).startsWith("<img "), id);
  assert.ok(zeichen282("x").includes("z282.svg"));
  for (const v of TEMPO_ZAHLEN) assert.ok(zeichen274(v, "x").includes("z274-" + v + ".svg"));
  assert.throws(() => zeichen274(70, "x"), /kein Bild/);
  assert.ok(REGELN.LIMITS.every((v) => TEMPO_ZAHLEN.includes(v)), "Tempo-Sprint braucht für jedes Schild ein Bild");
});
await pruefe("Karten: 12 Stück, je Schild genau eine Schild-Karte und eine Text-Karte, 6 verschiedene Paare, gemischt", async () => {
  const zufall = zufallsquelle(7);
  const verschieden = new Set();
  for (let i = 0; i < 300; i++) {
    const ks = neueKarten(zufall);
    assert.equal(ks.length, 2 * PAARE);
    const nachPaar = {};
    ks.forEach((c, idx) => { assert.equal(c.i, idx); (nachPaar[c.paar] = nachPaar[c.paar] || []).push(c.art); });
    assert.equal(Object.keys(nachPaar).length, PAARE);
    for (const arten of Object.values(nachPaar)) assert.deepEqual(arten.slice().sort(), ["schild", "text"]);
    verschieden.add(kette(ks.map((c) => c.paar + c.art)));
  }
  assert.ok(verschieden.size > 250, "kaum gemischt: " + verschieden.size);
  const alle = new Set(); for (let i = 0; i < 200; i++) neueKarten(zufall).forEach((c) => alle.add(c.paar)); assert.equal(alle.size, 14, "nicht alle Schilder kommen vor");
  const p = mischen([1, 2, 3, 4, 5, 6, 7], zufall); assert.deepEqual(p.slice().sort(), [1, 2, 3, 4, 5, 6, 7]);
});
await pruefe("Treffer: nur Schild + passender Text; zwei Schilder, zwei Texte, dieselbe Karte und verschiedene Paare passen nicht", async () => {
  const a = { paar: "z205", art: "schild" }, b = { paar: "z205", art: "text" }, c = { paar: "z206", art: "text" }, d = { paar: "z205", art: "schild" };
  assert.equal(passen(a, b), true); assert.equal(passen(b, a), true);
  assert.equal(passen(a, c), false); assert.equal(passen(a, d), false); assert.equal(passen(a, a), false); assert.equal(passen(b, { paar: "z205", art: "text" }), false);
});

console.log("Schilder-Memory: Server");
warte(700_000);
const memRunde = async (token = "tok-a") => { const s = await rufe({ session_token: token, aktion: "start", spiel: "memory" }); assert.equal(s.ok, true); return s.runde; };
const memErg = (runde, wert, zuege, fehler, token = "tok-a") => rufe({ session_token: token, aktion: "ergebnis", runde, wert, ...(zuege === undefined ? {} : { zuege }), ...(fehler === undefined ? {} : { fehler }) });
let mr;
await pruefe("start memory liefert Runden-ID; sofort melden -> zu_schnell (Wert ist eine Zeit)", async () => {
  mr = await memRunde(); const r = await memErg(mr, 20_000, 8, 2); assert.equal(r.status, 400); assert.equal(r.error, "zu_schnell");
});
await pruefe("zuege/fehler: fehlen, falscher Typ, zuege != 6 + fehler, negativ", async () => {
  warte(30_000);
  for (const [z, f, fehler] of [[undefined, 2, "zuege_ungueltig"], [8, undefined, "zuege_ungueltig"], ["8", 2, "zuege_ungueltig"], [8, 2.5, "zuege_ungueltig"], [8, -1, "zuege_ungueltig"], [8, 501, "zuege_ungueltig"], [9, 2, "zuege_passen_nicht"], [7, 2, "zuege_passen_nicht"], [6, 2, "zuege_passen_nicht"]]) {
    const r = await memErg(mr, 20_000, z, f); assert.equal(r.status, 400, [z, f].join()); assert.equal(r.error, fehler, [z, f].join());
  }
});
await pruefe("Zeit zu kurz für die Züge (je Zug 100 ms, je Fehlversuch 900 ms) -> zu_schnell_fuer_zuege; genau an der Grenze ok", async () => {
  const r = await memErg(mr, 4_599, 10, 4); assert.equal(r.error, "zu_schnell_fuer_zuege");   // 10*100 + 4*900 = 4600
  const ok = await memErg(mr, 4_600, 10, 4); assert.equal(ok.ok, true, JSON.stringify(ok)); assert.equal(ok.rekord, true);
});
await pruefe("Wert unter 1500 ms oder über 30 min -> wert_ausserhalb", async () => {
  const r2 = await memRunde(); warte(30_000);
  assert.equal((await memErg(r2, 1_499, 6, 0)).error, "wert_ausserhalb"); assert.equal((await memErg(r2, 1_800_001, 6, 0)).error, "wert_ausserhalb");
});
await pruefe("Ranking: kleinere Zeit ist besser (aufsteigend); schlechtere Zeit ist kein Rekord", async () => {
  const r2 = await memRunde(); warte(40_000);
  const a = await memErg(r2, 30_000, 8, 2); assert.equal(a.rekord, false); assert.equal(a.bestwert, 4_600);
  const r3 = await memRunde(); warte(40_000);
  const b = await memErg(r3, 3_000, 6, 0); assert.equal(b.rekord, true); assert.equal(b.bestwert, 3_000);
  const bb = await memRunde("tok-b"); warte(40_000);
  assert.equal((await memErg(bb, 9_000, 7, 1, "tok-b")).platz, 2);
  const liste = await rufe({ session_token: "tok-a", aktion: "rangliste", spiel: "memory" });
  assert.deepEqual(liste.top.map((z) => z.wert), [3_000, 9_000]);
});
await pruefe("Memory darf lange dauern: nach 20 min noch gültig, nach über 40 min nicht (Tempo/Ampel bleiben bei 2 min)", async () => {
  const lang = await memRunde(); warte(1_200_000);
  assert.equal((await memErg(lang, 1_000_000, 8, 2)).ok, true);
  const zulang = await memRunde(); warte(2_500_000);
  assert.equal((await memErg(zulang, 50_000, 8, 2)).error, "runde_abgelaufen");
});

/* ===================== Spiel 4: Rechts vor Links ===================== */
console.log("Rechts vor Links: Regeln (reine Rechnung)");
const auto = (arm, richtung) => ({ arm, richtung });
const frei = (...autos) => V.freieAutos(autos).map((c) => c.arm).sort();
await pruefe("Zahlen im Server = Zahlen im Spiel (10 Aufgaben, 100–150 Punkte)", async () => {
  const q = readFileSync(join(hier, "academy-spiele.ts"), "utf8");
  const m = q.match(/const VORFAHRT = \{ AUFGABEN: (\d+), MIN_PUNKTE: (\d+), MAX_PUNKTE: (\d+) \};/);
  assert.ok(m, "VORFAHRT-Zeile nicht gefunden");
  assert.deepEqual([+m[1], +m[2], +m[3]], [V.ANZAHL_AUFGABEN, V.punkteFuer(V.BONUS_MS), V.punkteFuer(0)]);
});
await pruefe("Punkte: sofort 150, nach 4 s 125, ab 8 s 100, nie unter 100", async () => {
  assert.equal(V.punkteFuer(0), 150); assert.equal(V.punkteFuer(4_000), 125); assert.equal(V.punkteFuer(8_000), 100); assert.equal(V.punkteFuer(15_000), 100); assert.equal(V.punkteFuer(1_000), 144);
});
await pruefe("Grundfälle von Hand (Arme: 0 unten, 1 links, 2 oben, 3 rechts): rechts vor links, Linksabbieger, Zusammenführung", async () => {
  // rechts vor links: das Auto von rechts fährt zuerst
  assert.deepEqual(frei(auto(0, "gerade"), auto(3, "gerade")), [3], "unten gerade / rechts gerade: rechts zuerst");
  assert.deepEqual(frei(auto(0, "gerade"), auto(1, "gerade")), [0], "unten gerade / links gerade: unten (von rechts gesehen vom linken Auto) zuerst");
  assert.deepEqual(frei(auto(2, "gerade"), auto(1, "gerade")), [1], "oben / links: links ist rechts von oben");
  assert.deepEqual(frei(auto(1, "gerade"), auto(2, "gerade")), [1]);
  // Gegenverkehr geradeaus: kein Konflikt, beide frei
  assert.deepEqual(frei(auto(0, "gerade"), auto(2, "gerade")), [0, 2]);
  // Linksabbieger lässt Gegenverkehr durch (geradeaus oder rechts)
  assert.deepEqual(frei(auto(0, "links"), auto(2, "gerade")), [2]);
  assert.deepEqual(frei(auto(0, "links"), auto(2, "rechts")), [2], "gleiche Ausfahrt, Linksabbieger wartet");
  assert.deepEqual(frei(auto(2, "links"), auto(0, "gerade")), [0]);
  assert.deepEqual(frei(auto(1, "links"), auto(3, "gerade")), [3]);
  // zwei entgegenkommende Linksabbieger behindern sich nicht
  assert.deepEqual(frei(auto(0, "links"), auto(2, "links")), [0, 2]);
  // Rechtsabbieger und das Auto von rechts, das geradeaus fährt: kein Konflikt
  assert.deepEqual(frei(auto(0, "rechts"), auto(3, "gerade")), [0, 3]);
  // von rechts biegt rechts in dieselbe Ausfahrt wie mein Geradeausweg: das Auto von rechts hat Vorrang
  assert.deepEqual(frei(auto(0, "gerade"), auto(3, "rechts")), [3]);
  // von rechts biegt links ab und kreuzt meinen Weg: Vorrang für das Auto von rechts
  assert.deepEqual(frei(auto(0, "gerade"), auto(3, "links")), [3]);
  // mein Linksabbiegen in dieselbe Ausfahrt wie ein Auto von rechts, das geradeaus fährt (rechts, Ausfahrt oben/unten …)
  assert.deepEqual(frei(auto(0, "gerade"), auto(1, "links")), [0], "links biegt links ab und mündet in meine Ausfahrt: ich (von rechts) zuerst");
  // links-rechts-Mischungen
  assert.deepEqual(frei(auto(0, "gerade"), auto(1, "gerade"), auto(2, "gerade")), [0], "drei Autos: nur unten ist frei");
  // alle vier geradeaus: niemand ist frei (Vorfahrt nicht geklärt)
  assert.deepEqual(frei(auto(0, "gerade"), auto(1, "gerade"), auto(2, "gerade"), auto(3, "gerade")), []);
  // ein Auto allein ist immer frei
  for (let a = 0; a < 4; a++) for (const r of V.RICHTUNGEN) assert.deepEqual(frei(auto(a, r)), [a]);
});
await pruefe("Wege: Ausfahrten und Konflikte stimmen mit der Geometrie (alle 12 Wege gegen alle)", async () => {
  assert.equal(V.ausfahrt(0, "gerade"), 2); assert.equal(V.ausfahrt(0, "rechts"), 3); assert.equal(V.ausfahrt(0, "links"), 1);
  assert.equal(V.ausfahrt(3, "rechts"), 2); assert.equal(V.ausfahrt(3, "links"), 0); assert.equal(V.ausfahrt(1, "links"), 2);
  // Drehung: das Konfliktbild ist für jede Drehung um 90° gleich
  for (let a = 0; a < 4; a++) for (const ra of V.RICHTUNGEN) for (let b = 0; b < 4; b++) for (const rb of V.RICHTUNGEN) {
    if (a === b) continue;
    const k0 = V.konflikt(auto(a, ra), auto(b, rb));
    for (let d = 1; d < 4; d++) assert.equal(V.konflikt(auto((a + d) % 4, ra), auto((b + d) % 4, rb)), k0, "Drehung " + a + ra + " " + b + rb);
    assert.equal(V.konflikt(auto(a, ra), auto(b, rb)), V.konflikt(auto(b, rb), auto(a, ra)), "Konflikt ist symmetrisch");
    // genau eines von beiden hat Vorrang (oder keins, bei zwei Linksabbiegern gegenüber, die nicht im Konflikt stehen)
    if (k0) assert.ok(V.vorrang(auto(a, ra), auto(b, rb)) !== V.vorrang(auto(b, rb), auto(a, ra)), "Vorrang eindeutig " + a + ra + " " + b + rb);
  }
  // typische Nicht-Konflikte
  assert.equal(V.konflikt(auto(0, "gerade"), auto(2, "gerade")), false);
  assert.equal(V.konflikt(auto(0, "links"), auto(2, "links")), false);
  assert.equal(V.konflikt(auto(0, "rechts"), auto(3, "gerade")), false);
  assert.equal(V.konflikt(auto(0, "rechts"), auto(1, "gerade")), true, "gleiche Ausfahrt (rechts)");
});
await pruefe("alle 256 Kreuzungen: Drehen ändert nichts an der Zahl der freien Autos; keine Kreuzung ohne freies Auto außer dem Kreis aus Wartenden", async () => {
  const optionen = [null, ...V.RICHTUNGEN];
  let ohneFrei = 0, einFrei = 0, mehr = 0;
  for (let n = 0; n < 256; n++) {
    const autos = [];
    for (let arm = 0; arm < 4; arm++) { const o = optionen[Math.floor(n / Math.pow(4, arm)) % 4]; if (o) autos.push(auto(arm, o)); }
    if (!autos.length) continue;
    const f = V.freieAutos(autos).length;
    for (let d = 1; d < 4; d++) assert.equal(V.freieAutos(autos.map((c) => auto((c.arm + d) % 4, c.richtung))).length, f);
    if (f === 0) ohneFrei++; else if (f === 1) einFrei++; else mehr++;
  }
  assert.ok(einFrei > 60 && mehr > 20 && ohneFrei >= 1, [ohneFrei, einFrei, mehr].join("/"));
});
await pruefe("Aufgaben: genau EIN Auto darf zuerst, Gründe passen, 10 Aufgaben mit steigender Schwierigkeit, beide Regeln kommen vor", async () => {
  const zufall = zufallsquelle(42);
  let nGegen = 0, nRechts = 0, nFrei = 0;
  for (let i = 0; i < 400; i++) {
    const satz = V.aufgabenSatz(zufall);
    assert.equal(satz.length, V.ANZAHL_AUFGABEN);
    assert.deepEqual(satz.map((a) => a.autos.length), [2, 2, 2, 3, 3, 3, 3, 4, 4, 4]);
    satz.forEach((a, j) => {
      const fr = V.freieAutos(a.autos); assert.equal(fr.length, 1, "genau ein freies Auto");
      assert.equal(fr[0], a.sieger); assert.ok(a.autos.includes(a.sieger));
      assert.equal(new Set(a.autos.map((c) => c.arm)).size, a.autos.length, "ein Auto je Arm");
      assert.ok(["frei", "rechts", "gegen"].includes(a.grund));
      for (const c of a.autos) if (c !== a.sieger) { assert.ok(V.grundWarten(a.autos, c), "jedes wartende Auto hat einen Grund"); assert.ok(["rechts", "gegen"].includes(V.grundWarten(a.autos, c))); }
      if (j > 0) assert.notEqual(V.schluessel(a.autos), V.schluessel(satz[j - 1].autos), "keine Aufgabe zweimal hintereinander");
      if (a.grund === "gegen") nGegen++; else if (a.grund === "rechts") nRechts++; else nFrei++;
    });
    assert.ok(satz.filter((a) => V.hatGegenverkehrKonflikt(a.autos)).length >= 2);
    assert.ok(satz.filter((a) => a.grund === "rechts").length >= 3);
  }
  assert.ok(nGegen > 100 && nRechts > 600 && nFrei > 20, [nGegen, nRechts, nFrei].join("/"));
});
await pruefe("Texte: alle Regel-Erklärungen und Beschriftungen in allen 18 Sprachen vorhanden, Platzhalter stimmen", async () => {
  const schluessel = ["vorName", "vorKurz", "vorBereit", "vorKeineSchilder", "vorFrage", "vorAufgabe", "vorRichtig", "vorFalsch", "vorZeitAus", "vorWeiter", "vorErgebnisZeigen", "vorPunkte", "vorRichtigVon", "vorBestwert", "vorNeu", "vorHinweis",
    "vorGFrei", "vorGRechts", "vorGGegen", "vorWRechts", "vorWGegen", "vorGerade", "vorRechtsAb", "vorLinksAb", "vorPosUnten", "vorPosLinks", "vorPosOben", "vorPosRechts", "vorAuto"];
  for (const l of Object.keys(TEXTE)) for (const k of schluessel) assert.ok(TEXTE[l][k] && TEXTE[l][k].trim(), l + " " + k);
  for (const l of Object.keys(TEXTE)) { assert.ok(/\{pos\}/.test(TEXTE[l].vorAuto) && /\{richtung\}/.test(TEXTE[l].vorAuto), l + " vorAuto"); assert.ok(/\{n\}/.test(TEXTE[l].vorAufgabe) && /\{m\}/.test(TEXTE[l].vorAufgabe), l + " vorAufgabe"); }
});

console.log("Rechts vor Links: Server");
warte(700_000);
const vorRunde = async (token = "tok-a") => { const s = await rufe({ session_token: token, aktion: "start", spiel: "vorfahrt" }); assert.equal(s.ok, true); return s.runde; };
const vorErg = (runde, wert, richtig, token = "tok-a") => rufe({ session_token: token, aktion: "ergebnis", runde, wert, ...(richtig === undefined ? {} : { richtig }) });
let vr;
await pruefe("start vorfahrt; nach 4 s zu früh (10 Aufgaben brauchen mindestens 5 s), nach 5 s möglich", async () => {
  vr = await vorRunde(); warte(4_000);
  assert.equal((await vorErg(vr, 1_000, 8)).error, "zu_schnell"); warte(1_000);
  const r = await vorErg(vr, 1_000, 8); assert.equal(r.ok, true, JSON.stringify(r)); assert.equal(r.rekord, true); assert.equal(r.platz, 1);
});
await pruefe("richtig: fehlt / falsch / über 10 -> richtig_ungueltig; Punkte passen nicht zu richtig -> punkte_passen_nicht", async () => {
  const r2 = await vorRunde(); warte(6_000);
  for (const z of [undefined, null, "8", 8.5, -1, 11]) assert.equal((await vorErg(r2, 1_000, z)).error, "richtig_ungueltig", String(z));
  for (const [w, z] of [[799, 8], [1_201, 8], [10, 0], [101, 0], [99, 1], [151, 1], [1_501, 10]]) assert.equal((await vorErg(r2, w, z)).error, w > 1_500 ? "wert_ausserhalb" : "punkte_passen_nicht", w + "/" + z);
  assert.equal((await vorErg(r2, 0, 0)).ok, true, "alles falsch = 0 Punkte ist ein gültiges Ergebnis");
});
await pruefe("Ranking: mehr Punkte sind besser (absteigend); schlechteres Ergebnis ändert den Bestwert nicht; Höchstwert 1500 geht", async () => {
  const r2 = await vorRunde(); warte(6_000);
  const a = await vorErg(r2, 900, 7); assert.equal(a.rekord, false); assert.equal(a.bestwert, 1_000);
  const r3 = await vorRunde(); warte(6_000);
  const b = await vorErg(r3, 1_500, 10); assert.equal(b.rekord, true); assert.equal(b.bestwert, 1_500);
  const bb = await vorRunde("tok-b"); warte(6_000);
  assert.equal((await vorErg(bb, 1_100, 9, "tok-b")).platz, 2);
  const liste = await rufe({ session_token: "tok-a", aktion: "rangliste", spiel: "vorfahrt" });
  assert.deepEqual(liste.top.map((z) => z.wert), [1_500, 1_100]);
});
await pruefe("Rechts vor Links darf länger als 2 Minuten dauern (Lesen der Regeln), aber höchstens 30 min", async () => {
  const lang = await vorRunde(); warte(600_000);
  assert.equal((await vorErg(lang, 1_000, 8)).ok, true);
  const zulang = await vorRunde(); warte(1_900_000);
  assert.equal((await vorErg(zulang, 1_000, 8)).error, "runde_abgelaufen");
});

console.log("Bremse und Profil");
await pruefe("mehr als 30 Runden in 10 Minuten -> 429 zu_viele_runden", async () => {
  warte(700_000); // Zähler der vorigen Runden verfällt
  let letzte;
  for (let i = 0; i < 31; i++) letzte = await rufe({ session_token: "tok-b", aktion: "start", spiel: "ampel" });
  assert.equal(letzte.status, 429); assert.equal(letzte.code, "zu_viele_runden");
});
await pruefe("Profil: sichtbar nur mit true/false", async () => {
  assert.equal((await rufe(A({ aktion: "profil", sichtbar: "ja" }))).status, 400);
  assert.equal((await rufe(A({ aktion: "profil", sichtbar: false }))).sichtbar, false);
  const u = await rufe(A({ aktion: "uebersicht" })); assert.equal(u.sichtbar, false); assert.equal(u.bestwerte.ampel, 210); assert.equal(u.anzeigename, "Vorname A."); // Vorname + erster Buchstabe des letzten Namensteils
});
await pruefe("Rangliste: Limit wird begrenzt, unbekanntes Spiel abgelehnt", async () => {
  assert.equal((await rufe(A({ aktion: "rangliste", spiel: "ampel", limit: 9999 }))).ok, true);
  assert.equal((await rufe(A({ aktion: "rangliste", spiel: "nix" }))).status, 400);
});
await pruefe("Fehler-Codes der Spiele melden nie ab", async () => {
  const abmeldeGruende = ["session_ungueltig", "session_abgelaufen", "zugang_gesperrt", "zugang_abgelaufen", "schule_pausiert"];
  for (const code of ["ergebnis_ungueltig", "eingabe_fehlt", "zu_viele_runden", "voruebergehend"]) assert.ok(!abmeldeGruende.includes(code));
});

console.log(`\n${ok} Prüfungen bestanden` + (process.exitCode ? " – ES GIBT FEHLER" : ""));
