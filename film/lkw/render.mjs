// MP4 (stumm, 1920x1080, 30 Bilder/s) aus einem Film rendern: jedes Bild wird exakt auf die Zeit der Zeitleiste gestellt und aufgenommen.
// Aufruf: node film/lkw/render.mjs f5-1 [Ausgabedatei] [Sprache-ungenutzt]    Voraussetzung: Playwright + Chromium (PLAYWRIGHT_PATH), ffmpeg.
// Beispiel: PLAYWRIGHT_PATH=/opt/node22/lib/node_modules/playwright/index.mjs node film/lkw/render.mjs f5-1 /tmp/f5-1.mp4
import { spawn } from "node:child_process";
import path from "node:path";
const hier = path.dirname(new URL(import.meta.url).pathname);
const film = process.argv[2] || "f5-1", out = process.argv[3] || path.join(hier, film, "out", `lkw-${film}-de-stumm.mp4`);
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || "playwright");
const FPS = 30;
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--disable-gpu", "--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on("pageerror", (e) => { console.error("Seitenfehler:", e.message); process.exit(2); });
await p.goto("file://" + path.join(hier, film, "index.html"));
await p.evaluate(() => document.fonts.ready.then(() => 1));
const gesamt = await p.evaluate(() => window.__gesamt);
const n = Math.round(gesamt * FPS);
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
for (let i = 0; i < n; i++) {
  await p.evaluate((t) => { window.__timelines.main.time(t); return 1; }, i / FPS);
  const buf = await p.screenshot({ type: "jpeg", quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % 300 === 0) console.log(`Bild ${i} / ${n}`);
}
ff.stdin.end(); await new Promise((r) => ff.on("close", r)); await b.close();
console.log("fertig:", out, `${n} Bilder, ${gesamt} s`);
