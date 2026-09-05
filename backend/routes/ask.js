const express = require('express');
const Groq = require('groq-sdk');
const { retrieveContext } = require('../utils/rag');

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post('/ask', async (req, res) => {
  try {
    const { question, repoName } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'question is required'
      });
    }

    if (!repoName) {
      return res.status(400).json({
        error: 'repoName is required'
      });
    }

    const results = await retrieveContext(
      question,
      repoName
    );

    const context = results
      .map(
        r =>
          `\n--- ${r.file_path} ---\n${r.chunk_text}\n`
      )
      .join('\n');

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',

      messages: [
        {
          role: 'system',
          content: `
You are a helpful codebase assistant.

Answer the user's question using only the provided code context.

The provided context comes from this repository:
${repoName}

If the answer cannot be found in the provided context, say that you cannot find it.

Do not invent:
- file paths
- code
- functions
- project behavior

Base your answer only on the retrieved repository evidence.
`
        },

        {
          role: 'user',
          content: `Question:
${question}

Code context:
${context}`
        }
      ]
    });

    const answer =
      completion.choices[0].message.content;

    res.json({
      answer,
      sourceFiles: results.map(
        r => r.file_path
      )
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'ask failed',
      details: err.message
    });
  }
});

module.exports = router;