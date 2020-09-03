import React, {useState, useEffect} from 'react';
import Select from 'react-select';
import * as firebase from 'firebase/app';

export default function Preferences(props){
    let [multiValue, changeValue] = useState([]);

    const [prefOptions, changeOptions] = useState();

    useEffect(() => {
        let abortController = new AbortController();

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
        }).then(() => {
            changeOptions(arr)
        })

        return () => {
            abortController.abort();
        }
    }, [])

    const handleMultiChange = (option) => {
        changeValue(option);
    }

    const updatePreferences = () => {
        if (multiValue.length < 1){
            console.log("no change")
            return
        }
        let user = firebase.auth().currentUser;
        let preferencesRef = firebase.firestore().collection("users").doc(user.uid);
        let allTags = [];

        for(let i = 0; i < multiValue.length; i++){
            allTags.push(multiValue[i].value);
        }

        console.log(allTags);

        preferencesRef.update({
            preferences : firebase.firestore.FieldValue.delete(),
        }).then(() => {
            preferencesRef.update({
                preferences: allTags,
            })
            alert('success')
        })
    }

    return(
        <div className={`${props.mainClass}`}>
            <div className="col l6 offset-l1">
                <div className="left main-info">
                    <h4 className="bold-weight heading-text">User Preferences</h4>
                    <p
                        className="subheading-text">
                        Set your preferences, help us personalize your experience.
                    </p>
                </div>

                <div className="right s-buttons btn-con-t">
                    <button
                        className="s-button vertical-align bold-weight">
                        Cancel
                    </button>
                    <button
                        className="s-button vertical-align redbg-color bold-weight"
                        onClick={updatePreferences}>
                        Done
                    </button>
                </div>

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <hr />
                <br/>
                <br/>

                <div className="left user-preferences col l6">

                    <Select
                        name="preferences"
                        placeholder="Preferences"
                        options={prefOptions}
                        onChange={handleMultiChange}
                        isMulti
                    />


                </div>
            </div>
        </div>
    )
}