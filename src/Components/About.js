import React from 'react';
import github from '../images/github-logo.png'
import './styles/About.css';

export default function About(){

    return(
        <div>
            <div className="center card-panel teal">
                <div className="a-about-text">This is a purely educational project made for fun, to test my skills
                    and as my final project for theOdinProject.
                </div>
                <br />
                <div className="a-about-text">This project is not related to Pinterest in any way.</div>
                <br/>
                <div className="center">
                    <a href="https://github.com/xRizwan/pinterest-clone" rel="noopener noreferrer" target="_blank" >
                        <img src={github} className="logo logo-bigger" alt="github-repository"/>
                    </a>
                </div>
                <br/>
                <div className="a-footer-text">If Interested you can visit the github-repo of this project by clicking on the 
                        icon above.
                </div>
                <div className="a-footer-text">
                    Thanks for visiting!.
                </div>
            </div>

            <br />
            
            <div className="center">
                <a href="https://xrizwan.github.io/pinterest-clone/">
                    <i className="material-icons a-back-key">keyboard_backspace</i>
                </a>
            </div>
        </div>
    )
}