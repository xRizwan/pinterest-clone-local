import React, {useEffect, useState} from 'react';
import * as firebase from 'firebase/app';
import { useSelector, useDispatch } from 'react-redux';
import { setTarget, setUser } from '../actions/';

export default function SearchedUsers(props){
    let [foundUsers, setFoundUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState([]);
    const isLogged = useSelector(state => state.isLogged);
    const dispatcher = useDispatch();

    useEffect(() => {
        let abortController = new AbortController();
        // eslint-disable-next-line
        let user = '';
        if(isLogged){
            // the current user
            user = firebase.auth().currentUser;
            if(!!user){
                firebase.firestore().collection('users').doc(user.uid).get().then((snapshot) => {
                    let data = snapshot.data();
                    data.mainId = snapshot.id; 
                    setCurrentUser(data)
                })
            }
        }

        // if input is empty then return;
        if(props.qData.length === 0){
            setFoundUsers([]);
            return;
        }

        // refernce to the firestore
        const storeReference = firebase.firestore().collection('users');

        let arr = [];

        storeReference.get()
        .then(snapshot => snapshot.docs)
        .then(snapshot => {
            if(snapshot.length === 0){
                setFoundUsers([]);
                return;
            }

            snapshot.forEach(snap => {
                let docId = snap.id;
                let data = snap.data();
                let {firstName, lastName, username} = data;
                let allData = `${firstName ? firstName  : ''} ${lastName ? lastName : ''} ${username} ${docId}`;

                if(allData.toLowerCase().includes(props.qData)){
                    data.mainId = docId;
                    arr.push(data);
                }
            })
        })
        .then(() => {
            setFoundUsers(arr);
        })


        return () => {
            console.log('aborting search for users')
            abortController.abort();
        }
    }, [props.qData, isLogged])

    const changeTarget = (value) => {
        dispatcher(setTarget(value));
        dispatcher(setUser(currentUser));
        props.reset();
    }

    return (
        <div className={`relativized ${props.hidden === true ? 'hide' : ''}`}>
            <div className="user-found-panel blue-bordered">
                {foundUsers.map((cur ,index) => {
                    return (
                        <React.Fragment key={index}>
                            <div className="row m-u-container" onClick={() => {changeTarget(cur)} }>
                                <div className="col l3">
                                    {cur.profileImage
                                        ? <img
                                            src={cur.profileImage}
                                            className="account-image m-account-image" 
                                            alt="profileimage"/>
                                        : <i
                                            className="material-icons account-icon m-account-icon">
                                                account_circle
                                        </i>
                                    }
                                </div>
                                <div
                                    className="col l8 s8 m-account-name">
                                        {!!cur.firstName ? `${cur.firstName} ` : ''}
                                        {!!cur.lastName ? cur.lastName : ''}
                                </div>
                                <div className="col l8 s7 m-account-username">
                                    {cur.username}
                                </div>
                            </div>
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}