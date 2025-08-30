export const CACHE_TTL_MS = 60_000;
export const cache = new Map<string, { ts: number; data: any }>();
