import React from "react";
import { useState, useEffect } from 'react';
import './Card.css'; 
import Container from "./Container.jsx";
import "./App.css";

function Card( {Xsize, Ysize, setPage}) {
    const [displaytext,setdisplaytext] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setdisplaytext(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, [setPage]);
    return (
        <Container Xsize={Xsize} Ysize={Ysize+100} >
            <div className="card-container">
                <div className="card" onClick={()=>setPage("Main")}></div>
                {displaytext && <div className="card-text" onClick={()=>setPage("Loading")}>点击返回主界面...</div>}
            </div>

        </Container>

     )}
export default Card;