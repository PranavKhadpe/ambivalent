import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    console.log("[postScenario] Request", req.body);

    const { alternatives } = req.body;

    const prompt = `
Alternatives: [
"${alternatives.join('",\n"')}"
]

Harry is a character in a scene. Generate a single scene in which Harry might plausibly say any one of the alternatives above to a single character with equal justification. Your response should only include a JSON object with one attribute, "scene", whose value is a string that describes the scene. The scene description should end in "At this moment, Harry may say any one of the following:"
`;
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
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      // response_format: { type: "json_object" },
    });

    console.log(
      "[postScenario] LLM Response",
      JSON.parse(response.choices[0].message.content)
    );

    const scenario = JSON.parse(response.choices[0].message.content);

    // Respond to the request
    res.status(200).json({
      scenario: scenario.scene,
    });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
