export const SKILL_CATEGORIES = ["前端", "后端", "产品", "设计", "运营", "安卓", "苹果"];

export const SKILL_DETAILS = {
  "前端": {
    active: true, cd: 20,
    1: { name: "架构初始化", effect: "普攻频率变为20%", desc: "攻速大幅提升" },
    upgrades: {
      basic: [
        { name: "构建优化", effect: "冷却时间-8%", type: "cd", val: 0.08 },
        { name: "热更新", effect: "技能期间暴击率+5%", type: "crit", val: 5 }
      ],
      advanced: [
        { name: "按需加载", effect: "技能期间移速+50%", type: "speed", val: 0.5 },
        { name: "CDN加速", effect: "技能期间全场敌人减速15%", type: "slow", val: 0.15 },
        { name: "Serverless", effect: "转为被动永久生效", type: "passive" }
      ]
    }
  },
  "后端": {
    active: true, cd: 10, duration: 5,
    1: { name: "并发处理", effect: "三列弹幕", desc: "火力覆盖" },
    upgrades: {
      basic: [
        { name: "连接池优化", effect: "冷却时间-8%", type: "cd", val: 0.08 },
        { name: "数据读写", effect: "弹幕伤害+20%", type: "dmg", val: 0.2 }
      ],
      advanced: [
        { name: "负载均衡", effect: "基础伤害-20%，子弹+2", type: "add_bullet" },
        { name: "数据库分片", effect: "基础伤害-40%，贯穿1人", type: "pierce" },
        { name: "分布式集群", effect: "弹幕围绕主角旋转", type: "orbit" }
      ]
    }
  },
  "设计": {
    active: true, cd: 20, duration: 8,
    1: { name: "高保真稿", effect: "普攻必定暴击", desc: "极致输出" },
    upgrades: {
      basic: [
        { name: "间距微调", effect: "冷却时间-8%", type: "cd", val: 0.08 },
        { name: "图层对齐", effect: "持续时间+20%", type: "duration", val: 0.2 }
      ],
      advanced: [
        { name: "重构配色", effect: "冷却+30%，暴伤+50%", type: "crit_dmg" },
        { name: "多端适配", effect: "冷却+25%，主动技能同样生效", type: "skill_crit" },
        { name: "像素完美", effect: "期间无视减伤", type: "ignore_def" }
      ]
    }
  },
  "产品": {
    active: true, cd: 20, duration: 10,
    1: { name: "需求分析", effect: "全屏随机弹幕", desc: "混沌攻击" },
    upgrades: {
      basic: [
        { name: "敏捷开发", effect: "发射间隔-20%", type: "interval", val: 0.2 },
        { name: "PRD修正", effect: "产品技能伤害+20%", type: "skill_dmg", val: 0.2 }
      ],
      advanced: [
        { name: "快速原型", effect: "数量+100%，伤害-30%", type: "double_count" },
        { name: "需求评审", effect: "尺寸+100%，间隔+20%", type: "big_bullet" },
        { name: "一键上线", effect: "一直触发，禁用他技", type: "forever" }
      ]
    }
  },
  "运营": {
    active: true, cd: 30, duration: 10,
    1: { name: "用户增长", effect: "生成同步攻击镜像", desc: "一人成团" },
    upgrades: {
      basic: [
        { name: "流量导入", effect: "冷却时间-8%", type: "cd", val: 0.08 },
        { name: "拉新奖励", effect: "每个镜像加15%伤害", type: "mirror_buff" }
      ],
      advanced: [
        { name: "存量转化", effect: "镜像伤害-10%，数量+1", type: "add_mirror" },
        { name: "私域流量", effect: "持续时间+50%", type: "duration", val: 0.5 },
        { name: "长效运营", effect: "永久存在，伤害变为50%", type: "forever_mirror" }
      ]
    }
  },
  "安卓": {
    active: false,
    1: { name: "碎片化适配", effect: "场上敌越多，攻越高", desc: "遇强则强" },
    upgrades: {
      basic: [
        { name: "内存优化", effect: "单个敌人效果提升", type: "unit_boost" },
        { name: "机型库更新", effect: "技能效果上限增加", type: "cap_boost" }
      ]
    }
  },
  "苹果": {
    active: false,
    1: { name: "封闭沙盒", effect: "杀敌越多，攻击越高", desc: "累积优势" },
    upgrades: {
      basic: [
        { name: "审核通过", effect: "单个效果提升", type: "unit_boost" },
        { name: "生态护城河", effect: "技能效果上限增加", type: "cap_boost" }
      ]
    }
  }
};