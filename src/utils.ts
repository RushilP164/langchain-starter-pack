import * as readline from "readline";

export const waitForEnter = (message?: string): Promise<void> => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(`\n\n👉 ${message} — Press Enter to continue...\n\n`, () => {
            rl.close();
            resolve();
        });
    });
}

export const getUserInput = (prompt: string): Promise<string> => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};