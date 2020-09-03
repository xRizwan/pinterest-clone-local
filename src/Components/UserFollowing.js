import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import * as firebase from 'firebase/app';
import './styles/Following.css';
import UserBox from './UserFollowing-UserBox';


export default function UserFollowing(props){
    let params = useParams();
    //let [userData, setUserData] = useState([]);
    let [followedUsers, setFollowedUsers] = useState([]);
    let {userid} = params;

    useEffect(() => {
        let abortController = new AbortController();

        let ref = firebase.firestore().collection('users')
        let userKey = '';

        ref.where('username', '==', userid).get().then((snapshots) => {
            snapshots.forEach(snap => {
                userKey = snap.id
                //setUserData(snap.data());
            })
        }).then(() => {

            let arr = []
            let followingRef = firebase.firestore().collection('following').doc(userKey).collection('userFollowing');
            followingRef.get().then(snapshots => {
                snapshots.docs.forEach(snap => {
                    arr.push(snap.data().following);
                })
            }).then(() => {
                setFollowedUsers(arr);
            })
        })

        return () => {
            console.log('aborting user following')
            abortController.abort();
        }
    }, [userid])


    return(
        <div>
            <br />
            <div className="center heading-text">Following</div>
            <br />
            {followedUsers.length !== 0
                ? <React.Fragment>
                    <div className="row">
                        {followedUsers.map((user, index) => {
                            return (
                                <UserBox data={user} key={index} />
                            )
                        })}
                    </div>
                </React.Fragment>
                : <div className="center">None</div>}
        </div>
    )
}