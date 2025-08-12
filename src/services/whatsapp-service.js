const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const {
  GRAPH_BASE_URL,
  PHONE_NO_ID,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_BUSINESS_ID,
} = require("../config");
const { whatsappUser } = require("../models/whatsapp-user-modal");
const { whatsappMessage } = require("../models/whatsapp-message-modal");
const logger = require("../utils/logger");

const headers = {
  Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
};

const createOrUpdateContact = async ({ wa_id, name, profile_pic_url }) => {
  const nameObj = name
    ? {
        name,
      }
    : {};
  const profileObj = profile_pic_url
    ? {
        profile_pic_url,
      }
    : {};
  return await whatsappUser.findOneAndUpdate(
    { wa_id },
    {
      $set: { ...nameObj, ...profileObj, last_message_time: new Date() },
    },
    { new: true, upsert: true }
  );
};

const handleMessageEvent = async (value, io) => {
  try {
    const contact = value.contacts?.[0];
    const message = value.messages?.[0];

    if (!contact || !message) return;

    console.log({ message, test: message.text }, "handle message event");

    const wa_id = contact.wa_id;
    const name = contact?.profile?.name || contact?.name;
    const profile_pic_url = null;

    const message_id = message.id;
    const message_type = message.type;
    const timestamp = new Date(Number(message.timestamp) * 1000); //UNIX timestamp to date string

    let content;
    if (message_type === "text") {
      content = message?.text?.body;
    } else {
      content = message[message_type]; // handle file/image/etc.
    }

    const user = await createOrUpdateContact({
      wa_id,
      name,
      profile_pic_url,
    });

    // Create Message (only if not exists)
    const existing = await whatsappMessage.findOne({ message_id });
    if (existing) return console.log("Message already exists:", message_id);

    await whatsappMessage.create({
      message_id,
      user: user?._id,
      direction: "incoming",
      message_type,
      content,
      timestamp,
    });

    // Optional: Emit via socket
    io.emit("message_received", {
      wa_id,
      message_id: message.id,
      message,
      user,
    });

    console.log("Message event handled for:", wa_id);
  } catch (err) {
    console.error("Error in handleMessageEvent:", err.message);
    throw new Error(err);
  }
};

const handleStatusEvents = async (value, io) => {
  try {
    const { statuses } = value;

    if (!statuses || !Array.isArray(statuses)) return;

    for (const status of statuses) {
      const { id: message_id, status: type, timestamp } = status;

      console.log({ type, status });

      if (!message_id || !type) continue;

      const date = new Date(Number(timestamp) * 1000);

      const update = {
        status: type,
      };

      if (type === "delivered") {
        update.delivery_timestamp = date;
      } else if (type === "read") {
        update.read_timestamp = date;
      }

      await whatsappMessage.findOneAndUpdate(
        { message_id },
        {
          $set: update,
        },
        {
          new: true,
        }
      );

      await createOrUpdateContact({
        wa_id: status?.recipient_id,
      });

      io.emit("message_status", {
        message_id,
        type,
        timestamp,
      });
    }
  } catch (error) {
    console.error("Error in handleStatusEvent:", err.message);
    throw new Error(err);
  }
};

const handleEntry = async (entry, io) => {
  const changes = entry?.changes || [];

  for (const change of changes) {
    const { field, value } = change;

    console.log({ field, value: value });

    switch (field) {
      case "messages":
        if (value?.messages) {
          return handleMessageEvent(value, io);
        }

        if (value?.statuses) {
          return handleStatusEvents(value, io);
        }

      default:
        break;
    }
  }
};

const sendTextMessage = async (to, message) => {
  const url = `${GRAPH_BASE_URL}/${PHONE_NO_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: {
      body: message,
    },
  };

  return axios.post(url, payload, {
    headers,
  });
};

const saveTextMessage = async ({ message_id, userId, message }) => {
  if (message_id) {
    return await whatsappMessage.create({
      message_id,
      user: userId,
      direction: "outgoing",
      message_type: "text",
      content: message,
      timestamp: new Date(),
      status: "sent",
    });
  }
};

const sendTemplateMessage = async (message) => {
  const url = `${GRAPH_BASE_URL}/${PHONE_NO_ID}/messages`;
  const payload = {
    ...message,
  };

  return await axios.post(url, payload, {
    headers,
  });
};

const saveTemplateMessage = async ({ message_id, userId, template }) => {
  if (message_id) {
    return await whatsappMessage.create({
      message_id,
      user: userId,
      direction: "outgoing",
      message_type: "template",
      content: template,
      timestamp: new Date(),
      status: "sent",
    });
  }
};

const uploadMediaFromFile = async (filePath, mimeType) => {
  try {
    const resolvedPath = path.resolve(filePath);
    const url = `${GRAPH_BASE_URL}/${PHONE_NO_ID}/media`;

    if (!fs.existsSync(resolvedPath)) {
      console.error("File does not exist:", resolvedPath);
      throw new Error("Uploaded file not found");
    }

    const fileStream = fs.createReadStream(resolvedPath);

    fileStream.on("error", (err) => {
      console.error("File stream error:", err);
      throw err;
    });
    const form = new FormData();

    form.append("file", fileStream);
    form.append("type", mimeType);
    form.append("messaging_product", "whatsapp");

    const response = await axios.post(url, form, {
      headers: {
        ...headers,
        ...form.getHeaders(),
      },
    });

    return response?.data?.id;
  } catch (error) {
    logger.error(
      "Attachment message error:",
      error.response?.data || error.message
    );

    throw new Error(error.response?.data || error.message);
  } finally {
    fs.unlink(filePath, (err) => {
      if (err) logger.error("File cleanup failed:", err.message);
    });
  }
};

const sendMedia = async (to, mediaId, type, filename = null) => {
  const url = `${GRAPH_BASE_URL}/${PHONE_NO_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to,
    type,
    [type]: { id: mediaId },
  };

  if (type === "document" && filename) {
    payload.document.filename = filename;
  }

  const response = await axios.post(url, payload, {
    headers,
  });

  return response?.data;
};

const saveMediaMessage = async ({
  message_id,
  userId,
  type,
  mediaId,
  filename,
}) => {
  if (message_id) {
    return await whatsappMessage.create({
      message_id,
      user: userId,
      direction: "outgoing",
      message_type: type,
      content: {
        filename,
        id: mediaId,
        caption: "",
      },
      timestamp: new Date(),
      status: "sent",
    });
  }
};

const fetchWhatsappContacts = async (page, limit) => {
  const skip = (page - 1) * limit || 0;
  return await whatsappUser
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ updatedAt: -1 });
};

const countWhatsappContacts = async () => {
  return await whatsappUser.countDocuments();
};

const fetchMessagesByUserId = async (userId, page, limit) => {
  const skip = (page - 1) * limit || 0;
  return await whatsappMessage
    .find({ user: userId })
    .skip(skip)
    .limit(limit)
    .populate("user")
    .sort({ timestamp: -1 });
};

const countMessagesByUserId = async (userId) => {
  return await whatsappMessage.countDocuments({ user: userId });
};

const getMediaImageById = async (mediaId) => {
  return await axios.get(`${GRAPH_BASE_URL}/${mediaId}`, {
    headers,
  });
};

const getPageTemplates = async () => {
  const url = `${GRAPH_BASE_URL}/${WHATSAPP_BUSINESS_ID}/message_templates`;

  return await axios.get(url, {
    headers,
  });
};

module.exports = {
  handleEntry,
  sendTextMessage,
  sendTemplateMessage,
  uploadMediaFromFile,
  sendMedia,
  fetchWhatsappContacts,
  createOrUpdateContact,
  fetchMessagesByUserId,
  getMediaImageById,
  saveTextMessage,
  saveMediaMessage,
  saveTemplateMessage,
  getPageTemplates,
  countWhatsappContacts,
  countMessagesByUserId,
};
