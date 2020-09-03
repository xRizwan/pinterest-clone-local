import React,{useEffect, useState } from 'react';
import {useSelector} from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import * as firebase from 'firebase/app';
import logo from '../images/logo.svg';
import UserProfileTabs from './UserProfile-Tabs';
//import {v4 as uuidv4} from 'uuid';

export default function Profile(props){
    let params = useParams();
    let [userData, changeUserData] = useState([]);
    let [found, changeFound] = useState(false);
    let [isCurrent, changeIsCurrent] = useState(false);
    let [loading, changeLoading] = useState(true);
    let [isFollowed, changeIsFollowed] = useState(false);
    let [following, changeFollowing] = useState(0);
    let [followers, changeFollowers] = useState(0);
    let [mainId, changeMainId] = useState('');
    let isLogged = useSelector(state => state.isLogged)
    let userId = params.userid;

    useEffect(() => {
        let abortController = new AbortController();

        let ref = firebase.firestore().collection('users').where('username', '==', userId);
        let ID = '';
        ref.get().then(snapshot => {
        
            console.log(snapshot.docs[0])
            let userinfo = snapshot.docs[0];
            if(!!userinfo){

                // data
                ID = userinfo.id;
                changeMainId(ID);

                let mainData = userinfo.data();
                let {profileImage, firstName, lastName, about} = mainData;
                let fullName = `${firstName ? firstName : ''} ${lastName ? lastName : ''}`;
                about = about ? about : '';
                profileImage = profileImage ? profileImage : '';

                let ref = firebase.firestore().collection('following');

                ref.doc(ID).collection('userFollowing').get().then(snapshot => {
                    changeFollowing(snapshot.docs.length);
                })

                // totalfollowers
                let totalFollowers = 0;

                // getting the total followers
                firebase.firestore().collectionGroup('userFollowing')
                .where('following', '==', ID).get()
                .then(snapshot => {
                    let followingAmount = snapshot.docs.length;
                    totalFollowers = followingAmount; 
                    return totalFollowers;
                }).then((result) => {
                    changeFollowers(result);
                    changeLoading(false)
                })

                changeUserData([fullName, about, profileImage]);
                changeFound(true);
                
            } else {
                console.log("not found")
                changeLoading(false)
                changeFound(false);
            }

            if(isLogged){
                let loggedInUserId = firebase.auth().currentUser.uid;
                if(!!loggedInUserId){
                    let isUser = loggedInUserId ===  ID ? true : false;
                    console.log(isUser);
                    
                    let ref = firebase.firestore().collection('following').doc(loggedInUserId);
                    ref
                        .collection('userFollowing')
                        .where("following", '==', ID)
                        .get().then(snapshot => {
                            if (snapshot.docs.length === 1){
                                changeIsFollowed(true);
                            }
                        })

                    changeIsCurrent(isUser);
                }
            }
        })

        return () => {
            console.log('aborting user profile');
            abortController.abort();
        }
    },[userId, isLogged, ])

    const saveFollow = () => {
        if(!isLogged || isCurrent || isFollowed || mainId === ''){
            return "Cant Follow"
        }
        let loggedInUserId = firebase.auth().currentUser.uid;
        let ref = firebase.firestore().collection('following').doc(loggedInUserId);
        ref
            .collection('userFollowing')
            .doc(mainId).set({
                following : mainId,
                by: loggedInUserId,
            }, {merge: true}).then(() => {
                changeFollowers(followers + 1);
                changeIsFollowed(true);
            });
    }

    const saveUnfollow = () => {
        if(!isLogged || isCurrent || !isFollowed || mainId === ''){
            return "Cant Follow"
        }
        let loggedInUserId = firebase.auth().currentUser.uid;
        let ref = firebase.firestore().collection('following').doc(loggedInUserId);
        ref.collection('userFollowing').doc(mainId).delete().then(() => {
            changeFollowers(followers - 1);
            changeIsFollowed(false);
        })
    }

    return(
        <div>
            <div className={`${!loading && !found ? '' : 'hide'} center not-found`}>Not Found</div>
            <div className={`${found ? 'bold-weight' : 'hide'}`}>
                <div className='center'>
                    { (userData[2] === '') ? <i className={"material-icons huge"}>account_circle</i>
                    : <img className="profile-picture center" alt="profileimage" src={userData[2]}/>}
                </div>
                <div className="name-container">
                    <div className="center name">{userData[0]}</div>
                </div>

                <div className="about-info-container">
                    <div className="center about-info">{userData[1]}</div>
                </div>
                <div className="follow-info center">
                    <Link to={`/user/${userId}/followers`}>
                        <span className="followers">{followers} followers</span>
                    </Link>
                    <Link to={`/user/${userId}/following`}>
                    <span className="following">{following} following</span>
                    </Link>
                </div>
                <div className="follow-container center">
                    <button
                        className={`s-button follow-btn redbg-color
                            ${isLogged && !isCurrent && !isFollowed ? '' : 'hide'}`}
                        onClick={saveFollow}>
                        Follow
                    </button>
                    <button
                        className={`  ${isFollowed && !isCurrent? '' : 'hide'} 
                            s-button follow-btn redbg-color`}
                        onClick={saveUnfollow}>
                        Unfollow
                    </button>
                </div>
                <div className={`${isLogged && isCurrent ? '' : 'hide'} add-pins`}>
                    <div className="add-container tooltip">
                        <Link to="/create-a-pin"><i className="material-icons add-icon">add</i></Link>
                        <Link className="tooltiptext" to="/create-a-pin">Add New Pin</Link>
                    </div>
                </div>
                {mainId ? <UserProfileTabs mainId={mainId}/> : ''}
            </div>

            <div className="center">
                <img className={`${!loading ? 'hide' : ''} profile-loader`} alt="loading" src={logo}></img>
            </div>
        </div>
    )
}