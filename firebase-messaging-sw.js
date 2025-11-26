importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDwtrCIxp694lSkP2OsC8Gt4TW8rdexB7k",
  authDomain: "notification-app-a322f.firebaseapp.com",
  projectId: "notification-app-a322f",
  storageBucket: "notification-app-a322f.firebasestorage.app",
  messagingSenderId: "1056812217154",
  appId: "1:1056812217154:web:d07cf34637f398438c4edb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icon.png'
    });
});
