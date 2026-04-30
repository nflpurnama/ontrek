import { Tabs } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/presentation/theme/theme-provider";

export default function TabsLayout() {
  const { theme: t } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <FloatingTabBar {...props} theme={t} />}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="transactions" options={{ title: "Transactions" }} />
      <Tabs.Screen name="budget" options={{ title: "Budget" }} />
      <Tabs.Screen name="goals" options={{ title: "Goals" }} />
      <Tabs.Screen name="add" options={{ title: "Add" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", href: null }} />
    </Tabs>
  );
}

function FloatingTabBar({ state, descriptors, navigation, theme }: any) {
const insets = useSafeAreaInsets();
const t = theme;

const visibleRoutes = state.routes.filter((route: any) =>
  route.name !== "accounts" && route.name !== "vendors" && route.name !== "settings" && !route.name.startsWith("(goals)/") && !route.name.startsWith("(budget)/")
);

return (
    <View style={[styles.wrapper, {bottom: insets.bottom}]}>
      <View style={[styles.container, { backgroundColor: t.colors.card, borderColor: t.colors.border, shadowColor: t.colors.shadow }]}>
        {visibleRoutes.map((route: any, index: number) => {
          const actualIndex = state.routes.findIndex((r: any) => r.name === route.name);
          const isFocused = state.index === actualIndex;

          const onPress = () => {
            navigation.navigate(route.name);
          };

          const iconName =
            route.name === "index"
              ? "home"
              : route.name === "transactions"
              ? "receipt"
              : route.name === "budget"
              ? "wallet"
              : route.name === "goals"
              ? "flag"
              : "add";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Ionicons
                name={iconName as any}
                size={22}
                color={isFocused ? t.colors.primary : t.colors.muted}
              />
              <Text style={[
                styles.tabLabel,
                { fontFamily: t.fonts.mono, color: isFocused ? t.colors.primary : t.colors.muted }
              ]}>
                {route.name === "index" ? "dashboard" : route.name === "transactions" ? "transactions" : route.name === "budget" ? "budget" : route.name === "goals" ? "goals" : "add"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
  },

  container: {
    flexDirection: "row",
    height: 65,
    borderRadius: 30,
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    elevation: 10,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tabLabel: {
    fontSize: 9,
    marginTop: 2,
  },

  floatingButton: {
    position: "absolute",
    top: -25,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 15,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },
});
