# Hedera Agent Kit Plugin Template

This repository bootstraps a Hedera Agent Kit plugin. It demonstrates how to package Hedera-ready tools, define strongly typed inputs with Zod, and expose everything through a LangChain-compatible toolkit. Use it as a starting point to build your own plugin and distribute new on-ledger capabilities to agent developers.

> Looking for lower-level or advanced examples? See the core plugins in [`hedera-agent-kit-js`](https://github.com/hashgraph/hedera-agent-kit-js).

## Features

- Example plugin that exposes two tools: a Hedera-enabled HBAR transfer and a non-Hedera “hello world” action.
- Zod-based schemas under `src/schemas/` for clean, strongly typed tool inputs.
- Transaction helper utilities (`handleTransaction`, context-aware modes) that respect Hedera Agent modes (`AUTONOMOUS`, `RETURN_BYTES`).
- CLI chatbot example wired to LangChain that lets you try the plugin end to end.
- TypeScript build pipeline via `tsup`, TypeScript type-checking, and ready-to-extend project structure.

## Prerequisites

- Node.js 20+
- Hedera account credentials with network access
- Optional: OpenAI API key (only required if you run the LangChain CLI example)

Set the following environment variables when you run examples or tests:

```bash
export ACCOUNT_ID=0.0.xxxx
export PRIVATE_KEY=0x... # HEX-encoded ECDSA for the example script, but can use either ED25519 or ECDSA
# For CLI agent example
export OPENAI_API_KEY=sk-...
```

## Installation & Scripts

```bash
npm ci                # install dependencies
npm run typecheck     # run TypeScript with --noEmit
npm run build         # build the plugin bundle via tsup
npm run run:example   # runs examples/plugin-tool-calling-agent.ts (interactive LangChain session)
```

Adjust or extend these scripts in `package.json` as needed.

## Project Layout

```
src/
  index.ts                # Plugin entrypoint exporting metadata and tools
  schemas/                # Zod schemas that describe tool parameters
    hello-world.schema.ts
    simple-transfer-hbar.schema.ts
  tools/                  # Tool factories (one per action)
    hello-world.ts
    simple-transfer-hbar.ts
  utils/                  # Shared helpers (decimals, mirrornode URLs, etc.)
examples/
  plugin-tool-calling-agent.ts # CLI chatbot demonstrating toolkit usage with LangChain v1
```

## Understanding the Example Tools

### `hello-world.ts` (non-Hedera)

- Demonstrates a simple tool that uses a schema from `hello-world.schema.ts`.
- Returns a “Hello, {name}” string and shows how to render a dynamic description via a prompt helper.
- Useful for showcasing non-ledger actions inside the same plugin.

### `simple-transfer-hbar.ts` (Hedera)

- Imports `simpleTransferHbarParameters` to validate input.
- Uses the Hedera SDK to build a `TransferTransaction`.
- Delegates execution to `handleTransaction` from Hedera Agent Kit, which:
  - Submits the transaction when `context.mode === AgentMode.AUTONOMOUS`.
  - Returns frozen transaction bytes when `context.mode === AgentMode.RETURN_BYTES` so the caller can review or sign manually.
- Wraps errors in a structured payload so agents can surface human-readable messages.

To dive deeper into production-grade versions of these tools, review the official plugins in [`hedera-agent-kit-js`](https://github.com/hashgraph/hedera-agent-kit-js).

## Plugin Entry Point (`src/index.ts`)

The default export satisfies the `Plugin` interface and registers each tool via a factory function:

```ts
export default {
  name: "example-plugin",
  version: "1.0.0",
  description: "An example plugin for the Hedera Agent Kit",
  tools: (context: Context) => [
    helloWorldTool(context),
    simpleTransferHbarTool(context),
  ],
};
```

When the toolkit loads your plugin it calls `tools(context)` to get tool instances tailored to the current `Context` (account IDs, agent mode, etc.). Add new tools by exporting a factory from `src/tools/<tool-name>.ts` and including it in this array.

## Creating New Tools

1. **Define parameters**: Create a Zod schema in `src/schemas/<tool>.schema.ts`. Use `.describe()` to help downstream UIs and agents.
2. **Implement the tool**:
   - Export a function `(context: Context) => Tool`.
   - Build a descriptive prompt string that agent frameworks can show to models.
   - Implement `execute(client, context, params)` and, if you submit transactions, rely on `handleTransaction` so Agent Modes are respected.
3. **Register the tool** in `src/index.ts`.
4. **Document the tool**: add comments and ensure its description clearly communicates inputs, outputs, and any side effects.

Utilities in `src/utils/` (token decimal conversions, mirror node URLs) are ready to be reused across tools.

## Trying the CLI Chat Example

```bash
npm run build
OPENAI_API_KEY=... npm run run:example
```

The `examples/plugin-tool-calling-agent.ts` script:

- Instantiates a Hedera `Client` (defaults to testnet; adjust for other networks).
- Creates a `HederaLangchainToolkit` with your plugin.
- Spins up a LangChain agent and exposes the plugin tools.
- Lets you type natural-language instructions such as “Send 1 HBAR to 0.0.1234”.

Swap in your own tools and the CLI automatically reflects them.

## Publishing & Distribution

- Run `npm run build` to produce the bundled output (configured through `tsup.config.ts`).
- Ensure your package metadata (`name`, `description`, `keywords`) is updated in `package.json`.
- Publish to npm or share the package tarball; consumers can import the plugin and register it with the Hedera Agent Kit.

## Additional Resources

- Hedera Agent Kit documentation: check release notes and examples in [`hedera-agent-kit-js`](https://github.com/hashgraph/hedera-agent-kit-js).
- Hedera SDK docs: [https://docs.hedera.com/](https://docs.hedera.com/)

Happy building!
