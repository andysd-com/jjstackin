import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  platform: text("platform").notNull(), // 'instacart', 'doordash', 'uber', 'fieldagent', 'gigspot', etc.
  source: text("source").default('manual'), // 'manual', 'share_target', 'clipboard', 'import'
  payout: decimal("payout", { precision: 10, scale: 2 }).notNull(),
  reimbursement: decimal("reimbursement", { precision: 10, scale: 2 }).default('0'),
  tipEstimate: decimal("tip_estimate", { precision: 10, scale: 2 }).default('0'),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  timeWindowStart: timestamp("time_window_start"),
  timeWindowEnd: timestamp("time_window_end"),
  estimatedDuration: integer("estimated_duration"), // minutes
  status: text("status").default('available'), // 'available', 'selected', 'in_progress', 'completed', 'expired'
  priority: integer("priority").default(0),
  tags: text("tags").array().default([]),
  metadata: jsonb("metadata").default({}), // platform-specific data
  roi: decimal("roi", { precision: 5, scale: 2 }), // calculated ROI percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name"),
  jobIds: text("job_ids").array().notNull(),
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }), // kilometers
  totalDuration: integer("total_duration"), // minutes
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }),
  optimized: boolean("optimized").default(false),
  status: text("status").default('draft'), // 'draft', 'active', 'completed'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const earnings = pgTable("earnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jobId: varchar("job_id").references(() => jobs.id),
  platform: text("platform").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reimbursement: decimal("reimbursement", { precision: 10, scale: 2 }).default('0'),
  tips: decimal("tips", { precision: 10, scale: 2 }).default('0'),
  mileage: decimal("mileage", { precision: 8, scale: 2 }),
  date: timestamp("date").defaultNow(),
  notes: text("notes"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  preferences: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertEarningsSchema = createInsertSchema(earnings).omit({
  id: true,
  userId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Earnings = typeof earnings.$inferSelect;
export type InsertEarnings = z.infer<typeof insertEarningsSchema>;
