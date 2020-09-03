import React, {useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import PhotoGrid from './PhotoGrid';
import logo from '../images/logo.svg';
import * as firebase from 'firebase/app';
import './styles/Main.css';

export default function Main(){
    let [preferences, setPreferences] = useState([]);
    let [tags, setTags] = useState([]);
    let [selectedTags, setSelectedTags] = useState([]);
    let [ loading, setLoading ] = useState(true);
    let isLogged = useSelector(state => state.isLogged)

    useEffect(() => {
        let abortController = new AbortController();

        getTags();

        if(isLogged){
            let user = firebase.auth().currentUser;
            if(!!user){
                let userRef = firebase.firestore().collection('users').doc(user.uid);
                userRef.get().then(userData => {
                    userData = userData.data();
                    if(!(!!userData)){
                        setPreferences('none');
                        setLoading(false);
                        return;
                    }

                    if ( !(!!userData.preferences) || userData.preferences.length === 0){
                        setPreferences('none');
                        setLoading(false);
                    } else {
                        setPreferences(userData.preferences);
                        setLoading(false);
                    }
                })
            }
        } else {
            setLoading(false);
        }

        return () => {
            console.log('aborting main')
            abortController.abort();
        }
    }, [isLogged ])

    // getting all tags from firestore
    function getTags(){
        let arr = [];
        firebase.firestore().collection('tags').get().then(snapshot => {
            snapshot.docs.forEach(snap => {
                arr.push(snap.data().name);
            })
        }).then(() => {
            setTags(arr);
        })
    }

    // letting user select the tag that they want to include
    // in their preferences list
    const selectTag = (e) => {
        let target = e.target.classList
        let dataName = e.target.dataset.name;

        if (target.contains('tag-selected')){
            target.remove('tag-selected');
            let selected = selectedTags;
            let index = selected.indexOf(dataName);
            selected.splice(index, 1);
            setSelectedTags(selected);

        } else {
            target.add('tag-selected');
            let selected = selectedTags;
            selected.push(dataName);
            setSelectedTags(selected);   
        }
    }

    // saving users preferences tags to firestore
    const savePref = () => {
        if (selectedTags.length === 0){
            alert('You Need To Select Atleast One Tag!');
        } else {
            let user = firebase.auth().currentUser;
            firebase.firestore().collection('users').doc(user.uid).update({
                preferences : selectedTags
            }).then(() => {
                setPreferences(selectedTags);
            })
        }
    }

    return(
        <div>
            {preferences === 'none' ? <div className="pref-modal">
                <div className="center small-text bold-weight">Which topics do you want to see more of?</div>
                <div className="pref-container">
                    <div className="row">
                        {tags.map((tag, index) => {
                            return(
                                <div
                                    key={index}
                                    data-name={tag}
                                    className="col l5 m12 s12 pref"
                                    onClick={selectTag}>
                                        {tag}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="center">
                    <button className="s-button pref-button" onClick={savePref}>Done</button>
                </div>
            </div> : ''}
            {(preferences !== 'none' && preferences.length !== 0)
                ? <PhotoGrid pref={preferences}/>
                : ''}
            {(!isLogged && tags.length !== 0)
                ? <PhotoGrid pref={tags}/>
                : ''}
            
            <div className={`${!loading ? 'hide' : 'center'}`}>
                <img src={logo} alt="loading" className="loaderv2"/>
            </div>
        </div>
    )

}