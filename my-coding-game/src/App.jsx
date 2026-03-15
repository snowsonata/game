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
import toast, { Toaster } from 'react-hot-toast';
import Card  from './Card.jsx';
import TenCard from './TenCard.jsx';

// 导入战斗部分
import Game from './pages/Game.jsx';

function App() {
  const [Page, setPage] = useState("Main") // Login, Register, Main, FightGame, Achieve, Items, SelectCards, Ability, Set, Card, TenCard
  const [Xsize, setXsize] = useState(440)
  const [Ysize, setYsize] = useState(700)
  const [Name, setName] = useState("我的名字")
  const [IsLogined, setIsLogined] = useState(false)
  const [HeadImage, setHeadImage] = useState("pictures/HeadImage.jpeg")
  const [StrengthCoin, setStrengthCoin] = useState(1000)
  const [SelectCoin, setSelectCoin] = useState(10000)
  const [SelectCardsCount, setSelectCardsCount] = useState(80)
  const [Sound, setSound] = useState(60)
  const [Item, setItem] = useState([])
  const [Gate, setGate] = useState([["关卡1",10,10,"Uncomplecated","Locked",3,[500,500,500],250],["关卡2",100,50,"Uncomplecated","Locked",5,[500,500,500],250]])
  const [SelectGate, setSelectGate] = useState([])
  const [IsShow, setIsShow] = useState(false)
  const [IsShow2, setIsShow2] = useState(false)
  const [IsShow3, setIsShow3] = useState(false)
  const [IsShow4, setIsShow4] = useState(false)
  const [RightPage, setRightPage] = useState("")

  useEffect(() => {
    const updateDimensions = () => {
      const viewportWidth = Math.min(window.innerWidth, window.screen.width);
      const viewportHeight = Math.min(window.innerHeight, window.screen.height);
      if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        setXsize(document.documentElement.clientWidth);
        setYsize(document.documentElement.clientHeight - 72);
      } else {
        setXsize(viewportWidth);
        setYsize(viewportHeight);
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    let timer2, timer3;
    if (IsShow2) {
      timer2 = setTimeout(() => { setIsShow2(false); setPage("Card"); }, 1500);
    }
    if (IsShow3) {
      timer3 = setTimeout(() => { setIsShow3(false); setPage("TenCard"); }, 1500);
    }

    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [IsShow2, IsShow3]);

  function Container({ Xsize, Ysize, children }) {
      return (
          <div style={{
              width: Xsize,
              height: Ysize,
              position: 'absolute',
              left:"50%",
              background: 'blue',
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
              style={{ left: GateX, top: GateY, position: 'absolute' }}
              onClick={onClick} 
          >
              {GateName}
          </div>
      )
  }

  // 子页面组件定义
  const BottomNav = () => (
    <div className="bottom-nav">
        <div className='Leaderboard' onClick={()=>setPage("Main")}>首页</div> 
        <div className='Leaderboard' onClick={()=>setPage("Ability")}>技能</div>
        <div className='Leaderboard' onClick={()=>setPage("SelectCards")}>召唤</div>
        <div className='Leaderboard' onClick={()=>setPage("Items")}>图鉴</div>
    </div>
  );

  const TopHeader = () => (
    <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "150px",
        backgroundColor: "rgba(255,255,255,0.8)", padding: "20px"
    }}>
        <div className='HeadImage' style={{ backgroundImage: `url(${HeadImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div style={{position:"absolute",top:"50px",left:"80px"}}>{Name}</div>
        <div style={{color:"white",position:"absolute",top:"40px",right:"20px"}}>{StrengthCoin}<div className='strength'></div></div>
        <div style={{color:"white",position:"absolute",top:"60px",right:"20px"}}>{SelectCoin}<div className='select'></div></div>
        <div className='Function' onClick={()=>setPage("Set")}></div>
        <div className='Achievement'></div> 
    </div>
  );

  // 页面切换逻辑
  if (Page === "Login") {
    return <LoginPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} IsLogined={IsLogined} setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage} setGroup={()=>{}} />;
  }
  if (Page === "Register") {
    return <RegisterPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} setStrengthCoin={setStrengthCoin} setSelectCoin={setSelectCoin} setName={setName} setHeadImage={setHeadImage} />;
  }
  if (Page === "FightGame") {
    return <Game onBack={() => setPage("Main")} />;
  }
  if (Page === "Card") {
    return <Container Xsize={Xsize} Ysize={Ysize}><Card setPage={setPage}/></Container>;
  }
  if (Page === "TenCard") {
    return <Container Xsize={Xsize} Ysize={Ysize}><TenCard setPage={setPage}/></Container>;
  }
  if (Page === "Ability") {
    return (
      <Container Xsize={Xsize} Ysize={Ysize}>
        <div className='SetBackground' style={{backgroundColor:'rgba(255,255,255,0.9)'}}>
          <div style={{position:"absolute",width:"90%",fontSize:"30px",color:"black",height:"50px",left:"50%",transform:"translateX(-50%)",textAlign:"center",borderBottom:"1px solid black",top:"20px"}}>技能强化</div>
          <div className='SetTopButton' onClick={()=>setPage("FrontAbility")} style={{top:'150px'}}><div style={{transform:'translateY(-15px)'}}>前端</div></div>
          <div className='SetButtomButton' onClick={()=>setPage("BackAbility")} style={{bottom:'150px'}}><div style={{transform:'translateY(15px)'}}>后端</div></div>
          <div className='SetLeftButton' onClick={()=>setPage("DesignAbility")} style={{left:'80px'}}><div style={{transform:'translateX(-15px) rotate(-90deg)'}}>设计</div></div>
          <div className='SetRightButton' onClick={()=>setPage("ProductAbility")} style={{right:'80px'}}><div style={{transform:'translateX(15px) rotate(90deg)'}}>产品</div></div>
          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'20px'}}>请选择方向</div>
          <div className='BackButton' onClick={()=>setPage("Main")} style={{position:'absolute',bottom:'50px',left:'50%',transform:'translateX(-50%)',padding:'10px 20px',backgroundColor:'#f44336',color:'white',borderRadius:'5px',cursor:'pointer'}}>返回主页</div>
        </div>
      </Container>
    );
  }
  if (Page === "FrontAbility") return <FrontAbilityPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} StrengthCoin={StrengthCoin} setStrengthCoin={setStrengthCoin}/>;
  if (Page === "BackAbility") return <BackAbilityPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} StrengthCoin={StrengthCoin} setStrengthCoin={setStrengthCoin}/>;
  if (Page === "ProductAbility") return <ProductAbilityPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} StrengthCoin={StrengthCoin} setStrengthCoin={setStrengthCoin}/>;
  if (Page === "DesignAbility") return <DesignAbilityPage Xsize={Xsize} Ysize={Ysize} setPage={setPage} StrengthCoin={StrengthCoin} setStrengthCoin={setStrengthCoin}/>;

  if (Page === "SelectCards") {
    const handleDraw = (num) => {
      const cost = num === 1 ? 100 : 1000;
      if (SelectCoin < cost) { alert("抽卡货币不足"); return; }
      setSelectCoin(s => s - cost);
      setSelectCardsCount(s => s - num);
      if (num === 1) setIsShow2(true); else setIsShow3(true);
    };
    return (
      <Container Xsize={Xsize} Ysize={Ysize}>
          <TopHeader />
          <div style={{position:"absolute",transform:"translate(-50%,-50%)",left:"50%",top:"200px",color:"white",fontSize:"20px"}}>还有{SelectCardsCount}次保底</div>
          <div className='SelectCards' style={{top:"350px",position:'absolute',left:'50%',transform:'translateX(-50%)'}} onClick={()=>handleDraw(1)}>召唤一次（100货币）</div>
          <div className='SelectCards' style={{top:"500px",position:'absolute',left:'50%',transform:'translateX(-50%)'}} onClick={()=>handleDraw(10)}>召唤十次（1000货币）</div>
          {IsShow2 && <div className='TranslateBackground' style={{zIndex:100}}><LoadingPage/></div>}
          {IsShow3 && <div className='TranslateBackground' style={{zIndex:100}}><LoadingPage/></div>}
          <div style={{position:"absolute",left:"25%",bottom:"150px",color:"white",cursor:"pointer"}} onClick={()=>setIsShow(true)}>招募概率</div>
          <div style={{position:"absolute",left:"75%",bottom:"150px",color:"white",cursor:"pointer"}} onClick={()=>setIsShow4(true)}>抽卡记录</div>
          {IsShow && <div style={{position:"absolute",left:"50%",top:"50%",width:"250px",padding:"20px",backgroundColor:"rgba(255,255,255,0.9)",transform:"translate(-50%,-50%)",zIndex:110,borderRadius:'10px'}}>
              <div onClick={()=>setIsShow(false)} style={{float:'right',cursor:'pointer',color:'red'}}>X</div>
              <p>SSR: 1.5% | SR: 13.5%</p><p>R: 35% | N: 50%</p>
          </div>}
          <BottomNav />
      </Container>
    );
  }

  if (Page === "Items") {
    return (
      <Container Xsize={Xsize} Ysize={Ysize}>
          <TopHeader />
          <div style={{marginTop:'160px',height:'350px',overflowY:'auto'}}><ShowItems/></div>
          <div style={{position:"absolute",bottom:"120px",left:"50%",width:"90%",padding:"10px",backgroundColor:"rgba(255,255,255,0.7)",transform:"translate(-50%)",borderRadius:'10px'}}>
            <div>道具收集度：{Item.length}/152</div>
            <div>收集度加成：攻击力+0%</div>
          </div>
          <BottomNav />
      </Container>
    );
  }

  if (Page === "Set") {
    return (
      <Container Xsize={Xsize} Ysize={Ysize}>
        <div className='SetBackground' style={{padding:'20px',backgroundColor:'white'}}>
          <h2 style={{textAlign:'center'}}>设置</h2>
          <div onClick={()=>setRightPage("PersonChange")} style={{padding:'15px',borderBottom:'1px solid #eee',cursor:'pointer'}}>修改个人信息</div>
          <div onClick={()=>setRightPage("Sound")} style={{padding:'15px',borderBottom:'1px solid #eee',cursor:'pointer'}}>声音设置</div>
          <div onClick={()=>setPage("Main")} style={{padding:'15px',borderBottom:'1px solid #eee',cursor:'pointer',color:'blue'}}>返回主页</div>
          <div onClick={()=>{localStorage.clear();setPage("Login")}} style={{padding:'15px',borderBottom:'1px solid #eee',cursor:'pointer',color:'red'}}>退出登录</div>
          {RightPage === "Sound" && <div style={{marginTop:'20px',padding:'10px',background:'#f9f9f9'}}>
              <label>音量: </label><input type="range" value={Sound} onChange={e=>setSound(e.target.value)}/> {Sound}%
          </div>}
        </div>
      </Container>
    );
  }

  // 默认主页 (Main)
  return (
    <Container Xsize={Xsize} Ysize={Ysize}>
        <Toaster />
        <TopHeader />
        <div style={{position: "absolute", top: "170px", left: 0, right: 0, bottom: "220px", overflowY:'auto'}}>
            <GateShow GateName={Gate[0][0]} GateX={Gate[0][1]} GateY={Gate[0][2]} 
                     onClick={() => setSelectGate(Gate[0])}/>
            <GateShow GateName={Gate[1][0]} GateX={Gate[1][1]} GateY={Gate[1][2]} 
                     onClick={() => setSelectGate(Gate[1])}/>
        </div>
        <div style={{
            position: "absolute", bottom: "100px", left: 0, right: 0, height: "110px",
            backgroundColor: "rgba(255,255,255,0.85)", padding: "12px", borderTop:'1px solid #ddd'
        }}>
            <div style={{fontWeight:'bold',marginBottom:'5px'}}>当前选择：{SelectGate[0] || '请点击地图关卡'}</div>
            <div style={{fontSize:'13px',color:'#666'}}>状态：{SelectGate[3] || '-'} | 难度：{SelectGate[5] || 0}星</div>
            {SelectGate.length > 0 && <div className='StartGame' onClick={() => setPage("FightGame")}></div>}
        </div>
        <BottomNav />
    </Container>
  )
}

export default App;
