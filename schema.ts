import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const proxyConnections = pgTable("proxy_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  status: text("status").notNull(), // 'connected', 'failed', 'disconnected'
  protocol: text("protocol").notNull(), // 'http', 'https'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userAgent: text("user_agent"),
  responseTime: integer("response_time"), // in milliseconds
});

export const proxySettings = pgTable("proxy_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sslVerification: boolean("ssl_verification").default(true).notNull(),
  autoConnect: boolean("auto_connect").default(false).notNull(),
  blockAds: boolean("block_ads").default(true).notNull(),
  enableLogging: boolean("enable_logging").default(true).notNull(),
  connectionTimeout: integer("connection_timeout").default(10).notNull(),
  maxConnections: integer("max_connections").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProxyConnectionSchema = createInsertSchema(proxyConnections).pick({
  url: true,
  status: true,
  protocol: true,
  userAgent: true,
  responseTime: true,
});

export const insertProxySettingsSchema = createInsertSchema(proxySettings).pick({
  sslVerification: true,
  autoConnect: true,
  blockAds: true,
  enableLogging: true,
  connectionTimeout: true,
  maxConnections: true,
});

export type ProxyConnection = typeof proxyConnections.$inferSelect;
export type InsertProxyConnection = z.infer<typeof insertProxyConnectionSchema>;
export type ProxySettings = typeof proxySettings.$inferSelect;
export type InsertProxySettings = z.infer<typeof insertProxySettingsSchema>;
