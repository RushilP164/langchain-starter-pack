import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { groqModel as model } from "../model";
import { getUserInput } from "../utils";

export const runWithoutMemory = async () => {
    const chain = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant."],
        ["human", "{input}"]
    ]).pipe(model).pipe(new StringOutputParser());

    // First input
    const input1 = await getUserInput("You: ");
    const result1 = await chain.invoke({ input: input1 });
    console.log("AI:", result1);

    // Second input — AI has no memory of first message
    const input2 = await getUserInput("You: ");
    const result2 = await chain.invoke({ input: input2 });
    console.log("AI:", result2);
};

export const runWithMemory = async () => {
    // Step 1: Create a simple store object.
    const store: Record<string, InMemoryChatMessageHistory> = {};

    // Step 2: Create a method to fetch history with sessionId
    const getHistory = (sessionId: string) => {
        if (!store[sessionId]) store[sessionId] = new InMemoryChatMessageHistory();
        return store[sessionId];
    };

    // Step 3: Create a chain
    const chain = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant."],
        new MessagesPlaceholder("history"),
        ["human", "{input}"]
    ]).pipe(model).pipe(new StringOutputParser());

    // Step 4: Create a runnable with chain and getMessageHistory
    const runnableChain = new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: getHistory,
        inputMessagesKey: "input",
        historyMessagesKey: "history",
    });

    // Step 5: create a config which provides a sessionId
    const config = { configurable: { sessionId: "user_1" } };

    // Step 6.1: Invoke the chain with config
    // First input
    const input1 = await getUserInput("You: ");
    const result1 = await runnableChain.invoke({ input: input1 }, config);
    console.log("AI:", result1);

    const history = await getHistory("user_1").getMessages();
    console.log("\n\n=============================================================");
    console.log("Chat history after first interaction:", history);
    console.log("=============================================================\n\n");


    // Step 6.2: Invoke the chain again with config
    // Second input
    const input2 = await getUserInput("You: ");
    const result2 = await runnableChain.invoke({ input: input2 }, config);
    console.log("AI:", result2);
};


// await runWithoutMemory();
await runWithMemory();