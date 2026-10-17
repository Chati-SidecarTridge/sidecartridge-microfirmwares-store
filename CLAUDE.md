# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Public catalog ("store") of the **microfirmwares** (a.k.a. microservices) available for the
various **SidecarTridge Multidevice** platforms and publishers, live at
https://md-store.sidecartridge.com/. Anyone can browse it with no device attached. Installing
happens on the device, so the site deliberately offers no download button.

**Stack: plain static, no build.** The repo root is served as-is. There is no npm/bundler/TypeScript
toolchain and no unit-test suite. The UI is a single `index.html` (Alpine.js from jsDelivr, all app
logic in one inline `<script>`) plus `styles.css`. Python tools under `tools/` are stdlib-only
maintainer scripts whose output is committed; nothing builds the site at deploy time.

Code comments cite decision ids (`D-01`, `D-19`, `C-03`, ...) and epics (`EPIC-14`). Those live in
the git-ignored backlog under `docs/epics/`, so they may not be readable here. Keep citing them in
the same style when changing the code they annotate.

## Commands

```bash
python3 -m http.server 8000                         # run locally, open http://localhost:8000/

python3 tools/build_catalog.py --check --strict     # what the required PR check runs (needs jsonschema)
python3 tools/build_catalog.py --check              # validate only, write nothing
python3 tools/build_catalog.py                      # rebuild every platform and channel
python3 tools/build_catalog.py --platform atari-st --channel test

python3 tools/build_guide.py                        # regenerate the build-guide step pages

./docs/epics/cockpit.sh                             # regenerate the local backlog dashboard
```

Without `jsonschema` importable, `build_catalog.py` silently falls back to a lenient structural
check, so `--strict` results are only authoritative in an environment that has it installed.

Useful URL flags when testing the UI: `?data=test` loads fixtures from `test/` (all six platforms,
fake apps), `?channel=test|dev` switches release channel, `?downloadable` reveals `.uf2` link and
md5. Deep links are `#<platform>` and `#<platform>/<uuid>`.

## Catalog data flow

```
origins/<platform>[-<channel>].json   registry: which creator origins feed a channel (hand-edited)
        │  tools/build_catalog.py fetches each origin's apps.json (server-side, HTTP or HTTPS),
        │  validates against schema/apps.schema.json, tags apps with creator + official,
        │  drops uuids in blacklist/<platform>.json, dedupes by uuid (official origin wins),
        │  canonicalizes device names from platforms.json
        ▼
<platform>/apps.json | apps-test.json | apps-dev.json   consolidated catalog (GENERATED, committed)
        ▼
index.html loads platforms.json, then one consolidated catalog per platform
```

- **Never hand-edit `<platform>/apps*.json`.** They are overwritten by the build. Change the
  registry, the blacklist, or the upstream origin instead.
- Each registry has exactly one `official: true` origin (SidecarTridge). Creator origins use a
  remote `url`, not an in-repo `source`.
- Channels build independently: a failing `test`/`dev` channel leaves its previous file in place
  and only warns; a failing `stable` channel is fatal. The `dev` channel is official-only.
- `platforms.json` lists the platforms the site shows (only `atari-st` today); `test/platforms.json`
  is the fixture equivalent with all six. Platform logos are in `assets/platforms/`.
- Schemas in `schema/` are the contracts: `apps` (creator-hosted file), `origins` (registry),
  `catalog` (build output), `blacklist`. Top-level `_comment` / `_example_*` keys in registries and
  blacklists are inert documentation the build ignores.
- App `description` is untrusted third-party HTML, rendered through the whitelist `sanitize()` in
  `index.html`. Preserve that when touching rendering.

`CREATORS.md` is the external contract for creators (fields, rules, failure messages). The
`publish-to-the-store` skill in `.claude/skills/` walks a creator through adding an origin. Keep
both in step with schema or build-tool changes.

## CI and deploy

- `deploy.yml`: every push to `main` uploads the repo root to GitHub Pages (`CNAME` holds the
  domain, `.nojekyll` disables Jekyll).
- `validate-origins.yml`: the required `validate` check on every PR. It runs the strict check only
  when the PR touches `origins/`, `blacklist/`, `schema/` or `tools/build_catalog.py`, otherwise it
  passes as a no-op so the required check always reports.
- `rebuild-catalog.yml`: daily at 06:00 UTC (or manual) re-runs the build to pick up changes in
  remote origins and commits any changed catalogs as `github-actions[bot]`, pushing with the
  `REBUILD_TOKEN` admin PAT so it bypasses branch protection and triggers a deploy. Run it by hand
  to make a blacklist or registry change visible immediately.

## Build guide (`/build/`)

`build/atari-st/01..11-*.html` are **generated** by `tools/build_guide.py` from
`tools/guide-src/NN.html` (hero and content only); the script stamps byte-identical chrome, step
rail and pager onto each. Edit the source and re-run, never the generated page. `build/index.html`,
`build/atari-st/index.html`, `build/guide.css`, `build/guide.js` and `404.html` are hand-written but
carry the same chrome block, so a chrome change has to be made in the generator and in each of
those. Adding a step means a new `STEPS` entry plus a source file, and a manual update to the track
index. Details in `tools/guide-src/README.md`.

## Catalog widget (`widget/`)

`widget/carousel.js` is an embeddable carousel for other sites (e.g. the docs). It fetches
`<platform>/apps.json` from the live store, renders in a shadow root with `widget/carousel.css`,
supports `data-platform` and `data-creator`, and links cards to the store's deep links.
`widget/index.html` is the snippet and preview page. Because it runs on third-party pages, it
builds DOM without inserting catalog HTML.

## Cookie banner and analytics (`consent/`)

Every page shares sidecartridge.com's cookie banner and GA4 property (`G-6VT9RXTJ2N`), as
magic.sidecartridge.com does. `consent/cookieconsent.{js,css}` are verbatim copies of the main
site's orestbida/cookieconsent v2.9.2 (sibling repo `../sidecartridge-website`, `assets/`);
`consent/consent.js` is its `_includes/framework/cookie-consent.html` config with
`cookie_domain: 'sidecartridge.com'` on `*.sidecartridge.com` (so one `cc_cookie` covers both sites)
and real privacy/contact links. If the main site changes its banner or GA ID, copy the change here.

- Each page's `<head>` carries the same four-tag block; the guide pages get it from
  `tools/build_guide.py`. A new page needs that block and the footer's `data-cc="c-settings"`
  "Cookies" link.
- `consent/analytics.js` is included only as `type="text/plain" data-cookiecategory="analytics"`
  with `data-src`, so it runs only after consent, and it only loads gtag on `*.sidecartridge.com`.
- Nothing may reach Google before consent: no Google Fonts or Google-hosted CDNs.
- `widget/carousel.js` runs on other sites and must stay free of banner and tracking.

## Backlog

`docs/epics/` holds the epics/stories/tasks tracker and is **git-ignored** (local-only).

---

## Working style

These behavioral guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think before coding

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity first

Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical changes

Touch only what you must. Clean up only your own mess.
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- When your changes orphan an import/variable/function, remove it. Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### 4. Goal-driven execution

Define success criteria. Loop until verified.
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan with a verification check per step.

### 5. No AI attribution

Never add AI-tool attribution to commits, PR descriptions, code comments,
docs, or any other artifact. This means **no**:
- "Generated with Claude Code", "Co-authored by Claude", "Made with ChatGPT",
  or any similar phrasing.
- `Co-Authored-By: Claude …`, `Co-Authored-By: ChatGPT …`, or any other
  AI co-author trailer.
- "AI-assisted", "written with the help of an LLM", etc., as comments or
  changelog entries.

Write the message as the human author. Do not mention AI tools used to
produce the work.
