export type HeatmapCell = {
  date: Date;
  expenseTotal: number;
  intensity: number;
};

export type MonthlyHeatmap = {
  year: number;
  month: number;
  cells: HeatmapCell[];
  maxDailyExpense: number;
};