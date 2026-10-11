---
name: visual-regression-tests
description: "Requires every significant visual change in the frontend to be covered by an image snapshot in a Cypress component test, using cy.matchImage() from @pixsame/cypress-plugin-visual-regression-diff. Use whenever you add or change React components, JSX markup, CSS, class names, layout, colours, typography, images, or responsive behaviour under frontend/, even if the user does not mention tests, screenshots, or snapshots. Also use when a visual snapshot test fails or baseline images need to be created, updated, or cleaned up."
---

# Cover visual changes with image snapshots

Every significant visual change in `frontend/` ships with a Cypress component test that calls `matchImage()` and a committed baseline image that shows the new look. A visual change is not done until its snapshot exists, you have looked at the baseline image, and the strict run passes.

The plugin is `@pixsame/cypress-plugin-visual-regression-diff`. It is installed and set up in `frontend/cypress.config.ts` and `frontend/cypress/support/component.ts`. Don't change that setup as part of a feature.

## What counts as significant

Needs a snapshot:

- A new component, page, or section.
- A new visual state of an existing component: loading, error, empty, disabled, signed-in or signed-out, long content.
- Changes to layout, spacing, sizing, colours, typography, borders, radii, shadows, icons, or images.
- A new or changed responsive breakpoint (`@media` rule).
- Class name or markup changes that change how something renders.
- Global CSS in `frontend/src/index.css`, such as a `:root` variable. This can change every snapshot, so run the whole suite.

Doesn't need a new snapshot:

- Logic, refactors, or renames with no intended change to the rendered output. Existing snapshots must still pass unchanged. That's the proof. Never update a baseline to make a refactor pass.
- Copy edits. No new test is needed, but update every baseline that shows the old text.
- Non-visual attributes such as `aria-*`, `data-*`, or `alt`, plus test-only and backend changes.

If you touch a component that has no snapshot coverage yet, add snapshots for the states your change affects.

When unsure, add the snapshot. A snapshot costs little, and a missed regression costs more.

## Workflow

Run every command from `frontend/`. First, see [Environment](#environment): the shell this agent runs in usually needs a fix before Cypress can start.

1. **Start from green.** Run `npm run cy:run:component:strict` before you change anything. If snapshots already fail, stop and tell the user. Otherwise you can't tell your diffs from existing ones.
2. **Make the change.**
3. **Write or extend snapshot tests** for every state the change affects, following [Writing snapshot tests](#writing-snapshot-tests). Use the `cypress-author` skill for the non-visual parts of the test.
4. **Run the suite:** `npm run cy:run:component`. When a snapshot fails, the plugin writes `<name>.actual.png` (new render) and `<name>.diff.png` (changed pixels in red) next to the baseline. Open both with the Read tool. Check that the diff covers your intended change and nothing else.
   - An unintended diff is a regression. Fix the code, not the baseline.
   - An intended diff: go to step 5.
5. **Update baselines** only for the specs you meant to change:
   `npm run cy:snapshots:update -- --spec src/path/Component.cy.tsx`
   This re-baselines only the snapshots that fail. Matching ones stay byte-identical.
6. **Look at every new or updated baseline** with the Read tool. Confirm it shows the intended UI fully rendered: no loading placeholders, no missing images, nothing cut off. A baseline you haven't looked at hasn't been reviewed.
7. **Remove orphaned baselines.** A renamed or deleted test leaves its old PNG behind. Run `npm run cy:snapshots:clean` (whole suite) and check `git status` for the deleted PNGs.
8. **Verify:** `npm run typecheck` and `npm run cy:run:component:strict`. The strict run fails on any missing baseline, so it proves every snapshot has a baseline on disk.
9. **Report** to the user: the snapshot tests you added, and every baseline you created, updated, or deleted, each with one line on what changed visually. Baselines are committed together with the change that caused them.

## Writing snapshot tests

Put snapshot tests in the component's existing `*.cy.tsx` file, next to the functional tests:

```tsx
it('matches the visual baseline', () => {
  cy.mount(<Home />);

  cy.get('main').matchImage();
});

it('matches the visual baseline when the profile fails to load', () => {
  cy.intercept('GET', '/api/me', { statusCode: 502, body: { error: 'spotify_error' } });
  cy.mount(<CurrentUser />);

  cy.get('[role="alert"]').should('contain.text', 'Spotify did not respond');
  cy.get('.card').matchImage();
});
```

Rules:

- **One `it` per visual state.** The test title becomes the image file name, for example `src/pages/__image_snapshots__/Home  matches the visual baseline_#0.png`. Keep titles unique and descriptive. Renaming a test orphans its baseline (see step 7).
- **Snapshot the component's root element**, such as `cy.get('main').matchImage()`. Use `cy.matchImage()` (the whole viewport) only when page layout is what you're testing.
- **Wait for the final state first.** `matchImage()` takes the screenshot right away and doesn't retry. Assert on the content that must be visible first, for example `cy.contains(...).should('be.visible')`, so you don't capture a loading state.
- **Make the render deterministic.**
  - Stub every request with `cy.intercept` and fixed payloads. The real API is not running.
  - Don't use `Date.now()`, random values, or live data. Use `cy.clock()` to fix time when the component shows dates.
  - Serve images from `frontend/cypress/fixtures/` through `cy.intercept(..., { fixture: '...' })`. Don't load remote URLs.
  - Wait for images to load before the snapshot: `cy.get('img').should('be.visible').and(($img) => expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0))`.
- **Responsive changes need a snapshot at each affected width.** Call `cy.viewport(width, height)` before `cy.mount`. For example, `.current-user` stacks vertically at 480px and narrower, so use `cy.viewport(400, 700)`. The default viewport is 500×500.
- **Don't snapshot third-party UI** that you don't control, such as Clerk's `UserButton` or sign-in modal. Hide it with `matchImage({ screenshotConfig: { blackout: ['.selector'] } })` or snapshot a narrower element.
- **CSS `:hover` can't be captured.** Cypress can't trigger real hover. Focus states work with `.focus()`. Mention any hover-only change in your report so the user checks it manually.
- **Never weaken the check in test code.** Don't pass `maxDiffThreshold`, `diffConfig`, `updateImages`, or `createMissingImages` to `matchImage()` to make a test pass. If a snapshot is flaky, find the source of the nondeterminism and remove it.

## Configuration

Set in `frontend/cypress.config.ts`, under `expose`:

- `pluginVisualRegressionMaxDiffThreshold: 0`: any changed pixel fails the test. The plugin's default (1% of pixels) only just caught a full recolour of the page heading (1.76%), and would pass a card's corner-radius change (0.04%).
- `pluginVisualRegressionDiffConfig: { threshold: 0.03 }`: the per-pixel colour tolerance. The default 0.1 can't see the difference between `--surface` (#1e1e1e) and `--bg` (#121212). Don't raise it.

Baselines live in `__image_snapshots__/` next to each spec and are committed. `*.actual.png` and `*.diff.png` are gitignored.

npm scripts in `frontend/package.json`:

| Script | What it does |
| --- | --- |
| `cy:run:component` | Runs component tests. Creates baselines that are missing. |
| `cy:run:component:strict` | Same, but fails on a missing baseline. Use it to verify, and in CI. |
| `cy:snapshots:update` | Re-baselines failing snapshots. Always scope it with `-- --spec <file>`. |
| `cy:snapshots:clean` | Deletes baselines that no test uses anymore. **Never** add `--spec`: it would delete the baselines of every spec that didn't run. |
| `cy:open` | Interactive runner. A failing snapshot shows a "See comparison" button. |

Cypress keeps only the last `--expose` flag, and every script above already sets one. To combine plugin options, call Cypress directly: `npx cypress run --component --expose "pluginVisualRegressionUpdateImages=failures-only,pluginVisualRegressionCreateMissingImages=false"`.

## Environment

- **`bad option: --smoke-test`** or **`Cypress failed to start`**: the shell inherited `ELECTRON_RUN_AS_NODE=1` from VS Code. Clear it for the command: `unset ELECTRON_RUN_AS_NODE` in Bash, or `Remove-Item Env:ELECTRON_RUN_AS_NODE` in PowerShell.
- **`No version of Cypress is installed`**: run `npx cypress install`.
- **Baselines depend on the platform.** The app uses the `system-ui` font, and the baselines were rendered on Windows by headless Electron (`cypress run`). On another OS, every snapshot that contains text fails with font-only diffs. That's the environment, not a regression. Tell the user and don't re-baseline the suite without their approval.
