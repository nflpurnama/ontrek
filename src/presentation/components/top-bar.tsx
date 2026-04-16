import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { terminalTheme } from "../theme/terminal";

const t = terminalTheme;

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
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
                rightAction.disabled && styles.rightTextDisabled,
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
    paddingHorizontal: t.spacing.lg,
    paddingTop: 50,
    paddingBottom: t.spacing.md,
    backgroundColor: t.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
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
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.secondary,
  },
  subtitle: {
    fontFamily: t.fonts.mono,
    fontSize: 14,
    color: t.colors.muted,
  },
  rightButton: {
    paddingVertical: t.spacing.xs,
  },
  rightText: {
    fontFamily: t.fonts.mono,
    fontSize: 12,
    color: t.colors.primary,
  },
  rightTextDisabled: {
    color: t.colors.muted,
  },
});