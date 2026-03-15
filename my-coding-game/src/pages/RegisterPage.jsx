import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewRegisterPage from '../components/new_repo/RegisterPage_new';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [xSize, setXSize] = useState(window.innerWidth);
  const [ySize, setYSize] = useState(window.innerHeight);

  const handleSetPage = (page) => {
    if (page === 'Login') navigate('/login');
    if (page === 'Verify') navigate('/'); // 注册成功后跳转首页或特定页面
  };

  return (
    <NewRegisterPage 
      Xsize={xSize} 
      Ysize={ySize} 
      setPage={handleSetPage}
      setStrengthCoin={() => {}}
      setSelectCoin={() => {}}
      setName={() => {}}
      setHeadImage={() => {}}
    />
  );
}
