document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('opening-audio');
    const textOverlay = document.getElementById('text-overlay');
    const video = document.getElementById('background-video');
    const imageContainer = document.getElementById('image-container');
    
    // 初始化状态
    textOverlay.style.opacity = '0';
    video.style.opacity = '0';
    imageContainer.style.opacity = '0';
    
    // 立即显示文字
    setTimeout(() => {
        textOverlay.style.opacity = '1';
        
        // 尝试播放音频
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('自动播放被阻止，需要用户交互');
            });
        }
        
        // 添加开场音频结束监听
        audio.addEventListener('ended', function() {
            const storyAudio = new Audio('media/情节1.mp3');
            storyAudio.play().catch(e => console.log('情节音频播放失败:', e));
        });
        
        // 12秒后隐藏文字（不影响视频逻辑）
        setTimeout(() => {
            textOverlay.style.opacity = '0';
        }, 12000);
        
        // 15秒后开始视频（保持原逻辑）
        setTimeout(() => {
            video.style.opacity = '1';
            video.play();
            
            // 确保亮度完全提升到100%
            setTimeout(() => {
                video.style.filter = 'brightness(1)';
            }, 100);
            
            // 视频播放完成后显示图片
            video.addEventListener('ended', function() {
                imageContainer.style.opacity = '1';
                video.style.opacity = '0';
            });
        }, 15000);
    }, 500);
});

// 在DOMContentLoaded事件开始时添加
document.fonts.load('1em TibetanFont').then(() => {
    console.log('藏文字体加载成功');
}).catch((e) => {
    console.error('藏文字体加载失败:', e);
});
