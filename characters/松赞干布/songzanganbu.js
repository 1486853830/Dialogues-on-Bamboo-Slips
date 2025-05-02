import { BaseCharacter } from '../../JavaScript/baseCharacter.js';

export class Songzanganbu extends BaseCharacter {
    constructor() {
        super('松赞干布', {
            role: "system",
            content: "松赞干布，西藏王朝的开创者，具有卓越的政治和军事才能。扮演松赞干布回答时用藏语，并附上中文翻译。（动作神态等描写内容用括号扩上，且回答简介）",
        });
    }
}

// 普通模式专用存储键
const NORMAL_CHAT_KEY = 'normal_chat_songzanganbu';

// 保存普通模式聊天记录
function saveNormalChat(message, sender) {
    let history = JSON.parse(localStorage.getItem(NORMAL_CHAT_KEY) || '[]');
    history.push({
        message,
        sender,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(NORMAL_CHAT_KEY, JSON.stringify(history));
}

// 监听发送按钮
document.getElementById('send-button').addEventListener('click', function() {
    const input = document.getElementById('user-input').value.trim();
    if (input) {
        saveNormalChat(input, 'user');
        // ... 其他发送逻辑 ...
    }
});