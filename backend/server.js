const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// POST Route at /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY is not defined in the environment variables.');
      return res.status(500).json({ error: 'DeepSeek API key is not configured on the server.' });
    }

    // Construct the messages payload
    // Prefixes with the system prompt, appends history, and then the latest user message
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful customer support assistant. Be concise, polite, and professional.'
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API failed:', errorData);
      return res.status(response.status).json({ error: 'DeepSeek API request failed' });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Error handling /api/chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
