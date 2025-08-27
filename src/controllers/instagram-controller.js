const logger = require("../utils/logger");
const { VERIFY_TOKEN } = require("../config");
const instagramService = require("../services/instagram-service");

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
  const data = req.body;
  console.log({ data });

  const io = req.app.get("io"); // Access socket instance

  if (data.object === "instagram") {
    data?.entry.forEach((event) => {
      instagramService.handleEntry(event, io);
    });
    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.sendStatus(404);
};

exports.fetchFollowers = async (req, res) => {
  try {
    const { token, pageId } = req.instagram;

    const { after } = req.query;
    const data = await instagramService.getConversationParticipants(
      pageId,
      token,
      after
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.fetchConversationById = async (req, res) => {
  try {
    const { token, pageId, instaId } = req.instagram;

    const { after } = req.query;
    const { conversationId } = req.params;
    const data = await instagramService.getMessagesByConversationId(
      instaId,
      token,
      conversationId,
      after
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { token, pageId, instaId } = req.instagram;
  const { recipientId, message, type } = req.body;
  const file = req.file || null;

  if (!recipientId || !type) {
    return res
      .status(400)
      .json({ error: "recipientId, type and message are required" });
  }

  try {
    // Send message to Facebook

    if (type === "text") {
      await instagramService.sendTextMessage({
        recipientId,
        message,
        accessToken: token,
      });
    } else if (type === "file") {
      if (!file) {
        return res
          .status(400)
          .json({ error: "Attachment file is required!!!" });
      }
      await instagramService.sendAttachmentMessage({
        recipientId,
        file,
        type,
        accessToken: token,
        pageId,
      });
    }

    res.status(200).json({ success: true, message: "Message sent" });
  } catch (err) {
    logger.error("Send message error:", err.response?.data || err.message);
    res.status(500).json({
      error: err?.message || err.data?.message || "Failed to send message",
    });
  }
};
