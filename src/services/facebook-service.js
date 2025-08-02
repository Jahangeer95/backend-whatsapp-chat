const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { FB_ACCESS_TOKEN, GRAPH_BASE_URL, FB_PAGE_ID } = require("../config");
const path = require("path");
const logger = require("../utils/logger");
const { FbUser } = require("../models/user-modal");

sendTextMessage = async ({ recipientId, message }) => {
  return axios.post(
    `${GRAPH_BASE_URL}/me/messages`,
    {
      recipient: { id: recipientId },
      message: { text: message },
    },
    {
      params: { access_token: FB_ACCESS_TOKEN },
    }
  );
};

sendAttachmentMessage = async ({ recipientId, file, type }) => {
  const resolvedPath = path.resolve(file.path);

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

  form.append("message", JSON.stringify({ attachment: { type, payload: {} } }));
  form.append("filedata", fileStream);

  try {
    const uploadRes = await axios.post(
      `${GRAPH_BASE_URL}/me/message_attachments`,
      form,
      {
        headers: form.getHeaders(),
        params: { access_token: FB_ACCESS_TOKEN },
      }
    );

    const attachment_id = uploadRes.data.attachment_id;

    const sendRes = await axios.post(
      `${GRAPH_BASE_URL}/me/messages`,
      {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type,
            payload: { attachment_id },
          },
        },
      },
      {
        params: { access_token: FB_ACCESS_TOKEN },
      }
    );
  } catch (error) {
    logger.error(
      "Attachment message error:",
      error.response?.data || error.message
    );
  } finally {
    fs.unlink(file.path, (err) => {
      if (err) logger.error("File cleanup failed:", err.message);
    });
  }
};

const handleEntry = async (entry, io) => {
  const webhookEvent = entry.messaging ? entry.messaging[0] : entry;
  console.log("Webhook event received:", webhookEvent);

  if (webhookEvent.message) {
    const userMessage = webhookEvent.message.text;

    // Emit to all connected sockets (or use room for specific users)
    io.emit("message_from_user", {
      senderId: webhookEvent.sender.id,
      message: userMessage,
    });
  }

  if (webhookEvent.delivery) {
    const userId = webhookEvent?.sender?.id;
    const delivery_timestamp = webhookEvent?.delivery?.watermark.toString();

    await FbUser.findOneAndUpdate(
      {
        userId,
      },
      { delivery_timestamp },
      {
        upsert: true,
        new: true,
      }
    );

    io.emit("message_delivered", {
      userId: webhookEvent.sender.id,
    });
  }

  if (webhookEvent.read) {
    const userId = webhookEvent?.sender?.id;
    const read_timestamp = webhookEvent?.read?.watermark?.toString();

    await FbUser.findOneAndUpdate(
      { userId },
      { read_timestamp },
      {
        upsert: true,
        new: true,
      }
    );
    io.emit("message_read", {
      userId: webhookEvent.sender.id,
    });
  }
};

const FacebookService = {
  async getConversations(pageId) {
    const url = `${GRAPH_BASE_URL}/${pageId}/conversations?access_token=${FB_ACCESS_TOKEN}`;
    const response = await axios.get(url);
    return response.data;
  },

  async getMessages(conversationId, after = null) {
    const params = {
      fields: "message,attachments,sticker,quick_reply,from,to,created_time",
      access_token: FB_ACCESS_TOKEN,
      limit: 100,
    };
    if (after) {
      params.after = after;
    }
    const url = `${GRAPH_BASE_URL}/${conversationId}/messages`;
    const response = await axios.get(url, { params });

    const messages = response?.data?.data || [];
    const paging = response?.data?.paging || {};

    const recipientMessage = messages.find((msg) => {
      return msg.from.id === FB_PAGE_ID;
    });
    const userMessage = messages.find((msg) => msg.from.id !== FB_PAGE_ID);
    const recipientId =
      recipientMessage?.to?.data?.[0]?.id || userMessage?.from?.id;

    let fbUser = null;
    if (recipientId) {
      fbUser = await FbUser.findOne({ userId: recipientId });
    }

    const messagesArray = messages.map((msg) => {
      let status = "sent";

      if (msg.from.id === FB_PAGE_ID && fbUser) {
        const messageTimestamp = new Date(msg.created_time).getTime();
        if (messageTimestamp <= Number(fbUser.read_timestamp)) {
          status = "read";
        } else if (messageTimestamp <= Number(fbUser.delivery_timestamp)) {
          status = "delivered";
        }
        return {
          ...msg,
          status,
        };
      }

      return {
        ...msg,
        ...(msg.from.id === FB_PAGE_ID && { status }),
      };
    });

    return {
      messages: messagesArray,
      paging,
    };
  },
};

const getConversationParticipants = async (pageId) => {
  const url = `${GRAPH_BASE_URL}/${pageId}/conversations?fields=participants&access_token=${FB_ACCESS_TOKEN}`;

  try {
    const response = await axios.get(url);
    const formatted = response.data.data.map((conversation) => ({
      conversationId: conversation.id,
      participants: conversation.participants.data,
    }));
    return formatted;
  } catch (error) {
    console.error(
      "Error fetching FB participants:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch Facebook participants");
  }
};

const getParticipantsProfilePicById = async (psid) => {
  const urlForPagePic = `${GRAPH_BASE_URL}/${psid}/picture`;
  const url = `${GRAPH_BASE_URL}/${psid}?fields=profile_pic,first_name,last_name,email&access_token=${FB_ACCESS_TOKEN}`;

  try {
    if (psid === FB_PAGE_ID) {
      const response = await axios.get(urlForPagePic);
      return response?.data;
    } else {
      const response = await axios.get(url);
      return response?.data?.profile_pic;
    }
  } catch (error) {
    console.error(
      "Error fetching FB participants:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch Facebook User Profile Pic");
  }
};

module.exports = {
  handleEntry,
  FacebookService,
  getConversationParticipants,
  sendTextMessage,
  sendAttachmentMessage,
  getParticipantsProfilePicById,
};
