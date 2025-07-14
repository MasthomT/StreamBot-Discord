# discord-streambot

A Discord bot that sends live stream notifications and automatically deletes them when streams end

## Features

- Monitor Twitch and YouTube streamers
- Send rich Discord notifications when streamers go live
- Automatically delete notifications when streams end
- Web dashboard for easy configuration
- Activity logging and monitoring
- Support for custom notification messages

## Requirements

- Node.js 18 or higher
- Discord bot token
- Twitch API credentials (optional)
- YouTube API key (optional)

## Setup Instructions

1. 1. Extract all files to your project directory
2. 2. Run 'npm install' to install dependencies
3. 3. Configure your API keys in the Configuration page
4. 4. Set up your Discord bot token, channel ID, and server ID
5. 5. Add your Twitch Client ID/Secret and YouTube API key
6. 6. Add streamers you want to monitor
7. 7. The bot will automatically start monitoring when configured

## Project Structure

```
├── server/              # Backend Express server
│   ├── services/        # Discord, Twitch, YouTube integrations
│   ├── index.ts         # Main server entry point
│   ├── routes.ts        # API endpoints
│   └── storage.ts       # In-memory data storage
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── lib/         # Utilities
│   │   └── hooks/       # Custom hooks
│   └── index.html       # HTML entry point
├── shared/              # Shared types and schemas
└── configuration files  # TypeScript, Vite, Tailwind, etc.
```

## Usage

1. Start the development server: `npm run dev`
2. Open your browser to the localhost URL shown
3. Configure your API keys in the Configuration page
4. Add streamers you want to monitor
5. The bot will automatically start monitoring when properly configured

## API Keys Required

- **Discord Bot Token**: Create a bot at https://discord.com/developers/applications
- **Twitch Client ID/Secret**: Get from https://dev.twitch.tv/console/apps
- **YouTube API Key**: Get from https://console.cloud.google.com/

## Support

This bot monitors streamers and sends notifications to Discord when they go live. It automatically deletes notifications when streams end.
