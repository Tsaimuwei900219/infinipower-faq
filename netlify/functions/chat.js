const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  // 只允許 POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, role, lang } = JSON.parse(event.body);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // 依照角色切換 System Prompt
    const systemPrompt = role === 'technical'
      ? `You are a senior Field Application Engineer (FAE) for iNFiNiPOWER Technology Inc.,
specialising in the RPS-5000 series programmable AC/DC power systems.
Answer technical questions accurately and concisely. Include specs, settings,
error codes, and step-by-step procedures when relevant.
Always reply in the same language the user writes in (EN / 日本語 / 한국어 / 中文).
iNFiNiPOWER contact: brainchiu@infinipowertech.com | +886-2-25175881`
      : `You are a Sales Engineer for iNFiNiPOWER Technology Inc.
You help distributors and partners understand the RPS-5000 series AC/DC power systems.
Focus on product value, competitive advantages, applications, and ICP partner programme.
Keep answers business-friendly and persuasive. Avoid overly technical jargon.
Always reply in the same language the user writes in (EN / 日本語 / 한국어 / 中文).
iNFiNiPOWER contact: brainchiu@infinipowertech.com | +886-2-25175881`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ reply: response.content[0].text })
    };

  } catch (err) {
    console.error('Claude API error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API call failed', detail: err.message })
    };
  }
};
