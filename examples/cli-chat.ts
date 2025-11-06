import { AgentMode, HederaLangchainToolkit } from "hedera-agent-kit";

import { Client, PrivateKey } from "@hashgraph/sdk";
import prompts from "prompts";
import * as dotenv from "dotenv";
import plugin from "../src";
import createAgentExecutor from "./agent";

dotenv.config();

async function bootstrap(): Promise<void> {
  // Hedera client setup to pay for network transactions
  const client = Client.forTestnet().setOperator(
    process.env.HEDERA_ACCOUNT_ID!,
    PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!)
  );

  // Prepare Hedera toolkit (load all tools supplied by the plugin)
  const hederaAgentToolkit = new HederaLangchainToolkit({
    client,
    configuration: {
      context: {
        mode: AgentMode.AUTONOMOUS,
      },
      plugins: [plugin],
    },
  });

  // Fetch tools from toolkit
  const tools = hederaAgentToolkit.getTools(); // cast to keep TS fast with deeply inferred zod types

  // Utility function to create a Langchain AI Agent
  // Note: this uses an old version of Langchain; Langchain 1.0.0 was recently released
  const agentExecutor = createAgentExecutor(tools);

  console.log('Hedera Agent CLI Chatbot — type "exit" to quit');

  while (true) {
    const { userInput } = await prompts({
      type: "text",
      name: "userInput",
      message: "You",
    });

    // Handle early termination
    if (
      !userInput ||
      ["exit", "quit"].includes(userInput.trim().toLowerCase())
    ) {
      console.log("Goodbye!");
      break;
    }

    try {
      const response = await agentExecutor.invoke({ input: userInput });
      // The structured-chat agent puts its final answer in `output`
      console.log(`AI: ${response?.output ?? response}`);
    } catch (err) {
      console.error("Error:", err);
    }
  }
}

bootstrap()
  .catch((err) => {
    console.error("Fatal error during CLI bootstrap:", err);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
