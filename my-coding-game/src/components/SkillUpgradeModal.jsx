import React from 'react';
import { useGameStore } from '../store/gameStore';

// 模拟新版技能池数据
const UPGRADE_POOL = [
  { cat: "笔记本电脑", name: "“科学上网”", rarity: "金", desc: "弹幕释放2次，但CD+25%" },
  { cat: "笔记本电脑", name: "机械键盘", rarity: "银", desc: "本技能爆伤+50%" },
  { cat: "AI工具", name: "一键润色", rarity: "金", desc: "额外增加1个镜像，但伤害-10%" },
  { cat: "外卖", name: "急送", rarity: "铜", desc: "本技能伤害+20%" },
  // ... 其他技能数据
];

const SkillUpgradeModal = ({ isOpen, onSelect }) => {
  if (!isOpen) return null;

  const { addSkillUpgrade } = useGameStore();
  
  // 随机抽取 3 个
  const options = React.useMemo(() => {
    return [...UPGRADE_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [isOpen]);

  const rarityColors = {
    "金": "#f1c40f",
    "银": "#bdc3c7",
    "铜": "#cd7f32"
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>GRADE UP! 选择强化</h2>
        <div style={optionsContainerStyle}>
          {options.map((opt, i) => (
            <div 
              key={i} 
              style={{ ...cardStyle, borderColor: rarityColors[opt.rarity] }}
              onClick={() => {
                addSkillUpgrade(opt);
                onSelect();
              }}
            >
              <div style={{ color: rarityColors[opt.rarity], fontSize: '12px' }}>{opt.rarity}级强化</div>
              <h3 style={{ margin: '10px 0' }}>{opt.name}</h3>
              <p style={{ fontSize: '14px', color: '#ccc' }}>{opt.desc}</p>
              <div style={tagStyle}>{opt.cat}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 样式对象
const modalOverlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { width: '90%', maxWidth: '500px', textAlign: 'center' };
const optionsContainerStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardStyle = { backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', border: '2px solid', cursor: 'pointer', transition: 'transform 0.2s', color: '#fff' };
const tagStyle = { display: 'inline-block', marginTop: '10px', padding: '2px 8px', backgroundColor: '#333', borderRadius: '4px', fontSize: '12px' };

export default SkillUpgradeModal;