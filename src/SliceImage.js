import React, { useEffect, useState, useRef } from 'react';

import I1 from './images/animal.jpg'

const type = 1;
export default function SliceImage({ numberOfSlices = 4, initialH = 200 }) {
    const [loaded, setLoaded] = useState(false);
    const [imgSize, setImgSize] = useState([]);
    const [transTime, setTransTime] = useState(4);
    const imgPositionRef = useRef();
    const containerRef = useRef();
    const sampleRef = useRef();
    const divRef = useRef([]);
    const container = {
        height: `${initialH}px`,
        position: 'relative',
        userSelect: 'none',
        // background: 'lightblue',
    }
    const sliceDiv = {
        position: 'absolute',
        height: `${initialH / numberOfSlices}px`,
        // border: 'solid 1px green',
        overflow: 'hidden',
        transition: `${transTime}s ease-in-out`,
    }

    const imageStyle = {
        height: `${initialH}px`,
    }

    let targetLocation = 'translate(600px,600px) rotate(2turn)'


    useEffect(() => {
        window.addEventListener('load', onLoad);
        window.addEventListener('dblclick', onWindowClick);
        return (() => {
            window.removeEventListener('load', onLoad);
            window.addEventListener('dblclick', onWindowClick);
        });
    }, []);

    const onWindowClick = (e) => {
        e = e || window.event
        targetLocation = `translate(${Math.ceil(-imgPositionRef.current[0] + e.clientX)}px,${Math.ceil(-imgPositionRef.current[1] + e.clientY)}px)`
        transferImg();
    }
    const onLoad = () => {

        setImgSize([sampleRef.current.naturalWidth, sampleRef.current.naturalHeight]);
        let r = containerRef.current.getBoundingClientRect();
        // get image height
        let dw = Math.ceil(initialH * sampleRef.current.naturalWidth / sampleRef.current.naturalHeight);
        // position image in the middle of screen
        imgPositionRef.current = [(r.width - dw) / 2, r.y];
        console.log(imgPositionRef.current)

        setLoaded(true);
    }
    const transferImg = () => {
        // if (type === 0) {
        //     for (let i = 0; i < numberOfSlices; i += 2)
        //         divRef.current[i].style.transform = targetLocation;
        //     setTimeout(() => {
        //         for (let i = 1; i < numberOfSlices; i += 2)
        //             divRef.current[i].style.transform = targetLocation;
        //     }, 3000)
        // }
        // else {

        // spread out the parts
        setTransTime(3);
        let dt = window.innerWidth / 2
        for (let i = 0; i < numberOfSlices * numberOfSlices; i++) {
            divRef.current[i].style.transform = `translate(${getRandomInt(dt)}px,${getRandomInt(dt)}px) rotate(${getRandomInt(numberOfSlices)}turn)`;
        }

        // wait transition finish, start move parts back
        setTimeout(() => {
            setTransTime(3);
            for (let i = 0; i < numberOfSlices * numberOfSlices; i++) {
                setTimeout(() => {
                    divRef.current[i].style.transform = `${targetLocation} rotate(${getRandomInt(numberOfSlices)}turn)`;
                }, getRandomInt(window.innerWidth / 2))
            }
        }, 3000);

        // }
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    const reset = () => {
        if (type === 0) {
            for (let i = 0; i < numberOfSlices; i++)
                divRef.current[i].style.transform = 'none';
        }
        else {
            for (let i = 0; i < numberOfSlices * numberOfSlices; i++)
                divRef.current[i].style.transform = 'none';

        }
    }

    // const getSliceRender = () => {
    //     let ret = [];
    //     for (let i = 0; i < numberOfSlices; i++) {
    //         ret.push(<div style={{ ...sliceDiv, top: `${i * initialH / numberOfSlices}px`, left:`${imgPositionRef.current[0]}px` }} ref={(r) => { divRef.current[i] = r }}>
    //             <img src={I1} style={{ ...imageStyle, transform: `translateY(${-i * initialH / numberOfSlices}px)` }}></img>
    //         </div>);
    //     }
    //     return ret;
    // }

    const getChopperRender = () => {
        let dw = Math.ceil(initialH * imgSize[0] / imgSize[1] / numberOfSlices);
        let ret = [];
        for (let i = 0; i < numberOfSlices; i++) {
            for (let j = 0; j < numberOfSlices; j++) {
                ret.push(<div style={{ ...sliceDiv, top: `${Math.ceil(i * initialH / numberOfSlices)}px`, left: `${imgPositionRef.current[0] + dw * j}px`, width: `${dw}px` }} ref={(r) => { divRef.current[i * numberOfSlices + j] = r }}>
                    <img src={I1} style={{ ...imageStyle, transform: `translate(${-dw * j}px,${Math.ceil(-i * initialH / numberOfSlices)}px)` }}></img>
                </div>);
            }
        }
        return ret;
    }

    return (
        <>
            <div style={container} ref={containerRef}>
                {/* {type === 0 && getSliceRender()} */}
                {/* whole image to get image size information */}
                {type === 1 && !loaded && <img src={I1} style={imageStyle} ref={sampleRef}></img>}
                {type === 1 && loaded && getChopperRender()}
            </div>
            {/* <div onClick={reset}>Reset</div> */}
        </>
    )
}