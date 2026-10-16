# BRICK GAME 方块游戏机 · 超越经典版

**English** | [中文](#应用功能介绍)

> 🕹️ **Brick Game Console — 49 games in 1**. A faithful HTML5 revival of the classic
> 9999-in-1 brick handheld, rebuilt with pure HTML5 / Canvas / WebAudio — neon pixel
> art, chiptune music, zero dependencies, zero build step. Runs on desktop & mobile.

纯原生 HTML5 / Canvas / WebAudio 复刻经典掌上方块游戏机（Brick Game 9999 in 1）的全部玩法，
并在画面、音效、特效上全面超越原机。**零依赖、零构建**——所有代码手写，双击即玩。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/TechFunWay/brick-game)](https://github.com/TechFunWay/brick-game/releases/latest)
![platforms](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Docker%20%7C%20fnOS-8a7cff)

![games](https://img.shields.io/badge/games-49-2de2ff) ![deps](https://img.shields.io/badge/dependencies-0-30ff8e)

| 手机横屏（屏幕在左、方向键在右） | 手机竖屏 |
| :---: | :---: |
| ![手机横屏对局](docs/screenshots/tetris-mobile-landscape.png) | ![手机竖屏菜单](docs/screenshots/menu-mobile.png) |

## 下载与安装

| 渠道 | 获取方式 |
|---|---|
| GitHub Releases | <https://github.com/TechFunWay/brick-game/releases> —— 各平台压缩包、飞牛 `fpk` 安装包与 `docker-compose.yml` |
| Gitee 镜像 | <https://gitee.com/TechFunWay/brick-game> —— 代码自动同步自 GitHub，发行版待补 |
| Docker 镜像 | `docker pull techfunways/brick-game:latest`（amd64 / arm64 多平台） |
| 飞牛 fnOS | 在飞牛应用中心手动安装 Releases 里的 `.fpk` 安装包（amd64 / arm64） |
| 官网介绍页 | <https://techfunway.wycto.cn/fnapp/brick-game> |

> 默认端口 `8908`；数据默认是挂载目录下的 SQLite 单文件，备份即拷贝，恢复支持上传本地备份文件。

## 应用功能介绍

**一台装进 NAS 的复古掌机，49 款游戏，手机/电脑打开即玩。**

- **玩法全收录（33 款经典）**：方块家族 6 款（经典 / 挑战B / 豪华五格骨牌 / 暴雨 / 冲刺 / 盲盒）、贪吃蛇 3 款、赛车 3 款、打飞机 2 款、坦克 2 款、打砖块 2 款、数字拼图 3 款、记忆翻牌 2 款、飞碟射击 2 款、接宝 2 款、推箱子 2 款、导弹拦截 2 款、青蛙过河 2 款——对应原机全系 A/B 变体。
- **16 款全新小品**：2048、扫雷、贪吃豆、点灯、汉诺塔、月面着陆、黑白棋、迷宫寻宝、拉霸机、速算、颠球、笨鸟先飞、记忆旋律、消星星、高山滑雪、井字棋。
- **画面超越原机**：霓虹像素 + CRT 扫描线暗角、行消除粒子爆裂、屏幕震动、闪光与浮动连击文字、动态星空背景。
- **8bit 芯片音乐**：WebAudio 实时合成 30 余种音效 + 双声部（方波主旋律/三角波贝斯）芯片音乐，含俄罗斯方块 Korobeiniki 主题曲等 5 首。
- **现代手感**：0–9 速度选择（同原机）、DAS 连发移动、踢墙旋转、软降/硬降计分、每游戏独立最高分存档、暂停/结算/新纪录提示、后台自动暂停。
- **手机完美适配**：虚拟方向键 + A/B 按键 + 屏幕滑动手势，横屏自动切换左右布局，刘海屏安全区适配，全屏模式与「添加到主屏幕」PWA 独立运行，按键震动触感（可开关）。

## 运行方式

本项目是 [smallgo](https://github.com/techfunway) 基座下的第 8 个应用，纯静态前端 + Go 静态服务（端口 **8908**）。

```bash
make dev          # 本地启动 http://localhost:8908
make start        # 同上（go run）
```

浏览器打开 http://localhost:8908 即可；手机连同一局域网直接访问 NAS IP:8908。

## 编译打包

```bash
make build            # 编译当前平台二进制
make build-linux      # 交叉编译 linux amd64 + arm64
make build-all        # 全平台编译打包（darwin/linux/windows 压缩包 + 部署 compose 到 release/<版本>/）
make build-docker     # 构建多架构 Docker 镜像并推送（linux amd64 + arm64 合并为单 tag，pull 自动识别架构）
make fnpack           # 构建飞牛 fnOS 双架构安装包到 release/<版本>/（文件名含版本号）
make clean            # 清理
```

发行产物目录 `release/<版本>/`：五平台压缩包（`techfunway-brick-game-<版本>-<系统>-<架构>.tar.gz` / Windows `.zip`）、双架构 `.fpk`、`docker-compose.yml` 与 `docker-compose.latest.yml`、游戏截图（`screenshots/` 与打包好的 `screenshots-<版本>.zip`，源自 `docs/screenshots/`）以及 `CHANGELOG.md` 更新日志。

## 发行包运行（免安装二进制）

从 `release/<版本>/` 下载对应平台压缩包，解压即用——目录内自带 `web/` 静态资源，二进制为纯静态链接，无需安装任何运行时依赖：

```bash
tar xzf techfunway-brick-game-v0.1.0-linux-amd64.tar.gz
cd techfunway-brick-game-v0.1.0-linux-amd64
```

Windows 包解压后双击 `brick-game.exe` 直接运行。

### 直接启动（前台）

```bash
./brick-game                  # 默认端口 8908，静态资源取 ./web
```

启动后浏览器打开 `http://localhost:8908` 即可游玩。**停止：终端按 `Ctrl + C`。**

常用参数（均有默认值，一般无需指定）：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `-port` | 8908 | HTTP 监听端口 |
| `-web-dir` | `./web` | 静态资源目录（解压目录内已自带） |
| `-logmode` | release | 日志模式：`release` / `debug` |
| `-disable-stats` | 关闭 | 关闭匿名使用统计与支持计数上报（也可用环境变量 `DISABLE_STATS=1`） |
| `-version` | — | 打印版本信息后退出 |

### 支持作者

应用免费、无广告。如果你觉得它好玩，欢迎请作者喝杯咖啡——微信扫码赞赏，金额随意。

<p align="center">
  <img src="web/images/donate-wechat.png" alt="微信赞赏收款码" width="240">
</p>

赞赏完全自愿，不支付不影响任何功能。点「已支持」后发送的只是一次匿名支持计数（设备哈希/系统/版本 + 金额），
与你的微信账号和支付记录无任何关联；`-disable-stats` 可彻底关闭上报。

### 后台守护启动

#### 方式一：nohup（Linux / macOS 通用，最简单）

```bash
# 启动：日志写入 brick-game.log，进程号写入 brick-game.pid
nohup ./brick-game -port 8908 > brick-game.log 2>&1 &
echo $! > brick-game.pid

# 查看运行日志
tail -f brick-game.log

# 停止
kill $(cat brick-game.pid)

# 重启：先停旧进程，等端口释放后再拉起
kill $(cat brick-game.pid) 2>/dev/null; sleep 1
nohup ./brick-game -port 8908 > brick-game.log 2>&1 &
echo $! > brick-game.pid
```

> PID 文件丢失时，也可以用 `pkill -f brick-game` 按进程名停止。

#### 方式二：systemd（Linux 服务器 / NAS 推荐，支持开机自启 + 崩溃自动拉起）

把发行包解压到固定目录（示例 `/opt/brick-game`），创建 `/etc/systemd/system/brick-game.service`：

```ini
[Unit]
Description=Brick Game 方块游戏机
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/brick-game
ExecStart=/opt/brick-game/brick-game -port 8908 -web-dir ./web
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload             # 让 systemd 读取新服务配置（首次创建/修改后执行一次）
sudo systemctl enable --now brick-game   # 设置开机自启并立即启动
sudo systemctl restart brick-game        # 重启
sudo systemctl stop brick-game           # 停止
sudo systemctl status brick-game         # 查看运行状态
journalctl -u brick-game -f              # 实时查看日志
```

#### Windows

命令行窗口内直接运行 `brick-game.exe`，关闭窗口即停止；需要强制结束时用 `taskkill /f /im brick-game.exe`。

## Docker 部署

```bash
docker compose up -d      # 构建并启动，映射 8908:8908
```

或直接使用镜像：

```bash
docker run -d --name techfunway-brick-game -p 8908:8908 techfunways/brick-game:latest
```

## 飞牛 fnOS 应用

按飞牛应用开放平台规范以「服务型应用」打包（`service_port=8908`，统一网关入口，`fnpack/` 为包模板）：

```bash
make fnpack            # 产出 release/<version>/techfunway-brick-game_{amd64,arm64}.fpk
```

安装：应用中心 → 手动安装 → 选择 .fpk；桌面图标「方块游戏机」点开即玩（端口可在安装向导/运行设置中自定义，默认 8908；从旧 CGI 静态包升级建议先卸载旧版）。

提示：游戏中按 **F** 或点 **FULL** 按钮进入全屏（铺满整屏、隐藏窗口按钮，ESC 退出）；手机浏览器打开后选择「添加到主屏幕」，即可全屏独立运行，体验接近原生应用。

## 内置 49 款游戏（对应原机全系列）**方块家族（8）**：方块经典 · 方块挑战B · 方块豪华PENTIX（五格骨牌） · 方块暴雨（垃圾行雨） · 方块冲刺（120秒限时） · 方块盲盒（无预览）

**贪吃蛇（3）**：经典 · 迷宫墙II · 穿墙III　**赛车（3）**：疯狂赛车 · 午夜狂飙 · 极限方程式
**打飞机（2）**：星际打飞机 · 蜂群II　**坦克（2）**：坦克大战 · 钢甲洪流
**打砖块（2）**：霓虹打砖块 · 狂热II　**拼图（3）**：3×3入门 · 4×4经典 · 5×5进阶
**记忆翻牌（2）**：8对 · 10对进阶　**飞碟射击（2）**：经典 · 狂热II　**接宝（2）**：达人 · 风暴II
**推箱子（2）**：经典6关 · 进阶6关　**导弹拦截（2）**：经典 · 全面战争II　**青蛙过河（2）**：经典 · 激流II

**全新玩法（16）**：

| 游戏 | 玩法 |
|------|------|
| 笨鸟先飞 | 一键穿缝飞行 |
| 2048 | 滑动合并冲击 2048 |
| 消星星 | 同色连消 + 重力塌缩，清屏大奖 |
| 点灯 | 5×5 十字联动熄灯谜题 |
| 扫雷 | 9×9 首点安全、B 键插旗 |
| 月面着陆 | 物理着陆：油料/速度/落点三重挑战 |
| 迷宫寻宝 | DFS 生成迷宫 + 钥匙开出门 + 限时逃脱 |
| 汉诺塔 | 5 环递归谜题，A 取放 B 放回 |
| 记忆旋律 | Simon 式序列记忆，键盘/点触双操作 |
| 速算 | 10 秒心算 + 连对倍率 |
| 颠球 | 无砖块纯颠球连击耐力赛 |
| 贪吃豆 | 迷宫豆子 + 大力丸反杀幽灵 |
| 黑白棋 | 6×6 人机对战（AI 角值贪心） |
| 高山滑雪 | 旗门得分 + 树木避障 |
| 拉霸机 | 3 轮拉霸，三连大奖 |
| 井字棋 | 与 AI 对战五局三胜 |

## 关于"完全复刻"的版权说明

- 落方块、贪吃蛇这类**玩法规则本身不受著作权保护**，任何人都可以实现；
- 受保护的是：**"TETRIS / 俄罗斯方块"商标**、官方的具体美术（Z 型块配色、原版开机画面等）、
  音乐录音和足以造成混淆的整体观感（有判例：Tetris Holding v. Xio Interactive 认定"外观与感觉"属商业外观保护）；
- 本项目的做法是安全的：**自起名称（方块经典/Brick Game，不含 TETRIS 字样）、
  自绘霓虹像素美术、自写芯片音乐音效**，只是玩法相同；
- 如果要公开发布/上架，继续遵守这三条即可：不要在名称和宣传里使用 TETRIS 商标、
  不要搬运官方版本的素材和音乐、不要刻意模仿官方版 UI 造型。

## 超越原机的部分

- **画面**：霓虹像素风、预烘焙发光方块精灵（手机也满帧）、扫描线 + CRT 暗角、
  行消除爆裂粒子、屏幕震动、闪光、浮动连击文字、动态背景。
- **音效**：WebAudio 实时合成的 8bit 芯片音效（移动/旋转/锁定/消行/爆炸/升级…30 余种），
  以及完整双声部（方波主旋律 + 三角波贝斯）芯片音乐：俄罗斯方块 Korobeiniki 主题曲等 5 首。
- **系统**：0–9 速度选择（和原机一样）、每游戏独立最高分存档（localStorage）、
  暂停/结算/新纪录提示、后台自动暂停。
- **手感**：DAS 连发移动、踢墙旋转、软降计分、硬降等现代俄罗斯方块手感。

## 操作

| 平台 | 操作 |
|------|------|
| 桌面 | `←→↓` 移动/软降 · `↑`/`Z` 旋转 · `X` 反转 · `空格` 速降/开火 · `Enter` 暂停/确认 · `Esc` 返回菜单 |
| 手机 | 方向键 + A（旋转/确认）+ B（取消）；屏幕上左右滑动移动、快速下滑速降、轻点旋转；打砖块可直接拖动挡板 |
| 面板 | SOUND 声音开关 · PAUSE 暂停 · RESET 回菜单 |

手机横屏自动切换为左右布局；适配刘海屏安全区，禁止双击缩放误触。

## 目录结构

```
index.html          入口（掌机外壳 + 虚拟按键）
web/                前端根目录
├── css/style.css   掌机造型与手机自适应布局
├── js/font.js      3×5 自研像素字体
├── js/audio.js     WebAudio 音效合成器 + 芯片音乐序列器
├── js/screen.js    渲染引擎（精灵缓存/粒子/震屏/浮字/HUD）
├── js/input.js     键盘 + 虚拟按键 + 触屏手势
├── js/games/*.js   49 款游戏（统一 registerGame 接口）
└── js/main.js      主控：菜单/速度选择/对局/暂停/结算/最高分
server/             Go 静态服务（端口 8908，含匿名统计/赞赏入口）
fnpack/             飞牛 fnOS 安装包模板（manifest + 图标 + 向导）
scripts/            构建/测试脚本
release/<版本>/     发行产物（压缩包 / .fpk / compose / 截图 / 更新日志）
```

新增游戏只需在 `web/js/games/` 下按相同接口（`id/name/icon/start/update/draw`）写一个文件并
在 `web/index.html` 引入即可自动出现在菜单。

## 开发与发版流程

- 版本号以 `VERSION` 文件为唯一来源（`v` 前缀），打包脚本自动同步到产物文件名与飞牛包 manifest；
- 发版步骤：改 `VERSION` + `CHANGELOG.md` → `make build-all && make fnpack` → 提交收录产物 → 打 `v<版本>` tag；
- 同步到 GitHub 开源仓库：在 Gitea 仓库执行 `bash scripts/publish-github.sh --release "发版：v0.1.0"`——GitHub 是对外纯净镜像（与内部仓库无 git 关联），每次发版只落一条以备注开头的快照提交并打 tag，正文写应用更新内容。

## 许可证

[MIT](LICENSE)
