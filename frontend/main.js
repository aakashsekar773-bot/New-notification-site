// V9 Modular Import-கள் நீக்கப்பட்டுள்ளன, ஏனெனில் நாம் அவற்றை index.html-ல் CDN மூலம் ஏற்றுகிறோம்
// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken } from "firebase/messaging";

// ------------------------------------------
// V9 Global Access: Firebase Global objects இப்போது வேலை செய்ய வேண்டும்
// ------------------------------------------

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
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(); // Global access to messaging

function mobileLog(msg) {
    const logElement = document.getElementById("log");
    if (logElement) {
        logElement.innerHTML += msg + "<br>";
        logElement.scrollTop = logElement.scrollHeight;
    }
    console.log(msg);
}

// ------------------------------------------
// படி 1: Service Worker-ஐப் பதிவு செய்தல் (இந்த பகுதி மாறவில்லை)
// ------------------------------------------
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
            .then((registration) => {
                mobileLog('Service Worker registered successfully.');
            })
            .catch((error) => {
                mobileLog('Service Worker registration failed: ' + error);
            });
    } else {
        mobileLog('Browser does not support Service Workers.');
    }
}

// ------------------------------------------
// படி 2: அனுமதியைக் கேட்டு Token-ஐப் பெறுதல் (Global Syntax-க்கு மாறியுள்ளது)
// ------------------------------------------
function requestPermission() {
    // Service Worker பதிவு செய்யப்பட்டவுடன் நாம் இதை அழைக்கவில்லை, 
    // பட்டனைத் தட்டும்போது மட்டுமே அழைக்கிறோம்.
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            mobileLog("Notification permission granted. Getting token...");
            
            // Global Syntax: messaging.getToken()
            messaging.getToken({ vapidKey: "BPX91SeK7qbKYl7uGgp1qv4ycZ7qXZGyVcNqJMskFCTY37lxPTlbVgS9dFp3q-3-DT0xBfEWMPFxke7Xg6QCI5U" })
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
// படி 3: App திறந்திருக்கும்போது Notification-களை கையாளுதல் (Global Syntax-க்கு மாறியுள்ளது)
// ------------------------------------------
messaging.onMessage((payload) => {
    mobileLog("Foreground message received: " + payload.notification.title);
    
    // App திறந்திருக்கும்போது, Notification-ஐ manually-ஆகக் காட்டுதல்
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico'
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
