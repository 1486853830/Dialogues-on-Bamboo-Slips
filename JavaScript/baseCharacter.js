export class BaseCharacter {
    constructor(characterName, systemMessage) {
        // 获取当前选择的API提供商
        this.apiProvider = localStorage.getItem('apiProvider') || 'deepseek';
        this.API_KEY = this.apiProvider === 'deepseek' 
            ? localStorage.getItem('apiKey') 
            : localStorage.getItem('qianwenApiKey');
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
            let response;
            let apiUrl;
            let requestOptions;
            
            if (this.apiProvider === 'deepseek') {
                apiUrl = "https://api.deepseek.com/v1/chat/completions";
                requestOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: this.messageHistory,
                        temperature: 0.8,
                        presence_penalty: 0.5,
                        frequency_penalty: 0.5
                    })
                };
            } else {
                apiUrl = "/proxy/dashscope"; 
                requestOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.API_KEY}`,
                        "X-DashScope-Plugin": "qwen-long"
                    },
                    body: JSON.stringify({
                        model: "qwen-long",
                        input: {
                            messages: this.messageHistory
                        },
                        parameters: {
                            result_format: "message",
                            temperature: 0.8,
                            top_p: 0.8
                        }
                    })
                };
            }

            if (!this.API_KEY) {
                throw new Error(`未配置${this.apiProvider === 'deepseek' ? 'DeepSeek' : '通义千问'} API密钥`);
            }

            response = await fetch(apiUrl, requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP 请求失败，状态码: ${response.status}`);
            }

            let botResponse;
            const data = await response.json();
            console.log('API 响应数据:', data); // 打印响应数据，方便调试

            if (this.apiProvider === 'deepseek') {
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    botResponse = data.choices[0].message.content;
                } else {
                    throw new Error('DeepSeek API 响应数据结构异常');
                }
            } else {
                if (data.output && data.output.choices && data.output.choices[0] && data.output.choices[0].message) {
                    botResponse = data.output.choices[0].message.content;
                } else {
                    throw new Error('通义千问 API 响应数据结构异常');
                }
            }

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
            // 显示更友好的错误信息给用户
            alert(`发送消息失败: ${error.message}`);
        }
    }

    async getPresetResponse() {
        try {
            let response;
            if (this.apiProvider === 'deepseek') {
                response = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
            } else {
                // 通义千问API调用
                response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.API_KEY}`,
                        "X-DashScope-Plugin": "qwen-long"
                    },
                    body: JSON.stringify({
                        model: "qwen-long",
                        input: {
                            messages: [
                                ...this.messageHistory,
                                {
                                    role: "user",
                                    content: `请基于以上对话，生成3个适合我回复${this.characterName}的选项，每个选项不超过80字，动作神态描写用括号括起来，格式为：1.选项1 2.选项2 3.选项3`
                                }
                            ]
                        },
                        parameters: {
                            result_format: "message",
                            temperature: 1
                        }
                    })
                });
            }

            let responseContent;
            if (this.apiProvider === 'deepseek') {
                const data = await response.json();
                responseContent = data.choices[0].message.content;
            } else {
                const data = await response.json();
                responseContent = data.output.choices[0].message.content;
            }

            const options = responseContent.split('\n')
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
        // 创建 loadingElement
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-spinner';
        loadingElement.style.margin = '10px 0 10px 10px';
        document.getElementById('chat-container').appendChild(loadingElement);
    
        try {
            let response;
            let apiUrl;
            let requestOptions;
    
            if (this.apiProvider === 'deepseek') {
                apiUrl = "https://api.deepseek.com/v1/chat/completions";
                requestOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: this.messageHistory,
                        temperature: 0.8,
                        presence_penalty: 0.5,
                        frequency_penalty: 0.5
                    })
                };
            } else {
                // 使用代理地址
                apiUrl = "/proxy/dashscope"; 
                requestOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.API_KEY}`,
                        "X-DashScope-Plugin": "qwen-long"
                    },
                    body: JSON.stringify({
                        model: "qwen-long",
                        input: {
                            messages: this.messageHistory
                        },
                        parameters: {
                            result_format: "message",
                            temperature: 0.8,
                            top_p: 0.8
                        }
                    })
                };
            }
    
            if (!this.API_KEY) {
                throw new Error(`未配置${this.apiProvider === 'deepseek' ? 'DeepSeek' : '通义千问'} API密钥`);
            }
    
            response = await fetch(apiUrl, requestOptions);
    
            let botResponse;
            if (this.apiProvider === 'deepseek') {
                const data = await response.json();
                botResponse = data.choices[0].message.content;
            } else {
                // 通义千问响应处理
                const data = await response.json();
                botResponse = data.output.choices[0].message.content;
            }
    
            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
    
            this.displayMessage(botResponse, 'bot');
            this.messageHistory.push({ role: "assistant", content: botResponse });
            localStorage.setItem(`chatHistory_${this.characterName}`, JSON.stringify(this.messageHistory));
        } catch (error) {
            console.error("发送消息出错:", error);
            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
            // 显示更友好的错误信息给用户
            alert(`发送消息失败: ${error.message}`);
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
        musicBtn.textContent = '🔊';
        musicBtn.id = 'music-toggle';
        musicBtn.style.cssText = `
            -webkit-user-select: none; /* Chrome/Safari */
            -moz-user-select: none; /* Firefox */
            -ms-user-select: none; /* IE/Edge */
            user-select: none; /* 标准语法 */
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
        
        // 修改这里：添加自动播放
        audio.play().catch(e => {
            console.log('自动播放被阻止:', e);
            musicBtn.textContent = '🔇';
        });
        
        musicBtn.onclick = () => {
            if (audio.paused) {
                audio.play();
                musicBtn.textContent = '🔊';
            } else {
                audio.pause();
                musicBtn.textContent = '🔇';
            }
        };
        document.body.appendChild(musicBtn);

        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️';
        clearBtn.id = 'clear-history';
        clearBtn.style.cssText = `
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
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
        clearBtn.onclick = (e) => {
            e.stopPropagation();
            
            // 创建确认弹窗
            const confirmDialog = document.createElement('div');
            confirmDialog.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 2000;
                width: 300px;
                text-align: center;
                opacity: 0;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.15);
            `;
            
            confirmDialog.innerHTML = `
                <h3 style="margin-top: 0; color: white;">确认清除聊天记录？</h3>
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
                    <button id="cancel-clear" style="
                        padding: 8px 20px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">取消</button>
                    <button id="confirm-clear" style="
                        padding: 8px 20px;
                        background: #ff4444;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">确认</button>
                </div>
            `;
            
            document.body.appendChild(confirmDialog);
            
            // 添加动画效果
            setTimeout(() => {
                confirmDialog.style.opacity = '1';
                confirmDialog.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
            
            // 按钮悬停效果
            document.getElementById('confirm-clear').onmouseenter = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(255, 68, 68, 0.3)';
            };
            document.getElementById('confirm-clear').onmouseleave = function() {
                this.style.transform = 'none';
                this.style.boxShadow = 'none';
            };
            document.getElementById('cancel-clear').onmouseenter = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.2)';
            };
            document.getElementById('cancel-clear').onmouseleave = function() {
                this.style.transform = 'none';
                this.style.boxShadow = 'none';
            };
            
            // 确认按钮事件
            document.getElementById('confirm-clear').onclick = () => {
                localStorage.removeItem(`chatHistory_${this.characterName}`);
                this.messageHistory = [this.systemMessage];
                document.getElementById('chat-container').innerHTML = '';
                document.body.removeChild(confirmDialog);
            };
            
            // 取消按钮事件
            document.getElementById('cancel-clear').onclick = () => {
                confirmDialog.style.opacity = '0';
                confirmDialog.style.transform = 'translate(-50%, -50%) scale(0.9)';
                setTimeout(() => {
                    if (confirmDialog.parentNode) {
                        document.body.removeChild(confirmDialog);
                    }
                }, 300);
            };
            
            // 点击弹窗外部关闭
            document.addEventListener('click', function handleOutsideClick(e) {
                if (!confirmDialog.contains(e.target) && e.target !== clearBtn) {
                    confirmDialog.style.opacity = '0';
                    confirmDialog.style.transform = 'translate(-50%, -50%) scale(0.9)';
                    setTimeout(() => {
                        if (confirmDialog.parentNode) {
                            document.body.removeChild(confirmDialog);
                        }
                        document.removeEventListener('click', handleOutsideClick);
                    }, 300);
                }
            });
        };
        document.body.appendChild(clearBtn);
    }

    getMusicForCharacter() {
        const musicMap = {
            '霍去病': '华灯初上',
            '刘邦': '旧事',
            '项羽': '国破',
            '曹操': '旧事',
            '丘处机': '青衣',
            '孔子': '青衣',
            '张良': '青衣',
            '樊哙': '华灯初上',
            '赵云': '青衣',
            '松赞干布': '山风',
            '耶律阿保机': '永恒之地',
            '牛顿': '青衣',
            '孟德尔': '青衣',
            '文成公主': '永恒之地',
            '斩锋卒': '永恒之地',
            '锦衣卫': '青衣'
        };
        return musicMap[this.characterName] || '永恒之地';
    }

    init() {
        this.initEventListeners();
        this.loadHistory();
        this.initBackgroundVideo();  // 确保这行存在
        this.initBackground();
        this.initMusicControls();
    }
}
