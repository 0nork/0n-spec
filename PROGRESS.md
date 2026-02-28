# .0n Ecosystem — Progress Sync

> **Updated**: February 27, 2026
> **Synced by**: 0nClaude
> **Shared across**: iPad + Desktop via 0n-spec repo

---

## Session Progress (February 27, 2026)

### Completed Today

#### 1. .0n Specification v1.0.0 (LOCKED)
- All 8 Tier 1 decisions locked (see `DECISIONS.md`)
- Full specification written (`SPECIFICATION.md` — 1,769 lines)
- JSON Schema created (`schemas/v1.0.0/0n-file.schema.json` — 1,063 lines)
- Confirmed plan documented (`PHASE1-CONFIRMED-PLAN.md`)
- Pushed to 0n-spec GitHub for iPad sync

#### 2. Database Consolidation
- **ONE database**: `yaehbwimocvvnnlojkxe` (0nork Customers on Supabase)
- Fixed mike@rocketopp.com auth password
- Fixed all hardcoded old Supabase refs (pwujhhmlrtxjmjzyttwn)
- Updated Vercel production env vars (SERVICE_ROLE_KEY, SUPABASE_URL, POSTGRES_HOST)
- All auth emails now point to `https://0nmcp.com` (not localhost)

#### 3. 0n Console — LIVE at 0nmcp.com/console
**The unified client dashboard for the entire 0n ecosystem.**

| View | Status | Description |
|------|--------|-------------|
| **Dashboard** | Live | MCP health, connected services, stats, recent history |
| **Chat** | Live | AI chat with 0nMCP tool execution, ideas ticker |
| **Community** | Live | Embedded CRM community (The 0nBoard) via iframe |
| **Builder** | Live | Full drag-and-drop workflow editor (17 components, @xyflow/react) |
| **Vault** | Live | Credential management for 26 services |
| **Flows** | Live | Workflow management (MCP + local) |
| **History** | Live | Activity log with clear function |

**Console Architecture:**
- Auth-gated (Supabase, redirects to /login)
- Own layout (no site chrome)
- 4 API proxy routes: `/api/console/chat`, `/health`, `/workflows`, `/execute`
- Command palette (Cmd+K) with all views
- 3-state sidebar: fully open (default) → hidden (hover to reveal) → icons only (tooltips)

**Builder Enhancements:**
- Service logos from SimpleIcons CDN for all 26 services
- "Active" pinned category at top of palette (reads vault connections from localStorage)
- Full .0n export/import with Ed25519 signing
- AI Builder assistant (Claude-powered)
- Undo/redo with 40-step history
- Cloud save to Supabase

#### 4. 0nClaude Skill File
- Created `/0nclaude` Claude Code skill at `~/.claude/skills/0nclaude/SKILL.md`
- Loads entire ecosystem: all API keys, project locations, databases, MCP configs
- 0n Command Vocabulary: "Turn it 0n", "Save to 0n", "0n deploy", etc.
- Activation sequence: load context → detect project → show status → execute

---

## Current State — All Components

| Component | Version | Status | URL |
|-----------|---------|--------|-----|
| **0nMCP** | v2.1.0 | Published on npm | `npm i 0nmcp` |
| **0n-spec** | v1.1.0 | Published, v2.0.0 spec written | `npm i 0n-spec` |
| **0nork** | v1.0.1 | Published | `npm i 0nork` |
| **0nmcp.com** | v2.1.0 | Live + Console | [0nmcp.com](https://0nmcp.com) |
| **Marketplace** | v1.0.0 | Deployed | marketplace.rocketclients.com |
| **0nork App** | v1.0.0 | Deployed (being merged into console) | TBD |

---

## Console File Map

### Libraries (6 files)
```
src/lib/console/
├── services.ts     — 23 service definitions with credential schemas
├── ideas.ts        — 21 workflow combo suggestions
├── hooks.ts        — useVault, useFlows, useHistory (localStorage)
├── 0nmcp-client.ts — HTTP client for 0nMCP server
├── theme.ts        — CSS variable theme mapping
└── index.ts        — Barrel exports
```

### Components (13 files)
```
src/components/console/
├── Sidebar.tsx          — 3-state nav (open/hidden/icons) with tooltips
├── Header.tsx           — View title, MCP status, Cmd+K search
├── Chat.tsx             — Message list with source badges
├── ChatInput.tsx        — Input with slash command trigger
├── CommandPalette.tsx   — Cmd+K overlay (8 commands)
├── CommunityView.tsx    — CRM community iframe embed
├── DashboardView.tsx    — Stats grid + service health + history
├── VaultOverlay.tsx     — Service grid with search
├── VaultDetail.tsx      — Per-service credential editor
├── FlowsOverlay.tsx     — Workflow list (MCP + local)
├── HistoryOverlay.tsx   — Activity timeline
├── IdeasTicker.tsx      — Scrolling workflow suggestions
└── StatusDot.tsx        — Animated status indicator
```

### Pages & Routes
```
src/app/console/
├── page.tsx    — Main shell (~450 lines)
└── layout.tsx  — Minimal (no SiteChrome)

src/app/api/console/
├── chat/route.ts       — 3-tier: 0nMCP → Claude → local
├── health/route.ts     — 0nMCP health proxy
├── workflows/route.ts  — List + run workflows
└── execute/route.ts    — Task execution proxy
```

### Builder (17 files — already existed, now in console)
```
src/components/builder/
├── BuilderApp.tsx               — Main shell
├── Canvas.tsx                   — @xyflow/react drag-drop canvas
├── ServicePalette.tsx           — Left panel: 26 services + Active category + logos
├── ServicePaletteItem.tsx       — Draggable service card
├── WorkflowNode.tsx             — Custom node component
├── ConfigPanel.tsx              — Right panel: step configuration
├── Toolbar.tsx                  — Save/export/import/undo/redo/AI
├── AIChat.tsx                   — AI workflow generation assistant
├── BuilderContext.tsx            — State management (useReducer + undo/redo)
├── WorkflowSettingsModal.tsx    — Name, description, env, tags
├── BuilderLoader.tsx            — Dynamic import wrapper
├── exportWorkflow.ts            — Nodes+edges → .0n JSON
├── importWorkflow.ts            — .0n JSON → nodes+edges
├── types.ts                     — Full type system
└── builder.css                  — Dark theme CSS (~995 lines)
```

---

## Git Commits Today

| Hash | Message |
|------|---------|
| `f82dd7a` | Add Builder view to console + service logos + Active category |
| `0de52f7` | Rewrite Sidebar with three-state mode: open, hidden, icons |
| `91bbd2b` | Add Community view to console — embed The 0nBoard |
| `e2a9f70` | Add 0n Console dashboard with full API routes and component library |
| `5b8bb1f` | Fix auth email localhost URLs + reconcile production database |

---

## What's Next

### Immediate (Ready to Build)
- [ ] Phase A: Upgrade 0n-spec to v2.0.0 (Ed25519 signing, SHA-256 hashing, YAML compiler, merge engine, adapters)
- [ ] Rocket Command: Multi-tenant CRM dashboard (plan exists, revenue target)
- [ ] VIP access system: Mark accounts for free access to all features
- [ ] Connect CRM memberships/courses to console (communities, courses visible)

### Tier 2 Decisions (Before Patent Code)
- T2-01: Seal of Truth claim extraction engine
- T2-02: Source authority registry
- T2-03: Confidence scoring formula
- T2-04: Federation Gateway API scope
- T2-05: Smart Deploy placeholder token spec
- T2-06: Smart Deploy dependency resolution
- T2-07: .FED format standalone library spec
- T2-08: Deed Transfer escrow party model
- T2-09: Transfer Registry architecture

### Patent Deadlines
| Patent | Filed | Non-Provisional Due |
|--------|-------|-------------------|
| #63/968,814 (Seal of Truth) | Jan 27, 2026 | **Jan 27, 2027** |
| #63/990,046 (Vault Container) | Feb 24, 2026 | **Feb 24, 2027** |

---

*RocketOpp LLC · 0nmcp.com · Patent Pending · Confidential*
*Last synced: February 27, 2026*
