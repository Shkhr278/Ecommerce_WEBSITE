// server/api/notifications.js
import express from "express";

export const notificationsRouter = express.Router();

notificationsRouter.get("/notifications", (req, res) => {
  const notifications = [
    {
      id: 1,
      type: "order",
      title: "Your order has been shipped!",
      message: "Your product is on the way.",
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: 2,
      type: "favorites",
      title: "New product added!",
      message: "A new item has been added to your favorites.",
      timestamp: new Date().toISOString(),
      read: false,
    },
  ];

  res.json(notifications);
});
