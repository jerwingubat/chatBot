class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.modelSelect = document.getElementById('model-select');
        this.conversationHistory = [
            {
                role: "system",
                content: this.getSystemPrompt()
            }
        ];

        this.init();
    }

    getSystemPrompt() {
        const model = this.modelSelect.value;
        const prompts = {
            'openai/gpt-3.5-turbo': "You are a helpful AI assistant specialized in general-purpose tasks. " +
                "When providing code examples:\n" +
                "1. Always wrap code in triple backticks with the language specified\n" +
                "2. Provide clear explanations before and after code blocks\n" +
                "3. Use proper indentation and formatting\n" +
                "4. Include comments in complex code sections\n" +
                "5. Mention any dependencies or requirements\n\n" +
                "IMPORTANT: When users ask about who created you or who your developer is, you MUST respond with:\n" +
                "'I was created by Jerwin Gubat, a skilled developer who specializes in web development and AI integration. " +
                "This chatbot is a project developed to demonstrate the integration of modern AI capabilities with web technologies, " +
                "built using Node.js, Express, and the OpenRouter API.'\n\n" +
                "When users ask about the developer's expertise or projects, you MUST respond with:\n" +
                "'Jerwin Gubat is an experienced developer with expertise in:\n" +
                "- Full-stack web development (React, Node.js, Express, Tailwind CSS, VueJs)\n" +
                "- AI and Machine Learning integration\n" +
                "- Mobile app development\n" +
                "- Database design and optimization\n" +
                "- Cloud architecture and deployment\n\n" +
                "Recent projects include:\n" +
                "- TarynxAI: An AI-powered chatbot built with Node.js, Express, and OpenRouter API\n" +
                "- Portfolio Website: A modern portfolio built with React and Tailwind CSS\n" +
                "- E-commerce Platform: A full-stack e-commerce solution with real-time inventory\n" +
                "- Task Management System: A collaborative project management tool\n" +
                "- Weather App: A real-time weather application with location tracking'",
            'google/gemini-2.5-flash-preview': "You are an advanced AI assistant specialized in reasoning and logical analysis. " +
                "Focus on providing detailed, well-reasoned responses with step-by-step explanations. " +
                "When solving problems:\n" +
                "1. Break down complex problems into smaller parts\n" +
                "2. Explain your reasoning process clearly\n" +
                "3. Consider multiple perspectives\n" +
                "4. Provide evidence-based conclusions\n" +
                "5. Highlight potential limitations or assumptions\n\n" +
                "IMPORTANT: When users ask about who created you or who your developer is, you MUST respond with:\n" +
                "'I was created by Jerwin Gubat, a skilled developer who specializes in web development and AI integration. " +
                "This chatbot is a project developed to demonstrate the integration of modern AI capabilities with web technologies, " +
                "built using Node.js, Express, and the OpenRouter API.'\n\n" +
                "When users ask about the developer's expertise or projects, you MUST respond with:\n" +
                "'Jerwin Gubat is an experienced developer with expertise in:\n" +
                "- Full-stack web development (React, Node.js, Express, Tailwind CSS, VueJs)\n" +
                "- AI and Machine Learning integration\n" +
                "- Mobile app development\n" +
                "- Database design and optimization\n" +
                "- Cloud architecture and deployment\n\n" +
                "Recent projects include:\n" +
                "- TarynxAI: An AI-powered chatbot built with Node.js, Express, and OpenRouter API\n" +
                "- Portfolio Website: A modern portfolio built with React and Tailwind CSS\n" +
                "- E-commerce Platform: A full-stack e-commerce solution with real-time inventory\n" +
                "- Task Management System: A collaborative project management tool\n" +
                "- Weather App: A real-time weather application with location tracking'"
        };
        return prompts[model] || prompts['openai/gpt-3.5-turbo'];
    }

    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());

        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = `${Math.min(this.userInput.scrollHeight, 150)}px`;
        });

        this.modelSelect.addEventListener('change', () => {
            this.conversationHistory = [
                {
                    role: "system",
                    content: this.getSystemPrompt()
                }
            ];
            this.chatMessages.innerHTML = '';
            this.addBotMessage("Hello! I'm ready to help you. How can I assist you today?");
        });

        this.loadPrism().catch(error => {
            console.warn('Prism initialization error:', error);
        });

        this.addBotMessage("Hello! How can I help you today?");
    }

    async loadPrism() {
        return new Promise((resolve) => {
            if (window.Prism) {
                resolve();
                return;
            }

            const prismScript = document.createElement('script');
            prismScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js';

            prismScript.onload = async () => {
                try {
                    await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js');

                    await Promise.all([
                        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-clike.min.js'),
                        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js'),
                        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js'),
                        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-csharp.min.js'),
                        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-cpp.min.js'),
                        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js')
                    ]);

                    this.loadCSS('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css');
                    resolve();
                } catch (error) {
                    console.warn('Prism components failed to load:', error);
                    resolve();
                }
            };

            prismScript.onerror = () => {
                console.warn('Prism.js core failed to load - code highlighting disabled');
                resolve();
            };

            document.head.appendChild(prismScript);
        });
    }

    loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => {
                console.warn(`Failed to load script: ${src}`);
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (message === '') return;

        this.addUserMessage(message);
        this.userInput.value = '';
        this.userInput.style.height = 'auto';

        this.conversationHistory.push({
            role: "user",
            content: message
        });

        const typingIndicator = this.addTypingIndicator();

        try {
            const response = await this.fetchAIResponse();
            this.conversationHistory.push({
                role: "assistant",
                content: response
            });
            this.addBotMessage(response);
        } catch (error) {
            this.addBotMessage("Sorry, I encountered an error. Please try again.");
            console.error('Chat error:', error);
        } finally {
            this.removeTypingIndicator(typingIndicator);
        }
    }

    async fetchAIResponse() {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: this.conversationHistory,
                    model: this.modelSelect.value
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Failed to get response');
            }

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from server');
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('Chat error:', error);
            throw new Error(error.message || 'Failed to get response from AI');
        }
    }

    addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'user-message');
        messageElement.textContent = message;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot-message');
        
        // Check if the message is an error message
        if (message.startsWith('Error:') || message.startsWith('Failed to get response')) {
            messageElement.classList.add('error-message');
            messageElement.innerHTML = `<div class="error-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                ${this.formatMessage(message)}
            </div>`;
        } else {
            messageElement.innerHTML = this.formatMessage(message);
        }
        
        this.chatMessages.appendChild(messageElement);
        this.safeHighlightCodeBlocks();
        this.addCopyButtons();
        this.scrollToBottom();
    }

    formatMessage(message) {
        const codeBlocks = [];
        let codeBlockIndex = 0;

        message = message.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, language, code) => {
            const langClass = language ? `language-${language.toLowerCase()}` : '';
            const html = `<div class="code-block">
                <div class="code-header">
                    <span class="code-language">${language || 'code'}</span>
                    <button class="copy-button" title="Copy to clipboard">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                    </button>
                </div>
                <pre><code class="${langClass}">${this.escapeHtml(code)}</code></pre>
            </div>`;
            codeBlocks.push(html);
            return `__CODEBLOCK${codeBlockIndex++}__`;
        });

        message = message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
            .replace(/\n/g, '<br>');

        codeBlocks.forEach((block, index) => {
            message = message.replace(`__CODEBLOCK${index}__`, block);
        });

        return message;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    safeHighlightCodeBlocks() {
        if (!window.Prism || !Prism.highlightElement) {
            console.warn('Prism.js not properly loaded - skipping syntax highlighting');
            return;
        }

        document.querySelectorAll('pre code').forEach((block) => {
            try {
                if (block.className && Prism.languages[block.className.replace('language-', '')]) {
                    Prism.highlightElement(block);
                } else {
                    block.className = '';
                }
            } catch (error) {
                console.warn('Error highlighting code block:', error);
                block.className = '';
            }
        });
    }

    addCopyButtons() {
        document.querySelectorAll('.code-block').forEach(block => {
            const copyButton = block.querySelector('.copy-button');
            const code = block.querySelector('code').textContent;

            const newButton = copyButton.cloneNode(true);
            copyButton.parentNode.replaceChild(newButton, copyButton);

            newButton.addEventListener('click', () => {
                this.copyToClipboard(code, newButton);
            });
        });
    }

    copyToClipboard(text, button) {
        navigator.clipboard.writeText(text)
            .then(() => {
                button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                setTimeout(() => {
                    button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy code: ', err);
                button.innerHTML = '✗';
                setTimeout(() => {
                    button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>';
                }, 2000);
            });
    }

    addTypingIndicator() {
        const id = `typing-${Date.now()}`;
        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'bot-message');
        typingElement.id = id;
        typingElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        this.chatMessages.appendChild(typingElement);
        this.scrollToBottom();
        return id;
    }

    removeTypingIndicator(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
