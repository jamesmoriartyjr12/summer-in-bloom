# Operate equity choice

James wants the client to make three decisions: equity, then term, then hours. Both terms can be offered at once, and cash never drops below $150 an hour unless overridden. On 2026-10-29 he chose:

- Equity comes first.
- The client picks the amount.
- The equity basis is chosen per deal, with a default from the round.
- The valuation carries a pre/post-money switch.
- The client sees the ownership percentage.
- Any staff member can lower the floor, with a warning.

## Client letter

1. **Equity block.** "All cash" or "Cash and equity". With equity, the client picks the dollars per hour that move into equity, in $10 steps, up to what the most expensive offer allows above the floor.
2. **Term block.** A radio toggle when both terms are offered, or a label when one is.
3. **Offers.** A row per hours option. With equity on, each row shows the struck list rate and the cash rate, the weekly amounts, and the equity dollars over the term with the ownership percentage.

Choosing a row saves `selected_package_id`, `selected_term`, and `selected_equity_cents`. The server checks the step against the steps that term allows.

## Math (`lib/operate/equity.ts`)

- The cash rate is `max(floor, list − step)`. A list rate at or under the floor stays whole.
- Ownership is `credited ÷ post-money`:
  - `credited` is the equity dollars, times the multiplier when the basis is Multiplier.
  - `post-money` is the valuation, plus the equity dollars when the valuation is pre-money.
  - With the Whole percentage basis, the result rounds up to a whole percent.
- The default basis is Multiplier (2×) for Pre-seed, Seed, Angel, and Friends rounds, and Dollar for dollar otherwise.
- Ownership is computed on the server for every step. The valuation never reaches the client's page.

## Editor

- **Equity block.** An "Equity offered" switch and a preview of the client's control.
- **Term block.** Two separate switches. One always stays on.
- **Offers block.** Custom list rates for the term showing, with a "Showing" switch when both terms are offered.
- **Staff only.** Round, valuation, pre/post-money, equity basis, multiplier, and cash floor. The floor warns below $150.

## Data

The migration was additive. It added `valuation_basis`, `equity_basis`, `equity_multiplier_tenths`, `cash_floor_cents`, and `selected_equity_cents` to `deals`. Amplifier Health's existing pick became a $30/hr step, which keeps their chosen 80-hour, one-year package at $150 cash.
