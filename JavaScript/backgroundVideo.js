export function initBackgroundVideo() {
    const video = document.getElementById('background-video');
    const body = document.body;
    
    if (!video) return;

    const isWideScreen = window.matchMedia('(min-width: 768px)').matches;
    if (isWideScreen) {
        video.pause();
        video.classList.remove('show');
        return;
    }

    video.autoplay = true;
    video.muted = true;
    video.loop = false;

    // 封装交互监听，每次播放都重新绑定
    function addEndOnInteract() {
        const endVideoOnInteract = () => {
            if (!video.paused) {
                video.pause();
                video.currentTime = video.duration || 0;
                body.classList.remove('video-playing');
                body.classList.add('video-ended');
                video.classList.remove('show');
            }
            document.removeEventListener('click', endVideoOnInteract, true);
            document.removeEventListener('keydown', endVideoOnInteract, true);
            document.removeEventListener('touchstart', endVideoOnInteract, true);
        };
        // 先移除，防止重复绑定
        document.removeEventListener('click', endVideoOnInteract, true);
        document.removeEventListener('keydown', endVideoOnInteract, true);
        document.removeEventListener('touchstart', endVideoOnInteract, true);
        document.addEventListener('click', endVideoOnInteract, true);
        document.addEventListener('keydown', endVideoOnInteract, true);
        document.addEventListener('touchstart', endVideoOnInteract, true);
    }

    video.addEventListener('play', () => {
        body.classList.add('video-playing');
        body.classList.remove('video-ended');
        video.classList.add('show');
        addEndOnInteract(); // 每次播放都加一次交互监听
    });

    video.addEventListener('ended', () => {
        body.classList.remove('video-playing');
        body.classList.add('video-ended');
        video.classList.remove('show');
    });

    body.classList.add('video-playing');
    video.classList.add('show');

    // 初次播放时加一次
    addEndOnInteract();

    document.addEventListener('dblclick', (e) => {
        if (video.paused && !isWideScreen) {
            video.currentTime = 0;
            video.play();
            body.classList.add('video-playing');
            body.classList.remove('video-ended');
            video.classList.add('show');
            addEndOnInteract(); // 双击重新播放时也加一次
        }
    });
}
