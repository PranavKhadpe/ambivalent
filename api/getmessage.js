import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    // Log the received data
    console.log("Received data:", req.body);

    const { alternatives, weights } = req.body;

    const alternativesArray = alternatives;

    let scenariogettingprompt = "Alternatives: [\n";
    for (let i = 0; i < alternativesArray.length; i++) {
      scenariogettingprompt += '"' + alternativesArray[i] + '",\n';
    }
    scenariogettingprompt +=
      ']\n\nHarry is a character in a scene. Generate a single scene in which Harry might plausibly say any one of the alternatives above to a single character with equal justification. Your response should only include a json object with one attribute, "scene", whose value is a string that describes the scene. The scene description should end in "At this moment, Harry may say any one of the following:"';
    console.log(scenariogettingprompt);
    const scenarioresponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: scenariogettingprompt,
        },
      ],
      temperature: 1.04,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log(
      "Response data:",
      JSON.parse(scenarioresponse.choices[0].message.content)
    );

    let messagegettingprompt =
      '{\n  "scene": "' +
      JSON.parse(scenarioresponse.choices[0].message.content).scene +
      '"\n}\n\nAlternatives: [\n   ';
    for (let i = 0; i < alternativesArray.length; i++) {
      messagegettingprompt += '"' + alternativesArray[i] + '",\n   ';
    }
    messagegettingprompt +=
      "]\n\n\nConsider the person Harry might have to say the first alternative to. Now, generate a message that Harry might say to that person, in this situation. The message should combine ALL the alternatives equally but doesn't explicate any one of the alternatives. Do not use any names of people. Your response should only include the message. It should begin and end with the \" character.";

    const messageresponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: messagegettingprompt,
        },
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log(
      "Message Response data:",
      messageresponse.choices[0].message.content
    );

    // Respond to the request
    res
      .status(200)
      .json({ message: messageresponse.choices[0].message.content });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
