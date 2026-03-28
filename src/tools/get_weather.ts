import { tool } from "langchain";
import z from "zod";

export const getWeather = tool(
    async ({ city }) => {
        // Simulate API call
        return `The weather in ${city} is sunny and 25°C.`;
    },
    {
        name: "getWeather",
        description: "Get the current weather for a given city", // LLM can read this
        schema: z.object({
            city: z.string().describe("The city to get the weather for")
        }),
        responseFormat: 'content', // content_and_artifact
    }
);
