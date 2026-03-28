# Salus — Run Guide

Salus is an AI care companion that runs agents on a Daytona sandbox and exposes a voice + text chat UI.

## Prerequisites

- Node.js 18+
- A [Daytona](https://daytona.io) account and API key

## Setup

1. Copy the example env file and fill in your key:

```bash
cp .env.example .env
```

Edit `.env`:

```
DAYTONA_API_KEY=your_key_here
```

2. Install dependencies:

```bash
npm install
```

## Run

```bash
npm start
```

This will:
1. Create a Daytona sandbox
2. Upload memory files, agents, and skills into it
3. Install and start OpenCode with the Salus agent config
4. Start the voice/text proxy server on port 8080

When ready you'll see:

```
✨ Salus is running!
🌐 OpenCode UI: https://3000-<id>.daytonaproxy01.net
📄 Form Preview: https://8080-<id>.daytonaproxy01.net
```

## Use It

Open the **Form Preview** URL (`8080-...`) in your browser.

- You'll be asked to log in with your Daytona account (one-time)
- After login you land on the Salus chat UI
- Click **🎤 Talk to Salus** and speak, or type in the text box
- Wait ~30–60 seconds on first load for OpenCode to initialise the session

### Example questions

- *"Hello"*
- *"What are my medicines?"*
- *"When is my next GP appointment?"*
- *"What benefits am I entitled to?"*

## Stop

Press `Ctrl+C` — the sandbox is automatically deleted.

## Project Structure

```
src/index.ts        # Main entry: creates sandbox, starts OpenCode + UI server
agents/             # Agent prompt definitions (salus, health-manager, etc.)
memories/           # User memory files (health, family, calendar, benefits, etc.)
skills/
  server.py         # Python proxy server — serves UI and calls OpenCode API
  index.html        # Voice + text chat UI
  form-filler.py    # Playwright automation skill
public/
  index.html        # Development copy of the UI (not deployed)
```
