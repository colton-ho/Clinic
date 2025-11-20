async function generateLLMReply(role, message, context = {}) {
  // Placeholder deterministic reply to keep demo offline-friendly.
  const contextKeys = Object.keys(context || {});
  return `AI assistant (${role}) received your message: "${message}". This is a demo response. Context keys: ${contextKeys.join(
    ', '
  ) || 'none'}. For medical concerns, please consult a clinician.`;

  /*
  // Example OpenAI Chat Completions call (disabled):
  // const { Configuration, OpenAIApi } = require('openai');
  // const apiKey = process.env.OPENAI_API_KEY;
  // if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  // const client = new OpenAIApi(new Configuration({ apiKey }));
  // const completion = await client.createChatCompletion({
  //   model: 'gpt-4o-mini',
  //   messages: [
  //     { role: 'system', content: 'You are a friendly clinical assistant. Do not give real medical advice.' },
  //     { role: 'user', content: message }
  //   ]
  // });
  // return completion.data.choices[0].message.content;
  */
}

module.exports = { generateLLMReply };
