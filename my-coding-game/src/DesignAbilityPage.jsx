import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

import Container from "./Container.jsx"
function DesignAbilityPage({Xsize,Ysize,setPage,setStrengthCoin,setSelectCoin,setName,setHeadImage}) {
    return (
        <Container Xsize={Xsize} Ysize={Ysize} >
            <div style={{color:"white",position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}}>设计技能树</div>
            <div onClick={()=>setPage("Ability")} style={{color:"white",position:"absolute",top:"90%",left:"50%",transform:"translate(-50%,-50%)"}}>返回</div>
        </Container>
    )
}
export default DesignAbilityPage;