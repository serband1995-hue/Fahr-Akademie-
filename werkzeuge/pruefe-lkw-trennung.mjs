// Prüfskript Lkw-Bereich (11.10.2026): Trennung Pkw/Lkw auf dem ECHTEN Server.
// Node 22, nur fetch, keine Pakete. Schreibt selbst nichts in die Datenbank
// (academy-video-token vermerkt bei Freigabe wie immer "gesehen" für den Test-Schüler).
//
// Aufruf (Werte nur in der Umgebung, nie ins Repo):
//   SUPABASE_URL=https://fxgljvhpikjcejhghgbp.supabase.co ANON_KEY=… \
//   TOKEN_PKW=… TOKEN_LKW=… VIDEO_PKW=… VIDEO_LKW=… \
//   [ERWARTUNG_PKW=frei|gesperrt] [ERWARTUNG_LKW=frei|gesperrt] \
//   [TEL_PKW=… PIN_PKW=… TEL_LKW=… PIN_LKW=…] \
//   node werkzeuge/pruefe-lkw-trennung.mjs
//
// TOKEN_PKW = Session eines Schülers NUR mit Pkw-Zugang, TOKEN_LKW = NUR mit Lkw-Zugang.
// VIDEO_PKW / VIDEO_LKW = je ein live-Video mit nur Pkw- bzw. nur Lkw-Themen.
// ERWARTUNG_*: "frei" = eigenes Video muss ein Token liefern, "gesperrt" = muss
// vollzugang_erforderlich liefern. Ohne Angabe gilt beides als richtig.
// TEL_/PIN_: Login mit dem FALSCHEN Fahrzeug muss fahrzeug_falsch liefern. Diese Prüfung
// läuft zuletzt: auf einem alten Server-Stand würde der Login gelingen und die Session
// (TOKEN_*) des Test-Schülers ungültig machen.
// Exit-Code 1, sobald ein Prüfpunkt FEHLER ist.

const URL_BASIS = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const ANON = process.env.ANON_KEY || "";
const { TOKEN_PKW, TOKEN_LKW, VIDEO_PKW, VIDEO_LKW } = process.env;

const fehlt = ["SUPABASE_URL", "ANON_KEY", "TOKEN_PKW", "TOKEN_LKW", "VIDEO_PKW", "VIDEO_LKW"].filter((k) => !process.env[k]);
if (fehlt.length) {
  console.error("Fehlende Umgebungsvariablen: " + fehlt.join(", "));
  process.exit(2);
}
if (URL_BASIS.includes("oectrvkjunntzsggyhxv")) {
  console.error("Falsches Projekt (Fahrlehrer-Kompass). Abbruch.");
  process.exit(2);
}

let fehler = 0;
function pruef(name, ok, info) {
  if (ok) console.log("OK      " + name);
  else { fehler++; console.log("FEHLER  " + name + (info ? "  -> " + info : "")); }
}

async function rufe(fn, body) {
  const r = await fetch(URL_BASIS + "/functions/v1/" + fn, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: "Bearer " + ANON },
    body: JSON.stringify(body),
  });
  let daten = null;
  try { daten = await r.json(); } catch (_e) { daten = null; }
  return { status: r.status, daten: daten || {} };
}
const kurz = (a) => "HTTP " + a.status + " " + JSON.stringify(a.daten).slice(0, 160);

async function eigenesVideo(name, token, video, erwartung) {
  const a = await rufe("academy-video-token", { session_token: token, video_id: video });
  const frei = a.status === 200 && !!a.daten.token;
  const gesperrt = a.status === 402 && a.daten.code === "vollzugang_erforderlich";
  if (erwartung === "frei") pruef(name + ": eigenes Video frei (Token)", frei, kurz(a));
  else if (erwartung === "gesperrt") pruef(name + ": eigenes Video -> vollzugang_erforderlich", gesperrt, kurz(a));
  else pruef(name + ": eigenes Video Token oder vollzugang_erforderlich", frei || gesperrt, kurz(a));
}

async function fremdesVideo(name, token, video) {
  const a = await rufe("academy-video-token", { session_token: token, video_id: video });
  pruef(name + ": fremdes Video -> fahrzeug_nicht_freigegeben", a.status === 403 && a.daten.code === "fahrzeug_nicht_freigegeben", kurz(a));
  pruef(name + ": fremdes Video ohne bunny_video_id", !a.daten.bunny_video_id && !a.daten.token, kurz(a));
}

async function katalog(name, token, fz, eigenesVideo, fremdesVideo) {
  const a = await rufe("academy-katalog", { session_token: token, sprache: "de" });
  if (a.status !== 200 || !a.daten.ok) { pruef(name + ": Katalog laden", false, kurz(a)); return; }
  const d = a.daten;
  pruef(name + ": erlaubte_fahrzeuge = [" + fz + "]", JSON.stringify(d.erlaubte_fahrzeuge) === JSON.stringify([fz]), JSON.stringify(d.erlaubte_fahrzeuge));
  const fremdeTags = (d.tags || []).filter((t) => { const f = t.fahrzeug || "pkw"; return f !== fz && f !== "alle"; });
  pruef(name + ": nur Themen " + fz + "/alle", fremdeTags.length === 0, fremdeTags.map((t) => t.id).slice(0, 5).join(", "));
  const ids = new Set((d.videos || []).map((v) => v.id));
  pruef(name + ": fremdes Video nicht im Katalog", !ids.has(fremdesVideo));
  pruef(name + ": eigenes Video im Katalog", ids.has(eigenesVideo));
  const tagIds = new Set((d.tags || []).map((t) => t.id));
  const fremdeLinks = (d.video_tags || []).filter((x) => !ids.has(x.video_id));
  pruef(name + ": video_tags nur zu sichtbaren Videos", fremdeLinks.length === 0, String(fremdeLinks.length));
  if (fz === "pkw") {
    // Die ersten Lkw-Themen heissen lkw_… (db/lkw-bereich.sql).
    const lkwLinks = (d.video_tags || []).filter((x) => String(x.tag_id).startsWith("lkw_") && !tagIds.has(x.tag_id));
    pruef(name + ": video_tags ohne Lkw-Themen", lkwLinks.length === 0, String(lkwLinks.length));
  }
  pruef(name + ": video_pruefer nur zu sichtbaren Videos", (d.video_pruefer || []).every((x) => ids.has(x.video_id)));
  pruef(name + ": keine bunny_video_id im Katalog", (d.videos || []).every((v) => !v.bunny_video_id));
}

async function vorschau(name, token, video) {
  const a = await rufe("academy-vorschau", { session_token: token, video_id: video });
  pruef(name + ": Vorschau fremdes Video -> fahrzeug_nicht_freigegeben", a.status === 403 && a.daten.code === "fahrzeug_nicht_freigegeben", kurz(a));
}

async function loginFalsch(name, tel, pin, falschesFz) {
  const a = await rufe("academy-login", { telefon: tel, pin, fahrzeug: falschesFz });
  pruef(name + ": Login mit " + falschesFz + " -> fahrzeug_falsch", a.status === 403 && a.daten.code === "fahrzeug_falsch" && !a.daten.session_token, kurz({ status: a.status, daten: { ...a.daten, session_token: a.daten.session_token ? "(gesetzt)" : undefined } }));
}

try {
  await fremdesVideo("Pkw", TOKEN_PKW, VIDEO_LKW);
  await fremdesVideo("Lkw", TOKEN_LKW, VIDEO_PKW);
  await eigenesVideo("Pkw", TOKEN_PKW, VIDEO_PKW, process.env.ERWARTUNG_PKW);
  await eigenesVideo("Lkw", TOKEN_LKW, VIDEO_LKW, process.env.ERWARTUNG_LKW);

  await katalog("Pkw", TOKEN_PKW, "pkw", VIDEO_PKW, VIDEO_LKW);
  await katalog("Lkw", TOKEN_LKW, "lkw", VIDEO_LKW, VIDEO_PKW);

  const liste = await rufe("academy-szene", { session_token: TOKEN_LKW, aktion: "liste", sprache: "de" });
  pruef("Lkw: 3D-Szenen-Liste leer", liste.status === 200 && liste.daten.ok === true && Array.isArray(liste.daten.szenen) && liste.daten.szenen.length === 0, kurz(liste));
  const szene = await rufe("academy-szene", { session_token: TOKEN_LKW, aktion: "szene", id: "test_szene", sprache: "de" });
  pruef("Lkw: 3D-Szene -> fahrzeug_nicht_freigegeben", szene.status === 403 && szene.daten.code === "fahrzeug_nicht_freigegeben", kurz(szene));
  const listePkw = await rufe("academy-szene", { session_token: TOKEN_PKW, aktion: "liste", sprache: "de" });
  pruef("Pkw: 3D-Szenen-Liste erreichbar", listePkw.status === 200 && listePkw.daten.ok === true, kurz(listePkw));

  await vorschau("Pkw", TOKEN_PKW, VIDEO_LKW);
  await vorschau("Lkw", TOKEN_LKW, VIDEO_PKW);

  // Zuletzt (siehe Kopf): Login mit falschem Fahrzeug.
  if (process.env.TEL_PKW && process.env.PIN_PKW) await loginFalsch("Pkw", process.env.TEL_PKW, process.env.PIN_PKW, "lkw");
  else console.log("--      Login Pkw-Schüler übersprungen (TEL_PKW/PIN_PKW fehlen)");
  if (process.env.TEL_LKW && process.env.PIN_LKW) await loginFalsch("Lkw", process.env.TEL_LKW, process.env.PIN_LKW, "pkw");
  else console.log("--      Login Lkw-Schüler übersprungen (TEL_LKW/PIN_LKW fehlen)");
} catch (e) {
  fehler++;
  console.log("FEHLER  Abbruch: " + String(e));
}

console.log(fehler ? `\n${fehler} Prüfpunkt(e) FEHLER` : "\nAlle Prüfpunkte OK");
process.exit(fehler ? 1 : 0);
