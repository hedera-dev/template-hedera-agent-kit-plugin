# AGENTS.md — Examples

This folder holds minimal scripts that exercise the plugin’s tools.

---

## Environment

Set the following before running any example:

```bash
export HEDERA_NETWORK=testnet            # or previewnet/mainnet
export HEDERA_ACCOUNT_ID=0.0.xxxx
export HEDERA_PRIVATE_KEY=302e0201...    # DER-encoded ED25519/ECDSA
```

These variable names are commonly used across Hedera plugins.

---

## Running examples (TypeScript)

If examples are .ts files, either:

Option A: Use ts-node/tsx

```bash
npm run build         # if needed
npx tsx examples/transfer-hbar.ts
```

Option B: Compile then run

```bash
npm run build
node dist/examples/transfer-hbar.js
```

If scripts don’t exist yet, add them under examples/ and wire package.json scripts such as: `"example:transfer": "tsx examples/transfer-hbar.ts"`

## Example template (mode-aware)

```ts
// examples/transfer-hbar.ts
import { Client } from "@hashgraph/sdk";
import { plugin, ToolNames } from "../src"; // your plugin’s exports

const client = Client.forName(
  process.env.HEDERA_NETWORK || "testnet"
).setOperator(process.env.HEDERA_ACCOUNT_ID!, process.env.HEDERA_PRIVATE_KEY!);

const context = {
  mode: process.env.RETURN_BYTES === "1" ? "RETURN_BYTES" : "AUTONOMOUS",
  accountId: process.env.HEDERA_ACCOUNT_ID!,
};

async function main() {
  const tools = plugin.tools(context);
  const tool = tools.find((t) => t.method === ToolNames.TRANSFER_HBAR)!;

  const res = await tool.execute(client, context, {
    to: process.env.RECIPIENT_ID || "0.0.1234",
    amount: Number(process.env.AMOUNT || 1),
    memo: "Example transfer",
  });

  console.log(res.humanMessage);
  console.dir(res.raw, { depth: 4 });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## Notes on modes

- AUTONOMOUS: the example should submit and await a receipt.

- RETURN_BYTES: the example should print unsigned bytes and a transaction ID; do not call getReceipt.

Both workflows are supported; tools should be mode-aware so that examples run correctly in either case.
