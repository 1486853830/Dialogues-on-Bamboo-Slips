const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
