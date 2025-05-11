import { initMusicControls } from './musicControls.js';
import { initBackgroundVideo } from './backgroundVideo.js';
import { displayMessage, addRephraseButton, handleRephrase } from './messageHandler.js';
import { sendMessage as apiSendMessage, getPresetResponse, sendWelcomeMessage } from './apiRequest.js';
import { initEventListeners, createPresetButtons } from './eventListeners.js';

export class BaseCharacter {
    constructor(characterName, systemMessage) {
        this.API_KEY = localStorage.getItem('apiKey');
        this.characterName = characterName;
        this.userName = localStorage.getItem('userName') || '访客';
        this.userGender = localStorage.getItem('userGender') || 'unknown';
        this.userPersona = localStorage.getItem('userPersona') || '';
        this.systemMessage = systemMessage || {
            role: "system",
            content: ""
        };
        this.messageHistory = [this.systemMessage];
        this.messageIdCounter = 0;
    }

    sendMessageWrapper(isRephrase = false) {
        const chatContainer = document.getElementById('chat-container');
        const userInput = document.getElementById('user-input').value;
        apiSendMessage(
            this.API_KEY,
            this.messageHistory,
            userInput,
            isRephrase,
            chatContainer,
            (chatContainer, message, sender, messageIdCounter) => {
                const result = displayMessage(chatContainer, message, sender, messageIdCounter);
                this.messageIdCounter = result.messageIdCounter;
                if (sender === 'bot') {
                    addRephraseButton(result.messageContainer, () => this.handleRephraseWrapper());
                }
                chatContainer.appendChild(result.messageContainer);
                chatContainer.scrollTop = chatContainer.scrollHeight;
                return result;
            },
            (messageHistory, chatContainer) => handleRephrase(messageHistory, chatContainer)
        );
    }

    handleRephraseWrapper() {
        const chatContainer = document.getElementById('chat-container');
        const userMessage = handleRephrase(this.messageHistory, chatContainer);
        if (userMessage) {
            this.messageHistory.push(userMessage);
            const { messageContainer } = displayMessage(chatContainer, userMessage.content, 'user', this.messageIdCounter);
            this.messageIdCounter = messageContainer.messageIdCounter;
            chatContainer.appendChild(messageContainer);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            this.sendMessageWrapper(true);
        }
    }

    async getPresetResponseWrapper() {
        return getPresetResponse(this.API_KEY, this.messageHistory, this.characterName);
    }

    async sendWelcomeMessageWrapper() {
        const chatContainer = document.getElementById('chat-container');
        await sendWelcomeMessage(
            this.API_KEY,
            this.messageHistory,
            this.characterName,
            chatContainer,
            (chatContainer, message, sender, messageIdCounter) => {
                const result = displayMessage(chatContainer, message, sender, messageIdCounter);
                this.messageIdCounter = result.messageIdCounter;
                if (sender === 'bot') {
                    addRephraseButton(result.messageContainer, () => this.handleRephraseWrapper());
                }
                chatContainer.appendChild(result.messageContainer);
                chatContainer.scrollTop = chatContainer.scrollHeight;
                return result;
            }
        );
    }

    initEventListenersWrapper() {
        initEventListeners(
            (isRephrase) => this.sendMessageWrapper(isRephrase),
            () => this.getPresetResponseWrapper(),
            (pullUpMenu, options) => createPresetButtons(pullUpMenu, options)
        );
    }

    loadHistory() {
        const savedHistory = localStorage.getItem(`chatHistory_${this.characterName}`);
        const chatContainer = document.getElementById('chat-container');
        if (savedHistory) {
            this.messageHistory = JSON.parse(savedHistory);
            this.messageHistory.forEach(msg => {
                if (msg.role === 'user') {
                    const { messageContainer } = displayMessage(chatContainer, msg.content, 'user', this.messageIdCounter);
                    this.messageIdCounter = messageContainer.messageIdCounter;
                    chatContainer.appendChild(messageContainer);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                } else if (msg.role === 'assistant') {
                    const { messageContainer } = displayMessage(chatContainer, msg.content, 'bot', this.messageIdCounter);
                    this.messageIdCounter = messageContainer.messageIdCounter;
                    addRephraseButton(messageContainer, () => this.handleRephraseWrapper());
                    chatContainer.appendChild(messageContainer);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            });
        } else {
            this.sendWelcomeMessageWrapper();
        }
    }

    initBackground() {
    }

    init() {
        this.initEventListenersWrapper();
        this.loadHistory();
        initBackgroundVideo();
        this.initBackground();
        initMusicControls(this.characterName);
    }
}
