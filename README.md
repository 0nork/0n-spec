<div align="center">

```
   ██████╗ ███╗   ██╗
  ██╔═████╗████╗  ██║
  ██║██╔██║██╔██╗ ██║
  ████╔╝██║██║╚██╗██║
  ╚██████╔╝██║ ╚████║
   ╚═════╝ ╚═╝  ╚═══╝
```

# The .0n Standard

### The universal configuration format for AI orchestration.

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg?style=flat-square)](https://creativecommons.org/licenses/by/4.0/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](SPEC.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

[Specification](SPEC.md) · [Schemas](#schemas) · [Examples](#examples) · [CLI](#cli) · [Library](#library) · [0nMCP](https://github.com/0nork/0nMCP)

</div>

---

## What is .0n?

Just as `.git` revolutionized version control and `.env` standardized environment configuration, **`.0n`** establishes the universal standard for AI orchestration configuration.

```
~/.0n/
├── config.json           # Global settings
├── connections/          # Service credentials
│   ├── stripe.0n
│   ├── slack.0n
│   └── openai.0n
├── workflows/            # Automation definitions
│   └── invoice-notify.0n
├── snapshots/            # System state captures
│   └── crm-setup.0n
├── history/              # Execution logs
└── cache/                # Response cache
```

**Every `.0n` file has a standard header:**

```json
{
  "$0n": {
    "type": "connection",
    "version": "1.0.0",
    "name": "Production Stripe"
  },
  "service": "stripe",
  "auth": {
    "type": "api_key",
    "credentials": { "api_key": "{{env.STRIPE_SECRET_KEY}}" }
  }
}
```

**The philosophy: "Turn it on. It just works."**

---

## Why .0n?

| Problem | .0n Solution |
|---------|-------------|
| Every orchestrator invents its own config format | One standard format for all |
| Credentials scattered across env files, JSON, YAML | `~/.0n/connections/` — one place |
| Workflows trapped in proprietary tools | Portable `.0n` workflow files |
| No execution history standard | `~/.0n/history/` — JSONL by date |
| System configs can't be shared | Shareable snapshots with `.0n` format |

---

## File Types

| Type | Purpose | Example |
|------|---------|---------|
| `connection` | Service credentials | `stripe.0n` |
| `workflow` | Multi-step automations | `invoice-notify.0n` |
| `snapshot` | System state capture | `crm-setup.0n` |
| `execution` | Task run history | `2026-02-06.jsonl` |
| `config` | Global settings | `config.json` |

---

## Schemas

JSON Schemas for validation:

- [`schemas/config.json`](schemas/config.json) — Global configuration
- [`schemas/connection.json`](schemas/connection.json) — Service connections
- [`schemas/workflow.json`](schemas/workflow.json) — Workflow definitions
- [`schemas/snapshot.json`](schemas/snapshot.json) — System snapshots

---

## Examples

Working examples of each file type:

- [`examples/config.0n`](examples/config.0n) — Global config with Anthropic provider
- [`examples/stripe.0n`](examples/stripe.0n) — Stripe connection with env var credentials
- [`examples/invoice-notify.0n`](examples/invoice-notify.0n) — 5-step workflow: find customer, create invoice, add line item, send, notify Slack
- [`examples/crm-setup.0n`](examples/crm-setup.0n) — Full CRM snapshot with pipeline, 10 tags, custom fields, custom values, 3 workflows, email templates

---

## CLI

Initialize, validate, and test `.0n` files from the command line.

### Install

```bash
npm install -g 0n-spec
```

### Commands

```bash
# Initialize ~/.0n/ directory
0n init

# Validate a .0n file
0n validate my-workflow.0n

# Validate entire directory
0n validate ~/.0n/

# Run conformance tests against examples
0n test
```

---

## Library

Use programmatically in Node.js:

```javascript
const { validate, parse, create, init, list, save } = require('0n-spec');

// Validate a file
const result = validate('my-workflow.0n');
// { valid: true, type: 'workflow', version: '1.0.0', errors: [], warnings: [] }

// Parse a .0n file
const workflow = parse('~/.0n/workflows/invoice-notify.0n');
// { type: 'workflow', name: 'Invoice and Notify', data: {...} }

// Create a new .0n object
const connection = create('connection', {
  name: 'My Stripe',
  service: 'stripe',
  authType: 'api_key',
  credentials: { api_key: '{{env.STRIPE_KEY}}' },
});

// Initialize ~/.0n/ directory
init();

// List all connections
const connections = list('connection');

// Save to file
save(connection, '~/.0n/connections/stripe.0n');
```

---

## Template Syntax

The `.0n` standard uses double-brace templates:

| Syntax | Description |
|--------|-------------|
| `{{inputs.name}}` | Reference input parameter |
| `{{step_id.output.field}}` | Reference step output |
| `{{env.VAR_NAME}}` | Reference environment variable |
| `{{now}}` | Current ISO timestamp |
| `{{uuid}}` | Generate UUID |

---

## Implementations

| Product | Description | Status |
|---------|-------------|--------|
| [0nMCP](https://github.com/0nork/0nMCP) | Universal AI API Orchestrator — 850 tools, 53 services | Production |

### Building a .0n Implementation

1. Use `~/.0n/` as the config directory
2. Support the `$0n` header in all files
3. Validate against the JSON schemas
4. Pass conformance tests: `npx 0n-spec test`

---

## Community & Unlocks

The .0n Standard grows with the 0nMCP community. Every milestone unlocks new capabilities.

- **[0nmcp.com/community](https://0nmcp.com/community)** — Community hub
- **[Unlock Schedule](https://0nmcp.com/sponsor)** — 7-phase roadmap to 5,000+ tools
- [GitHub Discussions](https://github.com/0nork/0nMCP/discussions) — Questions and ideas
- [Sponsor on GitHub](https://github.com/sponsors/0nork) — Fund the next unlock

**Current:** Phase 0 — Foundation complete (850 tools, 53 services, 23 categories)

---

## The 0n Network

The .0n Standard is part of the **0n Network** — an open ecosystem of AI-native tools.

| | |
|---|---|
| **[RocketOpp](https://rocketopp.com)** | The agency behind the 0n Network. AI-powered systems that replace manual operations. |
| **[Rocket+MCP](https://rocketadd.com)** | Universal control layer connecting AI agents to business tools. |
| **[0n Network](https://github.com/0nork)** | Open-source AI orchestration infrastructure. |

---

## Contributing

We want the .0n standard to become the **universal format** for AI orchestration config.

**Ways to contribute:**
- Propose schema improvements
- Add example `.0n` files
- Build a .0n-compliant implementation
- Report issues or suggest features
- Star the repo

```bash
git clone https://github.com/0nork/0n-spec.git
cd 0n-spec
npm test
```

---

## License

The .0n Specification is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The CLI and library code are licensed under [MIT](LICENSE).

---

<div align="center">

### Turn it on. It just works.

**[Read the Spec](SPEC.md)** · **[Star this repo](https://github.com/0nork/0n-spec)** · **[Use 0nMCP](https://github.com/0nork/0nMCP)**

---

Made with conviction by [RocketOpp](https://rocketopp.com) · [Rocket+MCP](https://rocketadd.com) · [0n Network](https://github.com/0nork)

*"The best automation is the one you don't have to configure."*

</div>
