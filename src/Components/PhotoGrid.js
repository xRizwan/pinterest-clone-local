import React, {useEffect, useState, useRef} from 'react';
import Photo from './PhotoGrid-Photo';
import * as firebase from 'firebase/app';
import logo from '../images/logo.svg';

export default function PhotoGrid(props){
    let [displayedImages, setDisplayedImages] = useState([]);
    let [totalImages, setTotalImages] = useState([]);
    const [loading, setLoading] = useState(true);
    let containerRef = useRef();

    useEffect(() => {
        let abortController = new AbortController();
        //let user = firebase.auth().currentUser;
        let preferences = props.pref;

        let ref;
        if (!!props.following){
            ref = firebase.firestore().collectionGroup('userPosts').where('by','in', props.following).orderBy('created', 'desc');
        }
        else if(!!props.saved){
            ref = firebase.firestore().collectionGroup('userPosts').where('docId','in', props.saved).orderBy('created', 'desc');
        }
        else {
            ref = firebase.firestore().collectionGroup('userPosts').where('tag','in', preferences).orderBy('created', 'desc');
        }
        // .where('by', '!==', user.uid)

        let totalArr = [];
        let displayArr = [];

        ref.get().then(result => {
            result.docs.forEach(doc => {
                let {title, about, url, docId, by, tag} = doc.data();
                
                let imageInfo = [title, about, url, docId, by, tag];
                totalArr.push(imageInfo);
            })
        }).then(() => {

            // take a maximum of 20 images out of all the images obtained 
            for (let i = 0; i < 20; i++){

                if(totalArr[0]){
                    displayArr.push(totalArr.shift())
                } else {
                    break;
                }
            }
            setTotalImages(totalArr)
            setDisplayedImages(displayArr);
            setLoading(false);
        })
        .catch(err => {
            console.log(err)
            setLoading(false);
        })

        return () => {
            console.log('aborting photo grids');
            abortController.abort();
        }
    }, [props.pref, props.following, props.saved])

    useEffect(() => {
        const trackScrolling = () => {
            const wrappedElement = document.getElementById('top-el');
            if (isBottom(wrappedElement)) {
                let arr = [];
                let totalArr = totalImages;
                console.log('element bottom reached');
                    // take a maximum of 20 images out of all the images obtained 
                for (let i = 0; i < 20; i++){

                    if(totalArr[0]){
                        arr.push(totalArr.shift())
                    } else {
                        break;
                    }
                }
                
                setTotalImages(totalArr);
                if (arr.length > 0){
                    setDisplayedImages(prevstate => [...prevstate, ...arr])
                } else {
                 window.removeEventListener('scroll', trackScrolling)  
                }
            }
        };
        
        window.addEventListener('scroll', trackScrolling)

        return () => {window.removeEventListener('scroll', trackScrolling);}
    }, [totalImages, ])

    const isBottom = (el) => {
        return el.getBoundingClientRect().bottom <= window.innerHeight;
    }

    return(
        <div id="top-el">
            {displayedImages.length !== 0 ? <div className="photogrid-container" ref={containerRef}>
                {displayedImages.map((image, index) => {
                    return (
                        <Photo imageData={image} key={index} deletable={!!props.saved ? true : false}/>
                    )
                })}
            </div> : <div className="center">No pins found</div>}
            <div className="center">
                <img className={`${!loading ? 'hide' : ''} loaderv2`} alt="loading" src={logo} />
            </div>
        </div>
    )
}