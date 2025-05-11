export async function sendMessage(API_KEY, messageHistory, userInput, isRephrase, chatContainer, displayMessage, handleRephrase) {
    if (messageHistory.length === 1) {
        messageHistory[0].content = `你正在与${localStorage.getItem('userName') || '访客'}(${localStorage.getItem('userGender') || 'unknown'})对话。
        用户人设: ${localStorage.getItem('userPersona') || ''}
        请以${messageHistory[0].content.split('作为')[1].split('，')[0]}的身份和口吻进行对话。
        你需要主动推动故事情节发展，在回复中：
        内容简短不超过50字，动作神态等内容用括号括上`;
    }

    if (!isRephrase) {
        if (!userInput.trim()) return;
        messageHistory.push({ role: "user", content: userInput });
        const { messageContainer } = displayMessage(chatContainer, userInput, 'user', 0);
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        document.getElementById('user-input').value = '';

        const existingButtons = document.querySelectorAll('.rephrase-btn');
        existingButtons.forEach(btn => btn.remove());
    } else {
        const userMessage = handleRephrase(messageHistory, chatContainer);
        if (userMessage) {
            messageHistory.push(userMessage);
            const { messageContainer } = displayMessage(chatContainer, userMessage.content, 'user', 0);
            chatContainer.appendChild(messageContainer);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-spinner';
    loadingElement.style.margin = '10px 0 10px 10px';
    chatContainer.appendChild(loadingElement);

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
                temperature: 0.8,
                presence_penalty: 0.5,
                frequency_penalty: 0.5
            })
        });

        const data = await response.json();
        const botResponse = data.choices[0].message.content;

        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }

        const { messageContainer } = displayMessage(chatContainer, botResponse, 'bot', 0);
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        messageHistory.push({ role: "assistant", content: botResponse });
        localStorage.setItem(`chatHistory_${messageHistory[0].content.split('作为')[1].split('，')[0]}`, JSON.stringify(messageHistory));

    } catch (error) {
        console.error("发送消息出错:", error);
        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }
}

export async function getPresetResponse(API_KEY, messageHistory, characterName) {
    try {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    ...messageHistory,
                    {
                        role: "user",
                        content: `请基于以上对话，生成3个适合我回复${characterName}的选项，每个选项不超过80字，动作神态描写用括号括起来，格式为：1.选项1 2.选项2 3.选项3`
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

export async function sendWelcomeMessage(API_KEY, messageHistory, characterName, chatContainer, displayMessage) {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-spinner';
    chatContainer.appendChild(loadingElement);

    try {
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{
                    role: "system",
                    content: `作为${characterName}，用1-2句话向${localStorage.getItem('userName') || '访客'}(${localStorage.getItem('userGender') || 'unknown'})打招呼，结合用户人设"${localStorage.getItem('userPersona') || ''}"。包含动作描写（用括号标注，语言不要打引号），总字数100字左右。`
                }],
                temperature: 0.9
            })
        });

        const data = await response.json();
        const welcomeMessage = data.choices[0].message.content;

        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }

        const { messageContainer } = displayMessage(chatContainer, welcomeMessage, 'bot', 0);
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
        const { messageContainer } = displayMessage(chatContainer, fallbackMessage, 'bot', 0);
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        messageHistory.push({ role: "assistant", content: fallbackMessage });
    }
}
