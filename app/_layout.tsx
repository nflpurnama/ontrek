import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

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

export default function RootLayout() {
  const [deps, setDeps] = useState<Dependencies | null>(null);

  const db = openDatabaseSync(SQLITE_DB_NAME);
  const drizzleDb = drizzle(db, { schema });
  const { success } = useMigrations(drizzleDb, migrations);

  useEffect(() => {
    if (!success || deps) return;

    async function bootstrap() {
      try {
        console.log("delete run.");
        deleteDatabaseSync(SQLITE_DB_NAME);
      } catch {
        console.log("delete failed.");
      }

      const created = await createDependencies(db, drizzleDb);
      setDeps(created);
    }

    bootstrap();
  }, [success, db, deps, drizzleDb]);

  if (!success || !deps) {
    return <ActivityIndicator />;
  }

  return (
    <DependencyProvider dependencies={deps}>
      <Slot />
    </DependencyProvider>
  );
}
