// 添加选项卡切换功能
function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 移除所有活动状态
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // 设置当前选项卡为活动状态
    document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // 显示当前内容并触发动画
    const activeContent = document.getElementById(`${tabName}-tab`);
    activeContent.style.display = 'block';
    setTimeout(() => {
        activeContent.classList.add('active');
    }, 10);
}