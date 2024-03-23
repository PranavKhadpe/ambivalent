import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    // Log the received data
    console.log("[postMessage] Request", req.body);

    const { scenario, alternatives } = req.body;

    const prompt = `
Scene: ${scenario}    

Alternatives: ["${alternatives.join('",\n"')}"]

Consider the person Harry might have to say the first alternative to. Now, generate a message that Harry might say to that person, in this situation. The message should combine ALL the alternatives equally but doesn't explicate any one of the alternatives. Do not use any names of people. Your response should only include the message. It should begin and end with the " character.
`;

    const messageresponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
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
      // response_format: { type: "json_object" },
    });

    console.log(
      "[postMessage] LLM Response",
      messageresponse.choices[0].message.content
    );

    // Respond to the request
    res.status(200).json({
      message: messageresponse.choices[0].message.content,
    });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
