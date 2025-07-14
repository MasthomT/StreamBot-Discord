import cron from 'node-cron';
import { storage } from '../storage';
import { discordService } from './discord';
import { twitchService } from './twitch';
import { youtubeService } from './youtube';

class MonitoringService {
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    const config = await storage.getConfiguration();
    const intervalSeconds = config?.checkInterval || 60;
    
    // Convert seconds to cron expression (every N seconds)
    const cronExpression = `*/${intervalSeconds} * * * * *`;
    
    this.cronJob = cron.schedule(cronExpression, async () => {
      await this.checkStreamers();
    });

    this.isRunning = true;
    
    await storage.createActivityLog({
      type: 'info',
      message: 'Stream monitoring started',
      details: `Checking every ${intervalSeconds} seconds`,
    });
  }

  async stop(): Promise<void> {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    
    this.isRunning = false;
    
    await storage.createActivityLog({
      type: 'info',
      message: 'Stream monitoring stopped',
    });
  }

  async checkStreamers(): Promise<void> {
    const streamers = await storage.getStreamers();
    
    for (const streamer of streamers) {
      try {
        const wasLive = streamer.isLive;
        let updatedStreamer = null;

        if (streamer.platform === 'twitch') {
          updatedStreamer = await twitchService.updateStreamerStatus(streamer);
        } else if (streamer.platform === 'youtube') {
          updatedStreamer = await youtubeService.updateStreamerStatus(streamer);
        }

        if (!updatedStreamer) {
          continue;
        }

        const isNowLive = updatedStreamer.isLive;

        // If streamer just went live, send notification
        if (!wasLive && isNowLive) {
          try {
            await discordService.sendNotification(updatedStreamer);
          } catch (error) {
            await storage.createActivityLog({
              type: 'error',
              message: `Failed to send notification for ${updatedStreamer.displayName}`,
              details: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // If streamer just went offline, delete notifications
        if (wasLive && !isNowLive) {
          try {
            await discordService.deleteNotificationsForStreamer(updatedStreamer.id);
            await storage.createActivityLog({
              type: 'info',
              message: `${updatedStreamer.displayName} went offline, notifications deleted`,
            });
          } catch (error) {
            await storage.createActivityLog({
              type: 'warning',
              message: `Failed to delete notifications for ${updatedStreamer.displayName}`,
              details: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      } catch (error) {
        await storage.createActivityLog({
          type: 'error',
          message: `Error checking streamer ${streamer.displayName}`,
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  isMonitoring(): boolean {
    return this.isRunning;
  }

  async updateInterval(seconds: number): Promise<void> {
    if (this.isRunning) {
      await this.stop();
      await this.start();
    }
  }
}

export const monitoringService = new MonitoringService();
