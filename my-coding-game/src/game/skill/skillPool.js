// src/game/skill/skillPool.js
// 技能数据完全按照《局内技能》PDF 还原
// 每个技能的 base 定义基础参数，gold/silver/bronze 定义强化选项

export const SKILL_POOL = {

  /* ===================================================
   * 笔记本电脑
   * 基础：释放技能时向前打出1排3个弹幕，基础倍率300%*(2-3)，基础cd 2s
   * =================================================== */
  笔记本电脑: {
    base: {
      cd: 2,
      rows: 1,
      cols: 3,
      multiplier: 3.0,   // 300% 倍率
      shots: 1,          // 释放次数
      pierce: 0
    },

    gold: [
      {
        id: '豪华显示器',
        desc: '本技能弹幕可以穿透1名敌人',
        pierce: 1
      },
      {
        id: '低耗模式',
        desc: '本技能弹幕变为2排，但基础伤害-20%',
        rows: 2,
        dmgDown: 0.20
      },
      {
        id: '科学上网',
        desc: '本技能弹幕释放2次，但cd+25%',
        shots: 2,
        cdUp: 0.25
      }
    ],

    silver: [
      {
        id: '固态硬盘',
        desc: '本技能弹幕穿透人数+1',
        pierce: 1
      },
      {
        id: '机械键盘',
        desc: '本技能弹幕爆伤+50%',
        critDmg: 0.50
      },
      {
        id: '更新驱动',
        desc: '第二次释放的弹幕伤害+50%',
        secondCastDmg: 0.50
      }
    ],

    bronze: [
      {
        id: '磁盘清理',
        desc: '本技能弹幕伤害+20%',
        dmgUp: 0.20
      },
      {
        id: '校园网',
        desc: '本技能 cd-8%',
        cdReduce: 0.08
      },
      {
        id: '快捷键',
        desc: '本技能暴击率+8%',
        critRate: 0.08
      }
    ]
  },

  /* ===================================================
   * 外卖
   * 基础：释放技能期间在普攻两侧额外发射弹幕，基础倍率100%*2，
   *       持续5秒(共4*5*2=40颗)，cd10秒
   * =================================================== */
  外卖: {
    base: {
      cd: 10,
      duration: 5,
      multiplier: 1.0,
      extraBullets: 2,   // 每次额外发射数量（两侧各1）
      fireRate: 4        // 每秒发射次数
    },

    gold: [
      {
        id: '外卖柜监控',
        desc: '每次额外发射2发弹幕，但基础伤害-20%',
        extraBullets: 2,
        dmgDown: 0.20
      },
      {
        id: '轻量化饮食',
        desc: '本技能弹幕向中心收束',
        converge: true
      },
      {
        id: '犒劳',
        desc: '每次额外发射2发弹幕，但cd+40%',
        extraBullets: 2,
        cdUp: 0.40
      },
      {
        id: '免配送费',
        desc: '外圈弹幕伤害+50%',
        outerRingDmg: 0.50
      }
    ],

    silver: [
      {
        id: '精准起送',
        desc: '本技能弹幕频率+20%',
        fireRateUp: 0.20
      },
      {
        id: '下饭剧',
        desc: '本技能持续+8%',
        durationUp: 0.08
      }
    ],

    bronze: [
      {
        id: '满减券',
        desc: '本技能 cd-8%',
        cdReduce: 0.08
      },
      {
        id: '急送',
        desc: '本技能弹幕伤害+20%',
        dmgUp: 0.20
      },
      {
        id: '黑色液体勺',
        desc: '本技能暴击率+5%',
        critRate: 0.05
      }
    ]
  },

  /* ===================================================
   * 摸鱼宝典
   * 基础：施放技能时向前打出横向共计5发弹幕，基础倍率100%*5，cd3秒
   * =================================================== */
  摸鱼宝典: {
    base: {
      cd: 3,
      bullets: 5,
      multiplier: 1.0,
      pierce: 0,
      spread: 1.0        // 扩散范围倍率
    },

    gold: [
      {
        id: '摸鱼雷达',
        desc: '弹幕范围增加',
        rangeUp: 0.40
      },
      {
        id: '跑路',
        desc: '枪头弹幕穿透人数+1，但基础伤害-40%',
        pierce: 1,
        dmgDown: 0.40
      },
      {
        id: '厕所遁走',
        desc: '弹幕范围进一步增加，但cd+30%',
        rangeUp: 0.60,
        cdUp: 0.30
      },
      {
        id: '消息免打扰',
        desc: '枪头弹幕伤害+50%',
        centerDmgUp: 0.50
      }
    ],

    silver: [
      {
        id: 'ddl',
        desc: '枪头弹幕伤害+30%',
        centerDmgUp: 0.30
      },
      {
        id: '假装工作',
        desc: '穿透伤害+20%',
        pierceDmgUp: 0.20
      }
    ],

    bronze: [
      {
        id: '摸鱼计时',
        desc: '本技能 cd-8%',
        cdReduce: 0.08
      },
      {
        id: '喝水',
        desc: '本技能弹幕伤害+20%',
        dmgUp: 0.20
      },
      {
        id: '快速切屏',
        desc: '本技能暴击率+8%',
        critRate: 0.08
      }
    ]
  },

  /* ===================================================
   * 电动车
   * 基础：施放技能期间普攻速度增加100%，持续3秒，cd10秒
   * =================================================== */
  电动车: {
    base: {
      cd: 10,
      duration: 3,
      atkSpeedUp: 1.0    // 攻速+100%
    },

    gold: [
      {
        id: '神奇车牌',
        desc: '技能期间移速+50%',
        moveSpeedUp: 0.50
      },
      {
        id: '武汉交通',
        desc: '技能期间敌方移速-15%',
        enemySlow: 0.15
      },
      {
        id: '识别码',
        desc: '本技能变为常驻，效果受持续和冷却加成',
        permanent: true
      }
    ],

    silver: [
      {
        id: '头盔',
        desc: '技能期间暴击率+5%',
        critRate: 0.05
      },
      {
        id: '充电器',
        desc: '本技能持续时间+8%',
        durationUp: 0.08
      },
      {
        id: '充电桩',
        desc: '本技能 cd-8%',
        cdReduce: 0.08
      }
    ],

    bronze: []
  },

  /* ===================================================
   * AI工具
   * 基础：技能期间生成1个镜像，同步攻击，持续5秒，cd20秒
   * =================================================== */
  AI工具: {
    base: {
      cd: 20,
      duration: 5,
      mirror: 1          // 镜像数量
    },

    gold: [
      {
        id: '一键润色',
        desc: '额外增加1个镜像，但镜像造成伤害-10%',
        mirror: 1,
        mirrorDmgDown: 0.10
      },
      {
        id: '深度思考',
        desc: '额外增加1个镜像，但cd+20%',
        mirror: 1,
        cdUp: 0.20
      }
    ],

    silver: [],

    bronze: [
      {
        id: '共创',
        desc: '技能期间每个镜像提供15%伤害加成',
        mirrorDmgBuff: 0.15
      },
      {
        id: '免费额度',
        desc: '技能持续时间+8%',
        durationUp: 0.08
      },
      {
        id: '云端同步',
        desc: '镜像造成伤害+20%',
        mirrorDmgUp: 0.20
      },
      {
        id: '提示词优化',
        desc: '技能 cd-8%',
        cdReduce: 0.08
      }
    ]
  },

  /* ===================================================
   * 期末周模式
   * 基础：释放技能期间普攻必定暴击，持续5秒，cd15秒
   * =================================================== */
  期末周模式: {
    base: {
      cd: 15,
      duration: 5,
      forceCrit: true    // 必定暴击
    },

    gold: [
      {
        id: '小抄',
        desc: '技能期间爆伤+50%，但cd+30%',
        critDmg: 0.50,
        cdUp: 0.30
      },
      {
        id: '求捞',
        desc: '效果对其他主动技生效，但cd+25%',
        affectOtherSkills: true,
        cdUp: 0.25
      },
      {
        id: '历年真题',
        desc: '技能期间无视敌方减伤',
        ignoreDamageReduce: true
      }
    ],

    silver: [],

    bronze: [
      {
        id: '网课',
        desc: '技能期间爆伤+30%',
        critDmg: 0.30
      },
      {
        id: '热带冰红茶',
        desc: '本技能持续时间+8%',
        durationUp: 0.08
      },
      {
        id: 'PPT',
        desc: '本技能 cd-8%',
        cdReduce: 0.08
      }
    ]
  },

  /* ===================================================
   * 君子六艺
   * 基础：释放技能期间随机发射25个弹幕，基础倍率100%，持续5秒，cd10s
   * =================================================== */
  君子六艺: {
    base: {
      cd: 10,
      duration: 5,
      randomBullets: 25,
      multiplier: 1.0,
      intervalReduce: 0  // 间隔减少
    },

    gold: [
      {
        id: '麻',
        desc: '本技能弹幕数量+100%，但基础伤害-30%',
        bulletCountUp: 1.0,   // +100% 即翻倍
        dmgDown: 0.30
      },
      {
        id: '孝',
        desc: '本技能弹幕尺寸增大(+25%伤害)，但间隔增加',
        sizeUp: 0.25,
        dmgUp: 0.25,
        intervalUp: 0.20
      },
      {
        id: '乐',
        desc: '本技能弹幕常驻，但禁用其他主动技能，每个主动技增伤5%',
        permanent: true,
        disableOtherActive: true,
        activeSkillDmgBuff: 0.05
      }
    ],

    silver: [],

    bronze: [
      {
        id: '急',
        desc: '本技能弹幕伤害+20%',
        dmgUp: 0.20
      },
      {
        id: '蚌',
        desc: '本技能弹幕间隔-20%',
        intervalReduce: 0.20
      },
      {
        id: '典',
        desc: '本技能弹幕暴击率+5%',
        critRate: 0.05
      }
    ]
  }
}
