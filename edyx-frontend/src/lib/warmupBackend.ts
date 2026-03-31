import { BACKEND_URL } from "./voiceAssistantApi";

const RETRY_DELAY_MS = 2500;
const WARMUP_ENDPOINT = `${BACKEND_URL}/wake`;
const PREFETCH_ENDPOINT = `${BACKEND_URL}/health`;
const DEBUG_WARMUP = import.meta.env.DEV && import.meta.env.VITE_WARMUP_DEBUG === "true";

let warmupStarted = false;
let warmupInvoked = false;

type IdleHandle = number;

type RequestIdleCallback = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
) => IdleHandle;

type CancelIdleCallback = (handle: IdleHandle) => void;

const requestIdle = ((window as Window & { requestIdleCallback?: RequestIdleCallback }).requestIdleCallback ??
  ((callback: IdleRequestCallback) =>
    window.setTimeout(() => callback({
      didTimeout: false,
      timeRemaining: () => 0,
    } as IdleDeadline), 0))) as RequestIdleCallback;

const cancelIdle = ((window as Window & { cancelIdleCallback?: CancelIdleCallback }).cancelIdleCallback ??
  ((handle: IdleHandle) => window.clearTimeout(handle))) as CancelIdleCallback;

function debugWarmup(message: string): void {
  if (!DEBUG_WARMUP) {
    return;
  }

  console.info(`[warmup] ${message}`);
}

async function warmupRequest(url: string): Promise<void> {
  const response = await fetch(url, {
    method: "GET",
    keepalive: true,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Wake failed");
  }
}

function scheduleLightweightPrefetch(): void {
  const idleHandle = requestIdle(() => {
    void warmupRequest(PREFETCH_ENDPOINT).then(() => {
      debugWarmup("prefetch /health succeeded");
    }).catch(() => {
      // Silent by design.
      debugWarmup("prefetch /health failed silently");
    });
  });

  // Release callback resources quickly after queueing.
  window.setTimeout(() => cancelIdle(idleHandle), 10000);
}

export async function warmUpBackend(): Promise<void> {
  debugWarmup("starting primary warm-up request");

  try {
    await warmupRequest(WARMUP_ENDPOINT);
    debugWarmup("primary warm-up succeeded");
    scheduleLightweightPrefetch();
    return;
  } catch {
    // Silent by design.
    debugWarmup("primary warm-up failed silently");
  }

  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), RETRY_DELAY_MS);
  });

  debugWarmup("starting warm-up retry");

  try {
    await warmupRequest(WARMUP_ENDPOINT);
    debugWarmup("warm-up retry succeeded");
    scheduleLightweightPrefetch();
  } catch {
    // Silent by design.
    debugWarmup("warm-up retry failed silently");
  }
}

export function startWarmupCycleOnce(): void {
  if (warmupStarted) {
    return;
  }

  warmupStarted = true;

  const runWarmup = () => {
    if (warmupInvoked) {
      return;
    }

    warmupInvoked = true;
    void warmUpBackend();
  };

  const idleHandle = requestIdle(() => {
    window.clearTimeout(fallbackTimer);
    runWarmup();
  });

  // In case the tab is busy, ensure warmup still starts soon.
  const fallbackTimer = window.setTimeout(() => {
    cancelIdle(idleHandle);
    runWarmup();
  }, 1000);
}
