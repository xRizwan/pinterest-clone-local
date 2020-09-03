import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import * as firebase from 'firebase/app';

export default function Comment(props){
    const commentData = props.data
    let [likes, setLikes] = useState(0);
    const [profileImage, setProfileImage] = useState('');
    const [name, setName] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    let [isDeleted, setIsDeleted] = useState(false);
    let [isCurrent, setIsCurrent] = useState(false);
    let isLogged = useSelector(state => state.isLogged);

    useEffect(() => {

        let abortController = new AbortController();
        
        let commenter = commentData.by;
        let ref = firebase.firestore().collection('users').doc(commenter);
        ref.get().then(snapshot => {
            let data = snapshot.data();
            let {profileImage, firstName, lastName, username} = data;
            let fullName = `${!!firstName ? firstName : ''} ${!!lastName ? lastName : ''}`;
            profileImage = !!profileImage ? profileImage : '';
            let profileData = [fullName, username];
            setProfileImage(profileImage);
            setName(profileData);
        }).catch(err => console.log(err.message))

        let commentStoreRef = firebase.firestore()
                                    .collectionGroup('userLikes')
                                    .where('postId', '==', commentData.post)
                                    .where('commentBy', '==', commentData.by)
                                    .where('commentId', '==', commentData.commentId)
        commentStoreRef.get().then(snapshot => {
            let likes = snapshot.docs.length;
            setLikes(likes);
        }).catch(err => console.log(err.message))

        if (isLogged){
            let user = firebase.auth().currentUser;

            if(!!user){
                // reference to the collection where data about user
                // liked comments is stored
                let userCommentStoreRef = firebase.firestore()
                                        .collectionGroup('userLikes')
                                        .where('postId', '==', commentData.post)
                                        .where('likedBy', '==', user.uid)
                                        .where('commentBy', '==', commentData.by)
                                        .where('commentId', '==', commentData.commentId)

                // check if the logged in user has liked the comment before
                userCommentStoreRef.get().then(snapshot => {

                    // if any docs come back then user has liked it before
                    let likes = snapshot.docs.length;
                    if (likes > 0){
                        setIsLiked(true);
                    }
                }).catch(err => console.log(err.message))

                // if the current user is the commenter
                if(user.uid === commentData.by){
                    setIsCurrent(true);
                }
            }
        }

        return () => {
            abortController.abort();
        }
    }, [commentData, isLogged])

    const likeComment = () => {
        if (!isLogged || isLiked){
            alert('Please Login to perform this action')
            return;
        }
        let user = firebase.auth().currentUser;
        let commentStoreRef = firebase.firestore().collection('commentlikes').doc(user.uid).collection('userLikes');
        commentStoreRef.add({
            postId : commentData.post,
            commentBy: commentData.by,
            commentId: commentData.commentId,
            likedBy: user.uid,
        }).then(() => {
            setIsLiked(true)
            setLikes(prevState => prevState + 1)
        }).catch(err => console.log(err.message))
    }

    const unlikeComment = () => {
        if (!isLogged || !isLiked){
            alert('Please Login to perform this action')
            return;
        }
        let user = firebase.auth().currentUser;
        let commentStoreRef = firebase.firestore()
                                .collectionGroup('userLikes')
                                .where('postId', '==', commentData.post)
                                .where('likedBy', '==', user.uid)
                                .where('commentBy', '==', commentData.by)
                                .where('commentId', '==', commentData.commentId)
        commentStoreRef.get().then(snapshot => {
            let doc = snapshot.docs[0];
            doc.ref.delete().then(() => {
                setIsLiked(false);
                setLikes(prevState => prevState - 1)
            })
        }).catch(err => console.log(err.message))
    }

    const deleteComment = () => {
        if (!isLogged && !isCurrent){
            alert('login to perform this action')
            return;
        }
        let user = firebase.auth().currentUser;

        // firestore comment likes reference
        let likeStoreRef = firebase.firestore()
                                .collectionGroup('userLikes').where('commentId', '==', commentData.commentId)
        // firestore comment reference
        let commentStoreRef = firebase.firestore().collection('comments').doc(user.uid)
                                .collection('userComments').doc(commentData.commentId);
        
        // firestore post reference
        let postRef = firebase.firestore().collectionGroup('userPosts').where('docId', '==', commentData.post);
        postRef.get().then(snapshot => {
            let doc = snapshot.docs[0];
            let totalComments = doc.data().comments - 1;
            doc.ref.update({comments: totalComments}).then(() => {
                props.changeComments(totalComments);
            })
        })

        // delete the comment and...
        commentStoreRef.delete().then(() => {

            // get all the likes stored and delete them
            likeStoreRef.get().then(snapshot => {
                snapshot.docs.forEach(snap => {
                    snap.ref.delete()
                })
            }).then(() => {
                // then hide from the DOM
                setIsDeleted(true);

            }).catch(err => console.log(err.message))

        }).catch(err => console.log(err.message))
    }

    return(
        <div className={`row p-comment-container ${isDeleted ? "hide" : ''}`}>
            <div className="col l2">
                {profileImage === ''
                    ? <Link to={`/user/${name[1]}`}>
                        <i className="material-icons">account_circle</i>
                      </Link>
                    : <Link to={`/user/${name[1]}`}>
                        <img src={profileImage} alt="profile_picture" className="pin-user-image fix-location" />
                      </Link>}
            </div>
            <br />
            <div className="col l3">
                {name.length !== 0
                    ? <div>
                        <div className="comment-username">{name[0]}</div>
                     </div>
                    : ''}
            </div>
            <div className="col l12 left text-container">
                <div className="comment-message">{commentData.comment}</div>
            </div>
            <div className="col l3 icon-container">
                {isLiked === false ? <i
                    className="material-icons comment-icons"
                    onClick={likeComment}>
                    favorite_border
                </i> : <i
                    className="material-icons comment-icons"
                    onClick={unlikeComment}>
                    favorite
                </i>}
                {likes}
                {isCurrent 
                    ? <i
                        className="material-icons right comment-icons"
                        onClick={deleteComment}>
                            delete
                    </i>
                    : ''}
            </div>
        </div>
    )
}
