import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { groqModel as model } from "../model";
import { getWeather } from "../tools/get_weather";
import { tracer } from "../tracer";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";

const agent = createAgent({
    model,
    tools: [getWeather],
    systemPrompt: "You are a helpful assistant.", 
});

const result = await agent.invoke(
    { messages: [new HumanMessage("What is the current weather in Paris? Give me 3 things to do for this specific weather.")] },
    // { callbacks: [tracer], tags: ["agent", "weather"], metadata: { userId: "user-123" }},
    // { callbacks: [new ConsoleCallbackHandler({ ignoreChain: true })] },
); 
console.log("Final answer:", result.messages.at(-1)?.content);







// { callbacks: [tracer] tags: ["agent", "weather"], metadata: { userId: "user-123" }}

// { callbacks: [new ConsoleCallbackHandler({ ignoreChain: true })] }