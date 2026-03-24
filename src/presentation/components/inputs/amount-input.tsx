import { Ref, useEffect, useState } from "react";
import { View, StyleSheet, TextInput, Text, TextInputProps } from "react-native";
import {
  formatCurrency,
  parseCurrency,
} from "../../utility/formatter/currency";

type AmountInputProps =
TextInputProps
& {ref: Ref<TextInput>}
& {
  amount: number;
  setter: (input: number) => void;
}

const AmountInput = ({
  amount,
  setter,
  ref,
  ...props
}: AmountInputProps) => {
  const [display, setDisplay] = useState<string>("");

  useEffect(() => {
  if (!amount) {
    setDisplay("");
  } else {
    setDisplay(formatCurrency(amount));
  }
  }, [amount]);


  const handleChange = (input: string) => {
    const parsedAmount = parseCurrency(input);

    if (isNaN(parsedAmount)) {
      setter(0);
      setDisplay("");
      return;
    }

    const formattedAmount = formatCurrency(parsedAmount);

    setter(parsedAmount);
    setDisplay(formattedAmount);
  };

  return (
    <View style={styles.amountContainer}>
      <Text>Rp</Text>
      <TextInput
        ref={ref}
        placeholder="0"
        placeholderTextColor="#666"
        keyboardType="numeric"
        onChangeText={handleChange}
        value={display}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  amountContainer: {
    // marginVertical: 24,
    paddingStart: 5,
    flexDirection: "row",
    alignItems: "center",
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
    borderWidth: 0,
    paddingVertical: 8,
  },
});

export default AmountInput;