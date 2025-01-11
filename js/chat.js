class ChatInterface {
    constructor() {
        this.agent = new OllamaAgent();
        this.isGenerating = false;
        this.initializeDOM();
        this.setupAgent();
        this.loadPresetPrompts();
        this.bindEvents();
    }

    initializeDOM() {
        // Chat elements
        this.messagesContainer = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-message');

        // Settings elements
        this.modelSelect = document.getElementById('model-select');
        this.temperatureInput = document.getElementById('temperature');
        this.temperatureValue = document.getElementById('temperature-value');
        this.contextLengthInput = document.getElementById('context-length');
        this.systemPromptInput = document.getElementById('system-prompt');
        this.presetPromptsSelect = document.getElementById('preset-prompts');
        this.savePromptButton = document.getElementById('save-prompt');

        // Reset and History elements
        this.resetButton = document.getElementById('reset-chat');
        this.toggleHistoryButton = document.getElementById('toggle-history');
        this.historyPanel = document.getElementById('history-panel');
        this.closeHistoryButton = document.getElementById('close-history');
        this.historyList = document.querySelector('.history-list');

        // Error modal elements
        this.errorModal = document.getElementById('error-modal');
        this.errorMessage = document.getElementById('error-message');
        this.closeErrorButton = document.getElementById('close-error');
    }

    async setupAgent() {
        try {
            const models = await this.agent.initialize();
            if (!models || models.length === 0) {
                throw new Error('No Ollama models found. Please make sure Ollama is running and you have models installed.');
            }
            this.updateModelSelect(models);
        } catch (error) {
            this.showError('Failed to initialize Ollama agent: ' + error.message);
        }
    }

    updateModelSelect(models) {
        this.modelSelect.innerHTML = models
            .map(model => `<option value="${model}">${model}</option>`)
            .join('');
        
        if (models.length > 0) {
            this.agent.setModel(models[0]);
        }
    }

    bindEvents() {
        // Message events
        this.userInput.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.userInput.addEventListener('input', this.autoResizeInput.bind(this));
        this.sendButton.addEventListener('click', this.sendMessage.bind(this));

        // Settings events
        this.modelSelect.addEventListener('change', this.handleModelChange.bind(this));
        this.temperatureInput.addEventListener('input', this.handleTemperatureChange.bind(this));
        this.contextLengthInput.addEventListener('change', this.handleContextLengthChange.bind(this));
        this.systemPromptInput.addEventListener('input', this.handleSystemPromptChange.bind(this));
        this.presetPromptsSelect.addEventListener('change', this.loadPresetPrompt.bind(this));
        this.savePromptButton.addEventListener('click', this.savePresetPrompt.bind(this));

        // Reset and History events
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => this.resetChat());
        }
        if (this.toggleHistoryButton) {
            this.toggleHistoryButton.addEventListener('click', () => this.toggleHistory());
        }
        if (this.closeHistoryButton) {
            this.closeHistoryButton.addEventListener('click', () => this.toggleHistory());
        }
        
        // Load chat history when the page loads
        this.loadChatHistory();

        // Error modal events
        this.closeErrorButton.addEventListener('click', () => this.errorModal.hidden = true);

        // Auto-resize the input on page load
        this.autoResizeInput();
    }

    // Message handling methods
    async sendMessage() {
        if (this.isGenerating || !this.userInput.value.trim()) return;

        const message = this.userInput.value.trim();
        this.userInput.value = '';
        this.autoResizeInput();
        this.addMessage('assistant', message);
        this.isGenerating = true;

        try {
            let assistantMessage = '';
            const assistantElement = this.addMessage('assistant', '');
            
            await this.agent.sendMessage(message, (chunk) => {
                assistantMessage += chunk;
                // During streaming, show markdown
                assistantElement.querySelector('.content').innerHTML = marked.parse(assistantMessage);
                this.scrollToBottom();
            });
            console.log('Chat response completed');
        } catch (error) {
            this.showError('Failed to send message');
        } finally {
            this.isGenerating = false;
        }
    }

    addMessage(role, content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        
        contentDiv.textContent = content;

        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'timestamp';
        timestampDiv.textContent = utils.formatTimestamp(new Date());
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestampDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        this.scrollToBottom();
        
        return messageDiv;
    }

    // UI interaction methods
    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    autoResizeInput() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 200) + 'px';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showError(message) {
        if (!this.errorModal || !this.errorMessage) {
            console.error('Error:', message);
            return;
        }
        this.errorMessage.textContent = message;
        this.errorModal.hidden = false;
        
        // Auto-hide error after 10 seconds
        setTimeout(() => {
            if (!this.errorModal.hidden) {
                this.errorModal.hidden = true;
            }
        }, 10000);
    }

    // Settings handlers
    handleModelChange(event) {
        this.agent.setModel(event.target.value);
    }

    handleTemperatureChange(event) {
        const value = parseFloat(event.target.value);
        this.temperatureValue.textContent = value.toFixed(1);
        this.agent.setTemperature(value);
    }

    handleContextLengthChange(event) {
        const value = parseInt(event.target.value);
        if (!isNaN(value) && value >= 512 && value <= 8192) {
            this.agent.setContextLength(value);
        }
    }

    handleSystemPromptChange(event) {
        this.agent.setSystemPrompt(event.target.value);
    }

    // Preset prompts management
    loadPresetPrompts() {
        const presets = utils.storage.get('presetPrompts', {});
        this.updatePresetPromptsSelect(presets);
    }

    updatePresetPromptsSelect(presets) {
        this.presetPromptsSelect.innerHTML = '<option value="">Select Preset...</option>' +
            Object.entries(presets)
                .map(([name, _]) => `<option value="${name}">${utils.sanitizeHTML(name)}</option>`)
                .join('');
    }

    savePresetPrompt() {
        const name = prompt('Enter a name for this preset:');
        if (!name) return;

        const presets = utils.storage.get('presetPrompts', {});
        presets[name] = this.systemPromptInput.value;
        if (utils.storage.set('presetPrompts', presets)) {
            this.updatePresetPromptsSelect(presets);
        } else {
            this.showError('Failed to save preset prompt');
        }
    }

    loadPresetPrompt(event) {
        const name = event.target.value;
        if (!name) return;

        const presets = utils.storage.get('presetPrompts', {});
        const prompt = presets[name];
        if (prompt) {
            this.systemPromptInput.value = prompt;
            this.agent.setSystemPrompt(prompt);
        }
    }

    // Reset and History methods
    resetChat() {
        if (confirm('Are you sure you want to reset the chat? This will clear all messages.')) {
            this.saveCurrentChatToHistory();
            this.messagesContainer.innerHTML = '';
            this.agent.clearConversation();
        }
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('hidden');
    }

    saveCurrentChatToHistory() {
        const messages = Array.from(this.messagesContainer.children).map(msg => ({
            type: msg.classList.contains('assistant') ? 'assistant' : 'user',
            content: msg.querySelector('.content').textContent
        }));

        if (messages.length === 0) return;

        const chatHistory = this.getChatHistory();
        const timestamp = new Date().toISOString();
        
        chatHistory.unshift({
            id: Date.now(),
            timestamp,
            messages,
            preview: messages[0].content.substring(0, 50) + '...'
        });

        // Keep only the last 10 chat sessions
        if (chatHistory.length > 10) {
            chatHistory.pop();
        }

        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        this.updateHistoryList();
    }

    getChatHistory() {
        try {
            return JSON.parse(localStorage.getItem('chatHistory')) || [];
        } catch {
            return [];
        }
    }

    loadChatHistory() {
        this.updateHistoryList();
    }

    updateHistoryList() {
        if (!this.historyList) return;
        
        const history = this.getChatHistory();
        this.historyList.innerHTML = history.map(chat => `
            <div class="history-item" data-id="${chat.id}">
                <div class="history-timestamp">${new Date(chat.timestamp).toLocaleString()}</div>
                <div class="history-preview">${chat.preview}</div>
            </div>
        `).join('');

        // Add click handlers to history items
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => this.loadChatSession(item.dataset.id));
        });
    }

    loadChatSession(chatId) {
        const history = this.getChatHistory();
        const chat = history.find(c => c.id === parseInt(chatId));
        
        if (!chat) return;

        if (confirm('Loading this chat session will replace your current conversation. Continue?')) {
            this.messagesContainer.innerHTML = '';
            chat.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = msg.type === 'assistant' ? 'message assistant' : 'message user';
                messageDiv.innerHTML = `<div class="content">${msg.content}</div><div class="timestamp">${utils.formatTimestamp(new Date())}</div>`;
                this.messagesContainer.appendChild(messageDiv);
            });
            this.toggleHistory();
        }
    }

    // Static initialization method
    static init() {
        window.chatInterface = new ChatInterface();
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', ChatInterface.init);