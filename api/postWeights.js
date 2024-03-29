import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    console.log("[postWeights] Request", req.body);

    const { alternatives, weights, message, scene } = req.body;

    const weightsSum = weights.reduce((a, b) => a + b, 0);
    const weightsNormalized = weights.map((weight) => weight / weightsSum);

    const systemPrompt =
      "You are a smart writing assistant helping me write a message that is a combination of several intents. I will give you a list of possible intents, their weights, and a message. Your job is to generate a message that represents the intents with the given weights.";
    const prompt = `
## Scene
${scene}

## Intents
"${alternatives.join('"\n"')}"

## Desired Weights
${weightsNormalized.join("\n")}

## Message
${message}

## Generation Procedure
Repeat this procedure 3 times:
1. Take the current version of the message and list of intents. For each intent, determine the extent to which the message emphasizes the intent. Let's call this weight of the intent. Your output should be an array called current_weights that contains the weight of each intent in the message. The weights should sum to 1.
2. Compare the current_weights array to the desired weights array. For indices where the current_weight is less than the desired weight, the intent needs to be emphasized, and where current_weight is higher than desired_weight, the intent needs to be de-emphasized.
3. With this in mind, rewrite the message to shift the emphasis.
4. After the procedure is over or if the current_weights match the desired weight, output the final output in the following JSON format: {finalMessage: "...", finalWeights: current_weights}.
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
      temperature: 0.25,
      max_tokens: 2056,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      // response_format: { type: "json_object" },
    });

    const responseMessage = response.choices[0].message.content;
    const lastOpenBracket = responseMessage.lastIndexOf("{");
    const lastCloseBracket = responseMessage.lastIndexOf("}");

    // console.log("[postWeights] LLM", responseMessage);
    // console.log(
    //   "[postWeights] LLM Stripped",
    //   responseMessage.substring(lastOpenBracket, lastCloseBracket + 1)
    // );

    const { finalMessage, finalWeights } = JSON.parse(
      responseMessage.substring(lastOpenBracket, lastCloseBracket + 1)
    );

    console.log("[postWeights] Response", finalMessage);

    // Respond to the request
    res.status(200).json({
      message: finalMessage,
      weights: finalWeights,
    });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
