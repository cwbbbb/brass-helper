# 伯明翰小助手 · Brass: Birmingham Helper

《黄铜：伯明翰》(Brass: Birmingham) 桌游的手机端记分助手网页版。帮助玩家在游戏中快速计算花费、决定顺位、管理收入与贷款，单屏即可完成所有操作。

在线体验：<https://cwbbbb.github.io/brass-helper/>

## 功能

### 开局设置

- 支持 2 / 3 / 4 人游戏，四色可选（红 / 黄 / 紫 / 白）
- 一键随机分配顺位
- 初始资金预设：$17 或 $30 一键应用，也可逐人微调

### 游戏主页

- **顺位机制**：回合内花费越少越靠前，结束回合时按花费升序稳定排序重排顺位，直观快速决定下一回合行动顺序
- **花费管理**：每张玩家卡片配备 `−5 / −1 / +1 / +5` 快捷按钮，花费数字超大亮红高亮，扣减不超过现有资金、回补不多补
- **金钱调整**：点击金钱数字弹出全屏调整面板，售卖铁煤等直接获得金钱在此加减，支持 `±1 / ±5 / ±10 / +20 / +30` 快捷档位
- **收入轨**：支持长按连续增减，可为负数，轨道可视化正负双向显示
- **贷款**：单击「贷」按钮收入轨 −3、金钱 +$30；长按撤回贷款
- **回合控制**：底部固定操作栏「结束回合」（带确认）/「回滚上一回合」（2 步快照撤销）

### 数据持久化

游戏状态自动保存到 localStorage，刷新页面不丢失进度。

## 技术栈

- **React 18** + **TypeScript**
- **Vite 6** 构建工具
- **Tailwind CSS** 样式
- **Zustand** 状态管理
- **lucide-react** 图标

## 本地开发

```bash
npm install
npm run dev      # 启动开发服务器
npm run build    # 生产构建，产物输出到 dist/
npm run preview  # 本地预览生产构建
npm run check    # TypeScript 类型检查
```

## 部署

项目部署在 GitHub Pages，静态产物托管在仓库的 `gh-pages` 分支。

由于部署在子路径 `/brass-helper/` 下，[vite.config.ts](vite.config.ts) 已配置 `base: '/brass-helper/'`。重新部署步骤：

```bash
npm run build
# 将 dist/ 目录内容推送到 gh-pages 分支
```

## 目录结构

```
src/
├── components/       # 组件
│   ├── PlayerCard.tsx     # 玩家卡片（花费/金钱/收入/贷款/弹窗）
│   └── StepperButton.tsx  # 可复用步进按钮（支持长按连续触发）
├── hooks/
│   └── useLongPressRepeat.ts  # 长按重复触发 hook
├── lib/
│   ├── game.ts            # 游戏常量、玩家颜色、顺位计算
│   └── utils.ts           # 工具函数
├── pages/
│   ├── SetupPage.tsx      # 开局设置页
│   └── GamePage.tsx       # 游戏主页
├── store/
│   └── gameStore.ts       # Zustand 状态：玩家、花费、收入、贷款、快照撤销
├── App.tsx
└── main.tsx
```
