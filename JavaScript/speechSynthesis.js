let audioContext;
let currentAudio;
let isSynthesizing = false;
let currentPlayId = 0; // 全局唯一播放标记

// 历史人物语音参数表，可自行扩展
const characterTTSParams = {
    "曹操":     { voice_type: "longshu", rate: 0.9, pitch: 0.95, volume: 100 },
    "樊哙":     { voice_type: "longshu", rate: 1.0, pitch: 0.9, volume: 100 },
    "霍去病":   { voice_type: "longcheng", rate: 1.0, pitch: 1.0, volume: 100 },
    "锦衣卫":   { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "孔子":     { voice_type: "longshu", rate: 1.0, pitch: 0.9, volume: 100 },
    "令狐冲":   { voice_type: "longfei", rate: 0.9, pitch: 1.0, volume: 100 },
    "刘邦":     { voice_type: "longfei", rate: 1.0, pitch: 0.95, volume: 100 },
    "刘备":     { voice_type: "longfei", rate: 1.0, pitch: 0.95, volume: 100 },
    "孟德尔":   { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "牛顿":     { voice_type: "loogfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "丘处机":   { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "司马光":   { voice_type: "longshu", rate: 1.0, pitch: 1.0, volume: 100 },
    "松赞干布": { voice_type: "longyuan", rate: 1.0, pitch: 1.0, volume: 100 },
    "孙权":     { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "腾格里骑兵": { voice_type: "longfei", rate: 1.0, pitch: 0.95, volume: 100 },
    "铁木真":   { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "王安石":   { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "文成公主": { voice_type: "longmiao", rate: 1.0, pitch: 1.0, volume: 100 },
    "项羽":     { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "耶律阿保机": { voice_type: "longfei", rate: 1.0, pitch: 0.95, volume: 100 },
    "嬴政":     { voice_type: "longfei", rate: 0.9, pitch: 0.95, volume: 100 },
    "岳飞":     { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "斩锋卒":   { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "张飞":     { voice_type: "longlaotie", rate: 1.0, pitch: 0.9, volume: 100 },
    "张居正":   { voice_type: "longfei", rate: 1.0, pitch: 1.0, volume: 100 },
    "张良":     { voice_type: "longcheng", rate: 1.0, pitch: 1.0, volume: 100 },
    "张骞":     { voice_type: "longfei", rate: 1.0, pitch: 0.95, volume: 100 },
    "赵云":     { voice_type: "longcheng", rate: 1.0, pitch: 1.0, volume: 100 },
    "朱翊钧":   { voice_type: "longcheng", rate: 1.0, pitch: 1.0, volume: 100 },
    "默认":     { voice_type: "longcheng", rate: 1, pitch: 1, volume: 100 }
};

// 更健壮的参数获取函数
function getTTSParams(character) {
    if (!character) return characterTTSParams["默认"];
    let name = character.trim().replace(/（.*?）|\(.*?\)/g, ""); // 去括号
    name = name.replace(/\s/g, ""); // 去空白
    if (characterTTSParams[name]) return characterTTSParams[name];
    // 尝试用 includes 匹配
    for (const key of Object.keys(characterTTSParams)) {
        if (name.includes(key) || key.includes(name)) {
            return characterTTSParams[key];
        }
    }
    return characterTTSParams["默认"];
}

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

// 新增参数 character，默认“默认”
export async function synthesizeSpeech(text, character = "默认") {
    return synthesizeSpeechStream(text, character);
}

// 流式语音合成
export async function synthesizeSpeechStream(text, character = "默认") {
    const playId = ++currentPlayId;
    try {
        text = stripBrackets(text);
        // 合并多余空行，只保留一行
        text = text.replace(/\n\s*\n+/g, '\n');
        // 去除首尾空白
        text = text.trim();
        setMusicVolume(0.5); // 语音播放前降低音量
        const apiKey = localStorage.getItem('qianwenApiKey');
        const ttsParams = getTTSParams(character);
        console.log('传入角色名:', JSON.stringify(character));
        console.log('可用角色名:', Object.keys(characterTTSParams));
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
            setMusicVolume(1);
            return;
        }

        // 复用或创建audio元素
        let audio = document.getElementById('tts-audio');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'tts-audio';
            audio.controls = true;
            document.body.appendChild(audio);
        } else {
            // 打断上一次播放
            audio.pause();
            audio.currentTime = 0;
            audio.src = '';
        }

        // 隐藏 audio 控件
        audio.controls = false;
        audio.style.display = 'none';

        const mediaSource = new MediaSource();
        audio.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', () => {
            const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
            const reader = response.body.getReader();
            let started = false;

            function feed() {
                // 如果不是本次播放，直接终止
                if (playId !== currentPlayId) return;
                reader.read().then(({ done, value }) => {
                    if (playId !== currentPlayId) return; // 再次判断
                    if (done) {
                        if (!sourceBuffer.updating) {
                            if (mediaSource.readyState === 'open') {
                                mediaSource.endOfStream();
                            }
                        } else {
                            sourceBuffer.addEventListener('updateend', () => {
                                if (mediaSource.readyState === 'open') {
                                    mediaSource.endOfStream();
                                }
                            }, { once: true });
                        }
                        setMusicVolume(1);
                        return;
                    }
                    if (!sourceBuffer.updating) {
                        sourceBuffer.appendBuffer(value);
                        if (!started) {
                            audio.play();
                            started = true;
                        }
                        feed();
                    } else {
                        sourceBuffer.addEventListener('updateend', () => {
                            if (playId !== currentPlayId) return; // 防止异步append
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
            setMusicVolume(1);
        };
    } catch (e) {
        setMusicVolume(1);
    }
}

// 自动播放逻辑
let autoPlayEnabled = false;

export function toggleAutoPlay() {
    autoPlayEnabled = !autoPlayEnabled;
    return autoPlayEnabled;
}

// 建议：自动播放也不设默认，强制传角色名
export function autoPlaySpeech(text, character) {
    if (autoPlayEnabled && character) {
        synthesizeSpeechStream(text, character);
    }
}
