/** Source proportions always win; the CMS aspect is only a legacy fallback. */
export function imageRatio(
  media?: { width?: number | null; height?: number | null } | null,
  aspect?: string,
): number {
  if (media?.width && media?.height && media.width > 0 && media.height > 0)
    return media.width / media.height;
  return (
    (
      { SQUARE: 1, PORTRAIT: 0.8, LANDSCAPE: 1.5, PANORAMIC: 21 / 9 } as Record<
        string,
        number
      >
    )[aspect ?? ""] ?? 0.8
  );
}

/** Preserve editorial order, grouping by total width instead of cropping to a grid. */
export function imageRows<T>(
  items: T[],
  ratio: (item: T) => number,
  layout = "MIXED",
): T[][] {
  const rows: T[][] = [];
  const limit =
    layout === "FULL_WIDTH"
      ? 1
      : layout === "THREE_COLUMN"
        ? 3
        : layout === "TWO_COLUMN" || layout === "PORTRAIT_LANDSCAPE"
          ? 2
          : 3;
  for (let i = 0; i < items.length;) {
    let count = 1;
    if (layout !== "FULL_WIDTH") {
      if (layout === "MIXED") {
        let sum = ratio(items[i]!);
        while (count < limit && i + count < items.length) {
          const next = sum + ratio(items[i + count]!);
          if (count > 1 && Math.abs(sum - 2.5) <= Math.abs(next - 2.5)) break;
          if (sum >= 1.8 && Math.abs(sum - 2.5) <= Math.abs(next - 2.5)) break;
          sum = next;
          count++;
        }
        // A final narrow image belongs with the preceding photographs.
        if (items.length - i - count === 1 && ratio(items[i + count]!) < 1) {
          if (count < limit) count++;
          else if (ratio(items[i + count - 1]!) < 1.5) count--;
        }
      } else count = Math.min(limit, items.length - i);
    }
    rows.push(items.slice(i, i + count));
    i += count;
  }
  return rows;
}
