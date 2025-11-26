import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };
import { readFileSync } from "fs";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, message } = req.body;

    let tokens = [];
    try { tokens = JSON.parse(readFileSync("tokens.json", "utf8")); } catch(e) {}

    const payload = {
      notification: { title, body: message },
      android: { priority: "high" },
      webpush: { headers: { Urgency: "high" } }
    };

    try {
      await Promise.all(tokens.map(token => admin.messaging().sendToDevice(token, payload)));
      res.status(200).json({ message: "Notifications sent" });
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
