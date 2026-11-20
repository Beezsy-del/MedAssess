import type { Category } from "../clinical/engine";
export type QueueItem = {
  id: string;
  category: Category;
  emergency: boolean;
  sub_priority: number;
  deteriorating: boolean;
  reassessment_due: string | null;
  arrived_at: string;
  score: number | null;
};
const order: Record<Category, number> = {
  RED: 0,
  YELLOW: 1,
  GREEN: 2,
  ASSESSMENT_REQUIRED: 3,
};
export function rankQueue<T extends QueueItem>(
  items: T[],
  now = Date.now(),
): T[] {
  const overdue = (x: T) =>
    x.reassessment_due !== null && Date.parse(x.reassessment_due) <= now
      ? 1
      : 0;
  return [...items].sort(
    (a, b) =>
      order[a.category] - order[b.category] ||
      Number(b.emergency) - Number(a.emergency) ||
      b.sub_priority - a.sub_priority ||
      Number(b.deteriorating) - Number(a.deteriorating) ||
      overdue(b) - overdue(a) ||
      Date.parse(a.arrived_at) - Date.parse(b.arrived_at) ||
      a.id.localeCompare(b.id),
  );
}
export function queueExplanation(item: QueueItem) {
  return `${item.category === "ASSESSMENT_REQUIRED" ? "Separate human assessment queue" : item.category + " clinical category"}${item.emergency ? "; emergency override" : ""}${item.deteriorating ? "; deterioration review" : ""}; sub-priority ${item.sub_priority}; arrival order. Unvalidated score excluded from ranking.`;
}
