# .0n File Specification

**Version**: 1.0.0
**Status**: Final
**Date**: 2026-02-27
**Author**: Michael A. Mento Jr., RocketOpp LLC
**Contact**: mike@rocketopp.com
**Repository**: https://github.com/0nork/0n-spec
**License**: CC-BY-4.0 (Specification Text) | MIT (Reference Implementation)

---

**RocketOpp LLC -- Patent Pending -- Confidential**

**Patent References**:
- US Provisional Application No. 63/968,814 (Seal of Truth)
- US Provisional Application No. 63/990,046 (0nVault Container System)

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Conformance](#2-conformance)
3. [Terminology](#3-terminology)
4. [File Format](#4-file-format)
5. [Required Fields](#5-required-fields)
6. [Optional Sections](#6-optional-sections)
7. [Cryptographic Requirements](#7-cryptographic-requirements)
8. [Execution Model](#8-execution-model)
9. [Error Handling](#9-error-handling)
10. [File Merging](#10-file-merging)
11. [Backward Compatibility](#11-backward-compatibility)
12. [Audit Trail](#12-audit-trail)
13. [Schema Versioning](#13-schema-versioning)
14. [Security Considerations](#14-security-considerations)
15. [Examples](#15-examples)
16. [Appendix A: JSON Schema Reference](#appendix-a-json-schema-reference)
17. [Appendix B: Patent Cross-Reference](#appendix-b-patent-cross-reference)
18. [Appendix C: Registered Service Names](#appendix-c-registered-service-names)

---

## 1. Abstract

The `.0n` file format (pronounced "dot-on") is a universal interface contract for AI-powered orchestration systems. A `.0n` file is a self-describing, cryptographically signed JSON document that declares execution logic, service dependencies, credential references, error handling policy, and provenance metadata in a single portable unit. The format serves as the canonical protocol for the 0nMCP ecosystem: every workflow, connection, deployment, encrypted container, and business asset transfer is represented as a `.0n` file. Five patent-pending inventions produce, consume, transform, or verify `.0n` files -- the Three-Level Execution Model (Pipeline, Assembly Line, Radial Burst), JSON Smart Deploy (placeholder resolution and dependency ordering), Seal of Truth (content-addressed integrity verification), the .FED encrypted container format (four-layer AES-256-GCM encryption), and the Business Deed Transfer system (multi-party escrow with X25519 key agreement). The `.0n` format exists to make AI orchestration portable, verifiable, and trustworthy -- so that a file created on one machine, by one user, in one AI platform can be executed, verified, transferred, or audited by any compliant implementation anywhere.

---

## 2. Conformance

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt) and [RFC 8174](https://www.ietf.org/rfc/rfc8174.txt) when, and only when, they appear in ALL CAPITALS, as shown here.

### 2.1 Conformance Levels

This specification defines three conformance levels:

**Level 1 -- Parser**: An implementation that can read, validate, and produce `.0n` files. A Level 1 implementation MUST:
- Parse UTF-8 encoded JSON `.0n` files.
- Validate all 10 required top-level fields against the canonical JSON Schema.
- Reject files missing any required field as a structural error.
- Accept the `.0n` file extension regardless of content type.
- Read the `manifest.type` field to determine file behavior.

**Level 2 -- Runtime**: An implementation that can execute `.0n` files. A Level 2 implementation MUST satisfy all Level 1 requirements and additionally MUST:
- Resolve `{{vault:*}}`, `{{env:*}}`, `{{param:*}}`, and `{{inputs.*}}` template expressions.
- Implement the three execution models (Pipeline, Assembly Line, Radial Burst).
- Enforce the `on_error`, `retry`, and `rollback` policies.
- Verify Ed25519 signatures and SHA-256 content hashes before execution.
- Record execution results in the audit trail format specified in Section 12.

**Level 3 -- Full**: An implementation that supports all specification features. A Level 3 implementation MUST satisfy all Level 2 requirements and additionally MUST:
- Support Seal of Truth verification (Section 6.3).
- Support JSON Smart Deploy (Section 6.4).
- Support .FED encryption and decryption (Section 7.4).
- Support Deed Transfer operations (Section 6.8).
- Support file merging (Section 10).
- Support adapter export to all registered formats (Section 11.2).

### 2.2 Partial Implementations

Implementations that do not satisfy all requirements for a given level MUST NOT claim conformance at that level. An implementation MAY claim partial conformance by explicitly listing which sections it implements.

---

## 3. Terminology

| Term | Definition |
|------|-----------|
| **.0n file** | A JSON document conforming to this specification. Identified by the `.0n` file extension and the presence of all 10 required top-level fields. The atomic unit of the 0nMCP ecosystem. |
| **SWITCH file** | A `.0n` file with `manifest.type` set to `"switch"`. Represents a master orchestration profile that references multiple connections and workflows. The canonical master SWITCH file resides at `~/.0n/0n-setup.0n`. |
| **RUN** | An instance of workflow execution. A RUN begins when a workflow-type `.0n` file enters the execution lifecycle (Section 8.4) and ends when execution completes, fails, or is cancelled. |
| **Pipeline** | The first level of the Three-Level Execution Model. Stages execute strictly sequentially in array order. Each stage completes before the next begins. |
| **Assembly Line** | The second level of the Three-Level Execution Model. Stages execute in dependency order with maximum parallelism. The `depends_on` field determines which stages can run concurrently. |
| **Radial Burst** | The third level of the Three-Level Execution Model. All independent stages fan out simultaneously. Execution converges at dependency points. Maximizes throughput for embarrassingly parallel workloads. |
| **Seal of Truth** | A content-addressed integrity verification mechanism (Patent #63/968,814). Computes a cryptographic hash of file contents and binds it to an Ed25519 signature chain. Provides tamper-evident provenance for regulated domains. |
| **Smart Deploy** | JSON Smart Deploy -- a deployment pipeline that resolves placeholder tokens, orders dependencies, and executes deployment with dry-run and rollback capabilities. |
| **.FED** | The Four-layer Encrypted Document format. A `.0n` file encrypted with AES-256-GCM, organized into four semantic encryption layers. Uses the `.fed` file extension as an optional alias for `.0n` files with `manifest.type: "encrypted"`. |
| **Deed Transfer** | A multi-party escrow and business asset transfer protocol. Packages digital assets (credentials, workflows, configurations) into a `.0nv` vault container and transfers ownership via X25519 ECDH key agreement with Ed25519 signature chains. Lifecycle: CREATE > PACKAGE > ESCROW > ACCEPT > IMPORT > FLIP. |
| **Vault Reference** | A template expression of the form `{{vault:key}}` that resolves to a credential stored in the user's local vault (`~/.0n/connections/`). Vault references are resolved at runtime by the executing environment. The file contains the reference, never the credential value. |
| **Content Hash** | A SHA-256 digest of the file's content at signing time, encoded as a 64-character hexadecimal string. Provides a fast integrity check independent of full signature verification. |
| **Signature** | An Ed25519 digital signature of the file's canonical JSON content (excluding the `signature` field itself), encoded as a 128-character hexadecimal string. Binds the file content to the author's identity. |
| **Provenance Chain** | An ordered sequence of Ed25519 signatures and SHA-256 content hashes recording every modification to a `.0n` file from creation through all subsequent edits, transfers, and verifications. Implemented via the audit trail hash chain (Section 12). |
| **0nMCP Service Catalog** | The registry of 26 external services supported by the 0nMCP orchestrator. Each service has a unique identifier, API endpoints, authentication methods, and tool definitions. See Appendix C for the complete list. |
| **Stage** | A single unit of work within a workflow. Each stage invokes one tool, internal action, or sub-workflow reference. Stages are identified by a unique `id` within the workflow and produce outputs that downstream stages may reference. |

---

## 4. File Format

### 4.1 Encoding

A `.0n` file MUST be encoded in UTF-8 without a byte order mark (BOM).

The canonical serialization format is JSON, as specified by [RFC 8259](https://www.ietf.org/rfc/rfc8259.txt). All `.0n` files MUST be valid JSON when processed by the runtime.

YAML ([YAML 1.2](https://yaml.org/spec/1.2.2/)) is a RECOMMENDED authoring format. YAML `.0n` files MUST be compiled to canonical JSON before validation or execution. The compilation step is a pre-processing phase; validators and runtimes operate exclusively on JSON. The following YAML authoring rules apply:

1. YAML files MUST use the `.0n` extension or a registered subtype extension (Section 4.2). The extensions `.yaml` and `.yml` MUST NOT be used for `.0n` files.
2. The YAML-to-JSON compile step MUST run before validation. The validator sees only JSON.
3. YAML comments are stripped at compile time (JSON has no comment syntax).
4. Multi-document YAML (`---` separator for multiple documents in one file) is NOT SUPPORTED. Each `.0n` file MUST contain exactly one document.
5. YAML strict mode parsing MUST be used to prevent implicit type coercion (e.g., the "Norway problem" where unquoted `NO` is interpreted as boolean `false`).

A YAML `.0n` file and the JSON `.0n` file produced by compiling it are semantically identical documents.

### 4.2 File Extensions

`.0n` is the canonical file extension. The `manifest.type` field inside the file is the authoritative content type declaration -- not the file extension. A spec-compliant parser MUST accept `.0n` regardless of content type and MUST read `manifest.type` to determine behavior.

Subtypes are optional aliases that tooling MAY use for convenience (syntax highlighting, file associations, IDE support). A spec-compliant parser MUST treat subtype files identically to `.0n` files.

| Extension | `manifest.type` | Purpose |
|-----------|----------------|---------|
| `.0n` | any | Universal -- always valid, always accepted |
| `.0nw` | `workflow` | Workflow definitions (RUNs) |
| `.0nc` | `connection` | Service credential references |
| `.0ne` | `environment` | Environment variable configuration |
| `.0nb` | `bundle` | Multi-file bundles |
| `.0nv` | `vault` | Encrypted vault containers |
| `.fed` | `encrypted` | .FED encrypted container (Patent #63/990,046) |
| `.0nd` | `deed` | Deed Transfer package |

A file with a subtype extension whose `manifest.type` does not match the expected type for that extension SHOULD produce a warning but MUST NOT be rejected. The `manifest.type` field is always authoritative.

### 4.3 MIME Type

The official media type for `.0n` files is:

```
application/vnd.0n+json
```

Implementations that serve `.0n` files over HTTP MUST use this media type in the `Content-Type` header. Implementations that accept `.0n` files over HTTP SHOULD accept both `application/vnd.0n+json` and `application/json`.

### 4.4 Size Limits

| Category | Maximum Size | Rationale |
|----------|-------------|-----------|
| Standard `.0n` file | 1 MB | Sufficient for workflows with hundreds of stages, full connection configurations, and extensive metadata. |
| Deed Transfer `.0n` file | 10 MB | Deed Transfer files embed encrypted credential layers, AI brain data, and audit trails. The increased limit accommodates multi-layer vault containers. |
| Single stage `inputs` object | 64 KB | Prevents individual stage payloads from dominating file size. |
| `manifest.description` | 2,000 characters | Human-readable field; longer descriptions belong in external documentation. |
| `manifest.tags` array | 30 items | Practical limit for classification and search indexing. |

Implementations MUST reject files that exceed the applicable size limit. Implementations SHOULD report the exceeded limit category in the error message.

---

## 5. Required Fields

Every `.0n` file MUST contain the following 10 top-level fields. A file missing any of these fields is structurally invalid and MUST be rejected at parse time. No execution, resolution, or cryptographic verification occurs on a structurally invalid file.

### 5.1 `schema_version`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Format** | Semantic Versioning 2.0.0 ([semver.org](https://semver.org)) |
| **Pattern** | `^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$` |
| **Description** | The version of the .0n file specification this file conforms to. |

The `schema_version` field declares which revision of this specification the file was authored against. Validators MUST use this field to select the correct schema for validation. The current version is `"1.0.0"`.

Pre-release identifiers (e.g., `"1.0.0-beta.1"`) are permitted for files authored against draft schema revisions. Build metadata (e.g., `"1.0.0+20260227"`) is permitted and MUST be ignored during version comparison.

```json
"schema_version": "1.0.0"
```

### 5.2 `file_id`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Format** | UUID v4 ([RFC 4122](https://www.ietf.org/rfc/rfc4122.txt)) |
| **Description** | Universally unique identifier for this specific file instance. |

The `file_id` MUST be a freshly generated UUID v4 for every new file. Implementations MUST NOT reuse a `file_id` across copies, forks, or derived files. The `file_id` is used for:

- Deduplication in execution pipelines.
- Audit trail record association.
- Transfer registry replay prevention.
- Cross-referencing in bundles and dependency graphs.

```json
"file_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
```

### 5.3 `created_at`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Format** | ISO 8601 date-time ([RFC 3339](https://www.ietf.org/rfc/rfc3339.txt)) |
| **Description** | Timestamp of initial file creation. |

The `created_at` field records when this file was originally created. It MUST NOT change after initial creation. It MUST include a timezone designator (the `Z` suffix for UTC is RECOMMENDED).

```json
"created_at": "2026-02-27T12:00:00Z"
```

### 5.4 `author`

| Property | Value |
|----------|-------|
| **Type** | `object` |
| **Required sub-fields** | `name`, `email`, `pubkey` |
| **Description** | Identity of the entity that created and signed this file. |

The `author` object binds a human-readable identity to the Ed25519 public key used for signature verification. The `pubkey` field MUST be the hex-encoded Ed25519 public key (32 bytes, 64 hex characters) corresponding to the private key used to produce the `signature` field.

| Sub-field | Type | Constraints | Description |
|-----------|------|------------|-------------|
| `name` | `string` | 1-200 characters | Display name of the author (person, organization, or system agent). |
| `email` | `string` | Valid email format | Contact email for provenance tracking and notification routing. |
| `pubkey` | `string` | 64-character hex (`^[0-9a-fA-F]{64}$`) | Ed25519 public key, hex-encoded. |

```json
"author": {
  "name": "Mike Mento",
  "email": "mike@rocketopp.com",
  "pubkey": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
}
```

### 5.5 `signature`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Format** | 128-character hexadecimal string (64 bytes) |
| **Pattern** | `^[0-9a-fA-F]{128}$` |
| **Description** | Ed25519 signature of the file content. |

The `signature` field contains an Ed25519 signature computed over the canonical JSON serialization of all file content EXCLUDING the `signature` field itself. See Section 7.1 for the complete signing and verification procedures.

```json
"signature": "a1b2c3d4e5f6...128_hex_characters_total"
```

### 5.6 `content_hash`

| Property | Value |
|----------|-------|
| **Type** | `string` |
| **Format** | 64-character hexadecimal string (32 bytes) |
| **Pattern** | `^[0-9a-fA-F]{64}$` |
| **Description** | SHA-256 hash of the file content at signing time. |

The `content_hash` provides a fast integrity check independent of Ed25519 signature verification. It is computed over the same canonical content used for signing (all fields except `signature` and `content_hash` itself). See Section 7.2 for the computation procedure.

```json
"content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
```

### 5.7 `manifest`

| Property | Value |
|----------|-------|
| **Type** | `object` |
| **Required sub-fields** | `type`, `name`, `version` |
| **Description** | File identity and classification metadata. |

The `manifest` determines how the file is interpreted. The `type` field is the primary discriminator; it determines which optional sections (Section 6) are relevant.

| Sub-field | Type | Constraints | Description |
|-----------|------|------------|-------------|
| `type` | `string` | Enum: `workflow`, `connection`, `environment`, `bundle`, `vault`, `encrypted`, `deed`, `switch` | Content type discriminator. |
| `name` | `string` | 1-200 characters | Human-readable name. |
| `description` | `string` | Max 2,000 characters | Extended description (OPTIONAL). |
| `version` | `string` | Semver pattern | Content version (not schema version). |
| `tags` | `array` of `string` | Max 30 items, each 1-50 chars, pattern `^[a-z0-9][a-z0-9_-]*$` | Classification tags (OPTIONAL). |
| `license` | `string` | Max 100 characters, SPDX identifier | License governing redistribution (OPTIONAL). |

**Manifest type definitions:**

| `manifest.type` | Description |
|-----------------|-------------|
| `workflow` | Execution logic with stages, inputs, outputs, and one of three execution models. |
| `connection` | Single-service credential and configuration reference. |
| `environment` | Environment variable declarations with optional vault references. |
| `bundle` | Multi-file package combining workflows, connections, and environments. |
| `vault` | Encrypted credential container using AES-256-GCM. |
| `encrypted` | .FED four-layer encrypted document. |
| `deed` | Business Deed Transfer package for multi-party escrow. |
| `switch` | Master orchestration profile referencing multiple connections and workflows. |

```json
"manifest": {
  "type": "workflow",
  "name": "Invoice and Notify",
  "description": "Create a Stripe invoice and notify the sales team on Slack",
  "version": "1.0.0",
  "tags": ["stripe", "slack", "invoicing", "automation"],
  "license": "MIT"
}
```

### 5.8 `on_error`

| Property | Value |
|----------|-------|
| **Type** | `object` |
| **Required sub-fields** | `action`, `rollback` |
| **Description** | MANDATORY global error handling policy. |

Every `.0n` file MUST declare its error handling behavior. A file missing the `on_error` section is structurally invalid and MUST be rejected at parse time. This is a deliberate design decision: implicit error handling is the source of most production incidents, and explicit declaration prevents unexpected behavior.

| Sub-field | Type | Constraints | Description |
|-----------|------|------------|-------------|
| `action` | `string` | Enum: `abort`, `skip`, `retry`, `fallback` | Default error action when a stage fails. |
| `rollback` | `boolean` | Required | Whether to trigger rollback on abort. |
| `notify` | `string` | Max 500 characters | Notification target for errors (OPTIONAL). |
| `log_level` | `string` | Enum: `error`, `warn`, `info`, `debug`. Default: `error` | Minimum log level for error recording (OPTIONAL). |

**Action definitions:**

| Action | Behavior |
|--------|----------|
| `abort` | Halt execution immediately. If `rollback` is `true`, trigger the rollback strategy. |
| `skip` | Log the error and continue to the next stage. The failed stage is marked as `failed` in execution records. |
| `retry` | Retry the failed stage according to the `retry` policy (Section 5.9). |
| `fallback` | Execute the stage's `fallback_action` if defined. If no `fallback_action` exists, fall back to `abort`. |

```json
"on_error": {
  "action": "abort",
  "rollback": true,
  "notify": "slack:#ops-alerts",
  "log_level": "error"
}
```

### 5.9 `retry`

| Property | Value |
|----------|-------|
| **Type** | `object` |
| **Required sub-fields** | `max_attempts`, `backoff`, `initial_delay_ms` |
| **Description** | MANDATORY global retry policy. |

Every `.0n` file MUST declare its retry behavior. A file missing the `retry` section is structurally invalid and MUST be rejected at parse time. Individual stages MAY override this policy with a `retry_override` block.

| Sub-field | Type | Constraints | Description |
|-----------|------|------------|-------------|
| `max_attempts` | `integer` | 1-10 | Maximum retry attempts. Attempt 1 is the initial execution; `max_attempts=3` means up to 2 retries. |
| `backoff` | `string` | Enum: `exponential`, `linear`, `fixed` | Backoff strategy between attempts. |
| `initial_delay_ms` | `integer` | 50-60,000 | Base delay in milliseconds before the first retry. |
| `max_delay_ms` | `integer` | 100-300,000. Default: 30,000 | Delay cap (OPTIONAL). Prevents exponential backoff from producing unreasonable waits. |
| `timeout_ms` | `integer` | 1,000-600,000. Default: 60,000 | Total time budget across all retry attempts for one stage (OPTIONAL). |
| `jitter` | `boolean` | Default: `false` | Add random jitter (0-25% of calculated delay) to prevent thundering herd (OPTIONAL). |
| `retry_on` | `array` of `string` | Unique items | Restrict retries to specific error codes or HTTP status patterns (e.g., `"429"`, `"5xx"`, `"ECONNRESET"`, `"TIMEOUT"`). If omitted, all errors trigger retries (OPTIONAL). |

**Backoff calculation:**

| Strategy | Delay for attempt N | Example (initial=1000ms) |
|----------|-------------------|--------------------------|
| `exponential` | `initial_delay_ms * 2^(N-1)` | 1000, 2000, 4000, 8000... |
| `linear` | `initial_delay_ms * N` | 1000, 2000, 3000, 4000... |
| `fixed` | `initial_delay_ms` | 1000, 1000, 1000, 1000... |

All calculated delays are capped at `max_delay_ms`.

```json
"retry": {
  "max_attempts": 3,
  "backoff": "exponential",
  "initial_delay_ms": 1000,
  "max_delay_ms": 30000,
  "jitter": true,
  "retry_on": ["429", "5xx", "ECONNRESET"]
}
```

### 5.10 `rollback`

| Property | Value |
|----------|-------|
| **Type** | `object` |
| **Required sub-fields** | `enabled`, `strategy` |
| **Description** | MANDATORY rollback configuration. |

Every `.0n` file MUST declare its rollback behavior. A file missing the `rollback` section is structurally invalid and MUST be rejected at parse time. The `rollback` section defines HOW to reverse completed stages; the `on_error.rollback` field controls WHETHER to trigger it.

| Sub-field | Type | Constraints | Description |
|-----------|------|------------|-------------|
| `enabled` | `boolean` | Required | Master switch. When `false`, no rollback occurs even if `on_error.rollback` is `true`. |
| `strategy` | `string` | Enum: `reverse_order`, `selective`, `manual` | Rollback execution strategy. |
| `preserve_logs` | `boolean` | Default: `true` | Preserve execution logs during rollback (OPTIONAL). |
| `timeout_ms` | `integer` | 1,000-600,000. Default: 120,000 | Maximum rollback time (OPTIONAL). |
| `notify_on_rollback` | `string` | Max 500 characters | Rollback-specific notification target (OPTIONAL). |
| `checkpoints` | `boolean` | Default: `false` | Capture state snapshots after each stage for partial rollback (OPTIONAL). |

**Strategy definitions:**

| Strategy | Behavior |
|----------|----------|
| `reverse_order` | Undo completed stages in the reverse order they executed. Safest default. |
| `selective` | Only roll back stages explicitly marked with `rollback_eligible: true` in their metadata. |
| `manual` | Log rollback instructions but do not execute automatically. For human review. |

```json
"rollback": {
  "enabled": true,
  "strategy": "reverse_order",
  "preserve_logs": true,
  "timeout_ms": 120000,
  "checkpoints": false
}
```

---

## 6. Optional Sections

Optional sections extend the file's capabilities based on its `manifest.type`. An implementation MUST NOT require optional sections to be present for structural validation, but MAY require specific optional sections when a file's `manifest.type` implies their necessity (e.g., a `workflow` type file without a `workflow` section is structurally valid but functionally empty).

### 6.1 `services`

**Type**: `array` of service declaration objects.

Declares external service dependencies this file requires at runtime. Each entry names a service from the 0nMCP service catalog (Appendix C) and references credentials via vault syntax.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | YES | Service identifier from the 0nMCP catalog. Case-sensitive. |
| `auth_ref` | `string` | YES | Vault reference: `{{vault:service_name}}`. Pattern: `^\{\{vault:[a-zA-Z0-9_.-]+\}\}$`. |
| `scopes` | `array` of `string` | NO | Permission scopes required (e.g., `"contacts.read"`, `"payments.write"`). |
| `required` | `boolean` | NO | Whether the connection is mandatory. Default: `true`. |

```json
"services": [
  {
    "name": "stripe",
    "auth_ref": "{{vault:stripe}}",
    "scopes": ["payments.write", "customers.read"],
    "required": true
  },
  {
    "name": "slack",
    "auth_ref": "{{vault:slack}}",
    "scopes": ["chat.write"],
    "required": false
  }
]
```

### 6.2 `workflow`

**Type**: `object`.

Defines execution logic implementing the Three-Level Execution Model (Patent Pending). Relevant when `manifest.type` is `"workflow"` or `"switch"`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `execution_model` | `string` | YES | Enum: `pipeline`, `assembly_line`, `radial_burst`. |
| `stages` | `array` | YES | Ordered list of execution stages. Minimum 1 item. |
| `timeout_ms` | `integer` | NO | Workflow-level timeout. Range: 1,000-3,600,000ms. Default: 300,000 (5 min). |
| `max_parallel` | `integer` | NO | Max concurrent stages. Range: 1-100. Default: 10. |

**Stage object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | YES | Unique stage ID. Pattern: `^[a-z][a-z0-9_]{0,63}$`. |
| `name` | `string` | YES | Human-readable label. 1-200 characters. |
| `action` | `string` | YES | Tool name, internal action, or sub-workflow reference. 1-300 characters. |
| `service` | `string` | NO | Service from the `services` array. Omit for internal actions. |
| `inputs` | `object` | NO | Input parameters with template expression support. |
| `outputs` | `object` | NO | Output mapping for downstream references. |
| `depends_on` | `array` of `string` | NO | Stage IDs that must complete first. Required for `assembly_line` and `radial_burst`. |
| `condition` | `string` | NO | Boolean expression; if `false`, stage is skipped. |
| `on_error` | `string` | NO | Stage-level override. Enum: `abort`, `skip`, `retry`, `fallback`. |
| `fallback_action` | `string` | NO | Alternative action if `on_error` is `fallback`. |
| `timeout_ms` | `integer` | NO | Stage-level timeout. Range: 100-600,000ms. |
| `retry_override` | `object` | NO | Stage-specific retry policy (same schema as top-level `retry`). |
| `metadata` | `object` | NO | Arbitrary metadata; not processed by runtime. |

```json
"workflow": {
  "execution_model": "pipeline",
  "timeout_ms": 300000,
  "stages": [
    {
      "id": "find_customer",
      "name": "Find Customer in Stripe",
      "action": "stripe_search_customers",
      "service": "stripe",
      "inputs": {
        "query": "email:'{{inputs.customer_email}}'"
      },
      "outputs": {
        "customer_id": "{{result.data[0].id}}"
      }
    },
    {
      "id": "create_invoice",
      "name": "Create Invoice",
      "action": "stripe_create_invoice",
      "service": "stripe",
      "inputs": {
        "customer": "{{step.find_customer.output.customer_id}}",
        "amount": "{{inputs.amount * 100}}"
      },
      "depends_on": ["find_customer"],
      "condition": "{{step.find_customer.output.customer_id != null}}"
    }
  ]
}
```

### 6.3 `verify`

**Type**: `object`.

Seal of Truth verification configuration (Patent #63/968,814). When present, the runtime MUST verify the `content_hash` against the Seal of Truth before execution.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tier` | `string` | NO | Enum: `gold`, `silver`, `bronze`. Trust tier for verification. |
| `domain` | `string` | NO | Enum: `medical`, `legal`, `financial`, `general`, `technical`. |
| `source_whitelist` | `array` of URI strings | NO | Trusted source URIs. Runtime MUST reject requests to unlisted URIs. |
| `callback_url` | `string` (URI) | NO | Webhook for verification result notifications. |
| `require_signature_chain` | `boolean` | NO | Default: `false`. When `true`, verify unbroken Ed25519 chain from author through all modifiers. |

**Trust tier definitions:**

| Tier | Requirements |
|------|-------------|
| `gold` | Cryptographically signed by a known authority with full audit trail. Signature chain verified. External anchor verification required. |
| `silver` | Signed with verified author identity. Audit trail present. Signature chain RECOMMENDED. |
| `bronze` | Self-signed with content hash verification only. Minimum viable integrity check. |

**Domain enforcement:**

| Domain | Minimum Required Tier |
|--------|----------------------|
| `medical` | `gold` |
| `legal` | `gold` |
| `financial` | `gold` |
| `general` | `bronze` |
| `technical` | `bronze` |

```json
"verify": {
  "tier": "gold",
  "domain": "financial",
  "source_whitelist": ["https://api.stripe.com", "https://services.leadconnectorhq.com"],
  "require_signature_chain": true
}
```

### 6.4 `deploy`

**Type**: `object`.

JSON Smart Deploy configuration (Patent Pending). Controls placeholder resolution, dependency ordering, and rollback targets for automated deployment.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `placeholders` | `object` | NO | Map of `{{token}}` patterns to descriptions. |
| `dependencies` | `array` of `string` | NO | Ordered `file_id` or path list; deployed in sequence. |
| `dry_run` | `boolean` | NO | Default: `false`. Simulate without making changes. |
| `rollback_targets` | `array` of `string` | NO | Resource IDs to reverse on failure. |
| `environment` | `string` | NO | Enum: `production`, `staging`, `development`, `sandbox`. Default: `production`. |
| `auto_verify` | `boolean` | NO | Default: `true`. Run Seal of Truth verification before deployment. |

```json
"deploy": {
  "placeholders": {
    "{{app_name}}": "Application display name",
    "{{api_base}}": "Base URL for the API"
  },
  "dependencies": ["a1b2c3d4-connection-file-id", "e5f6a7b8-environment-file-id"],
  "dry_run": false,
  "environment": "production",
  "auto_verify": true
}
```

### 6.5 `vault`

**Type**: `object`.

Credential reference declarations. Enumerates credential dependencies and optional encryption metadata.

**Sub-fields:**

**`vault.references`** (`array`): Each reference declares a vault key and the service it maps to.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | `string` | YES | Reference name. Pattern: `^[a-z][a-z0-9_.-]*$`. Used as `{{vault:<key>}}`. |
| `service` | `string` | YES | Service this credential authenticates against. |
| `required` | `boolean` | NO | Default: `true`. Abort if unresolvable. |
| `scopes` | `array` of `string` | NO | Required permission scopes. |
| `fallback_key` | `string` | NO | Alternative vault key for graceful degradation. |

**`vault.encryption`** (`object`): Encryption metadata for vault container files.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `algorithm` | `string` | NO | Enum: `AES-256-GCM`, `AES-256-CBC`. Default: `AES-256-GCM`. |
| `kdf` | `string` | NO | Enum: `PBKDF2-SHA512`, `Argon2id`. Default: `PBKDF2-SHA512`. |
| `kdf_iterations` | `integer` | NO | Range: 10,000-1,000,000. Default: 100,000. |
| `machine_bound` | `boolean` | NO | Default: `false`. Bind encryption to hardware fingerprint. |

```json
"vault": {
  "references": [
    {
      "key": "stripe",
      "service": "stripe",
      "required": true,
      "scopes": ["payments.write"]
    },
    {
      "key": "crm",
      "service": "crm",
      "required": true,
      "fallback_key": "crm.sandbox"
    }
  ],
  "encryption": {
    "algorithm": "AES-256-GCM",
    "kdf": "PBKDF2-SHA512",
    "kdf_iterations": 100000,
    "machine_bound": false
  }
}
```

### 6.6 `adapters`

**Type**: `object`.

Export format mappings for cross-platform compatibility.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `formats` | `array` of `string` | NO | Supported export formats (Section 11.2). |
| `overrides` | `object` | NO | Per-format field mapping overrides. Keys are format names; values are mapping objects. |
| `default_format` | `string` | NO | Default format when none specified. |

```json
"adapters": {
  "formats": ["claude_desktop", "cursor", "openai"],
  "default_format": "claude_desktop",
  "overrides": {
    "openai": {
      "manifest.name": "display_name",
      "workflow.stages": "steps"
    }
  }
}
```

### 6.7 `federation`

**Type**: `object`.

MCPFed registration and discovery configuration (Patent Pending).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `register` | `boolean` | NO | Default: `false`. Register capabilities with the federation mesh. |
| `capabilities` | `array` of `string` | NO | Capability identifiers. Reverse-domain notation RECOMMENDED. |
| `discovery` | `object` | NO | Mesh endpoint URLs, auth tokens, heartbeat config. Structure varies by protocol version. |
| `trust_level` | `string` | NO | Enum: `public`, `authenticated`, `private`. Default: `authenticated`. |
| `ttl_seconds` | `integer` | NO | Range: 60-86,400. Default: 3,600. Registration expiry time. |

```json
"federation": {
  "register": true,
  "capabilities": [
    "com.0nork.crm.contacts.create",
    "com.0nork.stripe.invoices.create"
  ],
  "trust_level": "authenticated",
  "ttl_seconds": 3600
}
```

### 6.8 `deed`

**Type**: `object`.

Business Deed Transfer configuration (Patent Pending, 0nMCP v2.1.0). Governs the packaging, escrow, and transfer of digital business assets.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `layers` | `array` of `string` | NO | Enum values: `workflows`, `credentials`, `env_vars`, `mcp_configs`, `site_profiles`, `ai_brain`, `audit_trail`. |
| `parties` | `array` (max 8 items) | NO | Parties involved in the transfer. |
| `registry_endpoint` | `string` (URI) | NO | Transfer registry URL for replay prevention. |
| `seal_verification` | `boolean` | NO | Default: `true`. Verify SHA3-256 Seal of Truth on operations. |
| `transfer_id` | `string` (UUID) | NO | Unique transfer transaction ID. Populated during CREATE. |
| `chain_of_custody` | `array` | NO | Append-only custody event records. |

**Party object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | YES | Party identifier (email, org name, or opaque ID). 1-200 characters. |
| `pubkey` | `string` | YES | X25519 or Ed25519 public key, hex-encoded (64 characters). |
| `role` | `string` | YES | Enum: `grantor`, `grantee`, `escrow_agent`, `witness`. |
| `layer_access` | `array` of `string` | NO | Per-party access matrix defining decryptable layers. |

**Role definitions:**

| Role | Description |
|------|-------------|
| `grantor` | Current owner transferring assets. |
| `grantee` | Recipient of the transfer. |
| `escrow_agent` | Neutral third party holding assets during transfer. Typically has access to all layers. |
| `witness` | Observer with verification rights but not decryption access. Typically accesses only `audit_trail`. |

**Chain of custody event:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | `string` (ISO 8601) | YES | When the event occurred. |
| `action` | `string` | YES | Enum: `created`, `packaged`, `escrowed`, `accepted`, `imported`, `revoked`. |
| `actor` | `string` | YES | Identifier of the acting party. |
| `signature` | `string` | NO | Ed25519 signature of this event by the actor. 128-character hex. |
| `notes` | `string` | NO | Human-readable notes. Max 1,000 characters. |

**Deed Transfer Semantic Layers:**

| Layer | Contents | Encryption |
|-------|----------|-----------|
| `workflows` | .0n workflow files, automation logic | AES-256-GCM |
| `credentials` | API keys, tokens, OAuth credentials | AES-256-GCM + Argon2id double-encryption |
| `env_vars` | Environment variable sets | AES-256-GCM |
| `mcp_configs` | MCP server configurations, tool registrations | AES-256-GCM |
| `site_profiles` | Website configurations, DNS records, CMS settings | AES-256-GCM |
| `ai_brain` | AI model configurations, prompt libraries, fine-tuning data | AES-256-GCM |
| `audit_trail` | Historical execution logs, chain of custody records | AES-256-GCM |

```json
"deed": {
  "layers": ["workflows", "credentials", "env_vars", "mcp_configs"],
  "parties": [
    {
      "id": "seller@business.com",
      "pubkey": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
      "role": "grantor",
      "layer_access": ["workflows", "credentials", "env_vars", "mcp_configs"]
    },
    {
      "id": "buyer@newowner.com",
      "pubkey": "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
      "role": "grantee",
      "layer_access": ["workflows", "credentials", "env_vars", "mcp_configs"]
    }
  ],
  "registry_endpoint": "https://0nmcp.com/api/registry/transfers",
  "seal_verification": true,
  "transfer_id": "f1e2d3c4-b5a6-4789-0fed-cba987654321",
  "chain_of_custody": [
    {
      "timestamp": "2026-02-27T12:00:00Z",
      "action": "created",
      "actor": "seller@business.com",
      "signature": "a1b2c3d4...128_hex_chars",
      "notes": "Initial deed creation for business sale"
    }
  ]
}
```

---

## 7. Cryptographic Requirements

### 7.1 Ed25519 Signatures

Ed25519 is the REQUIRED digital signature algorithm for all `.0n` files. Implementations MUST use Ed25519 as specified in [RFC 8032](https://www.ietf.org/rfc/rfc8032.txt).

#### 7.1.1 Key Generation

Ed25519 keypairs MUST be generated client-side. The private key MUST NOT leave the user's device at any time.

- **Browser environments**: Use the Web Crypto API (`crypto.subtle.generateKey` with `Ed25519`).
- **Node.js environments**: Use `tweetnacl` (`nacl.sign.keyPair()`) or the built-in `crypto.generateKeyPairSync('ed25519')`.
- **Key storage**: The private key SHOULD be encrypted with the user's passphrase and stored in the local 0nVault using AES-256-GCM + PBKDF2-SHA512 (100,000 iterations).
- **Public key registration**: The public key MAY be uploaded to a platform registry for signature verification by third parties.
- **Key rotation**: A new keypair is generated. The old public key is archived (not deleted). Existing signatures remain valid -- they reference the key used at signing time. New files use the new key.

#### 7.1.2 Signing Process

1. **Construct the signable content**: Create a copy of the complete `.0n` file object with the `signature` and `content_hash` fields removed (or set to empty strings, then removed).
2. **Canonicalize**: Serialize the signable content to JSON using canonical serialization:
   - Keys sorted alphabetically at every nesting level.
   - No trailing commas.
   - No whitespace between tokens (compact form).
   - Unicode characters escaped as `\uXXXX` only when required by RFC 8259.
3. **Encode**: Convert the canonical JSON string to a UTF-8 byte array.
4. **Sign**: Compute `Ed25519.sign(utf8_bytes, private_key)`.
5. **Encode signature**: Convert the 64-byte signature to a 128-character lowercase hexadecimal string.
6. **Set fields**: Write the signature to the `signature` field. Compute the SHA-256 hash (Section 7.2) and write it to the `content_hash` field.

#### 7.1.3 Verification Process

1. Extract the `signature` and `content_hash` values from the file.
2. Construct the signable content (same procedure as step 1 of signing).
3. Canonicalize and encode (same procedure as steps 2-3 of signing).
4. Verify: `Ed25519.verify(utf8_bytes, signature_bytes, author.pubkey_bytes)`.
5. If verification fails, the file MUST be rejected. No execution occurs.
6. Optionally, recompute the SHA-256 hash and compare to `content_hash` as a fast integrity check.

### 7.2 SHA-256 Content Hashing

SHA-256 provides a fast integrity check independent of Ed25519 signature verification.

#### 7.2.1 Computation

1. **Construct the hashable content**: Create a copy of the complete `.0n` file object with the `signature` and `content_hash` fields removed.
2. **Canonicalize**: Same canonical JSON serialization as Section 7.1.2.
3. **Hash**: Compute `SHA-256(canonical_json_bytes)`.
4. **Encode**: Convert the 32-byte hash to a 64-character lowercase hexadecimal string.

The hashable content for `content_hash` is identical to the signable content for `signature`. This means a single canonicalization operation can serve both purposes.

#### 7.2.2 Included Fields

All top-level fields EXCEPT `signature` and `content_hash` are included in the hash computation. This explicitly includes:

- `schema_version`, `file_id`, `created_at`, `updated_at`, `author`, `manifest`
- `on_error`, `retry`, `rollback`
- All optional sections present in the file (`services`, `workflow`, `verify`, `deploy`, `vault`, `adapters`, `federation`, `deed`, `inputs`, `outputs`, `environment`, `connection`, `bundle`, `metadata`)

### 7.3 Vault References

Vault references follow the syntax `{{vault:key}}` and are resolved at runtime by the executing environment.

#### 7.3.1 Reference Syntax

| Pattern | Resolution Source | Example |
|---------|------------------|---------|
| `{{vault:service_name}}` | User's local vault at `~/.0n/connections/` | `{{vault:stripe}}` |
| `{{vault:service_name:env}}` | Vault credential with environment qualifier | `{{vault:stripe:live}}` |
| `{{env:VARIABLE_NAME}}` | Environment variable | `{{env:STRIPE_SECRET_KEY}}` |
| `{{param:parameter_name}}` | Runtime parameter passed at execution time | `{{param:api_key}}` |
| `{{inputs.field_name}}` | File input declaration | `{{inputs.customer_email}}` |

#### 7.3.2 Resolution Hierarchy

When multiple resolution sources could satisfy a reference, the runtime MUST resolve in this order (highest priority first):

1. `{{system.*}}` -- System-level built-ins (`now`, `uuid`, `file_id`).
2. `{{launch.*}}` -- Launch-time parameters provided by the invoking context.
3. `{{inputs.*}}` -- Declared inputs with defaults from the file's `inputs` section.
4. `{{step.<stage_id>.output.*}}` -- Outputs from previously completed stages.
5. `{{vault:*}}` -- Vault credential lookups.
6. `{{env:*}}` -- Environment variable lookups.
7. `{{param:*}}` -- Runtime parameters.

If a reference cannot be resolved by any source, the behavior depends on context:
- In a `required: true` service declaration or input: the runtime MUST abort with a Resolution Error (Section 9.1).
- In a `required: false` service declaration: the runtime MAY continue with degraded functionality.

#### 7.3.3 Security Constraints

- Vault references MUST NOT appear in the `content_hash` or `signature` fields.
- Resolved credential values MUST NOT be written to execution logs, error messages, or audit trail `metadata` fields.
- Resolved credential values MUST NOT be included in the canonical JSON used for signing or hashing.

### 7.4 .FED Encryption

The .FED (Four-layer Encrypted Document) format encrypts `.0n` file payloads using AES-256-GCM with per-layer encryption keys. This section provides an overview; the complete specification is defined in Patent Application #63/990,046.

**Encryption layers:**

| Layer | Purpose | Key Derivation |
|-------|---------|---------------|
| Layer 1 (Transport) | Protects file in transit | AES-256-GCM with ephemeral key |
| Layer 2 (Storage) | Protects file at rest | AES-256-GCM with passphrase-derived key (PBKDF2-SHA512) |
| Layer 3 (Credential) | Double-protects sensitive credentials | AES-256-GCM with Argon2id-derived key |
| Layer 4 (Integrity) | Binds all layers to content hash | HMAC-SHA256 over encrypted layers |

**Properties:**
- Each layer uses a unique initialization vector (IV) of 12 random bytes.
- Each layer uses a unique salt of 16 random bytes for key derivation.
- The authentication tag from AES-256-GCM is stored alongside each layer's ciphertext.
- Layer 3 (Credential) uses Argon2id with parameters: memory=65536 KB, iterations=3, parallelism=4.
- The outermost integrity layer enables tamper detection without decryption.

Implementations that claim Level 3 conformance MUST support .FED encryption and decryption. Implementations at Level 1 or Level 2 MAY treat `.fed` files as opaque binary payloads.

### 7.5 Deed Transfer Cryptography

Deed Transfer uses multi-party cryptography to enable secure business asset transfers. This section provides an overview; the complete specification is defined in Patent Application #63/990,046.

**Key agreement**: X25519 Elliptic Curve Diffie-Hellman (ECDH) is used for multi-party key agreement. Each party generates an X25519 keypair. Shared secrets are computed pairwise between parties, enabling per-layer access control.

**Credential encryption**: The `credentials` layer uses Argon2id double-encryption:
1. First encryption: AES-256-GCM with the container's master key.
2. Second encryption: AES-256-GCM with an Argon2id-derived key specific to the credential layer.

**Signature chains**: Each chain-of-custody event in `deed.chain_of_custody` is signed with the acting party's Ed25519 key. The runtime MUST verify the complete signature chain before accepting a deed transfer.

**Seal of Truth computation** (for Deed Transfer):
```
SHA3-256(transfer_id || timestamp || actor_pubkey || SHA3-256(concat(layer_ciphertexts)))
```

**Replay prevention**: Each `transfer_id` is registered with the transfer registry. The registry MUST reject duplicate `transfer_id` values. The Seal of Truth hash is stored alongside the `transfer_id` for independent verification.

**Party limits**: A single deed transfer supports up to 8 parties. This limit exists to bound the complexity of pairwise key agreement computations and access matrix validation.

---

## 8. Execution Model

The `.0n` specification defines three execution models, collectively known as the Three-Level Execution Model (Patent Pending). The `workflow.execution_model` field selects which model governs stage orchestration.

### 8.1 Pipeline

**Sequential execution, stage-by-stage.**

In Pipeline mode, stages execute strictly in array order. Each stage completes (success or handled failure) before the next stage begins. The `depends_on` field is ignored in Pipeline mode; array position determines sequence.

**Properties:**
- Stages are executed in the order they appear in the `workflow.stages` array.
- Only one stage runs at any time.
- A stage failure triggers the `on_error` policy. If the action is `abort`, no subsequent stages execute.
- If a stage's `condition` evaluates to `false`, the stage is skipped and execution advances to the next stage.
- `workflow.max_parallel` is ignored (effectively 1).

**Use cases:** Simple linear workflows, sequential API calls where each call depends on the previous result, step-by-step setup procedures.

### 8.2 Assembly Line

**Parallel execution with dependency resolution.**

In Assembly Line mode, the runtime analyzes the `depends_on` fields to construct a directed acyclic graph (DAG) of stage dependencies. Stages with no unresolved dependencies are eligible to execute concurrently, up to the `workflow.max_parallel` limit.

**Properties:**
- The runtime MUST construct a DAG from `depends_on` declarations before execution begins.
- The runtime MUST detect cycles in the DAG and reject the file with a Structural Error if a cycle exists.
- Stages with empty or absent `depends_on` are eligible to execute immediately.
- As stages complete, downstream stages whose dependencies are all resolved become eligible.
- The `workflow.max_parallel` field caps the number of concurrently executing stages.
- If a stage fails and `on_error.action` is `abort`, all currently executing stages are cancelled and no new stages are started.

**Use cases:** Multi-service orchestrations where some calls are independent (e.g., creating a contact in the CRM while simultaneously sending a Slack notification), complex pipelines with branching and convergence.

### 8.3 Radial Burst

**Fan-out parallel execution.**

Radial Burst mode is an optimized variant of Assembly Line designed for maximum parallelism. All stages without dependencies fan out simultaneously. Execution converges at stages with `depends_on` declarations.

**Properties:**
- All root stages (no `depends_on`) begin execution simultaneously at time zero.
- The `workflow.max_parallel` field caps total concurrency. If there are more root stages than `max_parallel`, excess stages queue.
- Convergence points (stages with `depends_on`) wait for ALL dependencies, then execute.
- Multiple convergence waves are supported: after the first convergence, newly eligible stages fan out again.
- If any stage in a fan-out group fails with `on_error.action` set to `abort`, the entire burst is cancelled.

**Use cases:** Batch operations (e.g., sending notifications to multiple channels simultaneously), data aggregation from multiple sources, performance-critical workflows where latency is minimized by maximizing concurrency.

### 8.4 Execution Lifecycle

Every `.0n` file execution follows a five-phase lifecycle regardless of execution model:

```
PARSE --> VALIDATE --> RESOLVE --> EXECUTE --> REPORT
```

**Phase 1 -- PARSE:**
- Read the file (JSON or compile from YAML).
- Verify structural integrity: all 10 required fields present.
- Determine `manifest.type` and select applicable schema sections.
- If any structural error is detected, REJECT the file. No further phases execute.

**Phase 2 -- VALIDATE:**
- Verify Ed25519 signature against `author.pubkey`.
- Verify `content_hash` against recomputed SHA-256.
- Validate all field values against type constraints, patterns, and ranges.
- If the `verify` section is present, perform Seal of Truth verification.
- If any validation error is detected, REJECT the file. No further phases execute.

**Phase 3 -- RESOLVE:**
- Resolve all `{{vault:*}}` references against the local vault.
- Resolve all `{{env:*}}` references against environment variables.
- Resolve all `{{param:*}}` references against runtime parameters.
- Validate that all `required: true` services and inputs have been resolved.
- If any required reference cannot be resolved, ABORT with a Resolution Error.

**Phase 4 -- EXECUTE:**
- Construct the execution graph based on `workflow.execution_model`.
- Execute stages according to the selected model (Pipeline, Assembly Line, or Radial Burst).
- For each stage: resolve `{{inputs.*}}` and `{{step.*}}` expressions, invoke the action, capture outputs.
- Handle errors according to `on_error`, `retry`, and `rollback` policies.
- Record execution progress in the audit trail.

**Phase 5 -- REPORT:**
- Compile execution results: status, timing, stage outcomes, outputs.
- Write the execution record to `~/.0n/history/` as a JSONL entry.
- Fire any configured notifications (`on_error.notify`, `rollback.notify_on_rollback`).
- Return results to the invoking context.

---

## 9. Error Handling

### 9.1 Error Categories

The `.0n` specification defines four error categories:

| Category | Code | Description | Examples |
|----------|------|-------------|----------|
| **Structural** | `E1xx` | File format violations detected at parse time. | Missing required field, invalid JSON, type mismatch, regex pattern violation. |
| **Resolution** | `E2xx` | Template expression or reference failures detected during the RESOLVE phase. | Unresolvable vault reference, missing environment variable, undefined input. |
| **Integration** | `E3xx` | External service failures detected during the EXECUTE phase. | API timeout, rate limit (HTTP 429), authentication failure (HTTP 401/403), service unavailable (HTTP 503). |
| **Cryptographic** | `E4xx` | Signature, hash, or encryption failures detected during VALIDATE or EXECUTE. | Invalid Ed25519 signature, content hash mismatch, Seal of Truth verification failure, decryption error. |

### 9.2 Error Behavior Matrix

The following matrix defines the behavior for each error category combined with each `on_error.action`:

| | `abort` | `skip` | `retry` | `fallback` |
|---|---------|--------|---------|------------|
| **Structural (E1xx)** | REJECT file. No execution. | NOT APPLICABLE -- structural errors always reject. | NOT APPLICABLE -- structural errors always reject. | NOT APPLICABLE -- structural errors always reject. |
| **Resolution (E2xx)** | Halt execution. Trigger rollback if enabled. | Log error. Mark affected stage as `failed`. Continue to next stage. | Re-attempt resolution up to `max_attempts`. If all attempts fail, abort. | Attempt fallback action. If fallback also fails to resolve, abort. |
| **Integration (E3xx)** | Halt execution. Trigger rollback if enabled. | Log error. Mark stage as `failed`. Continue. | Retry with backoff per retry policy. If exhausted, apply abort behavior. | Execute fallback action. If fallback also fails, apply abort behavior. |
| **Cryptographic (E4xx)** | REJECT file. No execution. | NOT APPLICABLE -- cryptographic errors always reject. | NOT APPLICABLE -- cryptographic errors are not retryable. | NOT APPLICABLE -- cryptographic errors always reject. |

**Key rules:**
- Structural errors (E1xx) ALWAYS reject the file regardless of `on_error.action`.
- Cryptographic errors (E4xx) ALWAYS reject the file regardless of `on_error.action`.
- Only Resolution (E2xx) and Integration (E3xx) errors respect the `on_error.action` setting.
- The `skip` action on E1xx and E4xx is explicitly NOT APPLICABLE because these errors indicate the file itself is untrustworthy.

### 9.3 AI Auto-Fix Rules

Implementations with AI capabilities (e.g., the 0nMCP orchestrator) MAY offer automatic error correction for certain error categories.

| Error Category | Auto-Fix Allowed | Rationale |
|---------------|-----------------|-----------|
| **Structural (E1xx)** | YES, with user confirmation | The AI MAY suggest corrections (e.g., adding a missing `on_error` block). The corrected file MUST be re-validated and re-signed before execution. The user MUST confirm the fix. |
| **Resolution (E2xx)** | YES, for non-sensitive references | The AI MAY suggest alternative references or prompt the user for missing values. Vault references to credentials MUST NOT be auto-resolved -- the user MUST provide credential values explicitly. |
| **Integration (E3xx)** | YES, limited | The AI MAY adjust parameters (e.g., correct a malformed API request) and retry. The AI MUST NOT modify credentials or authentication headers. |
| **Cryptographic (E4xx)** | NO | Cryptographic errors indicate tampering or key mismatch. The AI MUST NOT attempt to fix these. The file MUST be re-signed by the author with a valid private key. |

---

## 10. File Merging

When two or more `.0n` files need to be combined (e.g., merging a connection file into a workflow, combining workflows into a bundle), the following merge rules apply.

### 10.1 Additive Merges

Additive merges are auto-resolvable without user intervention.

| Scenario | Rule |
|----------|------|
| Adding a new stage to a workflow | Append to `workflow.stages` array. Assign a unique `id`. No conflicts possible. |
| Adding a new service declaration | Append to `services` array. No conflicts if `name` is unique. |
| Adding new input/output declarations | Merge into `inputs`/`outputs` objects. No conflicts if keys are unique. |
| Adding new metadata keys | Merge into `metadata` object. No conflicts if keys are unique. |
| Adding new tags | Append to `manifest.tags` array. Deduplicate. |

### 10.2 Conflicting Merges

Conflicting merges are resolved by deterministic rules.

| Scenario | Resolution Rule |
|----------|----------------|
| Same `manifest.name` | Keep the value from the file with the more recent `created_at` timestamp. |
| Same stage `id` in both files | CONFLICT. Rename the stage from the second file by appending `_merged` suffix. |
| Conflicting `on_error.action` | Use the stricter action: `abort` > `retry` > `fallback` > `skip`. |
| Conflicting `retry.max_attempts` | Use the higher value. |
| Different `workflow.execution_model` | CONFLICT. Escalate to user resolution (Section 10.3). |
| Different `schema_version` | Use the higher version. The merged file MUST be re-validated against the higher version's schema. |

### 10.3 Ambiguous Merges

Ambiguous merges require user intervention.

| Scenario | Required User Decision |
|----------|----------------------|
| Different `workflow.execution_model` | User MUST select the desired execution model for the merged file. |
| Conflicting stage `condition` expressions | User MUST resolve the logical conflict. |
| Conflicting `verify.domain` classifications | User MUST select the appropriate domain. The stricter domain is RECOMMENDED. |
| Overlapping `depends_on` chains that create cycles | User MUST restructure dependencies to eliminate the cycle. |

### 10.4 Prohibited Merges

The following merges are prohibited and MUST be rejected.

| Scenario | Reason |
|----------|--------|
| Merging encrypted Deed Transfer files | Deed Transfer files contain per-party encrypted credentials. Merging would require decryption, which violates the escrow protocol. Deed contents MUST be transferred as atomic units. |
| Merging files with different `author.pubkey` values | The merged file would have an invalid signature. The merge output MUST be re-signed by a single author. |
| Merging `.fed` encrypted files | Encrypted payloads cannot be merged without decryption. Decrypt first, merge the plaintext `.0n` files, then re-encrypt. |

---

## 11. Backward Compatibility

### 11.1 Adapter Architecture

The `.0n` format supports lossless export to external AI platform configuration formats through the adapter system. Each adapter is a bidirectional transformation function:

- **Export** (`0n --> external`): Converts a `.0n` file to the target platform's native format.
- **Import** (`external --> 0n`): Converts an external configuration to a valid `.0n` file, adding required fields.

Adapter contracts:

1. Export MUST be lossless for all fields that have an equivalent in the target format.
2. Fields that cannot be mapped MUST be preserved in the `metadata` section of the exported file (for round-trip fidelity) or explicitly documented as unmapped.
3. Import MUST produce a valid `.0n` file that passes structural validation.
4. Import MUST generate a new `file_id`, `created_at`, and fresh signature for the imported file.
5. Import SHOULD auto-detect the source format when possible.

### 11.2 Supported External Formats

| Format ID | Platform | Config File | Direction |
|-----------|----------|-------------|-----------|
| `claude_desktop` | Claude Desktop | `claude_desktop_config.json` | Export + Import |
| `cursor` | Cursor IDE | `.cursor/mcp.json` | Export + Import |
| `vscode` | VS Code (Copilot) | `.vscode/mcp.json` | Export + Import |
| `windsurf` | Windsurf | `~/.windsurf/mcp.json` | Export + Import |
| `gemini` | Google Gemini | `gemini_mcp_config.json` | Export + Import |
| `openai` | OpenAI | `openai_mcp_config.json` | Export + Import |
| `n8n` | n8n Workflow | `workflow.json` | Export + Import |
| `yaml` | Generic YAML | `*.yaml` | Export + Import |
| `continue` | Continue.dev | `~/.continue/config.json` | Export + Import |
| `cline` | Cline | `~/.cline/mcp_settings.json` | Export + Import |

### 11.3 Adapter Contract

An adapter implementation MUST satisfy these requirements:

1. **Lossless**: All fields mappable to the target format MUST be accurately translated. No semantic information is lost for mapped fields.
2. **Explicit unmapped fields**: Fields that have no equivalent in the target format MUST be listed in an `_0n_unmapped` metadata key in the exported output, OR documented in accompanying adapter documentation.
3. **Valid output**: Exported files MUST be valid in the target platform's native format. Imported files MUST be valid `.0n` files passing all structural validation.
4. **Idempotent round-trip**: For mapped fields, `import(export(file))` MUST produce a file semantically equivalent to the original. Unmapped fields are preserved in `metadata` for round-trip fidelity where possible.

---

## 12. Audit Trail

### 12.1 Record Structure

Every significant operation on a `.0n` file MUST produce an audit record. The audit record schema is:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID v4) | YES | Unique record identifier. |
| `file_id` | `string` (UUID) | YES | The `.0n` file this record pertains to. |
| `action` | `string` | YES | Enum: `created`, `signed`, `verified`, `transferred`, `merged`, `executed`, `modified`, `revoked`. |
| `actor_pubkey` | `string` | YES | Ed25519 public key of the actor (64 hex characters). |
| `content_hash` | `string` | YES | SHA-256 of the file at the time of this action (64 hex characters). |
| `prev_hash` | `string` | YES | SHA-256 of the previous audit record in the chain (64 hex characters). The first record in a chain uses `"0000000000000000000000000000000000000000000000000000000000000000"`. |
| `metadata` | `object` | NO | Action-specific details (execution results, merge source files, transfer party info). |
| `created_at` | `string` (ISO 8601) | YES | When this record was created. |

### 12.2 Hash Chain

Audit records form a hash chain for tamper-evident integrity:

1. Each record contains `prev_hash`: the SHA-256 hash of the complete previous record (all fields, canonical JSON).
2. The first record in a chain sets `prev_hash` to 64 zero characters.
3. To verify chain integrity: iterate from the first record, computing `SHA-256(canonical_json(record))` and comparing it to the next record's `prev_hash`.
4. If any hash does not match, the chain is broken and the audit trail is compromised.

**Storage requirements:**
- Audit records MUST be append-only. Implementations MUST NOT support UPDATE or DELETE operations on audit records.
- When stored in a database, Row-Level Security (RLS) policies SHOULD restrict operations to INSERT only.

### 12.3 External Anchoring

Periodic anchor hashes provide third-party proof of audit trail integrity.

**Anchoring schedule:**
- An anchor MUST be computed every 1,000 records OR every 24 hours, whichever comes first.

**Anchor computation:**
```
anchor_hash = SHA-256(last_record_hash || anchor_timestamp || record_count)
```

**Anchor storage:**
- Anchors MUST be stored in a separate table or storage system from the audit records.
- Anchors SHOULD be published to an external timestamp authority (e.g., OpenTimestamps) for independent verification.
- Each anchor record contains: `anchor_hash`, `anchor_timestamp`, `record_count`, `first_record_id`, `last_record_id`.

**Verification:**
- To verify an anchor: recompute the hash chain from `first_record_id` to `last_record_id`, extract the `last_record_hash`, and compute `SHA-256(last_record_hash || anchor_timestamp || record_count)`. The result MUST match the stored `anchor_hash`.

---

## 13. Schema Versioning

### 13.1 Version Format

The `.0n` specification follows [Semantic Versioning 2.0.0](https://semver.org):

- **MAJOR** version: Incremented for breaking changes to the schema (new required fields, removed fields, changed semantics).
- **MINOR** version: Incremented for backward-compatible additions (new optional fields, new enum values, new optional sections).
- **PATCH** version: Incremented for clarifications, documentation fixes, and non-functional corrections.

### 13.2 Backward Compatibility Guarantees

- **MINOR** version increments guarantee that all files valid under the previous MINOR version remain valid under the new version.
- **MAJOR** version increments MAY introduce breaking changes. A migration path MUST be documented for every breaking change.
- Validators MUST accept files whose `schema_version` MINOR or PATCH is lower than the validator's supported version (e.g., a validator supporting `1.2.0` MUST accept `1.0.0` and `1.1.0` files).
- Validators MUST reject files whose `schema_version` MAJOR is different from the validator's supported MAJOR version.

### 13.3 Migration Paths

When a MAJOR version increment introduces breaking changes, the specification MUST include:

1. A complete changelog listing every breaking change.
2. A machine-readable migration script or transformation specification that converts files from the previous MAJOR version to the new version.
3. A deprecation period of at least 6 months during which both the old and new MAJOR versions are supported by the reference implementation.

---

## 14. Security Considerations

### 14.1 Key Management

- Private keys MUST be generated and stored client-side only. A private key MUST NOT be transmitted over any network, stored on any server, or included in any `.0n` file.
- Private keys SHOULD be encrypted at rest using AES-256-GCM with a user-chosen passphrase and PBKDF2-SHA512 key derivation (minimum 100,000 iterations).
- Key rotation MUST NOT invalidate existing signatures. Each signed file records the public key used at signing time in the `author.pubkey` field.
- Enterprise deployments MAY use HSM-backed keys (e.g., YubiKey). The specification mandates Ed25519 but does not restrict the key storage mechanism.

### 14.2 Credential Handling

- `.0n` files MUST NOT contain plaintext credentials. Credentials MUST be referenced via vault syntax (`{{vault:*}}`) or environment variable syntax (`{{env:*}}`).
- The sole exception is Deed Transfer files, where encrypted credentials are embedded within the `credentials` layer using Argon2id double-encryption (Section 7.5).
- Resolved credential values MUST NOT appear in:
  - Execution logs or history files.
  - Error messages or stack traces.
  - Audit trail `metadata` fields.
  - Network responses or webhook payloads.

### 14.3 Tamper Detection

- Every `.0n` file carries an Ed25519 signature and SHA-256 content hash. Any modification to the file after signing invalidates both.
- Runtimes MUST verify the signature before execution (Phase 2 of the Execution Lifecycle).
- The audit trail hash chain (Section 12) provides historical tamper detection across the file's lifecycle.
- The Seal of Truth (Section 6.3) provides domain-specific verification for regulated content.

### 14.4 Cryptographic Error Handling

- Cryptographic errors (E4xx) MUST always result in file rejection. The `on_error.action` setting does not apply.
- AI auto-fix MUST NOT attempt to correct cryptographic errors. The file MUST be re-signed by the author.
- Failed signature verifications SHOULD be logged as security events with the file's `file_id`, the expected `author.pubkey`, and a timestamp.
- Implementations SHOULD implement rate limiting on signature verification attempts to prevent brute-force attacks against Ed25519 keys via manipulated files.

### 14.5 Transport Security

- `.0n` files transmitted over HTTP MUST use TLS 1.2 or higher.
- Implementations SHOULD verify TLS certificates and reject connections with expired, self-signed, or mismatched certificates.
- The `verify.source_whitelist` field (Section 6.3) restricts which external URIs a file may access during execution.

---

## 15. Examples

### 15.1 Simple Workflow -- Pipeline with Stripe and CRM

A complete, valid `.0n` file implementing a Pipeline workflow that creates a Stripe invoice and updates a CRM contact.

```json
{
  "schema_version": "1.0.0",
  "file_id": "7a3f1b2c-4d5e-6f78-9a0b-1c2d3e4f5a6b",
  "created_at": "2026-02-27T12:00:00Z",
  "author": {
    "name": "Mike Mento",
    "email": "mike@rocketopp.com",
    "pubkey": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
  },
  "signature": "f0e1d2c3b4a59687706152433425160700f1e2d3c4b5a69778695a4b3c2d1e0fa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "manifest": {
    "type": "workflow",
    "name": "Invoice and Update CRM",
    "description": "Create a Stripe invoice for a customer and update their CRM contact record with the invoice details",
    "version": "1.0.0",
    "tags": ["stripe", "crm", "invoicing"],
    "license": "MIT"
  },
  "on_error": {
    "action": "abort",
    "rollback": true,
    "notify": "slack:#ops-alerts",
    "log_level": "error"
  },
  "retry": {
    "max_attempts": 3,
    "backoff": "exponential",
    "initial_delay_ms": 1000,
    "max_delay_ms": 30000,
    "jitter": true
  },
  "rollback": {
    "enabled": true,
    "strategy": "reverse_order",
    "preserve_logs": true,
    "timeout_ms": 120000
  },
  "services": [
    {
      "name": "stripe",
      "auth_ref": "{{vault:stripe}}",
      "scopes": ["invoices.write", "customers.read"],
      "required": true
    },
    {
      "name": "crm",
      "auth_ref": "{{vault:crm}}",
      "scopes": ["contacts.write"],
      "required": true
    }
  ],
  "inputs": {
    "customer_email": {
      "type": "string",
      "required": true,
      "description": "Email address of the customer to invoice"
    },
    "amount": {
      "type": "number",
      "required": true,
      "description": "Invoice amount in dollars",
      "minimum": 0.50
    },
    "description": {
      "type": "string",
      "required": false,
      "default": "Services rendered",
      "description": "Invoice line item description"
    }
  },
  "workflow": {
    "execution_model": "pipeline",
    "timeout_ms": 300000,
    "stages": [
      {
        "id": "find_customer",
        "name": "Find Customer in Stripe",
        "action": "stripe_search_customers",
        "service": "stripe",
        "inputs": {
          "query": "email:'{{inputs.customer_email}}'"
        },
        "outputs": {
          "customer_id": "{{result.data[0].id}}",
          "customer_name": "{{result.data[0].name}}"
        }
      },
      {
        "id": "create_invoice",
        "name": "Create Stripe Invoice",
        "action": "stripe_create_invoice",
        "service": "stripe",
        "inputs": {
          "customer": "{{step.find_customer.output.customer_id}}",
          "collection_method": "send_invoice",
          "days_until_due": 30
        },
        "outputs": {
          "invoice_id": "{{result.id}}",
          "invoice_url": "{{result.hosted_invoice_url}}"
        },
        "condition": "{{step.find_customer.output.customer_id != null}}",
        "depends_on": ["find_customer"]
      },
      {
        "id": "add_line_item",
        "name": "Add Line Item to Invoice",
        "action": "stripe_create_invoice_item",
        "service": "stripe",
        "inputs": {
          "invoice": "{{step.create_invoice.output.invoice_id}}",
          "amount": "{{inputs.amount * 100}}",
          "currency": "usd",
          "description": "{{inputs.description}}"
        },
        "depends_on": ["create_invoice"]
      },
      {
        "id": "update_crm",
        "name": "Update CRM Contact",
        "action": "crm_update_contact",
        "service": "crm",
        "inputs": {
          "email": "{{inputs.customer_email}}",
          "customField": {
            "last_invoice_id": "{{step.create_invoice.output.invoice_id}}",
            "last_invoice_amount": "{{inputs.amount}}",
            "last_invoice_date": "{{system.now}}"
          }
        },
        "depends_on": ["add_line_item"],
        "on_error": "skip"
      }
    ]
  },
  "outputs": {
    "invoice_id": "{{step.create_invoice.output.invoice_id}}",
    "invoice_url": "{{step.create_invoice.output.invoice_url}}"
  }
}
```

### 15.2 Connection File -- Stripe Service Connection with Vault Reference

A complete, valid `.0n` file declaring a Stripe service connection.

```json
{
  "schema_version": "1.0.0",
  "file_id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
  "created_at": "2026-02-27T10:00:00Z",
  "author": {
    "name": "Mike Mento",
    "email": "mike@rocketopp.com",
    "pubkey": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
  },
  "signature": "b0a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
  "content_hash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  "manifest": {
    "type": "connection",
    "name": "Production Stripe",
    "description": "Stripe API connection for production payment processing",
    "version": "1.0.0",
    "tags": ["stripe", "payments", "production"],
    "license": "PROPRIETARY"
  },
  "on_error": {
    "action": "abort",
    "rollback": false
  },
  "retry": {
    "max_attempts": 3,
    "backoff": "exponential",
    "initial_delay_ms": 1000
  },
  "rollback": {
    "enabled": false,
    "strategy": "manual"
  },
  "connection": {
    "service": "stripe",
    "environment": "production",
    "auth": {
      "type": "api_key",
      "credentials": {
        "api_key": "{{vault:stripe}}"
      }
    },
    "options": {
      "base_url": "https://api.stripe.com",
      "timeout_ms": 30000,
      "rate_limit": {
        "requests_per_second": 25,
        "burst": 50
      }
    },
    "metadata": {
      "account_id": "acct_1PUJi5HThmAuKVQM",
      "account_name": "RocketOpp LLC",
      "connected_at": "2026-02-27T10:00:00Z"
    }
  },
  "vault": {
    "references": [
      {
        "key": "stripe",
        "service": "stripe",
        "required": true,
        "scopes": ["payments.write", "customers.read", "invoices.write"]
      }
    ]
  }
}
```

### 15.3 Seal of Truth Verification Request

A complete, valid `.0n` file requesting gold-tier Seal of Truth verification for a financial document.

```json
{
  "schema_version": "1.0.0",
  "file_id": "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
  "created_at": "2026-02-27T14:00:00Z",
  "author": {
    "name": "RocketOpp Compliance",
    "email": "compliance@rocketopp.com",
    "pubkey": "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5"
  },
  "signature": "c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
  "content_hash": "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
  "manifest": {
    "type": "workflow",
    "name": "Financial Report Verification",
    "description": "Verify the integrity and provenance of a financial report using gold-tier Seal of Truth",
    "version": "1.0.0",
    "tags": ["seal-of-truth", "verification", "financial", "compliance"],
    "license": "PROPRIETARY"
  },
  "on_error": {
    "action": "abort",
    "rollback": false,
    "notify": "email:compliance@rocketopp.com",
    "log_level": "debug"
  },
  "retry": {
    "max_attempts": 1,
    "backoff": "fixed",
    "initial_delay_ms": 1000
  },
  "rollback": {
    "enabled": false,
    "strategy": "manual"
  },
  "verify": {
    "tier": "gold",
    "domain": "financial",
    "source_whitelist": [
      "https://api.stripe.com",
      "https://reports.rocketopp.com"
    ],
    "callback_url": "https://0nmcp.com/api/webhooks/verification",
    "require_signature_chain": true
  },
  "workflow": {
    "execution_model": "pipeline",
    "stages": [
      {
        "id": "verify_signature",
        "name": "Verify Document Signature Chain",
        "action": "seal_verify_chain",
        "inputs": {
          "file_id": "{{inputs.target_file_id}}",
          "require_chain": true,
          "min_tier": "gold"
        },
        "outputs": {
          "chain_valid": "{{result.valid}}",
          "chain_length": "{{result.chain_length}}",
          "signers": "{{result.signers}}"
        }
      },
      {
        "id": "verify_content",
        "name": "Verify Content Integrity",
        "action": "seal_verify_content",
        "inputs": {
          "file_id": "{{inputs.target_file_id}}",
          "expected_hash": "{{inputs.expected_hash}}"
        },
        "outputs": {
          "content_valid": "{{result.valid}}",
          "computed_hash": "{{result.hash}}"
        },
        "depends_on": ["verify_signature"],
        "condition": "{{step.verify_signature.output.chain_valid == true}}"
      },
      {
        "id": "issue_certificate",
        "name": "Issue Verification Certificate",
        "action": "seal_issue_certificate",
        "inputs": {
          "file_id": "{{inputs.target_file_id}}",
          "tier": "gold",
          "domain": "financial",
          "chain_length": "{{step.verify_signature.output.chain_length}}",
          "content_hash": "{{step.verify_content.output.computed_hash}}"
        },
        "outputs": {
          "certificate_id": "{{result.certificate_id}}",
          "certificate_url": "{{result.url}}"
        },
        "depends_on": ["verify_content"],
        "condition": "{{step.verify_content.output.content_valid == true}}"
      }
    ]
  },
  "inputs": {
    "target_file_id": {
      "type": "string",
      "required": true,
      "description": "UUID of the .0n file to verify"
    },
    "expected_hash": {
      "type": "string",
      "required": false,
      "description": "Expected SHA-256 content hash for comparison (optional)"
    }
  },
  "outputs": {
    "verification_passed": "{{step.verify_content.output.content_valid}}",
    "certificate_id": "{{step.issue_certificate.output.certificate_id}}",
    "certificate_url": "{{step.issue_certificate.output.certificate_url}}"
  }
}
```

---

## Appendix A: JSON Schema Reference

The canonical JSON Schema for the `.0n` file format is maintained at:

```
schemas/v1.0.0/0n-file.schema.json
```

**Schema metadata:**
- `$schema`: `https://json-schema.org/draft/2020-12/schema`
- `$id`: `https://0nork.com/schemas/v1.0.0/0n-file.schema.json`

The schema validates all 10 required fields, all optional sections, and all nested object structures defined in this specification. Implementations MUST validate `.0n` files against this schema (or a functionally equivalent validator) during the VALIDATE phase of the Execution Lifecycle (Section 8.4).

The schema is distributed as part of the `0n-spec` npm package and is available at:
- **npm**: `npm install 0n-spec` (included in the `schemas/` directory)
- **GitHub**: `https://github.com/0nork/0n-spec/blob/main/schemas/v1.0.0/0n-file.schema.json`
- **CDN**: `https://0nork.com/schemas/v1.0.0/0n-file.schema.json`

---

## Appendix B: Patent Cross-Reference

The following table maps each section of this specification to the patent application(s) it implements or supports.

| Spec Section | Patent 1: MCPFed (Three-Level Execution) | Patent 2: JSON Smart Deploy | Patent 3: Seal of Truth (#63/968,814) | Patent 4: .FED Format (#63/990,046) | Patent 5: Deed Transfer (#63/990,046) |
|---|:---:|:---:|:---:|:---:|:---:|
| 1. Abstract | X | X | X | X | X |
| 2. Conformance | X | X | X | X | X |
| 3. Terminology | X | X | X | X | X |
| 4. File Format | X | X | X | X | X |
| 5.1 schema_version | X | X | X | X | X |
| 5.2 file_id | X | X | X | X | X |
| 5.3 created_at | | | X | | X |
| 5.4 author | | | X | | X |
| 5.5 signature | | | X | X | X |
| 5.6 content_hash | | | X | X | X |
| 5.7 manifest | X | X | X | X | X |
| 5.8 on_error | X | X | | | |
| 5.9 retry | X | X | | | |
| 5.10 rollback | X | X | | | |
| 6.1 services | X | X | | | |
| 6.2 workflow | X | | | | |
| 6.3 verify | | | X | | |
| 6.4 deploy | | X | | | |
| 6.5 vault | | | | X | X |
| 6.6 adapters | X | X | | | |
| 6.7 federation | X | | | | |
| 6.8 deed | | | | | X |
| 7.1 Ed25519 Signatures | | | X | X | X |
| 7.2 SHA-256 Content Hashing | | | X | X | X |
| 7.3 Vault References | | X | | X | X |
| 7.4 .FED Encryption | | | | X | |
| 7.5 Deed Transfer Crypto | | | | | X |
| 8.1 Pipeline | X | | | | |
| 8.2 Assembly Line | X | | | | |
| 8.3 Radial Burst | X | | | | |
| 8.4 Execution Lifecycle | X | X | X | | |
| 9. Error Handling | X | X | | | |
| 10. File Merging | X | X | | | X |
| 11. Backward Compat. | X | X | | | |
| 12. Audit Trail | | | X | | X |
| 13. Schema Versioning | X | X | X | X | X |
| 14. Security | | | X | X | X |

**Legend**: `X` = This specification section implements or directly supports claims in the referenced patent.

---

## Appendix C: Registered Service Names

The 0nMCP service catalog defines 26 registered services. The `services[].name` and `vault.references[].service` fields MUST use one of these identifiers. Service names are case-sensitive.

| # | Service Name | Category | Description |
|---|-------------|----------|-------------|
| 1 | `crm` | Customer Management | CRM platform for contacts, pipelines, calendars, conversations, social media, and workflow automation. |
| 2 | `stripe` | Payments | Payment processing, invoicing, subscriptions, and financial operations. |
| 3 | `sendgrid` | Email | Transactional and marketing email delivery. |
| 4 | `slack` | Communication | Team messaging, channels, and notifications. |
| 5 | `discord` | Communication | Community messaging and bot integration. |
| 6 | `twilio` | Communication | SMS, voice, and messaging APIs. |
| 7 | `github` | Development | Source code hosting, issues, pull requests, and CI/CD. |
| 8 | `shopify` | E-Commerce | Online store management, products, orders, and fulfillment. |
| 9 | `openai` | AI/ML | GPT models, embeddings, image generation, and fine-tuning. |
| 10 | `anthropic` | AI/ML | Claude models, conversations, and tool use. |
| 11 | `gmail` | Email | Google email sending and management. |
| 12 | `google_sheets` | Productivity | Spreadsheet creation, reading, and manipulation. |
| 13 | `google_drive` | Storage | File storage, sharing, and collaboration. |
| 14 | `airtable` | Database | Spreadsheet-database hybrid with APIs. |
| 15 | `notion` | Productivity | Workspace, databases, and documentation. |
| 16 | `mongodb` | Database | Document database operations. |
| 17 | `supabase` | Database | PostgreSQL database, authentication, and storage. |
| 18 | `zendesk` | Support | Customer support tickets and knowledge base. |
| 19 | `jira` | Project Management | Issue tracking and agile project management. |
| 20 | `hubspot` | Marketing | CRM, marketing automation, and sales tools. |
| 21 | `mailchimp` | Email | Email marketing campaigns and audience management. |
| 22 | `google_calendar` | Scheduling | Calendar events and scheduling. |
| 23 | `calendly` | Scheduling | Appointment scheduling and availability management. |
| 24 | `zoom` | Communication | Video meetings, webinars, and recordings. |
| 25 | `linear` | Project Management | Issue tracking and project management for software teams. |
| 26 | `microsoft` | Productivity | Microsoft 365 services (Teams, Outlook, OneDrive, SharePoint). |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-27 | Michael A. Mento Jr. | Initial release. |

---

## License

This specification is licensed under the [Creative Commons Attribution 4.0 International License (CC-BY-4.0)](https://creativecommons.org/licenses/by/4.0/).

You are free to:
- **Share** -- copy and redistribute the material in any medium or format.
- **Adapt** -- remix, transform, and build upon the material for any purpose, including commercially.

Under the following terms:
- **Attribution** -- You must give appropriate credit to 0nORK / RocketOpp LLC, provide a link to the license, and indicate if changes were made.

The reference implementation (`0n-spec` npm package) is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

**Copyright (c) 2025-2026 RocketOpp LLC. All rights reserved.**

Patent Pending: US Provisional Application No. 63/968,814, US Provisional Application No. 63/990,046.

The `.0n` file format, the Three-Level Execution Model, the Seal of Truth, the .FED encrypted container format, the 0nVault Container System, and the Business Deed Transfer protocol are patent-pending inventions of RocketOpp LLC. Third-party implementations of this specification are permitted under the CC-BY-4.0 license for the specification text and do not grant any patent license unless separately agreed in writing.

0nORK -- AI Orchestration Infrastructure
"Stop building workflows. Start describing outcomes."

*RocketOpp LLC -- Patent Pending -- Confidential*
