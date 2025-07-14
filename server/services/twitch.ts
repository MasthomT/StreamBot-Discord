import axios from 'axios';
import { storage } from '../storage';
import type { Streamer } from '@shared/schema';

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
}

class TwitchService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  async authenticate(): Promise<void> {
    const config = await storage.getConfiguration();
    if (!config?.twitchClientId || !config?.twitchClientSecret) {
      throw new Error('Twitch API credentials not configured');
    }

    try {
      const response = await axios.post<TwitchTokenResponse>(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: config.twitchClientId,
            client_secret: config.twitchClientSecret,
            grant_type: 'client_credentials',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
      
      await storage.createActivityLog({
        type: 'success',
        message: 'Twitch API authentication successful',
      });
    } catch (error) {
      await storage.createActivityLog({
        type: 'error',
        message: 'Twitch API authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.authenticate();
    }
  }

  async getUser(username: string): Promise<TwitchUser | null> {
    await this.ensureAuthenticated();
    
    const config = await storage.getConfiguration();
    if (!config?.twitchClientId) {
      throw new Error('Twitch client ID not configured');
    }

    try {
      const response = await axios.get<{ data: TwitchUser[] }>(
        'https://api.twitch.tv/helix/users',
        {
          params: { login: username },
          headers: {
            'Client-ID': config.twitchClientId,
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data.data[0] || null;
    } catch (error) {
      await storage.createActivityLog({
        type: 'error',
        message: `Failed to fetch Twitch user: ${username}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async getStreamStatus(username: string): Promise<TwitchStream | null> {
    await this.ensureAuthenticated();
    
    const config = await storage.getConfiguration();
    if (!config?.twitchClientId) {
      throw new Error('Twitch client ID not configured');
    }

    try {
      const response = await axios.get<{ data: TwitchStream[] }>(
        'https://api.twitch.tv/helix/streams',
        {
          params: { user_login: username },
          headers: {
            'Client-ID': config.twitchClientId,
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      return response.data.data[0] || null;
    } catch (error) {
      await storage.createActivityLog({
        type: 'error',
        message: `Failed to check Twitch stream status: ${username}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async updateStreamerStatus(streamer: Streamer): Promise<Streamer | null> {
    const streamData = await this.getStreamStatus(streamer.username);
    
    const updates: Partial<Streamer> = {
      isLive: !!streamData,
      viewerCount: streamData?.viewer_count || 0,
      gameName: streamData?.game_name || null,
      streamTitle: streamData?.title || null,
      thumbnailUrl: streamData?.thumbnail_url?.replace('{width}', '320').replace('{height}', '180') || null,
    };

    if (streamData) {
      updates.lastLiveAt = new Date();
    }

    return await storage.updateStreamer(streamer.id, updates);
  }
}

export const twitchService = new TwitchService();
