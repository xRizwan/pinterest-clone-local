import React, { useRef, useEffect, useState, useReducer } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { loginUser } from '../actions/';
import './styles/MainPage.css';
import logo from '../images/logo.svg';
import fire from '../config/config';
import * as firebase from 'firebase/app'
import 'firebase/auth';

const auth = fire.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const db = fire.firestore();
const d = new Date();

const initialState = {
    signupEmail: '',
    signupPassword: '',
    age: '',
    loginEmail: '',
    loginPassword: '',
    signupErr: '',
    loginErr: '',
}

function reducer(state, {field, value}){
    return {
        ...state,
        [field]: value,
    }
}

function Header() {
    let mobileRef = useRef();
    let infoRef = useRef();
    let [login, changeLogin] = useState(false);
    let [signup, changeSignup] = useState(false);
    let [overlay, changeOverlay] = useState(false);
    let [loader, changeLoader] = useState(false);
    let isLogged = useSelector(state => state.isLogged);
    let dispatcher = useDispatch();

    useEffect(() => {
        // close the mobile nav automatically if screen gets bigger than 589px
        const hideMobile = () => {
            if(window.innerWidth > 589){
                mobileRef.current.classList.add('hide');
            }
        }
        window.addEventListener('resize', hideMobile)

        return () => {window.removeEventListener('resize', hideMobile)}
    }, [])

    // mobile menu
    const openMenu = (e) => {
        let mainDiv = e.target.parentElement.parentElement.parentElement;

        // if mobile menu is open then close it else open it
        if (mobileRef.current.classList.contains('hide')){
            mobileRef.current.classList.remove('hide');
            mobileRef.current.classList.add('animate');

            mainDiv.classList.remove('white');
            mainDiv.style.backgroundColor = '#f3f3f3';
        } else {
            mobileRef.current.classList.add('hide');
            mainDiv.classList.add('white');
        }
    }

    // show signup modal
    const signupClick = () => {
        changeOverlay(true);
        changeSignup(true);
    }
    // show login modal
    const loginClick = () => {
        changeOverlay(true);
        changeLogin(true);
    }
    // close any modal open
    const closeModal = () => {
        changeOverlay(false);
        changeSignup(false);
        changeLogin(false);
    }
    
    const [state, dispatch] = useReducer(reducer, initialState)

    const handleChange = (e) => {
        dispatch({field: e.target.name, value: e.target.value})
    }
    
    // eslint-disable-next-line
    const {signupEmail, signupPassword, age, loginEmail, loginPassword, signupErr, loginErr} = state;


    // signup with email and password
    const submitSignup = (e) => {
        e.preventDefault();

        // form-checking
        if (signupEmail === '' || !signupEmail.includes('@') || !signupEmail.includes('.com')){
            dispatch({field : "signupErr", value: 'Please Enter a Valid Email'});
            return;
        }
        else if(signupPassword.length < 8){
            dispatch({field: "signupErr", value: "Password Must Be More Than 7 Letters"});
            return;
        }
        else if(age === ''){
            dispatch({field: "signupErr", value: "Please Enter Your Age"});
            return;
        } else {
            dispatch({field: "signupErr", value: ""});
        }
        changeLoader(true);
        auth.createUserWithEmailAndPassword(signupEmail, signupPassword).then((result) => {

            let uid = result.user.uid;

            db.collection('users').doc(uid).set({age : age, username: uid,}).then(() => {
                //closeModal();
                // show success info
                //alert("success");
            })

        }).catch(err => () => {
            
            infoRef.current.classList.remove('hide');
            setTimeout(() => {infoRef.current.classList.add('hide')}, 2500)
            infoRef.current.firstElementChild.textContent = err.message;
            changeLoader(false);
        });
    }


    // login with email and password
    const loginSubmit = (e) => {
        // prevent reload
        e.preventDefault();
        changeLoader(true);
        // sign-in with email and password
        auth.signInWithEmailAndPassword(loginEmail, loginPassword).then(() => {

            //dispatcher(loginUser());
            //changeLoader(false);

        }).catch((err) => {
            infoRef.current.classList.remove('hide');
            setTimeout(() => {infoRef.current.classList.add('hide')}, 2500)
            infoRef.current.firstElementChild.textContent = err.message;
            changeLoader(false);
        })
    }

    // authentication with gmail
    const googleAuth = (e) => {
        changeLoader(true);
        auth.signInWithPopup(googleProvider).then(result => {
            let uid = result.user.uid;

            //closeModal();
            //dispatcher(loginUser());
                    
            db.collection('users').doc(uid).set({
                username: uid,
            }, {merge: true}).then(() => {
                //dispatcher(loginUser());
            })
                //changeLoader(false);
                //dispatcher(loginUser());
            
        }).catch(err => {
            infoRef.current.classList.remove('hide');
            setTimeout(() => {infoRef.current.classList.add('hide')}, 2500)
            infoRef.current.firstElementChild.textContent = err.message;
            changeLoader(false);
        })
    }


    // created a seperate google auth for login
    // as for signup had to create a doc in the firestore
    const googleAuthLogin = (e) => {
        changeLoader(true);
        auth.signInWithPopup(googleProvider).then(result => {
            let uid = result.user.uid;

            //closeModal();
            //dispatcher(loginUser());

            db.collection('users').doc(uid).get().then(snapshot => {
                let username = '';
                if(!!snapshot.data()){
                    username = snapshot.data().username;
                }
                // if username does not exist
                if(!(!!username) || username === ''){
                    
                    db.collection('users').doc(uid).set({
                        username: uid,
                    }, {merge: true}).then(() => {
                        dispatcher(loginUser());
                    })
                //changeLoader(false);
                //dispatcher(loginUser());
                }
            })
            
        }).catch(err => {
            infoRef.current.classList.remove('hide');
            setTimeout(() => {infoRef.current.classList.add('hide')}, 2500)
            infoRef.current.firstElementChild.textContent = err.message;
            changeLoader(false);
        })
    }
    
    // facebook signup
    const facebookAuth = () => {
        changeLoader(true);
        const provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('user_birthday');
        auth.signInWithPopup(provider).then(result => {

            // getting users age
            let birthday = result.additionalUserInfo.profile.birthday;
            let birthyear = birthday.substr(birthday.length - 4, birthday.length);
            let today = d.getFullYear();
            let age = today - birthyear;
            // user id
            let uid = result.user.uid;
            // saving users age in doc
            db.collection('users').doc(uid).set({
                age: age,
                username: uid,
            }, {merge: true})

        }).catch(err => {
            // show message
            infoRef.current.classList.remove('hide');
            setTimeout(() => {infoRef.current.classList.add('hide')}, 2500)
            infoRef.current.firstElementChild.textContent = err.message;
            changeLoader(false);
        })
    }

    // facebook login
    const facebookAuthLogin = () => {
        changeLoader(true);
        const provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('user_birthday');
        auth.signInWithPopup(provider).then(result => {

            // getting users age
            let birthday = result.additionalUserInfo.profile.birthday;
            let birthyear = birthday.substr(birthday.length - 4, birthday.length);
            let today = d.getFullYear();
            let age = today - birthyear;
            // user id
            let uid = result.user.uid;
            // saving users age in doc
            db.collection('users').doc(uid).set({
                age: age,
            }, {merge: true})

        }).catch(err => {
            // show message
            infoRef.current.classList.remove('hide');
            setTimeout(() => {infoRef.current.classList.add('hide')}, 2500)
            infoRef.current.firstElementChild.textContent = err.message;
            changeLoader(false);
        })
    }

    return (
        <React.Fragment>
            
            {isLogged ? <Redirect to="/main" /> : ''}

            <nav>
                <div className="nav-wrapper white">
                    <div className="left brand-logo red-text text-darken-2">
                        <img src={logo} alt="logo" className="logo" />
                        Pinterest
                    </div>
                    

                    <div className="right hide-on-med-and-up black-text">
                        <div className="mobile-trigger" onClick={openMenu}>
                            <i className="material-icons">menu</i>
                        </div>
                    </div>

                    <div className="right hide-on-small-only">
                        <ul className="nav-links">
                                <li className="nav-link link1">
                                    <Link className="black-text" to="/about">
                                        About
                                    </Link>
                                </li>
                            <li>
                                <button
                                    className="nav-link login-btn"
                                    onClick={loginClick}>
                                        Log-In
                                </button>
                            </li>
                            <li>
                                <button
                                    className="nav-link signup-btn"
                                    onClick={signupClick}>
                                    Sign-Up
                                </button>
                            </li>
                        </ul>
                    </div>


                    <br />
                    <div ref={mobileRef} className="black-text nav-list hide">
                        <Link className="black-text" to="/about">
                            <div className="list-item">About</div>
                        </Link>
                        <div className="list-item" onClick={loginClick}>LogIn</div>
                        <div className="list-item" onClick={signupClick}>SignUp</div>
                    </div>
                </div>
            </nav>
            <div ref={infoRef} className={`info-modal hide`}>
                <p className="info-text">Success</p>
            </div>

            <div className={`overlay ${overlay ? '' : 'hide'}`}></div>
            <div className={`form-modal headings ${signup ? '' : 'hide'}`}>
                <div className="right">
                    <i
                        className="material-icons black-text close"
                        onClick={closeModal}>
                        close
                    </i>
                </div>
                <div className="center">
                    <img className="modal-logo" alt="logo" src={logo}></img>
                    <h4 className="heading-text">Welcome to Pinterest</h4>
                    <p className="subheading-text">Find new ideas to try</p>
                </div>
                <div
                    className={`center offset-top red-text
                    ${signupErr !== '' ? '' : 'hide'}`}>
                    {signupErr}
                </div>
                <form className="form-control">
                    <div className="input-control">
                        <i className="material-icons prefix">email</i>
                        <div className="center input-field">
                            <input
                                name="signupEmail"
                                type="email" 
                                placeholder="Email" 
                                value={signupEmail}
                                onChange={handleChange}
                                />
                        </div>
                    </div>
                    <br />
                    <div className="input-control">
                        <i className="material-icons prefix">info</i>
                        <div className="center input-field">
                            <input
                                name="signupPassword"
                                type="text"
                                placeholder="Password" 
                                onChange={handleChange}
                                value={signupPassword}/>
                        </div>
                    </div>
                    <div className="input-control">
                        <i className="material-icons prefix">account_box</i>
                        <div className="center input-field">
                            <input name="age" type="number" placeholder="Age"
                            value={age} onChange={handleChange}/>
                        </div>
                    </div>
                    <div className="center">
                        <button className="button" onClick={submitSignup}>Continue</button>
                    </div>
                </form>
                <div className="center">
                    <p className="subheading-text bold-weight">OR</p>
                </div>
                <div className="center">
                    <button onClick={facebookAuth} className="fake-button fb-btn">
                        <i className="material-icons white-text social-icon">menu</i>
                        <span>Continue with Facebook</span>
                    </button>
                </div>
                <div className="center">
                    <button className="fake-button gg-btn" onClick={googleAuth}>
                        <i className="material-icons black-text social-icon">menu</i>
                        <span>Continue with Google</span>
                    </button>
                </div>
                <div className="center offset-top">
                    <p
                        className="subheading-text link bold-weight"
                        onClick={() => {closeModal(); loginClick()}}>
                        Already a Member? Log In
                    </p>
                </div>
            </div>

            {/*Login Modal*/}
            <div className={`form-modal login-modal headings ${login ? '' : 'hide'}`}>
                <div className="right">
                    <i
                        className="material-icons black-text close"
                        onClick={closeModal}>
                        close
                    </i>
                </div>
                <div className="center">
                    <img className="modal-logo" alt="logo" src={logo}></img>
                    <h4 className="heading-text">Welcome to Pinterest</h4>
                    <p className="subheading-text">Find new ideas to try</p>
                </div>
                <div className="center offset-top red-text hide">{}</div>
                <form className="form-control">
                    <div className="input-control">
                        <i className="material-icons prefix">email</i>
                        <div className="center input-field">
                            <input
                                name="loginEmail" value={loginEmail}
                                type="email" placeholder="Email" onChange={handleChange}/>
                        </div>
                    </div>
                    <br />
                    <div className="input-control">
                        <i className="material-icons prefix">info</i>
                        <div className="center input-field">
                            <input
                                name="loginPassword" value={loginPassword}
                                type="text" placeholder="Password" onChange={handleChange}/>
                        </div>
                    </div>
                    <div className="center">
                        <button className="button" onClick={loginSubmit}>Login</button>
                    </div>
                </form>
                <div className="center">
                    <p className="subheading-text bold-weight">OR</p>
                </div>
                <div className="center">
                    <button onClick={facebookAuthLogin} className="fake-button fb-btn">
                        <i className="material-icons white-text social-icon">menu</i>
                        <span>Continue with Facebook</span>
                    </button>
                </div>
                <div className="center">
                    <button onClick={googleAuthLogin} className="fake-button gg-btn">
                        <i className="material-icons black-text social-icon">menu</i>
                        <span>Continue with Google</span>
                    </button>
                </div>
            </div>

            {loader ? <img src={logo} alt="loading" className="loader mainpage-loader" /> : ''}
        </React.Fragment>
    )
}

export default Header;