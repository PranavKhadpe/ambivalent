import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    console.log("[postAlternatives] Request", req.body);

    const { utterance, numInterpretations } = req.body;

    const systemPrompt =
      "You are a smart writing assistant. I will give you an intent that I want to convey in a message I am writing. I want you to write alternate messages that convey different versions of the intent.";
    const prompt = `
## Original Intent
${utterance}

## Number of New Intents
${numInterpretations}

## Generation Procedure
${
  numInterpretations === 1
    ? "Generate exactly 1 new intent that is a complete contradiction of the original intent."
    : numInterpretations === 2
    ? `Generate exactly 2 new intents. The first intent should be a complete contradiction of the original intent. The second intent should be unrelated to both the original intent and the first intent.`
    : `Generate exactly ${numInterpretations} new intents. The first intent should be a complete contradiction of the original intent. The second intent should be unrelated to both the original intent and the first intent. Every subsequent intent should be unrelated to all intents that came before it.`
}

## Response Format
Your response should be a JSON object with the key "alternatives", whose value is a list of strings. Each string should be an alternate intent.
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
      temperature: 1 + Math.min(numInterpretations * 0.1, 1),
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      response_format: { type: "json_object" },
    });

    const { alternatives } = JSON.parse(response.choices[0].message.content);
    if (alternatives.length > numInterpretations) {
      alternatives.splice(numInterpretations);
    }
    // Add utterance to the start of the array
    alternatives.unshift(utterance);

    console.log("[postAlternatives] Response", alternatives);

    // Respond to the request
    res.status(200).json({
      returnedalternatives: alternatives,
    });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
