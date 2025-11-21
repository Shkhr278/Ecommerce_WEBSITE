import express from "express";
import session from "express-session";
import passport from "passport";
import { createServer } from "http";
import { parse } from "url";
import { WebSocketServer } from "ws";
import { routes } from "./routes.js";
import { storage } from "./storage.js";

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const { pathname } = parse(req.url || "", true);

  if (pathname === "/ws") {
    ws.on("message", (message) => {
      // Handle WebSocket messages
      console.log("Received message:", message.toString());
      ws.send("Echo: " + message.toString());
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  }
});

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", routes);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
