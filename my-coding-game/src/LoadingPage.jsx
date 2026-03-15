import React, { useState, useEffect } from 'react';
import "./LoadingPage.css";
import Container from "./Container.jsx"
function LoadingPage({Xsize, Ysize, setPage}) {
    function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    const randomInt = getRandomInt(0, 3);
    const Texts=["别着急","minigt需要你拯救","打boss尽量走前端派哦","加油！你是最棒的！"]
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
            setPage("Main");
        }, 2000);
    }, []);
    return(
        <Container Xsize={Xsize} Ysize={Ysize} >
            <div className="loading-page">
               
                <div className="loading-text">{Texts[randomInt]}</div>
                <div className='Picture'></div>
            </div>
        </Container>
    )

}
export default LoadingPage;