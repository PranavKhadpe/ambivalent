import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method === "POST") {
    // Log the received data
    console.log("Received data:", req.body);

    const { utterance, numinterpretations } = req.body;

    const prompt =
      'I have an intent that I want to convey but I want to obscure it in my message by also including other intents. Each intent is unique.\n##Original Intent\nMy original intent is the following: "' +
      utterance +
      '". \n##Number of Requested Intents\nI want to include the following number of alternate intents alongside my original intent: ' +
      numinterpretations +
      '.\n##Response Format\nYour response should be an array with length equal to the number of requested intents. Each entry in the array should be one alternate intent.  If 3 intents are requested, the format of the array is : ["Intent 1", "Intent 2", "Intent 3"]. Your message should only include this array and end in the closing brace of the array\']\'. That should be the last character.\n##Generation procedure\n1. If the number of requested intents is 1, then the alternate intent, Intent 1, should be a complete contradiction of the Original Intent.\n2. If the number of requested intents is 2, then the alternate intent, Intent 1, should be a complete contradiction of the Original Intent. Intent 2 should be something that is unrelated to both the Original Intent and Intent 1.\n3. If the number of requested intents is 3 or more, then the alternate intent, Intent 1, should be a complete contradiction of the Original Intent. Intent 2 should be something that is unrelated to both the Original Intent and Intent 1. Every subsequent intent should be unrelated to all intents that have come prior.\n##Final Check\nMake sure that the length of the array in the response is equal to the number of requested intents';

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
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
    });

    console.log("Response data:", response.choices[0].message.content);

    let alternativesArray = JSON.parse(response.choices[0].message.content);
    if (alternativesArray.length > numinterpretations) {
      alternativesArray.splice(numinterpretations);
    }
    //add utterance to the start of the array
    alternativesArray.unshift(utterance);

    console.log("Backend alternatives:" + alternativesArray);

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
    res.status(200).json({
      alternatives: response.choices[0].message.content,
      scene: JSON.parse(scenarioresponse.choices[0].message.content).scene,
      message: messageresponse.choices[0].message.content,
    });
  } else {
    // Handle other request methods if necessary, or return an error
    res.status(405).json({ error: "Method not allowed" });
  }
};
