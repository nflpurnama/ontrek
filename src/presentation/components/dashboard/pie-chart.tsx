import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import { CategoryBreakdown } from "@/src/application/types/dashboard";
import { useTheme } from "@/src/presentation/theme/theme-provider";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#F97316",
];

type PieChartProps = {
  data: CategoryBreakdown[];
  size: number;
  onSelect?: (category: CategoryBreakdown | null) => void;
};

export const PieChart = ({ data, size, onSelect }: PieChartProps) => {
  const { theme } = useTheme();
  const t = theme;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const center = size / 2;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.55;
  const gapAngle = 2;
  const totalGaps = data.length * gapAngle;

  const getColor = (index: number) => {
    return COLORS[index % COLORS.length];
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    x: number,
    y: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const outerStart = polarToCartesian(x, y, outerRadius, endAngle);
    const outerEnd = polarToCartesian(x, y, outerRadius, startAngle);
    const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
    const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
      "M", outerStart.x, outerStart.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z",
    ].join(" ");

    return d;
  };

  const renderSlices = () => {
    if (data.length === 0) {
      return (
        <Path
          d={describeArc(center, center, outerRadius, innerRadius, 0, 359.99)}
          fill={t.colors.border}
        />
      );
    }

    const total = data.reduce((sum, d) => sum + d.total, 0);
    if (total === 0) {
      return (
        <Path
          d={describeArc(center, center, outerRadius, innerRadius, 0, 359.99)}
          fill={t.colors.border}
        />
      );
    }

    let currentAngle = 0;
    const slices: React.ReactNode[] = [];

    data.forEach((item, index) => {
      const sliceAngle = (item.total / total) * (360 - totalGaps);
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      slices.push(
        <Path
          key={index}
          d={describeArc(
            center,
            center,
            outerRadius,
            innerRadius,
            startAngle,
            endAngle
          )}
          fill={getColor(index)}
          onPress={() => {
            const newIndex = selectedIndex === index ? null : index;
            setSelectedIndex(newIndex);
            onSelect?.(newIndex !== null ? data[newIndex] : null);
          }}
        />
      );

      currentAngle = endAngle + gapAngle;
    });

    return slices;
  };

  const selectedItem = selectedIndex !== null ? data[selectedIndex] : null;
  const total = data.reduce((sum, d) => sum + d.total, 0);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toString();
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>{renderSlices()}</G>
      </Svg>
      <View style={[styles.center, { width: innerRadius * 2, height: innerRadius * 2, backgroundColor: t.colors.background, borderColor: t.colors.border }]}>
        {selectedItem ? (
          <>
            <Text style={[styles.categoryName, { fontFamily: t.fonts.mono, fontSize: 11, textAlign: "center", color: selectedIndex !== null ? getColor(selectedIndex) : t.colors.secondary }]} numberOfLines={1}>
              {selectedItem.categoryName}
            </Text>
            <Text style={[styles.amount, { fontFamily: t.fonts.mono, fontSize: 16, color: t.colors.primary, marginTop: 2 }]}>
              {formatAmount(selectedItem.total)}
            </Text>
            <Text style={[styles.percentage, { fontFamily: t.fonts.mono, fontSize: 10, color: t.colors.secondary, marginTop: 2 }]}>
              {selectedItem.percentage.toFixed(1)}%
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.totalLabel, { fontFamily: t.fonts.mono, fontSize: 10, color: t.colors.secondary }]}>Total</Text>
            <Text style={[styles.totalAmount, { fontFamily: t.fonts.mono, fontSize: 14, color: t.colors.primary }]}>
              {formatAmount(total)}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryName: {
    textAlign: "center",
  },
  amount: {},
  percentage: {},
  totalLabel: {},
  totalAmount: {},
});
