import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    console.log("[postAlternatives] Request", req.body);

    const { utterance, numInterpretations } = req.body;

    const prompt = `I have an intent that I want to convey but I want to obscure it in my message by also including other intents. Each intent is unique.
  
## Original Intent
My original intent is the following: "${utterance}". 

## Number of Requested Intents
I want to include the following number of alternate intents alongside my original intent: ${numInterpretations}.

## Response Format
Your response should be an array with length equal to the number of requested intents. Each entry in the array should be one alternate intent. If 3 intents are requested, the format of the array is : ["Intent 1", "Intent 2", "Intent 3"]. Your message should only include this array and end in the closing brace of the array, i.e. ']'. That should be the last character.

## Generation procedure
If the number of requested intents is 1, then the alternate intent, Intent 1, should be a complete contradiction of the Original Intent.
If the number of requested intents is 2, then the alternate intent, Intent 1, should be a complete contradiction of the Original Intent. Intent 2 should be something that is unrelated to both the Original Intent and Intent 1.
If the number of requested intents is 3 or more, then the alternate intent, Intent 1, should be a complete contradiction of the Original Intent. Intent 2 should be something that is unrelated to both the Original Intent and Intent 1. Every subsequent intent should be unrelated to all intents that have come prior.

## Final Check
Make sure that the length of the array in the response is equal to the number of requested intents`;

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
      // response_format: { type: "json_object" },
    });

    console.log(
      "[postAlternatives] LLM Response",
      response.choices[0].message.content
    );

    let alternativesArray = JSON.parse(response.choices[0].message.content);
    if (alternativesArray.length > numInterpretations) {
      alternativesArray.splice(numInterpretations);
    }
    //add utterance to the start of the array
    alternativesArray.unshift(utterance);

    console.log("[postAlternatives] Final Response", alternativesArray);

    // Respond to the request
    res.status(200).json({
      alternatives: alternativesArray,
    });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
