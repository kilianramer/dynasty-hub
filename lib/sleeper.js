const BASE = "https://api.sleeper.app/v1";

// How often (in seconds) Next.js is allowed to serve a cached copy before
// re-fetching from Sleeper in the background. This is what makes the site
// "auto update" without a redeploy: every page visit past this window
// triggers a fresh pull of league data.
const REVALIDATE_SECONDS = 60 * 30; // 30 minutes

function leagueId() {
  const id = process.env.SLEEPER_LEAGUE_ID;
  if (!id) {
    throw new Error(
      "Missing SLEEPER_LEAGUE_ID. Add it to .env.local (see .env.local.example)."
    );
  }
  return id;
}

async function get(path, revalidate = REVALIDATE_SECONDS) {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Sleeper API error on ${path}: ${res.status}`);
  }
  return res.json();
}

export async function getNflState() {
  return get("/state/nfl", REVALIDATE_SECONDS);
}

export async function getLeague() {
  return get(`/league/${leagueId()}`);
}

export async function getRosters() {
  return get(`/league/${leagueId()}/rosters`);
}

export async function getUsers() {
  return get(`/league/${leagueId()}/users`);
}

export async function getMatchups(week) {
  return get(`/league/${leagueId()}/matchups/${week}`);
}

export async function getTransactions(week) {
  return get(`/league/${leagueId()}/transactions/${week}`);
}

// The full player dictionary is several MB and only changes with roster
// moves/injuries league-wide, so it's cached much longer.
export async function getPlayersMap() {
  return get(`/players/nfl`, 60 * 60 * 12);
}

// Convenience: joins rosters + users so every roster has owner display info.
export async function getTeams() {
  const [rosters, users] = await Promise.all([getRosters(), getUsers()]);
  const userById = Object.fromEntries(users.map((u) => [u.user_id, u]));

  return rosters.map((r) => {
    const u = userById[r.owner_id] || {};
    return {
      rosterId: r.roster_id,
      ownerId: r.owner_id,
      teamName:
        u.metadata?.team_name || u.display_name || `Team ${r.roster_id}`,
      displayName: u.display_name || `Team ${r.roster_id}`,
      avatar: u.avatar
        ? `https://sleepercdn.com/avatars/${u.avatar}`
        : null,
      wins: r.settings?.wins ?? 0,
      losses: r.settings?.losses ?? 0,
      ties: r.settings?.ties ?? 0,
      fpts: (r.settings?.fpts ?? 0) + (r.settings?.fpts_decimal ?? 0) / 100,
      fptsAgainst:
        (r.settings?.fpts_against ?? 0) +
        (r.settings?.fpts_against_decimal ?? 0) / 100,
      streak: r.metadata?.streak || null,
    };
  });
}

// Returns the current week, clamped to the regular season, and whether the
// league is mid-season (used to decide which week's data to show by default).
export async function getCurrentWeek() {
  const state = await getNflState();
  return state.week || 1;
}
