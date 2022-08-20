const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient({
  region: "localhost",
  endpoint: "http://localhost:8000",
  accessKeyId: "DEFAULT_ACCESS_KEY",
  secretAccessKey: "DEFAULT_SECRET",
});

/**
 * Get all notifications for a user
 */
async function getAllNotifications(req, res) {
  // get all notifications for the userId
  const userId = req.params.userId;
  const params = {
    TableName: NOTIFICATIONS_TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };
  const data = await dynamoDbClient.query(params).promise();
  res.json(data.Items);
}

/**
 * Create new notification for the user
 */
async function newNotification(req, res) {
  const {
    userId,
    notificationType,
    taskId,
    fromUserId,
    taskStatus,
    connectionStatus,
  } = req.body;

  const params = {
    TableName: NOTIFICATIONS_TABLE,
    Item: {
      userId,
      notificationId: uuidv4(),
      notificationType,
      taskId,
      fromUserId,
      taskStatus,
      connectionStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
  // add notification to user's notifications table
  try {
    await dynamoDbClient.put(params).promise();
    res.json({ message: "Notification added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not add notification" });
  }
}

/**
 * Update connect notification for the user
 */
async function updateConnectNotification(req, res) {
  const { userId, notificationId, connectionStatus } = req.body;
  const params = {
    TableName: NOTIFICATIONS_TABLE,
    Key: {
      userId,
      notificationId,
    },
    UpdateExpression:
      "set updatedAt = :updatedAt, connectionStatus = :connectionStatus",
    ExpressionAttributeValues: {
      ":updatedAt": Date.now(),
      ":connectionStatus": connectionStatus,
    },
    ReturnValues: "ALL_NEW",
  };
  try {
    const data = await dynamoDbClient.update(params).promise();
    res.json(data.Attributes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not update notification" });
  }
}

module.exports = {
  getAllNotifications,
  newNotification,
  updateConnectNotification,
};
