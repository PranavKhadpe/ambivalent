import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    console.log("[postNewAlternative] Request", req.body);

    const { alternatives } = req.body;

    const systemPrompt =
      "You are a smart writing assistant. I will give you a list of intents that I want to convey in a message I am writing. I want you to write one alternate messages that conveys a different and unrelated version of the intent.";
    const prompt = `\
I have an intent that I want to convey but I want to obscure it in my message by also including other intents. Each intent is unique. I want you to generate exactly 1 additional intent.

## Original Intent
${alternatives[0]}

## Alternate Intents
"${alternatives.join('"\n"')}"

## Generation Procedure
Generate exactly one additional intent that would complement the original intent and alternate intents by violating expectations.

## Response Format
Return a JSON object with the key "alternative" whose value is a string representing the new intent.\
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 1.6,
      max_tokens: 128,
      top_p: 1,
      frequency_penalty: 0.8,
      presence_penalty: 0.8,
      response_format: { type: "json_object" },
    });

    const { alternative } = JSON.parse(response.choices[0].message.content);

    console.log("[postNewAlternative] Response", alternative);

    // Respond to the request
    res.status(200).json({ newAlternative: alternative });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
