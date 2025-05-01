export class BaseCharacter {
    constructor(characterName, systemMessage) {
        this.API_KEY = localStorage.getItem('apiKey');
        this.characterName = characterName;
        this.systemMessage = systemMessage || {
            role: "system",
            content: ""
        };
        this.messageHistory = [this.systemMessage];
        this.messageIdCounter = 0;
    }

    displayMessage(message, sender, isRephrase = false) {
        const chatContainer = document.getElementById('chat-container');
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container');
        
        const messageElement = document.createElement('div');
        const currentMessageId = `msg-${this.messageIdCounter++}`;
        messageElement.classList.add('message', `${sender}-message`);
        
        const processedMessage = message.replace(/（([^）]*)）|\(([^)]*)\)/g,
            '<span style="opacity:0.6">$&</span> ')
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
            this.messageHistory[this.messageHistory.length-1].role === "assistant") {
            
            // 从历史记录中移除最后两条消息(用户消息和AI回复)
            this.messageHistory.pop(); // 移除AI回复
            const userMessage = this.messageHistory.pop(); // 移除用户消息
            
            // 从DOM中移除对应的消息
            const chatContainer = document.getElementById('chat-container');
            const messages = chatContainer.querySelectorAll('.message-container');
            
            // 移除最后两个消息容器
            if (messages.length >= 2) {
                chatContainer.removeChild(messages[messages.length-1]); // AI消息
                chatContainer.removeChild(messages[messages.length-2]); // 用户消息
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
                    temperature: isRephrase ? 0.8 : 0.7,
                    presence_penalty: isRephrase ? 0.5 : 0.2
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
            const recentMessages = this.messageHistory.slice(-4);
            const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        ...recentMessages,
                        {
                            role: "user",
                            content: `请基于以上对话，生成3个适合我回复${this.characterName}的选项，每个选项不超过50字，动作神态描写用括号括起来，格式为：1.选项1 2.选项2 3.选项3`
                        }
                    ],
                    temperature: 0.7
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
        }
    }

    // 在BaseCharacter类中添加以下方法
    initBackgroundVideo() {
        const video = document.getElementById('background-video');
        const body = document.body;
        
        if (!video) return;
    
        video.autoplay = true;
        video.muted = true;
        video.loop = false;
        
        video.addEventListener('play', () => {
            body.classList.add('video-playing');
            body.classList.remove('video-ended');
            video.classList.add('show');
        });
        
        video.addEventListener('ended', () => {
            body.classList.remove('video-playing');
            body.classList.add('video-ended');
            video.classList.remove('show');
        });
        
        body.classList.add('video-playing');
        video.classList.add('show');
    
        document.addEventListener('dblclick', (e) => {
            if (video.paused) {
                video.currentTime = 0;
                video.play();
                body.classList.add('video-playing');
                body.classList.remove('video-ended');
                video.classList.add('show');
            }
        });
    }

    initBackground() {
        const bgImg = new Image();
        bgImg.src = `../${this.characterName}/${this.characterName.toLowerCase()}.png`;
        bgImg.onerror = () => {
            document.body.style.background = '';
            console.log('背景图片加载失败，已使用备用背景');
        };
    }

    initMusicControls() {
        const musicBtn = document.createElement('button');
        musicBtn.textContent = '🎵';
        musicBtn.id = 'music-toggle';
        musicBtn.style.cssText = `
            background: rgba(0, 123, 255, 0.7);
            color: white !important;
            padding: 8px 15px;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            backdrop-filter: blur(5px);
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            width: auto;
            display: inline-block;
            position: fixed;
            top: 20px;
            right: 90px;
            z-index: 1000;
        `;
        
        const audio = new Audio();
        audio.src = `../../musics/${this.getMusicForCharacter()}.mp3`;
        audio.loop = true;
        
        musicBtn.onclick = () => {
            if (audio.paused) {
                audio.play();
                musicBtn.textContent = '🔊';
            } else {
                audio.pause();
                musicBtn.textContent = '🎵';
            }
        };
        document.body.appendChild(musicBtn);

        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️';
        clearBtn.id = 'clear-history';
        clearBtn.style.cssText = `
            background: rgba(255, 0, 0, 0.7);
            color: white !important;
            padding: 8px 15px;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            backdrop-filter: blur(5px);
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            width: auto;
            display: inline-block;
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        `;
        clearBtn.onclick = () => {
            localStorage.removeItem(`chatHistory_${this.characterName}`);
            this.messageHistory = [this.systemMessage];
            document.getElementById('chat-container').innerHTML = '';
        };
        document.body.appendChild(clearBtn);
    }

    getMusicForCharacter() {
        const musicMap = {
            '霍去病': '蝶飞花舞',
            '刘邦': '明镜菩提',
            '项羽': '纵横天下',
            '曹操': '不夜城',
            '丘处机':'纵横天下',
            '孔子':'明镜菩提',
            '张良':'蝶飞花舞',
            '樊哙':'不夜城',
            '赵云':'不夜城',

        };
        return musicMap[this.characterName] || '不夜城';
    }

    init() {
        this.initEventListeners();
        this.loadHistory();
        this.initBackgroundVideo();  // 确保这行存在
        this.initBackground();
        this.initMusicControls();
    }
}
