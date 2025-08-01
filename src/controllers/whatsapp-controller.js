const { VERIFY_TOKEN } = require("../config");
const whatsappService = require("../services/whatsapp-service");

const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

const receiveWebHook = (req, res) => {
  const body = req.body;
  const io = req.app.get("io"); // Access socket instance

  if (body.object === "whatsapp_business_account") {
    body.entry.forEach((entry) => {
      whatsappService.handleEntry(entry, io);
    });
    console.log("Event Received");

    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.sendStatus(404);
};

const sendMessage = async (req, res) => {
  const { to, message, type } = req.body;
  const file = req.file || null;

  if (!to || !type) {
    return res
      .status(400)
      .json({ error: "Recipient number and message type are required." });
  }

  try {
    if (type === "text") {
      const response = await whatsappService.sendTextMessage(to, message);
      return res.status(200).json({ success: true, data: response.data });
    }

    if (type === "template") {
      const response = await whatsappService.sendTemplateMessage(req.body);
      return res.status(200).json({ success: true, data: response.data });
    }

    if (type === "file") {
      const mimeType = mime.lookup(file.originalname);
      const type = mimeType.startsWith("image") ? "image" : "document";

      const mediaId = await whatsappService.uploadMediaFromFile(
        file?.path,
        mimeType
      );
      const response = await whatsappService.sendMedia(
        to,
        mediaId,
        type,
        file.originalname
      );
      res.json({ success: true, messageId: response.messages[0].id });
    }
  } catch (error) {
    console.error(
      "WhatsApp Send Error:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Failed to send WhatsApp message." });
  }
};

module.exports = {
  verifyWebhook,
  receiveWebHook,
  sendMessage,
};
