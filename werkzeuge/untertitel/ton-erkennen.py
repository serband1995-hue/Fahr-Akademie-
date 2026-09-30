# Untertitel-Abgleich, Schritt 1 (30.09.2026): je Video die kleinste MP4 (240p, signiert, 10 Min
# gültig) holen, die deutschen Zeilen aus untertitel.zeilen lesen und mit faster-whisper
# (Modell "small", CPU) jedes gesprochene Wort mit Zeit erkennen -> <video>.woerter.json.
# Aufruf: python3 ton-erkennen.py <video_id> [<video_id> ...]   (pip install faster-whisper)
# Zugang: Datei "schluessel" (zufällig, NUR lokal) -- ihr SHA-256 muss vorübergehend im Vault
# als "untertitel_abgleich_hash" liegen. Der Schlüssel darf nur Zeilen lesen, Zeiten setzen und
# den Testlink holen. Nach dem Abgleich den Vault-Eintrag und die Datei wieder löschen.
import json, subprocess, os, urllib.request, sys
F = "https://fxgljvhpikjcejhghgbp.supabase.co/functions/v1/academy-untertitel"
S = open("schluessel").read().strip()
VIDS = sys.argv[1:]
def rufe(daten):
    r = urllib.request.Request(F, data=json.dumps(daten).encode(), headers={"x-abgleich": S, "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(r, timeout=60))
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
for v in VIDS:
    if os.path.exists(f"{v}.woerter.json"): continue
    json.dump(rufe({"aktion": "zeilen_lesen", "video_id": v})["zeilen"], open(f"{v}.zeilen.json", "w"), ensure_ascii=False)
    mp4 = rufe({"aktion": "testlink", "video_id": v})["mp4"]
    subprocess.run(["curl", "-sS", "-o", f"{v}.mp4", "-H", "Referer: https://serband1995-hue.github.io/", mp4], check=True)
    segs, info = m.transcribe(f"{v}.mp4", language="de", word_timestamps=True, vad_filter=True, beam_size=1, condition_on_previous_text=False)
    w = [[round(x.start, 3), round(x.end, 3), x.word.strip()] for s in segs for x in (s.words or [])]
    json.dump(w, open(f"{v}.woerter.json", "w"), ensure_ascii=False)
    os.remove(f"{v}.mp4")
    print(v, len(w), "Wörter", round(info.duration), "s", flush=True)
print("ALLE FERTIG", flush=True)
