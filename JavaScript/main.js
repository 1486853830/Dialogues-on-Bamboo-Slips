import { HuoQubing } from '../霍去病/huoqubing.js';
import { LiuBang } from '../刘邦/liubang.js';
import { XiangYu } from '../项羽/xiangyu.js';
import { CaoCao } from '../曹操/caocao.js';
import { QiuChuji } from '../丘处机/qiuchuji.js';
import { KongZi } from '../孔子/kongzi.js';
import { ZhangLiang } from '../张良/zhangliang.js';
import { FanKuai } from '../樊哙/fankuai.js';
import { ZhaoYun } from '../赵云/zhaoyun.js';

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
    }
});
