import React, {useRef, useEffect, useState, useReducer} from 'react';
import {useSelector} from 'react-redux';
import {Redirect } from 'react-router-dom';
import * as firebase from 'firebase/app';
import {v4 as uuidv4} from 'uuid';
import './styles/CreatePin.css';
import DropZone from './dropzone/DropZone';
import Select from 'react-select';
import logo from '../images/logo.svg';

export default function CreatePin(){
    const titleErrorRef = useRef();
    const tagErrorRef = useRef();
    const aboutErrorRef = useRef();
    const mobileRef = useRef();
    const pcRef = useRef();
    const containerRef = useRef();

    const [tagOptions, changeOptions] = useState();
    const [loading, setLoading]  = useState(false);
    const [redirect, setRedirect] = useState(false);
    let [user, setUser] = useState([]);

    const isLogged = useSelector(state => state.isLogged);

    function reducer(state, {field, value}){
        return {
            ...state,
            [field] : value,
        }
    }

    const initialState = {
        title: '',
        about: '',
        tag: '',
        image: '',
        createdTag: '',
    }

    let [state, dispatch] = useReducer(reducer, initialState);

    let {title, about, tag, image, createdTag} = state;

    useEffect(() => {

        let abortController = new AbortController();
        
        if(isLogged){
            let userInfo = firebase.auth().currentUser;
                if(!!userInfo){
                firebase.firestore().collection('users').doc(userInfo.uid).get().then(snapshot => {
                    let {firstName, lastName, profileImage} = snapshot.data();
                    let fullName = `${!!firstName ? firstName : ''} ${!!lastName ? lastName : ''}`;
                    profileImage = !!profileImage ? profileImage : '';
                    setUser([fullName, profileImage]);
                })
            }
        }

        // array to save all the tags in
        let arr = [];

        // get the tags from the server
        firebase.firestore().collection('tags').get().then(snapshot => {
            snapshot.docs.map(doc => {
                let value = doc.data().name;
                let obj = {
                    value,
                    label: value
                }

                // push the main value to the array
                arr.push(obj);
                return doc.data();
            })
        }).then(() => {changeOptions(arr) })

        return () => {
            console.log('aborting pin creation');
            abortController.abort();
        }
    }, [isLogged, ])

    useEffect(() => {
        let abortController = new AbortController();

        const resize = () => {
            if(window.innerWidth < 650){
                mobileRef.current.classList.remove('hide');
                pcRef.current.classList.add('hide');
                containerRef.current.style.width = '500px'
                containerRef.current.style.height = '1100px'
            } else {
                mobileRef.current.classList.add('hide');
                pcRef.current.classList.remove('hide');
                containerRef.current.style.width = '900px'
                containerRef.current.style.height = '750px'
            }
        }
        resize();

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            abortController.abort();
        }
    }, [])

    const handleChange = (e) => {
        let field = e.target.name;
        let value = e.target.value;
        dispatch({field : field , value : value})
    }

    const handleImageChange = (image) => {
        dispatch({field: 'image', value : image})
    }

    const handleTagChange = (option) => {
        dispatch({field: "tag", value: option});
    }
    const resetValues = () => {
        dispatch({field: "tag", value: ""});
        dispatch({field: "createdTag", value: ""});
        dispatch({field: "title", value: ""});
        dispatch({field: "about", value: ""});
        dispatch({field: "image", value: ""});
    }

    const submitPost = () => {

        let found = false;

        if(!isLogged){
            return;
        }

        if (createdTag !== ''){
            for (let singleTag of tagOptions){
                if(singleTag.label === createdTag.toLowerCase()){
                    found = true;
                    tagErrorRef.current.textContent = 'Tag already Exists!, automatically selected it for you.';
                    break;
                }
            }
            if (!found){
                let tagStorageRef = firebase.firestore().collection('tags');
                tagStorageRef.add({
                    name: createdTag,
                })
            }
        }

        if (tag === '' && createdTag === ''){
            alert("Please Select a tag");
            return;
        }

        if(title === '' || (title.length >= 70)){
            let text = title.length >= 70 
                                ? "Enter Less Than 70 Characters for Title" 
                                : "Title can't be empty";
            titleErrorRef.current.textContent = text;
            return;
        }
        if(about === '' || about.length >= 200){
            let text = about.length >= 200 
                                ? "Enter Less Than 200 Characters" 
                                : "Please Dont Leave This Empty";
            aboutErrorRef.current.textContent = text;
        }

        if(image.invalid || image === ''){
            alert('please enter a valid image');
            return;
        } 
    
        aboutErrorRef.current.textContent = '';
        titleErrorRef.current.textContent = '';
        tagErrorRef.current.textContent = '';

        setLoading(true);

        let tagToBeAdded = createdTag ? createdTag : tag.value;

        let user = firebase.auth().currentUser;

        const metadata = {
            contentType: image.type,
        }

        const storageRef = firebase.storage().ref();
        const documentIdentification = uuidv4();

        const task = storageRef.child(`pins/${user.uid}/${documentIdentification}`).put(image, metadata)

        let fullPath = '';
        task
        .then(snapshot => {
            fullPath = snapshot.ref.fullPath;
            return snapshot.ref.getDownloadURL()
        })
        .then(url => {
            //console.log(url)

            let dbRef = firebase.firestore().collection('posts')
                        .doc(user.uid).collection('userPosts');
            dbRef.add({
                title: title,
                about: about,
                url: url,
                comments : 0,
                created: firebase.firestore.Timestamp.fromDate(new Date()),
                tag: tagToBeAdded,
                by: user.uid,
                path: fullPath,
            }).then(docRef => {
                firebase.firestore().collection('posts').doc(user.uid)
                        .collection('userPosts').doc(docRef.id).update({
                            docId: docRef.id,
                        }).then(() => {
                            resetValues();
                            setLoading(false);
                            setRedirect(true);
                        })
            }).catch(err => {
                alert(err);
                setLoading(false);
            })

        })
    }

    return(
        <div className="pin-build-container">
            {redirect ? <Redirect to="/main"/> : ''}
            <div className="main-container" ref={containerRef}>
                <div className="row">
                    <div className="col l2 left">
                        <div className="drop-zone-container">
                            <div className="left">
                                <div className="content center">
                                    <DropZone handleImageChange={handleImageChange}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                    <div className="col l7 right pin-information-container" ref={pcRef}>
                        <div className="center upper-header">Create a New Pin</div>
                        <div className="main-title black-text">
                            <input
                                className="title-input center"
                                type="text"
                                name="title"
                                value={title}
                                onChange={handleChange}
                                placeholder="Add Your Title"/>
                                <div ref={titleErrorRef} className="error center"></div>
                        </div>
                        <div className="user-info-container center">
                            {user.length > 0 ? <div className="user-info">
                                {!(!!user[1]) ? <i
                                    className={`material-icons icon-placeholder ${user[1] === '' ? '' : 'hide'}`}>
                                    account_circle
                                </i> :
                                <img src={user[1]} className="pin-user" alt="user-icon"></img>}
                                <span className="user-name">{user[0]}</span>
                            </div> : ''}
                        </div>

                        <div className="pin-about-container">
                            <input
                                type="text"
                                className="pin-about-input center"
                                value={about}
                                name="about"
                                onChange={handleChange}
                                placeholder="Tell everyone what your pin is about"/>
                                <div ref={aboutErrorRef} className="center error"></div>
                        </div>
                        <div className="tag-container">
                            <Select
                                name="tag"
                                placeholder="Select Tag"
                                options={tagOptions}
                                onChange={handleTagChange}
                            />
                        </div>
                        <div className="general-container">
                            <div className="center">OR</div>
                        </div>
                        <div className="tag-creater-container center">
                            <input
                                className="p-input center"
                                type="text"
                                name="createdTag"
                                value={createdTag}
                                onChange={handleChange}
                                placeholder="Type Your Own Tag(no spaces)"/>
                                <div ref={tagErrorRef} className="center error"></div>
                        </div>
                        <div className="submit-btn center">
                            <button
                                className="s-button redbg-color main-button"
                                onClick={submitPost}>
                                Submit
                            </button>
                        </div>
                        <div className={`overlay ${!loading ? 'hide' : ''}`}></div>
                        <img src={logo} className={`main-loader ${!loading ? 'hide' : ''}`} alt='loader'/>
                    </div>
                </div>

                {/* FOR MOBILE */}
            <div className="col l7 center hide" ref={mobileRef}>
                    <div className="center upper-header">Create a New Pin</div>
                    <div className="main-title black-text">
                        <input
                            className="title-input center"
                            type="text"
                            name="title"
                            value={title}
                            onChange={handleChange}
                            placeholder="Add Your Title"/>
                            <div ref={titleErrorRef} className="error center"></div>
                    </div>
                    <div className="user-info-container center">
                        {user.length > 0 ? <div className="user-info">
                            {!(!!user[1]) ? <i
                                className={`material-icons icon-placeholder ${user[1] === '' ? '' : 'hide'}`}>
                                account_circle
                            </i> :
                            <img src={user[1]} className="pin-user" alt="user-icon"></img>}
                            <span className="user-name">{user[0]}</span>
                        </div> : ''}
                    </div>

                    <div className="pin-about-container">
                        <input
                            type="text"
                            className="pin-about-input center"
                            value={about}
                            name="about"
                            onChange={handleChange}
                            placeholder="Tell everyone what your pin is about"/>
                            <div ref={aboutErrorRef} className="center error"></div>
                    </div>
                    <div className="tag-container">
                        <Select
                            name="tag"
                            placeholder="Select Tag"
                            options={tagOptions}
                            onChange={handleTagChange}
                        />
                    </div>
                    <div className="general-container">
                        <div className="center">OR</div>
                    </div>
                    <div className="tag-creater-container center">
                        <input
                            className="p-input center"
                            type="text"
                            name="createdTag"
                            value={createdTag}
                            onChange={handleChange}
                            placeholder="Type Your Own Tag(no spaces)"/>
                            <div ref={tagErrorRef} className="center error"></div>
                    </div>
                    <div className="submit-btn center">
                        <button
                            className="s-button redbg-color main-button"
                            onClick={submitPost}>
                            Submit
                        </button>
                    </div>
                    <div className={`overlay ${!loading ? 'hide' : ''}`}></div>
                    <img src={logo} className={`main-loader ${!loading ? 'hide' : ''}`} alt='loader'/>
                </div>
            </div>
        </div>
    )
}