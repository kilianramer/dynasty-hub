import { getTeams, getCurrentWeek, getMatchups, getLeague } from "@/lib/sleeper";
import { pairMatchups } from "@/lib/matchupUtils";
import { buildWeekRecap } from "@/lib/recap";

export const dynamic = "force-dynamic"; // always render fresh; underlying
// Sleeper fetches are still cached for 1800s via lib/sleeper.js

export default async function StandingsPage() {
  const [teams, week, league] = await Promise.all([
    getTeams(),
    getCurrentWeek(),
    getLeague(),
  ]);

  const sorted = [...teams].sort((a, b) => {
    const wa = a.wins + a.ties * 0.5;
    const wb = b.wins + b.ties * 0.5;
    if (wb !== wa) return wb - wa;
    return b.fpts - a.fpts;
  });

  const teamsByRosterId = Object.fromEntries(teams.map((t) => [t.rosterId, t]));
  let recap = null;
  try {
    const lastWeek = Math.max(week - 1, 1);
    const matchups = await getMatchups(lastWeek);
    const pairs = matchups.length ? pairMatchups(matchups) : [];
    recap = buildWeekRecap(lastWeek, pairs.filter((p) => p.rosterB), teamsByRosterId);
  } catch {
    recap = null;
  }

  return (
    <div className="space-y-12">
      <section>
        <p className="stat text-gold text-xs uppercase tracking-[0.3em] mb-2">
          {league?.name || "Dynasty League"} · Week {week}
        </p>
        <h1 className="font-display text-5xl text-paper leading-none mb-4">
          Standings
        </h1>
        {recap && (
          <p className="text-paper/70 max-w-2xl">{recap.paragraphs[0]}</p>
        )}
      </section>

      <section className="border border-paper/10 rounded-md overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="ledger-row text-paper/50 stat text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-normal">#</th>
              <th className="py-3 px-4 font-normal">Team</th>
              <th className="py-3 px-4 font-normal text-right">W</th>
              <th className="py-3 px-4 font-normal text-right">L</th>
              <th className="py-3 px-4 font-normal text-right">T</th>
              <th className="py-3 px-4 font-normal text-right">PF</th>
              <th className="py-3 px-4 font-normal text-right">PA</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => (
              <tr key={t.rosterId} className="ledger-row hover:bg-paper/5">
                <td className="py-3 px-4 stat text-gold">{i + 1}</td>
                <td className="py-3 px-4 text-paper">{t.teamName}</td>
                <td className="py-3 px-4 stat text-right text-paper">{t.wins}</td>
                <td className="py-3 px-4 stat text-right text-paper">{t.losses}</td>
                <td className="py-3 px-4 stat text-right text-paper/60">{t.ties}</td>
                <td className="py-3 px-4 stat text-right text-paper">
                  {t.fpts.toFixed(1)}
                </td>
                <td className="py-3 px-4 stat text-right text-paper/60">
                  {t.fptsAgainst.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
