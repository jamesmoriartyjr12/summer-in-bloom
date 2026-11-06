# Operate letter canvas

James asked for the deal page to feel like building the letter inline with widgets, instead of filling a rail beside it. He chose blocks, with the set Greeting, Term, Offers, and Divider, and approved this design on 2026-10-29.

## Blocks

- A deal stores `letter_blocks jsonb`, an ordered list of `{ id, type }`. Greeting also stores `text`.
- Greeting, Term, and Offers can appear once. Divider can repeat. A letter holds at most 24 blocks.
- A deal with no blocks, or with blocks that fail to parse, gets the default: Greeting, Term, Offers.
- The greeting text holds `{company}`, which renders as the company name in Orange. It is at most 280 characters.
- Equity is not a block. The equity sentence is part of Offers.

## Editor

- The deal page renders `LetterFrame` with each block wrapped in a shell. On the left is a gutter with move up, move down, and remove. Below is a "+" menu, which disables block types that can't be added again.
- Greeting: click to edit in a textarea set in the greeting type. It returns to the headline on blur, Enter, or Escape.
- Term: a select for six months, one year, or multi-year.
- Offers: switches for custom rates and equity. With custom rates on, the rates are inputs in place: list, plus cash when equity is on.
- Toolbar: All deals, Details (popover), Staff only (popover), Copy link, Open as client, and Save. Save is enabled only when there are changes.
- `/operate/new` uses the same canvas. The first save creates the deal and moves to its page.

## Client

`DealLetter` maps the same blocks in the same order, with no controls. Selecting a package works as before.

## Data

The column was added with `alter table deals add column if not exists letter_blocks jsonb`. `parseBlocks` validates every read and write.
