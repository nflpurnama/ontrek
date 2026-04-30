import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useTheme } from "@/src/presentation/theme/theme-provider";

interface TopBarProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
  };
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  rightAction,
}) => {
  const { theme: t } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: t.colors.card, borderBottomColor: t.colors.border }]}>
      <View style={styles.left}>
        <Text style={[styles.title, { fontFamily: t.fonts.mono, color: t.colors.secondary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { fontFamily: t.fonts.mono, color: t.colors.muted }]}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            disabled={rightAction.disabled}
            style={styles.rightButton}
          >
            <Text
              style={[
                styles.rightText,
                { fontFamily: t.fonts.mono, color: rightAction.disabled ? t.colors.muted : t.colors.primary }
              ]}
            >
              {rightAction.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  right: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 14,
  },
  rightButton: {
    paddingVertical: 4,
  },
  rightText: {
    fontSize: 12,
  },
  rightTextDisabled: {
  },
});
