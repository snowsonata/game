// src/config/skillPool.js
export const SKILL_POOL = {
  /* ================= 笔记本电脑 ================= */
  笔记本电脑: {
    base: {
      cd: 2,
      rows: 1,
      cols: 3,
      multiplier: 3,
      description: '【主动技能】释放时向前方打出1排3个高伤害弹幕，基础伤害倍率250%，CD 2秒'
    },

    bronze: [
      { id: '磁盘清理',   dmgUp: 0.2,      desc: '本技能弹幕伤害 +20%' },
      { id: '校园网',     cdReduce: 0.08,  desc: '本技能冷却时间 -8%' },
      { id: '快捷键',     critRate: 0.08,  desc: '本技能暴击率 +8%' }
    ],
    silver: [
      { id: '固态硬盘',   pierce: 1,                desc: '本技能弹幕穿透敌人数 +1' },
      { id: '机械键盘',   critDmg: 0.5,             desc: '本技能弹幕暴击伤害 +50%' },
      { id: '更新驱动',   secondCastDmg: 0.5,       desc: '第二次释放的弹幕伤害 +50%' }
    ],
    gold: [
      { id: '豪华显示器', pierce: 1,                desc: '本技能弹幕可穿透1名敌人' },
      { id: '低耗模式',   rows: 2, dmgDown: 0.2,   desc: '本技能弹幕变为2排，但基础伤害 -20%' },
      { id: '"科学上网"', doubleCast: true, cdUp: 0.25, desc: '本技能弹幕释放2次，但冷却时间 +25%' }
    ]
  },

  /* ================= 外卖 ================= */
  外卖: {
    base: {
      duration: 5,
      multiplier: 1,
      extraBullets: 2,
      cd: 10,
      description: '【主动技能】持续5秒，在普攻两侧额外发射弹幕（每侧2发），每秒4次，CD 10秒'
    },

    bronze: [
      { id: '满减券',     cdReduce: 0.08,  desc: '本技能冷却时间 -8%' },
      { id: '急送',       dmgUp: 0.2,      desc: '本技能弹幕伤害 +20%' },
      { id: '黑色液体勺', critRate: 0.05,  desc: '本技能暴击率 +5%' }
    ],

    silver: [
      { id: '精准起送',   fireRateUp: 0.2, desc: '本技能弹幕发射频率 +20%' },
      { id: '下饭剧',     durationUp: 8,   desc: '本技能持续时间 +8%' }
    ],

    gold: [
      { id: '外卖柜监控', extraBullets: 2, dmgDown: 0.2, desc: '每次额外发射2发弹幕，但基础伤害 -20%' },
      { id: '轻量化饮食', converge: true,               desc: '本技能弹幕向中心收束，集中打击' },
      { id: '"犒劳"',     extraBullets: 2, cdUp: 0.4,   desc: '每次额外发射2发弹幕，但冷却时间 +40%' },
      { id: '免配送费',   outerRingDmg: 0.5,            desc: '外圈弹幕伤害 +50%' }
    ]
  },

  /* ================= 摸鱼宝典 ================= */
  摸鱼宝典: {
    base: {
      bullets: 5,
      multiplier: 1,
      cd: 3,
      description: '【主动技能】释放时向前方横向打出5发弹幕，CD 3秒'
    },

    bronze: [
      { id: '摸鱼计时',   cdReduce: 0.08,  desc: '本技能冷却时间 -8%' },
      { id: '喝水',       dmgUp: 0.2,      desc: '本技能弹幕伤害 +20%' },
      { id: '快速切屏',   critRate: 0.08,  desc: '本技能暴击率 +8%' }
    ],

    silver: [
      { id: 'ddl',        dmgUp: 0.3,          desc: '枪头（中央）弹幕伤害 +30%' },
      { id: '假装工作',   pierceDmgUp: 0.2,    desc: '穿透时造成的伤害 +20%' }
    ],

    gold: [
      { id: '摸鱼雷达',   rangeUp: 0.3,                desc: '弹幕横向散布范围 +30%' },
      { id: '跑路枪头',   pierce: 1, dmgDown: 0.4,     desc: '枪头弹幕穿透敌人数 +1，但基础伤害 -40%' },
      { id: '厕所遁走',   rangeUp: 0.5, cdUp: 0.3,     desc: '弹幕范围进一步扩大 +50%，但冷却时间 +30%' },
      { id: '消息免打扰', dmgUp: 0.5,                  desc: '枪头弹幕伤害 +50%' }
    ]
  },

  /* ================= 电动车 ================= */
  电动车: {
    base: {
      atkSpeedUp: 1,
      duration: 3,
      cd: 10,
      description: '【主动技能】持续3秒，普攻攻击速度提升100%，CD 10秒'
    },

    bronze: [
      { id: '头盔',   critRate: 0.05,  desc: '技能持续期间暴击率 +5%' },
      { id: '充电器', durationUp: 8,   desc: '本技能持续时间 +8%' },
      { id: '充电桩', cdReduce: 0.08,  desc: '本技能冷却时间 -8%' }
    ],

    silver: [],

    gold: [
      { id: '神奇车牌',   moveSpeedUp: 0.5,  desc: '技能持续期间移动速度 +50%' },
      { id: '武汉交通',   enemySlow: 0.15,   desc: '技能持续期间敌方移动速度 -15%' },
      { id: '识别码',     permanent: true,   desc: '本技能变为常驻效果，不再需要主动释放' }
    ]
  },

  /* ================= AI 工具 ================= */
  AI工具: {
    base: {
      mirror: 1,
      duration: 5,
      cd: 20,
      description: '【主动技能】持续5秒，在主角右侧生成1个AI镜像同步攻击，镜像伤害100%，CD 20秒'
    },

    bronze: [
      { id: '"共创"',     mirrorDmgBuff: 0.15, desc: '技能期间每个镜像为主角提供 +15% 伤害加成' },
      { id: '免费额度',   durationUp: 8,       desc: '本技能持续时间 +8%' },
      { id: '云端同步',   mirrorDmgUp: 0.2,    desc: '镜像造成的伤害 +20%' },
      { id: '提示词优化', cdReduce: 0.08,      desc: '本技能冷却时间 -8%' }
    ],

    silver: [],

    gold: [
      { id: '一键润色',   mirror: 1, mirrorDmgDown: 0.1, desc: '额外增加1个镜像，但所有镜像伤害 -10%' },
      { id: '深度思考',   mirror: 1, cdUp: 0.2,          desc: '额外增加1个镜像，但冷却时间 +20%' }
    ]
  },

  /* ================= 期末周模式 ================= */
  期末周模式: {
    base: {
      duration: 5,
      cd: 15,
      forceCrit: true,
      description: '【主动技能】持续5秒，普攻必定暴击，CD 15秒'
    },

    bronze: [
      { id: '网课',       critDmg: 0.3,    desc: '技能持续期间暴击伤害 +30%' },
      { id: '热带冰红茶', durationUp: 8,   desc: '本技能持续时间 +8%' },
      { id: 'PPT',        cdReduce: 0.08,  desc: '本技能冷却时间 -8%' }
    ],

    silver: [],

    gold: [
      { id: '小抄',       critDmg: 0.5, cdUp: 0.3,          desc: '技能期间暴击伤害 +50%，但冷却时间 +30%' },
      { id: '求捞',       affectOtherSkills: true, cdUp: 0.25, desc: '必定暴击效果同时作用于其他主动技能，但冷却时间 +25%' },
      { id: '历年真题',   ignoreDamageReduce: true,           desc: '技能期间无视敌方减伤效果' }
    ]
  },

  /* ================= 君子六艺 ================= */
  君子六艺: {
    base: {
      randomBullets: 25,
      multiplier: 1,
      duration: 5,
      cd: 10,
      description: '【主动技能】持续5秒，随机向场地内发射25个弹幕，每秒5发，CD 10秒'
    },

    bronze: [
      { id: '急', dmgUp: 0.2,          desc: '本技能弹幕伤害 +20%' },
      { id: '蚌', intervalReduce: 0.2, desc: '本技能弹幕发射间隔 -20%（射速提升）' },
      { id: '典', critRate: 0.05,      desc: '本技能暴击率 +5%' }
    ],

    silver: [],

    gold: [
      { id: '麻', bulletCountUp: 1, dmgDown: 0.3,
        desc: '本技能弹幕数量 +100%（共50发），但基础伤害 -30%' },
      { id: '孝', sizeUp: 0.25, intervalUp: 0.2,
        desc: '本技能弹幕尺寸增大（+25%伤害），但发射间隔增加 +20%' },
      { id: '乐', permanent: true, disableOtherActive: true, activeSkillDmgBuff: 0.05,
        desc: '本技能变为常驻，禁用其他主动技能，但每拥有1个主动技能增伤 +5%' }
    ]
  }
}
