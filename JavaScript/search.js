document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('character-search');
    const searchButton = document.getElementById('search-button');
    const storyCards = document.querySelectorAll('.story-card'); // 更新选择器
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        storyCards.forEach(card => {
            const title = card.querySelector('.story-title').textContent.toLowerCase(); // 更新标题选择器
            const desc = card.querySelector('.story-desc').textContent.toLowerCase(); // 更新描述选择器
            
            if (title.includes(searchTerm) || desc.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'highlight 0.5s ease';
                setTimeout(() => card.style.animation = '', 500);
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 保持原有事件绑定不变
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes highlight {
        0% { transform: scale(1); box-shadow: none; }
        50% { transform: scale(1.05); box-shadow: 0 0 15px rgba(255, 255, 255, 0.7); }
        100% { transform: scale(1); box-shadow: none; }
    }
`;
document.head.appendChild(style);
