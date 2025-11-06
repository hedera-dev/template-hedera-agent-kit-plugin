import { z } from "zod";
import type { Tool, Context } from "hedera-agent-kit";
import { handleTransaction } from "hedera-agent-kit";
import { AccountId, Client, Status, TransferTransaction } from "@hashgraph/sdk";
import { simpleTransferHbarParameters } from "@/schemas/simple-transfer-hbar.schema";

const simpleTransferHbarPrompt = (_context: Context = {}) => {
  return `
This tool will transfer HBAR to an account.

Parameters:
  - recipientId (string): Recipient account ID
  - amount (number): Amount of HBAR to transfer
`;
};

const transferHbar = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof simpleTransferHbarParameters>>
) => {
  try {
    const senderId = (context.accountId ?? client.operatorAccountId) as
      | string
      | AccountId;
    const amount = params.amount;
    const recipientId = params.recipientId;
    const tx = new TransferTransaction()
      .addHbarTransfer(senderId, -amount)
      .addHbarTransfer(recipientId, amount);

    // handleTransaction submits on AUTONOMOUS mode or returns bytes for RETURN_BYTES mode
    return await handleTransaction(tx, client, context);
  } catch (error) {
    const desc = "Failed to transfer HBAR";
    const message = desc + (error instanceof Error ? `: ${error.message}` : "");
    console.error("[transfer_hbar_tool]", message);
    return {
      raw: { status: Status.InvalidTransaction, error: message },
      humanMessage: message,
    };
  }
};

export const TRANSFER_HBAR_TOOL = "simple_transfer_hbar_tool";

const tool = (context: Context): Tool => ({
  method: TRANSFER_HBAR_TOOL,
  name: "Simple Transfer HBAR",
  description: simpleTransferHbarPrompt(context),
  parameters: simpleTransferHbarParameters(context),
  execute: transferHbar,
});

export default tool;
