const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const {
  GRAPH_BASE_URL,
  PHONE_NO_ID,
  WHATSAPP_ACCESS_TOKEN,
} = require("../config");
const { whatsappUser } = require("../models/whatsapp-user-modal");
const { whatsappMessage } = require("../models/whatsapp-message-modal");

const headers = {
  Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
};

const createOrUpdateContact = async ({ wa_id, name, profile_pic_url }) => {
  return await whatsappUser.findOneAndUpdate(
    { wa_id },
    {
      $set: { name, profile_pic_url, last_message_time: new Date() },
    },
    { new: true, upsert: true }
  );
};

const handleMessageEvent = async (value, io) => {
  try {
    const contact = value.contacts?.[0];
    const message = value.messages?.[0];

    if (!contact || !message) return;

    console.log({ message, test: message.text });

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
    io.emit("whatsapp_message_received", {
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

const handleEntry = async (entry, io) => {
  const changes = entry?.changes || [];

  for (const change of changes) {
    const { field, value } = change;

    switch (field) {
      case "messages":
        return handleMessageEvent(value, io);
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

  console.log(payload);

  return axios.post(url, payload, {
    headers,
  });
};

const sendTemplateMessage = async (message) => {
  const url = `${GRAPH_BASE_URL}/${PHONE_NO_ID}/messages`;
  const payload = {
    ...message,
  };
  console.log({ payload });

  return await axios.post(url, payload, {
    headers,
  });
};

const uploadMediaFromFile = async (filePath, mimeType) => {
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

const fetchWhatsappContacts = async () => {
  return await whatsappUser.find().sort({ updatedAt: -1 });
};

const fetchMessagesByUserId = async (userId) => {
  return await whatsappMessage
    .find({ user: userId })
    .populate("user")
    .sort({ timestamp: 1 });
};

const getMediaImageById = async (mediaId) => {
  return await axios.get(`${GRAPH_BASE_URL}/${mediaId}`, {
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
};
