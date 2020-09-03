import React from 'react';

export default function MessageBox(props){

    const handleClick = () => {
        props.clickhandle(props.msgId);
    }

    return (
        <div className="message-container" onClick={handleClick}>
            <div className={`row props.hide`}>
                <div className="col l2">
                    {!(!!props.profileImage) ? <i className="material-icons">account_cicle</i> :
                    <img src={props.profileImage} className="message-image" alt="user-img" />
                    }
                </div>
                <div className="col l3">
                    <div className="username-text">{props.username}</div>
                    <div className="last-message">{props.lastText}</div>
                </div>
            </div>
        </div>
    )
}