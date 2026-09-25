# Ideas (not built)

## Villager errands (offline tasks)
Happy/trusted-enough villager can be sent on an errand: fetch a small fixed
resource batch, ready when you next open the app. Real-time delta via
timestamp, capped amount, no exponential growth.

Tension: spec says avoid idle/offline mechanics — this brushes against that.
Keep it framed as a relationship reward (one clear win, capped), not a
production loop, if built.

Needs: a happiness/trust stat per villager (doesn't exist yet), timestamp-based
catch-up calc on load.

Errand type/speed could depend on villager age (doesn't exist as a field
either): Pike (young) faster but riskier/smaller-yield errands, Agatha/Tomas
(elder) slower but reliable or flavor-only. Ties errands to who they already
are instead of a generic uniform system.

## Not built this round (deliberately skipped)
A divergent "make it more fun" brainstorm pass, prompted by the vertical
slice not feeling mechanically replayable, produced 8 ranked ideas. Four got
built: town charters (river/forest/mine), five-swing mining with
minesweeper-style ore hints, push-your-luck chopping, and a boat-vs-nets
active/passive fishing split. Four were scoped out:

- **Decline for salvage** — turning a decline into a resource payout.
  Conflicts directly with the already-documented design principle that
  declines are non-punishing and reconsiderable (`declineAftermath`,
  `undeclineProject`) — paying out on decline would make it a strategy to
  farm, not a real choice. Skipped on principle, not just time.
- **Alternative project payment paths** — letting some projects be paid in
  more than one resource combination. Real depth, but needs a cost-picker UI
  and touches every `renderProposals()` cost-string call; too much surface
  for what it adds this round.
- **Build-or-bank successes** — banking surplus minigame hits toward the
  next project instead of a flat resource pool. Push-your-luck chopping
  already covers the "risk vs. bank" itch; a second banking system on top
  would be redundant this round.
- **Fork every favor** — giving each `VILLAGERS[].favor` a branching
  outcome instead of one fixed `scene`. Good idea, just bigger than a
  single-sitting change across 7 villagers; a candidate for next time.

## Not built tonight (deliberately skipped)
Timed villager errands (offline-catch-up idle rewards), daily rotations,
trust/relationship meters, procedural quests, and longer build timers were
all considered and explicitly skipped — they trend toward the
daily-obligation/idle shape the spec rules out. The mining minigame's
stacked randomness (1-3 hits, 30% empty rocks) was flagged as the closest
thing to variable-ratio grinding but judged not a real dark pattern given
unlimited free attempts; left as-is.

See README.md for what's actually built.
