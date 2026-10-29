# Operate term toggle and pricing sheet

James asked for the Term block to be a toggle that can price both terms so the client picks. Pricing follows Bloom's pricing sheet. He chose six months and one year only, and keeping the company logo in the header with the Bloom mark in the footer only.

## Pricing sheet

- One base rate, $200 an hour. Each 40 hours a week past the first takes $10 off. Twelve months takes another $20 off.
- The sheet:

  | | Six months | Twelve months |
  |---|---|---|
  | 40 hours | $200 | $180 |
  | 80 hours | $190 | $170 |
  | 120 hours | $180 | $160 |

- `base_rates` stores the six-month rates for 40, 80, and 120 hours. The twelve-month rate is derived.
- The Baseline dialog edits only the base and previews the sheet.

## Terms

- `deals.term_length` is now `six-month`, `one-year`, or `both`. A stored `multi-year` reads as `one-year`.
- `deals.selected_term` records the term the client chose, together with `selected_package_id`.
- `packages.year_list_rate_cents` and `packages.year_cash_rate_cents` hold custom twelve-month rates. When they are null, the twelve-month rate is the six-month rate minus $20.

## Letter

- When both terms are offered, the Term block is a radio toggle. Every offer reprices to the term showing.
- A choice made on one term is not shown as chosen on the other.
- With one term offered, the Term block is a plain label.

## Editor

- The Term block is the same toggle plus a "Both terms" switch. With one term, the toggle sets the offered term. With both, it picks which term is being priced.
- Custom-rate inputs edit the term that is showing.

## Migration

The migration was additive SQL. Amplifier Health's custom one-year prices moved into the twelve-month columns. Its six-month prices are those plus $20, and its saved pick is marked one year.
