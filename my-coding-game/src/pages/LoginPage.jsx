import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewLoginPage from '../components/new_repo/LoginPage';

export default function LoginPage() {
  const navigate = useNavigate();
  const [xSize, setXSize] = useState(window.innerWidth);
  const [ySize, setYSize] = useState(window.innerHeight);

  // 模拟 new_repo App.jsx 中的状态设置函数
  const handleSetPage = (page) => {
    if (page === 'Main') navigate('/');
    if (page === 'Register') navigate('/register');
    // 可以根据需要添加更多路由跳转
  };

  return (
    <NewLoginPage 
      Xsize={xSize} 
      Ysize={ySize} 
      setPage={handleSetPage}
      IsLogined={false}
      setStrengthCoin={() => {}}
      setSelectCoin={() => {}}
      setName={() => {}}
      setHeadImage={() => {}}
      setGroup={() => {}}
    />
  );
}
