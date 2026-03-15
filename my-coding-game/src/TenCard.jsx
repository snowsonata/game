import React from "react";
import './TenCard.css'; 
import Container from "./Container.jsx";
import { useState, useEffect } from 'react';
import "./Card.css"

function TenCard({ Xsize, Ysize, setPage }) {
    const [displaytext,setdisplaytext] = useState(false);
        useEffect(() => {
            const timer = setTimeout(() => {
                setdisplaytext(true);
            }, 5000);
            return () => clearTimeout(timer);
        }, [setPage]);
    return (
        <Container Xsize={Xsize} Ysize={Ysize + 100}>
            <div className="Acard-container">
                {/* 生成10张卡片 */}
                {Array.from({ length: 10 }, (_, index) => (
                    <div 
                        key={index}
                        className={`Acard card-${index + 1}`}
                        style={{ '--card-index': index }}
                    ></div>
                ))}
                 {displaytext && <div className="card-text" onClick={()=>setPage("Loading")}>点击返回主界面...</div>}
            </div>
        </Container>
    );
}

export default TenCard;