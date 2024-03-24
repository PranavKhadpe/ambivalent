import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    // Log the received data
    console.log("[postNewAlternative] Request", req.body);

    const { alternatives } = req.body;

    let prompt = `I have an intent that I want to convey but I want to obscure it in my message by also including other intents. Each intent is unique. I want you to generate exactly 1 additional intent.

## Original Intent
My original intent is the following: "${alternatives[0]}". 

## Alternate Intents
I have already decided to include the following intents alongside my Original Intent:`;

    for (let i = 1; i < alternatives.length; i++) {
      prompt += `\n${i}. "${alternatives[i]}"`;
    }

    prompt += `
## Generation Procedure
Generate exactly one additional intent that would complement the Original Intent and Alternate Intents by violating expectations

## Response Format
Return only the generated intent. The response should begin with a " character and end with a " character.`;
    console.log(prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 1.04,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });
    console.log(
      "[postNewAlternative] LLM Response",
      response.choices[0].message.content
    );

    // Respond to the request
    res
      .status(200)
      .json({ newAlternative: response.choices[0].message.content });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
