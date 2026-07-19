import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // POST Route at /api/chat (Mirroring backend/server.js but on port 3000 for AI Studio preview)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Read key from environment
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        console.error("DEEPSEEK_API_KEY is not defined in the environment variables.");
        return res.status(500).json({ error: "DeepSeek API key is not configured on the server." });
      }

      // Construct messages payload with the system prompt
      const messages = [
        {
          role: "system",
          content: "You are a helpful customer support assistant. Be concise, polite, and professional."
        },
        ...history,
        {
          role: "user",
          content: message
        }
      ];

      // Call DeepSeek API
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("DeepSeek API failed:", errorData);
        return res.status(response.status).json({ error: "DeepSeek API request failed" });
      }

      const data = await response.json();
      res.json(data);

    } catch (error) {
      console.error("Error handling /api/chat:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
