// Telefonnummer in alle Schreibweisen uebersetzen, unter denen sie gespeichert sein kann.
// Gespeichert wird "0171..." (Stand 26.09.2026 bei allen 30 Schuelern). Eingegeben wird
// oft "+49 171 ...", "0049171..." oder "0171/..." -- frueher fuehrte das zu "PIN falsch".
// Rueckgabe: [alteSchreibweise, ...Varianten]; die alte (nur Leerzeichen entfernt) zuerst,
// damit sich fuer bisher funktionierende Eingaben nichts aendert.
export function telefonKandidaten(eingabe: unknown): { alt: string; kanon: string; alle: string[] } {
  const alt = String(eingabe ?? "").replace(/\s+/g, "");
  let z = alt.replace(/[^\d+]/g, "");
  let national = "";
  if (z.startsWith("+49")) national = z.slice(3);
  else if (z.startsWith("0049")) national = z.slice(4);
  else if (z.startsWith("0")) national = z.slice(1);
  national = national.replace(/^0+/, "").replace(/\D/g, "");
  const kanon = national.length >= 6 ? "0" + national : z.replace(/\D/g, "");
  const alle = [alt];
  if (national.length >= 6) {
    for (const v of ["0" + national, "+49" + national, "0049" + national]) if (!alle.includes(v)) alle.push(v);
  } else if (kanon && !alle.includes(kanon)) alle.push(kanon);
  return { alt, kanon: kanon || alt, alle };
}
