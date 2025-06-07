// 优化流星创建逻辑，使用更合理的时间间隔和数量分布
setInterval(createMeteor, Math.random() * 1000 + 500); // 0.5-1.5秒随机间隔

function createMeteor() {
    // 每次生成1-3颗流星，避免数量过多
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
        // 为每颗流星添加微小的生成延迟，避免重叠
        setTimeout(() => {
            const meteor = document.createElement('div');
            meteor.className = 'meteor';
            
            // 随机起始位置，从屏幕顶部不同位置开始
            const startX = Math.random() * window.innerWidth;
            const startY = -10;
            
            // 角度调整为15-45度之间，使流星轨迹更自然
            const angle = Math.random() * 30 + 15;
            
            // 应用起始位置样式
            meteor.style.left = `${startX}px`;
            meteor.style.top = `${startY}px`;
            
            // 流星大小随机化，增强视觉多样性
            const size = Math.random() * 3 + 1;
            meteor.style.width = `${size}px`;
            meteor.style.height = `${size * 5}px`; // 流星通常是细长的
            
            document.body.appendChild(meteor);
            
            // 动画持续时间随机化，范围0.8-2.3秒
            const duration = Math.random() * 1500 + 800;
            
            // 流星移动距离随机化
            const distance = Math.random() * 300 + 200;
            
            // 使用CSS动画实现流星滑落效果
            const animation = meteor.animate([
                { opacity: 0.8, transform: `translate(0, 0) rotate(${angle}deg)` },
                { opacity: 0, transform: `translate(${Math.cos(angle * Math.PI / 180) * distance}px, ${Math.sin(angle * Math.PI / 180) * distance}px) rotate(${angle}deg)` }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)' // 使用更自然的缓动函数
            });
            
            // 动画结束后自动移除DOM元素
            animation.onfinish = () => meteor.remove();
        }, i * 200); // 流星之间的间隔时间
    }
}

// 添加窗口大小变化时的响应式处理
window.addEventListener('resize', () => {
    // 可以在这里添加窗口大小变化时的调整逻辑
});    