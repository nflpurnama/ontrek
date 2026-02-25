import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  SpendingTypes,
  SpendingType,
} from '@/src/domain/constants/spending-type';

interface Props {
  value: SpendingType;
  onChange: (value: SpendingType) => void;
}

export const SpendingTypeSelector: React.FC<Props> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Spending Type</Text>

      <View style={styles.segmentContainer}>
        {SpendingTypes.map((type) => {
          const isSelected = value === type;

          return (
            <Pressable
              key={type}
              onPress={() => onChange(type)}
              style={[
                styles.segment,
                isSelected && styles.segmentSelected,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextSelected,
                ]}
              >
                {type === 'ESSENTIAL'
                  ? 'Essential'
                  : 'Discretionary'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  segmentSelected: {
    backgroundColor: '#111',
  },
  segmentText: {
    fontSize: 14,
    color: '#333',
  },
  segmentTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});