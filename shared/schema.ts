import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const streamers = pgTable("streamers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  platform: text("platform").notNull(), // 'twitch' or 'youtube'
  displayName: text("display_name").notNull(),
  customMessage: text("custom_message"),
  isLive: boolean("is_live").default(false),
  lastLiveAt: timestamp("last_live_at"),
  viewerCount: integer("viewer_count").default(0),
  gameName: text("game_name"),
  streamTitle: text("stream_title"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const discordMessages = pgTable("discord_messages", {
  id: serial("id").primaryKey(),
  streamerId: integer("streamer_id").references(() => streamers.id),
  messageId: text("message_id").notNull(),
  channelId: text("channel_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const configuration = pgTable("configuration", {
  id: serial("id").primaryKey(),
  discordToken: text("discord_token"),
  discordChannelId: text("discord_channel_id"),
  discordServerId: text("discord_server_id"),
  twitchClientId: text("twitch_client_id"),
  twitchClientSecret: text("twitch_client_secret"),
  youtubeApiKey: text("youtube_api_key"),
  checkInterval: integer("check_interval").default(60), // seconds
  defaultMessage: text("default_message").default("🔴 {streamer} is now live! 🔴"),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'success', 'warning', 'error', 'info'
  message: text("message").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStreamerSchema = createInsertSchema(streamers).omit({
  id: true,
  isLive: true,
  lastLiveAt: true,
  viewerCount: true,
  gameName: true,
  streamTitle: true,
  thumbnailUrl: true,
  createdAt: true,
});

export const insertConfigurationSchema = createInsertSchema(configuration).omit({
  id: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type Streamer = typeof streamers.$inferSelect;
export type InsertStreamer = z.infer<typeof insertStreamerSchema>;
export type DiscordMessage = typeof discordMessages.$inferSelect;
export type Configuration = typeof configuration.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
