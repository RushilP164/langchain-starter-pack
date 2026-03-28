import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import z from "zod";
import { groqModel as model } from "../model";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const SPANISH_REVIEW = "Hace poco compré estos auriculares y no podría estar más contenta con mi experiencia. El producto llegó en perfectas condiciones y exactamente como se describe en la página. El sonido es nítido y la cancelación de ruido funciona de maravilla.";

export const buildSimpleChain = async () => {
    // Step 1: Create a schema
    const schema = z.object({
        sentiment: z.string(),
        confidence: z.number(),
        // 60/65 more sproper
    });
    // Step 1.1: Create a parser from the schema
    const parser = StructuredOutputParser.fromZodSchema(schema);
    // Step 1.2: Get format instructions
    const formatInstructions = parser.getFormatInstructions();

    // Step 2: Create a template
    const template = ChatPromptTemplate.fromTemplate(`
        Analyze the sentiment of this review.
        {formatInstructions}
        Text: {review}
    `);
    const review = "I absolutely love this product!";

    // Step 3: Create a chain
    const chain = await template.pipe(model).pipe(parser);

    // Step 4: Invoke the chain
    const result = await chain.invoke({ formatInstructions, review });

    console.log("Final result:", result, typeof result);
    console.log("Sentiment:", result.sentiment);
    console.log("Confidence:", result.confidence);
}

export const buildSequentialChain = async () => {
    // Step 1: Create parser
    const parser = new StringOutputParser();

    // Step 2: Create chain 1
    const translateChain = ChatPromptTemplate.fromTemplate(
        "Translate the following review to english:\n\n{Review}"
    ).pipe(model).pipe(parser);

    // Step 3: Create chain 2
    const summarizeChain = ChatPromptTemplate.fromTemplate(
        "Summarize the following review in 20 words:\n\n{English_Review}"
    ).pipe(model).pipe(parser);

    // Step 4: Create final chain
    const finalChain = 
        translateChain
        .pipe(async (resultOne) => ({ English_Review: resultOne }))
        .pipe(summarizeChain);

    // Step 5: Invoke the final chain
    const result = await finalChain.invoke({ Review: SPANISH_REVIEW });

    console.log("Final chain result (Summarized English Review):\n", result);
    
}


// await buildSimpleChain();
await buildSequentialChain();