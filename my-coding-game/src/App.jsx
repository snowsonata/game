import { useState, useEffect } from 'react'
import './App.css'
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

// 导入战斗部分
import Game from './pages/Game.jsx';

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

  // 渲染页面逻辑
  if (Page === "Login") {
    return <LoginPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} IsLogined={IsLogined} setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage} setGroup={setGroup} />;
  }
  if (Page === "Register") {
    return <RegisterPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage} />;
  }
  if (Page === "FightGame") {
    // 核心：接入战斗逻辑
    return <Game onBack={() => setPage("Main")} />;
  }
  if (Page === "Items") {
    return (
      <Container Xsize={Xsize} Ysize={Ysize}>
              <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, height: "150px",
                  backgroundColor: "rgba(255,255,255,0.8)", padding: "20px"
              }}>
                  <div className='HeadImage'>{HeadImage}</div>
                  <div style={{position:"absolute",top:"65px",left:"120px"}}>{Name}</div>
                  <div style={{color:"white",position:"absolute",top:"60px",right:"20px"}}>强化货币：{StrengthCoin}</div>
                  <div style={{color:"white",position:"absolute",top:"100px",right:"20px"}}>抽卡货币：{SelectCoin}</div>
                  <div className='Function' onClick={()=>setPage("Set")}>设置</div>
              </div>
              <div><ShowItems/></div>
              <div style={{position:"absolute",bottom:"120px",left:"50%",width:"93%",height:"130px",backgroundColor:"rgb(255,255,255,0.6)",transform:"translate(-50%)"}}>
                <div>道具收集度：{Item.length}/152</div>
                <div>收集度加成：</div>
              </div>
            {/* 底部导航栏 */}
            <div className="bottom-nav">
                <div className='Leaderboard' onClick={()=>setPage("Main")}>首页</div> 
                <div className='Leaderboard' onClick={()=>setPage("Ability")}>技能</div>
                <div className='Leaderboard' onClick={()=>setPage("SelectCards")}>召唤</div>
                <div className='Leaderboard' onClick={()=>setPage("Items")}>图鉴</div>
            </div>
      </Container>
    );
  }

  // 默认主页
  return (
    <Container Xsize={Xsize} Ysize={Ysize}>
        <Toaster />
        {/* 顶部信息栏 */}
        <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, height: "150px",
            backgroundColor: "rgba(255,255,255,0.8)", padding: "20px"
        }}>
            <div className='HeadImage' style={{ backgroundImage: `url(${HeadImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div style={{position:"absolute",top:"50px",left:"80px"}}>{Name}</div>
            <div style={{color:"white",position:"absolute",top:"40px",right:"20px"}}>{StrengthCoin}<div className='strength'></div></div>
            <div style={{color:"white",position:"absolute",top:"60px",right:"20px"}}>{SelectCoin}<div className='select'></div></div>
            <div className='Function' onClick={()=>setPage("Set")}></div>
        </div>

        {/* 关卡展示区 */}
        <div style={{position: "absolute", top: "170px", left: 0, right: 0, bottom: "100px"}}>
            <GateShow GateName={Gate[0][0]} GateX={Gate[0][1]} GateY={Gate[0][2]} 
                     onClick={() => {setSelectGate(Gate[0]);}}/>
            <GateShow GateName={Gate[1][0]} GateX={Gate[1][1]} GateY={Gate[1][2]} 
                     onClick={() => {setSelectGate(Gate[1]);}}/>
        </div>

        {/* 底部信息栏 */}
        <div style={{
            position: "absolute", bottom: "100px", left: 0, right: 0, height: "100px",
            backgroundColor: "rgba(255,255,255,0.8)", padding: "10px"
        }}>
            <div>当前已选：{SelectGate[0] || '未选择'}</div>
            {SelectGate.length > 0 && <div className='StartGame' onClick={() => setPage("FightGame")}></div>}
        </div>

        {/* 底部导航栏 */}
        <div className="bottom-nav">
            <div className='Leaderboard' onClick={()=>setPage("Main")}>首页</div> 
            <div className='Leaderboard' onClick={()=>setPage("Ability")}>技能</div>
            <div className='Leaderboard' onClick={()=>setPage("SelectCards")}>召唤</div>
            <div className='Leaderboard' onClick={()=>setPage("Items")}>图鉴</div>
        </div>
    </Container>
  )
}

export default App;
