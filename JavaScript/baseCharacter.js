import { initMusicControls } from './musicControls.js';
import { initBackgroundVideo } from './backgroundVideo.js';
import { displayMessage, addRephraseButton } from './messageHandler.js';
import { sendMessage as apiSendMessage, getPresetResponse, sendWelcomeMessage } from './apiRequest.js';
import { initEventListeners, createPresetButtons } from './eventListeners.js';
import { synthesizeSpeech } from './speechSynthesis.js';

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
        
        this.systemMessage.content = `作为${characterName}，${systemMessage?.content || ''}`;
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
            this.handleRephrase.bind(this),
            (chatContainer, message, sender, messageIdCounter) => {
                // 添加参数校验
                const counter = Number.isInteger(messageIdCounter) ? messageIdCounter : this.messageIdCounter;
                const result = displayMessage(chatContainer, message, sender, counter);
                this.messageIdCounter = result.messageIdCounter;
                if (sender === 'bot') {
                    addRephraseButton(result.messageContainer, this.handleRephraseWrapper.bind(this));
                    // 自动播放逻辑
                    if (localStorage.getItem('voiceEnabled') === 'true') {
                        synthesizeSpeech(message);
                    }
                }
                chatContainer.appendChild(result.messageContainer);
                chatContainer.scrollTop = chatContainer.scrollHeight;
                return result;
            }
        );
    }

    handleRephrase() {
        const chatContainer = document.getElementById('chat-container');
        if (!Array.isArray(this.messageHistory) || !chatContainer?.querySelectorAll) {
            console.error('Invalid parameters');
            return null;
        }

        if (this.messageHistory.length >= 2 && 
            this.messageHistory[this.messageHistory.length - 1].role === "assistant") {
            
            this.messageHistory.pop();
            const userMessage = this.messageHistory.pop();

            const messages = chatContainer.querySelectorAll('.message-container');
            try {
                if (messages.length >= 2) {
                    chatContainer.removeChild(messages[messages.length - 1]);
                    chatContainer.removeChild(messages[messages.length - 2]);
                } else if (messages.length === 1) {
                    chatContainer.removeChild(messages[0]);
                }
            } catch (error) {
                console.error('DOM操作异常:', error);
            }

            return userMessage || null;
        }
        return null;
    }

    handleRephraseWrapper() {
        const userMessage = this.handleRephrase();
        if (userMessage) {
            const chatContainer = document.getElementById('chat-container');
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
        if (!localStorage.getItem(`firstVisit_${this.characterName}`)) return;
        
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
                    addRephraseButton(result.messageContainer, this.handleRephraseWrapper.bind(this));
                }
                chatContainer.appendChild(result.messageContainer);
                chatContainer.scrollTop = chatContainer.scrollHeight;
                return result;
            }
        );
        localStorage.removeItem(`firstVisit_${this.characterName}`);
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
        
        try {
            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory);
                this.messageHistory = [
                    this.systemMessage, 
                    ...parsedHistory.filter(msg => 
                        ['user', 'assistant'].includes(msg.role)
                    )
                ];
                
                chatContainer.innerHTML = '';
                this.messageHistory.forEach(msg => {
                    if(msg.role === 'system') return;
                    
                    if (msg.role === 'user') {
                        const { messageContainer } = displayMessage(chatContainer, msg.content, 'user', this.messageIdCounter);
                        this.messageIdCounter = messageContainer.messageIdCounter;
                        chatContainer.appendChild(messageContainer);
                    } else if (msg.role === 'assistant') {
                        const { messageContainer } = displayMessage(chatContainer, msg.content, 'bot', this.messageIdCounter);
                        this.messageIdCounter = messageContainer.messageIdCounter;
                        addRephraseButton(messageContainer, this.handleRephraseWrapper.bind(this));
                        chatContainer.appendChild(messageContainer);
                    }
                });
                chatContainer.scrollTop = chatContainer.scrollHeight;
            } else {
                localStorage.setItem(`firstVisit_${this.characterName}`, 'true');
                this.sendWelcomeMessageWrapper();
            }
        } catch (error) {
            console.error('历史记录加载失败:', error);
            localStorage.removeItem(`chatHistory_${this.characterName}`);
            chatContainer.innerHTML = '<div class="error">历史记录损坏，已重置</div>';
            this.messageHistory = [this.systemMessage];
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