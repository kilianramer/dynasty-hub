// Sleeper returns one row per roster per week, linked by matchup_id.
// This groups them into head-to-head pairs: { rosterA, scoreA, rosterB, scoreB }.
export function pairMatchups(matchups) {
  const byId = new Map();
  for (const m of matchups) {
    if (!byId.has(m.matchup_id)) byId.set(m.matchup_id, []);
    byId.get(m.matchup_id).push(m);
  }

  const pairs = [];
  for (const [, entries] of byId) {
    if (entries.length === 2) {
      const [a, b] = entries;
      pairs.push({
        rosterA: a.roster_id,
        scoreA: a.points || 0,
        rosterB: b.roster_id,
        scoreB: b.points || 0,
      });
    } else if (entries.length === 1) {
      // Bye week or uneven roster count.
      const [a] = entries;
      pairs.push({ rosterA: a.roster_id, scoreA: a.points || 0, rosterB: null, scoreB: 0 });
    }
  }
  return pairs;
}
