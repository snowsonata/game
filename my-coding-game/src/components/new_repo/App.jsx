import { useState } from 'react'
import './App.css'
import { useEffect } from 'react';
import FlipCard from './Card.jsx'
import ShowItems from './ShowItems.jsx';
import { Select } from '@mui/material';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage_new.jsx';
import FrontAbilityPage from './FrontAbilityPage.jsx';
import BackAbilityPage from './BackAbilityPage.jsx';
import ProductAbilityPage from './ProductAbilityPage.jsx';
import DesignAbilityPage from './DesignAbilityPage.jsx';
import LoadingPage from './LoadingPage.jsx';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Card  from './Card.jsx';
import TenCard from './TenCard.jsx';
function App() {
  const [Page, setPage] = useState("Main") // Login 登录 Register 注册 Main 主页 FightGame 战斗 Achieve 成就 Items 道具 SelectCards 抽卡 Ability 技能
  const [Xsize, setXsize] = useState(440)
  const [Ysize, setYsize] = useState(700)
  const [Name, setName] = useState("我的名字")
  const [Password, setPassword] = useState("")
  const [RePassword,setRePassword] = useState("")
  const [IsLogined, setIsLogined] = useState(false)
  const [PersonImage, setPersonImage] = useState("")
  const [HeadImage, setHeadImage] = useState("pictures/HeadImage.jpeg")
  const [StrengthCoin, setStrengthCoin] = useState(1000)
  const [SelectCoin, setSelectCoin] = useState(10000)
  const [SelectCardsCount, setSelectCardsCount] = useState(80)//还离抽卡获得稀有道具次数（保底）
  const [Sound, setSound] = useState(60)
  const [Item, setItem] = useState([])
  const [Gate, setGate] = useState([["关卡1",10,10,"Uncomplecated","Locked",3,[500,500,500],250],["关卡2",100,50,"Uncomplecated","Locked",5,[500,500,500],250]])//关卡的基本属性 关卡名，是否解锁完成               名字     是否完成       是否解锁  关卡难度 奖励(强化金币，抽卡金币，道具) 经验
  const [Group, setGroup] = useState("user")//用户组
  const [SelectGate, setSelectGate] = useState([])
  const [Achievement,setAchievement] = useState(["闪电速度","铜墙铁壁"])
  //以下的const均是弹窗变量
  const [IsShow, setIsShow] = useState(false)//招募概率弹窗
  const [IsShow2, setIsShow2] = useState(false)//单抽抽卡弹窗
  const [IsShow3, setIsShow3] = useState(false)//十连抽卡弹窗
  const [IsShow4, setIsShow4] = useState(false)//最近抽卡记录弹窗

  useEffect(() => {
    let ticking = false;
  
    const updateDimensions = () => {
    // 获取视口实际尺寸（考虑移动设备的可视区域）
    const viewportWidth = Math.min(window.innerWidth, window.screen.width);
    const viewportHeight = Math.min(window.innerHeight, window.screen.height);
    
    // 针对移动设备的优化
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // 移动设备使用document.documentElement.clientHeight更准确
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      
      // 减去状态栏/导航栏的高度（估算）
      const statusBarHeight = 24; // 状态栏高度
      const navigationBarHeight = 48; // 底部导航栏高度
      
      setXsize(width);
      setYsize(height - statusBarHeight - navigationBarHeight);
    } else {
      // PC端使用完整视口
      setXsize(viewportWidth);
      setYsize(viewportHeight);
    }
    
    console.log(`设备尺寸: ${viewportWidth} x ${viewportHeight}`);
  };
    const handleResize = () => {
    if (!ticking) {
      requestAnimationFrame(updateDimensions);
      ticking = true;
    }
  };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
  window.addEventListener('orientationchange', updateDimensions);
    let timer2, timer3;
    
    if (IsShow2) {
      timer2 = setTimeout(() => {
        setIsShow2(false);
        setPage("Card");
      }, 1500);
    }
    
    if (IsShow3) {
      timer3 = setTimeout(() => {
        setIsShow3(false);
        setPage("TenCard");
      }, 1500);
    }
    
    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
       window.removeEventListener('resize', handleResize);
       window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [IsShow2, IsShow3]);

  function Container({ Xsize, Ysize, children }) {
      return (
          <div style={{
              width: Xsize,
              height: Ysize,
              position: 'absolute',  // 改为 relative
              left:"50%",     // 添加居中
              background: 'blue',
              zIndex: '1',
              top:"50%",
              transform:"translate(-50%,-50%)"         // 修改 zIndex
          }}> 
              {children}
          </div>
      )
  }
  function GateShow({GateName,GateX,GateY,onClick}){       //用来展示关卡
      return(
          <div 
              className="gate-show"
              style={{
                  left: GateX,
                  top: GateY
                  
              }}
              onClick={onClick} 
          >
              {GateName}
          </div>
      )
  }
  

  // 退出登录函数
  const handleLogout = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://firechickenmp4.top';
      
      // 保存用户数据到后端
      await axios.post(
        `${API_BASE_URL}/api/profile/operation/logout`,
        {
          username: Name,
          strength_coin: StrengthCoin,
          select_coin: SelectCoin,
          head_image_path: HeadImage
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 发送退出登录请求
      await axios.post(
        `${API_BASE_URL}/api/profile/operation/logout`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    }
  } catch (error) {
    console.error('保存数据或登出错误:', error);
  } finally {
    // 清除本地存储
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    
    // 清除axios默认头部
    delete axios.defaults.headers.common['Authorization'];
    
    // 重置状态
    setIsLogined(false);
    setName("我的名字");
    setStrengthCoin(1000);
    setSelectCoin(10000);
    setHeadImage("pictures/HeadImage.jpeg");
    
    // 跳转到登录页面
    setPage("Login");
  }
};
 function Set() {
  const [RightPage, setRightPage] = useState("") // PersonChange 个人信息修改 Sound 声音 About 关于 Help 帮助 
  const [newUsername, setNewUsername] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const [message, setMessage] = useState({ type: "", content: "" })

  // 获取API基础URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://firechickenmp4.top'

  // 显示消息
  const showMessage = (type, content) => {
    setMessage({ type, content })
    setTimeout(() => setMessage({ type: "", content: "" }), 3000)
  }

  // 修改头像
  const handleHeadImageUpdate = async () => {
    if (!selectedImage) {
      showMessage("error", "请先选择图片")
      return
    }

    const token = localStorage.getItem('authToken')
    if (!token) {
      showMessage("error", "请先登录")
      return
    }

    const formData = new FormData()
    formData.append('headImage', selectedImage)
    formData.append('username', Name)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/profile/update/headimage`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.code === 200) {
        // 更新本地头像
        setHeadImage(response.data.data.headImagePath || previewImage)
        showMessage("success", "头像修改成功")
        setSelectedImage(null)
        setPreviewImage("")
      } else {
        showMessage("error", response.data.message || "头像修改失败")
      }
    } catch (error) {
      console.error('头像修改错误:', error)
      showMessage("error", error.response?.data?.message || "头像修改失败，请重试")
    }
  }

  // 修改用户名
  const handleUsernameUpdate = async () => {
  if (!newUsername.trim()) {
    showMessage("error", "请输入新用户名")
    return
  }

  const token = localStorage.getItem('authToken')
  if (!token) {
    showMessage("error", "请先登录")
    return
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/profile/update/username`,
      {
   
        new_username: newUsername  // 修改这里：将 newUsername 改为 new_username
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.code === 200) {
      setName(newUsername)
      setNewUsername("")
      showMessage("success", "用户名修改成功")
      
      // 更新本地存储的用户信息
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      userInfo.username = newUsername
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    } else {
      showMessage("error", response.data.message || "用户名修改失败")
    }
  } catch (error) {
    console.error('用户名修改错误:', error)
    showMessage("error", error.response?.data?.message || "用户名修改失败，请重试")
  }
}
  // 修改密码
  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showMessage("error", "请填写所有密码字段")
      return
    }

    if (newPassword !== confirmPassword) {
      showMessage("error", "新密码与确认密码不一致")
      return
    }

    if (newPassword.length < 6) {
      showMessage("error", "密码长度不能少于6位")
      return
    }

    const token = localStorage.getItem('authToken')
    if (!token) {
      showMessage("error", "请先登录")
      return
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/profile/update/password`,
        {
          username: Name,
          oldPassword: oldPassword,
          newPassword: newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.code === 200) {
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        showMessage("success", "密码修改成功")
      } else {
        showMessage("error", response.data.message || "密码修改失败")
      }
    } catch (error) {
      console.error('密码修改错误:', error)
      showMessage("error", error.response?.data?.message || "密码修改失败，请重试")
    }
  }

  // 处理图片选择
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 检查文件类型
      if (!file.type.match('image.*')) {
        showMessage("error", "请选择图片文件")
        return
      }
      
      // 检查文件大小（限制5MB）
      if (file.size > 5 * 1024 * 1024) {
        showMessage("error", "图片大小不能超过5MB")
        return
      }

      setSelectedImage(file)
      
      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // 渲染消息提示
  const renderMessage = () => {
    if (!message.content) return null
    
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        backgroundColor: message.type === 'success' ? '#4CAF50' : '#f44336',
        color: 'white',
        borderRadius: '5px',
        zIndex: 1000
      }}>
        {message.content}
      </div>
    )
  }

  // 渲染个人信息修改页面
  const renderPersonChangePage = () => {
    return (
      <div className="PersonChangePage" >
        {renderMessage()}
        
        {/* 头像修改部分 */}
        <div style={{ marginBottom: '10px', borderBottom: '1px solid #ffffffff', paddingBottom: '0px' }}>
          
          
          {/* 当前头像和预览 */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ marginRight: '20px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px'}}>当前头像：</div>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundImage: `url(${previewImage || HeadImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '2px solid #424242ff'
              }}></div>
            </div>
            
            {previewImage && (
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>新头像预览：</div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundImage: `url(${previewImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid #4CAF50'
                }}></div>
              </div>
            )}
          </div>

          {/* 文件选择和上传按钮 */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              id="headImageInput"
            />
            <label 
              htmlFor="headImageInput"
              style={{
                padding: '8px 15px',
                backgroundColor: '#2196F3',
                color: 'white',
                borderRadius: '5px',
                cursor: 'pointer',
                display: 'inline-block'
              }}
            >
              选择图片
            </label>
            
            {selectedImage && (
              <button
                onClick={handleHeadImageUpdate}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                上传新头像
              </button>
            )}
          </div>
        </div>

        {/* 修改用户名部分 */}
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
          <h3>修改用户名</h3>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>当前用户名：{Name}</div>
            <input
              type="text"
              placeholder="请输入新用户名"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              style={{
                padding: '8px',
                width: '200px',
                marginRight: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
            <button
              onClick={handleUsernameUpdate}
              style={{
                padding: '8px 15px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              确认修改
            </button>
          </div>
        </div>

        {/* 修改密码部分 */}
        <div style={{ marginBottom: '20px' }}>
          <h3>修改密码</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
            <input
              type="password"
              placeholder="请输入原密码"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
            <input
              type="password"
              placeholder="请输入新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
            <input
              type="password"
              placeholder="请确认新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
            <button
              onClick={handlePasswordUpdate}
              style={{
                padding: '8px 15px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              确认修改密码
            </button>
          </div>
        </div>

        <div className="BackButton" onClick={() => setSelectCoin(10000)} style={{
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: 'white',
          borderRadius: '5px',
          cursor: 'pointer',
          display: 'inline-block',
          marginTop: '20px'
        }}>
          10000抽卡货币初始
        </div>
      </div>
    )
  }

  // 渲染右侧内容
  const renderRightContent = () => {
    switch(RightPage) {
      case "PersonChange":
        return renderPersonChangePage()
      case "Sound":
        return (
          <div className="SoundPage" >

            <h2>声音设置</h2>
            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label>背景音乐音量：</label>
                <input type="range" min="0" max="100" value={Sound} />
                <span>{Sound}%</span>
              </div>
              <div>
                <label>音效音量：</label>
                <input type="range" min="0" max="100" value={Sound} />
                <span>{Sound}%</span>
              </div>
            </div>
          </div>
        )
      case "Help":
        return (
          <div className="HelpPage" style={{ padding: '20px' }}>
            <div className="BackButton" onClick={() => setRightPage("")} style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'inline-block',
              marginBottom: '20px'
            }}>返回</div>
            <h2>帮助中心</h2>
            <div style={{ marginTop: '20px' }}>
              <h4>游戏说明：</h4>
              <p>1. 通过抽卡获得各种道具</p>
              <p>2. 挑战关卡获得奖励</p>
              <p>3. 收集道具获得属性加成</p>
              <p>4. 强化技能提升战斗力</p>
            </div>
          </div>
        )
      case "About":
        return (
          <div className="AboutPage" style={{ padding: '20px' }}>
            <div className="BackButton" onClick={() => setRightPage("")} style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'inline-block',
              marginBottom: '20px'
            }}>返回</div>
            <h2>制作名单</h2>
            <div style={{ marginTop: '20px' }}>
              <p>策划：杨沐航</p>
              <p>程序：李野，张锦添，</p>
              <p>美术：胡文涛</p>
              <p>音乐：胡文涛</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="DefaultPage" style={{ 
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <h2>请选择左侧菜单</h2>
          </div>
        )
    }
  }

  return(
    <Container Xsize={Xsize} Ysize={Ysize}>
      <div className='SetBackground'>
        <div style={{position:"absolute",width:"90%",fontSize:"30px",color:"black",height:"50px",left:"50%",transform:"translateX(-50%)",textAlign:"center",borderBottom:"1px solid black"}}>设置</div>
        
        {/* 左侧菜单 */}
        <div className="LeftMenu" style={{
          position: "absolute",
          left: "0",
          top: "60px",
          width: "30%",
          height: "calc(100% - 60px)",
          borderRight: "1px solid #000000ff"
        }}>
          <div 
            className='ChangePerson' 
            onClick={() => setRightPage("PersonChange")}
            style={{
              padding: '15px 20px',
              cursor: 'pointer',
              backgroundColor: RightPage === 'PersonChange' ? '#e0e0e0' : 'transparent',
              borderBottom: '1px solid #eee'
            }}
          >
            更改个人信息
          </div>
          <div 
            className='Sound' 
            onClick={() => setRightPage("Sound")}
            style={{
              padding: '15px 20px',
              cursor: 'pointer',
              backgroundColor: RightPage === 'Sound' ? '#e0e0e0' : 'transparent',
              borderBottom: '1px solid #eee'
            }}
          >
            声音
          </div>
          <div 
            className='Help' 
            onClick={() => setRightPage("Help")}
            style={{
              padding: '15px 20px',
              cursor: 'pointer',
              backgroundColor: RightPage === 'Help' ? '#e0e0e0' : 'transparent',
              borderBottom: '1px solid #eee'
            }}
          >
            帮助
          </div>
          <div 
            className='About' 
            onClick={() => setRightPage("About")}
            style={{
              padding: '15px 20px',
              cursor: 'pointer',
              backgroundColor: RightPage === 'About' ? '#e0e0e0' : 'transparent',
              borderBottom: '1px solid #eee'
            }}
          >
            制作名单
          </div>
          <div 
            className='Logout' 
            onClick={handleLogout}
            style={{
              padding: '15px 20px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              color: '#f44336'
            }}
          >
            退出登录
          </div>
          <div 
            className='BackToMain' 
            onClick={() => setPage("Main")}
            style={{
              padding: '15px 20px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee'
            }}
          >
            返回主页
          </div>
        </div>
        {Group === "admin" && (
          <div className="AdminMenu" style={{
            position: "absolute",
            left: "30%",
            top: "60px",
            width: "30%",
            height: "calc(100% - 60px)",
            borderRight: "1px solid #000000ff"
          }}>
            <div 
              className='Admin' 
              onClick={() => setRightPage("Admin")}
              style={{
                padding: '15px 20px',
                cursor: 'pointer',
                backgroundColor: RightPage === 'Admin' ? '#e0e0e0' : 'transparent',
                borderBottom: '1px solid #eee'
              }}
            >
              管理员
            </div>
          </div>
        )}
        {/* 右侧内容区 */}
        <div className="RightContent" style={{
          position: "absolute",
          right: "0",
          top: "60px",
          width: "70%",
          height: "calc(100% - 60px)",
          overflowY: "auto",
          backgroundColor: "#f9f9f9"
        }}>
          {renderRightContent()}
        </div>
      </div>
    </Container>
  )
}

  function Verify() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    // 计算目标位置
    const targetX = Xsize * 0.5;
    const targetY = Ysize * 0.6;
    const tolerance = 30; // 误差范围
    
    // 滑块尺寸（根据屏幕大小调整）
    const sliderSize = Math.min(60, Xsize * 0.15);
    
    useEffect(() => {
        setPosition({
            x: targetX - 120,
            y: targetY
        });
    }, [Xsize, Ysize]);

    // 获取鼠标或触摸位置
    const getClientPosition = (e) => {
        if (e.touches) {
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
        return {
            x: e.clientX,
            y: e.clientY
        };
    };

    const handleDragStart = (e) => {
        e.preventDefault();
        const pos = getClientPosition(e);
        setIsDragging(true);
        setDragOffset({
            x: pos.x - position.x,
            y: pos.y - position.y
        });
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const pos = getClientPosition(e);
        const newX = Math.min(
            Math.max(sliderSize/2, pos.x - dragOffset.x),
            Xsize - sliderSize/2
        );
        
        setPosition({
            x: newX,
            y: position.y
        });
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        
        if (Math.abs(position.x - targetX) < tolerance) {
            alert("验证成功,战胜97%的玩家,简直比曹操还快");
            setPage("Loading");
        } else {
            // 验证失败，滑块回到起点
            setPosition({
                x: targetX - 120,
                y: targetY
            });
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove, { passive: false });
            window.addEventListener('touchend', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, position]);

    return (
        <Container Xsize={Xsize} Ysize={Ysize}>
            <div className='Background'>
                {/* 背景遮罩 */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {/* 验证卡片 */}
                    <div style={{
                        width: Math.min(350, Xsize * 0.9),
                        height: Math.min(250, Ysize * 0.4),
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        padding: '20px',
                        boxSizing: 'border-box',
                        position: 'relative'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>
                            安全验证
                        </h3>
                        
                        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                            请将滑块拖到指定位置
                        </p>
                        
                        {/* 滑块轨道 */}
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            height: sliderSize,
                            backgroundColor: '#f0f0f0',
                            borderRadius: '30px',
                            marginTop: '20px'
                        }}>
                            {/* 目标标记 */}
                            <div style={{
                                position: 'absolute',
                                left: `${(targetX - sliderSize/2) / Xsize * 100}%`,
                                top: 0,
                                width: sliderSize,
                                height: sliderSize,
                                border: '2px dashed #4CAF50',
                                borderRadius: '30px',
                                boxSizing: 'border-box',
                                pointerEvents: 'none'
                            }} />
                            
                            {/* 滑块 */}
                            <div
                                onMouseDown={handleDragStart}
                                onTouchStart={handleDragStart}
                                style={{
                                    position: 'absolute',
                                    left: Math.max(0, Math.min(
                                        (position.x - sliderSize/2) / Xsize * 100,
                                        100 - (sliderSize / Xsize * 100)
                                    )) + '%',
                                    top: 0,
                                    width: sliderSize,
                                    height: sliderSize,
                                    backgroundColor: isDragging ? '#4CAF50' : '#2196F3',
                                    borderRadius: '30px',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'white',
                                    fontSize: '24px',
                                    transition: isDragging ? 'none' : 'all 0.3s',
                                    zIndex: 10,
                                    touchAction: 'none'
                                }}
                            >
                                {isDragging ? '◀▶' : '☰'}
                            </div>
                        </div>
                        
                        {/* 提示文字 */}
                        <p style={{
                            textAlign: 'center',
                            color: '#999',
                            fontSize: '12px',
                            marginTop: '20px'
                        }}>
                            拖动滑块完成验证
                        </p>
                    </div>
                </div>
            </div>
        </Container>
    );
}
  function Main() {
    return (
        <Container Xsize={Xsize} Ysize={Ysize}>
            {/* 顶部信息栏 */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100px",
                backgroundColor: "rgba(255,255,255,0.8)",
                padding: "20px"
            }}>
                <div className='HeadImage' style={{ backgroundImage: `url(${HeadImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{position:"absolute",top:"50px",left:"80px"}}>{Name}</div>
                <div style={{color:"white",position:"absolute",top:"40px",right:"20px"}}>{StrengthCoin}
                  <div className='strength'></div>
                </div>
                <div style={{color:"white",position:"absolute",top:"60px",right:"20px"}}>{SelectCoin}
                  <div className='select'></div>
                </div>
                <div className='Function' onClick={()=>setPage("Set")}></div>
                <div className='Achievement'></div> 
            </div>

            {/* 关卡展示区 */}
            <div style={{position: "absolute", top: "170px", left: 0, right: 0, bottom: "100px"}}>
                <GateShow GateName={Gate[0][0]} GateX={Gate[0][1]} GateY={Gate[0][2]} 
                         onClick={() => {setSelectGate(Gate[0]); console.log("Selected gate:", Gate[0]);}}/>
                <GateShow GateName={Gate[1][0]} GateX={Gate[1][1]} GateY={Gate[1][2]} 
                         onClick={() => {setSelectGate(Gate[1]); console.log("Selected gate:", Gate[1]);}}/>
            </div>

            {/* 底部信息栏 */}
            <div style={{
                position: "absolute",
                bottom: "100px",
                left: 0,
                right: 0,
                height: "100px",
                backgroundColor: "rgba(255,255,255,0.8)",
                padding: "10px"
            }}>
                <div>当前已选：{SelectGate[0] || '未选择'}</div>
                <div>状态：{SelectGate[3] || '未知'} {SelectGate[4] || '未知'}
                  {SelectGate[4] === "Locked" && <div className='Locked'></div>}
                  {SelectGate[3] === "Complecated" && <div className='Complecated'></div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>难度：</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {Array.from({ length: SelectGate[5] || 0 }).map((_, index) => (
                    <div 
                      key={index}
                      className='Stars'
                    />
                  ))}
                  {Array.from({ length: 5 - (SelectGate[5] || 0) }).map((_, index) => (
                    <div 
                      key={index}
                      className='EmptyStars'
                    />
                  ))}
                    </div>
                    
                  </div>
            <div className='StartGame'></div>
            </div>

            {/* 底部导航栏 */}
            <div style={{
                position: "absolute",
                bottom: "0px",
                left: 0,
                right: 0,
                height: "100px",
                backgroundColor: "rgba(255,255,255,0.6)",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center"
            }}>
                <div className='Leaderboard' onClick={()=>setPage("Main")}>首页</div> 
                
                <div className='Leaderboard'onClick={()=>setPage("Ability")}>技能</div>
                <div className='Leaderboard' onClick={()=>setPage("SelectCards")}>召唤</div>
                <div className='Leaderboard'onClick={()=>setPage("Items")}>图鉴</div>
            </div>
        </Container>
    )
}
  function FightGame(){
    return <div>战斗</div>
  }

  function Achieve(){
    return <div>成就</div>
  }

  function Items(){
    return (
      <Container Xsize={Xsize} Ysize={Ysize}>
          {/* 顶部信息栏 */}
              <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "150px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  padding: "20px"
              }}>
                  <div className='HeadImage'>{HeadImage}</div>
                  <div style={{position:"absolute",top:"65px",left:"120px"}}>{Name}</div>
                  <div style={{color:"white",position:"absolute",top:"60px",right:"20px"}}>强化货币：{StrengthCoin}</div>
                  <div style={{color:"white",position:"absolute",top:"100px",right:"20px"}}>抽卡货币：{SelectCoin}</div>
                  <div className='Function' onClick={()=>setPage("Set")}>设置</div>
              </div>
              <div>
                <ShowItems/>

              </div>
              <div style={{position:"absolute",left:"50%",top:"520px",width:"93%",height:"130px",backgroundColor:"rgb(255,255,255,0.6)",transform:"translate(-50%)"}}>
                <div>道具收集度：{Items.length}/152</div>
                <div>收集度加成：</div>
                <div>攻击力：</div>
                <div>暴击伤害：</div>
              </div>



            {/* 底部导航栏 */}
            <div style={{
                position: "absolute",
                bottom: "-100px",
                left: 0,
                right: 0,
                height: "100px",
                backgroundColor: "rgba(255,255,255,0.6)",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center"
            }}>
                <div className='Leaderboard' onClick={()=>setPage("Main")}>首页</div> 
                
                <div className='Leaderboard'onClick={()=>setPage("Ability")}>技能</div>
                <div className='Leaderboard' onClick={()=>setPage("SelectCards")}>召唤</div>
                <div className='Leaderboard'onClick={()=>setPage("Items")}>图鉴</div>
            </div>
      </Container>
    )
  }

  function SelectCards(){  
    function ReduceSelectCardsCount(Num) {
        if (Num == 1 && SelectCoin < 100) {
            console.log("抽卡货币不足")
            alert("抽卡货币不足")
            return
        }
        if (Num == 10 && SelectCoin < 1000) {
            console.log("抽卡货币不足")
            alert("抽卡货币不足")
            return
        }    
        if (SelectCardsCount - Num < 0) {
            setSelectCardsCount(80)
            console.log("保底次数已用完")
            return
        }
        if(Num == 1 && SelectCoin >= 100) {
            setSelectCoin(prevCount => prevCount - 100);
            setSelectCardsCount(prevCount => prevCount -1);
            setIsShow2(true);
        }
        if(Num == 10 && SelectCoin >= 1000) {
            setSelectCoin(prevCount => prevCount - 1000);
            setSelectCardsCount(prevCount => prevCount -10);
            setIsShow3(true);
        }
    }
        

    return (
      <Container Xsize={Xsize} Ysize={Ysize}>
          {/* 顶部信息栏 */}
              <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "150px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  padding: "20px"
              }}>
                  <div className='HeadImage'>{HeadImage}</div>
                  <div style={{position:"absolute",top:"65px",left:"120px"}}>{Name}</div>
                  <div style={{color:"white",position:"absolute",top:"60px",right:"20px"}}>强化货币：{StrengthCoin}</div>
                  <div style={{color:"white",position:"absolute",top:"100px",right:"20px"}}>抽卡货币：{SelectCoin}</div>
                  <div className='Function' onClick={()=>setPage("Set")}>设置</div>
              </div>
              <div style={{position:"absolute",transform:"translate(-50%,-50%)",left:"50%",top:"180px",color:"white",fontSize:"20px"}}>
                  还有{SelectCardsCount}次保底
              </div>
              <div className='SelectCards' style={{top:"300px"}} onClick={()=>{ReduceSelectCardsCount(1)}}>
                  
                  召唤一次（需要100抽卡货币）
              </div>
              <div className='SelectCards' style={{top:"500px"}} onClick={()=>{ReduceSelectCardsCount(10)}}>
                  召唤十次（需要1000抽卡货币）
              </div>
                {IsShow2 && (
                    <div className='TranslateBackground'>
                      <div 
                          style={{
                              position: "absolute",
                              right: "20px",
                              top: "20px",
                              color: "red",
                              height: "20px",
                              width: "20px",
                              textAlign: "center",
                              backgroundColor: "white",
                              cursor: "pointer"
                          }}
                          onClick={() => {
                              setIsShow2(false);
                           
                          }}
                      >
                          X
                      </div>
                       {/* 抽卡内容 */}
                    </div>
                )}
                {IsShow3 && (
                    <div className='TranslateBackground'>
                          <div 
                              style={{
                                  position: "absolute",
                                  right: "20px",
                                  top: "20px",
                                  color: "red",
                                  height: "20px",
                                  width: "20px",
                                  textAlign: "center",
                                  backgroundColor: "white",
                                  cursor: "pointer"
                              }}
                              onClick={() => {
                                  
                                  setIsShow3(false);
                              }}
                          >
                              X
                          </div>
                          {/* 抽卡内容 */}
                      </div>
                )}         
              <div style={{position:"absolute",left:"25%",top:"600px",color:"white",transform:"translate(-50%)",cursor:"pointer"}} onClick={()=>setIsShow(true)}>查看招募概率</div>
              {IsShow==true ? 
                <div style={{position:"absolute",left:"50%",top:"50%",width:"300px",height:"200px",backgroundColor:"rgba(255,255,255,0.6)",transform:"translate(-50%,-50%)" }}>
                  <div style={{cursor:"pointer",position:"absolute",right:"15px",top:"10px",color:"red",height:"20px",width:"20px",textAlign:"center",backgroundColor:"white"}} onClick={()=>setIsShow(false)}>X</div>
                  
                        <br/>传说 (SSR)1.5%<br/>
                        史诗 (SR)13.5% <br/>
                        稀有 (R)35% <br/>
                        普通 (N) 50%  <br/>
                       
                                </div> 
                : 
                <div></div>
              }
              <div style={{position:"absolute",left:"75%",top:"600px",color:"white",transform:"translate(-50%)",cursor:"pointer"}} onClick={()=>setIsShow4(true)}>最近抽卡记录</div>
              {IsShow4==true ? 
                <div style={{position:"absolute",left:"50%",top:"50%",width:"300px",height:"200px",backgroundColor:"rgba(255,255,255,0.6)",transform:"translate(-50%,-50%)" }}>
                  <div style={{cursor:"pointer",position:"absolute",right:"15px",top:"10px",color:"red",height:"20px",width:"20px",textAlign:"center",backgroundColor:"white"}} onClick={()=>setIsShow4(false)}>X</div>
                  
                        还没有抽卡记录哦
                       
                                </div> 
                : 
                <div></div>
              }

            {/* 底部导航栏 */}
            <div style={{
                position: "absolute",
                bottom: "-100px",
                left: 0,
                right: 0,
                height: "100px",
                backgroundColor: "rgba(255,255,255,0.6)",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center"
            }}>
                <div className='Leaderboard' onClick={()=>setPage("Main")}>首页</div> 
                
                <div className='Leaderboard'onClick={()=>setPage("Ability")}>技能</div>
                <div className='Leaderboard' onClick={()=>setPage("SelectCards")}>召唤</div>
                <div className='Leaderboard'onClick={()=>setPage("Items")}>图鉴</div>
            </div>
      </Container>
    )
  }

  function Ability(){
    return (
      <Container Xsize={Xsize} Ysize={Ysize}>
          {/* 顶部信息栏 */}
              <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "150px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  padding: "20px"
              }}>
                  <div className='HeadImage'>{HeadImage}</div>
                  <div style={{position:"absolute",top:"65px",left:"120px"}}>{Name}</div>
                  <div style={{color:"white",position:"absolute",top:"60px",right:"20px"}}>强化货币：{StrengthCoin}</div>
                  <div style={{color:"white",position:"absolute",top:"100px",right:"20px"}}>抽卡货币：{SelectCoin}</div>
                  <div className='Function' onClick={()=>setPage("Set")}>设置</div>
              </div>
              <div className='AbilityShow' style={{top: '160px'}} onClick={()=>setPage("FrontAbility")}>
                前端技能树
              </div>
                            <div className='AbilityShow' style={{top: '270px'}} onClick={()=>setPage("BackAbility")}>
                后端技能树
              </div>
                            <div className='AbilityShow' style={{top: '380px'}} onClick={()=>setPage("ProductAbility")}>
                产品技能树
              </div>
                            <div className='AbilityShow' style={{top: '490px'}} onClick={()=>setPage("DesignAbility")}>
                设计技能树
              </div>
            {/* 底部导航栏 */}
            <div style={{
                position: "absolute",
                bottom: "-100px",
                left: 0,
                right: 0,
                height: "100px",
                backgroundColor: "rgba(255,255,255,0.6)",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center"
            }}>
                <div className='Leaderboard' onClick={()=>setPage("Main")}>首页</div> 
                
                <div className='Leaderboard'onClick={()=>setPage("Ability")}>技能</div>
                <div className='Leaderboard' onClick={()=>setPage("SelectCards")}>召唤</div>
                <div className='Leaderboard'onClick={()=>setPage("Items")}>图鉴</div>
            </div>
      </Container>

    )
  }

  switch(Page){
    case "Login":
      return <LoginPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} IsLogined={IsLogined} setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage} setGroup={setGroup}/>
    case "Register":
      return <RegisterPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage}/>
    case "Main":
      return <Main />
    case "FightGame":
      return <FightGame/>
    case "Achieve":
      return <Achieve/>
    case "Items":
      return <Items/>
    case "SelectCards":
      return <SelectCards/>
    case "Ability":
      return <Ability/>
    case "Verify":
      return <Verify/>
    case "Set":
      return <Set/>
    case "FrontAbility":
      return <FrontAbilityPage Xsize={Xsize} Ysize={Ysize} setPage={setPage}  setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage}/>
    case "BackAbility":
      return <BackAbilityPage Xsize={Xsize} Ysize={Ysize} setPage={setPage}  setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage}/>
    case "ProductAbility":
      return <ProductAbilityPage Xsize={Xsize} Ysize={Ysize} setPage={setPage}  setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage}/>
    case "DesignAbility":
      return <DesignAbilityPage Xsize={Xsize} Ysize={Ysize} setPage={setPage}  setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage}/>
    case "Loading":
      return <LoadingPage Xsize={Xsize} Ysize={Ysize} setPage={setPage}/>
    case "Card":
      return <Card Xsize={Xsize} Ysize={Ysize} setPage={setPage}/>
    case "TenCard":
      return <TenCard Xsize={Xsize} Ysize={Ysize} setPage={setPage}/>
    default:

      return <LoginPage onLoginSuccess={(userInfo) => {
        console.log('登录成功，用户信息:', userInfo);
        setPage("Verify");
      }}/>
  }
}

export default App