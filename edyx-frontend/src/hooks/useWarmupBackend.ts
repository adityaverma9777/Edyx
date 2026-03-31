import { useEffect } from "react";
import { startWarmupCycleOnce } from "../lib/warmupBackend";

export function useWarmupBackend(): void {
  useEffect(() => {
    startWarmupCycleOnce();
  }, []);
}
