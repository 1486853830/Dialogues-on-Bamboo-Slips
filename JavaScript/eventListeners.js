export function initEventListeners(sendMessage, getPresetResponse, createPresetButtons) {
    // 添加语音控制开关
    const voiceToggle = document.getElementById('voice-toggle');
    if (voiceToggle) {
        voiceToggle.addEventListener('click', () => {
            const enabled = localStorage.getItem('voiceEnabled') !== 'true';
            localStorage.setItem('voiceEnabled', enabled);
            voiceToggle.textContent = enabled ? '🔊 关闭语音' : '🔈 开启语音';
        });
    }

    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(false);
        }
    });

    document.getElementById('send-button').addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage(false);
    });

    const menuToggle = document.getElementById('menu-toggle');
    const pullUpMenu = document.getElementById('pull-up-menu');
    let lastClickTime = 0;

    menuToggle.addEventListener('click', async (e) => {
        e.stopPropagation();

        const now = Date.now();
        if (now - lastClickTime < 300) {
            pullUpMenu.style.display = 'none';
            lastClickTime = 0;
            return;
        }
        lastClickTime = now;

        if (pullUpMenu.style.display === 'block') {
            pullUpMenu.style.display = 'none';
            return;
        }

        pullUpMenu.innerHTML = `
            <div style="display:flex; justify-content:center; padding:15px;">
                <div class="loading-spinner"></div>
            </div>
        `;
        pullUpMenu.style.display = 'block';
        pullUpMenu.style.maxHeight = 'none';
        pullUpMenu.style.height = 'auto';

        const options = await getPresetResponse();
        createPresetButtons(pullUpMenu, options);
    });

    document.addEventListener('click', (e) => {
        if (!pullUpMenu.contains(e.target) && e.target !== menuToggle) {
            pullUpMenu.style.display = 'none';
        }
    });

    menuToggle.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        pullUpMenu.style.display = 'none';
    });
}

export function createPresetButtons(pullUpMenu, options) {
    pullUpMenu.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 12px;
            height: auto;
        ">
            ${options.map(opt => `
                <button class="preset-btn" data-text="${opt}" 
                    style="
                        width: 100%;
                        padding: 10px 15px;
                        border-radius: 8px;
                        background: rgba(0,123,255,0.1);
                        border: 1px solid rgba(0,123,255,0.2);
                        color: #333;
                        font-size: 14px;
                        text-align: left;
                        transition: all 0.2s;
                    ">
                    ${opt}
                </button>
            `).join('')}
        </div>
    `;

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('user-input').value = btn.dataset.text;
            pullUpMenu.style.display = 'none';
        });

        btn.addEventListener('mouseenter', function () {
            this.style.background = 'rgba(0,123,255,0.2)';
            this.style.transform = 'translateY(-2px)';
        });

        btn.addEventListener('mouseleave', function () {
            this.style.background = 'rgba(0,123,255,0.1)';
            this.style.transform = 'none';
        });
    });
}
