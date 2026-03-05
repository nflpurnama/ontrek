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
import { useState } from "react";

type contextType = "EDIT" | "CREATE";

export type TransactionFormData = {
  amount: number;
  transactionType: TransactionType;
  spendingType: SpendingType;
  category: string | null;
  vendor: Vendor | null;
  vendorName: string;
  description: string;
};

export type TransactionFormContext = {
  contextType: contextType;
  vendorSuggestions: Vendor[];
  categoryOptions: Category[];
  handleSubmit: (formData: TransactionFormData) => void;
  handleVendorSearch: (vendorName: string) => void;
  handleDelete?: (formData: TransactionFormData) => void;
};

export const TransactionForm = ({
  contextType,
  vendorSuggestions,
  categoryOptions,
  handleVendorSearch,
  handleSubmit,
  handleDelete,
}: TransactionFormContext) => {
  const SegmentedTransactionTypeInput = SegmentedControl<TransactionType>;
  const SegmentedSpendingTypeInput = SegmentedControl<SpendingType>;

  const [amount, setAmount] = useState<number>(0);

  const [transactionType, setTransactionType] =
    useState<TransactionType>("EXPENSE");

  const [spendingType, setSpendingType] = useState<SpendingType>("ESSENTIAL");

  const [category, setCategory] = useState<string | null>(null);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [vendorName, setVendorName] = useState<string>("");

  const [description, setDescription] = useState<string>("");

  // const [suggestions, setSuggestions] = useState<Vendor[]>([]);

  // useEffect(() => {
  // setSuggestions(vendorSuggestions)
  // }, vendorSuggestions)

  return (
    <View>
      <AmountInput value={amount} onChange={setAmount} />
      <SegmentedTransactionTypeInput
        value={transactionType}
        onChange={setTransactionType}
        options={TransactionTypes}
        style={{ marginBottom: 12 }}
      />
      {transactionType === "EXPENSE" && (
        <SegmentedSpendingTypeInput
          value={spendingType}
          onChange={setSpendingType}
          options={SpendingTypes}
          style={{ marginBottom: 12 }}
        />
      )}
      {categoryOptions?.length > 0 && (
        <HorizontalPillSelector
          value={category}
          onChange={setCategory}
          options={categoryOptions.map((c) => ({
            label: c.name,
            value: c.id.getValue(),
          }))}
        />
      )}
      <VendorInput
        vendorName={vendorName}
        setVendorName={setVendorName}
        vendorSuggestions={vendorSuggestions}
        handleSelect={setVendor}
        handleSearch={handleVendorSearch}
      ></VendorInput>
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() =>
            handleSubmit({
              amount,
              category,
              description,
              spendingType,
              transactionType,
              vendor,
              vendorName,
            })
          }
        >
          <Text style={styles.submitText}>Save Transaction</Text>
        </TouchableOpacity>

        {contextType === "EDIT" && handleDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              handleDelete({
                amount,
                category,
                description,
                spendingType,
                transactionType,
                vendor,
                vendorName,
              })
            }
          >
            <Text style={styles.submitText}>Delete Transaction</Text>
          </TouchableOpacity>
        )}
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
