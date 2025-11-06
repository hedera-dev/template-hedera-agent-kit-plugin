import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";
import { StructuredTool } from "langchain/tools";

export default function createAgentExecutor(tools: StructuredTool[]) {
  // Initialise OpenAI LLM
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
  });
  // Load the structured chat prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant"],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  // Create the underlying agent
  const agent = createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  // In-memory conversation history
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    inputKey: "input",
    outputKey: "output",
    returnMessages: true,
  });

  // Wrap everything in an executor that will maintain memory
  return new AgentExecutor({
    agent,
    tools,
    memory,
    returnIntermediateSteps: false,
  });
}
