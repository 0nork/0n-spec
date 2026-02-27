# .0n Phase 1 Build — Confirmed Plan

> **Status**: ACTIVE — Building
> **Date**: February 27, 2026
> **Author**: Mike @ RocketOpp LLC + 0nClaude
> **Patent Ref**: USPTO App. 63/968,814 · 63/990,046
> **Confidential**: RocketOpp LLC

---

## What Is Being Built

The .0n file specification v1.0.0 — the universal interface contract that sits at the center of every patent, every product, and every integration in the 0nMCP ecosystem.

**The .0n file is NOT a config file.** It is:
- The protocol for all five patent backbones
- The "Stripe API key" of the ecosystem — one format, one mental model
- The patent defense mechanism — patented behaviors are mandatory fields
- The backward compatibility solution — all external formats convert to/from .0n

---

## Five Patents That Depend on This Spec

| # | Patent | Role of .0n File |
|---|--------|-----------------|
| 1 | **MCPFed** (Three-Level Execution) | .0n IS the workflow definition — Pipeline / Assembly Line / Radial Burst |
| 2 | **JSON Smart Deploy** | Input: template .0n with placeholders. Output: hydrated .0n. The transformation IS the patent |
| 3 | **Seal of Truth** | Reads verify block to know what to certify. Writes certification back as structured object |
| 4 | **.FED Format** | A .fed file IS an encrypted .0n file. Encrypt → .fed. Decrypt → .0n |
| 5 | **.0n Deed Transfer** | The deed IS a .0n file wrapped in seven-layer semantic encryption with per-party escrow keys |

---

## Tier 1 Decisions — ALL 8 LOCKED

### T1-01: File Extension Strategy
**DECIDED: `.0n` is canonical. Subtypes are optional aliases.**

- `.0n` is always valid, always recognized
- `manifest.type` inside the file is the authoritative content type
- Subtypes (`.0nw`, `.0nc`, `.0ne`, `.0nb`, `.0nv`, `.fed`, `.0nd`) help tooling but are never required
- A parser MUST accept `.0n` regardless of content type

### T1-02: JSON vs YAML
**DECIDED: Both in spec. JSON canonical. YAML compiles to JSON.**

- Runtime is always JSON — one execution path, one validator
- YAML authoring supported for developer convenience (like Docker Compose, GitHub Actions)
- YAML → JSON is a compile step before validation
- Visual builder generates JSON — non-developers never see format choice

### T1-03: Ed25519 Key Management
**DECIDED: Client-side generation only. Private key NEVER leaves device.**

- Ed25519 keypair generated in browser (Web Crypto API) or CLI (tweetnacl)
- Private key encrypted with passphrase, stored in local 0nVault
- Public key registered with platform for signature verification
- Key rotation: new keypair generated, old signatures remain valid
- Non-developers see "Set your signing password" — never "Ed25519"

### T1-04: Vault Credential References
**DECIDED: Executing environment resolves references. Deed Transfer is per-file.**

- `{{vault:stripe}}` → resolved at runtime from user's local vault
- `{{env:STRIPE_KEY}}` → environment variable (CI/CD, serverless)
- `{{param:api_key}}` → runtime parameter
- Deed Transfer: credentials embedded in file, encrypted with escrow keys
- Sharing a workflow: recipient provides their own credentials. File is credential-agnostic.

### T1-05: Audit Trail Immutability
**DECIDED: Hash chain in Supabase + periodic external anchors.**

- Every audit record contains `prev_hash: SHA-256(previous_record)`
- Modify any record → chain breaks → tamper detected
- Anchor every 1,000 records or 24 hours to external timestamp authority
- RLS: INSERT only. No UPDATE. No DELETE.

### T1-06: Default on_error Behavior
**DECIDED: Reject the file. Missing on_error = structural error.**

- `on_error`, `retry`, `rollback` are MANDATORY fields
- Missing = structural error → file rejected at parse time → zero execution
- AI auto-fix CAN suggest the missing block (structural errors allow auto-fix)
- Forces every author to explicitly declare error behavior

### T1-07: Primary Launch Audience
**DECIDED: Developers + end users + enterprise simultaneously.**

- Developer Mode: Raw .0n editor, CLI, API, webhooks, vault
- User Mode: Visual builder, drag-and-drop, one-click execution
- Enterprise Mode: Compliance dashboard, Seal of Truth, audit explorer
- All three generate and consume the same .0n files

### T1-08: Platform Strategy
**DECIDED: Unified 0nmcp.com with staged backbone rollout.**

- 0nmcp.com is the destination — no individual domains
- Week 0-4: Shared infrastructure (console, auth, editor, sandbox)
- Then staged: Seal of Truth → MCPFed → Smart Deploy → .FED → Deed Transfer
- Each backbone launch is a marketing event driving traffic to ONE domain

---

## Mandatory Fields in Every .0n File

These are the non-convertible, non-optional elements that make the .0n format defensible:

```json
{
  "schema_version": "1.0.0",
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-02-27T00:00:00.000Z",
  "author": {
    "name": "Mike",
    "email": "mike@rocketopp.com",
    "pubkey": "Ed25519 public key (hex)"
  },
  "signature": "Ed25519 signature of content (hex)",
  "content_hash": "SHA-256 of file content at signing (hex)",
  "manifest": {
    "type": "workflow",
    "name": "My Workflow",
    "description": "What it does",
    "version": "1.0.0"
  },
  "on_error": {
    "action": "abort",
    "rollback": true
  },
  "retry": {
    "max_attempts": 3,
    "backoff": "exponential",
    "initial_delay_ms": 1000
  },
  "rollback": {
    "enabled": true,
    "strategy": "reverse_order"
  }
}
```

**Strip the signature → file has no provenance.**
**Strip the content_hash → Seal of Truth can't verify.**
**Strip on_error → file is invalid.**

Any tool claiming .0n compatibility MUST implement these fields.

---

## Error Handling — Four Categories

| Category | AI Auto-Fix | Rollback | Retry | Hard Stop |
|----------|------------|----------|-------|-----------|
| **Structural** (malformed file) | YES — schema corrections | N/A (no execution) | N/A | No |
| **Resolution** (missing resources) | YES — non-financial only | YES — per rollback field | Configurable | No |
| **Integration** (rate limits, timeouts) | NO — not applicable | Configurable | YES — exponential backoff | After max retries |
| **Cryptographic** (signature mismatch) | **NEVER** | N/A | **NEVER** | **ALWAYS** |

---

## Backward Compatibility — External Format Adapters

| Format | Direction | Status |
|--------|-----------|--------|
| Claude Desktop JSON | Import + Export | Partially live |
| Cursor mcp.json | Import + Export | Partially live |
| VS Code settings.json | Import + Export | Planned |
| Windsurf config | Import + Export | Planned |
| Gemini CLI config | Import + Export | Planned |
| OpenAI function calling | Import | Planned |
| n8n workflow JSON | Import + Export | Planned |
| YAML | Import + Export | Planned |

Every adapter must be: lossless for mapped fields, explicit about unmapped fields, and produce a valid .0n file with all mandatory fields.

---

## File Merging — Four Categories

1. **Additive** — No overlapping fields. Union of both files. Auto-resolvable.
2. **Conflicting** — Same field, different values. Rule-based: security higher wins, permissions restrictive wins, metadata newer wins.
3. **Ambiguous** — Rule-based resolution would be lossy. User must decide.
4. **Prohibited** — Deed Transfer files CANNOT merge while encrypted. This is a documented limit, not a bug.

Merged file = NEW file. New signature required. Provenance of both sources recorded.

---

## Build Sequence — Patent Backbones

| Order | Backbone | Why This Order |
|-------|----------|---------------|
| FIRST | **Seal of Truth** | Largest unserved market. Compliance mandates create urgent demand. |
| SECOND | **MCPFed** | Already live with paying customers. Deepening the backbone. |
| THIRD | **JSON Smart Deploy** | Developer-facing. More valuable as MCPFed grows. |
| FOURTH | **.FED Format** | Infrastructure primitive. Value multiplies with adoption. |
| FIFTH | **.0n Deed Transfer** | Most novel + complex. Needs other patents proven first. |

---

## What Has Been Built So Far

### Files Created (February 27, 2026)

| File | Location | Lines | Purpose |
|------|----------|-------|---------|
| `DECISIONS.md` | `~/Github/0n-spec/` | ~200 | 8 Tier 1 decisions with full rationale |
| `0n-file.schema.json` | `~/Github/0n-spec/schemas/v1.0.0/` | ~1,063 | JSON Schema (draft 2020-12) for .0n validation |
| `SPECIFICATION.md` | `~/Github/0n-spec/` | ~1,769 | Full v1.0.0 spec — 15 sections + 3 appendices |
| `PHASE1-CONFIRMED-PLAN.md` | `~/Github/0n-spec/` | This file | Summary of all decisions and plans |

### Previously Existing (0n-spec v1.1.0)
- `validate.js` — Basic .0n file validation (needs upgrade to v1.0.0 schema)
- `parse.js` — Parse .0n files
- `create.js` — Create new .0n documents
- `resolve.js` — Template engine for `{{expressions}}`
- `schemas/connection.json` — Old connection schema (v0)
- `schemas/workflow.json` — Old workflow schema (v0)

---

## What's Next — Implementation Phases

### Phase A: Core Spec Library (0n-spec v2.0.0)
- [ ] Upgrade `validate.js` to use v1.0.0 JSON Schema
- [ ] Add Ed25519 signing module (`sign.js`)
- [ ] Add SHA-256 content hashing module (`hash.js`)
- [ ] Add YAML → JSON compiler (`compile.js`)
- [ ] Add file merge engine (`merge.js`)
- [ ] Add adapter framework (`adapters/`)
- [ ] Update `create.js` to generate spec-compliant files with all mandatory fields
- [ ] Tests for all new modules

### Phase B: Seal of Truth Backbone
- [ ] Claim extraction engine
- [ ] Source authority registry
- [ ] Confidence scoring algorithm
- [ ] Verification API at 0nmcp.com/verify
- [ ] Audit trail with hash chain

### Phase C: MCPFed Deepening
- [ ] Federation Gateway API
- [ ] Server registry with discovery
- [ ] Three-Level Execution formalization
- [ ] .0n workflow runtime upgrade

### Phase D: Format Adapters
- [ ] Claude Desktop JSON adapter
- [ ] Cursor config adapter
- [ ] n8n workflow adapter
- [ ] OpenAI function calling adapter
- [ ] Gemini config adapter

### Phase E: Platform Console
- [ ] .0n Editor (visual + code)
- [ ] Patent API Console
- [ ] Sandbox with test credentials
- [ ] Export layer UI

---

## Open Questions Remaining

### Tier 2 — Must Answer Before Patent-Specific Code (9 questions)
- T2-01: Seal of Truth claim extraction engine — Claude / custom NLP / hybrid
- T2-02: Source authority registry — MVP source set, authority weights
- T2-03: Confidence scoring formula — weighting algorithm
- T2-04: Federation Gateway API scope — CRM-only vs general
- T2-05: Smart Deploy placeholder token spec — complete syntax
- T2-06: Smart Deploy dependency resolution algorithm
- T2-07: .FED format standalone library spec — four-layer details
- T2-08: Deed Transfer escrow party model
- T2-09: Transfer Registry architecture

### Tier 3 — Must Answer Before UX Work (8 questions)
- T3-01: AI auto-fix cost model (recommended: suggestions free, execution metered)
- T3-02: Merge capability MVP scope
- T3-03: Developer mode vs user mode interface split
- T3-04: Spec publication format
- T3-05: Sandbox credential model
- T3-06: Visual builder generation scope
- T3-07: File size limits by tier
- T3-08: Error message format standards

---

## Key Credentials & Infrastructure

### Supabase (Production)
- **0nmcp.com DB**: `yaehbwimocvvnnlojkxe`
- **Marketplace DB**: `pwujhhmlrtxjmjzyttwn`
- **Org**: RocketOpp (`zentqhhzpheiixikxyul`)

### Stripe
- **Account**: `acct_1PUJi5HThmAuKVQM`
- **Metered Price**: `price_1Sz5jVHThmAuKVQMtSPKsNsS` ($0.10/execution)

### Vercel
- **Team**: `team_VtbfSzhDgB6OwglLfuPDFcd2`
- **0nmcp.com**: `prj_Ccq53WXdb5CQd4iIBRR0qr4QToge`

### 0nMCP
- **Version**: v2.1.0
- **Tools**: 564 across 26 services
- **Path**: `~/Github/0nMCP/`

---

## Patent Filing Deadlines

| Patent | Provisional Filed | Non-Provisional Due | Status |
|--------|------------------|--------------------:|--------|
| App. 63/968,814 | January 27, 2026 | **January 27, 2027** | Spec decisions inform claims |
| App. 63/990,046 | February 24, 2026 | **February 24, 2027** | Vault Container spec locked |

**The spec decisions locked today become the claims language in non-provisional filings.**

---

*RocketOpp LLC · 0nmcp.com · Patent Pending · Confidential*
*February 27, 2026*
