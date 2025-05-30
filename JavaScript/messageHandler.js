import { synthesizeSpeech } from './speechSynthesis.js';

export function displayMessage(chatContainer, message, sender, messageIdCounter) {
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
        playBtn.style.left = '0';
        playBtn.onclick = () => {
            try {
                synthesizeSpeech(message);
            } catch (error) {
                console.error('语音播放失败:', error);
            }
        };
        messageElement.prepend(playBtn);
    }

    return { messageContainer, messageIdCounter };
}

export function addRephraseButton(messageContainer, handleRephrase) {
    const existingButtons = document.querySelectorAll('.rephrase-btn');
    existingButtons.forEach(btn => btn.remove());

    const rephraseBtn = document.createElement('button');
    rephraseBtn.textContent = '重说';
    rephraseBtn.classList.add('rephrase-btn');
    rephraseBtn.onclick = async (e) => {  // 改为异步处理
        e.stopPropagation();
        try {
            // 添加参数有效性校验
            if (typeof handleRephrase === 'function') {
                await handleRephrase();
            }
        } catch (error) {
            console.error('重说功能异常:', error);
        }
    };
    messageContainer.appendChild(rephraseBtn);
}
