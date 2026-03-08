# 游戏开发与自定义指南

本文档旨在帮助开发者理解如何修改和自定义游戏内的核心参数，包括替换素材、调整怪物数值、修改时间限制等。

## 1. 替换游戏素材

当前游戏中的所有视觉元素（玩家、敌人、子弹等）都是通过 Canvas API 动态绘制的矩形，并未使用任何图片素材。这种方式在原型开发阶段非常高效，但限制了视觉表现力。

要将其替换为图片素材，你需要进行以下改造：

### 1.1. 加载图片资源

在 `GameCanvas.jsx` 的 `useEffect` 初始化钩子中，你需要预先加载所有图片资源。建议创建一个图片管理器来处理加载和存储，确保所有图片在游戏开始前都已准备就绪。

```javascript
// 示例：图片加载器
const imageManager = {
  images: {},
  load(sources) {
    return new Promise(resolve => {
      let loadedCount = 0;
      for (const name in sources) {
        const img = new Image();
        img.src = sources[name];
        img.onload = () => {
          this.images[name] = img;
          loadedCount++;
          if (loadedCount === Object.keys(sources).length) {
            resolve();
          }
        };
      }
    });
  },
  get(name) {
    return this.images[name];
  }
};

// 在 useEffect 中调用
useEffect(() => {
  async function init() {
    await imageManager.load({
      player: 
/path/to/player.png
,
      enemy_mist: 
/path/to/enemy.png

    });
    // ...游戏初始化逻辑
  }
  init();
}, []);
```

### 1.2. 修改渲染函数

将 `renderPlayer`、`renderEnemy` 等函数中的 `ctx.fillRect` 调用替换为 `ctx.drawImage`。

- **原逻辑 (绘制矩形)**

  ```javascript
  function renderPlayer(ctx, player, camX) {
    const sx = player.x - camX;
    const size = 30;
    ctx.fillStyle = 
#4af
;
    ctx.fillRect(sx - size / 2, player.y - size / 2, size, size);
  }
  ```

- **新逻辑 (绘制图片)**

  ```javascript
  function renderPlayer(ctx, player, camX) {
    const img = imageManager.get(
player
);
    if (!img) return;
    const sx = player.x - camX;
    const size = 30;
    ctx.drawImage(img, sx - size / 2, player.y - size / 2, size, size);
  }
  ```

## 2. 怪物生成与数值调整

怪物的生成和数值由三个文件共同控制：

1.  `/src/game/enemy/enemyTypes.js`：定义怪物的**基础数值**。
2.  `/src/game/enemy/enemyFactory.js`：根据基础数值和波次加成，**实例化**一个完整的敌人对象。
3.  `/src/game/config/stages.js`：定义关卡的**波次信息**，包括怪物类型、数量、生成间隔以及各项数值的**加成系数**。

### 2.1. 调整怪物基础数值

打开 `/src/game/enemy/enemyTypes.js`，你可以直接修改或添加新的怪物类型。

```javascript
// src/game/enemy/enemyTypes.js
export const ENEMY_TYPES = {
  mist: {       // 怪物类型ID
    hp: 30,     // 基础HP
    speed: 40,  // 基础移动速度
    size: 18,   // 碰撞体积大小
    baseExp: 20 // 击杀后给予的基础经验值
  },
  // 在此添加新的怪物类型
  tank: {
    hp: 100,
    speed: 25,
    size: 30,
    baseExp: 50
  }
};
```

### 2.2. 控制波次中的怪物

打开 `/src/game/config/stages.js`，你可以精确控制每个波次中出现的怪物类型、数量、生成速度以及在该波次中的强度。

- **最终数值计算公式**：`最终数值 = 基础数值 * hpFactor/speedFactor/expFactor`

```javascript
// src/game/config/stages.js
export const STAGES = [
  {
    id: 
stage-1
,
    duration: 120, // 关卡总时长（当前未使用，由倒计时控制）
    waves: [
      {
        enemyType: 
mist
,       // 使用在 enemyTypes.js 中定义的怪物ID
        count: 60,            // 本波次生成总数
        interval: 1.2,        // 生成间隔（秒）
        hpFactor: 1.0,        // HP加成系数（1.0 = 100%基础HP）
        speedFactor: 1.0,     // 速度加成系数
        expFactor: 1.0        // 经验加成系数
      },
      {
        enemyType: 
tank
,       // 可以混合不同类型的怪物
        count: 20,
        interval: 3.0,
        hpFactor: 2.5,        // 这个波次的 tank 会有 100 * 2.5 = 250 HP
        speedFactor: 0.8,     // 速度降低为 25 * 0.8 = 20
        expFactor: 2.0
      }
    ]
  }
];
```

## 3. 调整时间限制

游戏的时间限制是一个非常容易修改的常量。

打开 `/src/game/canvas/GameCanvas.jsx`，在文件顶部找到 `INITIAL_TIME` 常量，修改其值即可。

```javascript
// src/game/canvas/GameCanvas.jsx

// ...

// 倒计时初始值（秒）
const INITIAL_TIME = 60; // 修改这里的值，例如改为 90

// ...
```

修改后，游戏开始时的倒计时就会变为你设定的新值。
