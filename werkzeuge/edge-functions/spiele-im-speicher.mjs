// Unterbau für die Prüfungen der Edge Function academy-spiele (06.10.2026): lädt die ECHTE Function-Datei und
// lässt sie gegen eine kleine Datenbank im Speicher laufen. Genutzt von pruefe-academy-spiele.mjs (Logik)
// und von der Browser-Prüfung (der Browser bekommt Antworten dieser Function).
// Warum nicht gegen die echte Datenbank: Ein Testschüler dort würde über Trigger das unveränderliche
// Verkaufsbuch (academy_verkaeufe) beschreiben -- das lässt sich nicht zurücknehmen.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const hier = dirname(fileURLToPath(import.meta.url));
export let zeitVersatz = 0;
const echtJetzt = Date.now.bind(Date);
Date.now = () => echtJetzt() + zeitVersatz;
export const jetzt = () => new Date(Date.now()).toISOString();
export const warte = (ms) => { zeitVersatz += ms; };

// ---- Datenbank im Speicher ----
export const db = {
  academy_sessions: [], academy_schueler: [], academy_schulen: [],
  academy_spiele_runden: [], academy_spiele_bestwerte: [], academy_spiele_profil: [],
};
let zaehler = 0;
const uuid = () => { zaehler++; return "00000000-0000-4000-8000-" + String(zaehler).padStart(12, "0"); };
const passt = (z, f) => f.every((x) => x.op === "eq" ? z[x.k] === x.v : x.op === "lt" ? z[x.k] < x.v : z[x.k] > x.v);
const pick = (z, cols) => cols === "*" || !cols ? { ...z } : Object.fromEntries(cols.split(",").map((c) => c.trim()).map((c) => [c, z[c]]));

class Q {
  constructor(t) { this.t = t; this.modus = "select"; this.f = []; this.cols = "*"; this.opt = {}; this.einzeln = false; this.vielleicht = false; this.mit = null; }
  select(c, o) { if (this.modus === "select" || this.modus === "update" || this.modus === "insert") { this.cols = c || "*"; this.opt = o || {}; this.ret = true; } return this; }
  eq(k, v) { this.f.push({ op: "eq", k, v }); return this; }
  lt(k, v) { this.f.push({ op: "lt", k, v: String(v) }); return this; }
  gt(k, v) { this.f.push({ op: "gt", k, v: String(v) }); return this; }
  insert(o) { this.modus = "insert"; this.mit = o; return this; }
  update(o) { this.modus = "update"; this.mit = o; return this; }
  upsert(o) { this.modus = "upsert"; this.mit = o; return this; }
  delete() { this.modus = "delete"; return this; }
  single() { this.einzeln = true; return this; }
  maybeSingle() { this.vielleicht = true; return this; }
  then(ok, fehl) { try { ok(this.run()); } catch (e) { fehl && fehl(e); } }
  run() {
    const tab = db[this.t];
    const treffer = () => tab.filter((z) => passt(z, this.f));
    if (this.modus === "insert") {
      const z = { id: this.t === "academy_spiele_runden" ? uuid() : undefined, benutzt: false, gestartet_am: jetzt(), ...this.mit };
      tab.push(z);
      return this.einzeln ? { data: pick(z, this.cols), error: null } : { data: [pick(z, this.cols)], error: null };
    }
    if (this.modus === "upsert") {
      const schluessel = this.t === "academy_spiele_bestwerte" ? ["schueler_id", "spiel"] : ["schueler_id"];
      const vorhanden = tab.find((z) => schluessel.every((k) => z[k] === this.mit[k]));
      if (vorhanden) Object.assign(vorhanden, this.mit); else tab.push({ ...this.mit });
      return { data: null, error: null };
    }
    if (this.modus === "update") {
      const t = treffer(); t.forEach((z) => Object.assign(z, this.mit));
      return { data: this.ret ? t.map((z) => pick(z, this.cols)) : null, error: null };
    }
    if (this.modus === "delete") { db[this.t] = tab.filter((z) => !passt(z, this.f)); return { data: null, error: null }; }
    const t = treffer();
    if (this.opt.count) return { count: t.length, data: null, error: null };
    if (this.vielleicht) return { data: t[0] ? pick(t[0], this.cols) : null, error: null };
    return { data: t.map((z) => pick(z, this.cols)), error: null };
  }
}
// Anzeigename wie in SQL academy_spiele_anzeigename: Vorname + erster Buchstabe des letzten Namensteils
const anzeigename = (name) => {
  const w = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (w.length >= 2) return w[0].slice(0, 15) + " " + Array.from(w[w.length - 1])[0].toUpperCase() + ".";
  return (w[0] || "").slice(0, 15) || "Spieler";
};
const fakeClient = {
  from: (t) => new Q(t),
  rpc: async (name, a) => {
    if (name === "academy_spiele_anzeigename") return { data: anzeigename(a.p_name), error: null };
    if (name === "academy_spiele_rangliste") {
      // wie die SQL-Funktion: nur sichtbare, aktive, nicht archivierte; Gleichstand -> wer zuerst da war
      const sicht = db.academy_spiele_bestwerte
        .filter((b) => b.spiel === a.p_spiel)
        .filter((b) => { const p = db.academy_spiele_profil.find((x) => x.schueler_id === b.schueler_id); return !p || p.sichtbar !== false; })
        .map((b) => ({ b, s: db.academy_schueler.find((x) => x.id === b.schueler_id) }))
        .filter((x) => x.s && x.s.aktiv && !x.s.archiviert_am)
        .sort((x, y) => (a.p_aufsteigend ? x.b.wert - y.b.wert : y.b.wert - x.b.wert) || String(x.b.erreicht_am).localeCompare(String(y.b.erreicht_am)))
        .map((x, i) => ({ platz: i + 1, name: anzeigename(x.s.name), wert: x.b.wert, id: x.s.id }));
      const limit = Math.min(Math.max(a.p_limit || 10, 1), 50);
      const ich = sicht.find((r) => r.id === a.p_ich);
      return { data: { top: sicht.filter((r) => r.platz <= limit).map((r) => ({ platz: r.platz, name: r.name, wert: r.wert, ich: r.id === a.p_ich })), ich: ich ? { platz: ich.platz, wert: ich.wert } : null, gesamt: sicht.length }, error: null };
    }
    return { data: null, error: { message: "unbekannt" } };
  },
};

// ---- Function laden (Deno-Teile ersetzen) ----
let quelle = readFileSync(join(hier, "academy-spiele.ts"), "utf8");
quelle = quelle.replace(/import \{ createClient \} from "[^"]+";/, "const createClient = globalThis.__createClient;");
globalThis.__createClient = () => fakeClient;
globalThis.Deno = { env: { get: () => "x" }, serve: (h) => { globalThis.__handler = h; } };
const tmp = join(mkdtempSync(join(tmpdir(), "spiele-")), "fn.ts");
writeFileSync(tmp, quelle);
await import(tmp);

export const rufe = async (body) => {
  const res = await globalThis.__handler(new Request("http://x/", { method: "POST", body: JSON.stringify(body) }));
  return { status: res.status, ...(await res.json()) };
};

