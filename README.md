# LifeOS V0.2 — Cyberpunk Progression Core

A mobile-first, installable web app built with plain HTML, CSS and JavaScript.

## What's new in V0.2
- Cyberpunk visual system: neon cyan, magenta accents, dark panels and responsive mobile layout.
- Hardcore player XP curve: the XP required for each level increases by 50 XP per level, starting at 150 XP.
- Six player ranks: INITIATE, RUNNER, OPERATIVE, ELITE, PHANTOM and LEGEND.
- Five independently leveling attributes: Intelligence, Strength, Discipline, Creativity and Agility.
- Achievement system with unlock conditions.
- Reward vault with in-game unlock milestones and real-life rewards.
- Add your own real-life rewards and set the player level required to unlock them.
- Mark rewards as redeemed; all progress persists locally.
- Existing V0.1 data is retained because the app continues using the `lifeos_v01` localStorage key.

## XP rules
- Routine quest: 10 XP
- Standard quest: 20 XP
- Hard quest: 35 XP
- Critical quest: 50 XP
- Quest XP is added to both overall XP and the selected attribute XP.
- Unchecking a completed quest reverses its XP. Deleting a completed quest also removes its XP.

## Run locally
Open `index.html` in a browser. For service-worker/PWA testing, serve the folder over HTTPS or localhost.

## Deploy
Upload the contents of this folder to a static host such as Cloudflare Pages. No build command is required; the output directory is the project root.

## Install on iPhone
1. Deploy over HTTPS.
2. Open the deployed URL in Safari.
3. Tap Share → Add to Home Screen.
4. Launch LifeOS from the Home Screen.

## Current limitations
- Progress is stored in this browser on this device; there is no account or cross-device sync yet.
- Automatic scheduling, calendar views, analytics, inventory and skill trees are later milestones.
- Real-life rewards are self-managed. LifeOS tracks unlocks and redemption but does not enforce rewards.
