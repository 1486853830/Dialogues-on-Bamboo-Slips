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

function stripBrackets(text) {
    // 去除所有中英文括号及其内容
    return text.replace(/（[^）]*）|\([^)]*\)/g, '');
}

function setMusicVolume(percentage) {
    const musicAudio = document.getElementById('music-audio');
    if (musicAudio) {
        musicAudio.volume = percentage;
    }
}

// 新增参数 character，默认“李白”
export async function synthesizeSpeech(text, character = "默认") {
    // 直接用流式播放
    return synthesizeSpeechStream(text, character);
}

// 流式语音合成
export async function synthesizeSpeechStream(text, character = "默认") {
    if (isSynthesizing) return;
    isSynthesizing = true;
    try {
        text = stripBrackets(text);
        setMusicVolume(0.5); // 语音播放前降低音量
        const apiKey = localStorage.getItem('qianwenApiKey');
        const ttsParams = characterTTSParams[character.trim()] || characterTTSParams["默认"];
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

        if (!response.body) {
            alert('语音合成失败');
            isSynthesizing = false;
            return;
        }

        // 复用或创建audio元素
        let audio = document.getElementById('tts-audio');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'tts-audio';
            audio.controls = true;
            document.body.appendChild(audio);
        }
        audio.src = '';
        audio.pause();

        const mediaSource = new MediaSource();
        audio.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', () => {
            const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
            const reader = response.body.getReader();
            let started = false;

            function feed() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        if (!sourceBuffer.updating) {
                            mediaSource.endOfStream();
                        } else {
                            sourceBuffer.addEventListener('updateend', () => {
                                mediaSource.endOfStream();
                            }, { once: true });
                        }
                        isSynthesizing = false;
                        return;
                    }
                    // 关键：等待sourceBuffer空闲再append
                    if (!sourceBuffer.updating) {
                        sourceBuffer.appendBuffer(value);
                        if (!started) {
                            audio.play();
                            started = true;
                        }
                        feed();
                    } else {
                        sourceBuffer.addEventListener('updateend', () => {
                            sourceBuffer.appendBuffer(value);
                            if (!started) {
                                audio.play();
                                started = true;
                            }
                            feed();
                        }, { once: true });
                    }
                });
            }
            feed();
        });

        audio.onended = () => {
            setMusicVolume(1); // 播放结束恢复
            isSynthesizing = false;
        };
    } catch (e) {
        setMusicVolume(1); // 出错也恢复
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
        synthesizeSpeechStream(text, character); // 改为流式自动播放
    }
}
