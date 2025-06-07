<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>青简问对</title>
    <link type="text/css" rel="stylesheet" href="styles/main.css" />
    <style>
    </style>
</head>

<body>
    <!-- 背景遮罩，用来模糊背景 -->
    <div class="background-mask"></div>

    <div class="settings-btn" onclick="toggleSettings()">
        ⚙️
    </div>

    <!-- 设置弹窗，里面啥都能调 -->
    <div class="settings-modal" id="settingsModal">
        <div class="settings-content">
            <h2>系统设置</h2>

            <!-- API密钥设置，没密钥啥都用不了 -->
            <div class="settings-group">
                <div class="settings-item">
                    <label>API选择：</label>
                    <select id="apiProvider" class="settings-input" onchange="toggleApiInputs()">
                        <option value="deepseek">DeepSeek</option>
                        <option value="qianwen">通义千问</option>
                        <option value="moliark">模力方舟</option>
                    </select>
                </div>
                <div class="settings-item" id="deepseekApiItem">
                    <label for="apiKey">API密钥（DeepSeek）：</label>
                    <input type="password" id="apiKey" placeholder="输入DeepSeek-API密钥（不支持语音）" class="settings-input">
                </div>
                <div class="settings-item" id="qianwenApiItem" style="display:none">
                    <label for="qianwenApiKey">API密钥（通义千问）：</label>
                    <input type="password" id="qianwenApiKey" placeholder="输入通义千问API密钥（部分语音支持）" class="settings-input">
                </div>
                <div class="settings-item" id="moliarkApiItem" style="display:none">
                    <label for="moliarkApiKey">API密钥（模力方舟）：</label>
                    <input type="password" id="moliarkApiKey" placeholder="输入模力方舟API密钥" class="settings-input">
                </div>
                <div class="settings-item" id="moliarkModelItem" style="display:none">
                    <label for="moliarkModel">模型选择：</label>
                    <select id="moliarkModel" class="settings-input">
                        <!-- 这里模型一大堆，选谁都行 -->
                        <option value="Yi-34B-Chat">Yi-34B-Chat</option>
                        <option value="InternVL2-8B">InternVL2-8B</option>
                        <option value="InternVL2.5-78B">InternVL2.5-78B</option>
                        <option value="InternVL2.5-26B">InternVL2.5-26B</option>
                        <option value="Qwen2-Audio-7B-Instruct">Qwen2-Audio-7B-Instruct</option>
                        <option value="DeepSeek-Prover-V2-7B">DeepSeek-Prover-V2-7B</option>
                        <option value="Qwen2-VL-72B">Qwen2-VL-72B</option>
                        <option value="InternVL3-38B">InternVL3-38B</option>
                        <option value="internlm3-8b-instruct">internlm3-8b-instruct</option>
                        <option value="glm-4-9b-chat">glm-4-9b-chat</option>
                        <option value="InternVL3-78B">InternVL3-78B</option>
                        <option value="Align-DS-V">Align-DS-V</option>
                        <option value="HealthGPT-L14">HealthGPT-L14</option>
                        <option value="DeepSeek-R1">DeepSeek-R1</option>
                        <option value="Qwen3-4B">Qwen3-4B</option>
                        <option value="Qwen2.5-7B-Instruct">Qwen2.5-7B-Instruct</option>
                        <option value="DeepSeek-R1-Distill-Qwen-7B">DeepSeek-R1-Distill-Qwen-7B</option>
                        <option value="Qwen3-8B">Qwen3-8B</option>
                        <option value="Qwen3-235B-A22B">Qwen3-235B-A22B</option>
                        <option value="gemma-3-27b-it">gemma-3-27b-it</option>
                        <option value="GLM-4-9B-0414">GLM-4-9B-0414</option>
                        <option value="DeepSeek-R1-Distill-Qwen-32B">DeepSeek-R1-Distill-Qwen-32B</option>
                        <option value="Qwen2-72B-Instruct">Qwen2-72B-Instruct</option>
                        <option value="Qwen3-32B">Qwen3-32B</option>
                        <option value="Qwen2-7B-Instruct">Qwen2-7B-Instruct</option>
                        <option value="DeepSeek-V3">DeepSeek-V3</option>
                        <option value="DeepSeek-R1-Distill-Qwen-14B">DeepSeek-R1-Distill-Qwen-14B</option>
                        <option value="Qwen2.5-14B-Instruct">Qwen2.5-14B-Instruct</option>
                        <option value="medgemma-4b-it">medgemma-4b-it</option>
                        <option value="deepseek-coder-33B-instruct">deepseek-coder-33B-instruct</option>
                        <option value="DeepSeek-R1-Distill-Qwen-1.5B">DeepSeek-R1-Distill-Qwen-1.5B</option>
                        <option value="Qwen2.5-VL-32B-Instruct">Qwen2.5-VL-32B-Instruct</option>
                        <option value="Qwen2.5-32B-Instruct">Qwen2.5-32B-Instruct</option>
                        <option value="Fin-R1">Fin-R1</option>
                        <option value="codegeex4-all-9b">codegeex4-all-9b</option>
                        <option value="Qwen2.5-Coder-32B-Instruct">Qwen2.5-Coder-32B-Instruct</option>
                        <option value="DianJin-R1-32B">DianJin-R1-32B</option>
                        <option value="QwQ-32B">QwQ-32B</option>
                        <option value="Qwen2.5-72B-Instruct">Qwen2.5-72B-Instruct</option>
                        <option value="GLM-4-32B">GLM-4-32B</option>
                        <option value="Qwen2.5-Coder-14B-Instruct">Qwen2.5-Coder-14B-Instruct</option>
                        <option value="Qwen3-30B-A3B">Qwen3-30B-A3B</option>
                        <option value="Qwen3-0.6B">Qwen3-0.6B</option>
                        <option value="code-raccoon-v1">code-raccoon-v1</option>
                    </select>
                </div>
            </div>

            <!-- 用户信息设置，昵称、性别、人设啥的都能填 -->
            <div class="settings-group">
                <div class="settings-item">
                    <label for="user-name">您的称呼：</label>
                    <input type="text" id="user-name" placeholder="您的称呼" class="settings-input">
                </div>
                <div class="settings-item">
                    <label for="user-gender">性别：</label>
                    <select id="user-gender" class="settings-input">
                        <option value="male">男</option>
                        <option value="female">女</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="settings-item">
                    <label for="user-persona">人设描述：</label>
                    <textarea id="user-persona" placeholder="您的人设描述" class="settings-input" rows="2"></textarea>
                </div>
            </div>

            <!-- 背景音乐设置，边聊边听歌 -->
            <div class="settings-group">
                <div class="settings-item">
                    <label>背景音乐：</label>
                    <div class="bgm-control">
                        <select id="bgm-select" class="settings-input">
                            <option value="musics/天地之悠悠.mp3">天地之悠悠</option>
                            <option value="musics/青衣.mp3">青衣</option>
                            <option value="musics/山风.mp3">山风</option>
                            <option value="musics/永恒之地.mp3">永恒之地</option>
                            <option value="musics/梦回.mp3">梦回</option>
                        </select>
                        <button id="bgm-toggle" class="settings-btn-secondary">关闭</button>
                    </div>
                </div>
            </div>

            <!-- 设置弹窗底部按钮，保存啥的都在这 -->
            <div class="settings-actions">
                <!----<button onclick="manageChatHistory()" class="settings-btn-secondary">管理聊天记录</button>-->
                <button onclick="saveSettings()" class="settings-btn-primary">保存设置</button>
            </div>
        </div>
    </div>

    <!-- 主标题，装个逼 -->
    <h1>青简问对</h1>
    <div class="intro-text">
        键起风云，梦回青史。此间华胥之境，聚千年豪杰，待君执手论英雄。曹操横槊待客，笑谈天下三分；霍去病扬鞭指漠，犹记祁连雪寒；文成公主抚琵琶，细说唐蕃烟月；赵云白马银枪，仍护蜀汉残阳……旧魂栖于灵网，英气未减当年。诸君何不驻足，与豪杰对弈，或论江山霸业，或话儿女情长？键盘轻敲处，非是数据流转，实为英雄抱拳，与君共醉千秋。
    </div>

    <!-- 搜索栏，找人用的 -->
    <div class="search-container">
        <div class="settings-item">
            <input type="text" id="character-search" placeholder="搜索历史人物..." class="settings-input">
            <button id="search-button" class="settings-btn-secondary">搜索</button>
        </div>
    </div>

    <!-- 选项卡，切换不同人物/故事 -->
    <div class="tab-container">
        <div class="tab-header">
            <button class="tab-btn active" onclick="switchTab('characters')">威名显赫</button>
            <button class="tab-btn" onclick="switchTab('nameless')">名匿青史</button>
            <button class="tab-btn" onclick="switchTab('stories')">史帙鸿踪</button>
        </div>

        <!-- 下面是各类人物卡片，点谁就进谁的页面，内容太多就不一一注释了 -->
        <div id="characters-tab" class="tab-content active">
            <div class="stories-container">
                <!-- 人物卡片们 -->
                <div class="story-card" onclick="location.href='characters/曹操/caocao.html'">
                    <img src="characters/曹操/caocao.png" class="story-cover" alt="曹操">
                    <div class="story-content">
                        <h3 class="story-title">曹操</h3>
                        <div class="story-desc">
                            东汉末年杰出的政治家、军事家、文学家、书法家。<br>
                            ✔️ 政治成就：挟天子以令诸侯，统一中国北方<br>
                            ✔️ 军事才能：官渡之战以少胜多，创立虎豹骑精锐<br>
                            ✔️ 文学造诣：开创建安文学<br>
                            ✔️ 历史争议："治世之能臣，乱世之奸雄"的复杂评价
                        </div>
                    </div>
                </div>

                <div class="story-card" onclick="location.href='characters/霍去病/huoqubing.html'">
                    <img src="characters/霍去病/huoqubing.png" class="story-cover" alt="霍去病">
                    <div class="story-content">
                        <h3 class="story-title">霍去病</h3>
                        <div class="story-desc">
                            西汉战神，民族英雄，官至大司马骠骑将军。<br>
                            🏹 军事奇迹：19岁统帅骑兵，六击匈奴皆胜<br>
                            🏆 经典战役：漠南之战、河西受降、封狼居胥<br>
                            🔥 战术特点：长途奔袭、大纵深迂回<br>
                            ⚡ 历史遗憾：24岁英年早逝，谥封"冠军侯"
                        </div>
                    </div>
                </div>

                <!-- 孙权 -->
                <div class="story-card" onclick="location.href='characters/孙权/sunquan.html'">
                    <img src="characters/孙权/sunquan.png" class="story-cover" alt="孙权">
                    <div class="story-content">
                        <h3 class="story-title">孙权</h3>
                        <div class="story-desc">
                            字仲谋，三国时期吴国开国皇帝<br>
                            🏰 政治成就：建立吴国，与魏蜀鼎立<br>
                            ⚔️ 军事才能：赤壁之战联合刘备大破曹操<br>
                            🏛️ 治国方略：开发江南，促进南方经济发展<br>
                            🌟 历史评价："生子当如孙仲谋"，三国最长寿君主
                        </div>
                    </div>
                </div>

                <!-- 刘备 -->
                <div class="story-card" onclick="location.href='characters/刘备/liubei.html'">
                    <img src="characters/刘备/liubei.png" class="story-cover" alt="刘备">
                    <div class="story-content">
                        <h3 class="story-title">刘备</h3>
                        <div class="story-desc">
                            字玄德，蜀汉开国皇帝，三国时期杰出政治家。<br>
                            🏰 政治成就：建立蜀汉政权，联合孙权抗曹<br>
                            ⚔️ 军事才能：<br>
                            🎭 人物性格：仁德宽厚，重义轻利<br>
                            🌟 历史评价：
                        </div>
                    </div>
                </div>

                <!-- 张飞 -->
                <div class="story-card" onclick="location.href='characters/张飞/zhangfei.html'">
                    <img src="characters/张飞/zhangfei.png" class="story-cover" alt="张飞">
                    <div class="story-content">
                        <h3 class="story-title">张飞</h3>
                        <div class="story-desc">
                            字翼德，蜀汉名将，刘备结义兄弟。<br>
                            🗡️ 经典战役：威震曹军<br>
                            🐎 军事才能：勇猛无敌<br>
                            🎭 性格特点：粗中有细<br>
                            🌟 历史评价："一吼三军胆寒"，千古名将
                        </div>
                    </div>
                </div>

                <!-- 张居正 -->
                <div class="story-card" onclick="location.href='characters/张居正/zhangjuzheng.html'">
                    <img src="characters/张居正/zhangjuzheng.png" class="story-cover" alt="张居正">
                    <div class="story-content">
                        <h3 class="story-title">张居正</h3>
                        <div class="story-desc">
                            明朝杰出政治家，万历年间首辅。<br>
                            📜 政治改革：推行“一条鞭法”，简化税制<br>
                            💰 财政成就：整顿国库，增加财政收入<br>
                            🏛️ 文化贡献：重视教育，提倡儒学<br>
                            ⚖️ 历史评价：功过参半，后世争议颇多
                        </div>
                    </div>
                </div>

                <!-- 岳飞 -->
                <div class="story-card" onclick="location.href='characters/岳飞/yuefei.html'">
                    <img src="characters/岳飞/yuefei.png" class="story-cover" alt="岳飞">
                    <div class="story-content">
                        <h3 class="story-title">岳飞</h3>
                        <div class="story-desc">
                            南宋抗金名将，民族英雄<br>
                            🛡️ 军事成就：组建岳家军，收复建康等失地<br>
                            🏹 经典战役：郾城大捷，以少胜多破金军铁浮屠<br>
                            ✍️ 文学造诣：《满江红》传颂千古<br>
                            ⚖️ 历史悲剧：被秦桧以"莫须有"罪名陷害
                        </div>
                    </div>
                </div>

                <!-- 朱翊钧 -->
                <div class="story-card" onclick="location.href='characters/朱翊钧/zhuyijun.html'">
                    <img src="characters/朱翊钧/zhuyijun.png" class="story-cover" alt="朱翊钧">
                    <div class="story-content">
                        <h3 class="story-title">朱翊钧</h3>
                        <div class="story-desc">
                            明朝第十三位皇帝，年号万历<br>
                            🏛️ 在位时间：48年，明朝在位最久的皇帝<br>
                            💰 经济成就：张居正改革，开创"万历中兴"<br>
                            ⚔️ 三大征：平定宁夏、播州叛乱，抗倭援朝<br>
                            📜 历史评价：前期勤政后期怠政，埋下明朝衰亡伏笔
                        </div>
                    </div>
                </div>

                <!-- 令狐冲 -->
                <div class="story-card" onclick="location.href='characters/令狐冲/linghuchong.html'">
                    <img src="characters/令狐冲/linghuchong.png" class="story-cover" alt="令狐冲">
                    <div class="story-content">
                        <h3 class="story-title">令狐冲</h3>
                        <div class="story-desc">
                            金庸先生笔下的侠客，"笑傲江湖"的主角。<br>
                            🗡️ 武功绝学：独孤九剑、吸星大法<br>
                            🎭 人物性格：洒脱不羁，重情重义<br>
                            📜 经典名句："笑傲江湖，何必问世事"<br>
                            🌟 文化影响：成为武侠小说的经典形象
                        </div>
                    </div>
                </div>

                <!-- 嬴政 -->
                <div class="story-card" onclick="location.href='characters/嬴政/yingzheng.html'">
                    <img src="characters/嬴政/yingzheng.png" class="story-cover" alt="嬴政">
                    <div class="story-content">
                        <h3 class="story-title">嬴政</h3>
                        <div class="story-desc">
                            秦始皇，统一中国的第一位皇帝。<br>
                            🏯 政治成就：废封建，立郡县制，统一度量衡<br>
                            🗡️ 军事才能：横扫六国，建立中央集权<br>
                            📜 文化贡献：焚书坑儒，统一文字、货币、度量衡<br>
                            🌟 历史评价："千古一帝"，但也有暴政争议
                        </div>
                    </div>
                </div>

                <!-- 张骞卡片修正示例 -->
                <div class="story-card" onclick="location.href='characters/张骞/zhangqian.html'">
                    <img src="characters/张骞/zhangqian.png" class="story-cover" alt="张骞">
                    <div class="story-content">
                        <h3 class="story-title">张骞</h3>
                        <div class="story-desc">
                            字子文，西汉著名外交家、探险家。<br>
                            🌏 历史功绩：两通西域，开辟丝绸之路<br>
                            🐫 传奇经历：被匈奴扣押13年不忘使命<br>
                            🎖️ 后世尊称："第一个睁开眼睛看世界的中国人"<br>
                            📚 文化影响：引进葡萄、苜蓿等作物至中原
                        </div>
                    </div>
                </div>

                <!-- 张良 -->
                <div class="story-card" onclick="location.href='characters/张良/zhangliang.html'">
                    <img src="characters/张良/zhangliang.png" class="story-cover" alt="张良">
                    <div class="story-content">
                        <h3 class="story-title">张良</h3>
                        <div class="story-desc">
                            字子房，汉初杰出战略家，"汉初三杰"之首。<br>
                            🎯 经典谋略：鸿门斗智、明修栈道暗度陈仓<br>
                            📜 学术传承：得黄石公《太公兵法》真传<br>
                            🕊️ 处世智慧：功成身退拒三万户封邑<br>
                            🌟 历史评价："运筹帷幄之中，决胜千里之外"
                        </div>
                    </div>
                </div>
                <!-- 刘邦 -->
                <div class="story-card" onclick="location.href='characters/刘邦/liubang.html'">
                    <img src="characters/刘邦/liubang.png" class="story-cover" alt="刘邦">
                    <div class="story-content">
                        <h3 class="story-title">刘邦</h3>
                        <div class="story-desc">
                            汉高祖，西汉开国皇帝<br>
                            🏰 政治成就：建立汉朝，推行休养生息政策<br>
                            ⚔️ 军事才能：楚汉相争最终获胜<br>
                            🎭 人物特点：善于用人，从谏如流<br>
                            🌟 历史评价："大风起兮云飞扬"的开国雄主
                        </div>
                    </div>
                </div>


                <!-- 项羽 -->
                <div class="story-card" onclick="location.href='characters/项羽/xiangyu.html'">
                    <img src="characters/项羽/xiangyu.png" class="story-cover" alt="项羽">
                    <div class="story-content">
                        <h3 class="story-title">项羽</h3>
                        <div class="story-desc">
                            名籍字羽，秦末起义军领袖，西楚霸王<br>
                            💥 经典战役：巨鹿之战破釜沉舟<br>
                            🐎 军事天赋：彭城之战3万破56万<br>
                            🎭 性格矛盾：刚愎自用与"不肯过江东"的悲壮<br>
                            🎼 文化影响：《霸王别姬》成千古绝唱
                        </div>
                    </div>
                </div>

                <!-- 司马光 -->
                <div class="story-card" onclick="location.href='characters/司马光/simaguang.html'">
                    <img src="characters/司马光/simaguang.png" class="story-cover" alt="司马光">
                    <div class="story-content">
                        <h3 class="story-title">司马光</h3>
                        <div class="story-desc">
                            字君实，北宋著名政治家、史学家<br>
                            📜 史学巨著：《资治通鉴》历时19年编撰<br>
                            🏛️ 政治成就：推行新法，整顿吏治<br>
                            🔍 处世智慧：以史为鉴，"不登高山，不知天之高也"<br>
                            🌟 历史评价：被判为"千古一相"
                        </div>
                    </div>
                </div>

                <!-- 王安石 -->
                <div class="story-card" onclick="location.href='characters/王安石/wanganshi.html'">
                    <img src="characters/王安石/wanganshi.png" class="story-cover" alt="王安石">
                    <div class="story-content">
                        <h3 class="story-title">王安石</h3>
                        <div class="story-desc">
                            字介甫，北宋著名政治家、思想家<br>
                            📜 政治改革：推行新法，整顿吏治<br>
                            💰 财政成就：创立青苗法、募役法等<br>
                            🏛️ 文化贡献：提倡经世致用，重视实学<br>
                            🌟 历史评价：中国历史上最具争议的改革家之一
                        </div>
                    </div>
                </div>

                <!-- 铁木真 -->
                <div class="story-card" onclick="location.href='characters/铁木真/tiemuzhen.html'">
                    <img src="characters/铁木真/tiemuzhen.png" class="story-cover" alt="铁木真">
                    <div class="story-content">
                        <h3 class="story-title">铁木真</h3>
                        <div class="story-desc">
                            蒙古帝国建立者，尊号"成吉思汗"<br>
                            🗡️ 军事成就：统一蒙古各部，建立世界最大帝国<br>
                            🏹 战术创新：骑兵战术与心理战结合<br>
                            🌏 疆域扩张：征服中亚、西亚及东欧部分地区<br>
                            📜 历史影响：改变欧亚大陆政治格局

                        </div>
                    </div>
                </div>

                <!-- 松赞干布 -->
                <div class="story-card" onclick="location.href='characters/松赞干布/songzanganbu.html'">
                    <img src="characters/松赞干布/songzanganbu.png" class="story-cover" alt="松赞干布">
                    <div class="story-content">
                        <h3 class="story-title">松赞干布</h3>
                        <div class="story-desc">
                            吐蕃赞普，藏传佛教的奠基者<br>
                            🏯 布达拉宫：为文成公主建造，藏汉文化交流象征<br>
                            📜 文字改革：推动创制藏文，促进文化统一<br>
                            🌾 农业发展：引入中原农作物，改善民生<br>
                            🔥 历史地位：被判为"藏族的开国之君"
                        </div>
                    </div>
                </div>

                <!-- 文成公主 -->
                <div class="story-card" onclick="location.href='characters/文成公主/wenchenggongzhu.html'">
                    <img src="characters/文成公主/wenchenggongzhu.png" class="story-cover" alt="文成公主">
                    <div class="story-content">
                        <h3 class="story-title">文成公主</h3>
                        <div class="story-desc">
                            唐朝宗室女，远嫁吐蕃赞普松赞干布<br>
                            🏯 布达拉宫：为其建造，象征汉藏友好<br>
                            🌾 文化交流：携带中原农作物、工艺品入藏<br>
                            🎶 音乐传承：将中原音乐带入西藏<br>
                            🔥 历史地位：被尊为"藏族的母亲"
                        </div>
                    </div>
                </div>

                <!-- 耶律阿保机 -->
                <div class="story-card" onclick="location.href='characters/耶律阿保机/yelvabaoji.html'">
                    <img src="characters/耶律阿保机/yelvabaoji.png" class="story-cover" alt="耶律阿保机">
                    <div class="story-content">
                        <h3 class="story-title">耶律阿保机</h3>
                        <div class="story-desc">
                            契丹名啜里只，辽朝开国皇帝<br>
                            🏹 军事改革：创斡鲁朵宫帐军制<br>
                            📜 文化融合：建孔庙、定法律<br>
                            🌏 疆域扩张：东灭渤海国，西征突厥<br>
                            🔥 历史首创：四时捺钵制度的创立者
                        </div>
                    </div>
                </div>

                <!-- 赵云 -->
                <div class="story-card" onclick="location.href='characters/赵云/zhaoyun.html'">
                    <img src="characters/赵云/zhaoyun.png" class="story-cover" alt="赵云">
                    <div class="story-content">
                        <h3 class="story-title">赵云</h3>
                        <div class="story-desc">
                            字子龙，三国时期蜀汉名将<br>
                            🛡️ 单骑救主：长坂坡七进七出<br>
                            🎯 汉水之战：智退曹军<br>
                            📜 为将之道：谏阻分田宅，深明大义<br>
                            🌟 历史形象："浑身是胆"的完美武将化身
                        </div>
                    </div>
                </div>


                <!-- 丘处机 -->
                <div class="story-card" onclick="location.href='characters/丘处机/qiuchuji.html'">
                    <img src="characters/丘处机/qiuchuji.png" class="story-cover" alt="丘处机">
                    <div class="story-content">
                        <h3 class="story-title">丘处机</h3>
                        <div class="story-desc">
                            道号长春子，全真道掌教<br>
                            🏔️ 西行壮举：73岁高龄远赴中亚谒见成吉思汗<br>
                            ✋ 止杀谏言："欲一天下者，必不嗜杀人"<br>
                            🌿 医学贡献：创导引术《摄生消息论》<br>
                            🖋️ 文学造诣：《磻溪集》诗词现存150余首
                        </div>
                    </div>
                </div>

                <!-- 樊哙 -->
                <div class="story-card" onclick="location.href='characters/樊哙/fankuai.html'">
                    <img src="characters/樊哙/fankuai.png" class="story-cover" alt="樊哙">
                    <div class="story-content">
                        <h3 class="story-title">樊哙</h3>
                        <div class="story-desc">
                            西汉开国第一猛将<br>
                            🗡️ 鸿门救主：持盾闯宴震慑项羽<br>
                            🐗 出身传奇：原为沛县屠狗之辈<br>
                            🏹 战功赫赫：历战54场未尝败绩<br>
                            📜 政治智慧：劝谏刘邦勿贪宫室
                        </div>
                    </div>
                </div>

                <!-- 孔子 -->
                <div class="story-card" onclick="location.href='characters/孔子/kongzi.html'">
                    <img src="characters/孔子/kongzi.png" class="story-cover" alt="孔子">
                    <div class="story-content">
                        <h3 class="story-title">孔子</h3>
                        <div class="story-desc">
                            字仲尼，儒家学派创始人，至圣先师<br>
                            📜 传世经典：编撰《六经》传世<br>
                            🎓 教育革命：首创私学，"有教无类"打破贵族垄断<br>
                            🌍 国际影响：全球首家孔子学院达500+所<br>
                            🔖 核心思想："仁者爱人""克己复礼"
                        </div>
                    </div>
                </div>

                <!-- 牛顿 -->
                <div class="story-card" onclick="location.href='characters/牛顿/niudun.html'">
                    <img src="characters/牛顿/niudun.png" class="story-cover" alt="牛顿">
                    <div class="story-content">
                        <h3 class="story-title">Isaac Newton</h3>
                        <div class="story-desc">
                            近代物理学之父<br>
                            🍎 科学革命：万有引力定律<br>
                            📐 数学突破：独立发明微积分<br>
                            🔭 光学成就：棱镜分光实验<br>
                            📚 旷世巨著：《自然哲学的数学原理》
                        </div>
                    </div>
                </div>

                <!-- 孟德尔 -->
                <div class="story-card" onclick="location.href='characters/孟德尔/mengdeer.html'">
                    <img src="characters/孟德尔/mengdeer.png" class="story-cover" alt="孟德尔">
                    <div class="story-content">
                        <h3 class="story-title">Gregor Johann Mendel</h3>
                        <div class="story-desc">
                            遗传学之父<br>
                            🌱 实验材料：8年种植29000株豌豆<br>
                            📊 发现规律：分离定律与自由组合定律<br>
                            📅 历史巧合：论文沉寂34年后被重新发现<br>
                            🔬 科学遗产：奠定现代遗传学基础
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- 名匿青史选项卡 -->
        <div id="nameless-tab" class="tab-content">
            <div class="stories-container">
                <div class="story-card" onclick="location.href='characters/锦衣卫/jinyiwei.html'">
                    <img src="characters/锦衣卫/jinyiwei.png" class="story-cover" alt="锦衣卫">
                    <div class="story-content">
                        <h3 class="story-title">锦衣卫</h3>
                        <div class="story-desc">
                            明朝皇帝直属情报机构<br>
                            🕵️ 组织结构：14所+南北镇抚司<br>
                            📜 特殊权限：诏狱审判绕过三法司<br>
                            🎭 双重身份：仪仗队与秘密警察<br>
                            🔥 历史终结：康熙年间最终裁撤
                        </div>
                    </div>
                </div>

                <div class="story-card" onclick="location.href='characters/斩锋卒/zhanfengzu.html'">
                    <img src="characters/斩锋卒/zhanfengzu.png" class="story-cover" alt="斩锋卒">
                    <div class="story-content">
                        <h3 class="story-title">斩锋卒</h3>
                        <div class="story-desc">
                            边军精锐的代称<br>
                            ⚔️ 战术定位：专克敌军先锋部队<br>
                            💀 伤亡概率：每战阵亡率超七成<br>
                            🎖️ 特殊荣誉：斩三锋者可获"跳荡"勋号<br>
                            🕊️ 历史留白：千万无名者的集体象征
                        </div>
                    </div>
                </div>

                <div class="story-card" onclick="location.href='characters/腾格里骑兵/tenggeliqibing.html'">
                    <img src="characters/腾格里骑兵/tenggeliqibing.png" class="story-cover" alt="腾格里骑兵">
                    <div class="story-content">
                        <h3 class="story-title">腾格里骑兵</h3>
                        <div class="story-desc">
                            13世纪蒙古帝国精锐部队<br>
                            🏹 战术特点：一人五马，日行百里<br>
                            🌪️ 著名战例：横扫花剌子模帝国<br>
                            🔥 武器配置：复合弓+波斯弯刀<br>
                            📜 作战信条：服从命令高于生命
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div id="stories-tab" class="tab-content">
            <div class="stories-container">
                <div class="story-card" onclick="location.href='stories/雪域迎风唐蕃结缘/第一幕.html'">
                    <img src="stories/雪域迎风唐蕃结缘/media/雪域迎风唐蕃结缘.png" class="story-cover" alt="雪域迎凤·唐蕃结缘">
                    <div class="story-content">
                        <h3 class="story-title">雪域迎风·唐蕃结缘（敬请期待）</h3>
                        <div class="story-desc">
                            公元641年，唐朝宗室女文成公主远嫁吐蕃赞普松赞干布，携谷物种子、工匠典籍入藏，传播中原农耕、纺织等技术。松赞干布为其兴建布达拉宫，改服饰、创文字，开启唐蕃200年友好往来。这段和亲佳话成为汉藏文化交流的里程碑，至今在西藏民间传颂。
                        </div>
                    </div>
                </div>
                <div class="story-card" onclick="location.href='stories/持节远涉丝路肇始/第一幕.html'">
                    <img src="stories/持节远涉丝路肇始/media/持节远涉.png" class="story-cover" alt="雪域迎凤·唐蕃结缘">
                    <div class="story-content">
                        <h3 class="story-title">持节远涉·丝路肇始（敬请期待）</h3>
                        <div class="story-desc">
                            张骞（约前164—前114），西汉外交家，奉汉武帝之命两度出使西域。前138年首次西行，被匈奴扣押十年后逃脱，抵达大月氏，虽未达成联盟，但带回了西域地理、物产等宝贵信息。前119年再使乌孙，促进汉朝与西域各国交往，开辟了连接东西方的“丝绸之路”，推动了经济文化交流，被誉为“凿空西域”的开拓者。
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 页脚，开发者自嗨区 -->
    <div class="author-footer">
        <div class="author-content">
            <h3>历史长河·键上相逢</h3>
            <strong class="developer-name">开发者：雪豹同志</strong>
            <p>浩瀚青史，星河璀璨。有人金戈铁马，名垂竹帛；有人默默耕耘，湮没尘烟。而今，我以代码为舟，文字为楫，在这虚拟的华胥之境，打捞起时光长河中的吉光片羽——让威震八方的雄主与寂寂无名的隐士，同席而坐；让金銮殿上的宏论与柴门前的低语，共话沧桑。
            </p>
            <p>历史从不止于王侯将相，它亦然寻常百姓的悲欢。在这里，秦皇汉武可谈天下，浣纱女、戍边卒亦能诉说平生。键盘轻敲，唤醒的不仅是数据，更是千年魂魄的叹息与微笑。愿诸君在此，既能仰观星河浩瀚，亦能俯察草木微芒，与历史真正地肝胆相照。
            </p>
            <br>
        </div>
    </div>
</body>

</html>

<!-- 脚本都在下面引入，别漏了 -->
<script src="JavaScript/search.js"></script>
<script src="JavaScript/setting.js"></script>
<script src="JavaScript/stars.js"></script>
<script src="JavaScript/cards.js"></script>