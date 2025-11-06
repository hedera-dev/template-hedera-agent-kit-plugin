import { Context } from "hedera-agent-kit";
import z from "zod";

export const helloWorldParameters = (_context: Context = {}) =>
  z.object({
    name: z.string().describe("Name"),
  });
