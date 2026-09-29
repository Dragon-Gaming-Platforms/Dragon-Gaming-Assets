# AGENTS.md — Dragon-Gaming-Assets

Operating manual for AI agents working in **Dragon-Gaming-Platforms/Dragon-Gaming-Assets**. Read all of it before making any change.

## What this repository is

This repo hosts the **game files** for the Dragon Gaming Platforms site. It is one half of a two-repo architecture:

| Repo | Role | Live URL |
|---|---|---|
| **This repo** (Dragon-Gaming-Assets) | Stores and serves the actual games | `https://dragon-gaming-platforms.github.io/Dragon-Gaming-Assets/` |
| **Main repo** (Dragon-Gaming-Platforms/Dragon-Gaming-Platforms) | The catalog/site UI that lists the games | `https://dragon-gaming-platforms.github.io/Dragon-Gaming-Platforms/` |

Both are served from the **same origin** (`dragon-gaming-platforms.github.io`), so the main site loads games from this repo with zero CORS problems. Each repo has its own ~1 GB GitHub Pages budget.

**You only ever work in this repo.** The main repo has its own agent, its own workflows, and its own rules. Any `git push` or `gh api` call against another repository will fail with "Repository not found" — do not attempt it.

## Hard rules

1. **NEVER open a pull request.** All work lands as direct commits to `main`. No feature branches, no PRs, no drafts. Non-negotiable.
2. **Never rewrite or force-push `main`.**
3. **Never use Git LFS.** GitHub Pages does not serve LFS objects — every file must be a regular Git blob.
4. **Never delete or rename an existing `games/<slug>/` folder** unless the user explicitly asks. The main-repo catalog links to these URLs and its sync is add-only — deletions and renames orphan catalog entries (details below).
5. **Stay under the limits:** 100 MB per file (GitHub hard cap), ~1 GB total for this repo's Pages deployment. Keep comfortable headroom.
6. Commit only what belongs: game folders, `game.json`, `THIRD_PARTY.md` updates. No scratch files, no `node_modules`, no build tooling unless the user asks.
7. If the user asks for something that conflicts with these rules, say so instead of silently complying.

## Repository layout

```
games/
  <slug>/              ← one folder per game
    index.html         ← REQUIRED. Entry point; what the catalog links to.
    game.json          ← OPTIONAL but recommended. Catalog metadata.
    ...                ← assets (js/css/images) referenced by index.html
THIRD_PARTY.md         ← attribution & source record for every hosted game
AGENTS.md              ← this file
```

- Folders under `games/` starting with `_` or `.` are invisible to the catalog sync — useful for staging.
- Games must be self-contained: everything `index.html` needs lives inside the folder, referenced with relative paths.

## Adding a game, start to finish

1. **Pick a clean slug** — lowercase letters, digits, hyphens: `games/my-new-game/`. Capitals get folded and underscores converted to hyphens (with warnings in the sync log); avoid both.
2. **Place the game**: a working `index.html` plus any assets it needs. Prefer fully self-contained builds — the whole point of hosting here is durability, so avoid builds that depend on external CDNs. If external resources are unavoidable, note them in `THIRD_PARTY.md`. Test that it runs standalone before pushing.
3. **Write `game.json`** (recommended) — see the reference below.
4. **Add a `THIRD_PARTY.md` row in the same commit** — see the attribution section below. A game never ships without its row.
5. **Commit and push directly to `main`.** Clear message, e.g. `Add My New Game (my-new-game)`.
6. **Verify it's live.** Pushes to `main` deploy to GitHub Pages automatically (allow a minute or two). Check `https://dragon-gaming-platforms.github.io/Dragon-Gaming-Assets/games/<slug>/`. If `curl` can't reach `*.github.io` from your sandbox, verify with a web-page fetch tool instead — curl failing there is a sandbox egress limitation, not evidence the site is down.
7. **Tell the user to run the catalog sync.** You cannot trigger it — it lives in the main repo. The user goes to the **main repo → Actions tab → "Sync Assets-Repo Games to Catalog" → Run workflow** (a dry-run checkbox is available). Until that runs, the game is hosted but not listed in the catalog.
8. Remind the user that the **main repo's** `THIRD_PARTY.md` may also need a matching row — the sync workflow prints this reminder too.

## game.json reference

Entirely optional — a game without one still gets cataloged with defaults. All keys are optional.

| Key | Type | Default without it |
|---|---|---|
| `name` | string | Folder slug, title-cased (`my-new-game` → "My New Game") |
| `desc` | string | "`<Name>` playable in your web browser." |
| `controls` | string | `"Keyboard / Mouse"` |
| `shelf` | string | `"Arcade & Action"` |
| `tags` | string[] | `["games", "html5"]` |
| `badge` | string | (empty) |
| `creator` | string | (empty) |

Valid `shelf` values — exactly one of these nine:

`Arcade & Action`, `Puzzle & Logic`, `Sports & Racing`, `RPG & Adventure`, `Strategy & Idle`, `Emulators`, `Interactive Stories & Experiments`, `Web Browsers`, `Tools & Utilities`

Anything else falls back to `Arcade & Action` with a warning in the sync log.

Example:

```json
{
  "name": "My New Game",
  "desc": "Fast-paced arena shooter with three game modes.",
  "controls": "WASD to move, mouse to aim",
  "shelf": "Arcade & Action",
  "tags": ["games", "html5"],
  "badge": "New",
  "creator": "Original Studio"
}
```

**A malformed `game.json` causes the game to be SKIPPED by the sync** (reported as a warning) — validate the JSON before pushing.

## THIRD_PARTY.md (this repo) — attribution record

Every hosted game must have a row in this repo's `THIRD_PARTY.md`, added in the same commit as the game. This file is the authoritative record of where each hosted game came from and on what basis we host it. If the file doesn't exist yet, create it with this format and backfill a row for every existing game folder.

Format — one table row per game:

```markdown
| Game | Folder | Source | License / Basis | Added |
|---|---|---|---|---|
| My New Game | `games/my-new-game/` | https://example.com/original-build | Free web game mirror | 2026-09-28 |
```

- Be honest in the License / Basis cell: "open-source (MIT)", "free web game mirror", "publicly distributed web build", "basis unclear — needs review". Never invent a license.
- If a game's source or licensing situation changes, update its row.
- The **main repo** keeps its own separate `THIRD_PARTY.md` (it labels these games "Web Edition (First-Party Hosted)" and links here). That file is maintained over there — you never edit it; just remind the user when it may need a row.

## How the catalog sync sees this repo

The main repo has a manual workflow — **"Sync Assets-Repo Games to Catalog"** — that checks this repo out, scans `games/`, and inserts any new folders into its three catalog files, pointing at `https://dragon-gaming-platforms.github.io/Dragon-Gaming-Assets/games/<slug>/`. It then commits to the main repo as `github-actions[bot]` and redeploys the main site, so the game goes live in the catalog on the same run.

What matters to you:

- **Manual trigger only.** It runs when the user clicks Run workflow in the main repo's Actions tab. Nothing runs automatically in response to your pushes.
- **Add-only.** It never edits or removes existing catalog entries.
- **Idempotent.** Games already in the catalog are skipped ("already in catalog"); re-running with nothing new is a harmless no-op.
- Conflicts (same id, different path), unreadable manifests, and orphaned entries are **warnings, not errors** — the run still succeeds.
- It auto-bumps the game counts everywhere on the main site.
- It does **not** touch either repo's `THIRD_PARTY.md` — attribution is always manual.

### Renames and deletions

Because the sync is add-only:

- **Renaming** `games/old/` → `games/new/` creates a *second* catalog entry and orphans the first, which then points at a dead URL.
- **Deleting** a folder orphans its catalog entry the same way.

Neither is repaired by any workflow. If a rename or removal is ever needed, tell the user — it requires a manual catalog edit in the main repo.

## Sourcing guidelines

- Host games as **self-contained web builds** — single-file HTML when possible, otherwise a folder whose `index.html` references only local files.
- Don't add games that require accounts, payments, or third-party server backends — they will break.
- Games must work embedded in an iframe on the main site. GitHub Pages never sends `X-Frame-Options`, so self-hosted builds are always framable — the only risk is framebusting logic inside the game itself.
- Sources already vetted and rejected — don't re-suggest: `tunnelrushgame.io`, `1v1.lol`, `gdclone`, `fridaynight-funkin.github.io/f88`, `gswitch3.github.io/g88/friday-night-funkin`, `ggl22/twastinfg`, `superteamxx.github.io/Subway-Surfers`. Also note: "Ragdoll Archers 2" doesn't exist.
- `games/ragdoll-hit/` is already hosted and already in the catalog — nothing to do there.

## Quick reference

- Live game URL pattern: `https://dragon-gaming-platforms.github.io/Dragon-Gaming-Assets/games/<slug>/`
- Catalog sync: main repo → Actions → **Sync Assets-Repo Games to Catalog** → Run workflow (the user does this)
- Limits: 100 MB/file, ~1 GB repo budget, no Git LFS, no pull requests — ever.
