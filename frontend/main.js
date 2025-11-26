// New Firebase V9 Imports: initializeApp, getMessaging, and utility functions
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration 
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
const messaging = getMessaging(app); 

// Logging function to display messages on the mobile screen
function mobileLog(msg) {
    const logElement = document.getElementById("log");
    if (logElement) {
        logElement.innerHTML += msg + "<br>";
        logElement.scrollTop = logElement.scrollHeight; // Scroll to bottom
    }
    console.log(msg);
}

// ------------------------------------------
// படி 1: Service Worker-ஐப் பதிவு செய்தல்
// Notification-கள் வேலை செய்ய இது அவசியம். firebase-messaging-sw.js ஆனது root-ல் இருக்க வேண்டும்.
// ------------------------------------------
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Root-ல் உள்ள Service Worker-ஐப் பதிவு செய்யவும்
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
            .then((registration) => {
                mobileLog('Service Worker registered successfully.');
                // SW பதிவு செய்யப்பட்டவுடன், Token-க்கான அனுமதியைக் கேட்கவும்
                requestPermission();
            })
            .catch((error) => {
                mobileLog('Service Worker registration failed: ' + error);
            });
    } else {
        mobileLog('Browser does not support Service Workers.');
    }
}

// ------------------------------------------
// படி 2: அனுமதியைக் கேட்டு Token-ஐப் பெறுதல்
// ------------------------------------------
function requestPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            mobileLog("Notification permission granted. Getting token...");
            
            // New V9 way to get token
            getToken(messaging, { vapidKey: "BPX91SeK7qbKYl7uGgp1qv4ycZ7qXZGyVcNqJMskFCTY37lxPTlbVgS9dFp3q-3-DT0xBfEWMPFxke7Xg6QCI5U" })
            .then((token) => {
                mobileLog("TOKEN: " + token);
                
                // Token-ஐ Backend-க்குச் சேமிக்கவும்
                fetch("/api/saveToken", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token })
                })
                .then(response => response.json())
                .then(data => mobileLog("Token saved status: " + (data.message || data.error)))
                .catch(err => mobileLog("Error saving token: " + err));

            }).catch((err) => mobileLog("Error getting token: " + err));
            
        } else {
            mobileLog("Notification permission denied");
        }
    });
}

// ------------------------------------------
// படி 3: App திறந்திருக்கும்போது Notification-களை கையாளுதல்
// ------------------------------------------
onMessage(messaging, (payload) => {
    mobileLog("Foreground message received: " + payload.notification.title);
    
    // App திறந்திருக்கும்போது, Notification-ஐ manually-ஆகக் காட்டுதல்
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico' // Default icon for local display
    };
    new Notification(notificationTitle, notificationOptions);
});


// பக்கத்தைச் சுமை ஏற்றும்போது Service Worker-ஐப் பதிவு செய்யவும்
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
} else {
    registerServiceWorker();
}
// requestPermission function-ஐ global-ஆக்குகிறோம், அதனால் பட்டன் அதை அழைக்க முடியும்.
window.requestPermission = requestPermission;
