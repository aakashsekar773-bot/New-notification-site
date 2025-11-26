const firebaseConfig = {
  apiKey: "AIzaSyDwtrCIxp694lSkP2OsC8Gt4TW8rdexB7k",
  authDomain: "notification-app-a322f.firebaseapp.com",
  projectId: "notification-app-a322f",
  storageBucket: "notification-app-a322f.firebasestorage.app",
  messagingSenderId: "1056812217154",
  appId: "1:1056812217154:web:d07cf34637f398438c4edb"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

function mobileLog(msg) {
    document.getElementById("log").innerHTML += msg + "<br>";
    console.log(msg);
}

function requestPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            messaging.getToken({ vapidKey: "BPX91SeK7qbKYl7uGgp1qv4ycZ7qXZGyVcNqJMskFCTY37lxPTlbVgS9dFp3q-3-DT0xBfEWMPFxke7Xg6QCI5U" })
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
