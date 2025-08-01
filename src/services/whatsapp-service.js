const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {
  GRAPH_BASE_URL,
  PHONE_NO_ID,
  WHATSAPP_ACCESS_TOKEN,
} = require("../config");

const headers = {
  Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
  "Content-Type": "application/json",
};

const handleEntry = async (entry, io) => {
  console.log(entry);
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

const sendTemplateMessage = async (message) => {
  const url = `${GRAPH_BASE_URL}/${PHONE_NO_ID}/messages`;
  const payload = {
    ...message,
  };
  return await axios.post(url, payload, {
    headers,
  });
};

const uploadMediaFromFile = async (filePath, mimeType) => {
  const resolvedPath = path.resolve(file.path);
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

module.exports = {
  handleEntry,
  sendTextMessage,
  sendTemplateMessage,
  uploadMediaFromFile,
  sendMedia,
};
