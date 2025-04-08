class LightRagAgent {
    constructor() {
        this.baseUrl = 'http://10.115.36.59:9621';
        this.temperature = 0.5;
        this.systemPrompt = '';
        this.conversationHistory = [];
        
        // Bind methods
        this.handleResponse = this.handleResponse.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    async initialize() {
        try {
            // Simply check if the API is accessible
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }).catch(() => ({ ok: false }));
            
            if (!response.ok) {
                console.warn('LightRAG health check failed, but continuing anyway');
            }
            
            return ['LightRAG']; // Return a default model name for UI compatibility
        } catch (error) {
            this.handleError('Failed to initialize LightRAG agent', error);
            // Don't throw, we'll try to continue anyway
            return ['LightRAG'];
        }
    }
    
    // These methods are kept for compatibility with the OllamaAgent interface
    setModel(modelName) {
        // No-op for LightRAG as it doesn't use models in the same way
    }

    setTemperature(temp) {
        this.temperature = parseFloat(temp);
    }

    setContextLength(length) {
        // No-op for LightRAG
    }

    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    async sendMessage(message, onChunk) {
        const payload = {
            query: message,
            stream: true,
            temperature: this.temperature,
            system_prompt: this.systemPrompt || undefined
        };

        try {
            const response = await fetch(`${this.baseUrl}/query/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('ReadableStream not supported');
            }

            const reader = response.body.getReader();
            let fullResponse = '';
            let buffer = '';
            let jsonBuffer = '';

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode the chunk
                const textChunk = decoder.decode(value, { stream: true });
                buffer += textChunk;
                
                // Process JSON objects from the buffer
                let startIndex = 0;
                while (startIndex < buffer.length) {
                    // Find JSON object boundaries
                    const openBrace = buffer.indexOf('{', startIndex);
                    if (openBrace === -1) break;
                    
                    // Find the closing brace
                    let closeBrace = buffer.indexOf('}', openBrace);
                    if (closeBrace === -1) break;
                    
                    // Extract the JSON string
                    const jsonStr = buffer.substring(openBrace, closeBrace + 1);
                    startIndex = closeBrace + 1;
                    
                    try {
                        // Parse the JSON object
                        const jsonObj = JSON.parse(jsonStr);
                        if (jsonObj.response !== undefined) {
                            // Extract the actual response
                            fullResponse += jsonObj.response;
                            onChunk?.(jsonObj.response);
                        }
                    } catch (e) {
                        console.error('Failed to parse JSON chunk:', e);
                        console.debug('Problematic JSON:', jsonStr);
                    }
                }
                
                // Keep any remaining data in the buffer
                buffer = buffer.substring(startIndex);
            }

            // Process any remaining complete JSON in the buffer
            if (buffer.length > 0) {
                try {
                    // Try to find any remaining JSON objects
                    const matches = buffer.match(/{[^}]*}/g);
                    if (matches) {
                        for (const match of matches) {
                            try {
                                const jsonObj = JSON.parse(match);
                                if (jsonObj.response !== undefined) {
                                    fullResponse += jsonObj.response;
                                    onChunk?.(jsonObj.response);
                                }
                            } catch (e) {
                                console.error('Failed to parse remaining JSON:', e);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error processing remaining buffer:', e);
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
        // Emit error event
        const errorEvent = new CustomEvent('lightrag-error', {
            detail: { context, error: error.message }
        });
        window.dispatchEvent(errorEvent);
    }
}

// Export the agent
window.LightRagAgent = LightRagAgent;