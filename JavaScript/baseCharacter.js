import { initMusicControls } from './musicControls.js';
import { initBackgroundVideo } from './backgroundVideo.js';
import { displayMessage, addRephraseButton, handleRephrase } from './messageHandler.js';
import { sendMessage as apiSendMessage, getPresetResponse, sendWelcomeMessage } from './apiRequest.js';
import { initEventListeners, createPresetButtons } from './eventListeners.js';

export class BaseCharacter {
    // 在构造函数中确保系统消息格式
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
        
        // 强制系统消息包含标准格式
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

    // 修改 sendWelcomeMessageWrapper 方法（约58行）
    async sendWelcomeMessageWrapper() {
        // 添加首次访问检查
        if (!localStorage.getItem(`firstVisit_${this.characterName}`)) return;
        
        const chatContainer = document.getElementById('chat-container');
        await sendWelcomeMessage(
            this.API_KEY,
            this.messageHistory,
            this.characterName, // 确保传递正确的 characterName
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
        
        // 成功发送后移除首次访问标识
        localStorage.removeItem(`firstVisit_${this.characterName}`);
    }

    initEventListenersWrapper() {
        initEventListeners(
            (isRephrase) => this.sendMessageWrapper(isRephrase),
            () => this.getPresetResponseWrapper(),
            (pullUpMenu, options) => createPresetButtons(pullUpMenu, options)
        );
    }

    // 修改 loadHistory 方法（约91-109行）
    loadHistory() {
        const savedHistory = localStorage.getItem(`chatHistory_${this.characterName}`); // 确保键名一致
        const chatContainer = document.getElementById('chat-container');
        
        try {
            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory);
                
                // 添加系统消息恢复逻辑
                this.messageHistory = [
                    this.systemMessage, 
                    ...parsedHistory.filter(msg => 
                        ['user', 'assistant'].includes(msg.role)
                    )
                ];
                
                chatContainer.innerHTML = '';
                this.messageHistory.forEach(msg => {
                    // 添加系统消息跳过逻辑
                    if(msg.role === 'system') return;
                    
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
                // 添加首次访问标识
                localStorage.setItem(`firstVisit_${this.characterName}`, 'true');
                this.sendWelcomeMessageWrapper();
            }
        } catch (error) {
            console.error('历史记录加载失败，已重置:', error);
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
