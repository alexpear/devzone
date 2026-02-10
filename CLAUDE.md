# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**devzone** is a testbed repo for prototyping software projects. It is a Node.js package (v0.1.0) licensed under CC0-1.0. 

This repo contains a Bluesky bot that posts a daily "On This Day in History" event. It runs as a one-shot TypeScript script triggered by GitHub Actions cron at midnight UTC. Data comes from a hand-curated CSV (`data/events.csv`). The entry point is `main.ts`.

## Commands

- `npm start` — Run the bot (posts today's event to Bluesky)
- `npm run typecheck` — Type-check with `tsc --noEmit`
- `npm test` — Same as typecheck (no test runner configured)

## Architecture

- **Runtime**: Node.js 20+, TypeScript executed via `tsx` (no build step)
- **Module system**: ESM (`"type": "module"` in package.json)
- `src/main.ts` — Entry point: loads CSV, matches today's date, authenticates, posts, exits
- `src/csv.ts` — Hand-rolled CSV parser and UTC date-matching via `Intl.DateTimeFormat`
- `src/post.ts` — Post formatting (grapheme-aware truncation at 300), `RichText` facet detection, Bluesky API calls via `@atproto/api`
- `data/events.csv` — 366 entries, format: `date,event,year` (year is optional). Event text may contain commas; parser uses `lastIndexOf(',')` to split
- `.github/workflows/post.yml` — Daily cron at midnight UTC + manual trigger

## Key Details

- Imports use `.js` extensions (required by Node ESM resolution with TypeScript)
- `import 'dotenv/config'` loads env vars without overriding existing ones (safe for CI)
- `RichText.detectFacetsWithoutResolution()` handles the `#OnThisDay` hashtag (no network call needed)
- Credentials (`BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`) come from env vars / GitHub secrets

## Repository

- GitHub: https://github.com/alexpear/devzone
- Author: alexpear
- License: CC0-1.0
