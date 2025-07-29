import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./migrations/schema";
import * as relations from "./migrations/relations";

// Merge schema and relations for proper typing
const fullSchema = { ...schema, ...relations };

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
  db?: ReturnType<typeof drizzle<typeof fullSchema>>;
};

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in the environment variables");
  process.exit(1);
}

const client =
  globalForDb.client ??
  postgres(process.env.DATABASE_URL, {
    prepare: false,
    max: 1, // optional: limit connections per client
  });

const db =
  globalForDb.db ??
  drizzle(client, {
    schema: fullSchema,
    logger: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
  globalForDb.db = db;
}

export default db;
