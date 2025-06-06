// 引入各种库，express是服务器，axios用来发请求，cors解决跨域，path处理路径，zlib解压缩，WebSocket搞TTS流式
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const zlib = require('zlib'); // 处理压缩数据
const WebSocket = require('ws'); // 用来搞DashScope流式TTS

const app = express();
app.use(cors());
app.use(express.json());

// 统一加CORS头，前端才不会报错
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// 健康检查接口，看看服务活着没
app.get('/health-check', (req, res) => {
    res.send('服务运行正常');
});

// 代理前端发来的消息请求，帮忙转发到大模型API
app.post('/sendMessage', async (req, res) => {
    const { apiProvider, apiKey, messageHistory } = req.body;
    try {
        let response;
        if (apiProvider === 'deepseek') {
            // deepseek的API，参数写死了，懒得动
            response = await axios.post("https://api.deepseek.com/v1/chat/completions", {
                model: "deepseek-chat",
                messages: messageHistory,
                temperature: 0.8,
                presence_penalty: 0.5,
                frequency_penalty: 0.5
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            });
        } else {
            // 千问的API，参数也差不多
            response = await axios.post("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
                model: "qwen-max",
                input: {
                    messages: messageHistory
                },
                parameters: {
                    temperature: 0.8,
                    top_p: 0.8
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            });
        }
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 代理欢迎消息，和上面差不多，就是内容不一样
app.post('/sendWelcomeMessage', async (req, res) => {
    const { apiProvider, apiKey, characterName, userName, userGender, userPersona } = req.body;
    try {
        let response;
        if (apiProvider === 'deepseek') {
            response = await axios.post("https://api.deepseek.com/v1/chat/completions", {
                model: "deepseek-chat",
                messages: [{
                    role: "system",
                    content: `作为${characterName}，用 1 - 2 句话向${userName || '访客'}(${userGender || 'unknown'})打招呼，结合用户人设"${userPersona || ''}"。包含动作描写（用括号标注，语言不要打引号），总字数 100 字左右。`
                }],
                temperature: 0.9
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            });
        } else {
            response = await axios.post("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
                model: "qwen-max",
                input: {
                    messages: [{
                        role: "system",
                        content: `作为${characterName}，用 1 - 2 句话向${userName || '访客'}(${userGender || 'unknown'})打招呼，结合用户人设"${userPersona || ''}"。包含动作描写（用括号标注，语言不要打引号），总字数 100 字左右。`
                    }]
                },
                parameters: {
                    temperature: 0.8,
                    top_p: 0.8
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            });
        }
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 代理获取预设回复，还是那一套
app.post('/getPresetResponse', async (req, res) => {
    const { apiProvider, apiKey, messageHistory, characterName } = req.body;
    try {
        let response;
        if (apiProvider === 'deepseek') {
            response = await axios.post("https://api.deepseek.com/v1/chat/completions", {
                model: "deepseek-chat",
                messages: [
                    ...messageHistory,
                    {
                        role: "user",
                        content: `请基于以上对话，生成 3 个适合我回复${characterName}的选项，每个选项不超过 80 字，动作神态描写用括号括起来，格式为：1.选项 1 2.选项 2 3.选项 3`
                    }
                ],
                temperature: 1
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            });
        } else {
            response = await axios.post("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
                model: "qwen-max",
                input: {
                    messages: [
                        ...messageHistory,
                        {
                            role: "user",
                            content: `请基于以上对话，生成 3 个适合我回复${characterName}的选项，每个选项不超过 80 字，动作神态描写用括号括起来，格式为：1.选项 1 2.选项 2 3.选项 3`
                        }
                    ]
                },
                parameters: {
                    temperature: 1,
                    top_p: 0.8
                }
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            });
        }
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 下面是语音合成相关的接口，阿里云和DashScope都支持，写得有点长
app.post('/api/speech/synthesize', async (req, res) => {
    try {
        const result = await axios.post('https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts', {
            text: req.body.content,
            voice: req.body.voice_type,
            format: 'mp3'
        }, {
            headers: {
                'Authorization': `Bearer ${req.headers.authorization.split(' ')[1]}`,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': result.headers['content-length'],
            'Cache-Control': 'no-cache'
        });
        res.send(result.data);
    } catch (error) {
        console.error('语音合成服务错误:', error);
        res.status(500).json({ error: '语音合成服务不可用' });
    }
});

// DashScope的TTS接口，支持流式，参数一堆
app.post('/synthesize-speech', async (req, res) => {
    console.log('收到语音合成请求', {
        headers: req.headers,
        body: { 
            text: req.body.text ? req.body.text.substring(0, 10) + '...' : '',
            voice_type: req.body.voice_type
        }
    });

    try {
        const url = 'https://dashscope.aliyuncs.com/api/v1/services/tts/text-to-speech';
        const text = typeof req.body.text === 'string' ? req.body.text.substring(0, 300) : '';
        const postData = {
            model: "cosyvoice-v1",
            input: { text },
            parameters: {
                voice: req.body.voice_type || 'zhitian_emo',
                sample_rate: 48000,
                format: 'mp3',
                text_type: "plain"
            }
        };
        console.log('DashScope请求体:', JSON.stringify(postData));
        const response = await axios.post(url, postData, {
            headers: {
                'Authorization': req.headers.authorization || '',
                'Content-Type': 'application/json',
                'X-DashScope-Async': 'enable',
                'X-DashScope-DataInspection': 'enable'
            },
            responseType: 'stream'
        });

        if (!response.headers['content-type']?.includes('audio/mpeg')) {
            throw new Error('无效的音频响应格式');
        }

        res.set({
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache',
            'X-Request-ID': response.headers['x-request-id'] || ''
        });

        response.data.on('error', (err) => {
            console.error('流数据错误:', err);
            res.status(500).end();
        });

        response.data.pipe(res);

    } catch (error) {
        // 下面是处理各种奇怪的错误和压缩响应，写得有点啰嗦
        if (
            error.response &&
            error.response.data &&
            typeof error.response.data.pipe === 'function'
        ) {
            const encoding = error.response.headers['content-encoding'];
            let rawData = [];
            if (encoding === 'gzip') {
                error.response.data
                    .pipe(zlib.createGunzip())
                    .on('data', (chunk) => rawData.push(chunk))
                    .on('end', () => {
                        try {
                            const resStr = Buffer.concat(rawData).toString('utf-8');
                            console.error('DashScope详细错误内容:', resStr);
                            res.status(500).json({ error: resStr });
                        } catch (e) {
                            console.error('解压DashScope错误内容失败:', e);
                            res.status(500).json({ error: 'DashScope错误内容解压失败' });
                        }
                    })
                    .on('error', (e) => {
                        console.error('解压DashScope响应流失败:', e);
                        res.status(500).json({ error: 'DashScope响应流解压失败' });
                    });
            } else {
                // 非gzip，直接收集数据
                error.response.data
                    .on('data', (chunk) => rawData.push(chunk))
                    .on('end', () => {
                        try {
                            const resStr = Buffer.concat(rawData).toString('utf-8');
                            console.error('DashScope详细错误内容:', resStr);
                            res.status(500).json({ error: resStr });
                        } catch (e) {
                            console.error('读取DashScope错误内容失败:', e);
                            res.status(500).json({ error: 'DashScope错误内容读取失败' });
                        }
                    })
                    .on('error', (e) => {
                        console.error('读取DashScope响应流失败:', e);
                        res.status(500).json({ error: 'DashScope响应流读取失败' });
                    });
            }
            return; // 避免后续重复响应
        } else if (
            error.response &&
            error.response.data &&
            typeof error.response.data.pipe !== 'function'
        ) {
            // 解析错误内容
            let errMsg = '';
            try {
                errMsg = typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data);
            } catch {}
            if (errMsg.includes('task can not be null')) {
                console.error('你的 DashScope key 没有 TTS 权限，请在控制台新建带语音合成权限的 key');
            }
        }
        // 普通错误处理
        console.error('语音合成失败详情:', {
            errorCode: error.code,
            config: {
                url: error.config?.url,
                method: error.config?.method
            },
            stack: error.stack,
            dashscopeResponse: error.response?.data
        });

        res.status(500).json({
            error: error.response?.data?.message || '语音合成服务连接失败'
        });
    }
});

// 阿里云TTS合成接口，参数写死了，记得换成你自己的key和token
app.post('/ali-tts', async (req, res) => {
    try {
        const result = await axios.post(
            'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/tts',
            {
                appkey: '你的AppKey',
                token: '你的Token',   
                text: req.body.text,
                format: 'mp3',
                voice: req.body.voice_type || 'aiqing',
                sample_rate: 16000
            },
            {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'arraybuffer'
            }
        );
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': result.headers['content-length'],
            'Cache-Control': 'no-cache'
        });
        res.send(result.data);
    } catch (error) {
        console.error('阿里云TTS错误:', error);
        res.status(500).json({ error: '阿里云TTS服务不可用' });
    }
});

// 静态文件服务，前端页面啥的都靠它
app.use(express.static(path.join(__dirname)));

// 启动服务器，默认3000端口，启动后会有提示
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`服务器已启动，监听端口 ${port}`);
    console.log(`尝试访问：http://localhost:${port}/synthesize-speech`);
});

// DashScope WebSocket流式TTS接口，写得有点复杂，主要是为了支持流式语音
app.post('/ws-tts', async (req, res) => {
    const DASHSCOPE_WS_URL = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
    const apiKey = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
    const text = typeof req.body.text === 'string' ? req.body.text.substring(0, 300) : '';
    const voice = req.body.voice_type || 'longcheng';
    const rate = req.body.rate || 1;
    const pitch = req.body.pitch || 1;
    const volume = req.body.volume || 50;
    // 打印收到的参数，方便调试
    console.log('收到TTS参数:', {
        text,
        voice_type: req.body.voice_type,
        rate,
        pitch,
        volume
    });
    const taskId = `task-${Date.now()}`;
    let closed = false;

    if (!apiKey) return res.status(400).json({ error: '缺少 DashScope API Key' });
    if (!text) return res.status(400).json({ error: '缺少文本内容' });

    res.set({
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
    });

    let ws;
    try {
        ws = new WebSocket(DASHSCOPE_WS_URL, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
    } catch (err) {
        console.error('WebSocket 连接失败:', err);
        if (!res.headersSent) res.status(500).json({ error: 'WebSocket 连接失败' });
        return;
    }

    const TIMEOUT_MS = 25000;
    const timeout = setTimeout(() => {
        if (!closed && !res.headersSent) {
            closed = true;
            res.status(504).json({ error: 'TTS服务超时，请稍后重试' });
            if (ws && ws.readyState === WebSocket.OPEN) ws.close();
        }
    }, TIMEOUT_MS);

    ws.on('open', () => {
        // 连接上了，发参数过去
        console.log('发送给DashScope的参数:', {
            voice,
            rate,
            pitch,
            volume
        });
        ws.send(JSON.stringify({
            header: {
                action: 'run-task',
                task_id: taskId,
                streaming: 'duplex'
            },
            payload: {
                task_group: 'audio',
                task: 'tts',
                function: 'SpeechSynthesizer',
                model: "cosyvoice-v1",
                parameters: {
                    text_type: 'plain',
                    voice: voice,
                    format: 'mp3',
                    sample_rate: 48000,
                    rate: rate,
                    pitch: pitch,
                    volume: volume
                },
                input: {}
            }
        }));
    });

    ws.on('message', (data, isBinary) => {
        if (closed) return;
        if (isBinary) {
            if (!closed) res.write(data);
        } else {
            const message = JSON.parse(data);
            console.log('WS收到文本消息:', message);

            if (message.header.event === 'task-started') {
                ws.send(JSON.stringify({
                    header: {
                        action: 'continue-task',
                        task_id: taskId,
                        streaming: 'duplex'
                    },
                    payload: {
                        input: { text }
                    }
                }));
            } else if (message.header.event === 'task-finished') {
                if (!closed && !res.headersSent) {
                    res.end();
                    closed = true;
                }
            } else if (message.header.event === 'task-failed') {
                console.error('TTS任务失败:', message.header.error_message); // 新增日志
                if (!closed && !res.headersSent) {
                    res.status(500).json({ error: message.header.error_message });
                    closed = true;
                }
            }
        }
    });

    ws.on('close', () => {
        clearTimeout(timeout);
        if (!closed) {
            closed = true;
            res.end();
        }
    });

    ws.on('error', (err) => {
        clearTimeout(timeout);
        console.error('DashScope WebSocket TTS 错误:', err);
        if (!closed) {
            closed = true;
            if (!res.headersSent) res.status(500).end();
            else res.end();
        }
    });

    req.on('close', () => {
        if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    });
});