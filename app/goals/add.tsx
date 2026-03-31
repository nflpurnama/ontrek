import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { terminalTheme } from "@/src/presentation/theme/terminal";
import { formatCurrency, parseCurrency } from "@/src/presentation/utility/formatter/currency";

const t = terminalTheme;

export default function AddGoal() {
  const { createSavingsGoalUseCase } = useDependencies();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/[^\d/]/g, "");
    if (cleaned.length <= 10) {
      if (cleaned.length === 2 || cleaned.length === 5) {
        const withSlash = cleaned + "/";
        const parts = withSlash.split("/");
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10);
          const day = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          if (month <= 12 && day <= 31 && year >= 2000) {
            setTargetDate(new Date(year, month - 1, day));
          }
        } else {
          setTargetDate(null);
        }
      } else if (cleaned.length < 2) {
        setTargetDate(null);
      }
    }
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

    if (targetDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        Alert.alert("Error", "Target date cannot be in the past");
        return;
      }
    }

    setSaving(true);
    try {
      await createSavingsGoalUseCase.execute({
        name: name.trim(),
        targetAmount: amount,
        targetDate: targetDate ?? undefined,
        month: currentMonth,
        year: currentYear,
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to create goal. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [name, amount, targetDate, currentMonth, currentYear, createSavingsGoalUseCase, router]);

  useFocusEffect(
    useCallback(() => {
      setName("");
      setAmount(0);
      setTargetDate(null);
    }, [])
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>NEW GOAL</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>GOAL NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Emergency Fund"
            placeholderTextColor={t.colors.muted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>TARGET AMOUNT</Text>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>TARGET DATE (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            value={formatDateDisplay(targetDate)}
            onChangeText={handleDateChange}
            placeholder="MM/DD/YYYY"
            placeholderTextColor={t.colors.muted}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
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
  saveButton: {
    backgroundColor: t.colors.accent,
    borderRadius: t.border.radius,
    padding: t.spacing.lg,
    alignItems: "center",
    marginTop: t.spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    fontWeight: "700",
    color: t.colors.background,
  },
});