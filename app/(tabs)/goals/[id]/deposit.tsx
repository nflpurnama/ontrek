import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { TopBar } from "@/src/presentation/components/top-bar";
import { formatCurrency, parseCurrency } from "@/src/presentation/utility/formatter/currency";

export default function DepositToGoal() {
  const { theme } = useTheme();
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TopBar
        title="ontrek"
        subtitle="@goal/deposit"
        rightAction={{
          label: loading ? "..." : "ADD",
          onPress: handleDeposit,
          disabled: loading || amount <= 0,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { padding: theme.spacing.lg }]}>
        <View style={[styles.inputGroup, { marginBottom: theme.spacing.xl }]}>
          <Text style={[styles.label, { fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.secondary, marginBottom: theme.spacing.sm }]}>AMOUNT</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius, padding: theme.spacing.lg, fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.primary }]}
            value={amount > 0 ? formatCurrency(amount) : ""}
            onChangeText={(text) => {
              const raw = parseCurrency(text);
              setAmount(raw);
            }}
            placeholder="0"
            placeholderTextColor={theme.colors.muted}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.expense, borderRadius: theme.border.radius, padding: theme.spacing.lg, alignItems: "center", marginTop: theme.spacing.lg }, loading && { opacity: 0.5 }]}
          onPress={handleDeposit}
          disabled={loading}
        >
          <Text style={[styles.actionButtonText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.background }]}>
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
  },
  scrollView: {
    flex: 1,
  },
  content: {},
  inputGroup: {},
  label: {},
  input: {},
  actionButton: {},
  buttonDisabled: {},
  actionButtonText: {},
});
