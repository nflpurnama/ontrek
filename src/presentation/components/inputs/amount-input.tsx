import { useEffect, useState } from "react";
import { View, StyleSheet, TextInput, Text } from "react-native";
import {
  formatCurrency,
  parseCurrency,
} from "../../utility/formatter/currency";

export function AmountInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (input: number) => void;
}) {
  const [display, setDisplay] = useState<string>("");

  useEffect(() => {
  if (!value) {
    setDisplay("");
  } else {
    setDisplay(formatCurrency(value));
  }
  }, [value]);


  const handleChange = (input: string) => {
    const parsedAmount = parseCurrency(input);

    if (isNaN(parsedAmount)) {
      onChange(0);
      setDisplay("");
      return;
    }

    const formattedAmount = formatCurrency(parsedAmount);

    onChange(parsedAmount);
    setDisplay(formattedAmount);
  };

  return (
    <View style={styles.amountContainer}>
      <Text style={styles.currency}>Rp</Text>
      <TextInput
        style={styles.amountInput}
        placeholder="0"
        keyboardType="numeric"
        onChangeText={handleChange}
        value={display}
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  amountContainer: {
    marginVertical: 24,
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    fontSize: 24,
    fontWeight: "600",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 42,
    fontWeight: "800",
    textAlign: "right",
    borderWidth: 0,
    paddingVertical: 8,
  },
});
