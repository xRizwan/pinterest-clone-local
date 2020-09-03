import React, {useEffect, useState} from 'react';
import * as firebase from 'firebase/app';
import {useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function UserBox(props){
    const [userData, setUserData] = useState([]);
    const [isCurrent, setIsCurrent] = useState(false);
    const [isFollowed, setIsFollowed] = useState(false);
    const isLogged = useSelector(state => state.isLogged);

    useEffect(() => {
        let abortController = new AbortController();

        if (!(!!props.data)){
            return;
        }
        let ref = firebase.firestore().collection('users').doc(props.data)
        ref.get().then(snapshot => {
            setUserData(snapshot.data());
        })

        if(isLogged){
            let user = firebase.auth().currentUser;
            if(!!user){
                if(user.uid === props.data){
                    setIsCurrent(true);
                } else {
                    let ref = firebase.firestore().collection('following').doc(user.uid).collection('userFollowing');
                    ref.where('following', '==', props.data).get().then(snapshot => {
                        if(snapshot.docs.length > 0){
                            setIsFollowed(true);
                        }
                    })
                }
            }
        }

        return () => {
            console.log('aborting userboxes')
            abortController.abort();
        }
    }, [props.data, isLogged])

    const followUser = () => {
        if(!isLogged || isCurrent){
            alert('Please login to perform this action!');
            return;
        }
        if (isFollowed){
            alert('Cannot follow the same person twice!')
        }

        let user = firebase.auth().currentUser;
        let ref = firebase.firestore().collection('following').doc(user.uid).collection('userFollowing');
        ref.add({
            following: props.data,
            by: user.uid,
        }).then(() => {
            setIsFollowed(true);
        })
    }

    const unfollowUser = () => {
        if(!isLogged || isCurrent){
            alert('Please login to perform this action!');
            return;
        }
        if (!isFollowed){
            alert('Cannot unfollow the same person twice!')
        }

        let user = firebase.auth().currentUser;
        let ref = firebase.firestore().collection('following').doc(user.uid).collection('userFollowing');
        ref.where('following', '==', props.data).get().then(snapshot => {
            let doc = snapshot.docs[0];
            doc.ref.delete().then(() => {
                setIsFollowed(false);
            })
        })
    }

    return (
        <div className="col l4 m8 s12 user-container center bordered">
            <div className="left user-image-container">
                {!!userData.profileImage
                    ? <Link to={`/user/${userData.username}`}>
                        <img className="account-image" src={userData.profileImage} alt="profileimage" />
                     </Link>
                    : <Link to={`/user/${userData.username}`}>
                        <i className="material-icons account-icon a-i">account_circle</i>
                    </Link>}
            </div>
            <div className="left">
                <div className="col l12 users-name bold-weight">
                <Link to={`/user/${userData.username}`}>
                    {!!userData.firstName ? `${userData.firstName} ` : ''} 
                    {!!userData.lastName ? userData.lastName : ''}
                </Link>
                </div>
                <br />
                <div className="left col l12 about-container">
                    {!!userData.about ? `${userData.about}` : ''}
                </div>
            </div>
            <div className="right">
                <div className="col l12">
                    {isLogged && !isFollowed && !isCurrent
                        ? <button
                            className="s-button refbg-color"
                            onClick={followUser}>
                            Follow
                        </button>
                        : ''}

                    {isLogged && isFollowed && !isCurrent
                        ? <button
                            className="s-button white-text blackbg-color"
                            onClick={unfollowUser}>
                            Unfollow
                         </button>
                        : ''}

                    {isCurrent
                        ? <button className="s-button white-text blackbg-color">Follows You</button>
                        : ''}
                </div>
            </div>
        </div>
    )
}