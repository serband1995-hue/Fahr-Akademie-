// Reine Rechenlogik für den Abgleich der Prüfungstermine (ohne Datenbank, testbar mit werkzeuge/edge-functions/pruefe-termine.mjs).
export function normalizeTelefon(raw: string): string {
  // "+49 (0)171 ..." -> "(0)" streichen; Klammern, Punkte, Leerzeichen, Bindestriche, Schrägstriche entfernen
  let t = (raw || "").replace(/\(0\)/g, "").replace(/[\s\-\/().]/g, "");
  if (t.startsWith("+49")) t = "0" + t.slice(3);
  else if (t.startsWith("0049")) t = "0" + t.slice(4);
  return t;
}
export function telefonPlausibel(t: string): boolean { return /^0\d{6,14}$/.test(t); }

export type SchuelerZeile = { id: string; telefon: string | null; pruefungstermin: string | null };
export type Kompasstermin = { telefon: unknown; datum: unknown };
export type Plan = { setzen: { id: string; datum: string }[]; entfernen: string[]; entfernenGebremst: boolean; ungueltig: number; mehrdeutig: number };

export function berlinHeute(jetzt = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(jetzt);
}

/*
  Plan: Der Kompass ist die Quelle. Je Telefonnummer gilt der früheste Termin aus dem Export.
  - Termin neu oder geändert  -> setzen (dabei wird die Erinnerung zurückgesetzt, siehe index.ts)
  - Schüler hat einen KÜNFTIGEN Termin, der Kompass nicht mehr (abgesagt, verschoben auf "ohne") -> entfernen
  - vergangene Termine bleiben unberührt (die App blendet sie aus)
  - Bremse: würden mehr als die Hälfte (mindestens 3) der künftigen Termine auf einmal verschwinden, ODER liefert der Export gar keinen
    Termin, obwohl es künftige gibt, wird NICHT entfernt (Schutz vor einem leeren oder fehlerhaften Export).
  - Mehrdeutig: kommt dieselbe Telefonnummer bei mehreren Akademie-Schülern vor (Geschwister, Familie), wird nichts gesetzt und nichts
    entfernt -- sonst bekäme der falsche Schüler den Countdown und die Erinnerung.
*/
export function planeAbgleich(schueler: SchuelerZeile[], termine: Kompasstermin[], heute: string): Plan {
  const nachTel = new Map<string, string>();
  let ungueltig = 0;
  for (const t of termine) {
    const tel = normalizeTelefon(String(t?.telefon ?? ""));
    const datum = String(t?.datum ?? "");
    if (!telefonPlausibel(tel) || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) { ungueltig++; continue; }
    const alt = nachTel.get(tel);
    if (!alt || datum < alt) nachTel.set(tel, datum);
  }
  const haeufigkeit = new Map<string, number>();
  for (const s of schueler) { const tl = normalizeTelefon(s.telefon || ""); if (tl) haeufigkeit.set(tl, (haeufigkeit.get(tl) || 0) + 1); }
  const setzen: { id: string; datum: string }[] = [];
  const kandidatenEntfernen: string[] = [];
  let kuenftige = 0, mehrdeutig = 0;
  for (const s of schueler) {
    const tel = normalizeTelefon(s.telefon || "");
    if (tel && (haeufigkeit.get(tel) || 0) > 1) { mehrdeutig++; continue; }
    const neu = nachTel.get(tel) ?? null;
    const alt = s.pruefungstermin || null;
    if (alt && alt >= heute) kuenftige++;
    if (neu && neu !== alt) setzen.push({ id: s.id, datum: neu });
    else if (!neu && alt && alt >= heute) kandidatenEntfernen.push(s.id);
  }
  const leererExport = nachTel.size === 0 && kandidatenEntfernen.length > 0;
  const gebremst = leererExport || (kandidatenEntfernen.length >= 3 && kandidatenEntfernen.length * 2 > kuenftige);
  return { setzen, entfernen: gebremst ? [] : kandidatenEntfernen, entfernenGebremst: gebremst, ungueltig, mehrdeutig };
}
