import {
  eachDayOfInterval,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { RangeKey, DataPoint } from "./types";
import {
  getYear,
  getMonth,
  getDate,
  addDays,
  format,
  setHours,
  isToday,
} from "date-fns";

export function computeRange(key: RangeKey, from?: string, to?: string) {
  const now = new Date();
  const today = startOfDay(now);
  if (key === "DAILY") return { from: today, to: today };
  if (key === "WTD")
    return {
      from: startOfWeek(today, { weekStartsOn: 1 }),
      to: endOfWeek(today, { weekStartsOn: 1 }),
    };
  if (key === "MTD") return { from: startOfMonth(today), to: today };
  if (key === "YTD") return { from: startOfYear(today), to: today };
  if (key === "CUSTOM" && from && to)
    return { from: startOfDay(new Date(from)), to: startOfDay(new Date(to)) };
  throw new Error("Invalid range");
}

export function daysInRange(from: Date, to: Date) {
  return eachDayOfInterval({ start: from, end: to });
}

export function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generatePoint(date: Date, seedOffset = 0): DataPoint {
  const y = getYear(date);
  const m = getMonth(date) + 1;
  const d = getDate(date);

  const base = 50_000 + 5_000 * m + 500 * (y - 2020);
  const rev =
    base * (0.9 + seededRand(y * 10000 + m * 100 + d + seedOffset) * 0.4);
  const exp =
    rev * (0.55 + seededRand(y * 20000 + m * 200 + d + seedOffset) * 0.2);
  return {
    date: format(date, "yyyy-MM-dd"),
    revenue: Math.round(rev),
    expenses: Math.round(exp),
    profit: Math.round(rev - exp),
  };
}

export function synthData(
  date: Date,
  period: "daily" | "weekly" | "monthly" | "yearly",
): DataPoint[] {
  const y = getYear(date);
  const m = getMonth(date) + 1;
  const d = getDate(date);
  const points: DataPoint[] = [];

  switch (period) {
    case "daily": {
      const maxHour = isToday(date) ? new Date().getHours() : 23;
      for (let hour = 0; hour <= maxHour; hour++) {
        const point = generatePoint(setHours(date, hour), hour);
        points.push({
          ...point,
          date: format(setHours(date, hour), "yyyy-MM-dd HH:00"),
        });
      }
      break;
    }

    case "weekly": {
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(date, i);
        points.push(generatePoint(currentDate));
      }
      break;
    }

    case "monthly": {
      const daysInMonth = new Date(y, m, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        points.push(generatePoint(new Date(y, m - 1, i), i));
      }
      break;
    }

    case "yearly": {
      for (let i = 1; i <= 12; i++) {
        const monthDate = new Date(y, i - 1, 1);
        points.push(generatePoint(monthDate, i));
      }
      break;
    }
  }

  return points;
}
