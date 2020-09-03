import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

let firebaseConfig = {
    apiKey: "AIzaSyCalm9N86_5dsMM1Nc5Asi2d4V6EhuHZyw",
    authDomain: "xpinterest-clone.firebaseapp.com",
    databaseURL: "https://xpinterest-clone.firebaseio.com",
    projectId: "xpinterest-clone",
    storageBucket: "xpinterest-clone.appspot.com",
    messagingSenderId: "267519282006",
    appId: "1:267519282006:web:a09a0a07bd59313c4464f7",
    measurementId: "G-7XT73EPBH3"
};

// Initialize Firebase
const fire = firebase.initializeApp(firebaseConfig);

export default fire;