import { HuoQubing } from '../霍去病/huoqubing.js';
import { LiuBang } from '../刘邦/liubang.js';
import { XiangYu } from '../项羽/xiangyu.js';
import { CaoCao } from '../曹操/caocao.js';
import { QiuChuji} from '../丘处机/qiuchuji.js';

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
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
    }
});
