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

export default function RootLayout() {
  const [deps, setDeps] = useState<Dependencies | null>(null);
  try{
    console.log("delete run.");
    deleteDatabaseSync(SQLITE_DB_NAME);
  }catch{
    console.log("delete failed.");
  }
  const db = openDatabaseSync(SQLITE_DB_NAME);
  const drizzleDb = drizzle(db);
  const { success, error } = useMigrations(drizzleDb, migrations);
  if (error)
    throw new Error("Migration failed. Please contact developer", {
      cause: error,
    });

  useEffect(() => {
    const init = async () => {
      const created = await createDependencies(db, drizzleDb);
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
