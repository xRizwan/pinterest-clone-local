import React, {useState, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import EditProfile from './Settings-Edit';
import AccountSettings from './Settings-Account';
import Preferences from './Preferences';

export default function Settings(){
    let [currentTab, changeCurrent] = useState('preferences');
    let [redirect, changeRedirect] = useState(false);
    let selectedRef = useRef('');

    const changeTab = (e) => {
        let eTarget = e.target;

            // change tab
            selectedRef.current.classList.remove('s-selected');
            selectedRef.current = e.target;

            eTarget.classList.add('s-selected');
            let tabName = eTarget.id;

            changeCurrent(tabName);
    }

    const sendBack = () => {
        changeRedirect(true);
    }

    return (
        <div className="row">
            {redirect ? <Redirect to="/main" /> : ''}
            <div className="col l3">
                <div className="left">
                    <i className="material-icons backward-btn" onClick={sendBack}>keyboard_backspace</i>
                </div>
                <br />
                <div className="right">
                    <div>
                        <i className="material-icons s-icon">edit</i>
                        <span
                            className="s-heading-text bold-weight"
                            id="profile"
                            onClick={changeTab}>
                            Edit Profile
                        </span>
                    </div>

                    <div>
                        <i className="material-icons s-icon">account_circle</i>
                        <span
                            className="s-heading-text bold-weight"
                            id="account"
                            onClick={changeTab}>
                            Account Settings
                        </span>
                    </div>

                    <div>
                        <i className="material-icons s-icon">favorite</i>
                        <span
                            className="s-heading-text bold-weight"
                            id="preferences"
                            ref={selectedRef}
                            onClick={changeTab}>
                            User Preferences
                        </span>
                    </div>
                </div>
            </div>

            {/* Edit profile tab */}
            {currentTab === "profile" ? <EditProfile mainClass="" /> : '' }
            
            {/* Account Settings tab */}
            {currentTab === "account" ? <AccountSettings mainClass="" /> : ''}

            {/* Account Preferences tab */}
            {currentTab === "preferences" ? <Preferences mainClass="" /> : ''}
            
        </div>
    )
}