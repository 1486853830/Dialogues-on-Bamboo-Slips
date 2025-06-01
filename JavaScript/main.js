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
import { Niudun } from '../characters/牛顿/niudun.js';
import { Mengdeer } from '../characters/孟德尔/mengdeer.js';
import { Yelvabaoji } from '../characters/耶律阿保机/yelvabaoji.js';
import { Zhanfengzu } from '../characters/斩锋卒/zhanfengzu.js';
import { JinYiWei } from '../characters/锦衣卫/jinyiwei.js';
import { ZhangQian } from '../characters/张骞/zhangqian.js';
import { TengGeliQiBing } from '../characters/腾格里骑兵/tenggeliqibing.js';
import { ZhangJuzheng } from '../characters/张居正/zhangjuzheng.js';
import { ZhangFei } from '../characters/张飞/zhangfei.js';
import { ZhuYijun } from '../characters/朱翊钧/zhuyijun.js';
import { SimaGuang } from '../characters/司马光/simaguang.js';
import { WangAnshi } from '../characters/王安石/wanganshi.js';
import { TiemuZhen } from '../characters/铁木真/tiemuzhen.js';

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
    } else if (path.includes('niudun')) {
        const niudun = new Niudun();
        niudun.init();
    } else if (path.includes('mengdeer')) {
        const mengdeer = new Mengdeer();
        mengdeer.init();
    } else if (path.includes('yelvabaoji')) {
        const yelvabaoji = new Yelvabaoji();
        yelvabaoji.init();
    } else if (path.includes('zhanfengzu')) {
        const zhanfengzu = new Zhanfengzu();
        zhanfengzu.init(); 
    } else if (path.includes('jinyiwei')) {
        const jinyiwei = new JinYiWei();
        jinyiwei.init(); 
    } else if (path.includes('zhangqian')) {
        const zhangqian = new ZhangQian();
        zhangqian.init(); 
    } else if (path.includes('tenggeliqibing')) {
        const tenggeliqibing = new TengGeliQiBing();
        tenggeliqibing.init();
    } else if (path.includes('zhangjuzheng')) {
        const zhangjuzheng = new ZhangJuzheng();
        zhangjuzheng.init();
    } else if (path.includes('zhangfei')) {
        const zhangfei = new ZhangFei();
        zhangfei.init(); 
    } else if (path.includes('zhuyijun')) {
        const zhuyijun = new ZhuYijun();
        zhuyijun.init();
    } else if (path.includes('simaguang')) {
        const simaguang = new SimaGuang();
        simaguang.init(); 
    } else if (path.includes('wanganshi')) {
        const wanganshi = new WangAnshi();
        wanganshi.init(); 
    } else if (path.includes('tiemuzhen')) {
        const tiemuzhen = new TiemuZhen();
        tiemuzhen.init(); 
    }
});
