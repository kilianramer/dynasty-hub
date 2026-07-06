import { getTeams, getCurrentWeek } from "@/lib/sleeper";
import { computePowerRankings, withMovement } from "@/lib/rankings";

export const dynamic = "force-dynamic"; // always render fresh; underlying
// Sleeper fetches are still cached for 1800s via lib/sleeper.js

function MovementBadge({ movement }) {
  if (!movement) {
    return <span className="stat text-paper/40 text-xs">—</span>;
  }
  const up = movement > 0;
  return (
    <span className={`stat text-xs ${up ? "text-turfLight" : "text-rust"}`}>
      {up ? "▲" : "▼"} {Math.abs(movement)}
    </span>
  );
}

export default async function PowerRankingsPage() {
  const [teams, week] = await Promise.all([getTeams(), getCurrentWeek()]);
  const gamesPlayed = Math.max(week - 1, 1);

  const ranked = computePowerRankings(teams, gamesPlayed);
  // No historical snapshot storage in this MVP, so movement starts neutral.
  // See README for how to persist previous ranks (e.g. via a small KV store)
  // to populate real week-over-week movement.
  const withArrows = withMovement(ranked, {});

  return (
    <div className="space-y-8">
      <div>
        <p className="stat text-gold text-xs uppercase tracking-[0.3em] mb-2">
          Scouting Report · Through Week {gamesPlayed}
        </p>
        <h1 className="font-display text-5xl text-paper leading-none">
          Power Rankings
        </h1>
        <p className="text-paper/60 mt-3 max-w-2xl">
          Blends win percentage, scoring output relative to league average, and
          average margin -- so a lucky 1-point win counts less than a
          dominant blowout.
        </p>
      </div>

      <div className="space-y-3">
        {withArrows.map((t) => (
          <div
            key={t.rosterId}
            className="border border-paper/10 rounded-md p-5 flex items-center gap-5 hover:border-gold/40 transition-colors"
          >
            <span className="font-display text-3xl text-gold w-10 text-center">
              {t.rank}
            </span>
            <div className="flex-1">
              <p className="text-paper text-lg">{t.teamName}</p>
              <p className="stat text-paper/50 text-xs mt-1">
                {t.wins}-{t.losses}
                {t.ties ? `-${t.ties}` : ""} · avg {t.avgFor.toFixed(1)} PF ·{" "}
                {t.margin >= 0 ? "+" : ""}
                {t.margin.toFixed(1)} margin
              </p>
            </div>
            <MovementBadge movement={t.movement} />
          </div>
        ))}
      </div>
    </div>
  );
}
