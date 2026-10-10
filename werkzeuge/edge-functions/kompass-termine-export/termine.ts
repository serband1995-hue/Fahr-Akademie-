// Reine Rechenlogik (ohne Datenbank), damit sie getestet werden kann: werkzeuge/edge-functions/pruefe-termine.mjs
// Aus den kommenden, geplanten Praxisprüfungen und den aktiven Schülern wird je Telefonnummer der FRÜHESTE Termin.
export type Pruefung = { schueler_id: string | null; datum: string };
export type Schueler = { id: string; telefon: string | null; status: string | null };

export function berlinHeute(jetzt = new Date()): string {
  // sv-SE liefert JJJJ-MM-TT
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(jetzt);
}

export function termineBauen(pruefungen: Pruefung[], schueler: Schueler[], heute: string): { telefon: string; datum: string }[] {
  const nachId = new Map<string, Schueler>();
  schueler.forEach((s) => { if (s && s.id) nachId.set(String(s.id), s); });
  const frueh = new Map<string, string>();
  for (const p of pruefungen) {
    if (!p || !p.schueler_id || !/^\d{4}-\d{2}-\d{2}$/.test(String(p.datum))) continue;
    if (String(p.datum) < heute) continue;
    const s = nachId.get(String(p.schueler_id));
    if (!s || s.status !== "aktiv") continue;
    const tel = String(s.telefon || "").trim();
    if (!tel) continue;
    const alt = frueh.get(tel);
    if (!alt || p.datum < alt) frueh.set(tel, p.datum);
  }
  return Array.from(frueh.entries()).map(([telefon, datum]) => ({ telefon, datum }));
}
