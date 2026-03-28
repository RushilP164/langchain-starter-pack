import { ChatPromptTemplate } from "@langchain/core/prompts";
import { groqModel as model } from "../model";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";

export const generateSingleShot = async () => {
    // Step 1: Create a template
    const template = ChatPromptTemplate.fromTemplate(
        "Translate the following text into a {tone} tone: {text}"
    );
    // Step 2: Create a prmompt from re-usable template
    const prompt = await template.format({
        tone: "formal",
        text: "Can you send me the contract today?"
    });

    console.log("===============================");
    console.log(prompt);
    console.log("===============================");
    console.log("Prompt variables =>", template.inputVariables);

    return prompt;
}

export const generateFewShot = async () => {
    // Step 1: Create a template with role-based messages
     const template = ChatPromptTemplate.fromMessages([
        { role: "system", content: "You are a helpful assistant that translates text into different tones." },
        { role: "user", content: "Translate the following text into a {tone} tone: {text}" },
        // ...
    ]);
    // Step 2: Create a prompt from template
    const prompt = await template.format({
        tone: "formal",
        text: "Can you send me the contract today?"
    });

    console.log("===============================");
    console.log(prompt);
    console.log("===============================");
    console.log("Prompt variables =>", template.inputVariables);

    return prompt;
}

export const run = async (prompt: BaseLanguageModelInput) => {
    console.log("Running the prompt against the model...");
    const result = await model.invoke(prompt);
    console.log("===============================");
    console.log(result.content);
}



// await generateSingleShot();
const fewShotPrompt = await generateFewShot();
await run(fewShotPrompt);
