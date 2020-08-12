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

// const firebaseConfig = {
//     apiKey: "AIzaSyCcWdWNxAlNDoHdxMORF_SIXXeqASZa9nA",
//     authDomain: "agentchat-ba194.firebaseapp.com",
//     databaseURL: "https://agentchat-ba194.firebaseio.com",
//     projectId: "agentchat-ba194",
//     storageBucket: "agentchat-ba194.appspot.com",
//     messagingSenderId: "696071382515",
//     appId: "1:696071382515:web:dc91ee350783ed09d59e86"
// };

firebase.initializeApp(firebaseConfig);

export default firebase;