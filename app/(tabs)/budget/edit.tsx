import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useDependencies } from "@/src/application/providers/dependency-provider";
import { CurrentBudgetData } from "@/src/application/use-case/budget/get-current-budget";
import { terminalTheme } from "@/src/presentation/theme/terminal";
import { TopBar } from "@/src/presentation/components/top-bar";
import {
  formatCurrency,
  parseCurrency,
} from "@/src/presentation/utility/formatter/currency";

const t = terminalTheme;

export default function EditBudgetScreen() {
  const {
    getCurrentBudgetUseCase,
    setMonthlyBudgetUseCase,
    copyBudgetToNextMonthUseCase,
    getAllCategoriesUseCase,
  } = useDependencies();
  const router = useRouter();

  const [budgetData, setBudgetData] = useState<CurrentBudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalBudget, setTotalBudget] = useState(0);
  const [allocations, setAllocations] = useState<
    { categoryId: string; categoryName: string; amount: number }[]
  >([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [selectedAllocationIndex, setSelectedAllocationIndex] = useState<
    number | null
  >(null);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let data = await getCurrentBudgetUseCase.execute();

      if (!data.budget) {
        await copyBudgetToNextMonthUseCase.execute();
        data = await getCurrentBudgetUseCase.execute();
      }

      setBudgetData(data);

      if (data.budget) {
        setTotalBudget(data.budget.totalAmount);
        setAllocations(
          data.budget.allocations.map((a) => ({
            categoryId: a.categoryId,
            categoryName: "",
            amount: a.allocatedAmount,
          })),
        );
      }

      const cats = await getAllCategoriesUseCase.execute();
      setCategories(cats.map((c) => ({ id: c.id.getValue(), name: c.name })));

      if (data.budget) {
        const categoryMap = new Map(cats.map((c) => [c.id.getValue(), c.name]));
        setAllocations((prev) =>
          prev.map((a) => ({
            ...a,
            categoryName: categoryMap.get(a.categoryId) ?? "",
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load budget:", error);
    } finally {
      setLoading(false);
    }
  }, [
    getCurrentBudgetUseCase,
    copyBudgetToNextMonthUseCase,
    getAllCategoriesUseCase,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleSave = async () => {
    const parsedAllocations = allocations
      .filter((a) => a.amount > 0 && a.categoryId)
      .map((a) => ({
        categoryId: a.categoryId,
        allocatedAmount: a.amount,
      }));

    setSaving(true);
    try {
      await setMonthlyBudgetUseCase.execute({
        totalAmount: totalBudget,
        month: budgetData?.month ?? new Date().getMonth() + 1,
        year: budgetData?.year ?? new Date().getFullYear(),
        allocations: parsedAllocations,
      });
      router.back();
    } catch (error) {
      if (error instanceof Error && error.message.includes("exceed budget")) {
        setValidationError(error.message);
      } else {
        console.error("Failed to save budget:", error);
      }
    } finally {
      setSaving(false);
    }
  };

  const addAllocation = () => {
    setAllocations([
      ...allocations,
      { categoryId: "", categoryName: "", amount: 0 },
    ]);
  };

  const updateAllocation = (
    index: number,
    field: "categoryId" | "categoryName" | "amount",
    value: string | number,
  ) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    setAllocations(newAllocations);
  };

  const selectCategory = (category: { id: string; name: string }) => {
    if (selectedAllocationIndex !== null) {
      const newAllocations = [...allocations];
      newAllocations[selectedAllocationIndex] = {
        ...newAllocations[selectedAllocationIndex],
        categoryId: category.id,
        categoryName: category.name,
      };
      setAllocations(newAllocations);
    }
    setCategoryPickerVisible(false);
    setSelectedAllocationIndex(null);
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const canSave = totalBudget > 0 && !saving;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TopBar title="ontrek" subtitle="@edit-budget"/>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {validationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        )}

        <Text style={styles.inputLabel}>TOTAL MONTHLY BUDGET</Text>
        <TextInput
          style={[styles.input, { color: t.colors.secondary }]}
          value={totalBudget > 0 ? formatCurrency(totalBudget) : ""}
          onChangeText={(text) => setTotalBudget(parseCurrency(text))}
          keyboardType="numeric"
          placeholder="Enter amount"
          placeholderTextColor={t.colors.muted}
        />

        <Text style={styles.inputLabel}>CATEGORY ALLOCATIONS</Text>
        {allocations.map((allocation, index) => (
          <View key={index} style={styles.allocationRow}>
            <TouchableOpacity
              style={[styles.input, styles.categoryInput]}
              onPress={() => {
                setSelectedAllocationIndex(index);
                setCategoryPickerVisible(true);
              }}
            >
              <Text
                style={
                  allocation.categoryName
                    ? styles.categoryText
                    : styles.categoryPlaceholder
                }
              >
                {allocation.categoryName || "Select category"}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[
                styles.input,
                styles.amountInput,
                { color: t.colors.secondary },
              ]}
              value={
                allocation.amount > 0 ? formatCurrency(allocation.amount) : ""
              }
              onChangeText={(text) =>
                updateAllocation(index, "amount", parseCurrency(text))
              }
              keyboardType="numeric"
              placeholder="Amount"
              placeholderTextColor={t.colors.muted}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeAllocation(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={addAllocation}>
          <Text style={styles.addButtonText}>+ ADD CATEGORY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "SAVING..." : "SAVE"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {categoryPickerVisible && (
        <>
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => {
              setCategoryPickerVisible(false);
              setSelectedAllocationIndex(null);
            }}
          />
        </>
      )}

      <Modal
        visible={categoryPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setCategoryPickerVisible(false);
          setSelectedAllocationIndex(null);
        }}
        navigationBarTranslucent
      >
        <View style={styles.pickerContainerWrapper}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>SELECT CATEGORY</Text>
              <TouchableOpacity
                onPress={() => {
                  setCategoryPickerVisible(false);
                  setSelectedAllocationIndex(null);
                }}
              >
                <Text style={styles.pickerClose}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {[...categories]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.pickerOption}
                    onPress={() => selectCategory(cat)}
                  >
                    <Text style={styles.pickerOptionText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: t.colors.background,
  },
  loadingText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: t.spacing.lg,
    paddingBottom: 100,
  },
  errorContainer: {
    backgroundColor: t.colors.expense + "20",
    borderWidth: 1,
    borderColor: t.colors.expense,
    borderRadius: t.border.radius,
    padding: t.spacing.md,
    marginBottom: t.spacing.lg,
  },
  errorText: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.colors.expense,
  },
  inputLabel: {
    fontFamily: t.fonts.mono,
    fontSize: 11,
    color: t.colors.muted,
    marginBottom: t.spacing.xs,
  },
  input: {
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.border.radius,
    padding: t.spacing.md,
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.secondary,
    marginBottom: t.spacing.md,
  },
  allocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: t.spacing.sm,
  },
  categoryInput: {
    flex: 2,
    marginRight: t.spacing.sm,
    marginBottom: 0,
    justifyContent: "center",
  },
  amountInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: t.spacing.sm,
  },
  removeButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 20,
    color: t.colors.expense,
  },
  addButton: {
    padding: t.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.border.radius,
    borderStyle: "dashed",
  },
  addButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.colors.muted,
  },
  saveButton: {
    padding: t.spacing.lg,
    alignItems: "center",
    backgroundColor: t.colors.primary,
    borderRadius: t.border.radius,
    marginTop: t.spacing.xl,
  },
  saveButtonDisabled: {
    backgroundColor: t.colors.muted,
  },
  saveButtonText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.background,
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 999,
  },
  pickerContainerWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerContainer: {
    backgroundColor: t.colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: t.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  pickerTitle: {
    fontFamily: t.fonts.mono,
    fontSize: 16,
    color: t.colors.primary,
  },
  pickerClose: {
    fontFamily: t.fonts.mono,
    fontSize: 28,
    color: t.colors.muted,
  },
  pickerList: {
    paddingBottom: 40,
  },
  pickerOption: {
    padding: t.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  pickerOptionText: {
    fontFamily: t.fonts.mono,
    fontSize: 16,
    color: t.colors.secondary,
  },
  categoryText: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.secondary,
  },
  categoryPlaceholder: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
  },
});
