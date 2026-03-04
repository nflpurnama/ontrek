import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AmountInput } from "../components/inputs/amount-input";
import { HorizontalPillSelector } from "../components/pill-selector-input";
import { VendorInput } from "../components/inputs/vendor-input";
import { SegmentedControl } from "../components/inputs/segmented-input";
import {
  TransactionType,
  TransactionTypes,
} from "@/src/domain/constants/transaction-type";
import {
  SpendingType,
  SpendingTypes,
} from "@/src/domain/constants/spending-type";
import { Category } from "@/src/domain/entities/category";
import { Vendor } from "@/src/domain/entities/vendor";

type TransactionFormProps = {
  amount: number;
  setAmount: (input: number) => void;
  type: TransactionType;
  setType: (input: TransactionType) => void;
  spendingType: SpendingType;
  setSpendingType: (input: SpendingType) => void;
  categoryOptions: Category[];
  categoryId: string | null,
  setCategoryId: (input: string | null) => void;
  vendorQuery: string,
  setVendorQuery: (input: string) => void;
  vendorSuggestions: Vendor[]
  setSelectedVendor: (input: Vendor | null) => void;
  description: string;
  setDescription: (input: string) => void;
  handleSubmit: () => void;
};

const TransactionForm = ({
  amount,
  setAmount,
  type,
  setType,
  spendingType,
  setSpendingType,
  categoryOptions,
  categoryId,
  setCategoryId,
  vendorQuery,
  setVendorQuery,
  vendorSuggestions,
  setSelectedVendor,
  description,
  setDescription,
  handleSubmit,
}: TransactionFormProps) => {
  const SegmentedTransactionTypeInput = SegmentedControl<TransactionType>;
  const SegmentedSpendingTypeInput = SegmentedControl<SpendingType>;

  return (
    <View>
      <AmountInput value={amount} onChange={setAmount} />
      <SegmentedTransactionTypeInput
        value={type}
        onChange={setType}
        options={TransactionTypes}
        style={{ marginBottom: 12 }}
      />
      {type === "EXPENSE" && (
        <SegmentedSpendingTypeInput
          value={spendingType}
          onChange={setSpendingType}
          options={SpendingTypes}
          style={{ marginBottom: 12 }}
        />
      )}
      {categoryOptions?.length > 0 && (
        <HorizontalPillSelector
          value={categoryId}
          onChange={setCategoryId}
          options={categoryOptions.map((c) => ({
            label: c.name,
            value: c.id.getValue(),
          }))}
        />
      )}
      <VendorInput
        query={vendorQuery}
        setQuery={setVendorQuery}
        queryResults={vendorSuggestions}
        setVendor={setSelectedVendor}
      ></VendorInput>
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Save Transaction</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#888",
  },
  input: {
    // backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    // elevation: 2,
  },
  submitButton: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    top: 52, // input height + spacing
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1000,
  },

  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default TransactionForm;
