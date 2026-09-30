# Untertitel-Abgleich, Schritt 2 (30.09.2026): Untertitel-Zeiten am echten Ton ausrichten.
# Aufruf: python3 abgleich.py <video_id> <videolänge_s> [--setzen]  (ohne --setzen nur Bericht)
# Eingang: <v>.zeilen.json (nr, beginn, ende, de) + <v>.woerter.json ([start, ende, wort] aus der Spracherkennung)
# Ausgang: <v>.neu.json [{nr, beginn, ende, anker}] + Bericht; mit --setzen direkt in die Datenbank.
import json, re, sys, difflib, urllib.request, unicodedata
F = "https://fxgljvhpikjcejhghgbp.supabase.co/functions/v1/academy-untertitel"

def norm(w):
    w = unicodedata.normalize("NFC", w.lower()).replace("ß", "ss")
    return re.sub(r"[^0-9a-zäöü]", "", w)
def sek(t): h, m, s = t.split(":"); return int(h) * 3600 + int(m) * 60 + float(s)
def zeit(s):
    s = max(0, s); ms = int(round(s * 1000)); return "%02d:%02d:%02d.%03d" % (ms // 3600000, ms // 60000 % 60, ms // 1000 % 60, ms % 1000)

def abgleichen(v, laenge=None):
    z = json.load(open(f"{v}.zeilen.json")); W = json.load(open(f"{v}.woerter.json"))
    # Die Erkennung schlägt Pausen gern dem FOLGENDEN Wort zu ("mit" 10,4–12,7 s). Unnatürlich
    # lange Wörter vom Ende her auf eine realistische Dauer kürzen.
    for x in W:
        maxdauer = 0.35 + 0.085 * len(x[2])
        if x[1] - x[0] > maxdauer: x[0] = round(x[1] - maxdauer, 3)
    wt = [norm(x[2]) for x in W]
    ct, cinfo = [], []   # Zeilen-Wörter mit (zeile, anteil_start, anteil_ende)
    for zi, r in enumerate(z):
        text = r["de"]; L = len(text)
        for m in re.finditer(r"\S+", text):
            n = norm(m.group())
            if n: ct.append(n); cinfo.append((zi, m.start() / L, m.end() / L))
    # Globale Ausrichtung (Needleman-Wunsch) aller Zeilen-Wörter gegen alle erkannten Wörter,
    # nur innerhalb eines Zeitkorridors (bisherige Zeit der Zeile ±6 s). Ergebnis ist die EINE
    # Zuordnung, die über das ganze Video in Reihenfolge am besten passt.
    def aehnl(x, y):
        if x == y: return 2.0
        return 1.0 if difflib.SequenceMatcher(None, x, y).ratio() >= 0.7 else -1.0
    starts = [x[0] for x in W]
    import bisect
    band = []
    for ci, (zi, _, _) in enumerate(cinfo):
        lo, hi = sek(z[zi]["beginn"]) - 6, sek(z[zi]["ende"]) + 6
        band.append((bisect.bisect_left(starts, lo - 3), bisect.bisect_right(starts, hi)))
    LUECKE = -0.6
    vor = {-1: 0.0}   # Zeile -1: nur "vor allen Wörtern" = Index -1
    zurueck = []
    for ci in range(len(ct)):
        j0, j1 = band[ci]
        akt, bt = {}, {}
        # Zeilen-Wort überspringen (gegen nichts): aus vor[j] mit gleichem j
        for j in range(j0 - 1, j1):
            kand = []
            if j in vor: kand.append((vor[j] + LUECKE, (ci - 1, j, "c")))
            if j >= j0:
                if (j - 1) in vor: kand.append((vor[j - 1] + aehnl(ct[ci], wt[j]), (ci - 1, j - 1, "m")))
                if (j - 1) in akt: kand.append((akt[j - 1] + LUECKE, (ci, j - 1, "w")))
            if not kand:
                # Einstieg in das Band: bestes früheres Ergebnis weiterreichen (erkannte Wörter überspringen kostet nichts außerhalb)
                frueher = [k for k in vor if k < j]
                if frueher:
                    k = max(frueher, key=lambda q: vor[q]); kand.append((vor[k] + LUECKE, (ci - 1, k, "c")))
            if kand:
                best = max(kand, key=lambda q: q[0]); akt[j] = best[0]; bt[j] = best[1]
        zurueck.append(bt); vor = akt
    # Rückverfolgung
    paar = {}
    if vor:
        j = max(vor, key=lambda q: vor[q]); ci = len(ct) - 1
        while ci >= 0 and j in zurueck[ci]:
            pci, pj, art = zurueck[ci][j]
            if art == "m" and aehnl(ct[ci], wt[j]) > 0: paar[ci] = j
            if art == "w": j = pj; continue
            ci, j = pci, pj
    je = {}
    for ci, wi in paar.items():
        zi, f0, f1 = cinfo[ci]; je.setdefault(zi, []).append((f0, f1, W[wi][0], W[wi][1], ci))
    woerter_je = {}
    for ci, (zi, _, _) in enumerate(cinfo): woerter_je.setdefault(zi, []).append(ci)
    neu, bericht = [], []
    for zi, r in enumerate(z):
        alt_a, alt_b = sek(r["beginn"]), sek(r["ende"])
        m = sorted(je.get(zi, []), key=lambda x: x[4]); alle = woerter_je.get(zi, [])
        # einzelne Randwörter, die > 2,5 s vom Rest der Zeile entfernt erkannt wurden, zählen nicht
        while len(m) >= 3 and m[1][2] - m[0][3] > 2.5: m.pop(0)
        while len(m) >= 3 and m[-1][2] - m[-2][3] > 2.5: m.pop()
        if len(m) >= max(1, min(2, len(alle))) and len(m) >= 0.3 * len(alle):
            erst, letzt = alle.index(m[0][4]), len(alle) - 1 - alle.index(m[-1][4])
            # nicht zugeordnete Randwörter: Zeiten der benachbarten erkannten Wörter nehmen,
            # aber nicht über die Treffer der Nachbarzeilen hinaus
            w0, w1 = paar[m[0][4]], paar[m[-1][4]]
            vor_grenze = max([wi for ci, wi in paar.items() if cinfo[ci][0] < zi] or [-1])
            nach_grenze = min([wi for ci, wi in paar.items() if cinfo[ci][0] > zi] or [len(W)])
            ia = max(w0 - erst, vor_grenze + 1, 0); ib = min(w1 + letzt, nach_grenze - 1, len(W) - 1)
            while ia < w0 and W[ia + 1][0] - W[ia][1] > 2.5: ia += 1
            while ib > w1 and W[ib][0] - W[ib - 1][1] > 2.5: ib -= 1
            # Randwörter dürfen die Zeile höchstens 3 s über ihre bisherige Zeit hinaus dehnen
            a = min(max(W[ia][0], alt_a - 3), m[0][2]); b = max(min(W[ib][1], alt_b + 3), m[-1][3])
            anker = []; tmax = -1
            for f0, f1, t0, t1, _ in m:
                if t0 >= tmax: anker.append([round(f0, 4), round(t0, 3)]); tmax = t0
                if t1 >= tmax: anker.append([round(f1, 4), round(t1, 3)]); tmax = t1
            quelle = "ton"
            if len(alle) <= 3 and max(abs(a - alt_a), abs(b - alt_b)) > 2.0:
                a, b, anker, quelle = alt_a, alt_b, None, "alt"
        else:
            a, b, anker, quelle = alt_a, alt_b, None, "alt"
        neu.append({"nr": r["nr"], "a": a, "b": b, "anker": anker, "quelle": quelle, "alt": (alt_a, alt_b), "zeichen": len(r["de"])})
    # (a) Überschneidung roher Sprechzeiten: die Zeile ohne Treffer weicht in die Lücke aus
    for i in range(1, len(neu)):
        p, x = neu[i - 1], neu[i]
        if x["a"] < p["b"] - 0.3:
            if x["quelle"] == "alt": x["a"] = p["b"]; x["b"] = max(x["b"], x["a"] + 1.0)
            elif p["quelle"] == "alt": p["b"] = x["a"]; p["a"] = min(p["a"], p["b"] - 1.0)
    # (b) Polster vorne, Lesezeit (max. 17 Zeichen/s): erst nach hinten in die Pause, dann bis 1 s nach vorn
    for i, x in enumerate(neu):
        vor = neu[i - 1]["b"] if i else 0
        x["a"] = max(min(x["a"] - 0.15, x["a"]), vor, 0)
    for i, x in enumerate(neu):
        nach = neu[i + 1]["a"] if i + 1 < len(neu) else (laenge or x["b"] + 2)
        brauch = max(1.0, x["zeichen"] / 17)
        x["b"] = max(x["b"], min(max(x["b"] + 0.4, x["a"] + brauch), nach - 0.04))
        if x["b"] - x["a"] < brauch:
            vor = neu[i - 1]["b"] + 0.04 if i else 0
            x["a"] = max(vor, x["a"] - 1.0, min(x["a"], x["b"] - brauch))
        if laenge: x["b"] = min(x["b"], laenge)
    # (c) Endkontrolle: streng aufsteigend, keine Überlappung, jede Einblendung >= 0,5 s
    for i, x in enumerate(neu):
        vor = neu[i - 1]["b"] + 0.02 if i else 0
        x["a"] = max(x["a"], vor)
        x["b"] = max(x["b"], x["a"] + 0.5)
        if laenge and x["b"] > laenge: x["b"] = laenge; x["a"] = min(x["a"], laenge - 0.5)
    for x in neu:
        d = max(abs(x["a"] - x["alt"][0]), abs(x["b"] - x["alt"][1]))
        bericht.append((x["nr"], x["quelle"], round(x["a"] - x["alt"][0], 2), round(x["b"] - x["alt"][1], 2), d))
    aus = [{"nr": x["nr"], "beginn": zeit(x["a"]), "ende": zeit(x["b"]), "anker": x["anker"]} for x in neu]
    json.dump(aus, open(f"{v}.neu.json", "w"))
    ton = sum(1 for x in neu if x["quelle"] == "ton")
    gross = [b for b in bericht if b[4] > 2.0]
    return {"zeilen": len(neu), "am_ton": ton, "ohne_treffer": [b[0] for b in bericht if b[1] == "alt"],
            "verschoben_ueber_2s": len(gross), "ueber_5s": [(b[0], b[2], b[3]) for b in bericht if b[4] > 5],
            "median_abw": round(sorted(b[4] for b in bericht)[len(bericht) // 2], 2)}

if __name__ == "__main__":
    v = sys.argv[1]; laenge = float(sys.argv[2]) if len(sys.argv) > 2 else None
    print(v, json.dumps(abgleichen(v, laenge), ensure_ascii=False))
    if "--setzen" in sys.argv:
        S = open("schluessel").read().strip()
        daten = json.load(open(f"{v}.neu.json"))
        r = urllib.request.Request(F, data=json.dumps({"aktion": "zeiten_setzen", "video_id": v, "daten": daten}).encode(), headers={"x-abgleich": S, "Content-Type": "application/json"})
        print(" gesetzt:", json.load(urllib.request.urlopen(r, timeout=60)))
