// Firebase API Configuration
var firebaseConfig = {
    apiKey: "AIzaSyC0NqGL8JX3I3u3-Z2-YOKpZd8e4S0ra0M",
    authDomain: "bby22-comp1800.firebaseapp.com",
    projectId: "bby22-comp1800",
    storageBucket: "bby22-comp1800.appspot.com",
    messagingSenderId: "534749606096",
    appId: "1:534749606096:web:e2641d7bd3d1fca59beed5"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("Loaded API Keys");