import { useSelectedAccount } from "@/src/application/providers/account-provider";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Account } from "@/src/domain/entities/account";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AccountPage() {
  const { getAllAccountsUseCase, createAccountUseCase } = useDependencies();
  const { selectedAccountId, setSelectedAccountId } = useSelectedAccount();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [accountName, setAccountName] = useState("");

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllAccountsUseCase.execute();
      setAccounts(result);

      // Auto-select first account if none selected
      if (!selectedAccountId && result.length > 0) {
        setSelectedAccountId(result[0].id.getValue());
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [getAllAccountsUseCase, selectedAccountId, setSelectedAccountId]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts]),
  );

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      Alert.alert("Error", "Account name is required");
      return;
    }

    try {
      await createAccountUseCase.execute({
        name: accountName,
        balance: 0,
      });

      setAccountName("");
      setModalVisible(false);
      await loadAccounts();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  if (loading && accounts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Accounts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Account</Text>
        </TouchableOpacity>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No accounts yet</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createFirstButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id.getValue()}
          renderItem={({ item }) => {
            const isSelected = selectedAccountId === item.id.getValue();
            return (
              <TouchableOpacity
                style={[
                  styles.accountCard,
                  isSelected && styles.accountCardSelected,
                ]}
                onPress={() => handleSelectAccount(item.id.getValue())}
              >
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{item.name}</Text>
                  <Text style={styles.accountBalance}>
                    Rp {item.balance.toLocaleString()}
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedText}>Active</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Account</Text>

            <TextInput
              placeholder="Account Name"
              value={accountName}
              onChangeText={setAccountName}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setAccountName("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateAccount}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  addButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  accountCardSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#F0F9FF",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectedBadge: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  createFirstButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  createButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
