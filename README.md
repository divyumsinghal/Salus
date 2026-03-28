# Salus AI

> Your Care Companion

**An AI-powered personal agent for affordable, dignified elderly care**

### What We’re Building
Salus is a secure, stateful AI agent that acts as a **companion, memory aid, and administrative assistant** for elderly or marginalized individuals who cannot afford round‑the‑clock human care. It runs on inexpensive hardware (phone/tablet) and leverages Daytona’s isolated, stateful sandboxes to ensure privacy, persistence, and safe automation.

### Core Features
1. **Persistent, Long‑Term Memory**
   Remembers names, family relationships, medical history, and personal preferences across conversations—creating a sense of continuity and genuine connection.

2. **Intelligent Reminders & Prompts**
   Gently nudges users about medications, appointments, hydration, or daily routines based on learned habits and stored schedules.

3. **Automated Assistant for Forms & Benefits**
   Safely navigates government portals, fills out benefit applications (e.g., housing assistance, tax relief), and simplifies bureaucratic paperwork—all inside an isolated computer‑use sandbox.

4. **Human‑in‑the‑Loop Oversight**
   Trusted caregivers can securely SSH into or view the agent’s sandbox to review actions, help with complex tasks, or intervene when needed.

### How Daytona Powers MemoryKeeper

| Requirement | Daytona Solution |
|-------------|------------------|
| **Persistent memory** | Stateful workspaces with attached volumes that survive restarts. |
| **Safe task automation** | On‑demand **Computer Use Sandboxes** (Linux/Windows) where the agent runs browser automation (Playwright) to fill forms—completely isolated from the host system. |
| **AI‑generated code execution** | Secure sandboxes for executing helper scripts without risk. |
| **Human oversight** | Built‑in SSH access, VS Code browser, and web terminal for real‑time debugging or intervention. |
| **Compliance** | Runs on customer‑managed compute with HIPAA, SOC 2, and GDPR readiness—critical for handling sensitive health and financial data. |


### Why It’s Different
- **Not just a chatbot** – it remembers, acts, and securely handles real‑world tasks.
- **Privacy‑first** – everything runs in isolated, customer‑owned environments.
- **Designed for scale** – no expensive hardware, works on basic smartphones.
- **Empathetic by design** – the memory system creates a feeling of genuine caring.
