 // 背景音乐控制
 window.bgm = new Audio();
 window.bgmEnabled = true; // 默认开启音乐
 window.bgm.volume = 0.5; // 设置音量

 // 自动扫描musics文件夹
 function scanMusicFiles() {
     const musicFiles = [
         { name: "不夜城", path: "../musics/不夜城.mp3" },
         // { name: "蝶飞花舞", path: "musics/蝶飞花舞.mp3" },
         // { name: "明镜菩提", path: "musics/明镜菩提.mp3" },
         // { name: "纵横天下", path: "musics/纵横天下.mp3" }
     ];

     const select = document.getElementById('bgm-select');
     musicFiles.forEach(music => {
         const option = document.createElement('option');
         option.value = music.path;
         option.textContent = music.name;
         select.appendChild(option);
     });

     // 默认选择不夜城
     select.value = "musics/不夜城.mp3";
     bgm.src = "musics/不夜城.mp3";
     localStorage.setItem('bgmPath', "../musics/不夜城.mp3");
     localStorage.setItem('bgmEnabled', 'true');
 }

 // 尝试自动播放音乐
 function tryAutoPlay() {
     if (bgmEnabled && bgm.src) {
         const playPromise = bgm.play();

         if (playPromise !== undefined) {
             playPromise.catch(error => {
                 console.log('自动播放被阻止:', error);
                 // 如果自动播放失败，添加点击事件监听
                 document.body.addEventListener('click', function handleFirstClick() {
                     bgm.play().catch(e => console.log('播放被阻止:', e));
                     document.body.removeEventListener('click', handleFirstClick);
                 }, { once: true });
             });
         }
     }
 }

 // 修改后的DOMContentLoaded事件监听
 document.addEventListener('DOMContentLoaded', () => {
     scanMusicFiles();
     document.getElementById('bgm-toggle').textContent = '开启';

     // 1秒后尝试自动播放
     setTimeout(tryAutoPlay, 1000);

     // 循环播放
     bgm.addEventListener('ended', () => {
         if (bgmEnabled) {
             bgm.currentTime = 0;
             bgm.play().catch(e => console.log('循环播放被阻止:', e));
         }
     });
 })