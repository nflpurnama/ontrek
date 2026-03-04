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

type contextType = "EDIT" | "CREATE";

type setter<T> = (input: T) => void;

type TransactionFormContext = {
  contextType: contextType;
  amount: { value: number; setter: setter<number> };
  transactionType: { value: TransactionType; setter: setter<TransactionType> };
  spendingType: { value: SpendingType; setter: setter<SpendingType> };
  categoryId: { value: string | null; setter: setter<string | null> };
  vendorQuery: { value: string; setter: setter<string> };
  description: { value: string; setter: setter<string> };
  vendorSuggestions: Vendor[];
  categoryOptions: Category[];
  setSelectedVendor: (input: Vendor | null) => void;
  handleSubmit: () => void;
  handleDelete?: () => void;
};

const TransactionForm = ({
  contextType,
  amount,
  transactionType,
  spendingType,
  categoryId,
  vendorQuery,
  description,
  vendorSuggestions,
  categoryOptions,
  setSelectedVendor,
  handleSubmit,
  handleDelete
}: TransactionFormContext) => {
  const SegmentedTransactionTypeInput = SegmentedControl<TransactionType>;
  const SegmentedSpendingTypeInput = SegmentedControl<SpendingType>;

  return (
    <View>
      <AmountInput value={amount.value} onChange={amount.setter} />
      <SegmentedTransactionTypeInput
        value={transactionType.value}
        onChange={transactionType.setter}
        options={TransactionTypes}
        style={{ marginBottom: 12 }}
      />
      {transactionType.value === "EXPENSE" && (
        <SegmentedSpendingTypeInput
          value={spendingType.value}
          onChange={spendingType.setter}
          options={SpendingTypes}
          style={{ marginBottom: 12 }}
        />
      )}
      {categoryOptions?.length > 0 && (
        <HorizontalPillSelector
          value={categoryId.value}
          onChange={categoryId.setter}
          options={categoryOptions.map((c) => ({
            label: c.name,
            value: c.id.getValue(),
          }))}
        />
      )}
      <VendorInput
        query={vendorQuery.value}
        setQuery={vendorQuery.setter}
        queryResults={vendorSuggestions}
        setVendor={setSelectedVendor}
      ></VendorInput>
      <TextInput
        placeholder="Description"
        value={description.value}
        onChangeText={description.setter}
        style={styles.input}
      />

      <View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Transaction</Text>
        </TouchableOpacity>

        {(contextType === "EDIT") && <TouchableOpacity style={styles.submitButton} onPress={handleDelete}>
          <Text style={styles.submitText}>Save Transaction</Text>
        </TouchableOpacity>}
      </View>
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
  deleteButton: {
    backgroundColor: "#bc0000",
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
