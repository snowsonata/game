// src/game/skill/skillDefinitions.js
// 技能定义完全按照《局内技能》PDF 还原
// 稀有度：金(gold) > 银(silver) > 铜(bronze)

export const SKILLS = {

  /* ===================================================
   * 笔记本电脑
   * 基础：释放技能时向前打出1排3个弹幕，基础倍率300%*(2-3)，基础cd 2s
   * =================================================== */
  laptop: {
    id: 'laptop',
    name: '笔记本电脑',
    category: '笔记本电脑',
    type: 'active',
    cd: 2,
    duration: 0,
    description: '释放技能时向前打出1排3个弹幕，基础倍率300%',

    baseEffect: {
      pattern: 'line',
      bulletCount: 3,
      rows: 1,
      shots: 1,
      damageMultiplier: 3.0,
      pierce: 0,
      critRate: 0,
      critDamage: 0,
      secondCastDmg: 0
    },

    upgrades: {
      gold: [
        {
          id: 'laptop_luxury_display',
          name: '豪华显示器',
          tier: 'gold',
          description: '本技能弹幕可以穿透1名敌人',
          effect: { pierce: 1 }
        },
        {
          id: 'laptop_low_power',
          name: '低耗模式',
          tier: 'gold',
          description: '本技能弹幕变为2排，但基础伤害-20%',
          effect: { rows: 2, damageMultiplier: -0.20 }
        },
        {
          id: 'laptop_vpn',
          name: '"科学上网"',
          tier: 'gold',
          description: '本技能弹幕释放2次，但cd+25%',
          effect: { shots: 2, cdIncrease: 0.25 }
        }
      ],
      silver: [
        {
          id: 'laptop_ssd',
          name: '固态硬盘',
          tier: 'silver',
          description: '本技能弹幕穿透人数+1',
          effect: { pierce: 1 }
        },
        {
          id: 'laptop_keyboard',
          name: '机械键盘',
          tier: 'silver',
          description: '本技能弹幕爆伤+50%',
          effect: { critDamage: 0.50 }
        },
        {
          id: 'laptop_driver',
          name: '更新驱动',
          tier: 'silver',
          description: '第二次释放的弹幕伤害+50%',
          effect: { secondCastDmg: 0.50 }
        }
      ],
      bronze: [
        {
          id: 'laptop_disk_clean',
          name: '磁盘清理',
          tier: 'bronze',
          description: '本技能弹幕伤害+20%',
          effect: { damageMultiplier: 0.20 }
        },
        {
          id: 'laptop_campus_net',
          name: '校园网',
          tier: 'bronze',
          description: '本技能 cd-8%',
          effect: { cdReduce: 0.08 }
        },
        {
          id: 'laptop_shortcut',
          name: '快捷键',
          tier: 'bronze',
          description: '本技能暴击率+8%',
          effect: { critRate: 0.08 }
        }
      ]
    }
  },

  /* ===================================================
   * 外卖
   * 基础：释放技能期间在普攻两侧额外发射弹幕，基础倍率100%*2，
   *       持续5秒(共4*5*2=40颗)，cd10秒
   * =================================================== */
  takeout: {
    id: 'takeout',
    name: '外卖',
    category: '外卖',
    type: 'active',
    cd: 10,
    duration: 5,
    description: '技能期间在普攻两侧额外发射弹幕，基础倍率100%*2，持续5秒',

    baseEffect: {
      pattern: 'side',
      bulletPerSide: 1,
      frequency: 4,
      damageMultiplier: 1.0,
      converge: false,
      outerDamageBonus: 0,
      frequencyBonus: 0
    },

    upgrades: {
      gold: [
        {
          id: 'takeout_cabinet',
          name: '外卖柜监控',
          tier: 'gold',
          description: '每次额外发射2发弹幕，但基础伤害-20%',
          effect: { bulletPerSide: 2, damageMultiplier: -0.20 }
        },
        {
          id: 'takeout_light',
          name: '轻量化饮食',
          tier: 'gold',
          description: '本技能弹幕向中心收束',
          effect: { converge: true }
        },
        {
          id: 'takeout_reward',
          name: '"犒劳"',
          tier: 'gold',
          description: '每次额外发射2发弹幕，但cd+40%',
          effect: { bulletPerSide: 2, cdIncrease: 0.40 }
        },
        {
          id: 'takeout_free_delivery',
          name: '免配送费',
          tier: 'gold',
          description: '外圈弹幕伤害+50%',
          effect: { outerDamageBonus: 0.50 }
        }
      ],
      silver: [
        {
          id: 'takeout_precise',
          name: '精准起送',
          tier: 'silver',
          description: '本技能弹幕频率+20%',
          effect: { frequencyBonus: 0.20 }
        },
        {
          id: 'takeout_drama',
          name: '下饭剧',
          tier: 'silver',
          description: '本技能持续+8%',
          effect: { durationIncrease: 0.08 }
        }
      ],
      bronze: [
        {
          id: 'takeout_discount',
          name: '满减券',
          tier: 'bronze',
          description: '本技能 cd-8%',
          effect: { cdReduce: 0.08 }
        },
        {
          id: 'takeout_express',
          name: '急送',
          tier: 'bronze',
          description: '本技能弹幕伤害+20%',
          effect: { damageMultiplier: 0.20 }
        },
        {
          id: 'takeout_cola',
          name: '黑色液体勺',
          tier: 'bronze',
          description: '本技能暴击率+5%',
          effect: { critRate: 0.05 }
        }
      ]
    }
  },

  /* ===================================================
   * 摸鱼宝典
   * 基础：施放技能时向前打出横向共计5发弹幕，基础倍率100%*5，cd3秒
   * =================================================== */
  fish: {
    id: 'fish',
    name: '摸鱼宝典',
    category: '摸鱼宝典',
    type: 'active',
    cd: 3,
    duration: 0,
    description: '施放技能时向前打出横向共计5发弹幕，基础倍率100%*5',

    baseEffect: {
      pattern: 'horizontal',
      bulletCount: 5,
      damageMultiplier: 1.0,
      spread: 1.0,
      pierce: 0,
      centerDamageBonus: 0,
      pierceDamageBonus: 0
    },

    upgrades: {
      gold: [
        {
          id: 'fish_radar',
          name: '摸鱼雷达',
          tier: 'gold',
          description: '弹幕范围增加',
          effect: { spread: 0.40 }
        },
        {
          id: 'fish_run',
          name: '跑路',
          tier: 'gold',
          description: '枪头弹幕穿透人数+1，但基础伤害-40%',
          effect: { pierce: 1, damageMultiplier: -0.40 }
        },
        {
          id: 'fish_toilet',
          name: '厕所遁走',
          tier: 'gold',
          description: '弹幕范围进一步增加，但cd+30%',
          effect: { spread: 0.60, cdIncrease: 0.30 }
        },
        {
          id: 'fish_mute',
          name: '消息免打扰',
          tier: 'gold',
          description: '枪头弹幕伤害+50%',
          effect: { centerDamageBonus: 0.50 }
        }
      ],
      silver: [
        {
          id: 'fish_ddl',
          name: 'ddl',
          tier: 'silver',
          description: '枪头弹幕伤害+30%',
          effect: { centerDamageBonus: 0.30 }
        },
        {
          id: 'fish_pretend',
          name: '假装工作',
          tier: 'silver',
          description: '穿透伤害+20%',
          effect: { pierceDamageBonus: 0.20 }
        }
      ],
      bronze: [
        {
          id: 'fish_timer',
          name: '摸鱼计时',
          tier: 'bronze',
          description: '本技能 cd-8%',
          effect: { cdReduce: 0.08 }
        },
        {
          id: 'fish_water',
          name: '喝水',
          tier: 'bronze',
          description: '本技能弹幕伤害+20%',
          effect: { damageMultiplier: 0.20 }
        },
        {
          id: 'fish_switch',
          name: '快速切屏',
          tier: 'bronze',
          description: '本技能暴击率+8%',
          effect: { critRate: 0.08 }
        }
      ]
    }
  },

  /* ===================================================
   * 电动车
   * 基础：施放技能期间普攻速度增加100%，持续3秒，cd10秒
   * =================================================== */
  ebike: {
    id: 'ebike',
    name: '电动车',
    category: '电动车',
    type: 'active',
    cd: 10,
    duration: 3,
    description: '施放技能期间普攻速度增加100%，持续3秒',

    baseEffect: {
      attackSpeedBonus: 1.0,
      moveSpeedBonus: 0,
      enemySlow: 0,
      permanent: false,
      critRate: 0
    },

    upgrades: {
      gold: [
        {
          id: 'ebike_plate',
          name: '神奇车牌',
          tier: 'gold',
          description: '技能期间移速+50%',
          effect: { moveSpeedBonus: 0.50 }
        },
        {
          id: 'ebike_traffic',
          name: '武汉交通',
          tier: 'gold',
          description: '技能期间敌方移速-15%',
          effect: { enemySlow: 0.15 }
        },
        {
          id: 'ebike_id',
          name: '识别码',
          tier: 'gold',
          description: '本技能变为常驻，效果受持续和冷却加成',
          effect: { permanent: true }
        }
      ],
      silver: [
        {
          id: 'ebike_helmet',
          name: '头盔',
          tier: 'silver',
          description: '技能期间暴击率+5%',
          effect: { critRate: 0.05 }
        },
        {
          id: 'ebike_charger',
          name: '充电器',
          tier: 'silver',
          description: '本技能持续时间+8%',
          effect: { durationIncrease: 0.08 }
        },
        {
          id: 'ebike_station',
          name: '充电桩',
          tier: 'silver',
          description: '本技能 cd-8%',
          effect: { cdReduce: 0.08 }
        }
      ],
      bronze: []
    }
  },

  /* ===================================================
   * AI工具
   * 基础：技能期间生成1个镜像，同步攻击，持续5秒，cd20秒
   * =================================================== */
  ai_tool: {
    id: 'ai_tool',
    name: 'AI工具',
    category: 'AI工具',
    type: 'active',
    cd: 20,
    duration: 5,
    description: '技能期间生成1个镜像，同步攻击，持续5秒',

    baseEffect: {
      mirrorCount: 1,
      mirrorDamageBonus: 0,
      mirrorDamageDown: 0
    },

    upgrades: {
      gold: [
        {
          id: 'ai_polish',
          name: '一键润色',
          tier: 'gold',
          description: '额外增加1个镜像，但镜像造成伤害-10%',
          effect: { mirrorCount: 1, mirrorDamageDown: 0.10 }
        },
        {
          id: 'ai_deep_think',
          name: '深度思考',
          tier: 'gold',
          description: '额外增加1个镜像，但cd+20%',
          effect: { mirrorCount: 1, cdIncrease: 0.20 }
        }
      ],
      silver: [],
      bronze: [
        {
          id: 'ai_cocreate',
          name: '"共创"',
          tier: 'bronze',
          description: '技能期间每个镜像提供15%伤害加成',
          effect: { mirrorDamageBonus: 0.15 }
        },
        {
          id: 'ai_free',
          name: '免费额度',
          tier: 'bronze',
          description: '技能持续时间+8%',
          effect: { durationIncrease: 0.08 }
        },
        {
          id: 'ai_sync',
          name: '云端同步',
          tier: 'bronze',
          description: '镜像造成伤害+20%',
          effect: { mirrorDamageBonus: 0.20 }
        },
        {
          id: 'ai_prompt',
          name: '提示词优化',
          tier: 'bronze',
          description: '技能 cd-8%',
          effect: { cdReduce: 0.08 }
        }
      ]
    }
  },

  /* ===================================================
   * 期末周模式
   * 基础：释放技能期间普攻必定暴击，持续5秒，cd15秒
   * =================================================== */
  exam_mode: {
    id: 'exam_mode',
    name: '期末周模式',
    category: '期末周模式',
    type: 'active',
    cd: 15,
    duration: 5,
    description: '释放技能期间普攻必定暴击，持续5秒',

    baseEffect: {
      guaranteedCrit: true,
      critDamageBonus: 0,
      affectOtherSkills: false,
      ignoreDamageReduce: false
    },

    upgrades: {
      gold: [
        {
          id: 'exam_cheatsheet',
          name: '小抄',
          tier: 'gold',
          description: '技能期间爆伤+50%，但cd+30%',
          effect: { critDamageBonus: 0.50, cdIncrease: 0.30 }
        },
        {
          id: 'exam_beg',
          name: '求捞',
          tier: 'gold',
          description: '效果对其他主动技生效，但cd+25%',
          effect: { affectOtherSkills: true, cdIncrease: 0.25 }
        },
        {
          id: 'exam_past_paper',
          name: '历年真题',
          tier: 'gold',
          description: '技能期间无视敌方减伤',
          effect: { ignoreDamageReduce: true }
        }
      ],
      silver: [],
      bronze: [
        {
          id: 'exam_online',
          name: '网课',
          tier: 'bronze',
          description: '技能期间爆伤+30%',
          effect: { critDamageBonus: 0.30 }
        },
        {
          id: 'exam_tea',
          name: '热带冰红茶',
          tier: 'bronze',
          description: '本技能持续时间+8%',
          effect: { durationIncrease: 0.08 }
        },
        {
          id: 'exam_ppt',
          name: 'PPT',
          tier: 'bronze',
          description: '本技能 cd-8%',
          effect: { cdReduce: 0.08 }
        }
      ]
    }
  },

  /* ===================================================
   * 君子六艺
   * 基础：释放技能期间随机发射25个弹幕，基础倍率100%，持续5秒，cd10s
   * =================================================== */
  six_arts: {
    id: 'six_arts',
    name: '君子六艺',
    category: '君子六艺',
    type: 'active',
    cd: 10,
    duration: 5,
    description: '释放技能期间随机发射25个弹幕，基础倍率100%，持续5秒',

    baseEffect: {
      pattern: 'random',
      bulletCount: 25,
      damageMultiplier: 1.0,
      frequency: 5,
      bulletSize: 1.0,
      permanent: false,
      disableOtherActive: false,
      intervalReduce: 0,
      critRate: 0
    },

    upgrades: {
      gold: [
        {
          id: 'six_hemp',
          name: '麻',
          tier: 'gold',
          description: '本技能弹幕数量+100%，但基础伤害-30%',
          effect: { bulletCount: 25, damageMultiplier: -0.30 }
        },
        {
          id: 'six_filial',
          name: '孝',
          tier: 'gold',
          description: '本技能弹幕尺寸增大(+25%伤害)，但间隔增加',
          effect: { bulletSize: 0.25, damageMultiplier: 0.25, frequency: -0.20 }
        },
        {
          id: 'six_music',
          name: '乐',
          tier: 'gold',
          description: '本技能弹幕常驻，但禁用其他主动技能，每个主动技增伤5%',
          effect: { permanent: true, disableOtherActive: true, activeSkillDmgBuff: 0.05 }
        }
      ],
      silver: [],
      bronze: [
        {
          id: 'six_urgent',
          name: '急',
          tier: 'bronze',
          description: '本技能弹幕伤害+20%',
          effect: { damageMultiplier: 0.20 }
        },
        {
          id: 'six_clam',
          name: '蚌',
          tier: 'bronze',
          description: '本技能弹幕间隔-20%',
          effect: { intervalReduce: 0.20 }
        },
        {
          id: 'six_classic',
          name: '典',
          tier: 'bronze',
          description: '本技能弹幕暴击率+5%',
          effect: { critRate: 0.05 }
        }
      ]
    }
  }
}

/* ===================================================
 * 辅助函数
 * =================================================== */

export function getSkillDefinition(skillId) {
  return SKILLS[skillId] || null
}

export function getAllSkillIds() {
  return Object.keys(SKILLS)
}

export function getSkillIdByCategory(category) {
  for (const [id, skill] of Object.entries(SKILLS)) {
    if (skill.category === category) return id
  }
  return null
}
