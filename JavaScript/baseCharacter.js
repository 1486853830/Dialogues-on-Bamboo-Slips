import { initMusicControls } from './musicControls.js';
import { initBackgroundVideo } from './backgroundVideo.js';

export class BaseCharacter {
    constructor(characterName, systemMessage) {
        this.API_KEY = localStorage.getItem('apiKey');
        this.characterName = characterName;
        
        // 获取用户信息
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

    // 修改displayMessage方法
    displayMessage(message, sender, isRephrase = false) {
        const chatContainer = document.getElementById('chat-container');
        
        // 应用半屏显示设置
        const halfScreen = localStorage.getItem('halfScreen') === 'true';
        if (halfScreen) {
            chatContainer.style.position = 'fixed';
            chatContainer.style.bottom = '0';
            chatContainer.style.left = '0';
            chatContainer.style.width = '100%';
            chatContainer.style.height = '50vh';
            chatContainer.style.overflowY = 'auto';
            chatContainer.style.background = 'none';
            chatContainer.style.boxSizing = 'border-box'; // 确保内边距不影响宽度
            // 添加渐隐效果
            chatContainer.style.maskImage = 'linear-gradient(to bottom, transparent 0%, black 20px, black 100%)';
            chatContainer.style.webkitMaskImage = 'linear-gradient(to bottom, transparent 0%, black 20px, black 100%)';
        } else {
            chatContainer.style.position = '';
            chatContainer.style.bottom = '';
            chatContainer.style.left = '';
            chatContainer.style.width = '';
            chatContainer.style.height = '';
            chatContainer.style.overflowY = '';
            chatContainer.style.background = '';
            chatContainer.style.maskImage = '';
            chatContainer.style.webkitMaskImage = '';
        }
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container');

        const messageElement = document.createElement('div');
        const currentMessageId = `msg-${this.messageIdCounter++}`;
        messageElement.classList.add('message', `${sender}-message`);

        const processedMessage = message
            // 处理括号内容
            .replace(/（([^）]*)）|\(([^)]*)\)/g, '<span style="opacity:0.6">$&</span>')
            // 处理星号内容(保留星号并应用半透明效果)
            .replace(/\*([^*]+)\*/g, '<span style="opacity:0.6">（$1）</span>')
            .replace(/<\/span>\s+/g, '</span> ');

        messageElement.innerHTML = processedMessage;
        messageContainer.appendChild(messageElement);

        if (sender === 'bot') {
            this.addRephraseButton(messageContainer);
        }

        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    addRephraseButton(messageContainer) {
        const existingButtons = document.querySelectorAll('.rephrase-btn');
        existingButtons.forEach(btn => btn.remove());

        const rephraseBtn = document.createElement('button');
        rephraseBtn.textContent = '重说';
        rephraseBtn.classList.add('rephrase-btn');
        rephraseBtn.onclick = (e) => {
            e.stopPropagation();
            this.handleRephrase();
        };
        messageContainer.appendChild(rephraseBtn);
    }

    handleRephrase() {
        // 确保至少有两条消息(用户消息和AI回复)
        if (this.messageHistory.length >= 2 &&
            this.messageHistory[this.messageHistory.length - 1].role === "assistant") {

            // 从历史记录中移除最后两条消息(用户消息和AI回复)
            this.messageHistory.pop(); // 移除AI回复
            const userMessage = this.messageHistory.pop(); // 移除用户消息

            // 从DOM中移除对应的消息
            const chatContainer = document.getElementById('chat-container');
            const messages = chatContainer.querySelectorAll('.message-container');

            // 移除最后两个消息容器
            if (messages.length >= 2) {
                chatContainer.removeChild(messages[messages.length - 1]); // AI消息
                chatContainer.removeChild(messages[messages.length - 2]); // 用户消息
            } else if (messages.length === 1) {
                chatContainer.removeChild(messages[0]);
            }

            // 重新发送用户消息
            if (userMessage) {
                this.messageHistory.push(userMessage);
                this.displayMessage(userMessage.content, 'user');
                this.sendMessage(true); // 设置为重说模式
            }
        }
    }

    async sendMessage(isRephrase = false) {
        let userInput;

        // 在系统消息中包含用户信息
        if(this.messageHistory.length === 1) { // 只有系统消息时
            this.systemMessage.content = `你正在与${this.userName}(${this.userGender})对话。
            用户人设: ${this.userPersona}
            请以${this.characterName}的身份和口吻进行对话。
            你需要主动推动故事情节发展，在回复中：
            内容简短不超过50字，动作神态等内容用括号括上`;
        }

        if (!isRephrase) {
            userInput = document.getElementById('user-input').value;
            if (!userInput.trim()) return;

            this.messageHistory.push({ role: "user", content: userInput });
            this.displayMessage(userInput, 'user');
            document.getElementById('user-input').value = '';

            const existingButtons = document.querySelectorAll('.rephrase-btn');
            existingButtons.forEach(btn => btn.remove());
        } else {
            this.handleRephrase();
        }

        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-spinner';
        loadingElement.style.margin = '10px 0 10px 10px';
        document.getElementById('chat-container').appendChild(loadingElement);

        try {
            const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: this.messageHistory,
                    temperature: 0.8,  // 提高创造性
                    presence_penalty: 0.5,
                    frequency_penalty: 0.5  // 减少重复内容
                })
            });

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }

            this.displayMessage(botResponse, 'bot', isRephrase);
            this.messageHistory.push({ role: "assistant", content: botResponse });
            localStorage.setItem(`chatHistory_${this.characterName}`, JSON.stringify(this.messageHistory));

        } catch (error) {
            console.error("发送消息出错:", error);
            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
        }
    }

    async getPresetResponse() {
        try {
            // 修改这里：使用全部聊天记录而不是.slice(-4)
            const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        ...this.messageHistory,  // 使用全部历史记录
                        {
                            role: "user",
                            content: `请基于以上对话，生成3个适合我回复${this.characterName}的选项，每个选项不超过80字，动作神态描写用括号括起来，格式为：1.选项1 2.选项2 3.选项3`
                        }
                    ],
                    temperature: 1
                })
            });

            const data = await response.json();
            const content = data.choices[0].message.content;
            const options = content.split('\n')
                .filter(line => line.match(/^\d\./))
                .map(line => line.replace(/^\d\.\s*/, '').trim())
                .slice(0, 3);

            return options.length === 3 ? options : [
                "请继续讲",
                "能详细说说吗？",
                "原来如此"
            ];
        } catch (error) {
            console.error("获取预设回答失败:", error);
            return [
                "请继续讲",
                "能详细说说吗？",
                "原来如此"
            ];
        }
    }

    initEventListeners() {
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });

        document.getElementById('send-button').addEventListener('click', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        const menuToggle = document.getElementById('menu-toggle');
        const pullUpMenu = document.getElementById('pull-up-menu');
        let lastClickTime = 0;

        menuToggle.addEventListener('click', async (e) => {
            e.stopPropagation();

            const now = Date.now();
            if (now - lastClickTime < 300) {
                pullUpMenu.style.display = 'none';
                lastClickTime = 0;
                return;
            }
            lastClickTime = now;

            if (pullUpMenu.style.display === 'block') {
                pullUpMenu.style.display = 'none';
                return;
            }

            pullUpMenu.innerHTML = `
                <div style="display:flex; justify-content:center; padding:15px;">
                    <div class="loading-spinner"></div>
                </div>
            `;
            pullUpMenu.style.display = 'block';
            pullUpMenu.style.maxHeight = 'none';
            pullUpMenu.style.height = 'auto';

            const options = await this.getPresetResponse();
            this.createPresetButtons(pullUpMenu, options);
        });

        document.addEventListener('click', (e) => {
            if (!pullUpMenu.contains(e.target) && e.target !== menuToggle) {
                pullUpMenu.style.display = 'none';
            }
        });

        menuToggle.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            pullUpMenu.style.display = 'none';
        });
    }

    createPresetButtons(pullUpMenu, options) {
        pullUpMenu.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 12px;
                height: auto;
            ">
                ${options.map(opt => `
                    <button class="preset-btn" data-text="${opt}" 
                        style="
                            width: 100%;
                            padding: 10px 15px;
                            border-radius: 8px;
                            background: rgba(0,123,255,0.1);
                            border: 1px solid rgba(0,123,255,0.2);
                            color: #333;
                            font-size: 14px;
                            text-align: left;
                            transition: all 0.2s;
                        ">
                        ${opt}
                    </button>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('user-input').value = btn.dataset.text;
                pullUpMenu.style.display = 'none';
            });

            btn.addEventListener('mouseenter', function () {
                this.style.background = 'rgba(0,123,255,0.2)';
                this.style.transform = 'translateY(-2px)';
            });

            btn.addEventListener('mouseleave', function () {
                this.style.background = 'rgba(0,123,255,0.1)';
                this.style.transform = 'none';
            });
        });
    }

    loadHistory() {
        const savedHistory = localStorage.getItem(`chatHistory_${this.characterName}`);
        if (savedHistory) {
            this.messageHistory = JSON.parse(savedHistory);
            this.messageHistory.forEach(msg => {
                if (msg.role === 'user') {
                    this.displayMessage(msg.content, 'user');
                } else if (msg.role === 'assistant') {
                    this.displayMessage(msg.content, 'bot');
                }
            });
        } else {
            this.sendWelcomeMessage(); // 确保在类内部调用
        }
    }

    async sendWelcomeMessage() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-spinner';
        document.getElementById('chat-container').appendChild(loadingElement);

        try {
            const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [{
                        role: "system",
                        content: `作为${this.characterName}，用1-2句话向${this.userName}(${this.userGender})打招呼，结合用户人设"${this.userPersona}"。包含动作描写（用括号标注，语言不要打引号），总字数100字左右。`
                    }],
                    temperature: 0.9
                })
            });

            const data = await response.json();
            const welcomeMessage = data.choices[0].message.content;

            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }

            this.displayMessage(welcomeMessage, 'bot');
            this.messageHistory.push({ role: "assistant", content: welcomeMessage });
            localStorage.setItem(`chatHistory_${this.characterName}`, JSON.stringify(this.messageHistory));
        } catch (error) {
            console.error("生成欢迎消息出错:", error);
            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
            const fallbackMessage = `（微笑）${this.userName}，你好！`;
            this.displayMessage(fallbackMessage, 'bot');
            this.messageHistory.push({ role: "assistant", content: fallbackMessage });
        }
    }

    initBackground() {
    }

    
    init() {
        this.initEventListeners();
        this.loadHistory();
        initBackgroundVideo();
        this.initBackground();
        initMusicControls(this.characterName);
    }
}
