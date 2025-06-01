let audioContext;
let currentAudio;

export async function synthesizeSpeech(text) {
    try {
        // 停止当前播放
        if (currentAudio) {
            currentAudio.stop();
            currentAudio = null;
        }

        // 修正请求路径为原始有效路径
        const response = await fetch('http://localhost:3000/ws-tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('qianwenApiKey')}`
            },
            body: JSON.stringify({
                text: text.substring(0, 300),
                voice_type: 'zhitian_emo'  // 确保使用阿里云支持的音色
            })
        });

        // 添加响应状态检查
        if (!response.ok) {
            throw new Error(`请求失败，状态码：${response.status}`);
        }

        // 修改音频数据处理方式
        const audioBlob = await response.blob();
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        // 确保解码前重置音频上下文
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        currentAudio = source;
    } catch (error) {
        // 增强错误处理
        let errorMsg = error.message;
        if (error.response) {
            try {
                const errorData = await error.response.json();
                errorMsg = errorData.message || errorData.code || '未知错误';
            } catch (e) {
                errorMsg = `服务返回异常：${error.response.status}`;
            }
        }
        alert(`语音合成失败: ${errorMsg}`);
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
