import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import * as firebase from 'firebase/app';

export default function SearchedTags(props){
    let [foundTags, setFoundTags] = useState([]); 
    let [noneFound, setNoneFound] = useState(false);
    
    useEffect(() => {
        let abortController = new AbortController();

        if(props.qData === ''){
            setFoundTags([]);
            setNoneFound(true);
            return;
        }

        let arr = [];

        let ref = firebase.firestore().collection('tags');
        ref.get()
        .then(snapshots => snapshots.docs)
        .then(snapshot => {
            if(snapshot.length === 0){
                setNoneFound(true);
                setFoundTags([]);
                return;
            }

            snapshot.forEach(snap => {
                let name = snap.data().name;
                if(name.includes(props.qData.toLowerCase())){
                    arr.push(name);
                    setNoneFound(false);
                }
            })
        })
        .then(() => {
            console.log(arr);
            setFoundTags(arr);
        })

        return () => {
            console.log('aborting tag search')
            abortController.abort();
        }
    }, [props.qData])

    return(
        <div
            className={`found-panel big-container 
                        ${props.hidden === true ? 'hide' : ''}`}>
            {foundTags.map((cur, index) => {
                return(
                    <Link to={`/search/${cur}`} onClick={() => {props.makeSmaller()}} key={index}>
                        <div
                            className="left black-text">

                                <div className="boxed bordered">

                                    {cur}

                                </div>

                        </div>

                        <br />
                    </Link>
                )
            })}
            {noneFound ? <div className="center special-boxed">No Results</div> : ''}
        </div>
    )
}