import React, {useState, useReducer, useEffect} from 'react';
import {useSelector} from 'react-redux';
import Select from 'react-select';
import * as firebase from 'firebase/app';

const db = firebase.firestore();

export default function AccountSettings(props){
    let passRef = React.useRef();
    let oldPassRef = React.useRef();
    let [defaultInputs, changeDefault] = useState();

    // base state for controlled input components
    const initialInputs = {
        oldPass: '',
        newPass: '',
        newAgain: '',
        email: '',
        gender: '',
        age: '',
    }

    // state that triggers modal show/hide
    let [showModal, changeShowModal] = useState(false);
    // userID obtained from the main component
    let userId = useSelector(state => state.userID)

    useEffect(() => {
        let abortController = new AbortController();

        // get current user info
        let user = firebase.auth().currentUser;
        if(!!user){
            let uid = user.uid;
            db.collection('users').doc(uid).get().then((result) => {
                let userData = result.data();
                let userAge = userData.age;
                let userEmail = !!userData.email ? userData.email : '';
                let userGender = !!userData.gender ? userData.gender : '';

                dispatch({field: "email", value: userEmail});
                dispatch({field: "age", value: userAge});
                dispatch({field: "gender", value: userGender});

                changeDefault(result.data());
            })
        }

        return () => {
            console.log('aborting settings-account')
            abortController.abort();
        }
    }, [userId, ])

    function reducerFunc(state, {field, value}){
        return {
            ...state,
            [field] : value
        }
    }

    const [state, dispatch] = useReducer(reducerFunc, initialInputs)
    const {oldPass, newPass, newAgain, email, gender, age} = state;

    // controlled inputs
    const handleChange = (e) => {
        dispatch({field: e.target.name, value: e.target.value})
    }
    const handleSelect = (option) => {
        dispatch({field: 'gender', value: option.value});
        console.log(option);
    }
    const updataData = () => {
        
        // https://www.w3resource.com/javascript/form/email-validation.php
        let emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if (email !== ''){
            if(!emailRegex.test(email)){
                alert("Invalid Email Address");
                return;
            }
        }
        if (Number(age) > 120){
            alert("How are you still alive, guest from the internet?");
            return
        }

        db.collection('users').doc(userId).update({
            email,
            age,
            gender,
        }).then(() => {alert("success")}).catch((err) => {
            alert(err.message);
        })

    }

    // closing the change password Modal
    function closeModals(){
        changeShowModal(false);

        // reset the values
        dispatch({field: "oldPass", value: ''})
        dispatch({field: "newPass", value: ''})
        dispatch({field: "newAgain", value: ''})
    }

    // show change password Modal
    const showPasswordModal = () => {
        changeShowModal(true);
    }

    const resetInput = (data) => {
        let {email, age, gender} = data;

        // replacing with placeholder values when no data found
        email = !!email ? email : '';
        age = !!age ? age : '';
        gender = !!gender ? gender : '';

        // changing states
        dispatch({field: 'email', value: email});
        dispatch({field: 'age', value: age});
        dispatch({field: 'gender', value: gender});
    }

    const cancelSave = () => {
        resetInput(defaultInputs);
    }

    // options for select(ing) gender.
    const options = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'non-binary', label: 'Non-Binary' },
    ]

    const updatePassword = () => {
        let user = firebase.auth().currentUser;

        if (newPass !== newAgain){
            passRef.current.textContent = "Password don't match";
            return;
        }

        let credential = firebase.auth.EmailAuthProvider.credential(
            firebase.auth().currentUser.email,
            oldPass,
        );

        user.reauthenticateWithCredential(credential).then(function() {
            // User re-authenticated.
            console.log("success")

            user.updatePassword(newPass).then(() => {
                passRef.current.textContent = "";
                oldPassRef.current.textContent = "";
                alert('success');
                closeModals();
                
            }).catch((err) => {
                alert(err.message);
            })

        }).catch(function(error) {
            oldPassRef.current.textContent = "Invalid Password";
        });

        
    }

    return(
        <div className={`${props.mainClass}`}>
            <div className="col l6 offset-l1">

                <div className="left main-info">
                    <h4 className="bold-weight heading-text">Account Settings</h4>
                    <p
                        className="subheading-text">
                        Set your login preferences, help us personalize your experience and make 
                        big account changes here.
                    </p>
                </div>

                <div className="right s-buttons">
                    <button
                        className="s-button vertical-align bold-weight"
                        onClick={cancelSave}
                        disabled={userId === '' ? true : false}>
                        Cancel
                    </button>
                    <button 
                        className="s-button vertical-align redbg-color bold-weight"
                        disabled={userId === '' ? true : false}
                        onClick={updataData}>
                        Done
                    </button>
                </div>

                <br />
                <br />
                <br />
                <br />
                <hr />

                <div className="left">
                    <div className="s-heading-text bold-weight not-opaque">Basic Information</div>
                    <div className="user-email right">
                        <div className="s-subheading-text">Email Address</div>

                            <input
                                type="email"
                                name="email"
                                onChange={handleChange}
                                value={email}
                                placeholder="JohnAppleseed@gmail.com"
                                className="s-input"
                            />
                    </div>
                </div>
                <br />
                <br />
                <br />

                <div className="left user-age">
                    <div className="s-subheading-text">Age</div>
                    <input
                        type="number"
                        placeholder="18"
                        value={Number(age)}
                        name="age"
                        onChange={handleChange}
                        className="s-input s-age"
                    />
                </div>

                <br />
                <br />
                <br />

                <div className="left">
                    <button
                        className="s-button change-passbtn bold-weight"
                        onClick={showPasswordModal}>
                        Change Your Password
                    </button>
                </div>

                <br />
                <br />

                <div className="left user-gender col l6">
                    <div className="s-subheading-text">Gender</div>
                    <Select
                        options={options}
                        value={options.filter((option) => option.value === gender)}
                        onChange={handleSelect}/>
                </div>

                <br />
                <br />
                <br />

                {showModal === true? <div className={`overlay s-overlay`}></div> : ''}
                {showModal === true ? <div className="s-modal">
                    <div className="center bold-weight">Change Your Password</div>
                    <br />
                    <div className="col l6 old-pass">
                        <div className="left col l3 s-subheading-text pass-header bold-weight">
                            Old Password
                        </div>
                        <div className="right col l3 s-old-pass">
                            <input
                                name="oldPass"
                                value={oldPass}
                                className="s-input"
                                onChange={handleChange} 
                                type="password" />
                            <div ref={oldPassRef} className="err"></div>
                        </div>

                        <br />
                        <br />
                        <div className="left col l6 h-row">
                            <hr />
                        </div>
                    </div>

                    <br />
                    <br />
                    <br />

                    <div className="col l6 new-pass">
                        <div className="left col l3 s-subheading-text pass-header bold-weight">
                            New Password
                        </div>
                        <div className="right col l3 s-new-pass">
                            <input
                                name="newPass"
                                value={newPass}
                                onChange={handleChange}
                                className="s-input"
                                type="password" 
                            />
                            <div className="err"></div>
                        </div>
                        <div className="left col l6 h-row">
                            <hr />
                        </div>
                    </div>

                    <br />
                    <br />
                    <br />

                    <div className="col l6 new-pass">
                        <div className="left col l3 s-subheading-text pass-header bold-weight">
                            Type it Again
                        </div>
                        <div className="right col l3 s-new-pass">
                            <input
                                className="s-input"
                                value={newAgain}
                                onChange={handleChange}
                                type="password"
                                name="newAgain"
                            />
                            <div ref={passRef} className="err"></div>
                        </div>
                    </div>

                    <br />
                    <br />
                    <br />

                    <div className="col l6 button-container">
                        <div className="move-right">
                            <button
                                className="s-button bold-weight bigger"
                                onClick={closeModals}>
                                Cancel
                            </button>
                            <button
                                className="s-button bold-weight redbg-color bigger"
                                onClick={updatePassword}>
                                Save
                            </button>
                        </div>
                    </div>



                </div> : ''}
            </div>
        </div>
    )
}