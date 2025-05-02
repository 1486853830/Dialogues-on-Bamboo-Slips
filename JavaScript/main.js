import { HuoQubing } from '../characters/霍去病/huoqubing.js';
import { LiuBang } from '../characters/刘邦/liubang.js';
import { XiangYu } from '../characters/项羽/xiangyu.js';
import { CaoCao } from '../characters/曹操/caocao.js';
import { QiuChuji } from '../characters/丘处机/qiuchuji.js';
import { KongZi } from '../characters/孔子/kongzi.js';
import { ZhangLiang } from '../characters/张良/zhangliang.js';
import { FanKuai } from '../characters/樊哙/fankuai.js';
import { ZhaoYun } from '../characters/赵云/zhaoyun.js';
import { Songzanganbu } from '../characters/松赞干布/songzanganbu.js';
import { Wenchenggongzhu } from '../characters/文成公主/wenchenggongzhu.js';

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.toLowerCase();

    if (path.includes('huoqubing')) {
        const huoqubing = new HuoQubing();
        huoqubing.init();
    } else if (path.includes('liubang')) {
        const liubang = new LiuBang();
        liubang.init();
    } else if (path.includes('xiangyu')) {
        const xiangyu = new XiangYu();
        xiangyu.init();
    } else if (path.includes('caocao')) {
        const caocao = new CaoCao();
        caocao.init();
    } else if (path.includes('qiuchuji')) {
        const qiuchuji = new QiuChuji();
        qiuchuji.init();
    } else if (path.includes('kongzi')) {
        const kongzi = new KongZi();
        kongzi.init();
    } else if (path.includes('zhangliang')) {
        const zhangliang = new ZhangLiang();
        zhangliang.init();
    } else if (path.includes('fankuai')) {
        const fankuai = new FanKuai();
        fankuai.init();
    } else if (path.includes('zhaoyun')) {
        const zhaoyun = new ZhaoYun();
        zhaoyun.init();
    } else if (path.includes('songzanganbu')) {
        const songzanganbu = new Songzanganbu();
        songzanganbu.init();
    } else if (path.includes('wenchenggongzhu')) {
        const wenchenggongzhu = new Wenchenggongzhu();
        wenchenggongzhu.init();
    }
});


function saveChatHistory(message, sender) {
    // 判断是否是故事模式
    if (window.location.pathname.includes('雪域迎风唐蕃结缘')) {
        // 调用故事模式专用存储
        saveStoryChat(message, sender);
    } else {
        // 原有普通聊天存储逻辑
        saveNormalChat(message, sender); 
    }
}