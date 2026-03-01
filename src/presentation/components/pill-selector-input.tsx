// components/HorizontalPillSelector.tsx

import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";

export type PillOption<T extends string> = {
  label: string;
  value: T;
};

type HorizontalPillSelectorProps<T extends string> = {
  value: T | null;
  onChange: (value: T) => void;
  options: PillOption<T>[];
};

export function HorizontalPillSelector<T extends string>({
  value,
  onChange,
  options,
}: HorizontalPillSelectorProps<T>) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.pill,
                selected && styles.pillSelected,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.text,
                  selected && styles.textSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    backgroundColor: "#f7f7f7",
  },
  pillSelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  textSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});