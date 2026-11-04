import { test } from "node:test";
import assert from "node:assert/strict";
import { imageRatio, imageRows } from "../src/lib/gallery/layout";

test("source proportions override crop preferences and handle legacy metadata", () => {
  assert.equal(imageRatio({ width: 1800, height: 1200 }, "PORTRAIT"), 1.5);
  assert.equal(imageRatio({ width: 1200, height: 1800 }, "SQUARE"), 2 / 3);
  assert.equal(imageRatio({ width: 0, height: 0 }, "SQUARE"), 1);
  assert.ok(Number.isFinite(imageRatio(null)));
});

test("every gallery layout preserves all images and editorial order", () => {
  for (const layout of [
    "MIXED",
    "FULL_WIDTH",
    "TWO_COLUMN",
    "THREE_COLUMN",
    "PORTRAIT_LANDSCAPE",
  ]) {
    for (let length = 0; length < 40; length++) {
      const images = Array.from({ length }, (_, id) => ({
        id,
        ratio: [2 / 3, 1, 1.5, 2.4][id % 4]!,
      }));
      const rows = imageRows(images, (image) => image.ratio, layout);
      assert.deepEqual(rows.flat(), images);
      assert.ok(rows.every((row) => row.length > 0 && row.length <= 3));
      if (layout === "FULL_WIDTH")
        assert.ok(rows.every((row) => row.length === 1));
    }
  }
});

test("five portraits form balanced rows without a stranded last photograph", () => {
  const rows = imageRows([0.8, 0.8, 2 / 3, 0.8, 0.8], (ratio) => ratio);
  assert.deepEqual(
    rows.map((row) => row.length),
    [3, 2],
  );
});

test("mixed rows avoid a final isolated portrait and keep panoramic photographs prominent", () => {
  assert.deepEqual(
    imageRows([0.8, 0.8, 0.8, 0.8], (ratio) => ratio).map((row) => row.length),
    [2, 2],
  );
  assert.deepEqual(
    imageRows([2.4, 0.67, 0.67], (ratio) => ratio).map((row) => row.length),
    [1, 2],
  );
});
