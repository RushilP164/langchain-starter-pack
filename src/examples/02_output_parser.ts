import { StructuredOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import z from "zod";
import { groqModel as model } from "../model";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export const runStructuredOutputParser = async () => {
    // Step 1: Create a schema & parser
    const schema = z.object({
        sentiment: z.string().describe('Sentiment of the review'),
        confidence: z.number().describe('Confidence for the sentiment | Must be from 0 to 1'),
    });

    // Step 1.1: Create a parser from the schema
    const parser = StructuredOutputParser.fromZodSchema(schema);
    // Step 1.2: Get format instructions
    const formatInstructions = parser.getFormatInstructions();

    // Step 2: Create a template & prompt
    const template = ChatPromptTemplate.fromTemplate(`
      Analyze the sentiment of this review.
      {formatInstructions}
      Text: {review}
    `);
    const review = "I absolutely love this product!";
    const prompt = await template.format({ formatInstructions, review });

    // Step 3: Invoke the LLM model
    const rawModelResponse = await model.invoke(prompt);
    console.log("Raw model response:", rawModelResponse);

    // Step 4: Invoke the parser
    const finalResult = await parser.invoke(rawModelResponse);
    console.log("Final result:", finalResult, typeof finalResult);
    // Access the structured output
    console.log("=================================");
    console.log("Sentiment:", finalResult.sentiment);
    console.log("Confidence:", finalResult.confidence);
};

export const runStringOutputParser = async () => {
    // Step 1: Create a parser
    const parser = new StringOutputParser();

    // Step 2: Create a template & prompt
    const template = ChatPromptTemplate.fromTemplate("Tell me a fun fact about {topic}, in 25 words only");
    const prompt = await template.format({ topic: "space" });
    
    // Step 3: Invoke th LLM model
    const rawModelResponse = await model.invoke(prompt);
    
    // Step 4: Invoke the parser
    const result = await parser.invoke(rawModelResponse);
    console.log("Final result:", result);
}

// await runStructuredOutputParser();
await runStringOutputParser();


// CommaSeparatedListOutputParser: "red, blue, green" → ["red", "blue", "green"]
// XMLOutputParser: "<item><name>Item 1</name><value>10</value></item>" → { name: "Item 1", value: 10 }