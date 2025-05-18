export function initBackgroundVideo() {
    const video = document.getElementById('background-video');
    const body = document.body;
    
    if (!video) return;

    // 添加屏幕宽度检测（阈值设为768px，可根据需要调整）
    const isWideScreen = window.matchMedia('(min-width: 768px)').matches;
    if (isWideScreen) {
        video.pause();
        video.classList.remove('show');
        return; // 宽屏直接返回不初始化视频
    }

    video.autoplay = true;
    video.muted = true;
    video.loop = false;

    video.addEventListener('play', () => {
        body.classList.add('video-playing');
        body.classList.remove('video-ended');
        video.classList.add('show');
    });

    video.addEventListener('ended', () => {
        body.classList.remove('video-playing');
        body.classList.add('video-ended');
        video.classList.remove('show');
    });

    body.classList.add('video-playing');
    video.classList.add('show');

    document.addEventListener('dblclick', (e) => {
        if (video.paused && !isWideScreen) { // 添加宽屏条件判断
            video.currentTime = 0;
            video.play();
            body.classList.add('video-playing');
            body.classList.remove('video-ended');
            video.classList.add('show');
        }
    });
}
