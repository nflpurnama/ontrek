import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { TopBar } from "@/src/presentation/components/top-bar";
import { formatCurrency, parseCurrency } from "@/src/presentation/utility/formatter/currency";

export default function AddGoal() {
  const { theme } = useTheme();
  const { createSavingsGoalUseCase } = useDependencies();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [targetDateStr, setTargetDateStr] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const formatDateInput = (text: string): string => {
    const digits = text.replace(/[^\d]/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

  const handleDateChange = (text: string) => {
    setTargetDateStr(formatDateInput(text));
  };

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a goal name");
      return;
    }

    if (amount <= 0) {
      Alert.alert("Error", "Please enter a valid target amount");
      return;
    }

    let parsedDate: Date | undefined = undefined;
    if (targetDateStr.trim()) {
      const match = targetDateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!match) {
        Alert.alert("Error", "Invalid date format");
        return;
      }
      const [, month, day, year] = match;
      parsedDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        Alert.alert("Error", "Target date cannot be in the past");
        return;
      }
    }

    setSaving(true);
    try {
      await createSavingsGoalUseCase.execute({
        name: name.trim(),
        targetAmount: amount,
        targetDate: parsedDate,
        month: currentMonth,
        year: currentYear,
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to create goal. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [name, amount, targetDateStr, currentMonth, currentYear, createSavingsGoalUseCase, router]);

  useFocusEffect(
    useCallback(() => {
      setName("");
      setAmount(0);
      setTargetDateStr("");
    }, [])
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TopBar title="ontrek" subtitle="@add-goal" />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { padding: theme.spacing.lg }]}>
        <View style={[styles.inputGroup, { marginBottom: theme.spacing.xl }]}>
          <Text style={[styles.label, { fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.secondary, marginBottom: theme.spacing.sm }]}>GOAL NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius, padding: theme.spacing.lg, fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.primary }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Emergency Fund"
            placeholderTextColor={theme.colors.muted}
            autoCapitalize="words"
          />
        </View>

        <View style={[styles.inputGroup, { marginBottom: theme.spacing.xl }]}>
          <Text style={[styles.label, { fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.secondary, marginBottom: theme.spacing.sm }]}>TARGET AMOUNT</Text>
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

        <View style={[styles.inputGroup, { marginBottom: theme.spacing.xl }]}>
          <Text style={[styles.label, { fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.secondary, marginBottom: theme.spacing.sm }]}>TARGET DATE (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius, padding: theme.spacing.lg, fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.primary }]}
            value={targetDateStr}
            onChangeText={handleDateChange}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={theme.colors.muted}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.accent, borderRadius: theme.border.radius, padding: theme.spacing.lg, alignItems: "center", marginTop: theme.spacing.lg }, saving && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveButtonText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.background }]}>
            {saving ? "SAVING..." : "CREATE GOAL"}
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
  saveButton: {},
  saveButtonDisabled: {},
  saveButtonText: {},
});
