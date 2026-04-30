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
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { TopBar } from "@/src/presentation/components/top-bar";
import {
  formatCurrency,
  parseCurrency,
} from "@/src/presentation/utility/formatter/currency";

export default function EditBudgetScreen() {
  const { theme } = useTheme();
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
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedAllocationIndex, setSelectedAllocationIndex] = useState<number | null>(null);
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
  }, [getCurrentBudgetUseCase, copyBudgetToNextMonthUseCase, getAllCategoriesUseCase]);

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
    setAllocations([...allocations, { categoryId: "", categoryName: "", amount: 0 }]);
  };

  const updateAllocation = (index: number, field: "categoryId" | "categoryName" | "amount", value: string | number) => {
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.muted }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TopBar title="ontrek" subtitle="@edit-budget"/>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { padding: theme.spacing.lg, paddingBottom: 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {validationError && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.expense + "20", borderWidth: 1, borderColor: theme.colors.expense, borderRadius: theme.border.radius, padding: theme.spacing.md, marginBottom: theme.spacing.lg }]}>
            <Text style={[styles.errorText, { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.expense }]}>{validationError}</Text>
          </View>
        )}

        <Text style={[styles.inputLabel, { fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.muted, marginBottom: theme.spacing.xs }]}>TOTAL MONTHLY BUDGET</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius, padding: theme.spacing.md, fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.secondary, marginBottom: theme.spacing.md }]}
          value={totalBudget > 0 ? formatCurrency(totalBudget) : ""}
          onChangeText={(text) => setTotalBudget(parseCurrency(text))}
          keyboardType="numeric"
          placeholder="Enter amount"
          placeholderTextColor={theme.colors.muted}
        />

        <Text style={[styles.inputLabel, { fontFamily: theme.fonts.mono, fontSize: 11, color: theme.colors.muted, marginBottom: theme.spacing.xs }]}>CATEGORY ALLOCATIONS</Text>
        {allocations.map((allocation, index) => (
          <View key={index} style={[styles.allocationRow, { flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }]}>
            <TouchableOpacity
              style={[styles.input, styles.categoryInput, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius, padding: theme.spacing.md, marginBottom: 0, flex: 2, marginRight: theme.spacing.sm, justifyContent: "center" }]}
              onPress={() => {
                setSelectedAllocationIndex(index);
                setCategoryPickerVisible(true);
              }}
            >
              <Text style={allocation.categoryName ? { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.secondary } : { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.muted }}>
                {allocation.categoryName || "Select category"}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.amountInput, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius, padding: theme.spacing.md, fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.secondary, marginBottom: 0, flex: 1 }]}
              value={allocation.amount > 0 ? formatCurrency(allocation.amount) : ""}
              onChangeText={(text) => updateAllocation(index, "amount", parseCurrency(text))}
              keyboardType="numeric"
              placeholder="Amount"
              placeholderTextColor={theme.colors.muted}
            />
            <TouchableOpacity style={[styles.removeButton, { width: 32, height: 32, justifyContent: "center", alignItems: "center", marginLeft: theme.spacing.sm }]} onPress={() => removeAllocation(index)}>
              <Text style={[styles.removeButtonText, { fontFamily: theme.fonts.mono, fontSize: 20, color: theme.colors.expense }]}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={[styles.addButton, { padding: theme.spacing.md, alignItems: "center", borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.border.radius, borderStyle: "dashed", marginBottom: theme.spacing.md }]} onPress={addAllocation}>
          <Text style={[styles.addButtonText, { fontFamily: theme.fonts.mono, fontSize: 12, color: theme.colors.muted }]}>+ ADD CATEGORY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, { padding: theme.spacing.lg, alignItems: "center", backgroundColor: canSave ? theme.colors.primary : theme.colors.muted, borderRadius: theme.border.radius, marginTop: theme.spacing.xl }]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={[styles.saveButtonText, { fontFamily: theme.fonts.mono, fontSize: 14, color: theme.colors.background }]}>
            {saving ? "SAVING..." : "SAVE"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {categoryPickerVisible && (
        <>
          <TouchableOpacity
            style={[styles.pickerOverlay, { backgroundColor: "rgba(0,0,0,0.7)" }]}
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
        <View style={[styles.pickerContainerWrapper, { flex: 1, justifyContent: "flex-end" }]}>
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "60%" }]}>
            <View style={[styles.pickerHeader, { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.pickerTitle, { fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.primary }]}>SELECT CATEGORY</Text>
              <TouchableOpacity onPress={() => { setCategoryPickerVisible(false); setSelectedAllocationIndex(null); }}>
                <Text style={[styles.pickerClose, { fontFamily: theme.fonts.mono, fontSize: 28, color: theme.colors.muted }]}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map((cat) => (
                <TouchableOpacity key={cat.id} style={[styles.pickerOption, { padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]} onPress={() => selectCategory(cat)}>
                  <Text style={[styles.pickerOptionText, { fontFamily: theme.fonts.mono, fontSize: 16, color: theme.colors.secondary }]}>{cat.name}</Text>
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
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {},
  scrollView: { flex: 1 },
  content: {},
  errorContainer: {},
  errorText: {},
  inputLabel: {},
  input: {},
  allocationRow: {},
  categoryInput: {},
  amountInput: {},
  removeButton: {},
  removeButtonText: {},
  addButton: {},
  addButtonText: {},
  saveButton: {},
  saveButtonDisabled: {},
  saveButtonText: {},
  pickerOverlay: {},
  pickerContainerWrapper: {},
  pickerContainer: {},
  pickerHeader: {},
  pickerTitle: {},
  pickerClose: {},
  pickerList: {},
  pickerOption: {},
  pickerOptionText: {},
  categoryText: {},
  categoryPlaceholder: {},
});
