const express = require('express');
const Groq = require('groq-sdk');
const { retrieveContext } = require('../utils/rag');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const results = await retrieveContext(question);

    const context = results
      .map(r => `\n--- ${r.file_path} ---\n${r.chunk_text}\n`)
      .join('\n');

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b', // use whatever model actually worked in test-rag.js
      messages: [
        {
          role: 'system',
          content: 'You are a helpful codebase assistant. Answer questions using the provided code context. If the answer cannot be found in the context, say you cannot find it.'
        },
        {
          role: 'user',
          content: `Question:\n${question}\n\nCode context:\n${context}`
        }
      ]
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer, sourceFiles: results.map(r => r.file_path) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ask failed', details: err.message });
  }
});

module.exports = router;