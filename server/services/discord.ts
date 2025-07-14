import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from 'discord.js';
import { storage } from '../storage';
import type { Streamer } from '@shared/schema';

class DiscordService {
  private client: Client | null = null;
  private isReady = false;

  async initialize() {
    const config = await storage.getConfiguration();
    if (!config?.discordToken) {
      throw new Error('Discord token not configured');
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.once('ready', () => {
      this.isReady = true;
      storage.createActivityLog({
        type: 'success',
        message: 'Discord bot connected successfully',
        details: `Connected as ${this.client?.user?.tag}`,
      });
    });

    this.client.on('error', (error) => {
      storage.createActivityLog({
        type: 'error',
        message: 'Discord bot error',
        details: error.message,
      });
    });

    await this.client.login(config.discordToken);
  }

  async sendNotification(streamer: Streamer): Promise<string | null> {
    if (!this.client || !this.isReady) {
      throw new Error('Discord client not ready');
    }

    const config = await storage.getConfiguration();
    if (!config?.discordChannelId) {
      throw new Error('Discord channel not configured');
    }

    const channel = await this.client.channels.fetch(config.discordChannelId) as TextChannel;
    if (!channel) {
      throw new Error('Channel not found');
    }

    const message = config.defaultMessage.replace('{streamer}', streamer.displayName);
    
    const embed = new EmbedBuilder()
      .setTitle(`${streamer.displayName} is now live!`)
      .setDescription(streamer.streamTitle || 'No title')
      .setColor(streamer.platform === 'twitch' ? '#9146FF' : '#FF0000')
      .addFields(
        { name: 'Platform', value: streamer.platform.charAt(0).toUpperCase() + streamer.platform.slice(1), inline: true },
        { name: 'Game', value: streamer.gameName || 'Unknown', inline: true },
        { name: 'Viewers', value: streamer.viewerCount?.toString() || '0', inline: true },
      )
      .setThumbnail(streamer.thumbnailUrl || null)
      .setTimestamp()
      .setFooter({ text: 'StreamBot Notification' });

    if (streamer.platform === 'twitch') {
      embed.setURL(`https://twitch.tv/${streamer.username}`);
    } else if (streamer.platform === 'youtube') {
      embed.setURL(`https://youtube.com/${streamer.username}`);
    }

    try {
      const sentMessage = await channel.send({ content: message, embeds: [embed] });
      
      // Store the message ID for later deletion
      await storage.createDiscordMessage({
        streamerId: streamer.id,
        messageId: sentMessage.id,
        channelId: config.discordChannelId,
      });

      await storage.createActivityLog({
        type: 'success',
        message: `Notification sent for ${streamer.displayName} going live`,
        details: `Platform: ${streamer.platform}`,
      });

      return sentMessage.id;
    } catch (error) {
      await storage.createActivityLog({
        type: 'error',
        message: `Failed to send notification for ${streamer.displayName}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async deleteNotification(messageId: string, channelId: string): Promise<void> {
    if (!this.client || !this.isReady) {
      throw new Error('Discord client not ready');
    }

    try {
      const channel = await this.client.channels.fetch(channelId) as TextChannel;
      if (channel) {
        const message = await channel.messages.fetch(messageId);
        if (message) {
          await message.delete();
        }
      }
    } catch (error) {
      await storage.createActivityLog({
        type: 'warning',
        message: 'Failed to delete notification message',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteNotificationsForStreamer(streamerId: number): Promise<void> {
    const messages = await storage.getDiscordMessagesByStreamer(streamerId);
    
    for (const message of messages) {
      await this.deleteNotification(message.messageId, message.channelId);
      await storage.deleteDiscordMessage(message.id);
    }
  }

  isConnected(): boolean {
    return this.isReady;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
    }
  }
}

export const discordService = new DiscordService();
