import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { pModel as model } from "../model";

const chain = ChatPromptTemplate.fromTemplate(
    "Tell me a short story about {topic}"
).pipe(model).pipe(new StringOutputParser());

const stream = await chain.stream({ topic: "A robot learning to cook, in 200 words only" });

// let chunkNumber = 0;
for await (const chunk of stream) {
    if (!chunk || chunk.trim() === "") {
        continue; 
    }
    // chunkNumber += 1;
    process.stdout.write(`${chunk}`);
}