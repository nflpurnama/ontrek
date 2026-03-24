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

type SuggestionListProps<T extends Vendor | Category> = {
  items: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T) => string;
  emptyMessage?: string;
};

export function SuggestionList<T extends Vendor | Category>({
  items,
  onSelect,
  renderItem,
  emptyMessage = "No matches",
}: SuggestionListProps<T>) {
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>{emptyMessage}</Text>
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
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  pill: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  pillText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  empty: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
  },
});
