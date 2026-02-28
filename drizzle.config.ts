import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/infrastructure/database/sqlite/schema/index.ts',
	out: './drizzle',
  dialect: 'sqlite',
	driver: 'expo', // <--- very important
});