require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5500', // Update this to match your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10mb' })); // Increase payload limit

// Environment variables
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Summarization endpoint
app.post('/api/summarize', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Truncate text if it's too long
        const truncatedText = text.length > 100000 ? text.substring(0, 100000) : text;

        const prompt = `You are a professional text summarization assistant. Please summarize the following text with the following requirements:
1. Keep it concise and clear
2. Highlight key information
3. Use bullet points
4. Keep the summary under 300 words

Text content:
${truncatedText}`;

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 1000,
                temperature: 0.7,
                system: "You are a professional text summarization assistant.",
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Claude API Error:', errorData);
            throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        if (!data.content || !data.content[0] || !data.content[0].text) {
            throw new Error('Invalid API response format');
        }

        res.json({ summary: data.content[0].text.trim() });
    } catch (error) {
        console.error('Summarization failed:', error);
        res.status(500).json({ 
            error: 'Failed to generate summary',
            details: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        details: err.message 
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Health check available at http://localhost:${port}/api/health`);
}); 