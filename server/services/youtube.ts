import axios from 'axios';
import { storage } from '../storage';
import type { Streamer } from '@shared/schema';

interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: {
      medium: { url: string };
      high: { url: string };
    };
  };
  liveStreamingDetails?: {
    actualStartTime: string;
    concurrentViewers: string;
  };
}

class YouTubeService {
  async getChannelByUsername(username: string): Promise<YouTubeChannel | null> {
    const config = await storage.getConfiguration();
    if (!config?.youtubeApiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      // First try to get channel by username
      let response = await axios.get<{ items: YouTubeChannel[] }>(
        'https://www.googleapis.com/youtube/v3/channels',
        {
          params: {
            key: config.youtubeApiKey,
            forUsername: username,
            part: 'snippet',
          },
        }
      );

      if (response.data.items.length === 0) {
        // If not found by username, try by channel ID
        response = await axios.get<{ items: YouTubeChannel[] }>(
          'https://www.googleapis.com/youtube/v3/channels',
          {
            params: {
              key: config.youtubeApiKey,
              id: username,
              part: 'snippet',
            },
          }
        );
      }

      return response.data.items[0] || null;
    } catch (error) {
      await storage.createActivityLog({
        type: 'error',
        message: `Failed to fetch YouTube channel: ${username}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async getLiveStream(channelId: string): Promise<YouTubeVideo | null> {
    const config = await storage.getConfiguration();
    if (!config?.youtubeApiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      // Search for live streams from the channel
      const response = await axios.get<{ items: YouTubeVideo[] }>(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            key: config.youtubeApiKey,
            channelId: channelId,
            part: 'snippet',
            type: 'video',
            eventType: 'live',
            maxResults: 1,
          },
        }
      );

      if (response.data.items.length === 0) {
        return null;
      }

      const liveVideo = response.data.items[0];

      // Get additional details about the live stream
      const videoResponse = await axios.get<{ items: YouTubeVideo[] }>(
        'https://www.googleapis.com/youtube/v3/videos',
        {
          params: {
            key: config.youtubeApiKey,
            id: liveVideo.id,
            part: 'snippet,liveStreamingDetails',
          },
        }
      );

      return videoResponse.data.items[0] || null;
    } catch (error) {
      await storage.createActivityLog({
        type: 'error',
        message: `Failed to check YouTube live stream: ${channelId}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async updateStreamerStatus(streamer: Streamer): Promise<Streamer | null> {
    const channel = await this.getChannelByUsername(streamer.username);
    if (!channel) {
      return null;
    }

    const liveStream = await this.getLiveStream(channel.id);
    
    const updates: Partial<Streamer> = {
      isLive: !!liveStream,
      viewerCount: liveStream?.liveStreamingDetails?.concurrentViewers 
        ? parseInt(liveStream.liveStreamingDetails.concurrentViewers) 
        : 0,
      gameName: null, // YouTube doesn't provide game category in the same way
      streamTitle: liveStream?.snippet?.title || null,
      thumbnailUrl: liveStream?.snippet?.thumbnails?.medium?.url || null,
    };

    if (liveStream) {
      updates.lastLiveAt = new Date();
    }

    return await storage.updateStreamer(streamer.id, updates);
  }
}

export const youtubeService = new YouTubeService();
