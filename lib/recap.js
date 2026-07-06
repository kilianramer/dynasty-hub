// Turns a week's completed matchups into a templated written recap.
// No LLM call required -- everything here is derived directly from the
// numbers, so it's free and instant on every page load.
export function buildWeekRecap(week, pairedResults, teamsByRosterId) {
  const name = (rosterId) => teamsByRosterId[rosterId]?.teamName || `Team ${rosterId}`;

  const games = pairedResults.map((g) => ({
    ...g,
    margin: Math.abs(g.scoreA - g.scoreB),
    winner: g.scoreA >= g.scoreB ? g.rosterA : g.rosterB,
    loser: g.scoreA >= g.scoreB ? g.rosterB : g.rosterA,
    winnerScore: Math.max(g.scoreA, g.scoreB),
    loserScore: Math.min(g.scoreA, g.scoreB),
  }));

  if (!games.length) {
    return {
      headline: `Week ${week}: nothing to report yet`,
      paragraphs: [
        "Scores haven't posted for this week yet. Check back once games kick off.",
      ],
    };
  }

  const highestScore = games.reduce((a, b) =>
    Math.max(a.scoreA, a.scoreB) > Math.max(b.scoreA, b.scoreB) ? a : b
  );
  const closest = games.reduce((a, b) => (a.margin < b.margin ? a : b));
  const blowout = games.reduce((a, b) => (a.margin > b.margin ? a : b));

  const paragraphs = [
    `Week ${week} is in the books. ${name(highestScore.winner)} put up the week's top score at ${highestScore.winnerScore.toFixed(
      1
    )} points, leading the league.`,
    `The nail-biter of the week came down to ${name(closest.winner)} edging out ${name(
      closest.loser
    )} by just ${closest.margin.toFixed(1)} points.`,
    `On the other end, ${name(blowout.winner)} ran away with a ${blowout.margin.toFixed(
      1
    )}-point win over ${name(blowout.loser)} -- the largest margin of the week.`,
  ];

  return {
    headline: `Week ${week} Recap`,
    paragraphs,
    games,
  };
}
