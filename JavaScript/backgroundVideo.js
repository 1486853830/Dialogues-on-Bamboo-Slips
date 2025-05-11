export function initBackgroundVideo() {
    const video = document.getElementById('background-video');
    const body = document.body;

    if (!video) return;

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
        if (video.paused) {
            video.currentTime = 0;
            video.play();
            body.classList.add('video-playing');
            body.classList.remove('video-ended');
            video.classList.add('show');
        }
    });
}
