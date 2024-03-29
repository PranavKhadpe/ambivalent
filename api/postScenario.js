import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    console.log("[postScenario] Request", req.body);

    const { alternatives } = req.body;

    const systemPrompt =
      "You are a smart writing assistant helping me write a short 3-5 line scene in which Harry, a character, might say one of several alternatives.";
    const prompt = `
Harry is a character in a short scene. Generate a single scene in which Harry might plausibly say any one of the alternatives above to a single other character with equal justification.

## Alternatives
"${alternatives.join('"\n"')}"

## Response Format
Your response should be a JSON object with the key "scene", whose value is a 3-5 line scene string. The scene description should end in "At this moment, Harry may say any one of the following:"
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
      temperature: 1.5,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: { type: "json_object" },
    });

    const { scene } = JSON.parse(response.choices[0].message.content);

    console.log("[postScenario] Response", scene);

    // Respond to the request
    res.status(200).json({
      scenario: scene,
    });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
