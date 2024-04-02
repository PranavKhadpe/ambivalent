import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    // Log the received data
    console.log("[postMessage] Request", req.body);

    const { scenario, alternatives } = req.body;

    const systemPrompt =
      "You are a smart writing assistant. I will give you a scene with a list of possible ways a character might respond. Your job is to generate a message that represents the intents of all the alternatives.";
    const prompt = `
## Scene
${scenario}
"${alternatives.join('",\n"')}"

## Generation Procedure
Consider the person Harry is speaking to. Generate a short message that Harry might say to the person in this situation. The message should combine the intents of ALL the alternatives equally and shouldn't explicate any one of the alternatives. Use pronouns instead of names of people.

## Response Format
Your response should be a JSON object with the key "response", whose value is Harry's response combining the intents of all the alternatives.
`;

    console.log(prompt);

    const messageresponse = await openai.chat.completions.create({
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
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: { type: "json_object" },
    });

    const { response } = JSON.parse(messageresponse.choices[0].message.content);

    console.log("[postMessage] Response", response);

    // Respond to the request
    res.status(200).json({
      message: response,
    });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
