import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './migrations/schema';
import * as relations from './migrations/relations';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString, {
  prepare: false,
});

export const db = drizzle(client, { schema, ...relations });
