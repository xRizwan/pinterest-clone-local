import React, {useRef, useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import PhotoGrid from './PhotoGrid';
import * as firebase from 'firebase/app';

export default function UserProfileTabs(props){
    const personalRef = useRef();
    const savedRef = useRef();
    const [showPersonal, setShowPersonal] = useState(true);
    const isLogged = useSelector(state => state.isLogged);
    const [savedPinData, setSavedPinData] = useState([]);

    // eslint-disable-next-line
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        let abortController = new AbortController();

        let arr = [];
        let ref = firebase.firestore().collection('savedPins').doc(props.mainId).collection('userSaved');
        ref.orderBy('savedOn').get()
            .then(snapshots => snapshots.docs)
            .then(docs => {
                docs.forEach(doc => {
                    arr.push(doc.data().postId)
                })
            })
            .then(() => {
                setSavedPinData(arr);
                console.log(arr);
            })
        return () => {
            console.log('aborting profile tabs');
            abortController.abort();
        }
    }, [isLogged, props.mainId])

    const showPersonalClick = () => {
        personalRef.current.classList.add('selected');
        savedRef.current.classList.remove('selected');

        setShowPersonal(true);
        setShowSaved(false);
    }

    const showSavedClick = () => {
        personalRef.current.classList.remove('selected');
        savedRef.current.classList.add('selected');

        setShowPersonal(false);
        setShowSaved(true);
    }

    return (
        <div>
            <div className="pins center">
                <span className="tab selected" ref={personalRef} onClick={showPersonalClick}>Personal</span>
                <span className="tab" ref={savedRef} onClick={showSavedClick}>Saved</span>
            </div>
            <br />
            <div className={`${showPersonal ? '' : 'hide'}`}>
                {props.mainId ? <PhotoGrid following={[props.mainId]}/> : ''}
            </div>
            <div className={showSaved ? '' : 'hide'}>
                {savedPinData.length > 0 ? <PhotoGrid saved={savedPinData}/>
                : <div className="center not-found">No Saved Pins</div>}
            </div>
        </div>
    )
}