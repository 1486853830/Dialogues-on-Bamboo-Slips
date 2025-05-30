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
        playBtn.style.top = '-36px';
        playBtn.style.left = '0';
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
                synthesizeSpeech(message);
            } catch (error) {
                console.error('语音播放失败:', error);
            }
        };
        messageContainer.appendChild(playBtn);  // 修改为添加到容器而非消息元素
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
