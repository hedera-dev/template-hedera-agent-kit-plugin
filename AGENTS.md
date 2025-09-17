# AGENTS.md — Hedera Agent Kit Plugin Template

**You are a coding agent working in a TypeScript repo that scaffolds new Hedera Agent Kit plugins.**  
Your main job is to add/modify tools under `src/tools/`, define/extend input schemas under `src/schemas/`, and export the plugin from `src/index.ts`.

---

## Project overview (for agents)

- This repository is a **template for building a Hedera Agent Kit plugin**. A plugin is a collection of **tools** (atomic actions) with:
  - a unique `method` identifier,
  - a human‑readable `name` and `description`,
  - a **Zod** `parameters` schema for inputs,
  - an async `execute(client, context, params)` handler.
- Tools must **respect the Agent Mode**:
  - **AUTONOMOUS** — sign & submit to Hedera,
  - **RETURN_BYTES** — freeze & return the unsigned **transaction bytes**, do **not** submit.  
    _This enables human‑in‑the‑loop flows; the kit encourages respecting mode in every transaction tool._

---

## Setup commands

> Agents: run these in a bash shell from the repo root. If a command is missing, **add it** to `package.json`.

- Install deps: `npm ci` (or `npm install`)
- Typecheck: `npm run typecheck` (create if missing → `tsc --noEmit`)
- Lint: `npm run lint` (configure ESLint if absent)
- Build: `npm run build` (wire this to `tsup` or `tsc -p tsconfig.json`)
- Format: `npm run format` (Prettier)
- Run a single example: see `examples/AGENTS.md` for commands

> **Node**: prefer Node 20+ for best TS/ESM support.

---

## Environment & secrets

Set Hedera credentials for local runs/tests:

```bash
export HEDERA_ACCOUNT_ID=0.0.xxxx
export HEDERA_PRIVATE_KEY=302e0201... # DER-encoded; ED25519 or ECDSA
# optionally:
export HEDERA_NETWORK=testnet  # testnet|previewnet|mainnet
```
