import React, {useState} from 'react';
import * as firebase from 'firebase/app';
import {Link} from 'react-router-dom';

export default function Photo(props){
    let [hidden, setHidden] = useState(false);

    // for deleting saved pins;
    const deletePin = () => {
        let docId = props.imageData[3];
        const user = firebase.auth().currentUser;
        const ref = firebase.firestore().collection('savedPins').doc(user.uid).collection('userSaved');
        ref.where('postId', '==', docId)
            .get()
            .then(snapshot => {snapshot.docs[0].ref.delete()})
            .then(() => {
                setHidden(true);
            })
    }

    return (
        <div className={`fixed-width ${hidden ? 'hide' : ''}`}>
            <div className={`photogrid-photo`}>
                {!!props.deletable && props.deletable === true
                    ? <i className="material-icons delete-saved-pin" onClick={deletePin}>delete</i>
                    : ''}
                <Link to={`/pin/${props.imageData[3]}`}>
                    <img
                        className={`auto-fit1`}
                        src={props.imageData[2]}
                        load="lazy"
                        alt={'userpost'}
                        data-title={props.imageData[1]}
                        data-postid={props.imageData[3]}
                        data-by={props.imageData[4]}
                        data-tag={props.imageData[5]}
                    />
                </Link>
            </div>
        </div>
    )
}