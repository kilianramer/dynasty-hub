import { getTeams, getCurrentWeek, getTransactions, getPlayersMap } from "@/lib/sleeper";

export const dynamic = "force-dynamic"; // always render fresh; underlying
// Sleeper fetches are still cached for 900s via lib/sleeper.js

const TYPE_LABEL = {
  trade: "Trade",
  waiver: "Waiver Claim",
  free_agent: "Free Agent Move",
};

export default async function TransactionsPage() {
  const [teams, week] = await Promise.all([getTeams(), getCurrentWeek()]);
  const teamsByRosterId = Object.fromEntries(teams.map((t) => [t.rosterId, t]));

  const weeksToShow = Array.from({ length: Math.min(week, 3) }, (_, i) => week - i).filter(
    (w) => w >= 1
  );

  const [allTx, players] = await Promise.all([
    Promise.all(weeksToShow.map((w) => getTransactions(w))),
    getPlayersMap().catch(() => ({})),
  ]);

  const transactions = allTx
    .flat()
    .filter((tx) => tx.status === "complete")
    .sort((a, b) => (b.status_updated || 0) - (a.status_updated || 0));

  const playerName = (id) => {
    const p = players?.[id];
    return p ? `${p.first_name} ${p.last_name}` : `Player ${id}`;
  };

  const teamName = (rosterId) => teamsByRosterId[rosterId]?.teamName || `Team ${rosterId}`;

  return (
    <div className="space-y-8">
      <div>
        <p className="stat text-gold text-xs uppercase tracking-[0.3em] mb-2">
          Recent Activity
        </p>
        <h1 className="font-display text-5xl text-paper leading-none">
          Transactions
        </h1>
      </div>

      {transactions.length === 0 ? (
        <p className="text-paper/50">No transactions logged for recent weeks.</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.transaction_id} className="border border-paper/10 rounded-md p-5">
              <p className="stat text-xs uppercase tracking-wider text-gold mb-2">
                {TYPE_LABEL[tx.type] || tx.type}
              </p>
              <div className="text-paper/80 text-sm space-y-1">
                {Object.entries(tx.adds || {}).map(([playerId, rosterId]) => (
                  <p key={`add-${playerId}`}>
                    <span className="text-turfLight">+</span> {teamName(rosterId)} added{" "}
                    {playerName(playerId)}
                  </p>
                ))}
                {Object.entries(tx.drops || {}).map(([playerId, rosterId]) => (
                  <p key={`drop-${playerId}`}>
                    <span className="text-rust">-</span> {teamName(rosterId)} dropped{" "}
                    {playerName(playerId)}
                  </p>
                ))}
                {(tx.draft_picks || []).map((pick, i) => (
                  <p key={`pick-${i}`}>
                    {teamName(pick.owner_id)} receives {pick.season} round {pick.round} pick
                    (from {teamName(pick.previous_owner_id)})
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
