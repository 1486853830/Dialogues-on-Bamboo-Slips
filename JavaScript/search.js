// 智能体搜索功能实现
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('character-search');
    const searchButton = document.getElementById('search-button');
    const agentCards = document.querySelectorAll('.agent-card');
    
    // 搜索功能
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        agentCards.forEach(card => {
            const name = card.querySelector('.agent-name').textContent.toLowerCase();
            const desc = card.querySelector('.agent-desc').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || desc.includes(searchTerm)) {
                card.style.display = 'block';
                // 添加高亮动画效果
                card.style.animation = 'highlight 0.5s ease';
                setTimeout(() => card.style.animation = '', 500);
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // 绑定搜索按钮点击事件
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    // 绑定输入框回车事件
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

// 添加高亮动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes highlight {
        0% { transform: scale(1); box-shadow: none; }
        50% { transform: scale(1.05); box-shadow: 0 0 15px rgba(255, 255, 255, 0.7); }
        100% { transform: scale(1); box-shadow: none; }
    }
`;
document.head.appendChild(style);
