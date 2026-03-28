import { createAgent, tool } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { groqModel as model } from "../model";
import { webSearchTool } from "../tools/web_search";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";

const agent = createAgent({
    model,
    tools: [webSearchTool],
    systemPrompt: "You are a helpful assistant.", 
})
.withConfig({ 
    callbacks: [new ConsoleCallbackHandler({ ignoreChain: true, ignoreLLM: false, ignoreCustomEvent: true, ignoreRetriever: true, ignoreAgent: false })] });

const result = await agent.invoke({
    messages: [new HumanMessage("What are the top 3 tech headlines from the last 24 hours? For each, explain why it's significant for investors.")]
});

console.log("Final answer:", result.messages.at(-1)?.content);