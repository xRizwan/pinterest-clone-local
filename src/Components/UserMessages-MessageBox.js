import React, {useEffect, useState, useRef} from 'react';
import { useSelector } from 'react-redux';

export default function MessageBox(props){
    const message = props.data;
    //const isLogged = useSelector(state => state.isLogged);
    const user = useSelector(state => state.user);
    const target = useSelector(state => state.target);
    const [isCurrent, setIsCurrent] = useState(false);
    const [profileImage, setProfileImage] = useState('');
    const messageBoxRef = useRef();

    useEffect(() => {
        let abortController = new AbortController();

        if(user.mainId === message.by){
            let image = !!user.profileImage ? user.profileImage : '';
            setIsCurrent(true);
            setProfileImage(image);
        } else {
            let image = !!target[0].profileImage ? target[0].profileImage : '';
            setProfileImage(image);
            setIsCurrent(false);
        }

        return () => {
            console.log('aborting chat-messageboxes');
            abortController.abort();
        }
    }, [user, message, target])

    return(
        <React.Fragment>
            <div ref={messageBoxRef} className={`flex-columned ${isCurrent ? 'fix-right' : ''} message-box`}>
                {!isCurrent
                    ? <React.Fragment>
                        {profileImage !== ''
                            ? <img src={profileImage} className="account-image chat-image" alt="userphoto"/>
                            : <i className="material-icons account-icon chat-image">account_circle</i>}
                    </React.Fragment>
                    : ''}
                <div className="message-text-box">
                    {message.message}
                </div>
            </div>
        </React.Fragment>
    )
}