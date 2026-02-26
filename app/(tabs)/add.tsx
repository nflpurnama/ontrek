import { useSelectedAccount } from "@/src/application/providers/account-provider";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { TransactionType } from "@/src/domain/constants/transaction-type";
import { Account } from "@/src/domain/entities/account";
import { Vendor } from "@/src/domain/entities/vendor";
import { AmountInput } from "@/src/presentation/components/inputs/amount-input";
import { TransactionTypeInput } from "@/src/presentation/components/inputs/transaction-type-input";
import { VendorInput } from "@/src/presentation/components/inputs/vendor-input";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTransactionScreen() {
  const {
    createTransactionUseCase,
    findVendorsUseCase,
    getAllAccountsUseCase,
  } = useDependencies();
  const { selectedAccountId, setSelectedAccountId } = useSelectedAccount();

  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<TransactionType>(TransactionType.DEBIT);

  const [vendorQuery, setVendorQuery] = useState<string>("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorSuggestions, setVendorSuggestions] = useState<Vendor[]>([]);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const allAccounts = await getAllAccountsUseCase.execute();
      setAccounts(allAccounts);

      // Find selected account or use first
      const accountId =
        selectedAccountId ||
        (allAccounts.length > 0 ? allAccounts[0].id.getValue() : null);
      if (accountId) {
        const account = allAccounts.find(
          (acc) => acc.id.getValue() === accountId,
        );
        setSelectedAccount(account || null);
        if (!selectedAccountId && allAccounts.length > 0) {
          setSelectedAccountId(allAccounts[0].id.getValue());
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load accounts");
    } finally {
      setLoadingAccounts(false);
    }
  }, [getAllAccountsUseCase, selectedAccountId, setSelectedAccountId]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts]),
  );

  const clearAll = () => {
    setAmount(0);
    setDescription("");
    setType(TransactionType.DEBIT);
    setVendorQuery("");
    setSelectedVendor(null);
  };

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setSelectedAccountId(account.id.getValue());
    setAccountModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert("Error", "Amount is required");
      return;
    }

    if (!selectedAccountId) {
      Alert.alert("Error", "Please select an account");
      return;
    }

    try {
      await createTransactionUseCase.execute({
        vendorName: vendorQuery || null,
        vendor: selectedVendor,
        accountId: selectedAccountId,
        categoryId: null,
        transactionDate: new Date(),
        type,
        amount: amount,
        description,
      });

      Alert.alert("Success", "Transaction added successfully");
      clearAll();
      await loadAccounts();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    if (!vendorQuery.trim()) {
      setVendorSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const results = await findVendorsUseCase.execute({ name: vendorQuery });
      setVendorSuggestions(results);
    }, 300);

    return () => clearTimeout(timeout);
  }, [findVendorsUseCase, vendorQuery]);

  if (loadingAccounts) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Add Transaction</Text>

        {/* Account Selector */}
        <TouchableOpacity
          style={styles.accountSelector}
          onPress={() => setAccountModalVisible(true)}
        >
          <View>
            <Text style={styles.accountSelectorLabel}>Account</Text>
            <Text style={styles.accountSelectorValue}>
              {selectedAccount?.name || "Select Account"}
            </Text>
          </View>
          <Text style={styles.accountSelectorArrow}>›</Text>
        </TouchableOpacity>

        <AmountInput value={amount} onChange={setAmount} />

        <TransactionTypeInput type={type} setType={setType} />

        <VendorInput
          query={vendorQuery}
          setQuery={setVendorQuery}
          suggestions={vendorSuggestions}
          setSuggestions={setVendorSuggestions}
          setVendor={setSelectedVendor}
        />

        <TextInput
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Account Selection Modal */}
      <Modal
        visible={accountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Account</Text>
            <FlatList
              data={accounts}
              keyExtractor={(item) => item.id.getValue()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalAccountItem,
                    selectedAccount?.id.getValue() === item.id.getValue() &&
                      styles.modalAccountItemSelected,
                  ]}
                  onPress={() => handleSelectAccount(item)}
                >
                  <View>
                    <Text
                      style={[
                        styles.modalAccountName,
                        selectedAccount?.id.getValue() === item.id.getValue() &&
                          styles.modalAccountNameSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.modalAccountBalance,
                        selectedAccount?.id.getValue() === item.id.getValue() &&
                          styles.modalAccountBalanceSelected,
                      ]}
                    >
                      Rp {item.balance.toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              scrollEnabled={true}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#1F2937",
  },
  accountSelector: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  accountSelectorLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  accountSelectorValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  accountSelectorArrow: {
    fontSize: 24,
    color: "#9CA3AF",
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    elevation: 2,
    color: "#1F2937",
  },
  submitButton: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  modalAccountItem: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  modalAccountItemSelected: {
    backgroundColor: "#F0F9FF",
    borderColor: "#2563EB",
  },
  modalAccountName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  modalAccountNameSelected: {
    color: "#2563EB",
  },
  modalAccountBalance: {
    fontSize: 12,
    color: "#6B7280",
  },
  modalAccountBalanceSelected: {
    color: "#2563EB",
  },
});
