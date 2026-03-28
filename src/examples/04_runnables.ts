import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { groqModel as model } from "../model";
import { RunnableBranch, RunnableLambda, RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import z from "zod";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
// import { tracer } from "../tracer";

const SPANISH_REVIEW = "Hace poco compré estos auriculares y no podría estar más contenta con mi experiencia. El producto llegó en perfectas condiciones y exactamente como se describe en la página. El sonido es nítido y la cancelación de ruido funciona de maravilla.";

export const buildRunnableSimpleSequence = async () => {
    // Step 1: Create parser
    const parser = new StringOutputParser();

    // Step 2: Create chain 1
    const template1 = ChatPromptTemplate.fromTemplate("Translate the following review to english:\n\n{Review}");
    // const translateChain = template1.pipe(model).pipe(parser);
    const translateChain = RunnableSequence.from([ template1, model, parser ]);

    // Step 3: Create chain 2
    const template2 = ChatPromptTemplate.fromTemplate("Summarize the following review in 20 words:\n\n{English_Review}");
    // const summarizeChain = template2.pipe(model).pipe(parser);
    const summarizeChain = RunnableSequence.from([ template2, model, parser ]);

    // Step 4: Create final chain
    const finalChain = RunnableSequence.from([
        {
            English_Review: translateChain,
        },
        summarizeChain,
    ]);

    // Step 5: Invoke the final chain
    const result = await finalChain.invoke({ Review: SPANISH_REVIEW });

    console.log("Final chain result (Summarized English Review):\n", result);
};

export const buildRunnableRouter_simple = async () => {
    // Step 1: Create parser
    const parser = new StringOutputParser();

    // Step 2.1: Create Physics chain
    const physicsChain = ChatPromptTemplate.fromTemplate(`You are a very smart physics professor. You are great at answering questions about physics in a concise and easy to understand manner. When you don't know the answer to a question you admit that you don't know.
        Here is a question: {input}`)
        .pipe(model)
        .pipe(parser);

    // Step 2.2: Create Math chain
    const mathChain = ChatPromptTemplate.fromTemplate(`You are a very good mathematician. You are great at answering math questions. You are so good because you are able to break down hard problems into their component parts, answer the component parts, and then put them together to answer the broader question.
        Here is a question: {input}`)
        .pipe(model)
        .pipe(parser);

    // Step 2.3: Create History chain
    const historyChain = ChatPromptTemplate.fromTemplate(`You are a very good historian. You have an excellent knowledge of and understanding of people, events and contexts from a range of historical periods. You have the ability to think, reflect, debate, discuss and evaluate the past. You have a respect for historical evidence and the ability to make use of it to support your explanations and judgements.
        Here is a question: {input}`)
        .pipe(model)
        .pipe(parser);

    // Step 2.4: Create Default chain
    const defaultChain = ChatPromptTemplate.fromTemplate("Answer the following:\n\n{input}")
        .pipe(model)
        .pipe(parser);

    // Step 3.1: Create Router Schema & Parser
    const routerSchema = z.object({
        destination: z.enum(["physics", "math", "history", "DEFAULT"]),
        next_input: z.string()   // potentially modified version of user's original input
    });
    const routerParser = StructuredOutputParser.fromZodSchema(routerSchema);

    // Step 3.2: Create Router Chain
    const classifierChain = RunnablePassthrough.assign({
        format_instructions: () => routerParser.getFormatInstructions()  // just adds one more key
    })
    .pipe(ChatPromptTemplate.fromTemplate(`
        Given a raw text input, select the best prompt for it and optionally revise the input.
        
        Available prompts:
        - physics: Good for answering questions about physics
        - math: Good for answering math questions
        - history: Good for answering history questions
        - DEFAULT: If none of the above fit
        
        {format_instructions}
        
        Input: {input}`
    ))
    .pipe(model)
    .pipe(routerParser)
    .withConfig({ runName: 'RouterStep' });

    // Step 4: Create the Branch - Router
    const branch = RunnableBranch.from([
        // [boolean, chain]
        [(data: any) => data.destination === "physics",  physicsChain],
        [(data: any) => data.destination === "math",     mathChain],
        [(data: any) => data.destination === "history",  historyChain],
        defaultChain
    ]).withConfig({ runName: 'BranchStep', tags: ["BranchStep"]  });
    
    // Step 5: Create the Final Chain
    const finalChain = RunnableSequence.from([
        classifierChain,
        RunnableLambda.from((data: any) => ({
            input: data.next_input,
            destination: data.destination
        })),
        branch,
    ]);

    // Step 6: Invoke the chain
    const eventStream = await finalChain.streamEvents(
        { input: "What is the timeline of Chola Dynasty? Give me answer in 150 words only" },
        {
            version: "v2", // Required by LangChain
            // runName: "RouterChain",
            // tags: ["agent", "router"],
            // metadata: { userId: "user-123", version: "1.0" },
            // callbacks: [new ConsoleCallbackHandler({
            //     ignoreChain: true,
            // })],
        });

    console.log("Starting execution...\n");

    // Step 7: Get the streaming chunk
    for await (const event of eventStream) {
        const eventType = event.event;

        // --- CATCH THE ROUTER DECISION ---
        // When the RouterStep finishes, grab its parsed JSON output
        if (eventType === "on_chain_end" && event.name === "RouterStep") {
            const routerDecision = event.data.output;
            console.log(`\n[System] Router chose destination: ${routerDecision.destination}\n`);
            console.log(`[System] Expert is typing...\n`);
        }

        // --- CATCH THE LLM STREAMING ---
        // When the final expert model starts streaming tokens
        if (eventType === "on_chat_model_stream" && event.tags?.includes("BranchStep")) {
            // event.data.chunk is the actual text token coming from OpenAI
            const chunk = event.data.chunk.content;
            if (chunk) {
                process.stdout.write(chunk);
            }
        }
    }
    
    console.log("\n\n--- Execution Complete ---");
};

// await buildRunnableSimpleSequence();
await buildRunnableRouter_simple();

// { configurable: {  name: 'Test' },  callbacks: [tracer], tags: ["agent", "weather"], metadata: { userId: "user-123" } }