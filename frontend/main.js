// New Firebase V9 Imports: initializeApp and getMessaging
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration (Config you copied from Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyDwtrCIxp694lSkP2OsC8Gt4TW8rdexB7k",
    authDomain: "notification-app-a322f.firebaseapp.com",
    projectId: "notification-app-a322f",
    storageBucket: "notification-app-a322f.firebasestorage.app",
    messagingSenderId: "1056812217154",
    appId: "1:1056812217154:web:d07cf34637f398438c4edb"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging (New V9 way)
const messaging = getMessaging(app); 

function mobileLog(msg) {
    document.getElementById("log").innerHTML += msg + "<br>";
    console.log(msg);
}

function requestPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            // New V9 way to get token
            getToken(messaging, { vapidKey: "BPX91SeK7qbKYl7uGgp1qv4ycZ7qXZGyVcNqJMskFCTY37lxPTlbVgS9dFp3q-3-DT0xBfEWMPFxke7Xg6QCI5U" })
            .then((token) => {
                mobileLog("TOKEN: " + token);
                fetch("/api/saveToken", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token })
                });
            }).catch((err) => mobileLog("Error getting token: " + err));
        } else {
            mobileLog("Notification permission denied");
        }
    });
}

// (நீங்கள் முன்பே main.js-ல் வைத்திருந்த requestPermission function-க்குரிய HTML Button-ன் கோடு இருக்கிறதா என்று உறுதிப்படுத்திக் கொள்ளவும்)
                      
