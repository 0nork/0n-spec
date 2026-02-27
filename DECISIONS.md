# .0n Specification — Tier 1 Foundation Decisions

> **Status**: LOCKED — Session 2 (February 27, 2026)
> **Decided By**: Mike @ RocketOpp LLC + 0nClaude Architecture Session
> **Patent Ref**: USPTO App. 63/968,814 · 63/990,046
> **Document**: Companion to "Phase 1 Build — The .0n File Specification"

---

## T1-01: Canonical File Extension Strategy

**DECISION: Option D — .0n is canonical, subtypes are optional aliases**

`.0n` is the ONE extension. Always valid. Always recognized. The `manifest.type` field inside the file is the authoritative content type declaration — not the file extension.

Subtypes (`.0nw`, `.0nc`, `.0ne`, `.0nb`, `.0nv`, `.fed`) are **optional aliases** that tooling MAY use for convenience (syntax highlighting, file associations, IDE support). A spec-compliant parser MUST accept `.0n` regardless of content type and MUST read `manifest.type` to determine behavior.

**Rationale:**
- The brand IS "0n" — every extension reinforces the brand and the patent
- One extension = one mental model = the "Stripe API key" principle from the spec
- Subtypes help tooling without fragmenting the format
- A `.0nw` file is a valid `.0n` file. A `.0n` file with `manifest.type: "workflow"` is identical
- Patent defense: competitors can't claim "we use .flux files, not .0n" when the behavior is identical — the patent targets behaviors, not names. But the canonical extension strengthens brand protection

**Registered Subtypes (aliases):**
| Extension | manifest.type | Purpose |
|-----------|--------------|---------|
| `.0n` | any | Universal — always valid |
| `.0nw` | `workflow` | Workflow definitions (RUNs) |
| `.0nc` | `connection` | Service credential references |
| `.0ne` | `environment` | Environment configuration |
| `.0nb` | `bundle` | Multi-file bundles |
| `.0nv` | `vault` | Encrypted vault containers |
| `.fed` | `encrypted` | .FED encrypted container (Patent 4) |
| `.0nd` | `deed` | Deed Transfer package (Patent 5) |

---

## T1-02: JSON vs YAML Authoring

**DECISION: Option B — YAML authoring supported, compiled to JSON before execution**

The spec declares: "YAML is a supported authoring format. All YAML is compiled to canonical JSON at parse time before validation or execution. The runtime format is always JSON. YAML and JSON produce identical .0n documents."

**Implementation phasing:**
- v1.0.0 spec: Both formats specified. JSON is the canonical representation
- v1.0.0 implementation: JSON parser ships first. YAML parser fast-follows (js-yaml is a single dependency)
- Visual builder: Generates JSON. Never exposes format choice to non-developers
- Developer CLI: Accepts both. `0n validate file.0n` works on JSON or YAML input

**Rationale:**
- Developers overwhelmingly prefer YAML for hand-editing (Docker Compose, GitHub Actions, Kubernetes, Ansible — all YAML)
- JSON is strict, unambiguous, machine-parseable — correct for runtime
- YAML → JSON is a trivial compile step with zero information loss
- By specifying YAML in v1.0.0 of the spec, we avoid a breaking change later
- The "Norway problem" (YAML `NO` → boolean false) is handled at compile time with strict mode parsing
- Patent defense: the spec covers both formats, so a competitor can't claim "we support YAML, they only support JSON"

**YAML Authoring Rules:**
1. YAML files MUST use `.0n` or a registered subtype extension (not `.yaml` or `.yml`)
2. The YAML compile step runs BEFORE validation — the validator only sees JSON
3. YAML comments are stripped at compile time (JSON has no comments)
4. Multi-document YAML (---) is NOT supported — one document per file

---

## T1-03: Ed25519 Key Management Model

**DECISION: Option A — Client-side generation only, with platform-assisted UX**

The private key NEVER leaves the user's device. Period. This is a non-negotiable security posture that directly supports the patent claims around cryptographic provenance.

**Key lifecycle:**
1. **Generation**: Ed25519 keypair generated client-side (Web Crypto API in browser, `tweetnacl` in Node.js)
2. **Storage**: Private key encrypted with user's passphrase and stored in local 0nVault (AES-256-GCM + PBKDF2-SHA512)
3. **Registration**: Public key uploaded to platform for signature verification
4. **Signing**: All signing happens locally — file content → SHA-256 hash → Ed25519 sign with local private key
5. **Verification**: Any party can verify using the author's registered public key
6. **Rotation**: New keypair generated. Old public key archived (not deleted). Old signatures remain valid — they reference the key used at signing time. New files use new key.

**Rationale:**
- Patent claims center on cryptographic integrity. Platform-generated keys means the platform has seen the private key — fatal to provenance claims
- Client-side generation is the SSH/GPG model — universally understood, battle-tested
- Web Crypto API is available in all modern browsers — no plugins needed
- The 0nVault already implements AES-256-GCM encryption — key storage is solved
- Enterprise can use HSM-backed keys (YubiKey, etc.) — the spec allows any Ed25519 implementation, just mandates client-side generation
- Key rotation doesn't invalidate history — each signed file records which public key was used

**UX for non-developers:**
The onboarding flow generates the keypair automatically. The user sets a passphrase. They never see "Ed25519" — they see "Set your signing password." The complexity is real. The experience is invisible.

---

## T1-04: Vault Credential Reference Architecture

**DECISION: Option C+D Hybrid — Executing environment resolves references; Deed Transfer is per-file**

Standard .0n files use `{{vault:service_name}}` syntax. The executing environment resolves these at runtime against the user's local vault. The file itself contains NO credentials — only references.

Deed Transfer files are the exception: encrypted credentials are embedded inside the file's credential layer, encrypted with per-party escrow keys. The deed IS the credentials.

**Resolution hierarchy:**
```
{{vault:stripe}}          → User's local vault → stripe credential
{{vault:stripe:live}}     → User's local vault → stripe credential, "live" environment
{{env:STRIPE_SECRET_KEY}} → Environment variable (for CI/CD, serverless)
{{param:api_key}}         → Runtime parameter (passed at execution time)
```

**Rationale:**
- Maximum portability: a .0n workflow that references `{{vault:stripe}}` works on ANY machine with a Stripe credential in its vault
- This is the environment variable model — the file references a name, the environment provides the value
- When sharing a .0n file: the workflow is identical, each user provides their own credentials
- For Deed Transfer: the entire point is to transfer credentials WITH the business — they must be in the file, encrypted
- The resolution hierarchy supports multiple deployment contexts (local dev, CI/CD, serverless, shared hosting)

**Sharing model:**
- Share a workflow → recipient needs their own vault credentials for referenced services
- Share a connection → recipient gets the service reference, not the credential value
- Share a deed → recipient gets encrypted credentials they can decrypt with their escrow key

---

## T1-05: Audit Trail Immutability Mechanism

**DECISION: Option D — Hash chain in Supabase plus periodic external anchors**

Every audit record contains `prev_hash: SHA-256(previous_record)`. This creates a tamper-evident chain — modify any record and the chain breaks. Periodic anchor hashes are published to an external timestamp authority for independent verification.

**Implementation:**
```
audit_records table:
  id              UUID PRIMARY KEY
  file_id         UUID REFERENCES ...
  action          TEXT (created, signed, verified, transferred, merged, executed)
  actor_pubkey    TEXT (Ed25519 public key of the actor)
  content_hash    TEXT (SHA-256 of the file at this point)
  prev_hash       TEXT (SHA-256 of the previous audit record — creates the chain)
  metadata        JSONB (action-specific details)
  created_at      TIMESTAMPTZ

  -- RLS: INSERT only. No UPDATE. No DELETE.
```

**Anchor schedule:**
- Every 1,000 records OR every 24 hours (whichever comes first)
- Anchor = SHA-256(last_record_hash || anchor_timestamp || record_count)
- Published to: Supabase separate table + optional external service (OpenTimestamps, or our own anchor registry)

**Rationale:**
- Append-only RLS is necessary but not sufficient — a Supabase admin could still modify rows directly
- Hash chain creates mathematical tamper evidence — the cost of undetected modification is breaking the chain
- External anchors provide third-party proof (important for patent claims AND enterprise compliance)
- Periodic anchoring is cost-effective — one anchor per 1000 records, not per record
- This is what Certificate Transparency Logs use — proven model for append-only integrity
- Patent filing: "cryptographic hash chain with periodic external timestamping for immutable provenance" is a specific, defensible technical claim

---

## T1-06: Default on_error Behavior

**DECISION: Option A — Reject the file. Missing on_error is a structural error.**

The spec says `on_error` is MANDATORY. If it's mandatory, its absence is a structural error (Category 1). The file is rejected at parse time. Zero execution occurs. Zero cost incurred.

**Rationale:**
- Consistency: a mandatory field that has a "default when missing" is not actually mandatory
- Safety: implicit error handling is the source of most production incidents. Explicit declaration prevents "I didn't know it would do that"
- Developer discipline: forces every .0n file author to think about error behavior before shipping
- AI auto-fix: structural errors ALLOW auto-fix. The AI can suggest: "Your file is missing on_error. Based on your workflow, I recommend: `on_error: { action: 'abort', rollback: true }`" — then the user accepts or modifies
- Patent defense: "every valid .0n file MUST declare error handling behavior" is a stronger claim than "files without error handling use a platform default"

**Minimum valid on_error block:**
```json
{
  "on_error": { "action": "abort", "rollback": true },
  "retry": { "max_attempts": 3, "backoff": "exponential", "initial_delay_ms": 1000 },
  "rollback": { "enabled": true, "strategy": "reverse_order" }
}
```

---

## T1-07: Primary Launch Audience

**DECISION: Option C — Both simultaneously, with phased depth per backbone**

The platform serves developers AND end users from day one. The .0n file is mandatory in the tech layer, invisible in the experience layer. This IS the dual-mode approach.

**Mode architecture:**
- **Developer Mode**: Raw .0n file editor, CLI access, API endpoints, webhook configuration, vault management
- **User Mode**: Visual builder, drag-and-drop workflow creation, one-click execution, guided setup wizards
- **Enterprise Mode**: Compliance dashboard, Seal of Truth verification console, audit trail explorer, team key management

All three modes generate and consume the same .0n files. The backend is identical. The experience layer adapts.

**Phased depth by backbone:**
| Backbone | Developer Mode | User Mode | Enterprise Mode |
|----------|---------------|-----------|-----------------|
| Seal of Truth (①) | Verification API | Content checker UI | Compliance dashboard |
| MCPFed (②) | Federation Gateway API | Service connector wizard | Team orchestration |
| Smart Deploy (③) | Template API, CLI deploy | One-click deploy UI | Environment management |
| .FED Format (④) | Encryption API | Secure share UI | Key custody console |
| Deed Transfer (⑤) | Transfer API | Guided transfer wizard | Multi-party escrow UI |

**Rationale:**
- The doc states "mandatory in tech layer, invisible in experience layer" — this IS dual-mode
- Developers adopt first (they find 0nMCP on npm/GitHub), then bring it into their organizations
- End users arrive through the visual builder (0nmcp.com), never see the file format
- Enterprise arrives through compliance requirements (Seal of Truth for healthcare/legal)
- One platform serving all three avoids brand fragmentation and migration complexity

---

## T1-08: Unified Platform vs Individual Domain Launches

**DECISION: Option C — Unified platform (0nmcp.com) with staged backbone rollout**

0nmcp.com is the destination from day one. Each patent backbone launches as a new section within the unified platform. No individual domains. No migration later.

**Launch sequence:**
1. **Week 0-4**: Shared infrastructure — Console shell, auth, .0n Editor foundation, Sandbox credentials
2. **Backbone ①**: Seal of Truth section launches → `0nmcp.com/verify`
3. **Backbone ②**: MCPFed section launches → `0nmcp.com/orchestrate`
4. **Backbone ③**: Smart Deploy section launches → `0nmcp.com/deploy`
5. **Backbone ④**: .FED Format section launches → `0nmcp.com/secure`
6. **Backbone ⑤**: Deed Transfer section launches → `0nmcp.com/transfer`

**Rationale:**
- 0nmcp.com already exists with 300+ pages, SEO momentum, community, auth system
- Building on existing infrastructure vs. starting from scratch = massive speed advantage
- Each backbone launch is a marketing event that drives traffic to ONE domain
- One login, one set of credentials, one .0n file format — the unified vision from the spec
- Individual domains create brand confusion: "Is sealoftruth.io the same company as 0nmcp.com?"
- The spec's "AWS Console for AI infrastructure" vision requires one console, not five

---

## Summary — All 8 Tier 1 Decisions Locked

| # | Decision | Choice |
|---|----------|--------|
| T1-01 | File extension | `.0n` canonical, subtypes are optional aliases |
| T1-02 | JSON vs YAML | Both in spec, JSON canonical, YAML compiled to JSON |
| T1-03 | Key management | Client-side Ed25519 generation, never leaves device |
| T1-04 | Vault references | Executing environment resolves; Deed Transfer per-file |
| T1-05 | Audit trail | Hash chain + periodic external anchors |
| T1-06 | Default on_error | Reject — missing mandatory field is structural error |
| T1-07 | Launch audience | Both devs + users simultaneously, phased depth |
| T1-08 | Platform strategy | Unified 0nmcp.com with staged backbone rollout |

---

**Next**: Write the .0n v1.0.0 specification skeleton based on these 8 locked decisions.

*RocketOpp LLC · 0nmcp.com · Patent Pending · CONFIDENTIAL*
