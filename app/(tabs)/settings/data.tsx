import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";

import { useDependencies } from "@/src/application/providers/dependency-provider";
import { useTheme } from "@/src/presentation/theme/theme-provider";
import { TopBar } from "@/src/presentation/components/top-bar";

export default function DataManagementScreen() {
  const { theme } = useTheme();
  const t = theme;
  const { transactionExportUseCase, transactionImportUseCase } = useDependencies();

  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const file = await transactionExportUseCase.execute();

      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        UTI: "public.json",
      });

      setExportModalVisible(false);
      Alert.alert("Success", "Transactions exported successfully");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const files = await FileSystem.File.pickFileAsync();
      const fileArray = Array.isArray(files) ? files : [files];
      const file = fileArray[0];

      setImporting(true);
      const importResult = await transactionImportUseCase.execute(file);

      if (importResult.success) {
        setImportModalVisible(false);
        Alert.alert("Success", importResult.message);
      } else {
        Alert.alert("Error", importResult.message);
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to import data");
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <TopBar title="data" subtitle="@settings" />

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="EXPORT" />
        <DataActionCard
          icon="cloud-upload"
          label="Export Transactions"
          description="Export all transactions as a plain JSON file"
          onPress={() => setExportModalVisible(true)}
        />

        <SectionHeader title="IMPORT" />
        <DataActionCard
          icon="cloud-download"
          label="Import Transactions"
          description="Import transactions from a JSON file"
          onPress={() => setImportModalVisible(true)}
        />
      </ScrollView>

      <Modal visible={exportModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: t.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}>
            <Text style={[styles.modalTitle, { color: t.colors.secondary }]}>
              Export Transactions
            </Text>
            <Text style={[styles.modalDescription, { color: t.colors.muted }]}>
              This will export all transactions (date, type, amount, description) as a plain JSON file.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: t.colors.muted }]}
                onPress={() => setExportModalVisible(false)}
              >
                <Text style={{ color: t.colors.background }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: t.colors.primary }]}
                onPress={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator color={t.colors.background} />
                ) : (
                  <Text style={{ color: t.colors.background }}>Export</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={importModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: t.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}>
            <Text style={[styles.modalTitle, { color: t.colors.secondary }]}>
              Import Transactions
            </Text>
            <Text style={[styles.modalDescription, { color: t.colors.muted }]}>
              Select a JSON file exported from Ontrek. Transactions with matching IDs will be skipped. Account balance will be recalculated after import.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: t.colors.muted }]}
                onPress={() => setImportModalVisible(false)}
              >
                <Text style={{ color: t.colors.background }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: t.colors.primary }]}
                onPress={handleImport}
                disabled={importing}
              >
                {importing ? (
                  <ActivityIndicator color={t.colors.background} />
                ) : (
                  <Text style={{ color: t.colors.background }}>Import</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { theme } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: theme.colors.muted }]}>
      {title}
    </Text>
  );
}

function DataActionCard({
  icon,
  label,
  description,
  onPress,
}: {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.border.radius }]}>
      <View style={styles.actionCardLeft}>
        <Ionicons name={icon as any} size={22} color={theme.colors.primary} />
        <View style={styles.actionCardInfo}>
          <Text style={[styles.actionCardLabel, { color: theme.colors.secondary }]}>{label}</Text>
          <Text style={[styles.actionCardDescription, { color: theme.colors.muted }]}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontFamily: "JetBrains Mono",
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 8,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  actionCardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionCardInfo: {
    marginLeft: 12,
  },
  actionCardLabel: {
    fontFamily: "JetBrains Mono",
    fontSize: 14,
  },
  actionCardDescription: {
    fontFamily: "JetBrains Mono",
    fontSize: 11,
    marginTop: 2,
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
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontFamily: "JetBrains Mono",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
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
