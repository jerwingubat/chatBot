require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ 
                error: 'Invalid request: search query is required' 
            });
        }

        if (!process.env.SERPER_API_KEY) {
            return res.status(500).json({ 
                error: 'Server configuration error: Serper API key not found' 
            });
        }

        const response = await axios.post('https://google.serper.dev/search', {
            q: query,
            num: 5
        }, {
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Serper API error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(error.response?.status || 500).json({ 
            error: 'Failed to perform web search',
            details: error.response?.data || error.message,
            status: error.response?.status || 500
        });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model, searchQuery } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ 
                error: 'Invalid request: messages array is required' 
            });
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return res.status(500).json({ 
                error: 'Server configuration error: API key not found' 
            });
        }

        let searchResults = null;
        if (searchQuery) {
            try {
                const searchResponse = await axios.post('https://google.serper.dev/search', {
                    q: searchQuery,
                    num: 5
                }, {
                    headers: {
                        'X-API-KEY': process.env.SERPER_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                searchResults = searchResponse.data;
                
                messages.push({
                    role: 'system',
                    content: `Here are the search results for "${searchQuery}":\n${JSON.stringify(searchResults, null, 2)}`
                });
            } catch (error) {
                console.error('Web search failed:', error.message);
            }
        }

        console.log('Sending request to OpenRouter:', {
            model,
            messageCount: messages.length,
            hasSearchResults: !!searchResults
        });

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model || 'openai/gpt-3.5-turbo' || 'google/gemini-2.5-flash-preview',
            messages
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.SITE_URL,
                'X-Title': process.env.APP_NAME
            }
        });

        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            throw new Error('Invalid response format from OpenRouter API');
        }

        res.json(response.data);
    } catch (error) {
        console.error('OpenRouter API error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(error.response?.status || 500).json({ 
            error: 'Failed to get response from AI',
            details: error.response?.data || error.message,
            status: error.response?.status || 500
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:path', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment variables loaded:', {
        SITE_URL: process.env.SITE_URL,
        APP_NAME: process.env.APP_NAME,
        API_KEY_PRESENT: !!process.env.OPENROUTER_API_KEY,
        SERPER_API_KEY_PRESENT: !!process.env.SERPER_API_KEY
    });
});