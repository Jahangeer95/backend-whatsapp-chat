const axios = require("axios");
const { FB_ACCESS_TOKEN } = require("../config");

const handleEntry = (entry, io) => {
  const webhookEvent = entry.messaging ? entry.messaging[0] : entry;
  console.log("Webhook event received:", webhookEvent);

  if (webhookEvent.message) {
    const userMessage = webhookEvent.message.text;

    console.log("User sent message:", userMessage);

    // Emit to all connected sockets (or use room for specific users)
    io.emit("message_from_user", {
      senderId: webhookEvent.sender.id,
      message: userMessage,
    });
  }

  if (webhookEvent.read) {
    console.log(
      `User ${webhookEvent.sender.id} has read messages up to:`,
      new Date(webhookEvent.read.watermark)
    );

    io.emit("message_read", {
      userId: webhookEvent.sender.id,
      timestamp: webhookEvent.read.watermark,
    });
  }
};

const FacebookService = {
  async getConversations(pageId) {
    const url = `https://graph.facebook.com/v19.0/${pageId}/conversations?access_token=${FB_ACCESS_TOKEN}`;
    const response = await axios.get(url);
    return response.data;
  },

  async getMessages(conversationId) {
    const params = {
      fields: "message,from,to,created_time",
      access_token: FB_ACCESS_TOKEN,
    };
    const url = `https://graph.facebook.com/v19.0/${conversationId}/messages?access_token=${FB_ACCESS_TOKEN}`;
    const response = await axios.get(url, { params });
    return response.data;
  },
};

module.exports = { handleEntry, FacebookService };
