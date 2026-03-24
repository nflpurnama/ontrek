import { useDependencies } from "@/src/application/providers/dependency-provider";
import { Vendor } from "@/src/domain/entities/vendor";
import { useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountPage() {
  const { findVendorsUseCase } = useDependencies();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    const results = await findVendorsUseCase.execute({});
    setLoading(false);
    setVendors(results);
  }, [findVendorsUseCase]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView>
      {vendors.map((vendor) => {
        return <Text key={vendor.id.getValue()}>{vendor.name}</Text>;
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});
