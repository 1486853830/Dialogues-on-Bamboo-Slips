// 增强设置功能
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        // 加载保存的设置
        const savedApiKey = localStorage.getItem('apiKey');
        if (savedApiKey) {
            document.getElementById('apiKey').value = savedApiKey;
        }
    }
}

function saveSettings() {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) {
        alert('请输入有效的API密钥');
        return;
    }

    localStorage.setItem('apiKey', apiKey);
    alert('设置已保存成功');
    toggleSettings();
}

// 点击弹窗外部关闭
document.getElementById('settingsModal').addEventListener('click', function (e) {
    if (e.target === this) {
        toggleSettings();
    }
});

// 更新管理聊天记录函数
function manageChatHistory() {
    // 创建管理弹窗
    const manageModal = document.createElement('div');
    manageModal.style.position = 'fixed';
    manageModal.style.top = '0';
    manageModal.style.left = '0';
    manageModal.style.width = '100%';
    manageModal.style.height = '100%';
    manageModal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    manageModal.style.display = 'flex';
    manageModal.style.justifyContent = 'center';
    manageModal.style.alignItems = 'center';
    manageModal.style.zIndex = '2000';

    // 弹窗内容
    const modalContent = document.createElement('div');
    modalContent.style.background = 'rgba(0,0,0,0.4)';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '16px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '500px';

    // 标题
    const title = document.createElement('h2');
    title.textContent = '管理聊天记录';
    title.style.color = 'white';
    title.style.textAlign = 'center';
    title.style.marginTop = '0';

    // 角色列表
    const characters = ['孔子', '霍去病', '刘邦', '赵云', '丘处机', '樊哙', '曹操', '张良', '项羽'];
    const list = document.createElement('div');

    characters.forEach(character => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.margin = '15px 0';

        const name = document.createElement('span');
        name.textContent = character;
        name.style.color = 'white';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.style.padding = '8px 16px';
        deleteBtn.style.background = 'rgba(255,0,0,0.5)';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '8px';
        deleteBtn.style.cursor = 'pointer';

        deleteBtn.onclick = function () {
            if (confirm(`确定要删除${character}的聊天记录吗？`)) {
                localStorage.removeItem(`chatHistory_${character}`);
                alert(`${character}的聊天记录已删除！`);
                item.remove();
            }
        };

        item.appendChild(name);
        item.appendChild(deleteBtn);
        list.appendChild(item);
    });

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.display = 'block';
    closeBtn.style.margin = '20px auto 0';
    closeBtn.style.padding = '10px 20px';
    closeBtn.style.background = 'rgba(255,255,255,0.1)';
    closeBtn.style.color = 'white';
    closeBtn.style.border = '1px solid rgba(255,255,255,0.2)';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.cursor = 'pointer';

    closeBtn.onclick = function () {
        document.body.removeChild(manageModal);
    };

    // 组装元素
    modalContent.appendChild(title);
    modalContent.appendChild(list);
    modalContent.appendChild(closeBtn);
    manageModal.appendChild(modalContent);
    document.body.appendChild(manageModal);
}