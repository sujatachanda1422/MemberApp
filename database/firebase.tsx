import * as firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyCcWdWNxAlNDoHdxMORF_SIXXeqASZa9nA",
    authDomain: "agentchat-ba194.firebaseapp.com",
    databaseURL: "https://agentchat-ba194.firebaseio.com",
    projectId: "agentchat-ba194",
    storageBucket: "agentchat-ba194.appspot.com",
    messagingSenderId: "696071382515",
    appId: "1:696071382515:web:dc91ee350783ed09d59e86"
};

firebase.initializeApp(firebaseConfig);

export default firebase;