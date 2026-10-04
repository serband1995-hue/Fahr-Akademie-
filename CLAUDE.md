# Fahr-Akademie: notes for Claude

**Always reply to Serband in German**: simple, short, no jargon. He works on his phone.

Vanilla-JS app for driving students (one `index.html`, ~15,000 lines). Backend: Supabase project `fxgljvhpikjcejhghgbp` (eu-central-1). Videos on Bunny Stream. Users are partly minors: be careful with data.

## Arbeitsregeln (nicht verhandelbar, Wortlaut von Serband)

1. **Fertig bauen, dann kontrolliert Serband** (ersetzt seit 02.10.2026 „erst besprechen,
   auf Los warten“): Aufträge komplett durchziehen – bauen, doppelt prüfen, live stellen –
   und am Ende übersichtlich berichten, was gemacht wurde und was er am Video/in der App
   nachsehen sollte. Er kontrolliert in Ruhe und sagt dann, was geändert wird. Rückfragen nur,
   wenn etwas wirklich nicht entscheidbar ist oder unwiderruflich Daten verloren gingen.
2. **Bei Nummernlisten von Serband gilt nur, was er mit "ja" bestätigt.** Was er
   ausdrücklich ablehnt, bleibt ein Nein, ohne Rückfrage.
3. **Immer die echte Live-Datei aus GitHub laden**, nie einer Kopie im
   Projektwissen vertrauen. War zweimal die Fehlerquelle.
4. **Chirurgische Edits (str_replace) statt Neuschriebe**, wo möglich.
5. **Doppelt prüfen ist Pflicht**, nicht Kür. Zwei echte Bugs wurden nur durch
   den zweiten Durchlauf gefunden.
6. **Geheimnisse nicht durch den Chat schleusen.** Secrets bleiben im Supabase
   Vault oder in Umgebungsvariablen.

## Always
- **Phone first:** build and check every change at 360–412 px (and landscape): nothing cut off, nothing scrolls sideways, no buttons on images, long TR/AR texts wrap.
- **Everything students see in all 18 languages** (`t("…")`), never hard-coded German. Admin area stays German.
- Database change → run `get_advisors` afterwards. Edge Functions → `verify_jwt: false` (they check access themselves). Prove security claims with real tests.
- Never write to the Fahrlehrer-Kompass Supabase project (`oectrvkjunntzsggyhxv`).
- Unclear? Don't guess, ask.

## Detailed project memory: read before touching these areas
`docs/PROJEKTGEDAECHTNIS.md` (the former long CLAUDE.md, unchanged) has the details that cannot be seen in the code. Read the relevant section before working on:
- languages and translations (section "Sprachen")
- subtitles (section "Untertitel")
- login, roles, candidates vs. students, locks, video tokens (section "Architektur-Grenzen")
- known error sources (section "Bekannte Fehlerquellen")
Add new detail knowledge there or in the vault, and keep this file short: it is sent with every message.

## Memory: Obsidian vault
Serband's long-term memory lives in the private repo `serband1995-hue/obsidian-vault`.
- **Run `/vault` at the start of every session.** It loads his profile, binding working rules and this project's overview (~6k tokens instead of re-reading code or old chats).
- If the vault is missing: `add_repo` (owner `serband1995-hue`, repo `obsidian-vault`, access `push`), clone to `/home/user/obsidian-vault`, then `/vault`.
- Read only the notes the task needs (start from the index). Never the whole vault.
- Code beats vault: verify the real code before changing it; fix the vault if it is outdated.
- End of a larger task, or when Serband says "Vault aktualisieren": follow `CLAUDE.md` in the vault (session log, update notes, push to vault `main`).
- New task = new session: suggest it when a session gets long and the next task is unrelated.
