import { useSyncExternalStore } from "react";
import type { DB } from "@/types";

const KEY = "mine-db-v1";

export function emptyDb(): DB {
  return {
    onboarded: false,
    notifPermission: null,
    user: null,
    profile: null,
    addresses: [],
    contacts: [],
    orders: [],
    assets: [],
    messages: [],
    notifications: [],
    alerts: [],
    duplicateScans: 0,
    settings: { failPayment: false, failNetwork: false, timeOffsetMs: 0 },
  };
}

const SERVER_DB: DB = emptyDb();
let state: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...emptyDb(), ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt data */
  }
  return emptyDb();
}

export function getDb(): DB {
  if (typeof window === "undefined") return SERVER_DB;
  if (!state) state = load();
  return state;
}

export function setDb(mutate: (draft: DB) => void) {
  const draft = structuredClone(getDb());
  mutate(draft);
  state = draft;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function resetDb() {
  state = emptyDb();
  localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = load();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDb(): DB {
  return useSyncExternalStore(subscribe, getDb, () => SERVER_DB);
}

/** Current time, shifted by the demo "time travel" offset. */
export function now() {
  return Date.now() + getDb().settings.timeOffsetMs;
}
