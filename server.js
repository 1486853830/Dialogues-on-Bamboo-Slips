const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors()); // 允许所有跨域请求
app.use(express.json());

// 设置 CORS 头，允许前端跨域访问
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// 代理发送消息请求
app.post('/sendMessage', async (req, res) => {
    const { apiProvider, apiKey, messageHistory } = req.body;
    try {
        let response;
        if (apiProvider === 'deepseek') {
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

// 代理发送欢迎消息请求
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

// 代理获取预设回复请求
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

// 在现有代码中添加以下内容（通常在中间件部分）
const path = require('path');
app.use(express.static(path.join(__dirname)));  // 新增静态文件服务

app.post('/api/speech/synthesize', async (req, res) => {
    try {
        // 调用真实的语音合成API（示例使用阿里云语音合成）
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

        // 设置正确的响应头
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

// 在express.static之前添加健康检查路由
// 调整路由顺序（将健康检查路由移动到最前面）
app.get('/health-check', (req, res) => {
    res.send('服务运行正常');
});

// 静态文件服务放在路由之后
app.use(express.static(path.join(__dirname)));

// 在现有路由之后添加语音合成路由
// 修改/synthesize-speech路由处理
app.post('/synthesize-speech', async (req, res) => {
    try {
        const response = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/tts/1shot-tts', {
            model: "tts-1",
            input: {
                text: req.body.text
            },
            parameters: {  // 修正参数层级
                voice: req.body.voice_type || 'zhitian_emo',
                format: 'mp3',
                sample_rate: 48000
            }
        }, {
            headers: {
                'Authorization': `Bearer ${req.headers.authorization.split(' ')[1]}`,
                'Content-Type': 'application/json',
                'X-DashScope-Async': 'enable'
            },
            responseType: 'arraybuffer'
        });

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': response.headers['content-length']
        });
        res.send(response.data);
    } catch (error) {
        // 增强错误日志
        console.error('阿里云API错误详情:', 
            error.response?.status,
            error.response?.statusText,
            Buffer.from(error.response?.data).toString('utf-8')
        );
        
        res.status(500).json({
            error: error.response?.data?.message || '语音合成服务内部错误'
        });
    }
});

// 在文件顶部添加端口定义
const port = process.env.PORT || 3000;

// 在文件底部修改监听部分
app.listen(port, () => {
    console.log(`服务器已启动，监听端口 ${port}`);
    console.log(`尝试访问：http://localhost:${port}/synthesize-speech`);
});
