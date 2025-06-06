import { synthesizeSpeech } from './speechSynthesis.js';

export function displayMessage(chatContainer, message, sender, messageIdCounter, characterName = "默认") {
    console.log('displayMessage 传入的 characterName:', characterName); // 加这一行

    const halfScreen = localStorage.getItem('halfScreen') === 'true';
    if (halfScreen) {
        chatContainer.style.position = 'fixed';
        chatContainer.style.bottom = '0';
        chatContainer.style.left = '0';
        chatContainer.style.width = '100%';
        chatContainer.style.height = '50vh';
        chatContainer.style.overflowY = 'auto';
        chatContainer.style.background = 'none';
        chatContainer.style.boxSizing = 'border-box';
        chatContainer.style.maskImage = 'linear-gradient(to bottom, transparent 0%, black 20px, black 100%)';
        chatContainer.style.webkitMaskImage = 'linear-gradient(to bottom, transparent 0%, black 20px, black 100%)';
    } else {
        // 重置为默认定位模式
        chatContainer.style.position = 'fixed';
        chatContainer.style.bottom = '0';
        chatContainer.style.left = '0';
        chatContainer.style.width = '95%';  // 由CSS控制宽度
        chatContainer.style.height = '';
        chatContainer.style.overflowY = '';
        chatContainer.style.background = '';
        // 移除遮罩效果
        chatContainer.style.maskImage = 'linear-gradient(to bottom, transparent 0%, black 20px, black 100%)';
        chatContainer.style.webkitMaskImage = 'linear-gradient(to bottom, transparent 0%, black 20px, black 100%)';
    }

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    messageContainer.style.position = 'relative';  // 新增相对定位

    const messageElement = document.createElement('div');
    const currentMessageId = `msg-${messageIdCounter++}`;
    messageElement.classList.add('message', `${sender}-message`);

    const processedMessage = message
        .replace(/（([^）]*)）|\(([^)]*)\)/g, '<span style="opacity:0.6">$&</span>')
        .replace(/\*([^*]+)\*/g, '<span style="opacity:0.6">（$1）</span>')
        .replace(/<\/span>\s+/g, '</span> ');

    messageElement.innerHTML = processedMessage;
    messageContainer.appendChild(messageElement);

    // 嘿！为机器消息添加一个超酷的播放按钮，点击就能听消息啦😎
    if (sender === 'bot') {
        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        playBtn.innerHTML = '▶';
        playBtn.style.position = 'absolute';
        playBtn.style.top = '-15px'; // 向下移动5px
        playBtn.style.left = '-6px';
        playBtn.style.width = '36px';
        playBtn.style.height = '36px';
        playBtn.style.background = 'linear-gradient(145deg, #6B8DD6, #8E37D7)';
        playBtn.style.color = 'white';
        playBtn.style.borderRadius = '8px';
        playBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        playBtn.style.fontSize = '16px';
        playBtn.style.display = 'flex';
        playBtn.style.alignItems = 'center';
        playBtn.style.justifyContent = 'center';
        playBtn.style.transition = 'all 0.2s';
        playBtn.style.zIndex = '1000';
        playBtn.onmouseover = () => playBtn.style.transform = 'scale(1.1)';
        playBtn.onmouseout = () => playBtn.style.transform = 'scale(1)';
        playBtn.onclick = () => {
            try {
                synthesizeSpeech(message, characterName); // 传递角色名
            } catch (error) {
                console.error('语音播放失败:', error);
            }
        };
        messageContainer.appendChild(playBtn);
    }

    return { messageContainer, messageIdCounter };
}

export function addRephraseButton(messageContainer, handleRephrase, messageHistory, msgIndex) {
    // 只给“有用户输入的AI回复”加重说按钮
    if (
        !Array.isArray(messageHistory) ||
        msgIndex === undefined ||
        msgIndex < 1 ||
        messageHistory[msgIndex].role !== 'assistant' ||
        messageHistory[msgIndex - 1].role !== 'user'
    ) {
        // 不是“用户输入+AI回复”结构，不加重说按钮
        return;
    }

    const existingButtons = document.querySelectorAll('.rephrase-btn');
    existingButtons.forEach(btn => btn.remove());

    const rephraseBtn = document.createElement('button');
    rephraseBtn.textContent = '重说';
    rephraseBtn.classList.add('rephrase-btn');
    rephraseBtn.onclick = async (e) => {
        e.stopPropagation();
        try {
            if (typeof handleRephrase === 'function') {
                const result = await handleRephrase();
                if (result === null) {
                    return;
                }
            }
        } catch (error) {
            console.error('重说功能异常:', error);
        }
    };
    messageContainer.appendChild(rephraseBtn);
}
