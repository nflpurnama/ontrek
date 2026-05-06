import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/src/presentation/theme/theme-provider";
import { ThemeName, themeMetadata, Theme } from "@/src/presentation/theme";
import { TopBar } from "@/src/presentation/components/top-bar";
import { router } from "expo-router";

export default function SettingsScreen() {
  const { theme, themeName, setTheme } = useTheme();
  const t = theme;

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background }]}>
      <TopBar title="settings" subtitle="@preferences" />

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="APPEARANCE" />

        {themeMetadata.map((meta) => (
          <ThemeOption
            key={meta.name}
            meta={meta}
            isSelected={meta.name === themeName}
            onPress={() => setTheme(meta.name)}
          />
        ))}

        <SectionHeader title="DATA" />

        <SettingsItem
          icon="storefront"
          label="Vendors"
          description="Manage your vendor list"
          onPress={() => router.push("/(tabs)/settings/vendors" as any)}
        />
        <SettingsItem
          icon="pricetags"
          label="Categories"
          description="Manage your categories"
          onPress={() => router.push("/(tabs)/settings/categories" as any)}
        />
        <SettingsItem
          icon="download"
          label="Data"
          description="Export or import your data"
          onPress={() => router.push("/(tabs)/settings/data" as any)}
        />
      </ScrollView>
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

function ThemeOption({
  meta,
  isSelected,
  onPress,
}: {
  meta: { name: ThemeName; label: string; description: string };
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.themeOption, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.border.radius }]}>
      <View style={styles.themePreview}>
        <View style={[styles.previewDot, { backgroundColor: theme.colors.primary }]} />
        <View style={styles.themeInfo}>
          <Text style={[styles.themeLabel, { color: theme.colors.secondary }]}>{meta.label}</Text>
          <Text style={[styles.themeDescription, { color: theme.colors.muted }]}>{meta.description}</Text>
        </View>
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );
}

function SettingsItem({
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
    <TouchableOpacity onPress={onPress} style={[styles.settingsItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.border.radius }]}>
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon as any} size={22} color={theme.colors.primary} />
        <View style={styles.settingsItemInfo}>
          <Text style={[styles.settingsItemLabel, { color: theme.colors.secondary }]}>{label}</Text>
          <Text style={[styles.settingsItemDescription, { color: theme.colors.muted }]}>{description}</Text>
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
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  themePreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  themeInfo: {
    flexDirection: "column",
  },
  themeLabel: {
    fontFamily: "JetBrains Mono",
    fontSize: 14,
  },
  themeDescription: {
    fontFamily: "JetBrains Mono",
    fontSize: 11,
    marginTop: 2,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsItemInfo: {
    marginLeft: 12,
  },
  settingsItemLabel: {
    fontFamily: "JetBrains Mono",
    fontSize: 14,
  },
  settingsItemDescription: {
    fontFamily: "JetBrains Mono",
    fontSize: 11,
    marginTop: 2,
  },
});
