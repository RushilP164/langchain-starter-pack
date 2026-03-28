import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import "dotenv/config";


export const model = new ChatOpenAI({
  model: process.env.GLOBANT_MODEL,
  apiKey: process.env.GLOBANT_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: "https://api.clients.geai.globant.com",
  },
});


export const pModel = new ChatOpenAI({
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENROUTER_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost",
      "X-Title": "my-app-name",
    },
  }
});

export const groqModel = new ChatGroq({
  model: "llama-3.3-70b-versatile", // openai/gpt-oss-120b
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0,
  // baseUrl: "https://api.groq.com/v1",
});
