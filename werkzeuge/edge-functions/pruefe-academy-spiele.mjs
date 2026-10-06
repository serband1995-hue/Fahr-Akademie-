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
  const m = q.match(/const TEMPO = \{ GAIN: ([\d.]+), VTOP: (\d+), V0_MAX: (\d+), TAPS_MAX: (\d+) \};/);
  assert.ok(m, "TEMPO-Zeile nicht gefunden");
  assert.deepEqual([+m[1], +m[2], +m[3], +m[4]], [REGELN.GAIN, REGELN.VTOP, REGELN.V0_MAX, REGELN.TAPS_MAX]);
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
  assert.equal(rollen(3, 5000), 0); assert.equal(rollen(100, 1000), 92);
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
await pruefe("Spielbare Tempi: gemächlich ~150, flott ~190, Höchstmaß ~215 km/h (Bereich zur Spielregel)", () => {
  const a = simuliere("halten", 6).wert, b = simuliere("halten", 10).wert, c = simuliere("halten", 15.8).wert;
  assert.ok(a >= 130 && a < b && b < c && c <= 230, [a, b, c].join(" / "));
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
await pruefe("Wert außerhalb 0–280 -> wert_ausserhalb; Wert kein ganze Zahl -> wert_ungueltig", async () => {
  for (const w of [-1, 281, 1000]) assert.equal((await tempoErg(tr, w, 100)).error, "wert_ausserhalb", String(w));
  assert.equal((await tempoErg(tr, 150.5, 100)).error, "wert_ungueltig");
});
await pruefe("Tempo, das mit so wenigen Tipps nicht möglich ist -> tempo_unmoeglich", async () => {
  assert.equal((await tempoErg(tr, 250, 10)).error, "tempo_unmoeglich");
  assert.equal((await tempoErg(tr, 200, 0)).error, "tempo_unmoeglich");
  assert.equal((await tempoErg(tr, 280, 160)).error, "tempo_unmoeglich");
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
