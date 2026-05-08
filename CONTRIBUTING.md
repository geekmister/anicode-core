# AniCode 贡献指南

欢迎参与 AniCode 项目！本指南将帮助你快速理解项目架构、掌握开发规范，并顺利提交代码。

---

## 目录

1. [项目概述](#1-项目概述)
2. [系统架构](#2-系统架构)
3. [核心模块详解](#3-核心模块详解)
4. [开发规范](#4-开发规范)
5. [环境搭建](#5-环境搭建)
6. [代码开发流程](#6-代码开发流程)
7. [分支管理策略](#7-分支管理策略)
8. [提交代码规范](#8-提交代码规范)
9. [测试指南](#9-测试指南)

---

## 1. 项目概述

### 1.1 项目定位

AniCode 是一个**开放式算法动画组件库**，旨在提供可控制、可扩展、高性能的算法可视化解决方案。

### 1.2 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 核心语言 | TypeScript 5.3+ | 类型安全，现代 ES 特性 |
| 构建工具 | Vite 5.0+ | 极速开发体验，Library 模式构建 |
| 包管理 | pnpm 10.33+ | 高效的 Monorepo 管理 |
| UI 框架 | React 18+ | 核心组件库依赖 |
| Monorepo | pnpm workspace | 多包管理方案 |

### 1.3 项目结构

```
anicode-core/
├── apps/                      # 应用程序
│   └── demo/                  # 演示应用（开发调试用）
│       ├── src/
│       │   ├── App.tsx        # Demo 主组件
│       │   └── main.tsx       # 入口文件
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── packages/                  # 核心包
│   └── core/                  # 算法动画核心库
│       └── src/
│           ├── index.ts              # 库入口，导出所有公共 API
│           ├── types.ts              # 核心类型定义
│           ├── generator.ts          # 生成器类型与工厂
│           ├── BinarySearchGenerator.ts  # 二分查找生成器（示例算法）
│           ├── useAnimation.ts       # 动画状态管理
│           ├── renderer.ts           # Canvas 渲染器
│           ├── BinarySearchVisualizer.tsx  # React 可视化组件
│           └── React/
│               └── index.ts          # React 子模块入口
│
├── package.json               # 根目录 workspace 配置
├── pnpm-workspace.yaml        # pnpm workspace 声明
├── tsconfig.json               # TypeScript 基础配置
└── README.md
```

---

## 2. 系统架构

### 2.1 架构设计理念

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户应用层                                │
│  (React Components: BinarySearchVisualizer, ...)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      动画管理层 (useAnimation)                    │
│  - 播放控制 (play/stop/next/prev)                                │
│  - 状态订阅 (subscribe)                                          │
│  - 速度调节 (setSpeed)                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   算法生成器层 (Generator)                        │
│  - 二分查找: binarySearchSteps()                                 │
│  - 可扩展: 未来支持排序、搜索、图算法等                            │
│  - 输出: Step[] 动画步骤序列                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      渲染层 (renderer)                           │
│  - Canvas 2D 渲染                                                  │
│  - 主题定制 (Theme)                                               │
│  - 尺寸适配 (Dimensions)                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 核心类型定义

**`Step` 接口** - 动画步骤的原子单元：

```typescript
interface Step {
  type: string;        // 步骤类型: 'init' | 'compare' | 'found' | 'not-found'
  data: any;           // 当前数据快照（如数组）
  indices?: number[];  // 涉及的下标（用于高亮）
  codeLine?: number;   // 关联代码行号
  metadata?: Record<string, any>;  // 附加元数据
}
```

**`Theme` 接口** - 可视化主题配置：

```typescript
interface Theme {
  primaryColor: string;    // 默认条形颜色
  compareColor: string;    // 比较中颜色
  swapColor: string;       // 交换操作颜色
  foundColor: string;      // 找到目标颜色
  backgroundColor: string; // 背景色
  textColor: string;       // 文字颜色
  barBorderRadius: number; // 条形圆角
}
```

### 2.3 组件交互关系

```
┌──────────────────┐    generator     ┌───────────────────┐
│ BinarySearch     │ ───────────────▶ │ binarySearchSteps │
│ Visualizer       │                  │    (Generator)    │
└────────┬─────────┘                  └─────────┬─────────┘
         │                                    │
         │ subscribe                          │ yield Step
         │                                    │
         ▼                                    ▼
┌──────────────────┐                  ┌───────────────────┐
│ createAnimation  │ ◀─────────────────│ Step[]            │
│ (useAnimation)   │                  └───────────────────┘
└────────┬─────────┘
         │
         │ drawArray
         ▼
┌──────────────────┐
│ renderer.ts      │
│ (Canvas 2D)      │
└──────────────────┘
```

---

## 3. 核心模块详解

### 3.1 算法生成器 (`BinarySearchGenerator.ts`)

**设计模式**: 生成器模式（Generator Pattern）

**核心函数**: `binarySearchSteps(arr, target)`

**实现逻辑**:

```typescript
function* binarySearchSteps(arr: number[], target: number): Generator<Step> {
  let left = 0;
  let right = arr.length - 1;

  // 1. 初始状态
  yield { type: 'init', data: [...arr], indices: [], metadata: { left, right, target } };

  // 2. 二分循环
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    // 3. 比较中间元素
    yield { type: 'compare', data: [...arr], indices: [mid], metadata: { left, right, mid, target } };

    if (arr[mid] === target) {
      // 4. 找到目标
      yield { type: 'found', data: [...arr], indices: [mid], metadata: { ... } };
      return;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // 5. 未找到
  yield { type: 'not-found', data: [...arr], indices: [], metadata: { ... } };
}
```

**数据流转**:

```
输入数组 [2,5,8,12,16,23,38,56,72,91] + 目标值 38
         │
         ▼
    ┌─────────┐
    │  init   │ left=0, right=9
    └────┬────┘
         │ left=0, right=9, mid=4
         ▼
    ┌──────────┐
    │ compare  │ arr[4]=16 < 38, left=5
    └────┬─────┘
         │ left=5, right=9, mid=7
         ▼
    ┌──────────┐
    │ compare  │ arr[7]=56 > 38, right=6
    └────┬─────┘
         │ left=5, right=6, mid=5
         ▼
    ┌──────────┐
    │  found   │ 找到！arr[5]=38
    └──────────┘
```

### 3.2 动画状态管理 (`useAnimation.ts`)

**核心接口**: `createAnimation(generator)`

**状态模型**:

```typescript
interface AnimationState {
  currentStep: Step | null;  // 当前步骤
  stepIndex: number;         // 步骤索引
  isPlaying: boolean;        // 是否正在播放
  isFinished: boolean;       // 是否已完成
}
```

**暴露方法**:

| 方法 | 功能 | 说明 |
|------|------|------|
| `next()` | 前进一步 | 执行生成器的 next() |
| `prev()` | 后退一步 | 当前简化为 reset |
| `play()` | 自动播放 | 定时器驱动，定时调用 next() |
| `stop()` | 停止播放 | 清除定时器 |
| `setSpeed(ms)` | 设置速度 | 播放间隔（毫秒） |
| `subscribe(fn)` | 订阅状态 | 返回取消订阅函数 |
| `getState()` | 获取状态 | 同步获取当前状态 |

### 3.3 Canvas 渲染器 (`renderer.ts`)

**核心函数**: `drawArray(ctx, step, dimensions, theme)`

**渲染流程**:

```
1. 清空画布 → fillRect(backgroundColor)

2. 计算布局参数
   - barWidth = (width * 0.8) / n
   - startX = (width - barWidth * n) / 2
   - maxVal = Math.max(...arr)
   - baseY = height - 40

3. 遍历数组绘制每个条形
   - 高度: (val / maxVal) * (height - 80)
   - 颜色: 根据 step.type 和 indices 确定
   - 圆角: ctx.roundRect()
   
4. 绘制标签
   - 顶部: 数值
   - 底部: 索引
```

### 3.4 React 组件 (`BinarySearchVisualizer.tsx`)

**组件 Props**:

```typescript
interface Props {
  array: number[];           // 待搜索数组
  target: number;            // 目标值
  width?: number;            // 画布宽度，默认 800
  height?: number;           // 画布高度，默认 300
  theme?: Partial<Theme>;    // 主题覆盖
}
```

**内部状态**:

| 状态 | 类型 | 用途 |
|------|------|------|
| `canvasRef` | RefObject | Canvas DOM 引用 |
| `animRef` | RefObject | 动画实例引用 |
| `tick` | number | 触发重绘的计数器 |

**生命周期**:

```
组件挂载
    │
    ▼
useEffect([array, target])
    │
    ├── 创建 Generator: binarySearchSteps(array, target)
    ├── 创建 Animation: createAnimation(generator)
    ├── 订阅状态变化
    └── 执行 next() 初始化
    │
    ▼
useEffect([tick, width, height])
    │
    └── 获取动画状态 → drawArray() → Canvas 重绘
```

---

## 4. 开发规范

### 4.1 TypeScript 规范

- **严格模式**: 必须启用 `strict: true`
- **类型定义**: 禁止使用 `any`，必须提供完整类型
- **接口 vs 类型别名**: 复杂对象使用 `interface`，简单联合类型使用 `type`
- **导出规范**: 使用命名导出 `export { xxx }` 或 `export function xxx()`

### 4.2 代码风格

- **缩进**: 2 空格
- **引号**: 单引号
- **分号**: 需要
- **命名规范**:
  - 变量/函数: 驼峰命名 `camelCase`
  - 类型/接口: 帕斯卡命名 `PascalCase`
  - 常量: 全大写下划线分隔 `CONSTANT_NAME`

### 4.3 文件组织

| 类型 | 存放位置 | 示例 |
|------|----------|------|
| 核心类型 | `src/types.ts` | `Step`, `Theme` |
| 核心逻辑 | `src/*.ts` | `generator.ts`, `useAnimation.ts` |
| React 组件 | `src/*.tsx` | `BinarySearchVisualizer.tsx` |
| 算法生成器 | `src/*Generator.ts` | `BinarySearchGenerator.ts` |
| 渲染器 | `src/renderer.ts` | Canvas 渲染逻辑 |
| 子模块入口 | `src/React/index.ts` | React 专用导出 |

### 4.4 命名规范

**算法生成器文件命名**:

```
{SortAlgorithm}Generator.ts  →  QuickSortGenerator.ts
{SearchAlgorithm}Generator.ts →  BinarySearchGenerator.ts
{GraphAlgorithm}Generator.ts  →  BFSGenerator.ts
```

**导出函数命名**:

```typescript
// 生成器函数: [algorithm]Steps
export function* binarySearchSteps(...) { }
export function* quickSortSteps(...) { }

// 渲染函数: draw[Target]
export function drawArray(...) { }
export function drawTree(...) { }

// 组件: [Algorithm]Visualizer
export const BinarySearchVisualizer: React.FC<Props> = ...
```

---

## 5. 环境搭建

### 5.1 前置条件

- Node.js >= 18.0.0
- pnpm >= 10.0.0

### 5.2 安装依赖

```bash
# 安装 pnpm（如未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 5.3 开发命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Demo 应用开发服务器 |
| `pnpm build` | 构建核心库到 `dist/` |
| `pnpm lint` | 运行 TypeScript 类型检查 |

---

## 6. 代码开发流程

### 6.1 开发新算法动画

**步骤 1**: 创建算法生成器

```typescript
// packages/core/src/QuickSortGenerator.ts
import { Step } from './types';

export function* quickSortSteps(arr: number[]): Generator<Step, void, unknown> {
  const array = [...arr];
  
  yield { type: 'init', data: [...array], indices: [] };
  
  // 实现快速排序逻辑
  // ...
  
  return array;
}
```

**步骤 2**: 创建 React 可视化组件

```typescript
// packages/core/src/QuickSortVisualizer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { createAnimation } from './useAnimation';
import { drawArray } from './renderer';
import { quickSortSteps } from './QuickSortGenerator';
import { Theme } from './types';

interface Props {
  array: number[];
  width?: number;
  height?: number;
  theme?: Partial<Theme>;
}

export const QuickSortVisualizer: React.FC<Props> = (props) => {
  // 参考 BinarySearchVisualizer 实现
  // ...
};
```

**步骤 3**: 导出新组件

```typescript
// packages/core/src/index.ts
export * from './QuickSortGenerator';
export { QuickSortVisualizer } from './QuickSortVisualizer';
```

### 6.2 开发新渲染器

```typescript
// packages/core/src/TreeRenderer.ts
import { Step, Theme } from './types';

export function drawTree(
  ctx: CanvasRenderingContext2D,
  step: Step,
  dimensions: Dimensions,
  theme: Theme
) {
  // 实现树形结构渲染
  // ...
}
```

---

## 7. 分支管理策略

### 7.1 分支命名规范

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 功能开发 | `feature/[功能名]` | `feature/binary-search` |
| Bug 修复 | `fix/[问题描述]` | `fix/canvas-render-crash` |
| 文档更新 | `docs/[文档类型]` | `docs/contributing-guide` |
| 重构优化 | `refactor/[范围]` | `refactor/animation-api` |

### 7.2 工作流程

```
main (生产分支)
  │
  │  ← 拉取新功能
  │
feature/binary-search
  │
  │  ← 开发 & 测试
  │
  │  ← PR 合并
  ▼
main
```

### 7.3 常用命令

```bash
# 创建功能分支
git checkout -b feature/new-algorithm

# 切换分支
git checkout main

# 拉取最新代码
git pull origin main

# 查看所有分支
git branch -a
```

---

## 8. 提交代码规范

### 8.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 8.2 Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构（既不修复也不加功能） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具变更 |

### 8.3 Scope 范围

| Scope | 说明 |
|-------|------|
| `core` | 核心库逻辑 |
| `generator` | 算法生成器 |
| `renderer` | 渲染器 |
| `component` | React 组件 |
| `demo` | 演示应用 |
| `deps` | 依赖更新 |

### 8.4 提交示例

```bash
# 好的提交
git commit -m "feat(generator): 新增快速排序生成器"
git commit -m "fix(component): 修复画布在高 DPI 设备下模糊问题"
git commit -m "docs: 更新贡献指南中分支命名规范"

# 提交并推送
git commit -m "feat(component): 新增归并排序可视化组件" -m "实现归并排序的步骤生成和树形渲染"

git push origin feature/merge-sort
```

### 8.5 Commitizen 规范提交（推荐）

```bash
# 安装 commitizen
pnpm add -D commitizen cz-conventional-changelog

# 使用交互式提交
git cz
```

---

## 9. 测试指南

### 9.1 手动测试流程

1. 启动开发服务器: `pnpm dev`
2. 在 Demo 应用中测试新功能
3. 测试边界情况:
   - 空数组
   - 单元素数组
   - 已排序/未排序数组
   - 目标值不存在
   - 目标值为首个/末个元素

### 9.2 构建验证

```bash
# 构建核心库
pnpm build

# 类型检查
pnpm lint

# 检查输出
ls packages/core/dist/
```

### 9.3 测试用例场景（建议扩展）

**二分查找测试场景**:

| 场景 | 输入 | 目标值 | 预期结果 |
|------|------|--------|----------|
| 正常查找 | `[1,3,5,7,9]` | 5 | found at 2 |
| 未找到 | `[1,3,5,7,9]` | 4 | not-found |
| 首元素 | `[1,3,5,7,9]` | 1 | found at 0 |
| 末元素 | `[1,3,5,7,9]` | 9 | found at 4 |
| 单元素-找到 | `[5]` | 5 | found at 0 |
| 单元素-未找到 | `[5]` | 3 | not-found |
| 空数组 | `[]` | 5 | not-found |

---

## 附录

### A. 快捷命令参考

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm lint
```

### B. 关键文件路径

```
packages/core/src/index.ts           # 核心库入口
packages/core/src/types.ts           # 类型定义
packages/core/src/BinarySearchGenerator.ts  # 二分查找实现
packages/core/src/BinarySearchVisualizer.tsx # React 组件
packages/core/src/useAnimation.ts    # 动画状态管理
packages/core/src/renderer.ts         # Canvas 渲染
```

### C. 相关资源

- [MDN Canvas 2D](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Vite 构建指南](https://vitejs.dev/guide/build.html)

---

祝你开发愉快！如有问题，请提交 Issue 或联系维护者。
