// Prüfung der Rechenlogik für die Prüfungstermine (Kompass-Export und Akademie-Abgleich). Aufruf: node --experimental-strip-types werkzeuge/edge-functions/pruefe-termine.mjs
import { termineBauen, mehrdeutigeNummern } from "./kompass-termine-export/termine.ts";
import { planeAbgleich, normalizeTelefon } from "./academy-kandidaten-sync/termine.ts";
let ok = 0, fehl = 0;
const t = (name, b, d) => { if (b) { ok++; } else { fehl++; console.log("FEHL " + name + (d ? " -> " + JSON.stringify(d) : "")); process.exitCode = 1; } };
const H = "2026-10-10";

// ---- Kompass-Export ----
const sch = [{ id: "a", telefon: "+49 170 1111111", status: "aktiv" }, { id: "b", telefon: "0171 2222222", status: "aktiv" }, { id: "c", telefon: "0172 3333333", status: "inaktiv" }, { id: "d", telefon: null, status: "aktiv" }, { id: "e", telefon: "0173 4444444", status: "aktiv" }];
let r = termineBauen([{ schueler_id: "a", datum: "2026-10-20" }, { schueler_id: "a", datum: "2026-10-15" }, { schueler_id: "b", datum: "2026-10-09" }, { schueler_id: "c", datum: "2026-10-21" }, { schueler_id: "d", datum: "2026-10-22" }, { schueler_id: "x", datum: "2026-10-23" }, { schueler_id: null, datum: "2026-10-24" }, { schueler_id: "e", datum: "kaputt" }], sch, H);
t("Export: nur aktiver Schüler mit Telefon und künftigem Termin, frühester gewinnt", r.length === 1 && r[0].telefon === "+49 170 1111111" && r[0].datum === "2026-10-15", r);
t("Export: Termin heute zählt noch", termineBauen([{ schueler_id: "b", datum: H }], sch, H).length === 1);
t("Export: nur Telefon und Datum, nichts sonst", Object.keys(r[0]).sort().join() === "datum,telefon");
t("Export: leere Eingabe gibt leere Liste", termineBauen([], [], H).length === 0);
// zwei Schüler, gleiche Nummer -> früheste
r = termineBauen([{ schueler_id: "a", datum: "2026-11-01" }, { schueler_id: "e", datum: "2026-10-12" }], [{ id: "a", telefon: "0170 1", status: "aktiv" }, { id: "e", telefon: "0170 1", status: "aktiv" }], H);
t("Export: gleiche Nummer, früheste gewinnt", r.length === 1 && r[0].datum === "2026-10-12", r);

// ---- Akademie-Abgleich ----
const S = (id, tel, pt) => ({ id, telefon: tel, pruefungstermin: pt });
let p = planeAbgleich([S("1", "01701111111", null), S("2", "01712222222", "2026-10-30"), S("3", "01723333333", "2026-10-20")], [{ telefon: "+49 170 1111111", datum: "2026-10-18" }, { telefon: "0171 2222222", datum: "2026-10-30" }], H);
t("Abgleich: neuer Termin wird gesetzt (Nummer +49 und 0 gleich)", p.setzen.length === 1 && p.setzen[0].id === "1" && p.setzen[0].datum === "2026-10-18", p);
t("Abgleich: gleicher Termin bleibt unberührt", !p.setzen.some((z) => z.id === "2"));
t("Abgleich: künftiger Termin, der im Kompass fehlt, wird entfernt", p.entfernen.length === 1 && p.entfernen[0] === "3" && !p.entfernenGebremst, p);
p = planeAbgleich([S("1", "01701111111", "2026-10-05")], [], H);
t("Abgleich: vergangener Termin bleibt", p.entfernen.length === 0 && p.setzen.length === 0, p);
p = planeAbgleich([S("1", "01701111111", "2026-10-12")], [{ telefon: "01701111111", datum: "2026-10-20" }], H);
t("Abgleich: geänderter Termin wird neu gesetzt", p.setzen.length === 1 && p.setzen[0].datum === "2026-10-20");
// Bremse
const viele = [1, 2, 3, 4, 5, 6].map((i) => S("s" + i, "01700000" + i + "00", "2026-11-0" + i));
p = planeAbgleich(viele, [], H);
t("Abgleich: leerer Export entfernt nicht alles (Bremse)", p.entfernen.length === 0 && p.entfernenGebremst, p);
p = planeAbgleich(viele, [1, 2, 3, 4].map((i) => ({ telefon: "01700000" + i + "00", datum: "2026-11-0" + i })), H);
t("Abgleich: 2 von 6 weg ist erlaubt", p.entfernen.length === 2 && !p.entfernenGebremst, p);
// ungültige Zeilen
p = planeAbgleich([S("1", "01701111111", null)], [{ telefon: "abc", datum: "2026-10-18" }, { telefon: "01701111111", datum: "morgen" }, null, {}], H);
t("Abgleich: ungültige Zeilen werden verworfen, nichts gesetzt", p.setzen.length === 0 && p.ungueltig === 4, p);
t("Telefon: +49, 0049, Leerzeichen, Bindestriche", normalizeTelefon("+49 170-111/1111") === "01701111111" && normalizeTelefon("0049170111") === "0170111");
// Geschwister
p = planeAbgleich([S("1", "01701111111", null), S("2", "0170 1111111", null), S("3", "01712222222", null)], [{ telefon: "01701111111", datum: "2026-10-18" }, { telefon: "01712222222", datum: "2026-10-19" }], H);
t("Abgleich: gleiche Nummer bei zwei Akademie-Schülern wird übersprungen", p.setzen.length === 1 && p.setzen[0].id === "3" && p.mehrdeutig === 2, p);
t("Telefon: +49 (0)171 und Punkte", normalizeTelefon("+49 (0)171 222.2222") === "01712222222", normalizeTelefon("+49 (0)171 222.2222"));
// leerer Export bei künftigem Termin: nicht entfernen
p = planeAbgleich([S("1", "01701111111", "2026-10-30")], [], H);
t("Abgleich: leerer Export entfernt auch einen einzelnen künftigen Termin nicht", p.entfernen.length === 0 && p.entfernenGebremst, p);
// Kompass: Geschwister
const dup = [{ id: "a", telefon: "0170 111", status: "aktiv" }, { id: "b", telefon: "0170111", status: "aktiv" }, { id: "c", telefon: "0171 5", status: "aktiv" }];
const mz = mehrdeutigeNummern(dup);
t("Export: Nummer mit zwei aktiven Schülern ist mehrdeutig", mz.has("0170111") && !mz.has("01715"), Array.from(mz));
t("Export: mehrdeutige Nummer wird nicht ausgeliefert", termineBauen([{ schueler_id: "a", datum: "2026-10-20" }, { schueler_id: "c", datum: "2026-10-21" }], dup, H, mz).length === 1);
console.log(ok + " bestanden, " + fehl + " Befunde");
