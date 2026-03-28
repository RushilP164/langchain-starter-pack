import { TavilySearch } from "@langchain/tavily";

export const webSearchTool = new TavilySearch({
    maxResults: 3, // Optional: control the number of results
    tavilyApiKey: process.env.TAVILY_API_KEY!, // Your Tavily API key
});