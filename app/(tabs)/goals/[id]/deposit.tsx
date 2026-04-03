import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { terminalTheme } from "@/src/presentation/theme/terminal";
import { formatCurrency, parseCurrency } from "@/src/presentation/utility/formatter/currency";

const t = terminalTheme;

export default function DepositToGoal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { depositToSavingsGoalUseCase, getAllSavingsGoalsUseCase } = useDependencies();
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeposit = useCallback(async () => {
    if (amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await depositToSavingsGoalUseCase.execute({
        goalId: id,
        amount,
      });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to deposit");
    } finally {
      setLoading(false);
    }
  }, [id, amount, depositToSavingsGoalUseCase, router]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>DEPOSIT</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>AMOUNT</Text>
          <TextInput
            style={styles.input}
            value={amount > 0 ? formatCurrency(amount) : ""}
            onChangeText={(text) => {
              const raw = parseCurrency(text);
              setAmount(raw);
            }}
            placeholder="0"
            placeholderTextColor={t.colors.muted}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, loading && styles.buttonDisabled]} 
          onPress={handleDeposit}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? "DEPOSITING..." : "DEPOSIT"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: t.spacing.lg,
    paddingTop: 50,
    paddingBottom: t.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  backButton: {
    marginRight: t.spacing.md,
  },
  backText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.primary,
  },
  title: {
    fontFamily: t.fonts.mono,
    fontSize: 16,
    fontWeight: "700",
    color: t.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: t.spacing.lg,
  },
  inputGroup: {
    marginBottom: t.spacing.xl,
  },
  label: {
    fontFamily: t.fonts.mono,
    fontSize: 11,
    color: t.colors.secondary,
    marginBottom: t.spacing.sm,
  },
  input: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.border.radius,
    padding: t.spacing.lg,
    fontFamily: t.fonts.mono,
    fontSize: 16,
    color: t.colors.primary,
  },
  actionButton: {
    backgroundColor: t.colors.expense,
    borderRadius: t.border.radius,
    padding: t.spacing.lg,
    alignItems: "center",
    marginTop: t.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    fontWeight: "700",
    color: t.colors.background,
  },
});