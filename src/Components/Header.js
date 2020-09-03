import React, { useRef, useEffect, useState } from 'react';
import {useSelector} from 'react-redux';
import {Link, Redirect} from 'react-router-dom';
import logo from '../images/logo.svg';
import * as firebase from 'firebase/app';
import './styles/Welcome.css';
import Messages from './Header-Messages';
import MainSearch from './Header-MainSearch';

export default function Header(){
    let accountRef = useRef();
    let notifRef = useRef();
    let msgRef = useRef();
    let msgInfoRef = useRef();
    let mobileContainerRef = useRef();
    let mobileBarRef = useRef();
    let homeRef = useRef();
    let followingRef = useRef();
    let homeMobileRef = useRef();
    let followingMobileRef = useRef();
    let [accountIcon, changeIcon] = useState('');
    let [lastMessages, changeLastMessages] = useState([]);
    let [logRedirect, changeLogRedirect] = useState(false);
    let [username, setUsername] = useState('');
    const isLogged = useSelector(state => state.isLogged)

    useEffect(() => {
        let abortController = new AbortController();

        if (isLogged){
            let user = firebase.auth().currentUser;
            if(!!user){
                let storeReference = firebase.firestore().collection('users').doc(user.uid);
                storeReference.get().then(snapshot => {
                    if(!!snapshot.data()){
                        let image = snapshot.data().profileImage;
                        let username = snapshot.data().username;
                        if (!!image){
                            changeIcon(image);
                        }
                        setUsername(username);
                    }
                })
            }
        }

        return () => {
            console.log('aborting header');
            abortController.abort()
        }
    }, [isLogged, ])

    const closeSettings = () => {
        accountRef.current.classList.add('hide');
        notifRef.current.classList.add('hide');
        msgRef.current.classList.add('hide');
    }

    const openSettings = () => {

        // display drop-down if hidden
        if (accountRef.current.classList.contains('hide')){
            closeSettings();
            accountRef.current.classList.remove('hide');
        }
        // close if already displayed
        else {
            closeSettings();
        }
    }

    const openNotifications = () => {

        // display drop-down if hidden
        if (notifRef.current.classList.contains('hide')){
            closeSettings();
            notifRef.current.classList.remove('hide');
        }
        // close if already displayed
        else {
            closeSettings();
        }
    }

    const openMessages = () => {

        // display drop-down if hidden
        if (msgRef.current.classList.contains('hide')){
            closeSettings();
            msgRef.current.classList.remove('hide');
            let user = firebase.auth().currentUser;
            // references to firebase firestore collections
            let userChatRoomsRef = firebase.firestore().collection('userChatrooms').doc(user.uid);
            let totalUserRooms = [];

            getRooms(userChatRoomsRef, totalUserRooms).then((result) => {
                getLastMessages(result);
            })
        }
        // close if already displayed
        else {
            closeSettings();
        }
    }

    const signOutUser = () => {
        closeTabs();
        closeSettings();
        firebase.auth().signOut().then(() => {
            changeLogRedirect(true);
        })
    }

    // get the rooms user is in
    const getRooms= React.useCallback((ref, totalUserRooms) => {
        return new Promise((resolve, reject) => {
            ref.onSnapshot(snapshot => {
                let data = snapshot.data();
                for (let property in data){
                    if (property === 'lastSeen'){
                        continue;
                    } else {
                        totalUserRooms.push(property);
                    }
                }
                resolve(totalUserRooms);
            },(error) =>  reject(error))
        })
    }, [])

    const getLastMessages = (rooms) => {
        let arr = []
        rooms.forEach(room => {
            let ref = firebase.firestore().collection('chatrooms').doc(room).collection('messages');
            ref.get().then(snapshot => {
                let documents = snapshot.docs;
                documents.filter((cur, index, fullArr) => {
                    if(!fullArr[index + 1]){
                        console.log(cur.data());
                        arr.push(cur.data());
                    }
                    return 0;
                })
            }).then(result => {
                changeLastMessages(arr);
            })
        })
    }

    const changeTab = (e) => {
        if(e.target === homeRef.current){
            homeRef.current.classList.add('selected');
            followingRef.current.classList.remove('selected');
        } else {
            homeRef.current.classList.remove('selected');
            followingRef.current.classList.add('selected');
        }
    }

    const changeMobileTab = (e) => {
        if(e.target === homeMobileRef.current){
            homeMobileRef.current.classList.add('selected');
            followingMobileRef.current.classList.remove('selected');
        } else {
            homeMobileRef.current.classList.remove('selected');
            followingMobileRef.current.classList.add('selected');
        }
    }

    const closeTabs = () => {
        homeMobileRef.current.classList.remove('selected');
        homeRef.current.classList.remove('selected');
        followingMobileRef.current.classList.remove('selected');
        followingRef.current.classList.remove('selected');
    }

    const openMobileMenu = (e) => {
        if(mobileBarRef.current.classList.contains('hide')){
            mobileBarRef.current.classList.remove('hide');
        } else {
            mobileBarRef.current.classList.add('hide');
        }
    }

    return (
        <div>
            {logRedirect ? <Redirect to={`/`} /> : ''}
            <nav className="padded white black-text">
                <div className="nav-wrapper">
                    <div className="row">
                        <div className="col l3 hide-on-med-and-down">
                            <img className="logo" src={logo} alt="logo"></img>
                            <Link to="/main">
                                <span
                                    ref={homeRef}
                                    onClick={changeTab}
                                    className={`tab black-text bold-weight selected ${isLogged ? '' : 'hide'}`}>
                                        Home
                                </span>
                            </Link>
                            <Link to="/following">
                            <span
                                ref={followingRef}
                                onClick={changeTab}
                                className={`tab black-text bold-weight ${isLogged ? '' : 'hide'}`}>
                                    Following
                            </span>
                            </Link>
                        </div>

                        <div className="col l2 hide-on-large-only">
                            <img className="logo" src={logo} alt="logo"></img>
                            <Link to="/main">
                                <span
                                    ref={homeMobileRef}
                                    onClick={changeMobileTab}
                                    className={`tab bold-weight black-text selected ${isLogged ? '' : 'hide'}`}>
                                        Home
                                </span>
                            </Link>
                            <Link to="/following">
                                <span
                                    ref={followingMobileRef}
                                    onClick={changeMobileTab}
                                    className={`tab black-text bold-weight ${isLogged ? '' : 'hide'}`}>
                                        Following
                                </span>
                            </Link>
                        </div>
                        <MainSearch />
                        <div className="">
                            <div ref={mobileContainerRef}
                                className={`col l3 right greyBgColor flexed hide-on-med-and-up ${!isLogged ? 'hide' : ''}`}>
                                    <i
                                        className="material-icons pin-icon"
                                        onClick={openMobileMenu}>
                                        menu
                                    </i>
                            </div>
                            <div className="col l12 right hide show-animate greyBgColor" ref={mobileBarRef}>
                                <div className="purpColor pointer" onClick={signOutUser}>Logout</div>
                                <Link to={`/user/${username}`}>
                                <div className="purpColor pointer" onClick={closeTabs}>Account</div>
                                </Link>
                                <Link
                                    to="/main/settings" onClick={closeTabs}>
                                    <div className="purpColor">Settings</div>
                                </Link>
                                <Link
                                    to="/messages" onClick={closeTabs}>
                                    <div className="purpColor">Messages</div>
                                </Link>
                                <Link
                                    to="/create-a-pin" onClick={closeTabs}>
                                    <div className="purpColor">Create A Pin</div>
                                </Link>
                            </div>
                        </div>
                        <div className={`col l3 right flexed hide-on-small-only ${!isLogged ? 'hide' : ''}`}>
                            <i
                                className="material-icons icon center"
                                onClick={openSettings}>
                                keyboard_arrow_down
                            </i>
                            {
                            accountIcon === '' ?
                                <Link to={`/user/${username}`} onClick={closeTabs}>
                                    <i 
                                    className="material-icons icon center"
                                    onClick={closeTabs}>
                                    account_circle
                                    </i>
                                </Link>
                                : 
                                <Link to={`/user/${username}`} onClick={closeTabs}>
                                    <img
                                        src={accountIcon}
                                        className="account-image header-icon"
                                        alt="icon"
                                        onClick={closeTabs}
                                    />
                                </Link>
                            }
                            <i 
                                className="material-icons icon center"
                                onClick={openMessages}>
                                textsms
                            </i>
                            <i 
                                className="material-icons icon center"
                                onClick={openNotifications}>
                                notifications
                            </i>
                        </div>
                        <div className={`col l3 right flexed ${isLogged ? 'hide' : ''}`}>
                            <Link to="/">
                                <button className="s-button redbg-color">Login</button>
                            </Link>
                        </div>
                    </div>
                    <div className="right drop-down account hide" ref={accountRef}>
                        <div className="subheading-text">Accounts</div>
                        <Link
                            to="/main/settings" 
                            onClick={closeTabs}
                            className="bold-weight account-link black-text">
                                Settings
                        </Link>
                        <br />
                        <Link
                            to="/create-a-pin" onClick={closeTabs}>
                            <div className="bold-weight account-link black-text">
                                Create Pin
                            </div>
                        </Link>
                        <div
                            className="bold-weight account-link"
                            onClick={signOutUser}>
                            Logout
                        </div>
                        <Link to={`/user/${username}`} onClick={closeTabs}>
                            <div
                                className="bold-weight account-link">
                                Account
                            </div>
                        </Link>
                    </div>

                    <div className="right drop-down notifications hide" ref={notifRef}>
                        <div className="subheading-text bold-weight center">Updates</div>
                    </div>

                </div>
            </nav>

            {/* Messages Tab */}
            <Messages
                msgRef={msgRef}
                lastMessages={lastMessages}
                msgInfoRef={msgInfoRef}/>
        </div>
    )
}