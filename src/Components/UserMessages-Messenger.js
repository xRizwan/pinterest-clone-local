import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { resetTarget } from '../actions/';
import * as firebase from 'firebase/app';

export default function Messenger(){
    const isLogged = useSelector(state => state.isLogged);
    const target = useSelector(state => state.target);
    const [message, setMessage] = useState('');
    const dispatcher = useDispatch();

    const handleChange = (e) => {
        setMessage(e.target.value);
    }

    const sendMessage = () => {
        if(message === ''){
            alert('Cannot send empty messages!');
            return;
        } else if(!isLogged){
            alert('Please login to perform this action!');
            return;
        }

        let user = firebase.auth().currentUser;
        let targetId = target[0].mainId;
        const roomName = user.uid < targetId ? `chat_${user.uid}_${targetId}` : `chat_${targetId}_${user.uid}`;

        let ref = firebase.firestore().collection('chatrooms').doc(roomName);
        let firstTime = false;

        ref.collection('roomInfo').doc('mainInfo').get().then(snap => {
            if(!!snap.data()){

                ref.collection('roomInfo').doc('mainInfo').set({
                    lastMessageBy: user.uid,
                    lastSeenBy: user.uid,
                    lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
                }, {merge: true})
            } else {
                firstTime = true;

                ref.collection('roomInfo').doc('mainInfo').set({
                    members : [user.uid, targetId],
                    roomName: roomName,
                    created: firebase.firestore.FieldValue.serverTimestamp(),
                    lastMessageBy: user.uid,
                    lastSeenBy: user.uid,
                    lastMessageDate: firebase.firestore.FieldValue.serverTimestamp(),
                }, {merge: true})
            }
        })
        .then(() => {
        })

        ref.collection('roomInfo').doc('lastMessage').set({
            by: user.uid,
            to: targetId,
            message: message,
            date : firebase.firestore.FieldValue.serverTimestamp(),
        }, {merge: true})

        ref.collection('messages').add({
          by: user.uid,
          to: targetId,
          message: message,
          date : firebase.firestore.FieldValue.serverTimestamp(),
        }).then(() => {
            if(firstTime){
                dispatcher(resetTarget())
            } else {
                setMessage('');
            }
        })
        
        .catch(err => console.log(err.message))

    }

    return (
        <div className="messenger-input m-flexed">
            <div>
            <input 
                type="text"
                value={message}
                onChange={handleChange}
                className="m-input"
                placeholder="Send A Message"
            />
            </div>
            <button className="s-button">
                <i className="material-icons m-send-icon" onClick={sendMessage}>send</i>
            </button>
        </div>
    )
}