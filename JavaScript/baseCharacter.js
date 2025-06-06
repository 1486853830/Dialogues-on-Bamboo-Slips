import { initMusicControls } from './musicControls.js';
import { initBackgroundVideo } from './backgroundVideo.js';
import { displayMessage, addRephraseButton } from './messageHandler.js';
import { sendMessage as apiSendMessage, getPresetResponse, sendWelcomeMessage } from './apiRequest.js';
import { initEventListeners, createPresetButtons } from './eventListeners.js';
import { autoPlaySpeech, synthesizeSpeech } from './speechSynthesis.js';

// 角色基类，所有历史人物都靠它
export class BaseCharacter {
    constructor(characterName, systemMessage) {
        this.API_KEY = localStorage.getItem('apiKey');
        this.characterName = characterName;
        this.name = characterName; // 关键补充，确保 this.name 可用
        this.userName = localStorage.getItem('userName') || '访客';
        this.userGender = localStorage.getItem('userGender') || 'unknown';
        this.userPersona = localStorage.getItem('userPersona') || '';
        this.systemMessage = systemMessage || {
            role: "system",
            content: ""
        };
        this.messageHistory = [this.systemMessage];
        this.messageIdCounter = 0;
        
        // 系统消息内容，反正每次都得拼
        this.systemMessage.content = `作为${characterName}，${systemMessage?.content || ''}`;
    }

    // 发送消息的壳子，参数一堆，写着头疼
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
                const counter = Number.isInteger(messageIdCounter) ? messageIdCounter : this.messageIdCounter;
                const result = displayMessage(chatContainer, message, sender, counter, this.name);
                this.messageIdCounter = result.messageIdCounter;
                if (sender === 'bot') {
                    // 关键：传递当前历史和AI消息下标
                    addRephraseButton(
                        result.messageContainer,
                        this.handleRephraseWrapper.bind(this),
                        this.messageHistory,
                        this.messageHistory.length - 1 // 当前AI消息在历史中的下标
                    );
                    synthesizeSpeech(message, this.name); // 让AI说话，写到这都快背下来了
                }
                chatContainer.appendChild(result.messageContainer);
                chatContainer.scrollTop = chatContainer.scrollHeight;
                return result;
            }
        );
    }

    // “重说”功能，用户点了就把最后两条删了再发
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

    // “重说”按钮点了之后的处理，写着写着都快晕了
    handleRephraseWrapper() {
        const userMessage = this.handleRephrase();
        if (userMessage) {
            const chatContainer = document.getElementById('chat-container');
            this.messageHistory.push(userMessage);
            const { messageContainer } = displayMessage(chatContainer, userMessage.content, 'user', this.messageIdCounter, this.name); // 传递角色名
            this.messageIdCounter = messageContainer.messageIdCounter;
            chatContainer.appendChild(messageContainer);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            this.sendMessageWrapper(true);
        }
    }

    // 获取AI预设回复，反正每次都得调
    async getPresetResponseWrapper() {
        return getPresetResponse(this.API_KEY, this.messageHistory, this.name);
    }

    // 发送开场白，第一次进来才会触发
    async sendWelcomeMessageWrapper() {
        if (!localStorage.getItem(`firstVisit_${this.name}`)) return;
        
        const chatContainer = document.getElementById('chat-container');
        await sendWelcomeMessage(
            this.API_KEY,
            this.messageHistory,
            this.name,
            chatContainer,
            (chatContainer, message, sender, messageIdCounter) => {
                const result = displayMessage(chatContainer, message, sender, messageIdCounter, this.name); // 传递角色名
                this.messageIdCounter = result.messageIdCounter;
                if (sender === 'bot') {
                    addRephraseButton(result.messageContainer, this.handleRephraseWrapper.bind(this));
                }
                chatContainer.appendChild(result.messageContainer);
                chatContainer.scrollTop = chatContainer.scrollHeight;
                return result;
            }
        );
        localStorage.removeItem(`firstVisit_${this.name}`);
    }

    // 事件监听全都丢这，省得main.js太乱
    initEventListenersWrapper() {
        initEventListeners(
            (isRephrase) => this.sendMessageWrapper(isRephrase),
            () => this.getPresetResponseWrapper(),
            (pullUpMenu, options) => createPresetButtons(pullUpMenu, options)
        );
    }

    // 加载历史消息，没历史就发开场白
    loadHistory() {
        const savedHistory = localStorage.getItem(`chatHistory_${this.name}`);
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
                this.messageHistory.forEach((msg, idx) => {
                    if (msg.role === 'system') return;

                    if (msg.role === 'user') {
                        const { messageContainer } = displayMessage(chatContainer, msg.content, 'user', this.messageIdCounter, this.name);
                        this.messageIdCounter = messageContainer.messageIdCounter;
                        chatContainer.appendChild(messageContainer);
                    } else if (msg.role === 'assistant') {
                        const { messageContainer } = displayMessage(chatContainer, msg.content, 'bot', this.messageIdCounter, this.name);
                        this.messageIdCounter = messageContainer.messageIdCounter;
                        // 关键：传递完整参数
                        addRephraseButton(messageContainer, this.handleRephraseWrapper.bind(this), this.messageHistory, idx);
                        chatContainer.appendChild(messageContainer);
                    }
                });
                chatContainer.scrollTop = chatContainer.scrollHeight;
            } else {
                localStorage.setItem(`firstVisit_${this.name}`, 'true');
                this.sendWelcomeMessageWrapper();
            }
        } catch (error) {
            console.error('历史记录加载失败:', error);
            localStorage.removeItem(`chatHistory_${this.name}`);
            chatContainer.innerHTML = '<div class="error">历史记录损坏，已重置</div>';
            this.messageHistory = [this.systemMessage];
        }
    }

    // 背景初始化，留个壳以后扩展
    initBackground() {
    }

    // 初始化，啥都在这调一遍
    init() {
        this.initEventListenersWrapper();
        this.loadHistory();
        initBackgroundVideo();
        this.initBackground();
        initMusicControls(this.name);

        // 下面这段是让浏览器自动解锁音频，不然有些浏览器不让自动播
        document.body.addEventListener('click', () => {
            let audio = document.getElementById('tts-audio');
            if (!audio) {
                audio = document.createElement('audio');
                audio.id = 'tts-audio';
                document.body.appendChild(audio);
            }
            audio.play().catch(() => {});
        }, { once: true });
    }
}