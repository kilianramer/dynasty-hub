import { getTeams, getCurrentWeek, getMatchups } from "@/lib/sleeper";
import { pairMatchups } from "@/lib/matchupUtils";
import { buildWeekRecap } from "@/lib/recap";

export const dynamic = "force-dynamic"; // always render fresh; underlying
// Sleeper fetches are still cached for 1800s via lib/sleeper.js

export default async function RecapsPage() {
  const [teams, week] = await Promise.all([getTeams(), getCurrentWeek()]);
  const teamsByRosterId = Object.fromEntries(teams.map((t) => [t.rosterId, t]));

  const pastWeeks = Array.from({ length: Math.min(week - 1, 6) }, (_, i) => week - 1 - i).filter(
    (w) => w >= 1
  );

  const recaps = await Promise.all(
    pastWeeks.map(async (w) => {
      const matchups = await getMatchups(w).catch(() => []);
      const pairs = pairMatchups(matchups).filter((p) => p.rosterB);
      return buildWeekRecap(w, pairs, teamsByRosterId);
    })
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="stat text-gold text-xs uppercase tracking-[0.3em] mb-2">
          The Archive
        </p>
        <h1 className="font-display text-5xl text-paper leading-none">
          Weekly Recaps
        </h1>
        <p className="text-paper/60 mt-3 max-w-2xl">
          Generated automatically from each week's box scores -- top
          performance, closest finish, and biggest blowout.
        </p>
      </div>

      {recaps.length === 0 ? (
        <p className="text-paper/50">No completed weeks yet this season.</p>
      ) : (
        <div className="space-y-8">
          {recaps.map((r) => (
            <article key={r.headline} className="border border-paper/10 rounded-md p-6">
              <h2 className="font-display text-2xl text-paper mb-4">{r.headline}</h2>
              <div className="space-y-3 text-paper/75 text-sm leading-relaxed">
                {r.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
