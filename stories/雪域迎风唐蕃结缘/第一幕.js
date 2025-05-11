document.addEventListener('DOMContentLoaded', function () {
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

        // 音频结束后跳转页面并渐隐文字
        audio.addEventListener('ended', function() {
            textOverlay.style.opacity = '0';
            setTimeout(() => {
                window.location.href = 'songzanganbu.html';
            }, 1000); // 给渐隐动画1秒时间
        });

        // 移除原来的12秒后隐藏文字的定时器
        setTimeout(() => {
            textOverlay.style.opacity = '0';
        }, 12000);

        // 15秒后开始视频
        setTimeout(() => {
            video.style.opacity = '1';
            video.play();

            // 亮度提升到70%
            setTimeout(() => {
                video.style.filter = 'brightness(0.7)';  // 改为70%亮度
            }, 100);

            // 显示任务提示
            document.getElementById('mission-overlay').style.opacity = '1';

            // 确保亮度完全提升到100%
            setTimeout(() => {
                video.style.filter = 'brightness(1)';
            }, 100);

            // 视频播放完成后隐藏任务提示
            video.addEventListener('ended', function () {
                document.getElementById('mission-overlay').style.opacity = '0';
                imageContainer.style.opacity = '1';
                video.style.opacity = '0';
            });
        }, 16000);
    }, 500);
});