# Operate term blocks

When both terms are on, James wants the letter to show each one as its own block: a header with the term, the weeks, and the start and end dates, and the deal's services priced for that term. The client picks one whole block. Services will be added into the blocks. On 2026-10-29 he chose:

- A block is one bundle. Every service line in it is included; the client picks a block, not a row. Staff set the hours per service.
- Staff set one start date per deal, defaulting to the next Monday. Six months runs 26 weeks, one year 52, and each ends on the Friday nearest its last day.
- The client no longer sees a Term toggle. The blocks replace it; staff keep the toggle in the editor.

This replaces the hours decision in `2026-10-29-operate-equity-choice-design.md`. Equity stays first.

## Client letter

1. **Equity block.** Unchanged: "All cash" or "Cash and equity", then the dollars per hour, in $10 steps. The steps run up to the most expensive line in any offered term above the floor.
2. **Term blocks.** One per offered term, stacked. The header reads "Six months" and "26 weeks · Nov 2, 2026 – Apr 30, 2027". Each service line shows its rate and weekly amount, struck list and cash with equity. The totals show the weekly total (with more than one line), the cash over the term, and the equity dollars with the ownership percentage. A sentence follows.
3. There is no Term block. A stored one is dropped when the deal is read.

Choosing a block saves `selected_term` and `selected_equity_cents`. `selected_package_id` is cleared. The server checks that the term is offered and the step is one the deal allows.

## Data

- `deals.start_date date`, nullable. Null reads as the next Monday.
- A deal's enabled `packages` rows are its service lines, in `sort_order`. Rows no longer mirror the base rate sheet.
- Without custom rates, each line's price comes from the sheet for its hours at read time. Saving the base rate only writes `base_rates`.
- Amplifier Health kept its chosen 80-hour line. Its 40- and 120-hour rows were switched off, not deleted.

## Editor

- A full-width offer bar sticks under the top bar, above the letter: the term pills (Ink when on, no surrounding stroke), the Starts date, Custom rates, and Add service on the right.
- The deal controls (Details, Staff only, Copy link, Open as client, Save) sit in the top bar after the breadcrumb, through a slot in the staff shell.
- Offers shows every offered term's block. Service names and hours edit in place and carry to every block. Custom rates edit per term in place.
- "Add service" adds a Design Engineering line at 40 hours on the sheet. Each line can be removed while more than one remains. A deal holds up to 12 lines.

## Pipeline

Hours per week is the bundle's total. Rate is the bundle's cash per hour. Equity and value are the bundle's totals over the client's term at their equity step.
