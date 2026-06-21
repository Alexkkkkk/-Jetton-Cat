import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sessions, users } from "../shared/models/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { sessions, users } });
