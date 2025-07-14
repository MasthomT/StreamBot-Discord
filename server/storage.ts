import { 
  streamers, 
  discordMessages, 
  configuration, 
  activityLogs,
  type Streamer, 
  type InsertStreamer,
  type DiscordMessage,
  type Configuration,
  type InsertConfiguration,
  type ActivityLog,
  type InsertActivityLog
} from "@shared/schema";

export interface IStorage {
  // Streamers
  getStreamers(): Promise<Streamer[]>;
  getStreamer(id: number): Promise<Streamer | undefined>;
  getStreamerByUsername(username: string, platform: string): Promise<Streamer | undefined>;
  createStreamer(streamer: InsertStreamer): Promise<Streamer>;
  updateStreamer(id: number, updates: Partial<Streamer>): Promise<Streamer | undefined>;
  deleteStreamer(id: number): Promise<boolean>;
  
  // Discord Messages
  getDiscordMessages(): Promise<DiscordMessage[]>;
  getDiscordMessagesByStreamer(streamerId: number): Promise<DiscordMessage[]>;
  createDiscordMessage(message: { streamerId: number; messageId: string; channelId: string }): Promise<DiscordMessage>;
  deleteDiscordMessage(id: number): Promise<boolean>;
  deleteDiscordMessagesByStreamer(streamerId: number): Promise<boolean>;
  
  // Configuration
  getConfiguration(): Promise<Configuration | undefined>;
  updateConfiguration(config: Partial<InsertConfiguration>): Promise<Configuration>;
  
  // Activity Logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  clearActivityLogs(): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private streamers: Map<number, Streamer> = new Map();
  private discordMessages: Map<number, DiscordMessage> = new Map();
  private configuration: Configuration | undefined;
  private activityLogs: Map<number, ActivityLog> = new Map();
  
  private streamerIdCounter = 1;
  private messageIdCounter = 1;
  private configIdCounter = 1;
  private logIdCounter = 1;

  constructor() {
    // Initialize with default configuration
    this.configuration = {
      id: 1,
      discordToken: null,
      discordChannelId: null,
      discordServerId: null,
      twitchClientId: null,
      twitchClientSecret: null,
      youtubeApiKey: null,
      checkInterval: 60,
      defaultMessage: "🔴 {streamer} is now live! 🔴"
    };
  }

  // Streamers
  async getStreamers(): Promise<Streamer[]> {
    return Array.from(this.streamers.values());
  }

  async getStreamer(id: number): Promise<Streamer | undefined> {
    return this.streamers.get(id);
  }

  async getStreamerByUsername(username: string, platform: string): Promise<Streamer | undefined> {
    return Array.from(this.streamers.values()).find(
      s => s.username === username && s.platform === platform
    );
  }

  async createStreamer(insertStreamer: InsertStreamer): Promise<Streamer> {
    const id = this.streamerIdCounter++;
    const streamer: Streamer = {
      ...insertStreamer,
      id,
      customMessage: insertStreamer.customMessage || null,
      isLive: false,
      lastLiveAt: null,
      viewerCount: 0,
      gameName: null,
      streamTitle: null,
      thumbnailUrl: null,
      createdAt: new Date()
    };
    this.streamers.set(id, streamer);
    return streamer;
  }

  async updateStreamer(id: number, updates: Partial<Streamer>): Promise<Streamer | undefined> {
    const streamer = this.streamers.get(id);
    if (!streamer) return undefined;
    
    const updatedStreamer = { ...streamer, ...updates };
    this.streamers.set(id, updatedStreamer);
    return updatedStreamer;
  }

  async deleteStreamer(id: number): Promise<boolean> {
    return this.streamers.delete(id);
  }

  // Discord Messages
  async getDiscordMessages(): Promise<DiscordMessage[]> {
    return Array.from(this.discordMessages.values());
  }

  async getDiscordMessagesByStreamer(streamerId: number): Promise<DiscordMessage[]> {
    return Array.from(this.discordMessages.values()).filter(
      m => m.streamerId === streamerId
    );
  }

  async createDiscordMessage(message: { streamerId: number; messageId: string; channelId: string }): Promise<DiscordMessage> {
    const id = this.messageIdCounter++;
    const discordMessage: DiscordMessage = {
      id,
      ...message,
      createdAt: new Date()
    };
    this.discordMessages.set(id, discordMessage);
    return discordMessage;
  }

  async deleteDiscordMessage(id: number): Promise<boolean> {
    return this.discordMessages.delete(id);
  }

  async deleteDiscordMessagesByStreamer(streamerId: number): Promise<boolean> {
    const messages = Array.from(this.discordMessages.entries()).filter(
      ([_, message]) => message.streamerId === streamerId
    );
    
    messages.forEach(([id]) => this.discordMessages.delete(id));
    return true;
  }

  // Configuration
  async getConfiguration(): Promise<Configuration | undefined> {
    return this.configuration;
  }

  async updateConfiguration(config: Partial<InsertConfiguration>): Promise<Configuration> {
    if (!this.configuration) {
      this.configuration = {
        id: this.configIdCounter++,
        discordToken: null,
        discordChannelId: null,
        discordServerId: null,
        twitchClientId: null,
        twitchClientSecret: null,
        youtubeApiKey: null,
        checkInterval: 60,
        defaultMessage: "🔴 {streamer} is now live! 🔴",
        ...config
      };
    } else {
      this.configuration = { ...this.configuration, ...config };
    }
    return this.configuration;
  }

  // Activity Logs
  async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    return logs.slice(0, limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.logIdCounter++;
    const activityLog: ActivityLog = {
      id,
      ...log,
      details: log.details || null,
      createdAt: new Date()
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }

  async clearActivityLogs(): Promise<boolean> {
    this.activityLogs.clear();
    return true;
  }
}

export const storage = new MemStorage();
