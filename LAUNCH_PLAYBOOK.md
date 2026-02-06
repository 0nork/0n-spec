# Launch Playbook

## Pre-Launch Checklist

- [ ] README polished and complete
- [ ] All examples validate (`0n test`)
- [ ] npm package published (`0n-spec`)
- [ ] 0nMCP updated to use .0n standard
- [ ] GitHub repo public with proper license
- [ ] Discord server created
- [ ] Twitter account active

## Launch Day Schedule

### 6:00 AM — Hacker News

**Title:** "Show HN: The .0n Standard – A universal config format for AI orchestration"

**Post body:**
> We built .0n (dot-on) — a universal configuration format for AI orchestration.
>
> Just as .git standardized version control and .env standardized configuration, .0n standardizes how AI systems connect to and orchestrate APIs.
>
> - `~/.0n/connections/stripe.0n` — store service credentials
> - `~/.0n/workflows/invoice-notify.0n` — define multi-step automations
> - `~/.0n/snapshots/crm-setup.0n` — capture entire system state
>
> Every file has a `$0n` header with type and version. CLI validates. Library parses. 0nMCP orchestrates.
>
> Spec: https://github.com/0nork/0n-spec
> Orchestrator: https://github.com/0nork/0nMCP
>
> Open source (CC BY 4.0 for spec, MIT for tools). Built by RocketOpp.

### 8:00 AM — Twitter Thread

1. "We just open-sourced the .0n standard — a universal config format for AI orchestration. Think .git for AI automation."
2. "Every AI tool invents its own config. .0n standardizes it: connections, workflows, snapshots, execution history."
3. "One directory: ~/.0n/ One format: $0n header One ecosystem: 0nMCP"
4. "The spec, schemas, CLI, examples — all open source. Star and contribute."
5. "Link to spec + link to 0nMCP"

### 10:00 AM — Reddit

Post to: r/programming, r/machinelearning, r/selfhosted, r/automation

**Title:** "We open-sourced the .0n Standard — a universal config format for AI orchestration (like .git for automation)"

### 12:00 PM — Product Hunt

**Tagline:** "The universal config standard for AI orchestration"
**Description:** Brief, link to GitHub

### 2:00 PM — Dev.to / Hashnode

**Article:** "Why AI orchestration needs a standard config format (and we built one)"

Outline:
1. The problem: every tool invents its own format
2. The solution: .0n standard
3. How it works: directory structure, file types, templates
4. Real examples: Stripe connection, invoice workflow, CRM snapshot
5. Try it: npx 0n-spec test
6. Contribute: GitHub link

## Response Templates

### For "How is this different from...?"
> Great question! .0n is not a competitor to [X] — it's the config layer underneath. [X] could adopt .0n to make its configs portable and standardized. We want .0n to be the universal format, not another proprietary one.

### For "Why not just use YAML/JSON/TOML?"
> .0n uses JSON under the hood. The value isn't the format — it's the schema. Every .0n file has a `$0n` header with type and version. The schemas define what a connection, workflow, or snapshot looks like. This means tools can interoperate.

### For "Who needs this?"
> Anyone building AI agents that connect to APIs. Instead of inventing your own config format, adopt .0n. Your users get portability, you get a spec to build against.

## Success Metrics

### Day 1
- [ ] 100+ GitHub stars
- [ ] 50+ npm downloads
- [ ] Top 10 on HN Show

### Week 1
- [ ] 500+ stars
- [ ] 200+ npm downloads
- [ ] 50+ Discord members
- [ ] 3+ external contributors
- [ ] 1+ blog post from someone outside the team

### Month 1
- [ ] 1,000+ stars
- [ ] 1,000+ npm downloads
- [ ] 200+ Discord members
- [ ] 10+ contributed service integrations
- [ ] 1+ alternative implementation of the .0n standard
