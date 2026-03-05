# 游戏修改指南

本文档将详细说明如何对游戏的核心参数进行修改，包括升级经验、怪物属性、刷新频率以及替换游戏素材。所有路径均相对于项目根目录 `/my-coding-game`。

## 1. 修改升级经验曲线

控制角色升级所需经验的逻辑非常集中，方便您调整以设计出更合理的升级曲线。

**关键文件**: `src/store/gameStore.js`

在该文件中，您需要关注 `calcExpMax` 函数。此函数接收当前等级 `level` 作为参数，并返回升至下一级所需的总经验值。

```javascript
// src/store/gameStore.js

function calcExpMax(level) {
  // 当前公式：10 + level^2 * 1.5
  return Math.floor(10 + level * level * 1.5)
}
```

### 修改建议

您可以直接修改此函数中的公式来调整经验曲线。例如：

- **更平缓的曲线 (线性增长)**: `return 100 + level * 50;`
- **更陡峭的曲线 (指数增长)**: `return Math.floor(100 * Math.pow(1.2, level));`
- **阶段式增长**: 
  ```javascript
  if (level < 10) {
    return 100 + level * 20; // 早期快速升级
  } else {
    return 1000 + (level - 10) * 100; // 后期升级变慢
  }
  ```

每次修改后，游戏将自动采用新的经验曲线计算升级门槛。

## 2. 修改怪物数值与刷新频率

怪物的属性和生成方式由两个文件协同控制，分别定义了“怪物模板”和“波次配置”。

### 2.1 修改怪物基础数值

**关键文件**: `src/game/enemy/enemyFactory.js`

此文件顶部的 `ENEMY_BASE_STATS` 对象定义了所有怪物类型的基础属性模板。目前只有一种名为 `mist` 的怪物。

```javascript
// src/game/enemy/enemyFactory.js

const ENEMY_BASE_STATS = {
  mist: {
    hp: 30,    // 基础生命值
    speed: 40, // 基础移动速度
    size: 18   // 基础碰撞体积
  }
}
```

您可以直接修改此处的 `hp`, `speed`, `size` 等值。如果想添加新的怪物类型，只需在此对象中增加一个新的键值对即可，例如：

```javascript
const ENEMY_BASE_STATS = {
  mist: { hp: 30, speed: 40, size: 18 },
  tank: { hp: 100, speed: 20, size: 30 } // 新增 "tank" 类型
}
```

### 2.2 修改怪物刷新频率与波次配置

**关键文件**: `src/game/config/stages.js`

此文件定义了关卡的具体流程，包含多个“波次”（wave）。每个波次对象描述了要生成的怪物类型、数量、生成间隔以及在该波次中对怪物基础属性的加成系数。

```javascript
// src/game/config/stages.js

export const STAGES = [
  {
    id: 'stage-1',
    duration: 120, // 关卡总时长
    waves: [
      {
        enemyType: 'mist',     // 怪物类型 (对应 enemyFactory.js 中的键)
        count: 60,             // 该波次怪物总数
        interval: 1.2,         // 生成间隔（秒），值越小刷新越快
        hpFactor: 1.0,         // 生命值倍率
        speedFactor: 1.0,      // 速度倍率
        expFactor: 1.0         // 击杀经验倍率
      },
      // ... more waves
    ]
  }
]
```

**关键参数说明**: 

| 参数 | 说明 |
| :--- | :--- |
| `enemyType` | 要生成的怪物类型，必须与 `enemyFactory.js` 中定义的类型匹配。 |
| `count` | 这一波次总共要生成的怪物数量。 |
| `interval` | **刷新频率的核心**。代表每隔多少秒生成一个怪物。减小此值会使怪物刷新得更快、更密集。 |
| `hpFactor` | 生命值乘数。最终怪物生命值 = `基础HP * hpFactor`。 |
| `speedFactor` | 速度乘数。最终怪物速度 = `基础速度 * speedFactor`。 |
| `expFactor` | 经验乘数。最终获得经验 = `基础经验 * expFactor`。 |

通过组合修改 `enemyFactory.js` 和 `stages.js`，您可以完全自定义每一关的怪物种类、强度和节奏。

## 3. 替换游戏素材

当前游戏中的角色、敌人和背景都是用 Canvas API 绘制的简单图形。替换为图片素材需要修改渲染逻辑。

### 步骤 1: 存放图片素材

将您的图片资源（如 `player.png`, `enemy.png`, `background.jpg`）放置在 `public/` 目录下。放置在此处的任何文件在项目构建后都会被直接复制到输出目录的根路径，方便直接引用。

例如，您可以在 `public/` 下创建一个 `assets/` 文件夹：

- `public/assets/player.png`
- `public/assets/enemy_type_1.png`
- `public/assets/background_stage_1.jpg`

### 步骤 2: 加载图片

在游戏主画布组件 `src/game/canvas/GameCanvas.jsx` 中，我们需要预加载这些图片。推荐使用 `useEffect` 和 `useRef` 来管理图片对象。

```jsx
// src/game/canvas/GameCanvas.jsx

import { useEffect, useRef } from 'react'
// ...其他 import

// 在组件顶部定义图片路径
const IMAGE_PATHS = {
  player: '/assets/player.png',
  enemy: '/assets/enemy_type_1.png',
  background: '/assets/background_stage_1.jpg'
}

export default function GameCanvas() {
  // ...其他 hooks
  const imagesRef = useRef({})

  // 新增 useEffect 用于加载图片
  useEffect(() => {
    let loadedCount = 0
    const totalImages = Object.keys(IMAGE_PATHS).length

    for (const [key, src] of Object.entries(IMAGE_PATHS)) {
      const img = new Image()
      img.src = src
      img.onload = () => {
        imagesRef.current[key] = img
        loadedCount++
        if (loadedCount === totalImages) {
          console.log('All images loaded')
          // 可在此处触发游戏开始逻辑
        }
      }
    }
  }, [])

  // ...组件剩余部分
}
```

### 步骤 3: 修改渲染函数

接下来，需要修改各个渲染函数，将 `fillRect` (绘制矩形) 调用替换为 `drawImage` (绘制图片)。

#### 替换玩家贴图

**关键文件**: `src/game/render/renderPlayer.js` (如果代码已模块化) 或 `src/game/canvas/GameCanvas.jsx` 中的 `render` 函数。

假设在 `GameCanvas.jsx` 中修改：

```javascript
// 在 render 函数内部

/* 玩家 */
const playerImg = imagesRef.current.player
if (playerImg) {
  const playerSize = 30 // 图片显示尺寸
  ctx.drawImage(
    playerImg,
    player.x - playerSize / 2, // 居中绘制
    player.y - playerSize / 2,
    playerSize,
    playerSize
  )
} else {
  // 图片未加载完成时的后备方案
  ctx.fillStyle = '#4af'
  ctx.fillRect(player.x - 15, player.y - 15, 30, 30)
}
```

#### 替换敌人贴图

**关键文件**: `src/game/render/renderEnemies.js` 或 `GameCanvas.jsx`。

```javascript
// 在 render 函数的敌人循环中

enemies.forEach(e => {
  const enemyImg = imagesRef.current.enemy
  const size = e.size * e.scale

  if (enemyImg) {
    ctx.drawImage(enemyImg, e.x - size / 2, e.y - size / 2, size, size)
  } else {
    ctx.fillStyle = 'red'
    ctx.fillRect(e.x - size / 2, e.y - size / 2, size, size)
  }

  // 血条渲染逻辑保持不变
  // ...
})
```

#### 替换战斗背景

**关键文件**: `src/game/render/renderBackground.js` 或 `GameCanvas.jsx`。

```javascript
// 在 render 函数的开头

/* 背景 */
const backgroundImg = imagesRef.current.background
if (backgroundImg) {
  ctx.drawImage(backgroundImg, 0, 0, WIDTH, HEIGHT)
} else {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
}
```

通过以上步骤，您就可以成功将游戏内的素材替换为您自己的图片资源，实现视觉上的完全定制。
