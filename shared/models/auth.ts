import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const mintTransactions = pgTable("mint_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  destination: varchar("destination").notNull(),
  walletAddress: varchar("wallet_address").notNull(),
  amount: varchar("amount").notNull(),
  initiatedBy: varchar("initiated_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type MintTransaction = typeof mintTransactions.$inferSelect;
export type InsertMintTransaction = typeof mintTransactions.$inferInsert;

export const aiEvents = pgTable("ai_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type", { length: 64 }).notNull(),
  description: text("description").notNull(),
  data: text("data").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AiEvent = typeof aiEvents.$inferSelect;
export type InsertAiEvent = typeof aiEvents.$inferInsert;
