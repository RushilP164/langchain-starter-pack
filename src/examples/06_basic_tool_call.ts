import { HumanMessage, ToolMessage, AIMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "langchain";
import { groqModel as model } from "../model";
import { getWeather } from "../tools/get_weather";

// Step 1: Create tools
const tools: Record<string, DynamicStructuredTool>  = { getWeather };

// Step 2: Bind the tools with LLM
const llmWithTools = model.bindTools(Object.values(tools));

// Step 3: Invoke the LLM
const messages = [new HumanMessage("What is the current weather in Paris? Give me 3 things to do for this specific weather.")];
const firstResponse: AIMessage = await llmWithTools.invoke(messages);
console.log("LLM tool call decision:", firstResponse);

// Step 4: Check if LLM is asking to invoke any tool or not.
const toolCall = firstResponse.tool_calls![0];
const selectedTool = tools[toolCall.name]; // 'getWeather'
// Step 4.1: Invoke the given tool by LLM with given arguments.
const toolResult = await selectedTool.invoke(toolCall.args!);
console.log("\nTool result:", toolResult);

// Step 5: Invoke the LLM again with with tool response.
const finalResponse = await llmWithTools.invoke([
    ...messages,
    firstResponse,
    new ToolMessage({
        content: toolResult,
        tool_call_id: toolCall.id!
    }),
]);

console.log("\nFinal answer:", finalResponse.content);






// ```
// The flow is exactly:
// ```
// HumanMessage → LLM (decides tool + args)
//              → Tool (executes with those args)
//              → LLM (receives tool result, gives final structured answer)





// AIMessage {
//     "content": "<EMPTY>",
//     "additional_kwargs": {},
//     "response_metadata": {},
//     "tool_calls": [
//         { name: "getWeather", args: { city: 'Paris' }, ... },
//         ...
//     ],
//     "invalid_tool_calls": []
//   }