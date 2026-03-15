import React from "react";
import { useState, useEffect } from "react";
import "./ShowItems.css";
function ShowItems() {
    const [scrollX, setScrollX] = useState(0);
    function scrollXAdd(Num){
        if ((scrollX < 0 && Num >0)||(scrollX >-700 && Num <0)){
        setScrollX(prevCount => prevCount + Num);}
    }
    return(
        <div className="Container">
            <div className="ShowItems" style={{left:scrollX +"%",transition:"all 0.5s"}}>
                <div>dd</div>
                <div>dd</div>
                <div>dd</div>
                <div>dd</div>
                <div>dd</div>
                <div>dd</div>          
                <div>dd</div>
                <div>dd</div>           
                <div>dd</div>
                <div>dd</div>
                <div>dd</div>          
                <div>dd</div>
                <div>dd</div>           
                <div>dd</div>
                <div>dd</div>
  
            </div>
            <div style={{position:"absolute",left:"50%",top:"270px",zIndex:"999",transform:"translate(-50%,0)",color:"white",fontSize:"20px"}}>
                页码 {Math.round(-scrollX/100+1)}/8
            </div>
            <div className="scroll-indicator" style={{left:"0px"}} onClick={()=>scrollXAdd(100)}>
                        ||
            </div>
            <div className="scroll-indicator" style={{right:"0px"}} onClick={()=>scrollXAdd(-100)}>
                        ||
            </div>
        </div>
    )
}
export default ShowItems;