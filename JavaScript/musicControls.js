export function initMusicControls(characterName) {
    const musicBtn = document.createElement('button');
    musicBtn.textContent = '🔊';
    musicBtn.id = 'music-toggle';
    musicBtn.style.cssText = `
        -webkit-user-select: none; /* Chrome/Safari */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE/Edge */
        user-select: none; /* 标准语法 */
        background: rgba(0, 123, 255, 0.7);
        color: white !important;
        padding: 8px 15px;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        width: auto;
        display: inline-block;
        position: fixed;
        top: 20px;
        right: 90px;
        z-index: 1000;
    `;

    const audio = new Audio();
    audio.src = `../../musics/${getMusicForCharacter(characterName)}.mp3`;
    audio.loop = true;
    
    // 修改这里：添加自动播放
    audio.play().catch(e => {
        console.log('自动播放被阻止:', e);
        musicBtn.textContent = '🔇';
    });
    
    musicBtn.onclick = () => {
        if (audio.paused) {
            audio.play();
            musicBtn.textContent = '🔊';
        } else {
            audio.pause();
            musicBtn.textContent = '🔇';
        }
    };
    document.body.appendChild(musicBtn);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑️';
    clearBtn.id = 'clear-history';
    clearBtn.style.cssText = `
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background: rgba(255, 0, 0, 0.7);
        color: white !important;
        padding: 8px 15px;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        width: auto;
        display: inline-block;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    `;
    clearBtn.onclick = (e) => {
        e.stopPropagation();
        
        // 创建确认弹窗
        const confirmDialog = document.createElement('div');
        confirmDialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 2000;
            width: 300px;
            text-align: center;
            opacity: 0;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.15);
        `;
        
        confirmDialog.innerHTML = `
            <h3 style="margin-top: 0; color: white;">确认清除聊天记录？</h3>
            <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
                <button id="cancel-clear" style="
                    padding: 8px 20px;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                ">取消</button>
                <button id="confirm-clear" style="
                    padding: 8px 20px;
                    background: #ff4444;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                ">确认</button>
            </div>
        `;
        
        document.body.appendChild(confirmDialog);
        
        // 添加动画效果
        setTimeout(() => {
            confirmDialog.style.opacity = '1';
            confirmDialog.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // 按钮悬停效果
        document.getElementById('confirm-clear').onmouseenter = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(255, 68, 68, 0.3)';
        };
        document.getElementById('confirm-clear').onmouseleave = function() {
            this.style.transform = 'none';
            this.style.boxShadow = 'none';
        };
        document.getElementById('cancel-clear').onmouseenter = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.2)';
        };
        document.getElementById('cancel-clear').onmouseleave = function() {
            this.style.transform = 'none';
            this.style.boxShadow = 'none';
        };
        
        // 确认按钮事件
        document.getElementById('confirm-clear').onclick = () => {
            localStorage.removeItem(`chatHistory_${characterName}`);
            document.getElementById('chat-container').innerHTML = '';
            document.body.removeChild(confirmDialog);
        };
        
        // 取消按钮事件
        document.getElementById('cancel-clear').onclick = () => {
            confirmDialog.style.opacity = '0';
            confirmDialog.style.transform = 'translate(-50%, -50%) scale(0.9)';
            setTimeout(() => {
                if (confirmDialog.parentNode) {
                    document.body.removeChild(confirmDialog);
                }
            }, 300);
        };
        
        // 点击弹窗外部关闭
        document.addEventListener('click', function handleOutsideClick(e) {
            if (!confirmDialog.contains(e.target) && e.target !== clearBtn) {
                confirmDialog.style.opacity = '0';
                confirmDialog.style.transform = 'translate(-50%, -50%) scale(0.9)';
                setTimeout(() => {
                    if (confirmDialog.parentNode) {
                        document.body.removeChild(confirmDialog);
                    }
                    document.removeEventListener('click', handleOutsideClick);
                }, 300);
            }
        });
    };
    document.body.appendChild(clearBtn);
}

function getMusicForCharacter(characterName) {
    const musicMap = {
        '霍去病': '华灯初上',
        '刘邦': '旧事',
        '项羽': '国破',
        '曹操': '旧事',
        '丘处机': '青衣',
        '孔子': '青衣',
        '张良': '青衣',
        '樊哙': '华灯初上',
        '赵云': '青衣',
        '松赞干布': '山风',
        '耶律阿保机': '永恒之地',
        '牛顿': '青衣',
        '孟德尔': '青衣',
        '文成公主': '花都',
        '斩锋卒': '永恒之地',
        '锦衣卫': '青衣'
    };
    return musicMap[characterName] || '永恒之地';
}
