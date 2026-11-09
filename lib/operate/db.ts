import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  operateSql?: ReturnType<typeof postgres>;
};

export function getDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  if (!globalForDb.operateSql) {
    // prepare: false is required by Supabase's transaction pooler.
    // The staff layout and page query at the same time; one connection stalls them both.
    globalForDb.operateSql = postgres(url, { prepare: false, max: 4 });
  }
  return drizzle(globalForDb.operateSql, { schema });
}
