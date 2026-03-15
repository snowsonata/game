import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './RegisterPage.css';
import bgImage from './pictures/登录注册图.png';

const RegisterPage = ({ Xsize, Ysize, setPage, setStrengthCoin, setSelectCoin, setName, setHeadImage }) => {
  // 状态管理
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // API 配置 - 使用相同的后端网址
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://firechickenmp4.top';
  const REGISTER_ENDPOINT = '/api/auth/register';

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
      width: `${Xsize}px`,height: `${Ysize}px`,backgroundColor: '#afafafff',transform:"translate(-50%, -50%)",position: 'absolute',left: '50%',top: '50%',backgroundImage: `url(${bgImage})`,backgroundSize: '100% 100%',backgroundPosition: 'center',backgroundRepeat: 'no-repeat'}}>
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
          <h2 style={{fontSize:"40px", textShadow:"0 6px 3px #9f9f9fff"}}>筹    备   </h2>

        </div>

        <form onSubmit={handleRegister}>
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

          <div className="form-group" style={{bottom:'80px'}}>
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
              autoComplete="new-password"
            />
          </div>

          <div className="form-group" style={{bottom:'130px'}}>
            <label htmlFor="confirmPassword" className="form-label" style={{left:"-110px"}} >
              确认密码：
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请再次输入密码"
              className="form-input"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

            <button
              type="button"
              className="login-button"
              onClick={handleBackToLogin}
              style={{left:"70%", top:"100%"}}

            >
             返程
            </button>


          <button
            type="submit"
            disabled={isLoading}
            className={`login-button ${isLoading ? 'loading' : ''}`}
            style={{left:"30%", top:"100%"}}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                注册中...
              </>
            ) : (
              '确认'
            )}
          </button>
        </form>




        </div>
        </div>

  );
};

export default RegisterPage;
