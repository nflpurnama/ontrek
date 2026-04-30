import { Stack } from "expo-router/stack";
import { View } from "react-native";
import { useTheme } from "@/src/presentation/theme/theme-provider";

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function BudgetLayout() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </View>
  );
}
