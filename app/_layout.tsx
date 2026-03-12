import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";

import {
  Dependencies,
  DependencyProvider,
} from "@/src/application/providers/dependency-provider";
import { createDependencies } from "@/src/infrastructure/container/dependency-container";

import { drizzle } from "drizzle-orm/expo-sqlite";
import { deleteDatabaseSync, openDatabaseSync } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import { SQLITE_DB_NAME } from "@/src/config/database";
import * as schema from "@/src/infrastructure/database/sqlite/schema"

import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const [deps, setDeps] = useState<Dependencies | null>(null);

  const db = openDatabaseSync(SQLITE_DB_NAME);
  const drizzleDb = drizzle(db, { schema });
  const { success, error } = useMigrations(drizzleDb, migrations);

  useEffect(() => {
    if (error) throw new Error(`Failed to run migrations: ${error.message}`);
    if (!success || deps) return;

    async function bootstrap() {
      const created = await createDependencies(db, drizzleDb);
      setDeps(created);
    }

    bootstrap();
  }, [success, db, deps, drizzleDb]);

  if (!success && !error){
    return <SafeAreaView style={{margin: 10}}>
        <Text>Running Migrations...</Text>
      </SafeAreaView>
  }

  if (error){
    return <SafeAreaView style={{margin: 10}}>
        <Text>Running Migrations...</Text>
        <Text>Migrations failed...{error.message}</Text>
      </SafeAreaView>

  }

  if (!deps) {
    return <ActivityIndicator />;
  }

  return (
    <DependencyProvider dependencies={deps}>
      <Slot />
    </DependencyProvider>
  );
}
