import fs from 'fs';
import path from 'path';

// List of all important files for the Discord bot
const filesToInclude = [
  // Configuration files
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json',
  'drizzle.config.ts',
  'replit.md',
  
  // Server files
  'server/index.ts',
  'server/routes.ts',
  'server/storage.ts',
  'server/vite.ts',
  'server/services/discord.ts',
  'server/services/monitoring.ts',
  'server/services/twitch.ts',
  'server/services/youtube.ts',
  
  // Shared files
  'shared/schema.ts',
  
  // Client files
  'client/index.html',
  'client/src/main.tsx',
  'client/src/App.tsx',
  'client/src/index.css',
  
  // Client components
  'client/src/components/sidebar.tsx',
  'client/src/components/add-streamer-modal.tsx',
  
  // Client pages
  'client/src/pages/dashboard.tsx',
  'client/src/pages/streamers.tsx',
  'client/src/pages/configuration.tsx',
  'client/src/pages/notifications.tsx',
  'client/src/pages/logs.tsx',
  'client/src/pages/not-found.tsx',
  
  // Client utilities
  'client/src/lib/queryClient.ts',
  'client/src/lib/utils.ts',
  'client/src/hooks/use-mobile.tsx',
  'client/src/hooks/use-toast.ts',
  
  // UI Components (most important ones)
  'client/src/components/ui/button.tsx',
  'client/src/components/ui/card.tsx',
  'client/src/components/ui/input.tsx',
  'client/src/components/ui/label.tsx',
  'client/src/components/ui/badge.tsx',
  'client/src/components/ui/dialog.tsx',
  'client/src/components/ui/form.tsx',
  'client/src/components/ui/select.tsx',
  'client/src/components/ui/textarea.tsx',
  'client/src/components/ui/toast.tsx',
  'client/src/components/ui/toaster.tsx',
  'client/src/components/ui/tooltip.tsx',
  'client/src/components/ui/separator.tsx',
  'client/src/components/ui/skeleton.tsx',
  'client/src/components/ui/table.tsx',
  'client/src/components/ui/tabs.tsx',
  'client/src/components/ui/alert.tsx',
  'client/src/components/ui/progress.tsx',
  'client/src/components/ui/switch.tsx',
  'client/src/components/ui/checkbox.tsx',
  'client/src/components/ui/radio-group.tsx',
  'client/src/components/ui/slider.tsx',
  'client/src/components/ui/popover.tsx',
  'client/src/components/ui/dropdown-menu.tsx',
  'client/src/components/ui/menubar.tsx',
  'client/src/components/ui/navigation-menu.tsx',
  'client/src/components/ui/command.tsx',
  'client/src/components/ui/calendar.tsx',
  'client/src/components/ui/avatar.tsx',
  'client/src/components/ui/aspect-ratio.tsx',
  'client/src/components/ui/accordion.tsx',
  'client/src/components/ui/alert-dialog.tsx',
  'client/src/components/ui/breadcrumb.tsx',
  'client/src/components/ui/carousel.tsx',
  'client/src/components/ui/chart.tsx',
  'client/src/components/ui/collapsible.tsx',
  'client/src/components/ui/context-menu.tsx',
  'client/src/components/ui/drawer.tsx',
  'client/src/components/ui/hover-card.tsx',
  'client/src/components/ui/input-otp.tsx',
  'client/src/components/ui/pagination.tsx',
  'client/src/components/ui/resizable.tsx',
  'client/src/components/ui/scroll-area.tsx',
  'client/src/components/ui/sheet.tsx',
  'client/src/components/ui/sidebar.tsx',
  'client/src/components/ui/toggle.tsx',
  'client/src/components/ui/toggle-group.tsx'
];

// Read all files and create a JSON structure
const packageData = {
  name: "discord-streambot",
  version: "1.0.0",
  description: "A Discord bot that sends live stream notifications and automatically deletes them when streams end",
  files: {},
  instructions: {
    setup: [
      "1. Extract all files to your project directory",
      "2. Run 'npm install' to install dependencies",
      "3. Configure your API keys in the Configuration page",
      "4. Set up your Discord bot token, channel ID, and server ID",
      "5. Add your Twitch Client ID/Secret and YouTube API key",
      "6. Add streamers you want to monitor",
      "7. The bot will automatically start monitoring when configured"
    ],
    requirements: [
      "Node.js 18 or higher",
      "Discord bot token",
      "Twitch API credentials (optional)",
      "YouTube API key (optional)"
    ],
    features: [
      "Monitor Twitch and YouTube streamers",
      "Send rich Discord notifications when streamers go live",
      "Automatically delete notifications when streams end",
      "Web dashboard for easy configuration",
      "Activity logging and monitoring",
      "Support for custom notification messages"
    ]
  }
};

// Read each file and add to package
filesToInclude.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      packageData.files[filePath] = content;
      console.log(`✓ Added ${filePath}`);
    } else {
      console.log(`⚠ File not found: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
  }
});

// Write the package file
const outputPath = 'streambot-package.json';
fs.writeFileSync(outputPath, JSON.stringify(packageData, null, 2));

console.log(`\n🎉 Package created successfully!`);
console.log(`📦 File: ${outputPath}`);
console.log(`📁 Total files included: ${Object.keys(packageData.files).length}`);
console.log(`\nTo use this package:`);
console.log(`1. Download the ${outputPath} file`);
console.log(`2. Create a new directory for your bot`);
console.log(`3. Run: node extract-package.js`);
console.log(`4. Follow the setup instructions in the package`);