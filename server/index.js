import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { routes } from "./routes.js";

const app = express();
const server = createServer(app);

// WebSocket server (simple echo on /ws)
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const { url } = request;
  if (url && url.startsWith("/ws")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws, req) => {
  ws.on("message", (message) => {
    console.log("Received message:", message.toString());
    try {
      ws.send("Echo: " + message.toString());
    } catch (err) {
      // ignore send errors for now
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

// middleware
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set to true behind HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

// mount API routes
app.use("/api", routes);

// health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`Server running on port ${port} ✅`);
});
