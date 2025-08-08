const axios = require("axios");
const mime = require("mime-types");
const { VERIFY_TOKEN, WHATSAPP_ACCESS_TOKEN } = require("../config");
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
  const { to, message, type, userId, template } = req.body;
  const file = req?.file || null;

  if (!to || !type || !userId) {
    return res.status(400).json({
      error: "Recipient number, User Id and message type are required.",
    });
  }

  try {
    if (type === "text") {
      const response = await whatsappService.sendTextMessage(to, message);

      const message_id = response?.data?.messages?.[0]?.id;

      await whatsappService.saveTextMessage({
        message_id,
        userId,
        message,
      });

      return res.status(200).json({ success: true, data: response.data });
    }

    if (type === "template") {
      const response = await whatsappService.sendTemplateMessage(req.body);

      const message_id = response?.data?.messages?.[0]?.id;

      console.log({ body: req.body });

      await whatsappService.saveTemplateMessage({
        message_id,
        userId,
        template,
      });

      return res.status(200).json({ success: true, data: response.data });
    }

    if (type === "file") {
      const mimeType = mime.lookup(file?.originalname);

      if (!mimeType || typeof mimeType !== "string") {
        return res.status(400).json({ error: "Invalid file type." });
      }

      const type = mimeType.startsWith("image") ? "image" : "document";

      const mediaId = await whatsappService.uploadMediaFromFile(
        file?.path,
        mimeType
      );
      const response = await whatsappService.sendMedia(
        to,
        mediaId,
        type,
        file?.originalname
      );

      const message_id = response?.messages?.[0]?.id;

      await whatsappService.saveMediaMessage({
        message_id,
        userId,
        type,
        mediaId,
        filename: file?.originalname,
      });
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

const getAllContacts = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;

    const total = await whatsappService.countWhatsappContacts();

    const contacts = await whatsappService.fetchWhatsappContacts(page, limit);

    res.send({
      success: true,
      data: contacts,
      pagination: {
        limit,
        page: Number(page),
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting contacts:", error);
    res.status(500).json({ success: false, error: "Failed to fetch contacts" });
  }
};

const getAllMessagesForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1 } = req.query;
    const limit = 20;

    const total = await whatsappService.countMessagesByUserId(userId);

    const messages = await whatsappService.fetchMessagesByUserId(
      userId,
      page,
      limit
    );

    res.send({
      success: true,
      data: { messages: messages?.reverse() },
      pagination: {
        limit,
        page: Number(page),
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};

const getMediaByMediaId = async (req, res) => {
  try {
    const mediaId = req.params.id;

    const metadataRes = await whatsappService.getMediaImageById(mediaId);

    const mediaUrl = metadataRes.data.url;

    const mediaRes = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      responseType: "stream",
    });

    res.setHeader("Content-Type", metadataRes.data.mime_type || "image/jpeg");
    mediaRes.data.pipe(res);
  } catch (error) {
    console.error("Error getting media:", error);
    res.status(500).json({ success: false, error: "Failed to fetch media" });
  }
};

const fetchAllPageTemplates = async (req, res) => {
  try {
    await whatsappService.getPageTemplates();
  } catch (error) {
    console.error("Error getting templates:", error?.response);
    res.status(500).json({
      success: false,
      error:
        error?.response?.data?.error?.message || "Failed to fetch templates",
    });
  }
};

module.exports = {
  verifyWebhook,
  receiveWebHook,
  sendMessage,
  getAllContacts,
  getAllMessagesForUser,
  getMediaByMediaId,
  fetchAllPageTemplates,
};
