import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import AmountInput from "../components/inputs/amount-input";
import { VendorInput } from "../components/inputs/vendor-input";
import {
  TransactionType,
} from "@/src/domain/constants/transaction-type";
import {
  SpendingType,
} from "@/src/domain/constants/spending-type";
import { Category } from "@/src/domain/entities/category";
import { Vendor } from "@/src/domain/entities/vendor";
import { useEffect, useRef, useState } from "react";
import TerminalInput from "../components/inputs/terminal-input";
import { TransactionPreviewCard } from "@/src/presentation/components/cards/transaction-preview-card";
import { CategoryPillSelector } from "../components/inputs/selector/category-pill-selector";

type contextType = "EDIT" | "CREATE";

// Phase 1 = SLI entry, Phase 2 = Review & classify
type FormPhase = "ENTRY" | "REVIEW";

export type TransactionFormData = {
  amount: number;
  transactionType: TransactionType;
  spendingType: SpendingType;
  category: Category | null;   // ← full entity, not string
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
  const [phase, setPhase] = useState<FormPhase>("ENTRY");

  const [amount, setAmount] = useState<number>(0);

  const [transactionType, setTransactionType] =
    useState<TransactionType | null>(null);

  const [spendingType, setSpendingType] = useState<SpendingType>("ESSENTIAL");

  const [category, setCategory] = useState<Category | null>(null);

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
  const descriptionRef = useRef<TextInput>(null);

  useEffect(() => {
    setShowPrompts(false);
  });

  {/*TODO: use backspace on empty field to navigate to previous field */}

  // Completing description transitions to review phase
  const handleDescriptionSubmit = () => {
    Keyboard.dismiss();
    setPhase("REVIEW");
  };

  const buildFormData = (): TransactionFormData => ({
    amount,
    category,
    description,
    spendingType,
    transactionType,
    vendor,
    vendorName,
  });

  return (
    <View style={styles.container}>
      {/* ── Phase 2: Preview Card + Category Pills ── */}
      {phase === "REVIEW" && (
        <>
          <TransactionPreviewCard
            date={new Date()}
            amount={amount}
            vendor={vendor}
            vendorName={vendorName}
            description={description}
            transactionType={transactionType}
            category={category}
            onAmountChange={setAmount}
            onVendorNameChange={setVendorName}
            onDescriptionChange={setDescription}
            onTransactionTypeChange={setTransactionType}
          />

          <CategoryPillSelector
            categories={categoryOptions}
            selectedCategory={category}
            onSelect={setCategory}
          />
        </>
      )}

      {/* ── Phase 1: SLI Entry Fields ── */}
      {phase === "ENTRY" && (
        <View>
          <TerminalInput prompt="Expense or Income?">
            <TextInput
              ref={transactionTypeRef}
              placeholder="[e / i]"
              value={transactionType}
              onChangeText={handleTransactionType}
              autoFocus
              onSubmitEditing={() => amountRef?.current?.focus()}
            />
          </TerminalInput>

          <TerminalInput
            prompt={`How much did you ${transactionType === "INCOME" ? "earn" : "spend"}?`}
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
          >
            <VendorInput
              ref={vendorRef}
              vendorName={vendorName}
              setVendorName={setVendorName}
              vendorSuggestions={vendorSuggestions}
              handleSelect={setVendor}
              handleSearch={handleVendorSearch}
              placeholder="source"
              onSubmitEditing={() => descriptionRef?.current?.focus()}
            />
          </TerminalInput>

          <TerminalInput prompt="Note">
            <TextInput
              ref={descriptionRef}
              placeholder="description"
              value={description}
              onChangeText={setDescription}
              onSubmitEditing={handleDescriptionSubmit}
              returnKeyType="done"
            />
          </TerminalInput>
        </View>
      )}

      {/* ── Actions ── */}
      {phase === "REVIEW" && (
        <View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => handleSubmit(buildFormData())}
          >
            <Text style={styles.submitText}>Save Transaction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPhase("ENTRY")}
          >
            <Text style={styles.backText}>← Edit</Text>
          </TouchableOpacity>

          {contextType === "EDIT" && handleDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(buildFormData())}
            >
              <Text style={styles.submitText}>Delete Transaction</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  backButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backText: {
    color: "#666",
    fontSize: 14,
  },
});