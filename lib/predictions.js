// Elo-flavored win probability from each team's average scoring margin.
// A 10-point average-margin edge translates to roughly a 76% win probability;
// tune K to make the curve steeper/flatter.
const K = 12;

export function predictMatchup(teamA, teamB) {
  const diff = teamA.margin - teamB.margin;
  const probA = 1 / (1 + Math.pow(10, -diff / K));
  return {
    teamAWinProb: probA,
    teamBWinProb: 1 - probA,
  };
}

export function buildWeeklyPredictions(matchupPairs) {
  return matchupPairs.map(([teamA, teamB]) => ({
    teamA,
    teamB,
    ...predictMatchup(teamA, teamB),
  }));
}
