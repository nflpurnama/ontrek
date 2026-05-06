import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useDependencies } from "@/src/application/providers/dependency-provider";
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { TopBar } from "@/src/presentation/components/top-bar";
import { Category } from "@/src/domain/entities/category";

export default function CategoriesScreen() {
  const { theme } = useTheme();
  const t = theme;
  const { categoryRepository, createCategoryUseCase, updateCategoryUseCase, deleteCategoryUseCase } = useDependencies();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const allCategories = await categoryRepository.getAllCategories();
    setCategories(allCategories);
    setLoading(false);
  }, [categoryRepository]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Error", "Category name cannot be empty");
      return;
    }

    try {
      if (editingCategory) {
        editingCategory.rename(categoryName);
        await updateCategoryUseCase.execute(editingCategory);
      } else {
        await createCategoryUseCase.execute({ name: categoryName });
      }
      setModalVisible(false);
      loadCategories();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save category");
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategoryUseCase.execute(category.id);
              loadCategories();
            } catch (error) {
              Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete category");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <TopBar
        title="categories"
        subtitle="@settings"
        rightAction={{ label: "+ add", onPress: openAddModal }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={t.colors.primary} />
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: t.colors.muted }]}>No categories yet</Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: t.colors.primary }]} onPress={openAddModal}>
            <Text style={[styles.emptyButtonText, { color: t.colors.background }]}>Add your first category</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id.getValue()}
              category={category}
              onEdit={() => openEditModal(category)}
              onDelete={() => handleDelete(category)}
            />
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: t.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}>
            <Text style={[styles.modalTitle, { color: t.colors.secondary }]}>
              {editingCategory ? "Edit Category" : "New Category"}
            </Text>

            <Text style={[styles.inputLabel, { color: t.colors.muted }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.colors.background, color: t.colors.secondary, borderColor: t.colors.border }]}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Category name"
              placeholderTextColor={t.colors.muted}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: t.colors.muted }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: t.colors.background }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: t.colors.primary }]}
                onPress={handleSave}
              >
                <Text style={{ color: t.colors.background }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.categoryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.border.radius }]}>
      <View style={styles.categoryInfo}>
        <Text style={[styles.categoryName, { fontFamily: theme.fonts.mono, color: theme.colors.secondary }]}>{category.name}</Text>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <Ionicons name="pencil" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
          <Ionicons name="trash" size={18} color={theme.colors.expense} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "JetBrains Mono",
    fontSize: 16,
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontFamily: "JetBrains Mono",
    fontSize: 14,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontFamily: "JetBrains Mono",
    fontSize: 14,
  },
  categoryActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalTitle: {
    fontFamily: "JetBrains Mono",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  inputLabel: {
    fontFamily: "JetBrains Mono",
    fontSize: 11,
    marginBottom: 6,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    fontFamily: "JetBrains Mono",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    fontFamily: "JetBrains Mono",
    fontSize: 14,
  },
});
