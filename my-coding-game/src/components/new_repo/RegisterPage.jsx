import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './RegisterPage.css';
const RegisterPage = ({ Xsize, Ysize, setPage, setStrengthCoin, setSelectCoin, setName, setHeadImage }) => {
  // 状态管理
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // API 配置 - 使用相同的后端网址
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://firechickenmp4.top';
  const REGISTER_ENDPOINT = 'api/auth/register';

  // 处理注册
  const handleRegister = async (e) => {
    e?.preventDefault();
    
    // 表单验证
    if (!username.trim()) {
      toast.error('请输入用户名');
      return;
    }
    
    // 用户名长度检查（可根据需要调整）
    if (username.trim().length < 3 || username.trim().length > 20) {
      toast.error('用户名长度应在3-20个字符之间');
      return;
    }
    
    if (!password.trim()) {
      toast.error('请输入密码');
      return;
    }
    
    // 密码强度检查（可根据需要调整）
    if (password.trim().length < 6) {
      toast.error('密码长度至少6位');
      return;
    }
    
    if (!confirmPassword.trim()) {
      toast.error('请确认密码');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const requestData = {
        username: username.trim(),
        password: password.trim(),
        // 已移除邮箱字段
      };
      
      console.log('发送注册请求:', requestData);
      
      const response = await axios.post(
        `${API_BASE_URL}${REGISTER_ENDPOINT}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10秒超时
        }
      );
      
      console.log('注册响应:', response.data);
      
      // 检查响应状态码
      if (response.status === 200 && response.data.code === 200) {
        const { data } = response.data;
        
        // 注册成功后自动登录
        // 保存 token 和用户信息
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        
        // 设置 axios 默认头部
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // 更新父组件状态
        if (data.user) {
          setName(data.user.username || username);
          setStrengthCoin(data.user.strength_coin || 0);
          setSelectCoin(data.user.select_coin || 0);
          setHeadImage("picture/headImage/");
        }
        
        toast.success(response.data.message || '注册成功！');
        
        // 延迟跳转到验证页面
        setTimeout(() => {
          setPage("Verify");
        }, 1500);
        
      } else {
        throw new Error(response.data.message || '注册失败');
      }
      
    } catch (error) {
      console.error('注册错误详情:', error);
      
      if (error.response) {
        // 服务器返回错误
        const status = error.response.status;
        const errorData = error.response.data;
        
        let errorMessage = '注册失败';
        
        if (status === 400) {
          errorMessage = errorData.message || '请求参数错误';
          // 检查常见错误
          if (errorData.message && errorData.message.includes('用户名')) {
            errorMessage = '用户名已存在或格式不正确';
          } else if (errorData.message && errorData.message.includes('密码')) {
            errorMessage = '密码不符合要求';
          }
        } else if (status === 409) {
          errorMessage = '用户名已存在';
        } else if (status === 500) {
          errorMessage = '服务器内部错误';
        } else if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = `服务器错误: ${status}`;
        }
        
        toast.error(errorMessage);
        
      } else if (error.request) {
        // 请求已发送但无响应
        console.error('请求无响应:', error.request);
        toast.error('无法连接到服务器，请检查网络连接');
      } else if (error.code === 'ECONNABORTED') {
        // 请求超时
        toast.error('请求超时，请稍后重试');
      } else {
        // 其他错误
        toast.error(error.message || '注册失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车键提交
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleRegister(e);
    }
  };

  // 返回登录页面
  const handleBackToLogin = () => {
    setPage("Login");
  };

  return (
    <div style={{
        width: Xsize,
        height: Ysize,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#afafafff',
      transform:"translate(-50%, -50%)",
        position: 'absolute',
        left: '50%',
        top: '50%',
        backgroundImage: `url(${bgImage})`,
    }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
        }}
      />
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '32px', 
            margin: '0 0 10px 0',
            textShadow: '0 6px 3px #9f9f9fff'
          }}>
            筹   备
          </h2>
          <p style={{ color: '#666', margin: 0 }}>创建新账号</p>
        </div>
        
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}>
              用户名：
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入用户名(3-20位)"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              disabled={isLoading}
              autoComplete="username"
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}>
              密码：
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入密码(至少6位)"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}>
              确认密码：
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请再次输入密码"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleBackToLogin}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textShadow: '0 2px 2px rgba(0,0,0,0.1)'
              }}
            >
              返回登录
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: isLoading ? '#999' : '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                textShadow: '0 2px 2px rgba(0,0,0,0.2)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  注册中...
                </>
              ) : (
                '开始征途'
              )}
            </button>
          </div>
        </form>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          input:focus {
            border-color: #4a90e2 !important;
            box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
          }
          button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `}</style>
      </div>
    </div>
  );
};

export default RegisterPage;