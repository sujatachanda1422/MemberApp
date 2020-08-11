import * as firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyBkjm-uvTzvQ6SFnQhEZjnHb4Cn_ieFJV0",
    authDomain: "chunmun-cff8c.firebaseapp.com",
    databaseURL: "https://chunmun-cff8c.firebaseio.com",
    projectId: "chunmun-cff8c",
    storageBucket: "chunmun-cff8c.appspot.com",
    messagingSenderId: "80886949110",
    appId: "1:80886949110:web:b037814556a817b1d3f8d7"
};

firebase.initializeApp(firebaseConfig);

export default firebase;