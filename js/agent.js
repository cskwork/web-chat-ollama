class OllamaAgent {
    constructor() {
        this.baseUrl = 'http://localhost:11434/api';
        this.currentModel = null;
        this.temperature = 0.7;
        this.contextLength = 4096;
        this.systemPrompt = '';
        this.conversationHistory = [];
        
        // Bind methods
        this.handleResponse = this.handleResponse.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    async initialize() {
        try {
            const models = await this.getInstalledModels();
            if (models.length > 0) {
                this.currentModel = models[0];
                return models;
            }
            throw new Error('No models found');
        } catch (error) {
            this.handleError('Failed to initialize Ollama agent', error);
            throw error;
        }
    }

    async getInstalledModels() {
        try {
            const response = await fetch(`${this.baseUrl}/tags`);
            if (!response.ok) throw new Error('Failed to fetch models' + `${this.baseUrl}/tags`);
            
            const data = await response.json();
            return data.models.map(model => model.name);
        } catch (error) {
            this.handleError('Failed to fetch installed models', error);
            throw error;
        }
    }

    setModel(modelName) {
        this.currentModel = modelName;
    }

    setTemperature(temp) {
        this.temperature = parseFloat(temp);
    }

    setContextLength(length) {
        this.contextLength = parseInt(length);
    }

    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    async sendMessage(message, onChunk) {
        if (!this.currentModel) {
            throw new Error('No model selected');
        }

        const payload = {
            model: this.currentModel,
            messages: [
                ...(this.systemPrompt ? [{ role: 'system', content: this.systemPrompt }] : []),
                ...this.conversationHistory,
                { role: 'user', content: message }
            ],
            stream: true,
            temperature: this.temperature,
            context_length: this.contextLength
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            if (!response.body) {
                throw new Error('ReadableStream not supported');
            }

            const reader = response.body.getReader();
            let fullResponse = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode the chunk and add it to the buffer
                buffer += new TextDecoder().decode(value);
                
                // Split buffer into lines and process complete lines
                const lines = buffer.split('\n');
                // Keep the last incomplete line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message?.content) {
                                fullResponse += parsed.message.content;
                                onChunk?.(parsed.message.content);
                            }
                        } catch (e) {
                            console.error('Failed to parse chunk:', e);
                            console.debug('Problematic line:', line);
                        }
                    }
                }
            }

            // Process any remaining data in the buffer
            if (buffer.trim()) {
                try {
                    const parsed = JSON.parse(buffer);
                    if (parsed.message?.content) {
                        fullResponse += parsed.message.content;
                        onChunk?.(parsed.message.content);
                    }
                } catch (e) {
                    console.error('Failed to parse final chunk:', e);
                    console.debug('Problematic buffer:', buffer);
                }
            }

            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: fullResponse }
            );

            return fullResponse;
        } catch (error) {
            this.handleError('Failed to send message', error);
            throw error;
        }
    }

    clearConversation() {
        this.conversationHistory = [];
    }

    handleResponse(response) {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    handleError(context, error) {
        console.error(`${context}:`, error);
        // Emit error event or call error callback
        const errorEvent = new CustomEvent('ollama-error', {
            detail: { context, error: error.message }
        });
        window.dispatchEvent(errorEvent);
    }
}

// Export the agent
window.OllamaAgent = OllamaAgent;