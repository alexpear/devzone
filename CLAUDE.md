# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**devzone** is a testbed repo for prototyping software projects. It is a Node.js package (v0.1.0) licensed under CC0-1.0.

This repo contains multiple projects:

- **blueskybot/** — A Bluesky bot that posts a daily "On This Day in History" event. Runs as a one-shot TypeScript script triggered by GitHub Actions cron at 8:00 AM UTC. Entry point: `blueskybot/src/main.ts`.
- **mapgame/** — A mobile web game showing the player's GPS position on a Leaflet/OSM map with objectives at every 0.01° grid intersection. Vanilla TypeScript compiled with `tsc` to `dist/`, no bundler. Open `mapgame/index.html` in a browser to play.

## Commands

- `npm start` — Run the bot (posts today's event to Bluesky)
- `npm run preview` — Preview today's post (uses local timezone)
- `npm run preview:random` — Preview a random day's post
- `npm run typecheck` — Type-check with `tsc --noEmit`
- `npm test` — Type-check + run unit tests via `node:test`
- `tsc -p mapgame/tsconfig.json` — Compile mapgame TypeScript to `mapgame/dist/`

## Architecture

- **Runtime**: Node.js 20+, TypeScript executed via `tsx` (no build step)
- **Module system**: ESM (`"type": "module"` in package.json)
- `blueskybot/src/main.ts` — Entry point: loads CSV, matches today's date (UTC), authenticates, posts, exits
- `blueskybot/src/csv.ts` — RFC 4180 CSV parser (handles quoted fields) and date-matching via `Intl.DateTimeFormat`
- `blueskybot/src/post.ts` — Post formatting (grapheme-aware truncation at 300), `RichText` facet detection, Bluesky API calls via `@atproto/api`
- `blueskybot/src/preview.ts` — Local preview script (uses local timezone, no Bluesky auth needed)
- `blueskybot/src/csv.test.ts` — Unit tests for CSV parsing, date matching, and leap year boundaries
- `blueskybot/src/post.test.ts` — Unit tests for post formatting and truncation
- `blueskybot/data/events.csv` — 366 entries, format: `date,event,year` (year is optional). Quoted fields with commas are supported.
- `.github/workflows/post.yml` — Daily cron at 8:00 AM UTC + manual trigger

### mapgame

- `mapgame/index.html` — Entry point, loads Leaflet via CDN + `dist/main.js`
- `mapgame/src/main.ts` — Map init, GPS tracking, objective grid rendering, localStorage stubs
- `mapgame/tsconfig.json` — Compiles `src/` to `dist/`, `types: []` to avoid pulling in `@types/node`
- Leaflet is a global (`declare const L: any`), not an import

## Key Details

- Imports use `.js` extensions (required by Node ESM resolution with TypeScript)
- `import 'dotenv/config'` loads env vars without overriding existing ones (safe for CI)
- `RichText.detectFacetsWithoutResolution()` handles the `#OnThisDay` hashtag (no network call needed)
- Credentials (`BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`) come from env vars / GitHub secrets

## Repository

- GitHub: https://github.com/alexpear/devzone
- Author: alexpear
- License: CC0-1.0
