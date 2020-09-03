import React, {useEffect, useState, useRef} from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import Comment from './PinInfo-Comment';
import * as firebase from 'firebase/app';
import './styles/PinInfo.css';
import {Redirect} from 'react-router-dom';
import PhotoGrid from './PhotoGrid';

export default function PinInfo(props){
    let {pinid} = useParams();
    let [allComments, setAllComments] = useState([]);
    let [numberOfComments, setNumberOfComments] = useState(0);
    let [pinInfo, setPinInfo] = useState([]);
    let [userInfo, setUserInfo] = useState([]);
    let [tags, setTags] = useState([]);
    let [userFollowers, setUserFollowers] = useState(0);
    let [isCurrent, setIsCurrent] = useState(false);
    let [sendToMain, setSendToMain] = useState(false);
    let [comment, setComment] = useState('');
    let [isFollowed, setIsFollowed] = useState(false);
    let isLogged = useSelector(state => state.isLogged)

    let commentAreaRef = useRef();
    let commentRef = useRef();
    let saveRef = useRef();
    let cancelRef = useRef();

    useEffect(() => {
        let abortController = new AbortController();

        let ref = firebase.firestore().collectionGroup('userPosts').where('docId', '==', pinid);
        let commentStoreRef = firebase.firestore().collectionGroup('userComments').where('post', '==', pinid)

        let arr = [];
        commentStoreRef.orderBy('date', 'desc').get().then(snapshot => {
            snapshot.docs.forEach(snap => {
                if(!!snap){
                    arr.push(snap.data())
                }
            })
        }).then(() => {
            setAllComments(arr);
        })

        ref.get().then(snapshots => {
            console.log(snapshots.docs)
            let data = snapshots.docs[0].data();
            let {url, by, docId, title, about, comments, tag, path} = data;
            const pinInfo = [url, about, docId, title, tag, by, path];
            setPinInfo(pinInfo);
            setNumberOfComments(comments);
            setTags([tag]);

            let userRef = firebase.firestore().collection('users').doc(by)

            userRef.get().then(snapshot => {
                let data = snapshot.data();
                if(!!data){
                    let {profileImage, firstName, lastName, username} = data;
                    let fullName = `${!!firstName ? firstName : ''} ${!!lastName ? lastName : ''}`;
                    profileImage = !!profileImage ? profileImage : 'none';
                    const userInfo = [fullName, username, profileImage];

                    setUserInfo(userInfo);

                    let followerRef = firebase.firestore().collectionGroup('userFollowing')
                    followerRef.where('following', '==', by).get().then(snapshot => {
                        let followers = snapshot.docs.length;
                        setUserFollowers(followers);
                    })
                }
            }).catch(err => alert(err.message))

            // if the user visiting the page is the same as the one who
            // created the pin
            if (isLogged){
                let user = firebase.auth().currentUser;
                if (by === user.uid){
                    setIsCurrent(true);
                } else {
                    let ref = firebase.firestore().collection('following').doc(user.uid).collection('userFollowing');
                    ref.where('following', '==', pinInfo[5]).get().then(snapshot => {
                        if(snapshot.docs.length > 0){
                            setIsFollowed(true);
                        }
                    })
                }
            }

        }).catch(err => alert(err.message))

        return () => {
            console.log('aborting pininfo')
            abortController.abort();
        }
    }, [pinid, isLogged])

    const commentDisplayToggle = (e) => {
        let target = e.target;
        if (commentRef.current.classList.contains('hide')){
            target.textContent = "keyboard_arrow_down";
            commentRef.current.classList.remove('hide')
        } else {
            target.textContent = "keyboard_arrow_right";
            commentRef.current.classList.add('hide')
        }
    }

    const showButtons = (e) => {
        const target = e.target;
        target.classList.add('bigger-input');
        cancelRef.current.classList.remove('hide');
        saveRef.current.classList.remove('hide');
    }

    const cancelComment = (e) => {
        cancelRef.current.classList.add('hide');
        saveRef.current.classList.add('hide');
        commentAreaRef.current.classList.remove('bigger-input');
        setComment('');
    }

    const sendComment = (e) => {
        if (comment === ''){
            alert("Please don't try to send an empty comment!");
            return;
        }
        if(!isLogged){
            alert("Please login to perform this action!");
            return;
        }

        let target = e.target;
        target.disabled = true;

        let user = firebase.auth().currentUser;
        let ref = firebase.firestore().collection('comments').doc(user.uid).collection('userComments');
        ref.add({
            post: pinid,
            by: user.uid,
            comment: comment,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
        }).then((snapshot) => {

            ref.doc(snapshot.id).update({
                commentId: snapshot.id,
            })
            let totalComments = numberOfComments;
            let by = pinInfo[5];

            let pinRef = firebase.firestore().collection('posts').doc(by).collection('userPosts');
            totalComments = totalComments + 1;
            
            pinRef.doc(pinid).update({comments : totalComments}).then(() => {

                // enabling the button
                target.disabled = false;

                // close comment input
                cancelComment();

                // increase the total number of comments in the state
                setNumberOfComments(prevState => prevState + 1);
                
                // add the comment to the state
                snapshot.get().then(snapshot => {
                    setAllComments(prevState => [...prevState, snapshot.data()])
                })
            })
        })
    }

    const changeComments = (value) => {
        setNumberOfComments(value);
    }

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
            following: pinInfo[5],
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
        ref.where('following', '==', pinInfo[5]).get().then(snapshot => {
            let doc = snapshot.docs[0];
            doc.ref.delete().then(() => {
                setIsFollowed(false);
            })
        })
    }

    const deletePin = () => {
        if(!isLogged && !isCurrent){
            alert('please login to perform this action!');
            return;
        }

        let storageRef = firebase.storage().ref().child(pinInfo[6]);

        let ref = firebase.firestore().collectionGroup('userPosts').where('docId', '==', pinid);
        let commentStoreRef = firebase.firestore().collectionGroup('userComments').where('post', '==', pinid)
        ref.get().then(snapshot => {
            snapshot.docs.forEach(snap => {
                snap.ref.delete()
            })
        }).then(() => {
            storageRef.delete();
            setSendToMain(true)
        })

        commentStoreRef.get().then(snapshot => {
            snapshot.docs.forEach(snap => {
                let likeStoreRef = firebase.firestore()
                                .collectionGroup('userLikes').where('commentId', '==', snap.data().commentId)
                likeStoreRef.get().then(snapshots => {
                    snapshots.docs.forEach(snap => {
                        snap.ref.delete()
                    })
                }).then(() => {
                    snap.ref.delete().then(() => {
                    })
                })
            })
        })
    }

    const savePin = () => {
        if(!isLogged || isCurrent){
            alert('Login to perform this action!');
            return;
        }
        if(isCurrent){
            alert('Dont Save Your Own Pin!');
            return;
        }

        let user = firebase.auth().currentUser
        let ref = firebase.firestore().collection('savedPins').doc(user.uid).collection('userSaved');
        ref.add({
            savedOn: firebase.firestore.Timestamp.fromDate(new Date()),
            savedBy: user.uid,
            postId: pinInfo[2]
        }).then(alert('saved'))
        .catch(err => console.log(err.message))
    }

    return (
        <div>
            {sendToMain ? <Redirect to="/main" /> : ''}
            <div className="row">
                <div className="col l1 s6 backward-button-container">
                    <Link to="/main">
                        <i className="material-icons right pin-icon">keyboard_backspace</i>
                    </Link>
                </div>
                {pinInfo.length !== 0
                ? <React.Fragment>
                    <div className="col l5 m8 pin-image-container">
                        <a href={`${pinInfo[0]}`} rel="noopener noreferrer" target="_blank">
                            <img src={pinInfo[0]} alt="pin" className="pin-image" />
                        </a>
                    </div>
                    <div className="col l5 info-container">
                        <div className="col l12">
                            <div className="left">
                                <a href={`${pinInfo[0]}`} download rel="noopener noreferrer" target="_blank">
                                    <i className="material-icons pin-icon">cloud_download</i>
                                </a>
                                {isCurrent === true
                                    ? <i
                                        className="material-icons pin-icon"
                                        onClick={deletePin}>delete</i>
                                    : ''}
                            </div>
                            <div className="right">
                                <button
                                    className="s-button redbg-color save-btn"
                                    onClick={savePin}>
                                        Save
                                </button>
                            </div>
                        </div>
                        <div className="col l12">
                            <div className="bold-weight pin-title">{pinInfo[3]}</div>
                        </div>
                        {userInfo.length !== 0
                            ? <div className="col l12 uploaders-info">
                                Uploaded By
                                <span> </span>
                                <Link to={`/user/${userInfo[1]}`}>
                                    <span className="bold-weight name-link">{userInfo[0] !== '' ? userInfo[0] : 'Nameless User'}</span>
                                </Link>
                            </div>
                            : ''}

                        {userInfo.length !== 0
                            ? <div className="col l12 user-images">
                                {userInfo[2] === 'none'
                                    ?<Link to={`/user/${userInfo[1]}`}>
                                        <i className="material-icons pin-user-icon">account_circle</i>
                                    </Link>
                                    :<Link to={`/user/${userInfo[1]}`}> <img
                                        src={userInfo[2]}
                                        alt="userprofileimage"
                                        className="pin-user-image" /> </Link> }
                                <div className="user-nf-container">
                                    <span className="users-name bold-weight name-link">{userInfo[0]}</span>
                                    <div className="users-followers">{userFollowers} followers</div>
                                </div>
                                <div className="follow-btn-container">
                                    {isCurrent
                                        ? <i className="material-icons emote">tag_faces</i> 
                                        : <div>
                                            {!isFollowed
                                                ? <button
                                                    onClick={followUser}
                                                    className="s-button right bold-weight redbg-color">
                                                        Follow
                                                 </button>
                                                : <button
                                                    onClick={unfollowUser}
                                                    className="s-button right bold-weight">
                                                        Unfollow
                                                </button>}
                                        </div>}
                                </div>
                              </div>
                            : ''}
                            <div className="col l12 comments-container">
                                <div className="comments bold-weight">
                                    {numberOfComments} comments
                                    <i
                                        className="material-icons comment-opener"
                                        onClick={commentDisplayToggle}>
                                            keyboard_arrow_right
                                    </i>
                                    <div ref={commentRef} className="all-comments hide">
                                        <div className="comment-input-box">
                                            <textarea 
                                                className="comment-text"
                                                placeholder="Enter A Comment"
                                                ref={commentAreaRef}
                                                value={comment}
                                                onChange={(e) => {setComment(e.target.value)}}
                                                onClick={showButtons}
                                            />
                                            <button
                                                ref={cancelRef}
                                                className="s-button hide"
                                                onClick={cancelComment}>
                                                    Cancel
                                            </button>
                                            <button
                                                ref={saveRef}
                                                className="s-button hide redbg-color"
                                                onClick={sendComment}>
                                                    Send
                                            </button>
                                            {allComments.length !== 0
                                                ? <div>
                                                    {allComments.map((comment, index) => {
                                                        return (
                                                            <Comment
                                                                changeComments={changeComments}
                                                                key={index}
                                                                data={comment}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                                : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                </React.Fragment>
                : ''}
            </div>
            <div className="center">More Like This!</div>
            <div className="">
                {tags.length !== 0
                    ? <PhotoGrid pref={tags} />
                    : ''}
            </div>
        </div>
    )
}