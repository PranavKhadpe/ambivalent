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

    const filtered_weights = [];
    const filtered_alternatives = [];

    //iterate through the weights and alternatives and filter out the ones with 0 weight
    weightsNormalized.forEach((weight, index) => {
      if (weight > 0) {
        filtered_weights.push(weight);
        filtered_alternatives.push(alternatives[index]);
      }
    });

    const prompt = `
## Scene
${scene}
## Intents
[${filtered_alternatives.join(",\n")}]

## desired_weights: [${filtered_weights.join(",")}]

## Message
${message}
## Do the following
1. Take the current version of the message and list of intents. For each intent, determine the extent to which the message emphasizes the intent. Let's call this weight of the intent. Your output should be an array called actual_weights that contains the weight of each intent in the message. The weights should sum to 1.
2. Compare the actual_weights array to the desired_weights array. For indices where the actual_weight is less than the desired_weight, the intent needs to be emphasized, and where actual_weight is higher than desired_weight, the intent needs to be de-emphasized.
3. If the actual_weights array is already equal to the desired_weights array, the message has converged. Output the JSON object {finalMessage: string (old message), converged: true}.
4. If not, write a new message that is short (2-3 lines) and shifts the emphasis. This is rewritten_message.
4. Output the final output in the following JSON format: {finalMessage: rewritten_message, converged: false }.
`;

    console.log(prompt);
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
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
      response_format: { type: "json_object" },
    });

    // const responseMessage = response.choices[0].message.content;
    // const lastOpenBracket = responseMessage.lastIndexOf("{");
    // const lastCloseBracket = responseMessage.lastIndexOf("}");

    // console.log("[postWeights] LLM", responseMessage);
    // console.log(
    //   "[postWeights] LLM Stripped",
    //   responseMessage.substring(lastOpenBracket, lastCloseBracket + 1)
    // );

    // const { finalMessage, finalWeights } = JSON.parse(
    //   responseMessage.substring(lastOpenBracket, lastCloseBracket + 1)
    // );

    console.log("[postWeights] Response", response.choices[0].message.content);
    const { finalMessage, converged } = JSON.parse(
      response.choices[0].message.content
    );

    console.log(finalMessage, converged);

    // Respond to the request
    res.status(200).json({
      message: finalMessage,
      converged,
    });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
