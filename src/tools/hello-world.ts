import { z } from "zod";
import type { Tool, Context } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";
import { helloWorldParameters } from "@/schemas/hello-world.schema";

const helloWorldPrompt = (_context: Context = {}) => {
  return `
This tool say hello to the inputted name.

Parameters:
  - name (string): the user's name
`;
};

const transferHbar = async (
  _client: Client,
  _context: Context,
  params: z.infer<ReturnType<typeof helloWorldParameters>>
) => {
  return `Hello, ${params.name}`;
};

export const HELLO_WORLD_TOOL = "hello_world_tool";

const tool = (context: Context): Tool => ({
  method: HELLO_WORLD_TOOL,
  name: "Simple Transfer HBAR",
  description: helloWorldPrompt(context),
  parameters: helloWorldParameters(context),
  execute: transferHbar,
});

export default tool;
