import { TransactionType } from "@/src/domain/constants/transaction-type";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export function TransactionTypeInput({type, setType}: {type: TransactionType, setType: (input: TransactionType) => void}) {
  return (
    <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === TransactionType.DEBIT && styles.activeExpense,
            ]}
            onPress={() => setType(TransactionType.DEBIT)}
          >
            <Text style={styles.typeText}>Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === TransactionType.CREDIT && styles.activeIncome,
            ]}
            onPress={() => setType(TransactionType.CREDIT)}
          >
            <Text style={styles.typeText}>Income</Text>
          </TouchableOpacity>
        </View>
  );
}

const styles = StyleSheet.create({
  typeRow: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeExpense: {
    backgroundColor: "#fecaca",
  },
  activeIncome: {
    backgroundColor: "#bbf7d0",
  },
  typeText: {
    fontWeight: "600",
  }
});