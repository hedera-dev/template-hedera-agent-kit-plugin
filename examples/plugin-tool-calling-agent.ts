import {
    AgentMode,
    HederaLangchainToolkit,
    ResponseParserService,
} from 'hedera-agent-kit';
import { Client, PrivateKey } from '@hashgraph/sdk';
import prompts from 'prompts';
import * as dotenv from 'dotenv';
import { StructuredToolInterface } from '@langchain/core/tools';
import { createAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import plugin from '../src/index';

dotenv.config();

async function bootstrap(): Promise<void> {
    // Hedera client setup (Testnet by default)
    const client = Client.forTestnet().setOperator(
        process.env.ACCOUNT_ID!,
        PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY!),
    );

    // Prepare Hedera toolkit with core tools AND custom plugin
    const hederaAgentToolkit = new HederaLangchainToolkit({
        client,
        configuration: {
            tools: [
                // Plugin tools
                'hello_world_tool',
                'simple_transfer_hbar_tool',
            ],
            plugins: [plugin], // Add all plugins by default
            context: {
                mode: AgentMode.AUTONOMOUS,
            },
        },
    });

    // Fetch tools from a toolkit
    const tools: StructuredToolInterface[] = hederaAgentToolkit.getTools();

    const llm = new ChatOpenAI({
        model: 'gpt-4o-mini',
    });


    const agent = createAgent({
        model: llm,
        tools: tools,
        systemPrompt: 'You are a helpful assistant with access to Hedera blockchain tools and custom plugin tools',
        checkpointer: new MemorySaver()
    });

    const responseParsingService = new ResponseParserService(hederaAgentToolkit.getTools());

    console.log('Hedera Agent CLI Chatbot with Plugin Support — type "exit" to quit');
    console.log('Available plugin tools:');
    console.log('- hello_world_tool: Say hello to a user');
    console.log(
        '- simple_transfer_hbar_tool: Transfer HBAR to an account (demonstrates simpler transaction strategy)',
    );
    console.log('');

    while (true) {
        const { userInput } = await prompts({
            type: 'text',
            name: 'userInput',
            message: 'You',
        });

        // Handle early termination
        if (!userInput || ['exit', 'quit'].includes(userInput.trim().toLowerCase())) {
            console.log('Goodbye!');
            break;
        }

        try {
            const response = await agent.invoke(
                { messages: [{ role: 'user', content: userInput }] },
                { configurable: { thread_id: '1' } },
            );

            const parsedToolData = responseParsingService.parseNewToolMessages(response);

            // Assuming a single tool call per response, but parsedToolData might contain an array of tool calls made since the last agent.invoke
            const toolCall = parsedToolData[0];

            // 1. Handle case when NO tool was called (simple chat)
            if (!toolCall) {
                console.log(
                    `AI: ${response.messages[response.messages.length - 1].content ?? JSON.stringify(response)}`,
                );
                // 2. Handle QUERY tool calls
            } else {
                console.log(
                    `\nAI: ${response.messages[response.messages.length - 1].content ?? JSON.stringify(response)}`,
                ); // <- agent response text generated based on the tool call response
                console.log('\n--- Tool Data ---');
                console.log('Direct tool response:', toolCall.parsedData.humanMessage); // <- you can use this string for a direct tool human-readable response.
                console.log('Full tool response object:', JSON.stringify(toolCall.parsedData, null, 2)); // <- you can use this object for convenient tool response extraction
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }
}

bootstrap()
    .catch(err => {
        console.error('Fatal error during CLI bootstrap:', err);
        process.exit(1);
    })
    .then(() => {
        process.exit(0);
    });
