import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { webSearchTool } from "../tools/web_search";
import { groqModel as model } from "../model";

// Define the state using Annotation (recommended for TypeScript)
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
});

// Initialize tools
const tools = [webSearchTool];

// Bind tools to the model
const modelWithTools = model.bindTools(tools);

// Define the LLM node
const llmNode = async (state: typeof StateAnnotation.State) => {
  const response = await modelWithTools.invoke(state.messages);
  return { messages: [response] };
}

// Define routing logic - determines if we go to action or end
const shouldContinue = (state: typeof StateAnnotation.State): "action" | typeof END => {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  
  // If the LLM makes a tool call, route to action
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "action";
  }
  
  // Otherwise, end the workflow
  return END;
}

// Create the tool node (action)
const toolNode = new ToolNode(tools);

// Build the graph with proper typing
const workflow = new StateGraph(StateAnnotation)
  .addNode("llm", llmNode)
  .addNode("action", toolNode)
  .addEdge(START, "llm")
  .addConditionalEdges("llm", shouldContinue)
  .addEdge("action", "llm");

// Compile the graph
const app = workflow.compile();

// Example usage
const runAgent = async (query: string) => {
  console.log("Starting agent with query:", query);
  console.log("=".repeat(50));
  
  const inputs = {
    messages: [new HumanMessage(query)],
  };
  
  const result = await app.invoke(inputs);
  
  // Display the conversation
  console.log("\n📝 Conversation History:");
  result.messages.forEach((msg: BaseMessage, idx: number) => {
    if (msg._getType() === "human") {
      console.log(`\n${idx + 1}. 👤 Human: ${msg.content}`);
    } else if (msg._getType() === "ai") {
      const aiMsg = msg as AIMessage;
      console.log(`\n${idx + 1}. 🤖 AI: ${aiMsg.content || "(tool call)"}`);
      if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
        console.log(`   🔧 Tool Calls: ${aiMsg.tool_calls.map(tc => tc.name).join(", ")}`);
      }
    } else if (msg._getType() === "tool") {
      console.log(`\n${idx + 1}. ⚡ Tool Result: ${String(msg.content).substring(0, 100)}...`);
    }
  });
  
  // Display final answer
  const lastMessage = result.messages[result.messages.length - 1] as AIMessage;
  console.log("\n" + "=".repeat(50));
  console.log("✅ Final Answer:", lastMessage.content);
  console.log("=".repeat(50));
  
  return result;
}

// Run example
const main = async () => {
  await runAgent("What is the current weather in San Francisco and what are the top news stories today?");
}

// Uncomment to run
await main();
