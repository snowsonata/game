import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './LoginPage.css';
import Container from "./Container.jsx"
const LoginPage = ({Xsize,Ysize,setPage,IsLogined,setStrengthCoin,setSelectCoin,setName,setHeadImage,setGroup}) => {
  // 状态管理
  const [username, setUsername] = useState('我的名字');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(IsLogined);
  const [userInfo, setUserInfo] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  // API 配置
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://firechickenmp4.top';
  const LOGIN_ENDPOINT = '/api/auth/login';

  // 检查本地存储的 token 和用户信息
 useEffect(() => {
  // 检查本地存储的 token 和用户信息

}, []);
  const File =(e)=>{
        setName(data.user.username)
        setStrengthCoin(data.user.strength_coin)
        setSelectCoin(data.user.select_coin)
        setHeadImage(data.user.head_image_path)
  }
  // 处理登录
  const handleLogin = async (e) => {
    e?.preventDefault();
    
    // 表单验证
    if (!username.trim()) {
      toast.error('请输入用户名');
      return;
    }
    
    if (!password.trim()) {
      toast.error('请输入密码');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const requestData = {
        username: username.trim(),
        password: password.trim()
      };
      
      console.log('发送登录请求:', requestData);
      
      const response = await axios.post(
        `${API_BASE_URL}${LOGIN_ENDPOINT}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10秒超时
        }
      );
      
      console.log('登录响应:', response.data);
      
      // 检查响应状态码
      if (response.status === 200 && response.data.code === 200) {
        const { data } = response.data;
        
        // 保存 token 和用户信息
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        
        // 设置 axios 默认头部
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // 记住用户名
        if (rememberMe) {
          localStorage.setItem('savedUsername', username.trim());
        } else {
          localStorage.removeItem('savedUsername');
        }
        
        // 更新状态
        setUserInfo(data.user);
        setIsLoggedIn(true);
        setName(data.user.username)
        setStrengthCoin(data.user.strength_coin)
        setSelectCoin(data.user.select_coin)
        setHeadImage(data.user.head_image_path)
        toast.success(response.data.message || '登录成功！');
        setGroup(data.user.group)

        // 跳转到Verify页面
        setPage("Verify");

        // 测试 token 有效性
        testTokenValidity(data.token);
        
      } else {
        throw new Error(response.data.message || '登录失败');
      }
      
    } catch (error) {
      console.error('登录错误详情:', error);
      
      if (error.response) {
        // 服务器返回错误
        const status = error.response.status;
        const errorData = error.response.data;
        
        let errorMessage = '登录失败';
        
        if (status === 400) {
          errorMessage = '请求参数错误';
        } else if (status === 401) {
          errorMessage = '用户名或密码错误';
        } else if (status === 404) {
          errorMessage = 'API 接口不存在';
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
        toast.error(error.message || '登录失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 测试 token 有效性
  const testTokenValidity = async (token) => {
    try {
      // 这里可以添加一个测试 API 调用来验证 token 是否有效
      console.log('Token 验证通过');
    } catch (error) {
      console.error('Token 验证失败:', error);
    }
  };

  // 处理登出
  const handleLogout = () => {
    // 清除本地存储
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    
    // 清除 axios 默认头部
    delete axios.defaults.headers.common['Authorization'];
    
    // 重置状态
    setIsLoggedIn(false);
    setUserInfo(null);
    setPassword('');
    
    toast.success('已退出登录');
  };

  // 处理回车键提交
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  // 处理头像加载失败
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM2NjdlZWEiLz4KPHBhdGggZD0iTTQwIDIzQzQ1LjUyMiAyMyA1MCAyNy40NzggNTAgMzNDNTAgMzguNTIyIDQ1LjUyMiA0MyA0MCA0M0MzNC40NzggNDMgMzAgMzguNTIyIDMwIDMzQzMwIDI3LjQ3OCAzNC40NzggMjMgNDAgMjNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTAgNDdDNTAgNDIgNDcuMzE0IDM4IDQwIDM4QzMyLjY4NiAzOCAzMCA0MiAzMCA0N0M0Mi4yMjg2IDQ3IDUwIDQ3IDUwIDQ3WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+';
  };

  // 如果已登录，显示用户信息
  if (isLoggedIn && userInfo) {

    return (
      <Container Xsize={Xsize} Ysize={Ysize}>
        
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
              success: {
                duration: 2000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <div className="login-card">
            <div className="login-header">
              <h2>登录成功</h2>
              <p>欢迎回来，{userInfo.username}！</p>
            </div>
            

            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              退出登录
            </button>
            <button 
              onClick={() => {setPage("Verify");File()}}
              className="logout-button"
            >
              前往验证
            </button>
            <div className="api-test-buttons">
              <p className="test-label">API 测试:</p>
              <div className="button-group">
                <button 
                  className="api-button"
                  onClick={() => toast('发送测试请求到 /api/auth/me')}
                >
                  获取用户信息
                </button>
                <button 
                  className="api-button"
                  onClick={() => toast('刷新 Token')}
                >
                  刷新 Token
                </button>
              </div>
            </div>
          </div>
       
      </Container>
    );
  }

  // 登录表单
  return (
    <Container Xsize={Xsize} Ysize={Ysize} >
      <div className="login-background">
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
      
      <div className="login-card">
        <div className="login-header" >
          <h2 style={{fontSize:"40px", textShadow:"0 6px 3px #9f9f9fff"}}>征       途</h2>
          
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              账号：
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入用户名"
              className="form-input"
              disabled={isLoading}
              autoComplete="username"
              autoFocus
            />
          </div>
          
          <div className="form-group"  style={{bottom:'80px'}}>
            <label htmlFor="password" className="form-label" >
              密码：
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入密码"
              className="form-input"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          
          

            <button 
              type="button" 
              className="register-button"
              onClick={() =>setPage("Register")}
              disabled={isLoading}
              style={{textShadow:"0 6px 3px #9f9f9fff"}}
            >
             筹备
            </button>
          
          
          <button
            type="submit"
            disabled={isLoading}
            className={`login-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                起程中...
              </>
            ) : (
              '起程'
            )}
          </button>
        </form>
        
       
          
         
        </div>
        </div>
      
    </Container>
  );
};

export default LoginPage;