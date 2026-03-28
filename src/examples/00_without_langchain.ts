import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI({ 
    apiKey: process.env.GLOBANT_API_KEY,
    baseURL: "https://api.clients.geai.globant.com",
});

const getSentiment = async (text: string) => {
  const response = await openai.chat.completions.create({
    model: process.env.GLOBANT_MODEL!,
    messages: [
      {
        role: "user",
        content: `
        Extract sentiment from the text below.
        Return strict JSON like:
        { "sentiment": "positive | negative | neutral", "Confidence": 0 | 1 }

        Text: "${text}"
        `
      }
    ]
  });

  const raw = response.choices[0].message.content;
  console.log("Raw response from API:", raw);

  // 😬 Hope this works...
  return JSON.parse(raw!);
}

getSentiment("I love this product!").then(console.log).catch(console.error);











// without \`\`\`json

// ```json
// { "sentiment": "positive" }
// ```
//
//
// { "sentiment": "positive" }
//