const axios = require("axios");
const { VERIFY_TOKEN, FB_ACCESS_TOKEN } = require("../config/index");
const facebookService = require("../services/facebook-service");
const logger = require("../utils/logger");

exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

exports.receiveWebhook = (req, res) => {
  const body = req.body;
  const io = req.app.get("io"); // Access socket instance

  console.log("received");

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      facebookService.handleEntry(entry, io);
    });
    return res.status(200).send("EVENT_RECEIVED");
  }
  return res.sendStatus(404);
};

exports.sendMessage = async (req, res) => {
  const { recipientId, message } = req.body;
  console.log({ message, recipientId });

  if (!recipientId || !message) {
    return res
      .status(400)
      .json({ error: "recipientId and message are required" });
  }

  try {
    // // Save message to MongoDB
    // await MessageModel.create({
    //   direction: "outgoing",
    //   psid,
    //   message,
    //   timestamp: Date.now(),
    // });

    // Send message to Facebook
    await axios.post(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${FB_ACCESS_TOKEN}`,
      {
        recipient: { id: recipientId },
        message: { text: message },
      }
    );

    res.status(200).json({ success: true, message: "Message sent" });
  } catch (err) {
    logger.error("Send message error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.fetchAllConversations = async (req, res) => {
  try {
    const { pageId } = req.params;
    const conversations =
      await facebookService.FacebookService.getConversations(pageId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.fetchMessagesByConversationId = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await facebookService.FacebookService.getMessages(
      conversationId
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
