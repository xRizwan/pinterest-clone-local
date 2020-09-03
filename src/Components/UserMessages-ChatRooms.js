import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as firebase from 'firebase/app';
import RoomBox from './UserMessages-RoomBox';

export default function ChatRooms(){
    const isLogged = useSelector(state => state.isLogged);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        let abortController = new AbortController();
        let unsub = () => {};

        if(isLogged){
            const user = firebase.auth().currentUser;
            if(!!user){
                let ref = firebase.firestore().collectionGroup('roomInfo').where('members', 'array-contains', user.uid);
                
                unsub = ref.onSnapshot(snapshot => {
                    let arr = [];
                    let docs = snapshot.docs;
                    // let changes = snapshot.docChanges();
                    // changes.forEach(change => {
                    //     console.log(change.doc.data())
                    // })
                
                    docs.map((doc, index) => {
                
                        if(!(doc.metadata.hasPendingWrites)){
                            arr.push(doc.data());

                            if(!(!!docs[index + 1])){
                                setRooms(arr);
                                //console.log(arr);
                            }
                        }
                        return 0;
                        
                    })
                })
            }
        }
        
        return () => {
            console.log('unsubscribing from chat rooms');
            unsub()
            abortController.abort();
        }
    }, [isLogged])

    return(
        <div>
            <React.Fragment>
                {rooms.map((cur, index) => {
                    return (
                        <RoomBox key={index} data={cur}/>
                    )
                })}
            </React.Fragment>
        </div>
    )
}