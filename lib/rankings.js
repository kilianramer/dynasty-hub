// Computes a 0-100 power score per team from three signals:
//  - win percentage (rewards results)
//  - average points for, relative to league average (rewards raw output)
//  - average scoring margin (rewards dominance, not just squeaking by)
// Weighted blend keeps a hot-but-lucky team from outranking a true powerhouse.
export function computePowerRankings(teams, gamesPlayed) {
  if (!teams.length) return [];

  const played = Math.max(gamesPlayed, 1);
  const leagueAvgFpts =
    teams.reduce((sum, t) => sum + t.fpts, 0) / teams.length / played;

  const scored = teams.map((t) => {
    const winPct = (t.wins + t.ties * 0.5) / Math.max(t.wins + t.losses + t.ties, 1);
    const avgFor = t.fpts / played;
    const avgAgainst = t.fptsAgainst / played;
    const margin = avgFor - avgAgainst;
    const relativeOutput = leagueAvgFpts > 0 ? avgFor / leagueAvgFpts : 1;

    const score =
      winPct * 55 + // results matter most
      Math.min(Math.max(relativeOutput - 1, -0.5), 0.5) * 40 + // scoring vs league avg
      Math.min(Math.max(margin, -20), 20) * 0.5; // margin, capped so blowouts don't dominate

    return { ...t, avgFor, avgAgainst, margin, powerScore: score };
  });

  scored.sort((a, b) => b.powerScore - a.powerScore);
  return scored.map((t, i) => ({ ...t, rank: i + 1 }));
}

// Compares this week's ranking order to last week's to produce movement
// arrows (up/down/steady) for the "signature" ranking-card UI.
export function withMovement(currentRanked, previousRankMap) {
  return currentRanked.map((t) => {
    const prevRank = previousRankMap?.[t.rosterId];
    const movement = prevRank ? prevRank - t.rank : 0;
    return { ...t, movement };
  });
}
