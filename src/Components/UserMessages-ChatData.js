import React, { useEffect, useState } from 'react';
import {useSelector} from 'react-redux';
import * as firebase from 'firebase/app';
import MessageBox from './UserMessages-MessageBox';

export default function Chats(){
    const room = useSelector(state => state.room);
    const isLogged = useSelector(state => state.isLogged);
    const [messages, setMessages] = useState([]);
    console.log(room);

    useEffect(() => {
        let abortController = new AbortController();

        if(!(!!room.roomName)){
            return;
        }

        let unsub = () => {};

        if(isLogged){
            const { roomName } = room;
            let ref = firebase.firestore().collection('chatrooms')
                        .doc(roomName).collection('messages').orderBy('date', 'desc')
        
            unsub = ref.onSnapshot(snapshot => {
                let docs = snapshot.docs;
                let arr = [];

                docs.map((cur, index) => {
                    if(!cur.metadata.hasPendingWrites){
                        arr.push(cur.data());

                        if(!(!!docs[index + 1])){
                            setMessages(arr);
                            //console.log(arr);
                        }
                    }
                    return 0;
                })
            })
        }

        return () => {
            console.log('unsubscribing from chat data')
            unsub()
            abortController.abort();
        }
    }, [room, isLogged])

    return(
        <div className="chats-container">
            {messages.length > 0
                ? <React.Fragment>
                    {messages.map((cur, index) => {
                        return(
                            <MessageBox data={cur} key={index} />
                        )
                    })}
                 </React.Fragment>
                : ''}
        </div>
    )
}