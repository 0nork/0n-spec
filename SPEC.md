# The .0n Standard

## The Universal Configuration Format for AI Orchestration

**Version**: 1.0.0
**Status**: Draft
**Maintainer**: 0nORK (https://0nork.com)
**Specification**: https://github.com/0nork/0n-spec

---

## Overview

The `.0n` (pronounced "dot-on") standard defines a universal configuration format and directory structure for AI-powered orchestration systems. Just as `.git` revolutionized version control and `.env` standardized environment configuration, `.0n` establishes the foundation for AI orchestration.

**The Philosophy**: "Turn it on. It just works."

---

## Table of Contents

1. [The ~/.0n Directory](#the-0n-directory)
2. [File Extensions](#file-extensions)
3. [Core Schemas](#core-schemas)
4. [Connection Format](#connection-format)
5. [Workflow Format](#workflow-format)
6. [Snapshot Format](#snapshot-format)
7. [Execution Format](#execution-format)
8. [Versioning](#versioning)
9. [Security](#security)
10. [Implementations](#implementations)

---

## The ~/.0n Directory

Every system implementing the .0n standard MUST use `~/.0n/` as the root configuration directory.

### Directory Structure

```
~/.0n/
├── config.json           # Global configuration
├── connections/          # Service credentials
│   ├── stripe.0n         # Individual service configs
│   ├── slack.0n
│   ├── openai.0n
│   └── ...
├── workflows/            # Saved workflows
│   ├── invoice-flow.0n
│   ├── lead-nurture.0n
│   └── ...
├── snapshots/            # System snapshots
│   ├── crm-setup.0n
│   └── ...
├── history/              # Execution history
│   ├── 2026-02-06.jsonl
│   └── ...
├── cache/                # Response cache
│   └── ...
└── plugins/              # Custom extensions
    └── ...
```

### Global Config (~/.0n/config.json)

```json
{
  "$0n": {
    "type": "config",
    "version": "1.0.0",
    "created": "2026-02-06T12:00:00Z"
  },
  "settings": {
    "ai_provider": "anthropic",
    "ai_model": "claude-sonnet-4-20250514",
    "fallback_mode": "keyword",
    "history_enabled": true,
    "history_retention_days": 30,
    "cache_enabled": true,
    "cache_ttl_seconds": 3600,
    "encryption_enabled": false,
    "encryption_key_path": null
  },
  "default_services": ["stripe", "slack", "openai"],
  "plugins": []
}
```

---

## File Extensions

The .0n standard defines the following file extensions:

| Extension | Purpose | Example |
|-----------|---------|---------|
| `.0n` | Universal .0n config file | `my-setup.0n` |
| `.0n.json` | JSON format (explicit) | `workflow.0n.json` |
| `.0n.yaml` | YAML format (explicit) | `workflow.0n.yaml` |
| `.0nlock` | Lock file (dependencies) | `project.0nlock` |
| `.0nignore` | Ignore patterns | `.0nignore` |

### Default Format

`.0n` files without explicit format extension default to JSON.

---

## Core Schemas

Every .0n file MUST include a header with type and version:

```json
{
  "$0n": {
    "type": "connection | workflow | snapshot | execution | config",
    "version": "1.0.0",
    "created": "ISO-8601 timestamp",
    "updated": "ISO-8601 timestamp",
    "name": "Human-readable name",
    "description": "Optional description"
  },
  // ... type-specific content
}
```

### Type Definitions

| Type | Purpose |
|------|---------|
| `connection` | Service credentials and configuration |
| `workflow` | Multi-step automation definition |
| `snapshot` | Complete system state capture |
| `execution` | Task execution record |
| `config` | Configuration settings |

---

## Connection Format

Connections define how to authenticate with external services.

### Schema

```json
{
  "$0n": {
    "type": "connection",
    "version": "1.0.0",
    "created": "2026-02-06T12:00:00Z",
    "name": "My Stripe Account"
  },
  "service": "stripe",
  "environment": "production | sandbox | development",
  "auth": {
    "type": "api_key | oauth2 | basic | bearer | custom",
    "credentials": {
      // Type-specific credentials
    }
  },
  "options": {
    "base_url": "https://api.stripe.com",
    "timeout_ms": 30000,
    "retry_count": 3,
    "rate_limit": {
      "requests_per_second": 10
    }
  },
  "metadata": {
    "account_id": "acct_xxx",
    "account_name": "My Business",
    "connected_at": "2026-02-06T12:00:00Z",
    "last_used": "2026-02-06T12:00:00Z"
  }
}
```

### Auth Type Examples

**API Key:**
```json
{
  "type": "api_key",
  "credentials": {
    "api_key": "sk_live_xxx",
    "header_name": "Authorization",
    "header_prefix": "Bearer"
  }
}
```

**OAuth2:**
```json
{
  "type": "oauth2",
  "credentials": {
    "client_id": "xxx",
    "client_secret": "xxx",
    "access_token": "xxx",
    "refresh_token": "xxx",
    "expires_at": "2026-02-06T12:00:00Z",
    "token_url": "https://oauth.service.com/token",
    "scopes": ["read", "write"]
  }
}
```

**Basic Auth:**
```json
{
  "type": "basic",
  "credentials": {
    "username": "user",
    "password": "pass"
  }
}
```

---

## Workflow Format

Workflows define multi-step automations with triggers, actions, and conditions.

### Schema

```json
{
  "$0n": {
    "type": "workflow",
    "version": "1.0.0",
    "created": "2026-02-06T12:00:00Z",
    "name": "Invoice and Notify",
    "description": "Create invoice and notify team on Slack"
  },
  "trigger": {
    "type": "manual | schedule | webhook | event",
    "config": {}
  },
  "inputs": {
    "customer_email": {
      "type": "string",
      "required": true,
      "description": "Customer email address"
    },
    "amount": {
      "type": "number",
      "required": true,
      "description": "Invoice amount in dollars"
    }
  },
  "steps": [
    {
      "id": "step_1",
      "name": "Find Customer",
      "service": "stripe",
      "action": "customers.search",
      "params": {
        "email": "{{inputs.customer_email}}"
      },
      "output": "customer"
    },
    {
      "id": "step_2",
      "name": "Create Invoice",
      "service": "stripe",
      "action": "invoices.create",
      "params": {
        "customer": "{{step_1.customer.id}}",
        "amount": "{{inputs.amount * 100}}",
        "currency": "usd"
      },
      "output": "invoice",
      "conditions": [
        {
          "if": "{{step_1.customer != null}}",
          "else": "error:Customer not found"
        }
      ]
    },
    {
      "id": "step_3",
      "name": "Notify Team",
      "service": "slack",
      "action": "chat.postMessage",
      "params": {
        "channel": "#sales",
        "text": "Invoice {{step_2.invoice.number}} created for ${{inputs.amount}}"
      }
    }
  ],
  "outputs": {
    "invoice_id": "{{step_2.invoice.id}}",
    "invoice_url": "{{step_2.invoice.hosted_invoice_url}}"
  },
  "error_handling": {
    "on_error": "stop | continue | retry",
    "retry_count": 3,
    "retry_delay_ms": 1000,
    "notify_on_error": {
      "service": "slack",
      "channel": "#alerts"
    }
  }
}
```

### Trigger Types

**Manual:**
```json
{ "type": "manual", "config": {} }
```

**Schedule (Cron):**
```json
{
  "type": "schedule",
  "config": {
    "cron": "0 9 * * 1",
    "timezone": "America/New_York"
  }
}
```

**Webhook:**
```json
{
  "type": "webhook",
  "config": {
    "path": "/hooks/my-workflow",
    "method": "POST",
    "secret": "whsec_xxx"
  }
}
```

**Event:**
```json
{
  "type": "event",
  "config": {
    "service": "stripe",
    "event": "invoice.paid",
    "filter": { "amount_paid": { "$gte": 10000 } }
  }
}
```

### Template Syntax

The .0n standard uses double-brace syntax for templates:

| Syntax | Description |
|--------|-------------|
| `{{inputs.name}}` | Reference input parameter |
| `{{step_id.output.field}}` | Reference step output |
| `{{env.VAR_NAME}}` | Reference environment variable |
| `{{now}}` | Current ISO timestamp |
| `{{uuid}}` | Generate UUID |
| `{{expr * 100}}` | Mathematical expression |

---

## Snapshot Format

Snapshots capture complete system state for backup, migration, or deployment.

### Schema

```json
{
  "$0n": {
    "type": "snapshot",
    "version": "1.0.0",
    "created": "2026-02-06T12:00:00Z",
    "name": "CRM Full Setup",
    "description": "Complete CRM configuration with pipelines, tags, and workflows"
  },
  "target": {
    "service": "crm",
    "location_id": "{{env.CRM_LOCATION_ID}}"
  },
  "components": {
    "pipelines": [...],
    "tags": [...],
    "custom_fields": [...],
    "custom_values": {...},
    "workflows": [...],
    "templates": { "emails": [...], "sms": [...] }
  },
  "deployment": {
    "strategy": "merge | replace | skip_existing",
    "dry_run": false,
    "rollback_on_error": true
  }
}
```

---

## Execution Format

Execution records capture the history of task runs.

### Schema

```json
{
  "$0n": {
    "type": "execution",
    "version": "1.0.0",
    "created": "2026-02-06T12:00:00Z"
  },
  "execution_id": "exec_xxx",
  "workflow_id": "workflow_xxx",
  "workflow_name": "Invoice and Notify",
  "status": "pending | running | completed | failed | cancelled",
  "trigger": {
    "type": "manual",
    "initiated_by": "user",
    "source": "claude-desktop"
  },
  "inputs": {
    "customer_email": "john@acme.com",
    "amount": 500
  },
  "steps": [
    {
      "id": "step_1",
      "name": "Find Customer",
      "status": "completed",
      "started_at": "2026-02-06T12:00:00.000Z",
      "completed_at": "2026-02-06T12:00:00.234Z",
      "duration_ms": 234,
      "request": {
        "service": "stripe",
        "action": "customers.search",
        "params": { "email": "john@acme.com" }
      },
      "response": {
        "customer": { "id": "cus_xxx", "name": "John Smith" }
      }
    }
  ],
  "outputs": {
    "invoice_id": "in_xxx",
    "invoice_url": "https://invoice.stripe.com/xxx"
  },
  "timing": {
    "started_at": "2026-02-06T12:00:00.000Z",
    "completed_at": "2026-02-06T12:00:00.789Z",
    "duration_ms": 789
  },
  "error": null
}
```

### History Storage

Execution history is stored in `~/.0n/history/` as JSONL files (one JSON object per line), organized by date:

```
~/.0n/history/
├── 2026-02-06.jsonl
├── 2026-02-05.jsonl
└── ...
```

---

## Versioning

The .0n standard follows Semantic Versioning (SemVer):

- **MAJOR**: Breaking changes to the schema
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, documentation

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-06 | Initial release |

---

## Security

### Credential Storage

Credentials in `.0n` files SHOULD be encrypted when `encryption_enabled` is true in config.

**Encryption Specification:**
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2 with SHA-256
- Salt: Random 16 bytes per file
- IV: Random 12 bytes per encryption

**Encrypted credential format:**
```json
{
  "encrypted": true,
  "algorithm": "aes-256-gcm",
  "salt": "base64...",
  "iv": "base64...",
  "ciphertext": "base64...",
  "tag": "base64..."
}
```

### .0nignore

Create a `.0nignore` file to exclude sensitive files from version control:

```
# Credentials
~/.0n/connections/
*.0n

# History
~/.0n/history/

# Cache
~/.0n/cache/
```

### Environment Variables

Sensitive values SHOULD use environment variable references:

```json
{
  "api_key": "{{env.STRIPE_SECRET_KEY}}"
}
```

---

## Implementations

### Official Implementations

| Product | Repository | Status |
|---------|-----------|--------|
| 0nMCP | github.com/0nork/0nMCP | Production |

### Creating an Implementation

To create a .0n-compliant implementation:

1. Use `~/.0n/` as the config directory
2. Support the core file formats
3. Validate against the JSON schemas
4. Pass the conformance tests

### Conformance Testing

```bash
npx 0n-spec test ~/.0n/
```

---

## Appendix

### JSON Schemas

Full JSON schemas available at:
- https://0nork.com/schemas/connection.json
- https://0nork.com/schemas/workflow.json
- https://0nork.com/schemas/snapshot.json
- https://0nork.com/schemas/config.json

### Media Type

The official media type for .0n files:

```
application/vnd.0n+json
```

---

## License

The .0n Specification is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

You are free to:
- Share — copy and redistribute
- Adapt — remix, transform, build upon

Under the terms:
- Attribution — give appropriate credit to 0nORK

---

## Credits

Created and maintained by [0nORK](https://github.com/0nork) — AI Orchestration Infrastructure.

Part of the [0n Network](https://github.com/0nork) by [RocketOpp](https://rocketopp.com).

---

<p align="center">
  <strong>The .0n Standard</strong>
  <br>
  <em>Turn it on. It just works.</em>
</p>
