import { TransactionType } from '@/src/domain/constants/transaction-type';
import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';

type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
  style?: ViewStyle;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  compact = false,
  style,
}: SegmentedControlProps<T>) {
  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        style,
      ]}
    >
      {options.map((option) => {
        const isActive = option === value;

        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.segment,
              compact && styles.segmentCompact,
              isActive && styles.segmentActive,
            ]}
          >
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                isActive && styles.labelActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
  },
  containerCompact: {
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentCompact: {
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  labelCompact: {
    fontSize: 12,
  },
  labelActive: {
    color: '#111827',
  },
});