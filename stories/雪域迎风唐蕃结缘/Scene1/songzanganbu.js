// 场景特定的松赞干布设定
const sceneCharacter = {
    name: '松赞干布',
    age: '13岁',
    background: '刚刚完成平定内乱的年轻赞普',
    personality: '果敢坚毅但略显青涩，正在寻求巩固王权的方法',
    currentSituation: '刚刚肃清叛臣，正在考虑与大唐和亲以巩固统治'
};

// 故事场景专用存储键
const SCENE_CHAT_KEY = 'scene_chat_songzanganbu_story';

// 保存聊天记录
function saveChat(message, sender) {
    let history = JSON.parse(localStorage.getItem(SCENE_CHAT_KEY) || '[]');
    history.push({
        message,
        sender,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(SCENE_CHAT_KEY, JSON.stringify(history));
}

// 初始化时保存开场白
window.onload = function() {
    const greeting = "（擦拭着染血的佩刀，抬头望向远方）内乱虽平，但吐蕃各部仍心怀鬼胎...我需要寻找新的力量来巩固王权。大唐...或许是个不错的选择？";
    
    const chatContainer = document.getElementById('chat-container');
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');

    const processedMessage = greeting.replace(/（([^）]*)）|\(([^)]*)\)/g,
        '<span style="opacity:0.6">$&</span> ')
        .replace(/<\/span>\s+/g, '</span> ');

    messageElement.innerHTML = processedMessage;
    messageContainer.appendChild(messageElement);
    chatContainer.appendChild(messageContainer);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 保存开场消息
    saveChat(greeting, 'bot');
}

// 监听发送按钮
document.getElementById('send-button').addEventListener('click', function() {
    const input = document.getElementById('user-input').value.trim();
    if (input) {
        saveChat(input, 'user');
        // ... 其他发送逻辑 ...
    }
});


// 修改预设按钮点击处理
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const text = this.getAttribute('data-text');
        document.getElementById('user-input').value = text;
        
        // 根据模式生成回答
        generateResponse(text, isStoryMode());
    });
});
