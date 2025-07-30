import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './migrations/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create the connection
const connectionString = process.env.DATABASE_URL;

// Create postgres client
const client = postgres(connectionString, {
  prepare: false,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export all schema for convenience
export * from './migrations/schema';
