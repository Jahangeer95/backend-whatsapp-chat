const axios = require("axios");
const mime = require("mime-types");
const { VERIFY_TOKEN } = require("../config");
const whatsappService = require("../services/whatsapp-service");
const whatsAppUserService = require("../services/whatsapp-app-user-service");

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
  console.log({ body });

  if (body?.object === "whatsapp_business_account") {
    body?.entry.forEach((entry) => {
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
  const { phoneId, token, businessId } = req.whatsapp;

  if (!to || !type || !userId) {
    return res.status(400).json({
      error: "Recipient number, User Id and message type are required.",
    });
  }

  try {
    if (type === "text") {
      let loginUser = await whatsAppUserService.findUserByUserId(
        req?.user?._id
      );

      if (!loginUser?.can_send_text) {
        return res.status(409).send({
          success: false,
          message: "You are not authorized to perform this action!!!",
        });
      }

      const response = await whatsappService.sendTextMessage({
        to,
        message,
        phoneId,
        token,
      });

      const message_id = response?.data?.messages?.[0]?.id;

      await whatsappService.saveTextMessage({
        message_id,
        userId,
        message,
        whatsapp_business_id: businessId,
      });

      return res.status(200).json({ success: true, data: response.data });
    }

    if (type === "template") {
      let loginUser = await whatsAppUserService.findUserByUserId(
        req?.user?._id
      );

      if (!loginUser?.can_send_template) {
        return res.status(409).send({
          success: false,
          message: "You are not authorized to perform this action!!!",
        });
      }
      const response = await whatsappService.sendTemplateMessage({
        message: req.body,
        phoneId,
        token,
      });

      const message_id = response?.data?.messages?.[0]?.id;

      console.log({ body: req.body });

      await whatsappService.saveTemplateMessage({
        message_id,
        userId,
        template,
        whatsapp_business_id: businessId,
      });

      return res.status(200).json({ success: true, data: response.data });
    }

    if (type === "file") {
      let loginUser = await whatsAppUserService.findUserByUserId(
        req?.user?._id
      );

      if (!loginUser?.can_send_file) {
        return res.status(409).send({
          success: false,
          message: "You are not authorized to perform this action!!!",
        });
      }

      const mimeType = mime.lookup(file?.originalname);

      if (!mimeType || typeof mimeType !== "string") {
        return res.status(400).json({ error: "Invalid file type." });
      }

      const type = mimeType.startsWith("image") ? "image" : "document";

      const mediaId = await whatsappService.uploadMediaFromFile({
        filePath: file?.path,
        mimeType,
        phoneId,
        token,
      });
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
        whatsapp_business_id: businessId,
      });
      res.json({ success: true, messageId: response.messages[0].id });
    }
  } catch (error) {
    console.error(
      "WhatsApp Send Error:",
      error.response?.data || error?.message
    );
    return res.status(500).json({
      error:
        error?.message ||
        error?.response?.data?.error?.message ||
        "Failed to send WhatsApp message.",
    });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const { businessId } = req.whatsapp;
    const { page = 1 } = req.query;
    const limit = 50;

    const total = await whatsappService.countWhatsappContacts(businessId);

    const contacts = await whatsappService.fetchWhatsappContacts({
      page,
      limit,
      whatsapp_business_id: businessId,
    });

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
    const { businessId } = req.whatsapp;
    const { userId } = req.params;
    const { page = 1 } = req.query;
    const limit = 20;

    const total = await whatsappService.countMessagesByUserId(
      userId,
      businessId
    );

    const messages = await whatsappService.fetchMessagesByUserId({
      userId,
      page,
      limit,
      whatsapp_business_id: businessId,
    });

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
    const { token } = req.whatsapp;

    const metadataRes = await whatsappService.getMediaImageById({
      mediaId,
      token,
    });

    const mediaUrl = metadataRes.data.url;

    const mediaRes = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
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
    const { token, businessId } = req.whatsapp;
    const response = await whatsappService.getPageTemplates({
      token,
      businessId,
    });

    res.send({
      success: true,
      data: { templates: response.data },
    });
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
