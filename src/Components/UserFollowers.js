import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import * as firebase from 'firebase/app';
import './styles/Following.css';
import UserBox from './UserFollowing-UserBox';


export default function UserFollowing(props){
    let params = useParams();
    //let [userData, setUserData] = useState([]);
    let [followingUsers, setFollowingUsers] = useState([]);
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
            let followingRef = firebase.firestore().collectionGroup('userFollowing').where('following', '==', userKey)
            followingRef.get().then(snapshots => {
                snapshots.docs.forEach(snap => {
                    console.log(snap.data().by)
                    arr.push(snap.data().by);
                })
            }).then(() => {
                setFollowingUsers(arr);
            })
        })

        return () => {
            console.log('aborting user followers')
            abortController.abort();
        }
    }, [userid])


    return(
        <div>
            <br />
            <div className="center heading-text">Followers</div>
            <br />
            {followingUsers.length !== 0
                ? <React.Fragment>
                    <div className="row">
                        {followingUsers.map((user, index) => {
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