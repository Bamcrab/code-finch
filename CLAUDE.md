# code-finch

Personal, subscription-free Finch clone (self-care pet + home upkeep). Local-first PWA. See README.md for features and layout.

## Commands
- `npm run dev` (launch config `finch-dev` serves on 5178), `npm test`, `npm run build` (runs `tsc -b` first), `npm run icons` (regenerates PWA PNGs from the SVG in scripts/make-icons.mjs).

## Architecture rules
- **All state changes go through `src/game/engine.ts`** as `(s: GameState, ctx: Ctx, ...args)` functions that mutate an immer draft and push UI notices onto `ctx.notices`. `src/state/store.ts` wraps each one (runs `sync` first for day rollover/adventure completion). Add new actions to the `ACTIONS` map there, and cover rules with tests in `src/game/*.test.ts` (Node, no DOM).
- `GameState` shape lives in `src/state/types.ts`. When adding persisted fields, give them defaults in `initialState` so `normalize()` backfills old saves and imports.
- Content is data in `src/data/`. New clothing/furniture needs a style in `styles.ts` **and** an art function in `art/clothing.tsx` / `art/furniture.tsx` (enforced by `art/art.test.ts`).
- Charts follow the dataviz rules: one series in `--viz-series`, the mood scale is a validated diverging ramp (`--mood-1..5` + `--mood-ink-*`), and every chart has a table view.

## Gotchas
- zustand v5: never build new arrays/objects inside a `useGame(selector)`. Select raw slices and `useMemo`, or React loops forever.
- Persist uses async IndexedDB. Store actions and `tick` no-op until `useGame.persist.hasHydrated()`; otherwise the initial state overwrites the save.
- Use braced `useEffect` bodies: `window.scrollTo` returns a Promise in current Chromium and React treats it as a cleanup.
- Session screens (breathing, quiz, movement, grounding, reflection) are keyed by their route param so switching items remounts them.
- Dev builds expose the store as `window.__finch` for testing (e.g. finish an adventure: set `adventure.endsAt` in the past, then `actions.tick()`).
