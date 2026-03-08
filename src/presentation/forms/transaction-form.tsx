import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AmountInput from "../components/inputs/amount-input";
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
import { useEffect, useRef, useState } from "react";
import TerminalInput from "../components/inputs/terminal-input";

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
  const [amount, setAmount] = useState<number>(0);

  const [transactionType, setTransactionType] =
    useState<TransactionType | null>(null);

  const [spendingType, setSpendingType] = useState<SpendingType>("ESSENTIAL");

  const [category, setCategory] = useState<string | null>(null);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [vendorName, setVendorName] = useState<string>("");

  const [description, setDescription] = useState<string>("");

  const handleTransactionType = (value: string) => {
    if (value.toLowerCase() == "e") setTransactionType("EXPENSE");
    else if (value.toLowerCase() == "i") setTransactionType("INCOME");
    else setTransactionType(null);
  };

  const [showPrompts, setShowPrompts] = useState<boolean>();
  const transactionTypeRef = useRef<TextInput>(null);
  const amountRef = useRef<TextInput>(null);
  const vendorRef = useRef<TextInput>(null);
  const categoryRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  useEffect(() => {
    setShowPrompts(false);
  });

  {/*TODO: use backspace on empty field to navigate to previous field */}
  return (
    <View>
      <TerminalInput prompt="Expense or Income?" showPrompt={showPrompts}>
        <TextInput
          ref={transactionTypeRef}
          placeholder={"[e, i]"}
          value={transactionType ?? undefined}
          onChangeText={handleTransactionType}
          inputAccessoryViewButtonLabel="test"
          autoFocus
          onSubmitEditing={() => amountRef?.current?.focus()}
        />
      </TerminalInput>

      <TerminalInput
        prompt={`How much did you ${transactionType === "INCOME" ? "earn" : "spend"}?`}
        showPrompt={showPrompts}
      >
        <AmountInput
          ref={amountRef}
          amount={amount}
          setter={setAmount}
          onSubmitEditing={() => vendorRef?.current?.focus()}
        />
      </TerminalInput>

      <TerminalInput
        prompt={`Where did you ${transactionType === "INCOME" ? "earn" : "spend"}?`}
        showPrompt={showPrompts}
      >
        {/*TODO: Vendor suggestion styling is not appearing*/}
        <VendorInput
          ref={vendorRef}
          vendorName={vendorName}
          setVendorName={setVendorName}
          vendorSuggestions={vendorSuggestions}
          handleSelect={setVendor}
          handleSearch={handleVendorSearch}
          placeholder="source"
          onSubmitEditing={() => categoryRef?.current?.focus()}
        ></VendorInput>
      </TerminalInput>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* TODO: Categories are not getting recognized, this is because we send the category name, not the id reference.*/}
        {/*TODO: How to handle category suggestion? Can we add keyboard autocorrect? i.e. get keyboard height, above it add options*/}
        <TerminalInput prompt="Category - Description" showPrompt={showPrompts}>
          <TextInput
            ref={categoryRef}
            placeholder={"category"}
            value={category ?? undefined}
            onChangeText={setCategory}
            onSubmitEditing={() => descriptionRef?.current?.focus()}
          />
        </TerminalInput>

        <Text>-</Text>

        <TerminalInput prompt="Description">
          <TextInput
            ref={descriptionRef}
            placeholder={"description"}
            value={description ?? undefined}
            onChangeText={setDescription}
            inputAccessoryViewButtonLabel="test"
            autoFocus
          />
        </TerminalInput>
      </View>

      <View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() =>
            handleSubmit({
              amount,
              category,
              description,
              spendingType,
              transactionType: transactionType ?? "EXPENSE",
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
                transactionType: transactionType ?? "EXPENSE",
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
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
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
