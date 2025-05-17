let audioContext;
let currentAudio;

export async function synthesizeSpeech(text) {
    try {
        // 停止当前播放
        if (currentAudio) {
            currentAudio.stop();
            currentAudio = null;
        }

        // 通过代理服务器调用通义千问语音合成API
        const response = await fetch('http://localhost:3000/synthesize-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('qianwenApiKey')}`
            },
            body: JSON.stringify({
                text: text.substring(0, 300), // 限制文本长度
                voice_type: 'female' // 可选项: female/male
            })
        });

        // 获取音频流
        const audioStream = await response.arrayBuffer();
        
        // 使用Web Audio API播放
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createBufferSource();
        source.buffer = await audioContext.decodeAudioData(audioStream);
        
        source.connect(audioContext.destination);
        source.start(0);
        currentAudio = source;
    } catch (error) {
        console.error('语音合成失败:', error);
        alert('语音播放功能暂时不可用');
    }
}

// 自动播放逻辑
let autoPlayEnabled = false;

export function toggleAutoPlay() {
    autoPlayEnabled = !autoPlayEnabled;
    return autoPlayEnabled;
}

export function autoPlaySpeech(text) {
    if (autoPlayEnabled) {
        synthesizeSpeech(text);
    }
}
