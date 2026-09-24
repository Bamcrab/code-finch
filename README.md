# Finch (personal edition)

A subscription-free recreation of the Finch self-care pet app, plus first-class **home upkeep** tracking. Take care of yourself and your home; every small thing you do gives your birb energy to go on adventures.

Everything runs on-device: no accounts, servers, ads, or tracking. It's an installable, offline-capable PWA.

## What's in it

**The birb**
- Hatch an egg, name your birb, and pick pronouns and a starting trait.
- Five growth stages (baby → adult at 7/22/42/67 adventures). New color parts unlock as they grow, each with a free color pick.
- Stroke to pet (hearts, friendship points, 10 friendship levels that boost adventure stones). Tap to chat. They sleep in bed at your bedtime.
- A personality that grows from how you answer the discoveries they bring home.

**The core loop**
- Goals give ⚡ energy (5, or 7 on a low-mood day) and 💎 rainbow stones. You can set an effort level and times-per-day.
- At full energy (15–35 by stage) the birb goes on a 6–8 hour adventure. Energy earned after that brings them home sooner (2 min per ⚡).
- They come home with a discovery. You pick a reply, and they decide whether they like it. It's all logged in the Logbook.
- Travel (from child stage) to 20+ real places, each with its own discoveries and shop exclusives. The first flight is free.

**Goals**
- Schedules: daily, weekdays, X per week, every N days, monthly, yearly, one-time, or **"after last done"** intervals.
- Goal of the day, skip (with a reflection prompt), snooze, undo, pause, and archive.
- Link a goal to an activity (breathing, reflection, timer…) so finishing the activity checks it off.
- Self-care areas with weekly milestones.

**Home upkeep** (the Upkeep tab)
- A library of about 100 maintenance tasks across 14 rooms/areas (HVAC filters, gutters, smoke detectors, dryer vent, oil changes, pets…), or write your own.
- Per-room and overall "home freshness", with overdue / due today / this week / fresh groups, notes (filter sizes, model numbers), completion history, and back-dating ("did it on…").
- Due tasks also appear on Home and earn energy like any goal.
- 14-step challenges with gentler alternatives for every step: Spring Clean, Kitchen Reset, Fall Home Prep, Yard & Garden, Garage Glow-up, Paperwork Pass, and more.

**Self-care toolbox**
- Breathing: 12 patterns, 1–10 minutes.
- Soundscapes: 12 synthesized ambiences you can mix, with a sleep timer.
- Focus/meditation timer.
- Movement routines.
- Quizzes: GAD-7, PHQ-9, PSS-10 and others, with history.
- Grounding: 5-4-3-2-1, rainbow, body scan, butterfly hug…
- Name your emotion, affirmations, acts of kindness.
- A First Aid Kit with helpline links.

**Reflection & insight**
- Mood logger with feelings and factors, plus morning (motivation/intention) and evening (satisfaction) check-ins. A low mood surfaces the First Aid Kit and boosts rewards.
- 40 reflection prompts, a journal with #tags, auto-tagging, and search.
- History calendar: tap any day; forgotten goals can be logged later.
- Insights: mood calendar and trends, mood by weekday, top feelings and factors, goal consistency, upkeep stats, and which tags lift you up or weigh you down.

**Game layer**
- Four shops (outfits, furniture, dyes, travel) with daily rotation, refreshes, an everyday collection, a catalog, selling back at half price, and a daily gift.
- A wardrobe with saved outfits; room decorating across 13 slots with saved rooms.
- Micropets: hatch eggs by completing a linked goal 7 times; 25 species.
- Quests: 3 daily quests, weekly area milestones, and special quests.
- A monthly seasonal event with 5 items plus a micropet.
- Streaks with repair hammers and pause mode.

Everything Finch Plus gates is simply unlocked here. Social features (Tree Town, good vibes, goal buddies) are left out on purpose. Art and shopkeeper names are original.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine + content unit tests
npm run build      # typecheck + production build in dist/
npm run preview    # serve the production build locally
```

## Using it on your phone

**Live at https://bamcrab.github.io/code-finch/**. Open it on your phone and choose **Add to Home Screen** (iOS: Share → Add to Home Screen; Android/Chrome: menu → Install app). It then works offline.

Every push to `main` runs the tests, builds, and redeploys via `.github/workflows/deploy.yml`. Installed copies pick up the new version the next time they're opened. Your data isn't affected, since it lives on the device, not the site.

To host it elsewhere instead, serve `dist/` from any static HTTPS host. It uses relative paths and hash routing, so any sub-path works.

For a quick look over your LAN (no offline or install), run `npm run dev -- --host` and open the printed network URL.

## Your data

- Everything lives in this browser's IndexedDB on this device. The app asks the browser not to evict it.
- **Settings → Your data → Export backup** downloads a JSON file. Import restores it (use this to move between devices).
- The app also keeps an automatic snapshot each day on-device (last 7 days) that you can restore from Settings.
- Clearing site data or uninstalling the browser deletes everything, so export occasionally.

Reminders fire while the app is open or running in the background. A web app can't wake itself when fully closed without a push server.

## How it's built

Vite · React 19 · TypeScript · Tailwind v4 · zustand (+ immer, persisted to IndexedDB) · vite-plugin-pwa. All art is hand-built SVG; all audio is synthesized with Web Audio.

```
src/
  game/      pure game engine (engine.ts: every state mutation) + scheduling, streaks, quests, shop, text analysis, with tests
  state/     zustand store wrapping the engine, UI notice queue, soundscape player, hooks
  data/      content: items, locations, discoveries, prompts, exercises, quizzes, upkeep library, challenges, events
  art/       SVG birb, clothing, furniture, birbhouse, micropets, location scenes
  screens/   one file per screen (home/ and care/ hold sub-screens)
  ui/        kit components, charts, overlays
```
