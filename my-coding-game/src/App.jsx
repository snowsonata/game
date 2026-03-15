import { useState, useEffect } from 'react'
import './App.css'
import FlipCard from './Card.jsx'
import ShowItems from './ShowItems.jsx';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage_new.jsx';
import FrontAbilityPage from './FrontAbilityPage.jsx';
import BackAbilityPage from './BackAbilityPage.jsx';
import ProductAbilityPage from './ProductAbilityPage.jsx';
import DesignAbilityPage from './DesignAbilityPage.jsx';
import LoadingPage from './LoadingPage.jsx';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import Card  from './Card.jsx';
import TenCard from './TenCard.jsx';

// 导入战斗部分
import Game from './pages/Game.jsx';

function App() {
  const [Page, setPage] = useState("Main") // Login, Register, Main, FightGame, Achieve, Items, SelectCards, Ability
  const [Xsize, setXsize] = useState(window.innerWidth)
  const [Ysize, setYsize] = useState(window.innerHeight)
  const [Name, setName] = useState("我的名字")
  const [IsLogined, setIsLogined] = useState(false)
  const [HeadImage, setHeadImage] = useState("pictures/HeadImage.jpeg")
  const [StrengthCoin, setStrengthCoin] = useState(1000)
  const [SelectCoin, setSelectCoin] = useState(10000)
  const [SelectCardsCount, setSelectCardsCount] = useState(80)
  const [Gate, setGate] = useState([["关卡1",10,10,"Uncomplecated","Locked",3,[500,500,500],250],["关卡2",100,50,"Uncomplecated","Locked",5,[500,500,500],250]])
  const [SelectGate, setSelectGate] = useState([])
  const [IsShow, setIsShow] = useState(false)
  const [IsShow2, setIsShow2] = useState(false)
  const [IsShow3, setIsShow3] = useState(false)
  const [IsShow4, setIsShow4] = useState(false)

  useEffect(() => {
    const updateDimensions = () => {
      setXsize(window.innerWidth);
      setYsize(window.innerHeight);
    };
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  function Container({ Xsize, Ysize, children }) {
      return (
          <div style={{
              width: Xsize,
              height: Ysize,
              position: 'absolute',
              left:"50%",
              background: 'black',
              zIndex: '1',
              top:"50%",
              transform:"translate(-50%,-50%)",
              overflow: 'hidden'
          }}> 
              {children}
          </div>
      )
  }

  function GateShow({GateName,GateX,GateY,onClick}){
      return(
          <div 
              className="gate-show"
              style={{
                  left: GateX,
                  top: GateY,
                  position: 'absolute',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '10px',
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '5px'
              }}
              onClick={onClick} 
          >
              {GateName}
          </div>
      )
  }

  if (Page === "Login") {
    return <LoginPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} setIsLogined={setIsLogined} setName={setName} setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setHeadImage={setHeadImage} setGroup={()=>{}} />;
  }
  if (Page === "Register") {
    return <RegisterPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage} />;
  }
  if (Page === "FightGame") {
    // 接入您的战斗逻辑
    return <Game onBack={() => setPage("Main")} />;
  }

  // 主页逻辑
  return (
    <Container Xsize={Xsize} Ysize={Ysize}>
      <Toaster />
      {/* 顶部信息栏 */}
      <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "150px",
          backgroundColor: "rgba(255,255,255,0.2)",
          padding: "20px",
          color: 'white'
      }}>
          <div className='HeadImage' style={{ backgroundImage: `url(${HeadImage})`, backgroundSize: 'cover', width: '60px', height: '60px', borderRadius: '50%' }}></div>
          <div style={{position:"absolute",top:"30px",left:"100px"}}>{Name}</div>
          <div style={{position:"absolute",top:"20px",right:"20px"}}>强化币：{StrengthCoin}</div>
          <div style={{position:"absolute",top:"50px",right:"20px"}}>抽卡币：{SelectCoin}</div>
      </div>

      {/* 关卡展示区 */}
      <div style={{position: "absolute", top: "170px", left: 0, right: 0, bottom: "100px"}}>
          <GateShow GateName={Gate[0][0]} GateX={Gate[0][1]} GateY={Gate[0][2]} 
                   onClick={() => {setSelectGate(Gate[0]);}}/>
          <GateShow GateName={Gate[1][0]} GateX={Gate[1][1]} GateY={Gate[1][2]} 
                   onClick={() => {setSelectGate(Gate[1]);}}/>
          
          {SelectGate.length > 0 && (
            <button 
              style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '15px 30px', fontSize: '20px', cursor: 'pointer' }}
              onClick={() => setPage("FightGame")}
            >
              开始战斗: {SelectGate[0]}
            </button>
          )}
      </div>

      {/* 底部导航栏 */}
      <div style={{
          position: "absolute",
          bottom: "0px",
          left: 0,
          right: 0,
          height: "80px",
          backgroundColor: "rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center"
      }}>
          <div style={{color: 'white', cursor: 'pointer'}} onClick={()=>setPage("Main")}>首页</div> 
          <div style={{color: 'white', cursor: 'pointer'}} onClick={()=>setPage("Ability")}>技能</div>
          <div style={{color: 'white', cursor: 'pointer'}} onClick={()=>setPage("SelectCards")}>召唤</div>
          <div style={{color: 'white', cursor: 'pointer'}} onClick={()=>setPage("Items")}>图鉴</div>
      </div>
    </Container>
  );
}

export default App;
