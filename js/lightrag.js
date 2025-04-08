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
            });
            
            if (!response.ok) {
                throw new Error('LightRAG API is not accessible');
            }
            
            return ['LightRAG']; // Return a default model name for UI compatibility
        } catch (error) {
            this.handleError('Failed to initialize LightRAG agent', error);
            throw error;
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

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode the chunk and add to the buffer
                const textChunk = new TextDecoder().decode(value);
                buffer += textChunk;
                
                // Process the received chunk directly
                fullResponse += textChunk;
                onChunk?.(textChunk);
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