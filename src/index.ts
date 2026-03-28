import { Daytona, Sandbox } from '@daytonaio/sdk'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

const OPENCODE_PORT = 3000

function injectEnvVar(name: string, content: string): string {
  const base64 = Buffer.from(content).toString('base64')
  return `${name}=$(echo '${base64}' | base64 -d)`
}

async function uploadFolder(sandbox: Sandbox, localPath: string, remotePath: string) {
  const files = fs.readdirSync(localPath, { withFileTypes: true })
  for (const file of files) {
    const localFile = path.join(localPath, file.name)
    const remoteFile = `${remotePath}/${file.name}`
    if (file.isDirectory()) {
      await sandbox.process.executeCommand(`mkdir -p ${remoteFile}`)
      await uploadFolder(sandbox, localFile, remoteFile)
    } else {
      const content = fs.readFileSync(localFile)
      await sandbox.fs.uploadFile(content, remoteFile)
    }
  }
}

function readFileSafe(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), 'utf-8')
}

function buildPrompt(agentPath: string, memoryPaths: string[]): string {
  const agentPrompt = readFileSafe(agentPath)

  const memories = memoryPaths
    .map((p) => {
      const name = path.basename(p)
      const content = readFileSafe(p)
      return `\n--- ${name} ---\n${content}\n`
    })
    .join('\n')

  return `
${agentPrompt}

## MEMORY CONTEXT (SOURCE OF TRUTH)

You MUST use the following files as your ONLY source of truth.
Do NOT invent or assume anything outside this data.

${memories}

## STRICT RULES

- Always check memory before answering
- If something is not in memory → say you don’t know
- Never hallucinate missing details
- Be consistent with the memory files at all times
`.trim()
}

async function main() {
  if (!process.env.DAYTONA_API_KEY) {
    console.error('Error: DAYTONA_API_KEY environment variable is not set')
    process.exit(1)
  }

  const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY })

  let sandbox: Sandbox | undefined

  try {
    console.log('Creating sandbox...')
    sandbox = await daytona.create()

    process.once('SIGINT', async () => {
      try {
        console.log('\nCleaning up...')
        if (sandbox) await sandbox.delete()
      } catch (e) {
        console.error('Error deleting sandbox:', e)
      } finally {
        process.exit(0)
      }
    })

    // --- Upload files ---
    console.log('Uploading memories, agents, and skills...')
    await sandbox.process.executeCommand(`
      mkdir -p /home/daytona/memories /home/daytona/agents /home/daytona/skills
    `)

    await uploadFolder(sandbox, './memories', '/home/daytona/memories')
    await uploadFolder(sandbox, './agents', '/home/daytona/agents')
    await uploadFolder(sandbox, './skills', '/home/daytona/skills')

    // --- Install dependencies BEFORE starting OpenCode ---
    console.log('Installing system dependencies + Playwright...')

    await sandbox.process.executeCommand(`
      apt-get update &&
      apt-get install -y \
        python3-pip \
        curl \
        ca-certificates \
        libnss3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        libgbm1 \
        libasound2 \
        libpangocairo-1.0-0 \
        libpango-1.0-0 \
        libcairo2 \
        libatspi2.0-0 \
        libgtk-3-0 \
        fonts-liberation \
        libappindicator3-1 \
        xdg-utils &&
      python3 -m pip install --no-cache-dir playwright &&
      python3 -m playwright install chromium
    `)

    // --- Install OpenCode ---
    console.log('Installing OpenCode...')
    await sandbox.process.executeCommand(`npm i -g opencode-ai@1.1.1`)

    // --- Build agent config ---
    const memoryFiles = [
      './memories/about.md',
      './memories/family.md',
      './memories/health.md',
      './memories/benefits.md',
      './memories/calendar.md',
    ]

    const opencodeConfig = {
      $schema: 'https://opencode.ai/config.json',
      default_agent: 'salus',
      agent: {
        salus: {
          mode: 'primary',
          description: 'Primary care companion',
          prompt: buildPrompt('./agents/salus.md', memoryFiles),
        },
        'memory-manager': {
          mode: 'tool',
          description: 'Identity + family',
          prompt: buildPrompt('./agents/memory-manager.md', memoryFiles),
        },
        'health-manager': {
          mode: 'tool',
          description: 'Health info',
          prompt: buildPrompt('./agents/health-manager.md', memoryFiles),
        },
        'benefits-manager': {
          mode: 'tool',
          description: 'Irish benefits',
          tools: ['websearch'],
          prompt: buildPrompt('./agents/benefits-manager.md', memoryFiles),
        },
        reminder: {
          mode: 'tool',
          description: 'Reminders',
          prompt: buildPrompt('./agents/reminder.md', memoryFiles),
        },
      },
    }

    const configJson = JSON.stringify(opencodeConfig)

    // --- Start OpenCode ---
    console.log('Starting OpenCode...')
    const sessionId = `opencode-${Date.now()}`
    await sandbox.process.createSession(sessionId)

    const envVar = injectEnvVar('OPENCODE_CONFIG_CONTENT', configJson)

    const command = await sandbox.process.executeSessionCommand(sessionId, {
      command: `${envVar} opencode web --port ${OPENCODE_PORT}`,
      runAsync: true,
    })

    if (!command.cmdId) throw new Error('Failed to start OpenCode')

    const opencodePreview = await sandbox.getPreviewLink(OPENCODE_PORT)

    const replaceUrl = (text: string) =>
      text.replace(
        new RegExp(`http:\\/\\/127\\.0\\.0\\.1:${OPENCODE_PORT}`, 'g'),
        opencodePreview.url
      )

    sandbox.process.getSessionCommandLogs(
      sessionId,
      command.cmdId,
      (stdout) => console.log(replaceUrl(stdout).trim()),
      (stderr) => console.error(replaceUrl(stderr).trim()),
    )

    // --- Start preview server ---
    console.log('Starting preview server...')
    await sandbox.process.executeCommand(`
      nohup python3 /home/daytona/skills/server.py > /dev/null 2>&1 &
    `)

    await new Promise((r) => setTimeout(r, 2000))

    const preview = await sandbox.getPreviewLink(8080)

    console.log('\n✨ Salus is running!')
    console.log(`🌐 OpenCode UI: ${opencodePreview.url}`)
    console.log(`📄 Form Preview: ${preview.url}`)
    console.log('\nPress Ctrl+C to stop.\n')

    await new Promise(() => {})
  } catch (error) {
    console.error('Error:', error)
    if (sandbox) await sandbox.delete()
    process.exit(1)
  }
}

main().catch(console.error)