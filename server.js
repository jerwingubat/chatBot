require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// OpenRouter API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model } = req.body;
        
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model || 'openai/gpt-3.5-turbo',
            messages
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.SITE_URL,
                'X-Title': process.env.APP_NAME
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('OpenRouter API error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: error.response?.data || error.message 
        });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});