import React, { useState, useCallback, useEffect } from "react";
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
import { Vendor } from "@/src/domain/entities/vendor";
import { router } from "expo-router";

export default function VendorsScreen() {
  const { theme } = useTheme();
  const t = theme;
  const { vendorRepository, getAllCategoriesUseCase, createVendorUseCase } = useDependencies();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const loadVendors = useCallback(async () => {
    setLoading(true);
    const allVendors = await vendorRepository.getAllVendors();
    setVendors(allVendors);
    setLoading(false);
  }, [vendorRepository]);

  const loadCategories = useCallback(async () => {
    const cats = await getAllCategoriesUseCase.execute();
    setCategories(cats.map((c) => ({ id: c.id.getValue(), name: c.name })));
  }, [getAllCategoriesUseCase]);

  useFocusEffect(
    useCallback(() => {
      loadVendors();
      loadCategories();
    }, [loadVendors, loadCategories])
  );

  const openAddModal = () => {
    setEditingVendor(null);
    setVendorName("");
    setSelectedCategoryId(null);
    setModalVisible(true);
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorName(vendor.name);
    setSelectedCategoryId(vendor.defaultCategoryId);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!vendorName.trim()) {
      Alert.alert("Error", "Vendor name cannot be empty");
      return;
    }

    try {
      if (editingVendor) {
        editingVendor.rename(vendorName);
        if (selectedCategoryId) {
          editingVendor.setDefaultCategory(selectedCategoryId);
        } else {
          editingVendor.clearDefaultCategory();
        }
        await vendorRepository.updateVendor(editingVendor);
      } else {
        await createVendorUseCase.execute({ name: vendorName, categoryId: selectedCategoryId });
      }
      setModalVisible(false);
      loadVendors();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to save vendor");
    }
  };

  const handleDelete = (vendor: Vendor) => {
    Alert.alert(
      "Delete Vendor",
      `Are you sure you want to delete "${vendor.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await vendorRepository.deleteVendor(vendor.id);
              loadVendors();
            } catch (error) {
              Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete vendor");
            }
          },
        },
      ]
    );
  };

  const selectedCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name ?? "None";

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <TopBar
        title="vendors"
        subtitle="@settings"
        rightAction={{ label: "+ add", onPress: openAddModal }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={t.colors.primary} />
        </View>
      ) : vendors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: t.colors.muted }]}>No vendors yet</Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: t.colors.primary }]} onPress={openAddModal}>
            <Text style={[styles.emptyButtonText, { color: t.colors.background }]}>Add your first vendor</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id.getValue()}
              vendor={vendor}
              categoryName={categories.find((c) => c.id === vendor.defaultCategoryId)?.name}
              onEdit={() => openEditModal(vendor)}
              onDelete={() => handleDelete(vendor)}
            />
          ))}
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: t.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}>
            <Text style={[styles.modalTitle, { color: t.colors.secondary }]}>
              {editingVendor ? "Edit Vendor" : "New Vendor"}
            </Text>

            <Text style={[styles.inputLabel, { color: t.colors.muted }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.colors.background, color: t.colors.secondary, borderColor: t.colors.border }]}
              value={vendorName}
              onChangeText={setVendorName}
              placeholder="Vendor name"
              placeholderTextColor={t.colors.muted}
              autoFocus
            />

            <Text style={[styles.inputLabel, { color: t.colors.muted }]}>Default Category</Text>
            <TouchableOpacity
              style={[styles.input, { backgroundColor: t.colors.background, borderColor: t.colors.border }]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={{ color: t.colors.secondary }}>{selectedCategoryName}</Text>
            </TouchableOpacity>

            <Modal visible={showCategoryPicker} animationType="slide" transparent>
              <View style={[styles.modalOverlay, { backgroundColor: t.colors.overlay }]}>
                <View style={[styles.modalContent, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}>
                  <Text style={[styles.modalTitle, { color: t.colors.secondary }]}>Select Category</Text>
                  <TouchableOpacity
                    style={[styles.categoryOption, { borderBottomColor: t.colors.border }]}
                    onPress={() => { setSelectedCategoryId(null); setShowCategoryPicker(false); }}
                  >
                    <Text style={{ color: t.colors.secondary }}>None</Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryOption, { borderBottomColor: t.colors.border }]}
                      onPress={() => { setSelectedCategoryId(cat.id); setShowCategoryPicker(false); }}
                    >
                      <Text style={{ color: t.colors.secondary }}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: t.colors.muted }]}
                    onPress={() => setShowCategoryPicker(false)}
                  >
                    <Text style={{ color: t.colors.background }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

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

function VendorCard({
  vendor,
  categoryName,
  onEdit,
  onDelete,
}: {
  vendor: Vendor;
  categoryName?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.vendorCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.border.radius }]}>
      <View style={styles.vendorInfo}>
        <Text style={[styles.vendorName, { fontFamily: theme.fonts.mono, color: theme.colors.secondary }]}>{vendor.name}</Text>
        {categoryName && (
          <Text style={[styles.vendorCategory, { fontFamily: theme.fonts.mono, color: theme.colors.muted }]}>Default: {categoryName}</Text>
        )}
      </View>
      <View style={styles.vendorActions}>
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
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontFamily: "JetBrains Mono",
    fontSize: 14,
  },
  vendorCategory: {
    fontFamily: "JetBrains Mono",
    fontSize: 11,
    marginTop: 2,
  },
  vendorActions: {
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
  categoryOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
});
