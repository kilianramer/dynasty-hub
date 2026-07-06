# League Ledger

A self-updating dynasty league site built on the Sleeper API. Standings,
power rankings, predictions, transactions, and auto-generated weekly recaps,
all pulled live from your league -- no manual updates required.

## 1. Find your Sleeper league ID

Open your league on sleeper.com or in the app. The URL looks like:

```
https://sleeper.com/leagues/987654321012345678/team
```

The long number is your league ID.

## 2. Configure locally

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your league ID in for `SLEEPER_LEAGUE_ID`.

## 3. Install and run

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## 4. Deploy to Vercel

1. Push this folder to a new GitHub repo.
2. In Vercel, "Add New Project" and import that repo.
3. Under Environment Variables, add:
   - `SLEEPER_LEAGUE_ID` -- your league ID
   - `CRON_SECRET` -- any random string (used to secure the refresh endpoint)
4. Deploy.

That's it -- `vercel.json` already configures a cron job that hits
`/api/refresh` every 6 hours to force fresh data, and every page also
re-fetches from Sleeper automatically every 15-30 minutes on its own
(see the `revalidate` export at the top of each page in `app/`).

## How the auto-updating works

Next.js caches each Sleeper API call for a set number of seconds
(`revalidate` in `lib/sleeper.js` and at the top of each page). Once that
window passes, the next visitor triggers a background refetch, so the site
stays current without you touching it. The Vercel Cron job is a belt-and-
suspenders way to force that refresh on a schedule even on off-season weeks
with low traffic.

## Customizing

- **Power ranking formula**: `lib/rankings.js` -- weights for win%, scoring
  output, and margin are simple constants you can retune.
- **Predictions model**: `lib/predictions.js` -- an Elo-style curve off
  average scoring margin. Swap in your own model if you want something more
  sophisticated (e.g. incorporating player-level projections).
- **Recap wording**: `lib/recap.js` -- fully templated from box scores. If
  you want richer, more varied prose, this is the spot to wire in a call to
  the Anthropic API (see Anthropic's docs for the Messages API) using that
  week's stats as context.
- **Colors/fonts**: `tailwind.config.js` and `app/layout.jsx`.
- **Real week-over-week movement arrows** on the Power Rankings page: this
  MVP doesn't persist last week's ranks between deploys. To add real
  movement tracking, store last week's ranked order somewhere durable (a
  small database, or Vercel KV) inside `/api/refresh` each time it runs, then
  read it back in `app/power-rankings/page.jsx`.

## Notes

- Uses Sleeper's public read-only API -- no API key or login needed.
- Player name lookups for the Transactions page use Sleeper's full player
  dictionary, which is a few MB; it's cached for 12 hours so it doesn't
  slow down every page load.
