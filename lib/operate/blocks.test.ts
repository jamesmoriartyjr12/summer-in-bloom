import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canAddBlock,
  defaultBlocks,
  DEFAULT_GREETING,
  greetingForEditing,
  greetingFromEditing,
  greetingParts,
  moveBlock,
  parseBlocks,
} from "./blocks";

describe("letter blocks", () => {
  it("falls back to the default letter", () => {
    assert.deepEqual(parseBlocks(null), defaultBlocks());
    assert.deepEqual(
      defaultBlocks().map((block) => block.type),
      ["greeting", "equity", "term", "offers"],
    );
  });

  it("keeps one greeting, term, and offers, and any number of dividers", () => {
    const blocks = parseBlocks([
      { id: "a", type: "greeting", text: "Hi" },
      { id: "b", type: "divider" },
      { id: "c", type: "greeting", text: "Again" },
      { id: "d", type: "divider" },
      { id: "e", type: "offers" },
      { id: "f", type: "script" },
      { id: "d", type: "divider" },
    ]);
    assert.deepEqual(
      blocks.map((block) => block.id),
      ["a", "b", "d", "e"],
    );
    assert.equal(canAddBlock(blocks, "greeting"), false);
    assert.equal(canAddBlock(blocks, "term"), true);
    assert.equal(canAddBlock(blocks, "divider"), true);
  });

  it("moves a block and ignores moves off the end", () => {
    const blocks = defaultBlocks();
    assert.deepEqual(
      moveBlock(blocks, 3, -1).map((block) => block.type),
      ["greeting", "equity", "offers", "term"],
    );
    assert.equal(moveBlock(blocks, 0, -1), blocks);
  });

  it("carries the company name through the greeting", () => {
    assert.deepEqual(greetingParts(DEFAULT_GREETING, "Amplifier Health"), [
      { text: "Hello ", company: false },
      { text: "Amplifier Health", company: true },
      { text: ", so nice to see you again.", company: false },
    ]);
    const editing = greetingForEditing(DEFAULT_GREETING, "Amplifier Health");
    assert.equal(editing, "Hello Amplifier Health, so nice to see you again.");
    assert.equal(greetingFromEditing(editing, "Amplifier Health"), DEFAULT_GREETING);
  });
});
