// 增强设置功能
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        
        // 加载保存的API选择
        const savedApiProvider = localStorage.getItem('apiProvider') || 'deepseek';
        document.getElementById('apiProvider').value = savedApiProvider;
        toggleApiInputs();
        
        // 加载保存的API密钥
        if (savedApiProvider === 'deepseek') {
            const savedApiKey = localStorage.getItem('apiKey');
            if (savedApiKey) document.getElementById('apiKey').value = savedApiKey;
        } else if (savedApiProvider === 'qianwen') {
            const savedQianwenApiKey = localStorage.getItem('qianwenApiKey');
            if (savedQianwenApiKey) document.getElementById('qianwenApiKey').value = savedQianwenApiKey;
        } else if (savedApiProvider === 'moliark') {
            const savedMoliarkApiKey = localStorage.getItem('moliarkApiKey');
            if (savedMoliarkApiKey) document.getElementById('moliarkApiKey').value = savedMoliarkApiKey;
        }
        // 加载保存的音乐设置
        const savedBgm = localStorage.getItem('bgm');
        if (savedBgm) {
            document.getElementById('bgm-select').value = savedBgm;
        }
        
        // 加载用户信息
        const userName = localStorage.getItem('userName');
        const userGender = localStorage.getItem('userGender');
        const userPersona = localStorage.getItem('userPersona');
        
        if (userName) document.getElementById('user-name').value = userName;
        if (userGender) document.getElementById('user-gender').value = userGender;
        if (userPersona) document.getElementById('user-persona').value = userPersona;
        
        // 添加半屏显示开关到背景音乐设置组下方
        const halfScreen = localStorage.getItem('halfScreen');
        if (!document.getElementById('halfScreen-toggle')) {
            const container = document.createElement('div');
            container.style.margin = '10px 0';
            
            const label = document.createElement('label');
            label.textContent = '半屏显示对话内容: ';
            label.style.color = 'white';
            label.style.marginRight = '10px';
            
            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.id = 'halfScreen-toggle';
            toggle.style.width = '20px';
            toggle.style.height = '20px';
            toggle.checked = halfScreen === 'true';
            
            container.appendChild(label);
            container.appendChild(toggle);
            modal.querySelector('.settings-group').appendChild(container);
        }
    }
}

// 添加音乐控制变量
// 修改音乐控制变量为全局变量
let bgmPlayer = null;
let isBgmPlaying = false;

// 初始化音乐控制
function initBgmControl() {
    if (!bgmPlayer) {
        bgmPlayer = new Audio();
    }
    
    const bgmToggle = document.getElementById('bgm-toggle');
    const savedBgm = localStorage.getItem('bgm');
    
    if (savedBgm) {
        document.getElementById('bgm-select').value = savedBgm;
        bgmPlayer.src = savedBgm;
    }
    
    bgmToggle.addEventListener('click', function() {
        if (isBgmPlaying) {
            bgmPlayer.pause();
            this.textContent = '播放';
            isBgmPlaying = false;
        } else {
            const bgmSelect = document.getElementById('bgm-select');
            bgmPlayer.src = bgmSelect.value;
            bgmPlayer.loop = true;
            bgmPlayer.play();
            this.textContent = '暂停';
            isBgmPlaying = true;
            localStorage.setItem('bgm', bgmSelect.value);
        }
    });

    document.getElementById('bgm-select').addEventListener('change', function() {
        if (isBgmPlaying) {
            bgmPlayer.src = this.value;
            bgmPlayer.loop = true; // 确保循环播放
            bgmPlayer.play();
            localStorage.setItem('bgm', this.value);
        }
    });
}

// 修改DOMContentLoaded事件
window.addEventListener('DOMContentLoaded', function() {
    initBgmControl();
    
    // 如果有保存的音乐设置，自动播放
    if (localStorage.getItem('bgm')) {
        bgmPlayer.play();
        document.getElementById('bgm-toggle').textContent = '暂停';
        isBgmPlaying = true;
    }
});

// 修改saveSettings函数
function saveSettings() {
    // 保存API选择
    const apiProvider = document.getElementById('apiProvider').value;
    localStorage.setItem('apiProvider', apiProvider);

    // 根据选择的API保存对应的密钥
    if (apiProvider === 'deepseek') {
        const apiKey = document.getElementById('apiKey').value.trim();
        if (!apiKey) {
            alert('请输入有效的DeepSeek API密钥');
            return;
        }
        localStorage.setItem('apiKey', apiKey);
    } else if (apiProvider === 'qianwen') {
        const qianwenApiKey = document.getElementById('qianwenApiKey').value.trim();
        if (!qianwenApiKey) {
            alert('请输入有效的通义千问API密钥');
            return;
        }
        localStorage.setItem('qianwenApiKey', qianwenApiKey);
    } else if (apiProvider === 'moliark') {
        const moliarkApiKey = document.getElementById('moliarkApiKey').value.trim();
        if (!moliarkApiKey) {
            alert('请输入有效的模力方舟API密钥');
            return;
        }
        localStorage.setItem('moliarkApiKey', moliarkApiKey);
    }
    alert('设置已保存成功');
    toggleSettings();

    // 保存音乐设置
    const bgmSelect = document.getElementById('bgm-select');
    localStorage.setItem('bgm', bgmSelect.value);

    // 保存用户信息
    localStorage.setItem('userName', document.getElementById('user-name').value.trim());
    localStorage.setItem('userGender', document.getElementById('user-gender').value);
    localStorage.setItem('userPersona', document.getElementById('user-persona').value.trim());

    // 保存半屏显示设置
    const halfScreenToggle = document.getElementById('halfScreen-toggle');
    if (halfScreenToggle) {
        localStorage.setItem('halfScreen', halfScreenToggle.checked);
    }

    // 保存设置时加上
    if (document.getElementById('apiProvider').value === 'moliark') {
        localStorage.setItem('moliarkModel', document.getElementById('moliarkModel').value);
    }
}

// 点击弹窗外部关闭
document.getElementById('settingsModal').addEventListener('click', function (e) {
    if (e.target === this) {
        toggleSettings();
    }
});


function toggleApiInputs() {
    const provider = document.getElementById('apiProvider').value;
    document.getElementById('deepseekApiItem').style.display = provider === 'deepseek' ? '' : 'none';
    document.getElementById('qianwenApiItem').style.display = provider === 'qianwen' ? '' : 'none';
    document.getElementById('moliarkApiItem').style.display = provider === 'moliark' ? '' : 'none';
    document.getElementById('moliarkModelItem').style.display = provider === 'moliark' ? '' : 'none';
}

// 初始化时调用一次
document.addEventListener('DOMContentLoaded', function() {
    toggleApiInputs();
});
