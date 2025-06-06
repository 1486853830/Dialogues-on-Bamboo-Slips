# 青简问对

## 项目简介

**青简问对**是一个沉浸式历史人物对话体验平台。用户可以与三十余位历史人物（如霍去病、曹操、孔子等）进行多轮对话，体验不同角色的语言风格、思维方式和历史背景。项目集成了AI对话、语音合成、角色扮演等多种功能，支持多角色切换和丰富的互动体验，适用于历史教育、兴趣交流、AI体验等多种场景。

## 主要功能

- **多角色扮演**：支持与三十余位历史人物对话，每位角色有独特的语言风格和人设，支持随时切换。

  ```js
  // filepath: JavaScript/main.js
  if (path.includes('huoqubing')) {
      const huoqubing = new HuoQubing();
      huoqubing.init();
      window.currentCharacter = huoqubing;
  }
  ```

- **AI智能对话**：集成DeepSeek、通义千问等大模型API，实现自然流畅的多轮对话，支持上下文记忆。

  ```js
  // filepath: JavaScript/apiRequest.js
  export async function sendMessage(API_KEY, messageHistory, userInput, isRephrase, chatContainer, handleRephrase, callback) {
      // ...AI对话请求与回调...
  }
  ```

- **语音合成**：为每个角色定制专属语音参数，支持阿里云TTS等服务，提升沉浸感和趣味性。

  ```js
  // filepath: JavaScript/speechSynthesis.js
  export async function synthesizeSpeech(text, character = "默认") {
      // ...语音合成逻辑...
  }
  ```

- **历史对话记录**：自动保存每个角色的对话历史，支持断点续聊和历史回溯。

  ```js
  // filepath: JavaScript/baseCharacter.js
  loadHistory() {
      const savedHistory = localStorage.getItem(`chatHistory_${this.name}`);
      // ...历史记录加载与恢复...
  }
  ```

- **界面自适应**：支持半屏/全屏切换，适配PC、平板、手机等多种终端。

  ```js
  // filepath: JavaScript/messageHandler.js
  const halfScreen = localStorage.getItem('halfScreen') === 'true';
  if (halfScreen) {
      chatContainer.style.position = 'fixed';
      chatContainer.style.height = '50vh';
      // ...
  }
  ```

- **丰富的交互体验**：支持对AI回复的重述、预设选项、背景音乐、视频等多模态互动。

  ```js
  // filepath: JavaScript/messageHandler.js
  export function addRephraseButton(messageContainer, handleRephrase) { /* ... */ }

  // filepath: JavaScript/musicControls.js
  export function initMusicControls(characterName) { /* ... */ }

  // filepath: JavaScript/eventListeners.js
  export function createPresetButtons(pullUpMenu, options) { /* ... */ }
  ```

- **自定义用户人设**：用户可自定义昵称、性别、人物设定，提升个性化体验。
- **多语言/多模态扩展**：支持后续扩展多语言、多模态输入输出。

## 文件结构

```
├─ JavaScript/                # 前端主要JS代码
│  ├─ main.js                 # 入口逻辑，角色切换
│  ├─ baseCharacter.js        # 角色基类，通用行为
│  ├─ speechSynthesis.js      # 语音合成与TTS参数
│  ├─ messageHandler.js       # 消息展示、按钮与交互
│  ├─ apiRequest.js           # 与后端/AI接口交互
│  ├─ eventListeners.js       # 事件绑定与UI逻辑
│  └─ ...                     # 其它功能模块
├─ characters/                # 各历史人物角色定义
│  ├─ 霍去病/huoqubing.js
│  ├─ 曹操/caocao.js
│  └─ ...                     # 其它角色
├─ assets/                    # 静态资源（图片、音频、视频等）
├─ Technical-documentation/   # 技术文档与开发说明
├─ README.md                  # 项目说明
└─ ...                        # 其它资源与文档
```

## 快速开始

1. **克隆本项目到本地**
2. **配置API密钥**  
   - 在浏览器`localStorage`中设置`apiKey`（DeepSeek/通义千问等）和`ttsKey`（阿里云语音等）
   - 也可在代码中直接配置（如测试环境）
3. **启动本地后端服务**（如有，详见Technical-documentation）
4. **用浏览器打开`index.html`**，选择角色即可体验沉浸式对话

## 主要依赖

- DeepSeek/通义千问等大模型API（AI对话）
- 阿里云语音合成TTS（角色语音）
- 原生JavaScript/ES6，无需第三方前端框架
- 可选：Node.js本地后端（如需自定义API代理）

## 角色扩展说明

- 在`characters/`目录下新增角色文件（如`李白/libai.js`），继承`BaseCharacter`并自定义人设、语音参数、风格等。
- 在`main.js`中引入新角色，并注册到角色切换逻辑中。
- 可为新角色配置专属TTS参数，实现个性化语音合成。

## 技术文档与开发说明

- `Technical-documentation/`目录下包含详细的开发计划、API对接说明、角色提示词工程、语音合成集成方案等文档。
- 推荐开发者先阅读相关文档，了解整体架构与扩展方式。

## 常见问题

- **Q：为什么语音合成声音相似？**  
  A：可在`speechSynthesis.js`中为每个角色分配不同的`voice_type`和参数，提升区分度。
- **Q：如何保存和恢复历史对话？**  
  A：项目自动将每个角色的对话历史保存在`localStorage`，切换角色时自动恢复。
- **Q：如何自定义用户人设？**  
  A：可在界面或`localStorage`中设置`userName`、`userGender`、`userPersona`等字段。

## 联系与贡献

如有建议、Bug反馈或希望参与开发，请联系项目维护者，或提交Issue/PR。

---

> 本项目仅供学习与交流，严禁用于商业用途。