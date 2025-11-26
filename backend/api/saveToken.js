import { writeFileSync, readFileSync } from "fs";

export default function handler(req, res) {
  if (req.method === "POST") {
    let tokens = [];
    try { tokens = JSON.parse(readFileSync("tokens.json", "utf8")); } catch(e) {}
    const { token } = req.body;
    if (token && !tokens.includes(token)) tokens.push(token);
    writeFileSync("tokens.json", JSON.stringify(tokens));
    res.status(200).json({ message: "Token saved" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
  
