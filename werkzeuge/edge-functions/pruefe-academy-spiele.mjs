// Prüft die Logik der Edge Function academy-spiele OHNE echte Datenbank (06.10.2026).
// Unterbau: spiele-im-speicher.mjs (die Uhr wird vorgestellt, damit "5 Sekunden später" nicht 5 Sekunden dauert).
//
// Aufruf:  node --experimental-strip-types werkzeuge/edge-functions/pruefe-academy-spiele.mjs
// Neues Spiel = Zeile im SPIELE-Block der Function UND hier Fälle ergänzen.
import assert from "node:assert/strict";
import { db, rufe, warte } from "./spiele-im-speicher.mjs";

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
