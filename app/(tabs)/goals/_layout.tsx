import { Stack } from "expo-router/stack";
import { View } from "react-native";
import { terminalTheme } from "@/src/presentation/theme/terminal";

const t = terminalTheme;

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function GoalsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.colors.background },
        }}
      />
    </View>
  );
}