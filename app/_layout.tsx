import { SQLiteProvider } from "expo-sqlite";
import { SQLITE_DB_NAME } from "@/src/config/database";
import { initializeDatabase } from "@/src/infrastructure/database/sqlite/init";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName={SQLITE_DB_NAME}
      onInit={initializeDatabase}
    >
      <Slot />
    </SQLiteProvider>
  );
}
