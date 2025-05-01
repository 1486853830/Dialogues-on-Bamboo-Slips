// 修改流星创建频率为0.5-1.5秒
setInterval(createMeteor, Math.random() * 800 + 400);

// 同时增加每次创建的流星数量
function createMeteor() {
    // 随机创建1-3颗流星
    const count = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const meteor = document.createElement('div');
            meteor.className = 'meteor';

            // 随机位置和角度
            const startX = Math.random() * window.innerWidth;
            const startY = -10;
            const angle = Math.random() * 30 + 15;

            meteor.style.left = startX + 'px';
            meteor.style.top = startY + 'px';

            document.body.appendChild(meteor);

            // 动画参数
            const duration = Math.random() * 1500 + 500; // 0.5-2秒
            const distance = Math.random() * 300 + 200;

            // 动画
            const animation = meteor.animate([
                { opacity: 0.8, transform: `translate(0, 0)` },
                { opacity: 0, transform: `translate(${Math.cos(angle * Math.PI / 180) * distance}px, ${Math.sin(angle * Math.PI / 180) * distance}px)` }
            ], {
                duration: duration,
                easing: 'linear'
            });

            animation.onfinish = () => meteor.remove();
        }, i * 200); // 每颗流星间隔200ms
    }
}