import { Tabs } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="accounts" options={{ href: null, title: "Accounts"}} />
      <Tabs.Screen name="vendors" options={{ href: null, title: "Vendors"}} />
      <Tabs.Screen name="transactions" options={{ title: "Transactions" }} />
      <Tabs.Screen name="add" options={{ title: "Add" }} />
    </Tabs>
  );
}

function FloatingTabBar({ state, descriptors, navigation }: any) {
const insets = useSafeAreaInsets(); 
  
return (
    <View style={[styles.wrapper, {bottom: insets.bottom + 15}]}>
      <View style={styles.container}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
        //   const { options } = descriptors[route.key];

          const onPress = () => {
            navigation.navigate(route.name);
          };

          const iconName =
            route.name === "index"
              ? "home"
              : route.name === "transactions"
              ? "receipt"
              : route.name === "accounts"
              ? "wallet" 
              : route.name === "vendors"
              ? "business"
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
                color={isFocused ? "#2563EB" : "#9CA3AF"}
              />
              {/* <Text>{label}</Text> */}
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
    backgroundColor: "rgba(255,255,255,0.9)",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
  },

  floatingButton: {
    position: "absolute",
    top: -25,
    alignSelf: "center",
    backgroundColor: "#2563EB",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 15,
    shadowColor: "#2563EB",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },

});