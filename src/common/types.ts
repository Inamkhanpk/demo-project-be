export type RangeKey = "YTD" | "MTD" | "WTD" | "DAILY" | "CUSTOM";

export type DataPoint = {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
};
