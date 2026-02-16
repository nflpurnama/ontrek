import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import { Dependencies, DependencyProvider } from "@/src/application/providers/dependency-provider";
import { createDependencies } from "@/src/infrastructure/container/dependency-container";

export default function RootLayout() {
  const [deps, setDeps] = useState<Dependencies | null>(null);

  useEffect(() => {
    const init = async () => {
      const created = await createDependencies();
      setDeps(created);
    };

    init();
  }, []);

  if (!deps) {
    return <ActivityIndicator />;
  }

  return (
      <DependencyProvider dependencies={deps}>
        <Slot />
      </DependencyProvider>
  );
}
