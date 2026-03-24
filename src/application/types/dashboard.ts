export type CategoryBreakdown = {
  categoryName: string;
  total: number;
  percentage: number;
};

export type PeriodSummary = {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  byCategory: CategoryBreakdown[];
};

export type DashboardData = {
  currentBalance: number;
  currentMonth: PeriodSummary;
  previousMonth: PeriodSummary;
};
