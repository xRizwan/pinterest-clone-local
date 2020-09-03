import React, {useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import logo from '../images/logo.svg';
import * as firebase from 'firebase/app';
import PhotoGrid from './PhotoGrid';

export default function Following(){
    let isLogged = useSelector(state => state.isLogged);
    let [loading, setLoading] = useState(true);
    let [following, setFollowing] = useState([]);

    useEffect(() => {
        let abortController = new AbortController();

        if(isLogged){

            let arr = [];
            let user = firebase.auth().currentUser;
            if(!!user){
                let followingRef = firebase.firestore().collection('following').doc(user.uid).collection('userFollowing');
                followingRef.get().then(snapshot => {
                    snapshot.docs.forEach(doc => {
                        console.log(doc.data());
                        arr.push(doc.data().following);
                    })
                }).then(() => {
                    setFollowing(arr);
                    setLoading(false);
                })
            }
        }

        return () => {
            console.log('aborting following');
            abortController.abort();
        }
    }, [isLogged])

    return(
        <div>
            <div className={`${!loading ? 'hide' : 'center'}`}>
                <img src={logo} alt="loading" className="loaderv2"/>
            </div>

            <div>
                {following.length !== 0
                    ? <PhotoGrid following={following}/>
                    : <div className="center">No Posts</div>}
            </div>
        </div>
    )
}