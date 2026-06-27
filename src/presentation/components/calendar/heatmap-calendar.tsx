import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { MonthlyHeatmap } from "@/src/application/types/heatmap";
import { useTheme } from "@/src/presentation/theme/theme-provider";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 16;
const CELL_GAP = 3;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CELL_GAP * 6) / 7);

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function getHeatColor(intensity: number, expenseHex: string): string {
  if (intensity <= 0) return "transparent";
  let level: number;
  if (intensity <= 0.25) level = 0.25;
  else if (intensity <= 0.5) level = 0.5;
  else if (intensity <= 0.75) level = 0.75;
  else level = 1;
  const { r, g, b } = hexToRgb(expenseHex);
  return `rgba(${r}, ${g}, ${b}, ${level})`;
}

type FilterMode = "day" | "month" | "all";

type HeatmapCalendarProps = {
  heatmap: MonthlyHeatmap | null;
  selectedDay: Date | null;
  filterMode: FilterMode;
  onDayPress: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onClearSelection: () => void;
  onShowAllTime: () => void;
};

export const HeatmapCalendar = ({
  heatmap,
  selectedDay,
  filterMode,
  onDayPress,
  onPrevMonth,
  onNextMonth,
  onClearSelection,
  onShowAllTime,
}: HeatmapCalendarProps) => {
  const { theme } = useTheme();

  if (!heatmap) return null;

  const { year, month, cells } = heatmap;
  const firstDayOffset = new Date(year, month, 1).getDay();
  const totalCells = firstDayOffset + cells.length;
  const trailingCells = (7 - (totalCells % 7)) % 7;
  const expenseHex = theme.colors.expense;
  const activeChipBg = theme.colors.primary;
  const activeChipText = "#000";

  return (
    <View
      style={[
        styles.card,
        {
          marginBottom: theme.spacing.lg,
        },
      ]}
    >
      <View style={[styles.headerRow, { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md }]}>
        <TouchableOpacity onPress={onPrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ fontFamily: theme.fonts.mono, fontSize: 18, color: theme.colors.secondary }}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={{ fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.primary }}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity onPress={onNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={{ fontFamily: theme.fonts.mono, fontSize: 18, color: theme.colors.secondary }}>{">"}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.chipRow, { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xs }]}>
        <TouchableOpacity
          onPress={onClearSelection}
          style={[
            styles.chip,
            filterMode === "month"
              ? { backgroundColor: activeChipBg }
              : { backgroundColor: "transparent", borderColor: theme.colors.border, borderWidth: 1 },
          ]}
        >
          <Text style={{ fontFamily: theme.fonts.mono, fontSize: 10, color: filterMode === "month" ? activeChipText : theme.colors.secondary }}>
            show month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onShowAllTime}
          style={[
            styles.chip,
            filterMode === "all"
              ? { backgroundColor: activeChipBg }
              : { backgroundColor: "transparent", borderColor: theme.colors.border, borderWidth: 1 },
          ]}
        >
          <Text style={{ fontFamily: theme.fonts.mono, fontSize: 10, color: filterMode === "all" ? activeChipText : theme.colors.secondary }}>
            all time
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.weekdayRow, { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs }]}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} style={[styles.weekday, { width: CELL_SIZE }]}>
            {d}
          </Text>
        ))}
      </View>

      <View style={[styles.grid, { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md }]}>
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <View key={`empty-${i}`} style={[styles.cell, { borderColor: theme.colors.border, borderWidth: 1 }]} />
        ))}
        {cells.map((cell) => {
          const isSelected =
            selectedDay !== null &&
            cell.date.getFullYear() === selectedDay.getFullYear() &&
            cell.date.getMonth() === selectedDay.getMonth() &&
            cell.date.getDate() === selectedDay.getDate();
          const bg = getHeatColor(cell.intensity, expenseHex);
          return (
            <TouchableOpacity
              key={cell.date.getDate()}
              onPress={() => onDayPress(cell.date)}
              style={[
                styles.cell,
                {
                  backgroundColor: bg,
                  borderRadius: 4,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <Text style={{ fontFamily: theme.fonts.mono, fontSize: 10, color: theme.colors.secondary }}>
                {cell.date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
        {Array.from({ length: trailingCells }).map((_, i) => (
          <View key={`trailing-${i}`} style={[styles.cell, { borderColor: theme.colors.border, borderWidth: 1 }]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekday: {
    textAlign: "center",
    fontFamily: "JetBrains Mono",
    fontSize: 10,
    color: "#9e9e9e",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: CELL_GAP,
  },
});