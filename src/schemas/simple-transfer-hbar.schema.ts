import { Context } from "hedera-agent-kit";
import z from "zod";

export const simpleTransferHbarParameters = (_context: Context = {}) =>
  z.object({
    recipientId: z.string().describe("Recipient account ID"),
    amount: z.number().describe("Amount of HBAR to transfer"),
  });
