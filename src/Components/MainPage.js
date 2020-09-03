import React, {useState, useRef, useEffect} from 'react';
import './styles/MainPage.css';
import {home, design, dinner, outfit} from '../images/';

export default function MainPage(){

    // text to be shown on the screen
    // eslint-disable-next-line
    const [text, changeText] = useState([
        {text: "weekend dinner idea", color: '#ffab00', type: dinner},
        {text: "home decor idea", color: '#009688', type: home},
        {text: "new look outfit", color: 'dodgerblue', type: outfit},
        {text: "logo design idea", color: '#d84315', type: design},
    ]);;

    // reference to the element in which text will be shown
    let textRef = useRef();
    // reference to the element that contains images that will change
    let imagesRef = useRef();
    let currentType = useRef(text[0].type);

    useEffect(() => {
        let abortController = new AbortController();
        let counter = 1;
        textRef.current.style.color = "#ffab00";

        const interval = setInterval(() => {
            
            // adding animation class
            let childs = imagesRef.current.children;
            for (let i = 0; i < childs.length; i++){
                childs[i].classList.remove(`anim${i + 1}`);
            }
            // setting the new text and color
            let newText = text[counter]['text'];
            let newColor = text[counter]['color'];

            // change text and color
            textRef.current.textContent = newText;
            textRef.current.style.color = newColor;
            currentType.current = text[counter].type;

            // reset the counter when it's equal to the length of the texts array
            if(counter !== text.length - 1){
                counter = counter + 1;
            } else {
                counter = 0;
            }

            // changing pictures
            for (let i = 0; i < childs.length; i++){
                let image = childs[i].firstChild;
                image.src = currentType.current[i];
            }

            // adding animation class
            setTimeout(() => {
                for (let i = 0; i < childs.length; i++){
                    childs[i].classList.add(`anim${i+1}`);
                }
            }, 5500)

        }, 10000)

        return () => {
            console.log('aborting main page');
            clearInterval(interval);
            abortController.abort();
        }
    
    }, [text, currentType, ])

    // handling resize to hide/show images;
    useEffect(() => {
        let abortController = new AbortController();

        const resize = () => {
            if(window.innerWidth < 700){
                imagesRef.current.style.display = 'none';
            } else {
                imagesRef.current.style.display = 'block';
            }
        }

        if(window.innerWidth < 700){
            imagesRef.current.style.display = 'none';
        }

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            abortController.abort();
        }
    })

    return (
        <div className="main-body">
            <div className="center main-text">Get your next</div>
            <div ref={textRef} className="center main-text">{text[0].text}</div>
            <div ref={imagesRef} className="row hide-on-small-only">
                <div className="col l1">
                    <img className="anim-img1" loading={"lazy"} alt="img1" src={dinner[6]}></img>
                </div>
                <div className="col l1">
                    <img className="anim-img2" loading={"lazy"} alt="img1" src={dinner[0]}></img>
                </div>
                <div className="col l1">
                    <img className="anim-img3" loading={"lazy"} alt="img1" src={dinner[1]}></img>
                </div>
                <div className="col l1">
                    <img className="anim-img4" loading={"lazy"} alt="img1" src={dinner[2]}></img>
                </div>
                <div className="col l1">
                    <img className="anim-img5" loading={"lazy"} alt="img1" src={dinner[3]}></img>
                </div>
                <div className="col l1">
                    <img className="anim-img6" loading={"lazy"} alt="img1" src={dinner[4]}></img>
                </div>
                <div className="col l1">
                    <img className="anim-img7" loading={"lazy"} alt="img1" src={dinner[5]}></img>
                </div>
            </div>
        </div>
    )
}