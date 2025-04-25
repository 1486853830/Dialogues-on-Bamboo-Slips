const API_KEY = localStorage.getItem('apiKey');
const systemMessage = {
    role: "system",
    content: "汉高祖刘邦，豪情万丈，心思缜密，做事有万全计划，做事果断，懂得团结部下。回答时，动作神态环境等描写内容用括号括起来"
};

let messageHistory = [systemMessage];
let messageIdCounter = 0;

// 从本地存储加载历史消息
const savedHistory = localStorage.getItem(`chatHistory_刘邦`);
if (savedHistory) {
    messageHistory = JSON.parse(savedHistory);
    messageHistory.forEach(msg => {
        if (msg.role === 'user') {
            displayMessage(msg.content, 'user');
        } else if (msg.role === 'assistant') {
            displayMessage(msg.content, 'bot');
        }
    });
}

function displayMessage(message, sender, isRephrase = false) {
    const chatContainer = document.getElementById('chat-container');
    
    // 创建消息容器
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    
    // 创建消息元素
    const messageElement = document.createElement('div');
    const currentMessageId = `msg-${messageIdCounter++}`;
    messageElement.classList.add('message', `${sender}-message`);
    
    // 处理括号内容
    const processedMessage = message.replace(/（([^）]*)）|\(([^)]*)\)/g,
        '<span style="opacity:0.6">$&</span> ')
        .replace(/<\/span>\s+/g, '</span> ');
    
    messageElement.innerHTML = processedMessage;
    messageContainer.appendChild(messageElement);
    
    // 如果是机器人消息，添加重说按钮
    if (sender === 'bot') {
        // 先移除所有现有的重说按钮
        const existingButtons = chatContainer.querySelectorAll('.rephrase-btn');
        existingButtons.forEach(btn => btn.remove());
        
        // 添加新的重说按钮
        const rephraseBtn = document.createElement('button');
        rephraseBtn.textContent = '重说';
        rephraseBtn.classList.add('rephrase-btn');
        rephraseBtn.onclick = function(e) {
            e.stopPropagation();
            
            // 从消息历史中移除最后一条机器人消息
            if (messageHistory.length > 0 && messageHistory[messageHistory.length-1].role === "assistant") {
                messageHistory.pop();
            }
            
            // 从界面中移除最后一条机器人消息和重说按钮
            const chatContainer = document.getElementById('chat-container');
            const messages = chatContainer.querySelectorAll('.message-container');
            if (messages.length > 0) {
                chatContainer.removeChild(messages[messages.length - 1]);
            }
            
            // 重新发送最后一条用户消息
            const lastUserMessage = messageHistory.filter(msg => msg.role === 'user').pop();
            if (lastUserMessage) {
                sendMessage(true);
            }
        };
        messageContainer.appendChild(rephraseBtn);
    }
    
    chatContainer.appendChild(messageContainer);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage(isRephrase = false) {
    let userInput;
    
    if (!isRephrase) {
        userInput = document.getElementById('user-input').value;
        if (!userInput.trim()) return;
        
        // 添加用户消息到历史
        messageHistory.push({ role: "user", content: userInput });
        displayMessage(userInput, 'user');
        document.getElementById('user-input').value = '';
        
        // 移除所有现有的重说按钮
        const existingButtons = document.querySelectorAll('.rephrase-btn');
        existingButtons.forEach(btn => btn.remove());
    } else {
        // 如果是重说，只移除最后一条机器人消息
        if (messageHistory.length > 0 && messageHistory[messageHistory.length-1].role === "assistant") {
            messageHistory.pop();
            
            // 清除聊天容器中最后一条机器人消息和重说按钮
            const chatContainer = document.getElementById('chat-container');
            const messages = chatContainer.querySelectorAll('.message, .rephrase-btn');
            if (messages.length > 0) {
                for (let i = 0; i < 2; i++) {
                    if (messages[messages.length - 1 - i]) {
                        chatContainer.removeChild(messages[messages.length - 1 - i]);
                    }
                }
            }
        }
    }
    
    // 创建加载元素
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-spinner';
    loadingElement.style.margin = '10px 0 10px 10px';
    document.getElementById('chat-container').appendChild(loadingElement);

    try {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messageHistory,
                temperature: isRephrase ? 0.8 : 0.7,
                presence_penalty: isRephrase ? 0.5 : 0.2
            })
        });

        const data = await response.json();
        const botResponse = data.choices[0].message.content;

        // 移除加载元素
        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }

        // 显示机器人回复
        displayMessage(botResponse, 'bot', isRephrase);
        messageHistory.push({ role: "assistant", content: botResponse });
        
        // 保存到本地存储
        localStorage.setItem(`chatHistory_刘邦`, JSON.stringify(messageHistory));

    } catch (error) {
        console.error("发送消息出错:", error);
        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }
}

async function getPresetResponse() {
    try {
        // 获取最近的3条对话历史
        const recentMessages = messageHistory.slice(-4);

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    ...recentMessages,
                    {
                        role: "user",
                        content: "请基于以上对话，生成3个适合我回复刘邦的选项，每个选项不超过15字，格式为：1.选项1 2.选项2 3.选项3"
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;

        // 从响应中提取选项
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

document.addEventListener('DOMContentLoaded', function () {
    // 添加音乐播放按钮
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
    
    // 创建音频元素
    const audio = new Audio();
    audio.src = '../musics/不夜城.mp3';
    audio.loop = true;
    
    musicBtn.onclick = function() {
        if (audio.paused) {
            audio.play();
            musicBtn.textContent = '🔊';
        } else {
            audio.pause();
            musicBtn.textContent = '🎵';
        }
    };
    document.body.appendChild(musicBtn);

    // 添加清除历史按钮
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
    clearBtn.onclick = function () {
        localStorage.removeItem(`chatHistory_刘邦`);
        messageHistory = [systemMessage];
        document.getElementById('chat-container').innerHTML = '';
    };
    document.body.appendChild(clearBtn);

    // 背景图片加载失败处理
    const bgImg = new Image();
    bgImg.src = 'liubang.png';
    bgImg.onerror = function () {
        document.body.style.background = 'linear-gradient(to bottom, #f5f5f5, #e0e0e0)';
        console.log('背景图片加载失败，已使用备用背景');
    };

    // 发送按钮事件监听
    document.getElementById('send-button').addEventListener('click', function (e) {
        e.preventDefault();
        sendMessage();
    });

    // 输入框回车事件监听
    document.getElementById('user-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 菜单切换功能
    const menuToggle = document.getElementById('menu-toggle');
    const pullUpMenu = document.getElementById('pull-up-menu');
    
    menuToggle.addEventListener('click', async function (e) {
        e.stopPropagation();

        // 显示加载状态
        pullUpMenu.innerHTML = `
            <div style="display:flex; justify-content:center; padding:15px;">
                <div class="loading-spinner"></div>
            </div>
        `;
        pullUpMenu.style.display = 'block';

        // 获取预设回答选项
        const options = await getPresetResponse();

        // 创建选项按钮
        pullUpMenu.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 12px;
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

        // 添加点击事件
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.getElementById('user-input').value = this.dataset.text;
                pullUpMenu.style.display = 'none';
            });

            // 添加悬停效果
            btn.addEventListener('mouseenter', function () {
                this.style.background = 'rgba(0,123,255,0.2)';
                this.style.transform = 'translateY(-2px)';
            });

            btn.addEventListener('mouseleave', function () {
                this.style.background = 'rgba(0,123,255,0.1)';
                this.style.transform = 'none';
            });
        });
    });

    // 点击其他地方关闭菜单
    document.addEventListener('click', function () {
        pullUpMenu.style.display = 'none';
    });
});