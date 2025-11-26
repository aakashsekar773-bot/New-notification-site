import admin from "firebase-admin";
import { readFileSync } from "fs"; 

// Vercel Environment Variable-லிருந்து SERVICE_ACCOUNT_KEY-ஐப் பெறுகிறது
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY); 

// Firebase Admin SDK-ஐ ஒருமுறை மட்டுமே தொடங்கவும்
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, message } = req.body;

    let tokens = [];
    try { 
        // Vercel Serverless Function-களில் tokens.json-ஐப் படிக்க முயற்சிக்கிறது
        // இந்த கோடு வேலை செய்யாவிட்டால் (write access இல்லாததால்), tokens காலியாக இருக்கும்.
        const data = readFileSync("tokens.json", "utf8");
        tokens = JSON.parse(data);
    } catch(e) {
         console.error("Error reading tokens.json (This is expected if no tokens are saved yet):", e.message);
    }

    if (tokens.length === 0) {
      return res.status(200).json({ message: "No tokens registered. Notifications not sent." });
    }

    const payload = {
      notification: { 
        title: title || "New Message", 
        body: message || "You have a new notification."
      },
      android: { priority: "high" },
      webpush: { headers: { Urgency: "high" } }
    };

    try {
      // அனைத்து Token-களுக்கும் Notification அனுப்பவும்
      const response = await admin.messaging().sendEachForMulticast({ tokens, notification: payload.notification });
      
      // அனுப்பப்படாத Token-களின் எண்ணிக்கையைக் காட்டவும்
      if (response.failureCount > 0) {
          console.warn(`Failed to send to ${response.failureCount} devices.`);
      }

      res.status(200).json({ message: `Notifications sent successfully to ${response.successCount} devices.` });
    } catch(err) {
      console.error("FCM Send Error:", err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
