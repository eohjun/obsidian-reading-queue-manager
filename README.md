# Reading Queue Manager

An Obsidian PKM plugin for collecting, prioritizing, tracking reading materials, and generating notes with AI-powered analysis.

## Features

### Core Features
- ✅ Add/edit/delete reading items
- ✅ Status management (Pending → Reading → Complete/Abandoned)
- ✅ Priority settings (High/Medium/Low)
- ✅ Tag system
- ✅ Estimated reading time
- ✅ Sidebar view for queue management
- ✅ Status/priority filtering

### AI-Powered Features
- **AI Summary**: Automatically summarize content from URLs
- **AI Tagging**: Auto-generate relevant tags
- **Key Extraction**: Extract key insights from articles
- **Topic Recommendations**: Suggest permanent note topics
- **Insight Note Generation**: Create comprehensive insight notes

## Supported AI Providers

| Provider | Model | Notes |
|----------|-------|-------|
| **OpenAI** | GPT-4o, GPT-4o-mini | Recommended for summarization |
| **Google Gemini** | Gemini 1.5 Pro/Flash | Free tier available |
| **Anthropic** | Claude 3.5 Sonnet | High quality analysis |

## Installation

### BRAT (Recommended)
1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Add `eohjun/obsidian-reading-queue-manager`

### Manual Installation
1. Download latest version from [Releases](https://github.com/eohjun/obsidian-reading-queue-manager/releases)
2. Copy `main.js`, `manifest.json`, `styles.css` to `.obsidian/plugins/reading-queue-manager/`
3. Restart Obsidian and enable the plugin

## Setup

### API Key Configuration (for AI features)
1. Open Settings → Reading Queue Manager
2. Select AI Provider
3. Enter API key
4. Test connection

## Usage

1. Click ribbon icon (📖) or use Command Palette "Open Reading Queue"
2. Click + button to add reading material
3. Click item to open URL, right-click to edit/delete
4. Use status buttons to track progress
5. After completing an item, use AI features to generate notes

## Commands

| Command | Description |
|---------|-------------|
| **Open Reading Queue** | Open the reading queue sidebar |
| **Add reading item** | Add new item to queue |
| **Summarize current item** | AI summarize the selected item |
| **Generate insight note** | Create comprehensive insight note |
| **Suggest note topics** | Get permanent note topic suggestions |

## Workflow

```
1. Add URL or article to queue
2. Set priority and estimated time
3. Read the material
4. Mark as complete
5. Use AI to summarize and extract insights
6. Generate permanent note topics
7. Create insight notes for your PKM
```

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| AI Provider | Provider for AI features | OpenAI |
| API Key | API key for selected provider | - |
| Default Priority | Default priority for new items | Medium |
| Auto-fetch metadata | Auto-extract URL metadata | true |
| Output Folder | Folder for generated notes | `04_Zettelkasten` |

## Development

```bash
# Install dependencies
npm install

# Development mode (watch)
npm run dev

# Production build
npm run build

# Type check
npm run typecheck
```

## Architecture

Follows Clean Architecture pattern:

```
src/
├── core/
│   ├── domain/         # Business logic (entities, value objects)
│   ├── application/    # Use Cases
│   └── adapters/       # Obsidian adapters
└── views/              # UI components
```

## License

MIT
