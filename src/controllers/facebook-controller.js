const axios = require("axios");
const {
  VERIFY_TOKEN,
  FB_ACCESS_TOKEN,
  GRAPH_BASE_URL,
} = require("../config/index");
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

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      facebookService.handleEntry(entry, io);
    });
    return res.status(200).send("EVENT_RECEIVED");
  }
  return res.sendStatus(404);
};

exports.sendMessage = async (req, res) => {
  const { recipientId, message, type } = req.body;
  const file = req.file || null;

  if (!recipientId || !message || !type) {
    return res
      .status(400)
      .json({ error: "recipientId, type and message are required" });
  }

  try {
    // Send message to Facebook

    if (type === "text") {
      await facebookService.sendTextMessage({ recipientId, message });
    } else {
      if (!file) {
        return res
          .status(400)
          .json({ error: "Attachment file is required for non-text message" });
      }
      await facebookService.sendAttachmentMessage({ recipientId, file, type });
    }

    res.status(200).json({ success: true, message: "Message sent" });
  } catch (err) {
    logger.error("Send message error:", err.response?.data || err.message);
    res.status(500).json({
      error: err?.message || err.data?.message || "Failed to send message",
    });
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
    const { after } = req.query;
    const messages = await facebookService.FacebookService.getMessages(
      conversationId,
      after
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.fetchParticipants = async (req, res) => {
  try {
    const { pageId } = req.params;
    const data = await facebookService.getConversationParticipants(pageId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.fetchUserProfilePic = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await facebookService.getParticipantsProfilePicById(userId);

    if (!data) {
      return res.status(404).send("Profile picture not found");
    }

    // Fetch the image from Facebook and pipe it to the response
    const imageResponse = await axios.get(data, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", imageResponse.headers["content-type"]);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    imageResponse.data.pipe(res);
    // res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
