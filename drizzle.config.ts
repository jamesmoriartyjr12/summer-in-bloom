import { defineConfig } from "drizzle-kit";

function databaseUrl(): string {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  return url;
}

export default defineConfig({
  schema: "./lib/operate/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl(),
  },
});
