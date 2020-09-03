import React, {useReducer, useEffect, useState, useRef} from 'react';
import {useSelector} from 'react-redux';
import logo from '../images/logo.svg'
import * as firebase from 'firebase/app';

export default function EditProfile(props){
    let [displayModal, changeModalDisplay] = useState(false);
    let [defaultInputs, changeDefault] = useState();
    let [profile_img, changeProfileImage] = useState();
    let loaderRef = useRef();
    let fileRef = useRef();
    let closeBtnRef = useRef();

    const initialInputs = {
        firstName: '',
        lastName: '',
        username: '',
        about: '',
        location: '',
        profileImage : '',
    }

    const reducerFunc = (state, {field, value}) => {
        return {
            ...state,
            [field]: value,
        }
    }

    const [state, dispatch] = useReducer(reducerFunc, initialInputs);
    let {firstName, lastName, username, about, location, profileImage} = state;
    let isLogged = useSelector(state => state.isLogged);

    useEffect(() => {

        let abortController = new AbortController();


        // if user is logged in
        if(isLogged){
            // get current user data
            let user = firebase.auth().currentUser;

            if(!!user){
                // get extra user data saved in firestore
                let dataRef = firebase.firestore().collection('users').doc(user.uid);

                // save in state
                dataRef.get().then((snapshot) => {
                    resetInput(snapshot.data());
                    changeDefault(snapshot.data())
                })
            }
        }

        return () => {
            console.log('aborting settings-edit')
            abortController.abort();
        }
    }, [isLogged, ])

    // controlled inputs handler
    const handleChange = (e) => {
        dispatch({field: e.target.name, value: e.target.value});
    }

    // send updates to the server
    const saveData = () => {
        if (isLogged){
            // eslint-disable-next-line
            let {firstNameMain, lastNameMain, usernameMain, aboutMain, locationMain} = defaultInputs;
            
            firstNameMain = !!firstNameMain ? firstNameMain : '';
            lastNameMain = !!lastNameMain ? lastNameMain : '';
            usernameMain = !!usernameMain ? usernameMain : '';
            aboutMain = !!aboutMain ? aboutMain : '';
            locationMain = !!locationMain ? locationMain : '';

            if(username === usernameMain){
                username = '';
            } else {
                username = username.split(' ').join('');
                console.log(username);
            }

            let user = firebase.auth().currentUser;
            let userReference = firebase.firestore().collection('users').doc(user.uid);

            firebase.firestore().collectionGroup('users').where('username', '==', username).get().then((snapshots) => {
                if (snapshots.docs.length > 0){
                    alert('username is taken');
                    return;
                } else {
                    // update states
                    userReference.update({
                        firstName: (firstName !== '') ? firstName : firstNameMain,             
                        lastName: (lastName !== '') ? lastName : lastNameMain,           
                        username: (username !== '') ? username : usernameMain,            
                        about: (about !== '') ? about : aboutMain,               
                        location: (location !== '') ? location : locationMain,               
                    }).then(() => {

                        alert("Success, Refresh to see the changes!.");

                        // change default inputs
                        userReference.get().then(snapshot => {
                            let data = snapshot.data();
                            changeDefault(data);
                        })
                    })
                }
            })            
        }
    }

    // change input data with the original data provided from server
    const resetInput = (data) => {
        let {firstName, lastName, username, about, location, profileImage} = data;

        // replacing with placeholder values when no data found
        firstName = !!firstName ? firstName : '';
        lastName = !!lastName ? lastName : '';
        username = !!username ? username : '';
        about = !!about ? about : '';
        location = !!location ? location : '';
        profileImage = !!profileImage ? profileImage : '';

        // changing states
        dispatch({field: 'firstName', value: firstName});
        dispatch({field: 'lastName', value: lastName});
        dispatch({field: 'username', value: username});
        dispatch({field: 'about', value: about});
        dispatch({field: 'location', value: location});
        dispatch({field: 'profileImage', value: profileImage});
    }

    const cancelSave = () => {
        resetInput(defaultInputs)
    }
    const saveProfileImage = (e) => {
        console.log(profile_img);
        loaderRef.current.classList.remove('hide');
        let user = firebase.auth().currentUser;
        let storageRef = firebase.storage().ref();
        const file = fileRef.current.files[0];
        let filename = file.name;
        
        const metadeta = {
            contentType: file.type
        }

        // disable buttons
        let target = e.target
        target.disabled = true;
        closeBtnRef.current.disabled = true;

        const task = storageRef.child(`profilePictures/${user.uid}/${filename}`).put(file, metadeta)
        task
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
            console.log(url)

            let dbRef = firebase.firestore().collection('users').doc(user.uid)
            dbRef.update({
                profileImage: url,
            }).then(() => {
                // enable buttons
                target.disabled = false;
                closeBtnRef.current.disabled = false;

                alert("Image Upload Successful")
                loaderRef.current.classList.add('hide');

                // close Modal
                changeModalDisplay(false);

                // save image state
                dispatch({field: "profileImage", value: url});
            })
        }).catch((err) => {
            alert(err.message);
        })

    }

    return(
        <div className={`${props.mainClass}`}>
            <div className="col l6 offset-l1">
                <div className="left main-info">
                    <h4 className="bold-weight heading-text">Edit Profile</h4>
                    <p
                        className="subheading-text">
                        People on Pinterest will get to know you with the info below
                    </p>
                </div>

                <div className="right s-buttons">
                    <button
                        className="s-button vertical-align bold-weight"
                        onClick={cancelSave}>
                        Cancel
                    </button>
                    <button 
                        className="s-button vertical-align redbg-color bold-weight"
                        onClick={saveData}>
                        Done
                    </button>
                </div>

                <br />
                <br />
                <br />
                <br />
                <hr />

                <div className="left">
                    <div className="subheading-text">Photo</div>
                    <div className="user-image right">
                        {profileImage === '' 
                            ? <i className="material-icons account-icon">account_circle</i>
                            : <img src={profileImage} className="account-image" alt="profile_icon"/>}
                        <button
                            className="s-button image-btn"
                            onClick={() => {changeModalDisplay(true)}}>
                            Change
                        </button>
                    </div>
                </div>

                <br />
                <br />
                <br />

                <div className="account-name">
                    <div className="left input-field">
                        <div className="subheading-text">First Name</div>
                        <input
                            type="text"
                            name="firstName"
                            onChange={handleChange}
                            value={firstName}
                            placeholder="John"
                            className="s-input"
                        />
                    </div>
                    <div className="right input-field">
                        <div className="subheading-text left">Last Name</div>
                        <input
                            type="text"
                            name="lastName"
                            onChange={handleChange}
                            value={lastName}
                            placeholder="Appleseed"
                            className="s-input left"
                        />
                    </div>
                </div>

                <br />
                <br />
                <br />
                <br />
                <div className="account-username">
                    <div className="subheading-text">Username</div>
                    <input
                        type="text"
                        name="username"
                        onChange={handleChange}
                        value={username}
                        placeholder=" johnappleseed"
                        className="s-input s-username"
                    />
                </div>

                <div className="account-about">
                    <div className="subheading-text">About your profile</div>
                    <textarea
                        className="s-textarea"
                        name="about"
                        onChange={handleChange}
                        value={about}
                        placeholder="Write a little bit about yourself here!"
                    />
                </div>

                <div className="account-location">
                    <div className="subheading-text">Location</div>
                    <input
                        type="text"
                        name="location"
                        onChange={handleChange}
                        value={location}
                        className="s-input s-location"
                        placeholder="Ex. San Francisco"
                    />
                </div>
            </div>

            {displayModal ? <div className={`overlay s-overlay`}></div> : ''}
            {displayModal ? <div className="s-modal img-modal">
                <h4 className="center">Select an Image</h4>

                <input
                    onChange={(e) =>  {changeProfileImage(e.target.value)}}
                    ref={fileRef} type="file" />

                <div className="right move-bottom">
                    <button
                        className="s-button"
                        onClick={() => {changeModalDisplay(false)}}
                        ref={closeBtnRef}>
                        Close
                    </button>
                    <button
                        className="s-button redbg-color" onClick={saveProfileImage}>
                        Save
                    </button>
                </div>
            </div> : ''}

                <img ref={loaderRef} src={logo} alt="loading" className="loader hide" />
        </div>
    )
}
