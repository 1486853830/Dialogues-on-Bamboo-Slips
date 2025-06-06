// 从 localStorage 获取 API 提供商
const getApiProvider = () => localStorage.getItem('apiProvider') || 'deepseek';
// 获取对应 API 密钥
const getApiKey = () => {
    const provider = getApiProvider();
    if (provider === 'deepseek') {
        return localStorage.getItem('apiKey');
    } else if (provider === 'qianwen') {
        return localStorage.getItem('qianwenApiKey');
    } else if (provider === 'moliark') {
        return localStorage.getItem('moliarkApiKey');
    }
    return '';
};

const getCharacterKey = (history) => {
    try {
        if (history.characterName) return `chatHistory_${history.characterName}`;
        const systemMessage = history.find(m => m.role === 'system')?.content || '';
        const matchResult = systemMessage.match(/作为([^，,（(]+)/);
        return `chatHistory_${matchResult?.[1]?.trim() || 'unknown'}`;
    } catch {
        return `chatHistory_${Date.now()}`;
    }
};

import { displayMessage } from './messageHandler.js';

export async function sendMessage(API_KEY, messageHistory, userInput, isRephrase, chatContainer, handleRephrase, callback) {
    const apiProvider = getApiProvider();
    const apiKey = getApiKey();
    // 获取当前角色名
    const characterName = window.currentCharacter?.name || "默认";

    if (messageHistory.length === 1) {
        messageHistory[0].content = `你正在与${localStorage.getItem('userName') || '访客'}(${localStorage.getItem('userGender') || 'unknown'})对话。
            用户人设: ${localStorage.getItem('userPersona') || ''}
            请以${(messageHistory[0].content.match(/作为([^，,（(]+)/) || [,''])[1].trim()}的身份和口吻进行对话。
            你需要主动推动故事情节发展，在回复中：
            内容简短不超过 50 字，动作神态等内容用括号括上`;
    }

    if (!isRephrase) {
        if (!userInput.trim()) return;
        messageHistory.push({ role: "user", content: userInput });
        const { messageContainer } = displayMessage(chatContainer, userInput, 'user', 0, characterName);
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        document.getElementById('user-input').value = '';

        const existingButtons = document.querySelectorAll('.rephrase-btn');
        existingButtons.forEach(btn => btn.remove());
    } else {
        const userMessage = handleRephrase();
        if (userMessage) {
            messageHistory.push(userMessage);
            const { messageContainer } = displayMessage(chatContainer, userMessage.content, 'user', 0, characterName);
            chatContainer.appendChild(messageContainer);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-spinner';
    loadingElement.style.margin = '10px 0 10px 10px';
    chatContainer.appendChild(loadingElement);

    try {
        let response, data, botResponse;
        if (apiProvider === 'deepseek' || apiProvider === 'qianwen') {
            // 你的本地后端代理
            response = await fetch("http://localhost:3000/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    apiProvider,
                    apiKey,
                    messageHistory
                })
            });
            data = await response.json();
            botResponse = apiProvider === 'deepseek' ? data.choices[0].message.content : data.output.text;
        } else if (apiProvider === 'moliark') {
            // 用新版官方API地址
            response = await fetch("https://ai.gitee.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-v3", // ← 改成你控制台实际可用的模型名
                    messages: messageHistory.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                })
            });
            data = await response.json();
            console.log('模力方舟返回：', data);
            botResponse = data.choices?.[0]?.message?.content || "（模力方舟API返回异常）";
        } else {
            botResponse = "暂不支持的API类型";
        }

        // 自动保存逻辑
        const autoSave = (history) => {
            try {
                const compressedHistory = history.map(msg => ({
                    role: msg.role,
                    content: msg.content.substring(0, 500)
                }));
                localStorage.setItem(getCharacterKey(history), JSON.stringify(compressedHistory));
            } catch (e) {
                console.error('自动保存失败:', e);
            }
        };

        messageHistory.push({ role: "assistant", content: botResponse });
        autoSave(messageHistory);

        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }

        // 修复messageIdCounter参数传递
        let result;
        if (typeof callback === 'function') {
            result = callback(chatContainer, botResponse, 'bot', 0, characterName); // 传递角色名
        } else {
            result = displayMessage(chatContainer, botResponse, 'bot', 0, characterName);
        }

        const messageContainer = result.messageContainer;
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        localStorage.setItem(getCharacterKey(messageHistory), JSON.stringify(messageHistory));
    } catch (error) {
        console.error("发送消息出错:", error);
        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }
}

export async function sendWelcomeMessage(API_KEY, messageHistory, characterName, chatContainer, displayMessage) {
    const apiProvider = getApiProvider();
    const apiKey = getApiKey();
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-spinner';
    chatContainer.appendChild(loadingElement);

    try {
        let response, data, welcomeMessage;
        if (apiProvider === 'deepseek' || apiProvider === 'qianwen') {
            response = await fetch("http://localhost:3000/sendWelcomeMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    apiProvider,
                    apiKey,
                    characterName,
                    userName: localStorage.getItem('userName'),
                    userGender: localStorage.getItem('userGender'),
                    userPersona: localStorage.getItem('userPersona')
                })
            });
            data = await response.json();
            welcomeMessage = apiProvider === 'deepseek' ? data.choices[0].message.content : data.output.text;
        } else if (apiProvider === 'moliark') {
            response = await fetch("https://ai.gitee.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-v3", // ← 同上
                    messages: [
                        {
                            role: "system",
                            content: `你是${characterName}，请用角色身份欢迎用户：${localStorage.getItem('userName') || '访客'}，性别：${localStorage.getItem('userGender') || ''}，人设：${localStorage.getItem('userPersona') || ''}`
                        }
                    ]
                })
            });
            data = await response.json();
            welcomeMessage = data.choices?.[0]?.message?.content || data.output?.text || "（模力方舟API返回异常）";
        } else {
            welcomeMessage = "暂不支持的API类型";
        }

        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }

        const { messageContainer } = displayMessage(chatContainer, welcomeMessage, 'bot', 0, characterName);
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        messageHistory.push({ role: "assistant", content: welcomeMessage });
        localStorage.setItem(`chatHistory_${characterName}`, JSON.stringify(messageHistory));
    } catch (error) {
        console.error("生成欢迎消息出错:", error);
        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
        const fallbackMessage = `（微笑）${localStorage.getItem('userName') || '访客'}，你好！`;
        const { messageContainer } = displayMessage(chatContainer, fallbackMessage, 'bot', 0, characterName);
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        messageHistory.push({ role: "assistant", content: fallbackMessage });
    }
}

export async function getPresetResponse(API_KEY, messageHistory, characterName) {
    const apiProvider = getApiProvider();
    const apiKey = getApiKey();
    try {
        let response, data, content;
        if (apiProvider === 'deepseek' || apiProvider === 'qianwen') {
            response = await fetch("http://localhost:3000/getPresetResponse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    apiProvider,
                    apiKey,
                    messageHistory,
                    characterName
                })
            });
            data = await response.json();
            content = apiProvider === 'deepseek' ? data.choices[0].message.content : data.output.text;
        } else if (apiProvider === 'moliark') {
            response = await fetch("https://ai.gitee.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-v3", // ← 同上
                    messages: [
                        ...messageHistory,
                        {
                            role: "user",
                            content: "请给出3个简短的下一步对话建议，每条建议前加序号。"
                        }
                    ]
                })
            });
            data = await response.json();
            content = data.choices?.[0]?.message?.content || data.output?.text || "";
        } else {
            content = "";
        }

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