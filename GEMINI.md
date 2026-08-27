# 🇳🇵 Nepal Reforms Project Overview

This workspace is a collection of digital platforms and AI tools dedicated to Nepal's democratic transformation, civic engagement, and political awareness. It comprises several independent Next.js projects, each serving a specific purpose within the Nepal Reforms ecosystem.

## 📂 Project Structure

The workspace is organized into the following sub-projects:

### 1. [nepalreforms-platform](./nepalreforms-platform) (Core Platform)
A comprehensive digital platform presenting 31 evidence-based reform proposals for Nepal.
- **Tech Stack**: Next.js 15.2.4, React 19, TypeScript 5, Tailwind CSS, Supabase (Auth & DB), Resend (Email).
- **Key Features**: 31 detailed reforms, real-time voting, community suggestions, bilingual support (English/Nepali).
- **Main Entry**: `nepalreforms-platform/app/page.tsx`

### 2. [sell-my-vote-nepalreforms](./sell-my-vote-nepalreforms) (Awareness Tool)
A mobile-first political awareness tool helping citizens understand the real cost of governance.
- **Tech Stack**: Next.js 16 (v0/Latest), React 19.2, Tailwind CSS v4, Azure OpenAI (GPT-4o & O1).
- **Key Features**: 10-question survey, AI-powered cost analysis, gamification, candidate evaluation checklist.
- **Main Entry**: `sell-my-vote-nepalreforms/app/page.tsx`

### 3. [NRAI-Kancha-v1](./NRAI-Kancha-v1) (AI Agent)
"Kancha" - Autonomous AI Civic Agent powered by DeepSeek AI (`deepseek-v4-flash`) with full voice capabilities (STT/TTS) and 31 reform dossiers.
- **Tech Stack**: Next.js 16, React 19, DeepSeek AI, Azure Speech Services + Web Speech API.
- **Key Features**: Autonomous multi-tool execution, bilingual voice input/output, reasoning traces, 31 reforms knowledge store, embeddable widget.
- **Main Entry**: `NRAI-Kancha-v1/app/page.tsx`

### 4. [nepalreforms-tracker](./nepalreforms-tracker) (Accountability & Tracker)
Full public accountability system connecting 31 reform agendas, budget allocations, and execution evidence.
- **Tech Stack**: Next.js 16, Django, Neo4j, PostgreSQL / Supabase.
- **Key Features**: Graph ingestion engine, budget event tracking, paper-vs-ground truth verification.

---

## 🚀 Building and Running

Since these are independent projects, you must navigate into each directory to run them.

### General Commands (Use Bun Always & Everywhere)

For all Next.js / TypeScript projects (`nepalreforms-platform`, `sell-my-vote-nepalreforms`, `NRAI-Kancha-v1`), always use `bun`:

1.  **Install Dependencies**:
    ```bash
    bun install
    ```

2.  **Development Server**:
    ```bash
    bun run dev
    ```

3.  **Production Build**:
    ```bash
    bun run build
    bun run start
    ```

4.  **Testing**:
    ```bash
    bun test
    ```

5.  **Linting**:
    ```bash
    bun run lint
    ```

### Specific Requirements

- **nepalreforms-platform**: Requires Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **sell-my-vote-nepalreforms**: Requires Azure OpenAI credentials (`AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`).
- **NRAI-Kancha-v1**: Requires Azure AI Foundry and Speech Services credentials (`AZURE_AI_PROJECT_URL`, `SPEECH_KEY`, `SPEECH_REGION`).

---

## 🛠️ Development Conventions

### Coding Style
- **TypeScript**: Use strict typing and interfaces for all components and data.
- **React**: Functional components with Hooks. Prefer Next.js App Router patterns.
- **Styling**: Tailwind CSS (v3 for platform/kancha, v4 for sell-my-vote). Use utility classes and avoid inline styles.
- **Bilingual Support**: All user-facing text should be structured for English and Nepali support.

### Git & Collaboration
- **Conventional Commits**: Use `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`.
- **Branching**: Use `feature/` or `fix/` prefixes for branches.
- **Pull Requests**: Include a description of changes, testing performed, and screenshots for UI changes.

### Data Management
- **Reform Data**: Centralized in `nepalreforms-platform/lib/manifesto-data.ts`.
- **Database**: Use Supabase client for real-time interactions and data persistence in the platform.
- **AI**: Use Azure OpenAI for complex calculations and natural language processing.

---

## 📝 TODOs & Future Roadmap
- [ ] Implement full Nepali translation across all platforms.
- [ ] Complete the `nepalreforms-tracker` implementation.
- [ ] Enhance PWA capabilities for offline accessibility in rural Nepal.
- [ ] Add unit and integration tests (Jest/Playwright).
