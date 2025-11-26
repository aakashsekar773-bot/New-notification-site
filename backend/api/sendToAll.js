import admin from "firebase-admin";
import { readFileSync } from "fs"; 

// Vercel Environment Variable-லிருந்து SERVICE_ACCOUNT_KEY-ஐப் பெறுகிறது
// The service account is parsed from the environment variable
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY); 

// 🚨 புதிய திருத்தம்: private_key-ல் உள்ள Line Break (\n) பிழையைச் சரிசெய்யவும்
// Vercel ஒரு single line string-ஆக சேமிக்கும்போது, '\n' எஸ்கேப் ஆகாமல் இருக்க,
// இதைச் சேர்க்கிறோம்.
if (serviceAccount && serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}
// --------------------

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
        const data = readFileSync("tokens.json", "utf8");
        tokens = JSON.parse(data);
    } catch(e) {
         console.error("Error reading tokens.json:", e.message);
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
      // sendEachForMulticast-ஐப் பயன்படுத்துகிறோம்
      const response = await admin.messaging().sendEachForMulticast({ tokens, notification: payload.notification });
      
      // அனுப்பப்படாத Token-களின் எண்ணிக்கையைக் காட்டவும்
      if (response.failureCount > 0) {
          // 🚨 முக்கியமான Log: ஏன் தோல்வியடைந்தது என்று பார்க்க
          response.responses.forEach((resp, index) => {
              if (resp.error) {
                  console.error(`Failed token at index ${index} due to: ${resp.error.code}`);
                  // இந்த Error Code-ஐ வைத்து நாம் பிழையின் உண்மையான காரணத்தைக் கண்டுபிடிக்கலாம்.
              }
          });
          console.warn(`Failed to send to ${response.failureCount} devices.`);
      }

      res.status(200).json({ 
          message: `Notifications sent successfully to ${response.successCount} devices.`,
          failureCount: response.failureCount,
          successCount: response.successCount
      });
    } catch(err) {
      console.error("FCM Send Error:", err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
  }
