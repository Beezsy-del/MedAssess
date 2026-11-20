import { afterEach, it, expect, vi } from "vitest";
import { liveRefreshScheduler } from "@/features/workspace/live-refresh";
afterEach(() => vi.useRealTimers());
it("coalesces repeated realtime events to one in-flight refresh and one trailing refresh", async () => {
  vi.useFakeTimers();
  let finish = () => {};
  const refresh = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const live = liveRefreshScheduler(refresh, () => false, vi.fn());
  for (let i = 0; i < 100; i++) live.request();
  await vi.advanceTimersByTimeAsync(150);
  expect(refresh).toHaveBeenCalledTimes(1);
  for (let i = 0; i < 100; i++) live.request();
  await vi.advanceTimersByTimeAsync(1000);
  expect(refresh).toHaveBeenCalledTimes(1);
  finish();
  await vi.advanceTimersByTimeAsync(250);
  expect(refresh).toHaveBeenCalledTimes(2);
  finish();
  live.dispose();
});
it("defers background snapshots while a foreground command owns the acknowledgement refresh", async () => {
  vi.useFakeTimers();
  let paused = true;
  const refresh = vi.fn(async () => {});
  const live = liveRefreshScheduler(refresh, () => paused, vi.fn());
  live.request();
  await vi.advanceTimersByTimeAsync(2000);
  expect(refresh).not.toHaveBeenCalled();
  paused = false;
  await vi.advanceTimersByTimeAsync(250);
  expect(refresh).toHaveBeenCalledTimes(1);
  live.dispose();
});
it("reports errors and cancels queued work when workspace unmounts", async () => {
  vi.useFakeTimers();
  const onError = vi.fn();
  const refresh = vi.fn(async () => {
    throw new Error("Synthetic interruption");
  });
  const live = liveRefreshScheduler(refresh, () => false, onError);
  live.request();
  await vi.advanceTimersByTimeAsync(150);
  expect(onError).toHaveBeenCalledTimes(1);
  live.request();
  live.dispose();
  await vi.advanceTimersByTimeAsync(500);
  expect(refresh).toHaveBeenCalledTimes(1);
});
