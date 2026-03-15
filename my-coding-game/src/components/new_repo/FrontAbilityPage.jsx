import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

import Container from "./Container.jsx"

function FrontAbilityPage({Xsize, Ysize, setPage, setStrengthCoin, setSelectCoin, setName, setHeadImage}) {
  
  class SkillNode {
    constructor(id, name, description, effects, position, children = [], requiredLevel = 1) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.effects = effects; // 技能效果，如 { damage: 10, mana: 5 }
      this.position = position; // 在画布上的位置 { x, y }
      this.children = children; // 子技能
      this.isUnlocked = false;
      this.requiredLevel = requiredLevel;
    }
  }

  // 构建技能树
  const createSkillTree = () => {
    // 先创建所有节点
    const meteor = new SkillNode(
      'meteor',
      '陨石术',
      '召唤陨石造成范围伤害',
      { damage: 50, aoeRadius: 100, manaCost: 30 },
      { x: 100, y: 150 },
      [], // 无子技能
      5
    );
    
    const blizzard = new SkillNode(
      'blizzard',
      '暴风雪',
      '持续范围伤害并减速',
      { damagePerSecond: 15, slowEffect: 0.5, manaCost: 25 },
      { x: 300, y: 150 },
      [], // 无子技能
      5
    );

    // 基础技能
    const fireball = new SkillNode(
      'fireball',
      '火球术',
      '发射一枚火球造成伤害',
      { damage: 20, manaCost: 10 },
      { x: 100, y: 0 },
      [meteor, blizzard], // 子技能
      1
    );
    
    const iceShard = new SkillNode(
      'iceshard',
      '冰锥术',
      '发射冰锥并减速敌人',
      { damage: 15, slowEffect: 0.3, manaCost: 12 },
      { x: 300, y: 0 },
      [blizzard], // 子技能
      1
    );
    
    return { fireball, iceShard, meteor, blizzard };
  };

  const SkillTree = () => {
    const [skillTree] = useState(createSkillTree());
    const [skillPoints, setSkillPoints] = useState(5);
    const [unlockedSkills, setUnlockedSkills] = useState(new Set());

    // 获取技能的所有父节点
    const getParentSkills = (skillId) => {
      const parents = [];
      
      // 遍历整个技能树查找父技能
      Object.values(skillTree).forEach(node => {
        if (node.children.some(child => child.id === skillId)) {
          parents.push(node);
        }
      });
      
      return parents;
    };

    // 检查父技能是否都已解锁
    const checkParentsUnlocked = (skillNode) => {
      const parents = getParentSkills(skillNode.id);
      
      // 如果没有父节点（根技能），可以直接解锁
      if (parents.length === 0) return true;
      
      // 检查所有父节点是否都已解锁
      return parents.every(parent => unlockedSkills.has(parent.id));
    };

    // 检查是否可以解锁技能
    const canUnlockSkill = (skillNode) => {
      // 如果已经解锁，不能再解锁
      if (unlockedSkills.has(skillNode.id)) return false;
      
      // 检查父技能是否都已解锁
      const parentsUnlocked = checkParentsUnlocked(skillNode);
      
      return parentsUnlocked && skillPoints > 0;
    };

    // 解锁技能
    const unlockSkill = (skillNode) => {
      if (canUnlockSkill(skillNode)) {
        setUnlockedSkills(prev => new Set([...prev, skillNode.id]));
        setSkillPoints(prev => prev - 1);
        toast.success(`解锁技能: ${skillNode.name}`);
      } else {
        if (!checkParentsUnlocked(skillNode)) {
          toast.error('需要先解锁所有前置技能！');
        } else if (skillPoints <= 0) {
          toast.error('技能点不足！');
        }
      }
    };

    // 渲染连接线
    const renderConnections = () => {
      const lines = [];
      
      Object.values(skillTree).forEach(parentNode => {
        parentNode.children.forEach(childNode => {
          lines.push(
            <line
              key={`${parentNode.id}-${childNode.id}`}
              x1={parentNode.position.x + 35} 
              y1={parentNode.position.y + 25} 
              x2={childNode.position.x + 35} 
              y2={childNode.position.y + 25} 
              stroke={unlockedSkills.has(childNode.id) ? "#4CAF50" : "#666"}
              strokeWidth={unlockedSkills.has(childNode.id) ? "3" : "2"}
              strokeDasharray={unlockedSkills.has(childNode.id) ? "none" : "5,5"}
            />
          );
        });
      });
      
      return lines;
    };

    // 渲染技能节点
    const renderSkillNode = (node) => {
      const isUnlocked = unlockedSkills.has(node.id);
      const canUnlock = canUnlockSkill(node);
      const parents = getParentSkills(node.id);

      // 计算节点状态样式
      let backgroundColor = '#F44336'; // 默认红色（不可解锁）
      if (isUnlocked) {
        backgroundColor = '#4CAF50'; // 绿色（已解锁）
      } else if (canUnlock) {
        backgroundColor = '#FFC107'; // 黄色（可解锁）
      }

      // 构建状态文本
      let statusText = '';
      if (!isUnlocked && !canUnlock && parents.length > 0) {
        const lockedParents = parents
          .filter(p => !unlockedSkills.has(p.id))
          .map(p => p.name)
          .join('、');
        statusText = `需要先解锁: ${lockedParents}`;
      }

      return (
        <div
          key={node.id}
          className={`skill-node ${isUnlocked ? 'unlocked' : ''} ${canUnlock ? 'available' : ''}`}
          style={{
            position: 'absolute',
            left: node.position.x,
            top: node.position.y,
            padding: '10px',
            border: '2px solid #fff',
            borderRadius: '8px',
            backgroundColor: backgroundColor,
            cursor: canUnlock ? 'pointer' : 'default',
            width: '70px',
            textAlign: 'center',
            height: '70px',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: isUnlocked ? '0 0 15px #4CAF50' : 'none',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onClick={() => unlockSkill(node)}
          title={statusText || node.description}
        >
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>{node.name}</div>
          {isUnlocked && <div style={{ fontSize: '12px' }}>✓</div>}
          {!isUnlocked && canUnlock && <div style={{ fontSize: '12px' }}>点击解锁</div>}
        </div>
      );
    };

    return (
      <div className="skill-tree-container" style={{ 
        position: 'relative', 
        width: '600px', 
        height: '500px',
        backgroundColor: '#1a1a1a',
        borderRadius: '10px',
        padding: '20px'
      }}>
        <div className="skill-points" style={{
          color: 'white',
          fontSize: '18px',
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#333',
          borderRadius: '5px'
        }}>
          可用技能点: {skillPoints}
        </div>
        
        {/* 渲染连接线 */}
        <svg className="connections" style={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          width: '100%', 
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          {renderConnections()}
        </svg>

        {/* 渲染技能节点 */}
        {Object.values(skillTree).map(skillNode => renderSkillNode(skillNode))}
      </div>
    );
  };

  return (
    <Container Xsize={Xsize} Ysize={Ysize}>
      <Toaster position="top-center" />
      <SkillTree />
      <div 
        onClick={() => setPage("Ability")} 
        style={{
          color: "white",
          position: "absolute",
          top: "10%",
          left: "10%",
          transform: "translate(-50%,-50%)",
          cursor: "pointer",
          padding: "10px 20px",
          backgroundColor: "#333",
          borderRadius: "5px"
        }}
      >
        返回
      </div>
    </Container>
  );
}

export default FrontAbilityPage;