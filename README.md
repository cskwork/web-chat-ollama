# Ollama Chat Interface

A modern web-based chat interface for interacting with Ollama language models. This application provides a user-friendly interface for conversing with various Ollama models, with support for model selection, temperature control, context length adjustment, and system prompts.

## Features

- 🤖 Support for multiple Ollama models
- 🌡️ Adjustable temperature and context length
- 💬 Customizable system prompts with preset management
- 🌓 Dark/Light theme switching
- 📜 Chat history management
- 🔄 Real-time streaming responses
- 📱 Responsive design for various screen sizes

## Prerequisites

- [Ollama](https://ollama.ai/) installed and running locally
- Modern web browser (Chrome, Firefox, Safari, Edge)
- At least one Ollama model installed

## Setup and Running

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ollama-chat-interface.git
cd ollama-chat-interface
```

2. Make sure Ollama is running on your machine:
```bash
ollama run llama2  # or any other model
```

3. Important: Due to CORS restrictions, you'll need to run Chrome with specific flags:

**Windows:**
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=%LOCALAPPDATA%\Google\chromeTemp
```

**macOS:**
```bash
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

**Linux:**
```bash
google-chrome --disable-web-security --disable-gpu --user-data-dir=/tmp/chromeTemp
```

4. Open the `index.html` file in your browser with the flags mentioned above.

⚠️ **Security Note**: The flags mentioned above disable certain security features in Chrome. This setup is meant for local development only. Never use these flags when browsing the internet normally.

## Project Structure

```
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   ├── agent.js           # Ollama API interaction logic
│   ├── chat.js           # Chat interface management
│   └── utils.js          # Utility functions
├── index.html            # Main application page
└── README.md            # Project documentation
```

## Usage

1. Select your preferred Ollama model from the dropdown
2. Adjust temperature (0-2) and context length as needed
3. Optionally set a system prompt or select from presets
4. Type your message and press Enter or click the send button
5. View the AI's response in real-time with markdown formatting

### Settings Panel

- **Model Selection**: Choose from installed Ollama models
- **Temperature**: Control response randomness (0 = deterministic, 2 = more random)
- **Context Length**: Adjust the context window (512-8192 tokens)
- **System Prompt**: Set custom instructions for the AI
- **Theme Toggle**: Switch between dark and light themes

### Chat Features

- Real-time message streaming
- Markdown support in responses
- Chat history management
- Conversation reset option
- Error handling with modal notifications

## Development

### Key Components

- **OllamaAgent**: Handles communication with the Ollama API
- **ChatInterface**: Manages the UI and user interactions
- **Utils**: Provides helper functions for various operations

### Error Handling

The application includes comprehensive error handling:
- Connection errors with Ollama server
- Model loading failures
- Message transmission errors
- Storage-related errors

### Storage

The application uses localStorage for:
- Theme preference
- Chat history
- Preset system prompts
- User preferences

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for providing the language model backend
- [Marked](https://marked.js.org/) for Markdown parsing