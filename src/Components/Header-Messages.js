import React, {useState, useRef} from 'react';
import SearchedUsers from './Header-SearchedUsers';
import * as firebase from 'firebase/app';

export default function Messages(props){

    // states
    let [hideAll, changeHide] = useState(false);
    let [message, changeMessage] = useState(true);
    let [searched, changeSearched] = useState(false);
    let [foundUsers, changeFoundUsers] = useState([]);
    let [foundTarget, changeFoundTarget] = useState(false);
    let [tobeSent, changeToBeSent] = useState('');
    let [query, changeQuery] = useState('');
    let [queryId, changeQueryId] = useState('');

    // refs
    const usersRef = useRef();

    const displayMessagePanel = () => {
        changeHide(true);
        changeMessage(false);
    }

    const hideMessagePanel = () => {
        changeHide(false);
        changeMessage(true);
    }

    // control component
    const handleQueryChange = (e) => {
        changeQuery(e.target.value);
    }

    // function to find users from firebase that match the query
    const checkUsers = (e) => {

        // the current user
        let user = firebase.auth().currentUser;

        // value typed by the user
        let query = e.target.value;

        // if input is empty then return;
        if(query.length === 0){
            changeFoundUsers([]);
            return;
        }
        // refernce to the firestore
        const storeReference = firebase.firestore().collection('users');

        storeReference.get().then((snapshot) => {
            let documents = snapshot.docs;
            let arr = [];

            // going over each document
            documents.forEach(doc => {
                // all data from the store
                let data = doc.data();

                // document id represents a user id;
                let userID = doc.id;

                // if the user is the same then ignore
                if (userID === user.uid){
                    return;
                }

                // getting specified fields from the data
                let {firstName, lastName, username, profileImage} = data;

                // in case data does not exist replace with placeholder values
                firstName = !!firstName ? firstName : '';
                lastName = !!lastName ? lastName : '';
                username = !!username ? username : '';
                profileImage = !!profileImage ? profileImage : '';

                // saving data and the id in an array
                let fullData = [username, firstName, lastName, profileImage, userID];

                // combining all names for easier search
                let fullName = `${firstName.toLowerCase()} ${lastName.toLowerCase()} ${username.toLowerCase()}`;
                
                if(fullName.includes(query.toLowerCase())){
                    arr.push(fullData);
                }
                else if(userID.includes(query)){
                    arr.push(fullData);
                }
            })

            // if no user found replace with no user found
            if (arr.length === 0){
                arr = [["", "No", "User Found", "", ""]]
            }

            // updating state
            changeFoundUsers(arr);
            changeSearched(true);
            if(foundTarget){
                changeFoundTarget(false);
            }
        })
    }

    const makeScrollable = () => {
        usersRef.current.classList.add('found-users');
        usersRef.current.classList.add('blue-border');
    }

    const removeScollable = () => {

        usersRef.current.classList.remove('found-users');
        usersRef.current.classList.remove('blue-border');

        // reset search data
        changeSearched(false);
        changeFoundUsers([]);
    }

    const handleClick = (e) => {
        //
        let element = e.target;
        let mainTarget = '';

        // find the element with the data-id for that particular user
        while(element.parentNode) {
            let classes = element.classList;
            if(classes.contains('row')){
                mainTarget = element;
                break;
            }
            else {
                element = element.parentNode;
            }
        }

        let username = mainTarget.dataset.username;
        let userId = mainTarget.dataset.id;

        if (!!username){
            changeQuery(username);
        } else {
            changeQuery(userId);
        }

        changeQueryId(userId);
        changeFoundTarget(true);
        changeSearched(false);
    }

    const sendMessage = () => {
        let query = queryId;

        if(foundTarget){
            if(tobeSent === ''){
                return;
            }
            // handling database modelling for chat rooms
            const user = firebase.auth().currentUser;
            let storeReference = firebase.firestore().collection('chatrooms');
            storeReference.get().then(snapshot => {

                // making dynamic room name
                let roomName = `chat_${user.uid < query ? user.uid+ '_' + query : query + '_' + user.uid}`;
                
                // creating a collection and calculating message number and saving message
                storeReference.doc(roomName).collection('messages').get().then(snapshot => {

                    let length = snapshot.docs.length;
                    let messageName = `message${length + 1}`;

                    // getting date
                    let date = new Date();
                    let dated = date.getUTCDate();;
                    let day = date.getUTCDay();
                    let year = date.getUTCFullYear();
                    let month = date.getUTCMonth();

                    // saving the chat room
                    storeReference.doc(roomName).collection('messages').doc(messageName).set({
                        text: tobeSent,
                        date: firebase.firestore.FieldValue.serverTimestamp(),
                        by: user.uid,
                        monthUTC: month,
                        dayUTC: day,
                        yearUTC: year,
                        dateUTC: dated,
                    }).then(() => {

                        // adding to users chat rooms
                        let userRoomsRef = firebase.firestore().collection('userChatrooms');
                        userRoomsRef.doc(user.uid).set({
                            [roomName]: true,
                            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                        }, {merge: true})

                        userRoomsRef.doc(query).set({[roomName] : true}, {merge: true});

                        alert('success')
                        hideMessagePanel();
                        changeQuery('');
                        changeToBeSent('');
                    })
                })
            })
        } else {
            alert('Please enter A Valid User')
            return;
        }
    }

    return (
        <div className="right drop-down messages hide" ref={props.msgRef}>
            <div className={`subheading-text center ${hideAll ? 'hide' : ''}`}>
                <span
                    className="msg-heading bold-weight">Inbox</span>
                <span className="right msg-icons">
                    <i
                        className="material-icons msg-icon"
                        onClick={displayMessagePanel}>
                        edit
                    </i>
                </span>

                <div>Send a message</div>
            </div>

            <div className={`hide ${hideAll ? 'hide' : ''}`}>
                <h3
                    ref={props.msgInfoRef}
                    className="bold-weight msg-text">
                    Share ideas with your friends
                </h3>
            </div>

            <div className={`new-message ${message ? "hide" : ''}`}>
                <div className={`subheading-text`}>
                    <span
                        className="msg-heading bold-weight">New Message</span>
                    <span className="right msg-icons">
                        <button
                            className="s-button message-cancel"
                            onClick={hideMessagePanel}>
                                Cancel
                        </button>
                    </span>
                </div>

                <div className="message-to-input">
                    <div className="search-box">
                        <span className="bold-weight search-text">To:</span>
                        <span>
                            <input
                                type="text"
                                className="s-input search-user"
                                value={query}
                                onKeyUp={checkUsers} 
                                onClick={makeScrollable}
                                onChange={handleQueryChange}/>
                        </span>
                    </div>
                </div>
                <br />
                <div ref={usersRef} className="">
                        {searched ? <SearchedUsers hider={hideMessagePanel} clickFunc={handleClick} foundUsers={foundUsers}/>: ''}
                        </div>

                <div className="send-message-input">
                    <hr />
                    <div className="input-box">
                        <input 
                            placeholder="Add a message"
                            type="text"
                            value={tobeSent}
                            onChange={(e) => {changeToBeSent(e.target.value)}}
                            className="s-input message-user"
                            onClick={removeScollable}
                        />
                        <i className="material-icons send-icon" onClick={sendMessage}>send</i>
                    </div>
                </div>
            </div>

        </div>
    )
}