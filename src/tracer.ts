import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
import { Client } from "langsmith";

const client = new Client({
    apiKey: process.env.LANGSMITH_API_KEY!,
    apiUrl: process.env.LANGSMITH_ENDPOINT!,
});

export const tracer = new LangChainTracer({
    projectName: "first",
    client,
    ignoreChain: true,
    // ignoreAgent: true,
    // ignoreCustomEvent: true,
    // ignoreRetriever: true,
    // ignoreLLM: false,
  });