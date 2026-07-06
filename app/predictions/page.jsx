import { getTeams, getCurrentWeek, getMatchups } from "@/lib/sleeper";
import { computePowerRankings } from "@/lib/rankings";
import { pairMatchups } from "@/lib/matchupUtils";
import { predictMatchup } from "@/lib/predictions";

export const dynamic = "force-dynamic"; // always render fresh; underlying
// Sleeper fetches are still cached for 1800s via lib/sleeper.js

export default async function PredictionsPage() {
  const [teams, week] = await Promise.all([getTeams(), getCurrentWeek()]);
  const gamesPlayed = Math.max(week - 1, 1);
  const ranked = computePowerRankings(teams, gamesPlayed);
  const byRosterId = Object.fromEntries(ranked.map((t) => [t.rosterId, t]));

  let pairs = [];
  try {
    const matchups = await getMatchups(week);
    pairs = pairMatchups(matchups).filter((p) => p.rosterB);
  } catch {
    pairs = [];
  }

  const predictions = pairs
    .map((p) => {
      const teamA = byRosterId[p.rosterA];
      const teamB = byRosterId[p.rosterB];
      if (!teamA || !teamB) return null;
      return { teamA, teamB, ...predictMatchup(teamA, teamB) };
    })
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <p className="stat text-gold text-xs uppercase tracking-[0.3em] mb-2">
          Week {week} Outlook
        </p>
        <h1 className="font-display text-5xl text-paper leading-none">
          Predictions
        </h1>
        <p className="text-paper/60 mt-3 max-w-2xl">
          Win probabilities from each team's season-long scoring margin --
          treat these as a conversation starter, not gospel.
        </p>
      </div>

      {predictions.length === 0 ? (
        <p className="text-paper/50">
          No matchups posted for this week yet. Check back once the schedule locks.
        </p>
      ) : (
        <div className="space-y-3">
          {predictions.map(({ teamA, teamB, teamAWinProb, teamBWinProb }) => {
            const aFavored = teamAWinProb >= teamBWinProb;
            return (
              <div
                key={`${teamA.rosterId}-${teamB.rosterId}`}
                className="border border-paper/10 rounded-md p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-lg ${aFavored ? "text-paper" : "text-paper/50"}`}>
                    {teamA.teamName}
                  </p>
                  <p className="stat text-xs text-paper/40">vs</p>
                  <p className={`text-lg ${!aFavored ? "text-paper" : "text-paper/50"}`}>
                    {teamB.teamName}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-paper/10 overflow-hidden flex">
                  <div
                    className="h-full bg-gold"
                    style={{ width: `${teamAWinProb * 100}%` }}
                  />
                  <div
                    className="h-full bg-turfLight"
                    style={{ width: `${teamBWinProb * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 stat text-xs text-paper/50">
                  <span>{Math.round(teamAWinProb * 100)}%</span>
                  <span>{Math.round(teamBWinProb * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
