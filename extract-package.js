import fs from 'fs';
import path from 'path';

// Check if package file exists
const packagePath = 'streambot-package.json';
if (!fs.existsSync(packagePath)) {
  console.log('❌ Package file not found!');
  console.log('Make sure you have the streambot-package.json file in the current directory.');
  process.exit(1);
}

// Read the package
console.log('📦 Reading package file...');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Create directory structure and extract files
console.log('📁 Creating directory structure...');
Object.keys(packageData.files).forEach(filePath => {
  const dir = path.dirname(filePath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
  
  // Write file
  fs.writeFileSync(filePath, packageData.files[filePath]);
  console.log(`✓ Extracted: ${filePath}`);
});

// Create README with setup instructions
const readme = `# ${packageData.name}

${packageData.description}

## Features

${packageData.instructions.features.map(f => `- ${f}`).join('\n')}

## Requirements

${packageData.instructions.requirements.map(r => `- ${r}`).join('\n')}

## Setup Instructions

${packageData.instructions.setup.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## Project Structure

\`\`\`
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
\`\`\`

## Usage

1. Start the development server: \`npm run dev\`
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
`;

fs.writeFileSync('README.md', readme);

console.log('\n🎉 Extraction complete!');
console.log(`📋 Total files extracted: ${Object.keys(packageData.files).length}`);
console.log('📄 README.md created with setup instructions');
console.log('\nNext steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('3. Open browser to configure your bot');