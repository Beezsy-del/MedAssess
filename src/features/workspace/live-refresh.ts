/** Coalesce realtime bursts without delaying a foreground mutation's acknowledgement. */
export function liveRefreshScheduler(
  refresh: () => Promise<void>,
  paused: () => boolean,
  onError: () => void,
) {
  let running = false,
    dirty = false,
    disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const drain = async () => {
    timer = undefined;
    if (disposed || !dirty) return;
    if (paused() || running) {
      timer = setTimeout(() => void drain(), 250);
      return;
    }
    dirty = false;
    running = true;
    try {
      await refresh();
    } catch {
      if (!disposed) onError();
    } finally {
      running = false;
      if (dirty && !disposed && !timer)
        timer = setTimeout(() => void drain(), 250);
    }
  };
  return {
    request() {
      dirty = true;
      if (!disposed && !timer && !running)
        timer = setTimeout(() => void drain(), 150);
    },
    dispose() {
      disposed = true;
      if (timer) clearTimeout(timer);
    },
  };
}
