import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Vendor } from "@/src/domain/entities/vendor";
import { Category } from "@/src/domain/entities/category";
import { terminalTheme } from "../../theme/terminal";

const t = terminalTheme;

type SuggestionListProps<T extends Vendor | Category> = {
  items: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T) => string;
  emptyMessage?: string;
  layout?: "horizontal" | "vertical";
};

export function SuggestionList<T extends Vendor | Category>({
  items,
  onSelect,
  renderItem,
  emptyMessage = "No matches",
  layout = "horizontal",
}: SuggestionListProps<T>) {
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>{emptyMessage}</Text>
      </View>
    );
  }

  if (layout === "vertical") {
    return (
      <View style={styles.container}>
        <View style={styles.verticalContent}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={getItemKey(item, index)}
              style={styles.verticalPill}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.pillText}>{renderItem(item)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={getItemKey(item, index)}
            style={styles.pill}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillText}>{renderItem(item)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function getItemKey(item: Vendor | Category, index: number): string {
  if ("id" in item) {
    return item.id.getValue();
  }
  return String(index);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: t.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: t.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  pill: {
    backgroundColor: t.colors.background,
    borderWidth: 1,
    borderColor: t.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  pillText: {
    color: t.colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  empty: {
    color: t.colors.muted,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
  },
  verticalContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 4,
    gap: 8,
  },
  verticalPill: {
    backgroundColor: t.colors.background,
    borderWidth: 1,
    borderColor: t.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
