const express = require("express");
const serverless = require("serverless-http");
const NotificationController = require("./controllers/NotificationController");

const app = express();

app.use(express.json());

app.get("/notifications/:userId", NotificationController.getAllNotifications);
app.post("/newNotification", NotificationController.newNotification);
app.post(
  "/updateConnectNotification",
  NotificationController.updateConnectNotification
);

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
