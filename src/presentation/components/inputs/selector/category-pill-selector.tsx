import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Category } from "@/src/domain/entities/category";

type CategoryPillSelectorProps = {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
};

export const CategoryPillSelector = ({
  categories,
  selectedCategory,
  onSelect,
}: CategoryPillSelectorProps) => {
  // Filter out the already selected category from the pill row
  const availableCategories = categories.filter(
    (c) => c.id !== selectedCategory?.id
  );

  if (availableCategories.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>CATEGORIZE</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {availableCategories.map((category) => (
          <TouchableOpacity
            key={category.id.getValue()}
            style={styles.pill}
            onPress={() => onSelect(category)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: "#444",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  pill: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});