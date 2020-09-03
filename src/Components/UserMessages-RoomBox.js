import React, {useEffect, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as firebase from 'firebase/app';
import { setRoom, setTarget, setUser } from '../actions/';

export default function RoomBox(props){
    let isLogged = useSelector(state => state.isLogged);
    let [roomData, setroomData] = useState([]);
    let [lastMessage, setLastMessage] = useState([]);
    const [currentUser, setCurrentUser] = useState([]);
    const dispatcher = useDispatch();
    const [finishedLoading, setFinishedLoading] = useState(false);

    useEffect(() => {
        let abortController = new AbortController();

        if(isLogged){
            let user = firebase.auth().currentUser;
            if(!!user){
                firebase.firestore().collection('users').doc(user.uid).get().then(snapshot => {
                    let data = snapshot.data();
                    data.mainId = snapshot.id;

                    setCurrentUser(data);
                })

                const data = props.data;
                const {roomName, members} = data;

                let ref = firebase.firestore().collection('chatrooms').doc(roomName).collection('roomInfo').doc('lastMessage');
                let userRef = firebase.firestore().collection('users');

                let mainMember = '';

                // get memeber thats not the current user
                // to display his profile image
                for(let i = 0; i < members.length ; i++){
                    if(members[i] !== user.uid){
                        mainMember = members[i];
                        break;
                    }
                }

                // user is sending himself message
                // for development purposes only
                if (mainMember === ''){
                    mainMember = members[0];
                }

                ref.get().then(snapshot => {
                    let messageData = snapshot.data();
                    //console.log(messageData);

                    userRef.doc(mainMember).get().then((snapshot) => {
                        let docId = snapshot.id;
                        let userData = snapshot.data();

                        let {firstName, lastName} = userData;
                        userData.fullName = `${!!firstName ? firstName : ''} ${!!lastName ? lastName : ''}`

                        userData.mainId = docId;
                        setroomData(userData);

                        if(messageData.by === user.uid){
                            messageData.mainBy = 'you';
                        } else {
                            messageData.mainBy = `${!!userData.firstName ? userData.firstName : ''} ${!!userData.lastName ? userData.lastName : ''}` ;
                        }
                        setLastMessage(messageData);
                        setFinishedLoading(true)
                    })
                })
            }
        }

        return () => {
            console.log('aborting room boxes');
            abortController.abort();
        }
    }, [props.data, isLogged])

    const chosenRoom = (data, userData) => {
        if(finishedLoading === false){
            return;
        }
        dispatcher(setRoom(data));
        dispatcher(setTarget(userData))
        dispatcher(setUser(currentUser))
    }

    return (
        <div className="row room-container" onClick={() => {chosenRoom(props.data, roomData)}}>
            <div className="col l2">
                {!!roomData.profileImage
                    ? <img src={roomData.profileImage} className="account-image" alt="profileimage" />
                    : <i className="material-icons account-icon rounded-icon bordered">account_circle</i>}
            </div>
            <div className="flex-columned">
                <div className="col l10 ">
                    {!!roomData.fullName
                        ? <div className="room-name">{roomData.fullName}</div>
                        : ''}
                </div>
                <div className="col l12 room-last-message">
                    {!!lastMessage && !!roomData
                        ? <div>
                                <span className="main-by-name">
                                    {lastMessage.mainBy}
                                </span> said : {lastMessage.message}
                         </div>
                        : ''}
                </div>
            </div>
        </div>
    )
}