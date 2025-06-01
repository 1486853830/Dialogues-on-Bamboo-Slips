let audioContext;
let currentAudio;
let isSynthesizing = false;

// 历史人物语音参数表，可自行扩展
const characterTTSParams = {
    "霍去病":   { voice_type: "longcheng", rate: 1.15, pitch: 1.1, volume: 60 },
    "刘邦":     { voice_type: "aiqing",    rate: 1.05, pitch: 1.0, volume: 55 },
    "项羽":     { voice_type: "zhitian_emo", rate: 0.95, pitch: 0.95, volume: 65 },
    "曹操":     { voice_type: "zhitian_emo", rate: 1.0, pitch: 1.0, volume: 60 },
    "张良":     { voice_type: "longcheng", rate: 1.0, pitch: 1.1, volume: 55 },
    "丘处机":   { voice_type: "longcheng", rate: 0.9, pitch: 1.2, volume: 50 },
    "孔子":     { voice_type: "aiqing",    rate: 1.0, pitch: 1.1, volume: 55 },
    "赵云":     { voice_type: "longcheng", rate: 1.1, pitch: 1.15, volume: 60 },
    "松赞干布": { voice_type: "aiqing",    rate: 1.0, pitch: 1.0, volume: 55 },
    "文成公主": { voice_type: "aiqing",    rate: 1.05, pitch: 1.2, volume: 60 },
    "牛顿":     { voice_type: "longcheng", rate: 1.0, pitch: 1.0, volume: 50 },
    "孟德尔":   { voice_type: "longcheng", rate: 1.0, pitch: 1.0, volume: 50 },
    "耶律阿保机": { voice_type: "zhitian_emo", rate: 1.0, pitch: 1.0, volume: 60 },
    "默认":     { voice_type: "longcheng", rate: 1, pitch: 1, volume: 50 }
};

// 新增参数 character，默认“李白”
export async function synthesizeSpeech(text, character = "默认") {
    if (isSynthesizing) return;
    isSynthesizing = true;
    try {
        const apiKey = localStorage.getItem('qianwenApiKey');
        const ttsParams = characterTTSParams[character] || characterTTSParams["默认"];
        console.log('前端传递的角色:', character, ttsParams);
        const response = await fetch('/ws-tts', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ 
                text,
                ...ttsParams
            })
        });
        if (!response.ok) {
            alert('语音合成失败');
            return;
        }
        const arrayBuffer = await response.arrayBuffer();
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    } finally {
        isSynthesizing = false;
    }
}

// 自动播放逻辑
let autoPlayEnabled = false;

export function toggleAutoPlay() {
    autoPlayEnabled = !autoPlayEnabled;
    return autoPlayEnabled;
}

export function autoPlaySpeech(text, character = "李白") {
    if (autoPlayEnabled) {
        synthesizeSpeech(text, character);
    }
}
