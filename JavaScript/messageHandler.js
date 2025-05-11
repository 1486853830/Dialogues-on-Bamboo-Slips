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
    const currentMessageId = `msg-${messageIdCounter++}`;
    messageElement.classList.add('message', `${sender}-message`);

    const processedMessage = message
        .replace(/（([^）]*)）|\(([^)]*)\)/g, '<span style="opacity:0.6">$&</span>')
        .replace(/\*([^*]+)\*/g, '<span style="opacity:0.6">（$1）</span>')
        .replace(/<\/span>\s+/g, '</span> ');

    messageElement.innerHTML = processedMessage;
    messageContainer.appendChild(messageElement);

    return { messageContainer, messageIdCounter };
}

export function addRephraseButton(messageContainer, handleRephrase) {
    const existingButtons = document.querySelectorAll('.rephrase-btn');
    existingButtons.forEach(btn => btn.remove());

    const rephraseBtn = document.createElement('button');
    rephraseBtn.textContent = '重说';
    rephraseBtn.classList.add('rephrase-btn');
    rephraseBtn.onclick = (e) => {
        e.stopPropagation();
        handleRephrase();
    };
    messageContainer.appendChild(rephraseBtn);
}

export function handleRephrase(messageHistory, chatContainer) {
    if (messageHistory.length >= 2 && messageHistory[messageHistory.length - 1].role === "assistant") {
        messageHistory.pop();
        const userMessage = messageHistory.pop();

        const messages = chatContainer.querySelectorAll('.message-container');
        if (messages.length >= 2) {
            chatContainer.removeChild(messages[messages.length - 1]);
            chatContainer.removeChild(messages[messages.length - 2]);
        } else if (messages.length === 1) {
            chatContainer.removeChild(messages[0]);
        }

        if (userMessage) {
            messageHistory.push(userMessage);
            return userMessage;
        }
    }
    return null;
}
