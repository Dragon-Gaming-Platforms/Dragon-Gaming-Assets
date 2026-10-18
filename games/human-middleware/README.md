# HUMAN MIDDLEWARE 🧾

**A complete arcade game in ONE html file. Zero dependencies. Zero build step.**

You are Greta, chief accountant at *Balance & Balance Accounting (est. 1994)*, somewhere in Europe.
Your nephew Chad just launched his AI SaaS — and every €8 invoice it generates must be printed,
retyped into TURBOKONTO V.2004, carried on a floppy disk, converted by the intern, and stamped.
By hand. By you. You are the API now.

Survive as many days as you can. Greta believes in you.

**[▶ Play now → humanmiddleware.supc.io](https://humanmiddleware.supc.io)**

![Human Middleware gameplay](gameplay.gif)

## Why this exists

Built by **[supc.io](https://supc.io)**. Our mission is to remove all friction from accounting
operations for the new era of builders. This game is what the world looks like when nobody does that.
It's satire. In most of Europe it's just Tuesday.

## Controls

| Key | Action |
|---|---|
| Arrows / WASD | Move |
| Shift | Sprint (burns coffee) |
| Space | Do everything: print, type, stamp, brew, answer |
| 1–7 | Buy upgrade levels from the right panel |
| Y / N | Answer client calls |
| P / M / R | Pause / mute / restart |

Watch out: four coffees in a row without doing any work ends in cardiac overflow.

## Run it

Open `index.html` in a browser. That's the entire deployment pipeline.

```bash
# or, if you prefer ceremony:
python3 -m http.server 8000   # → http://localhost:8000
```

Headless test suite (Node, no browser needed):

```bash
node smoke.test.js
```

## Tune it

Every gameplay knob lives in one `CONFIG` object at the top of `index.html` — spawn curves,
stress, upgrade tiers, day length, heart-attack threshold. Full guide: [TUNING.md](TUNING.md).
Texts live in `STRINGS`, phone conversations in `PHONE_QA`, the upgrade shop in `UPGRADES`.

## Embed it (build your own player)

The game is embeddable and talks to its parent page via `postMessage` — all payloads are
anonymous gameplay stats, never personal data.

Load it with `?embed=1` to suppress the built-in game-over/mobile modals (your page provides
its own UI):

```html
<iframe src="game/index.html?embed=1" style="width:100%;aspect-ratio:1120/672"></iframe>
```

Messages emitted (`{ source: "human-middleware", event, data }`):

| event | data |
|---|---|
| `game_start` | `{ touch?: true }` |
| `run_end` | `{ seconds, booked, cause, respect, day, coffees, meters }` |
| `day_end` | `{ day, booked }` |
| `tutorial_complete`, `upgrade_buy` | misc, PII-free |

Commands accepted (embed mode only): `postMessage({ source: "hm-player", cmd: "restart" })`.

The same events are pushed to `window.dataLayer` if present. The game collects no data and
has no backend — every payload is anonymous gameplay stats. Email/leaderboard capture is
entirely the embedding page's responsibility.

## Contributing

The easiest contribution is a new phone question — it's a single `PHONE_QA` entry.
See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and balance opinions welcome:
the office should be brutal, but *fair*.

## License

[MIT](LICENSE) © [supc.io](https://supc.io)
