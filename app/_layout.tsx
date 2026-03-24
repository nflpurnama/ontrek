import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";

import {
  Dependencies,
  DependencyProvider,
} from "@/src/application/providers/dependency-provider";
import { createDependencies } from "@/src/infrastructure/container/dependency-container";

import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import { SQLITE_DB_NAME } from "@/src/config/database";
import * as schema from "@/src/infrastructure/database/sqlite/schema"

import { SafeAreaView } from "react-native-safe-area-context";

import { useFonts } from "@expo-google-fonts/jetbrains-mono";

type DatabaseState = {
  db: SQLiteDatabase;
  drizzleDb: ReturnType<typeof drizzle>;
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrains Mono": require("../assets/fonts/JetBrainsMono-Regular.ttf"),
  });
  const [deps, setDeps] = useState<Dependencies | null>(null);
  const [dbState, setDbState] = useState<DatabaseState | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initDb() {
      try {
        const db = openDatabaseSync(SQLITE_DB_NAME);
        const drizzleDb = drizzle(db, { schema });

        if (mounted) {
          setDbState({ db, drizzleDb });
        }
      } catch (err) {
        if (mounted) {
          setDbError(err instanceof Error ? err.message : "Failed to open database");
        }
      }
    }

    initDb();

    return () => {
      mounted = false;
    };
  }, []);

  const drizzleDb = dbState?.drizzleDb ?? drizzle(openDatabaseSync(SQLITE_DB_NAME), { schema });
  const { success, error } = useMigrations(drizzleDb, migrations);

  useEffect(() => {
    if (error) {
      setDbError(error.message);
    }
  }, [error]);

  useEffect(() => {
    if (!dbState || !success || deps) return;

    const currentDbState = dbState;

    async function bootstrap() {
      try {
        const created = await createDependencies(currentDbState.db, currentDbState.drizzleDb);
        setDeps(created);
      } catch (err) {
        setDbError(err instanceof Error ? err.message : "Failed to initialize dependencies");
      }
    }

    bootstrap();
  }, [dbState, success, deps]);

  if (dbError) {
    return (
      <SafeAreaView style={{ margin: 10 }}>
        <Text style={{ color: "red" }}>Error: {dbError}</Text>
      </SafeAreaView>
    );
  }

  if (!fontsLoaded || !dbState || !success || !deps) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Running Migrations...</Text>
        <ActivityIndicator style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <DependencyProvider dependencies={deps}>
      <Slot />
    </DependencyProvider>
  );
}
