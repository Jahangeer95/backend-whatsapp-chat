const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const logger = require("../utils/logger");
const { GRAPH_BASE_URL } = require("../config");
const { FbUser } = require("../models/user-modal");

sendTextMessage = async ({ recipientId, message, token }) => {
  return axios.post(
    `${GRAPH_BASE_URL}/me/messages`,
    {
      recipient: { id: recipientId },
      message: { text: message },
    },
    {
      params: { access_token: token },
    }
  );
};

sendAttachmentMessage = async ({ recipientId, file, type, token }) => {
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
        params: { access_token: token },
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
        params: { access_token: token },
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
  async getConversations(pageId, token) {
    const url = `${GRAPH_BASE_URL}/${pageId}/conversations?access_token=${token}`;
    const response = await axios.get(url);
    return response.data;
  },

  async getMessages(conversationId, after = null, token, pageId) {
    const params = {
      fields: "message,attachments,sticker,quick_reply,from,to,created_time",
      access_token: token,
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
      return msg.from.id === pageId;
    });
    const userMessage = messages.find((msg) => msg.from.id !== pageId);
    const recipientId =
      recipientMessage?.to?.data?.[0]?.id || userMessage?.from?.id;

    let fbUser = null;
    if (recipientId) {
      fbUser = await FbUser.findOne({ userId: recipientId });
    }

    const messagesArray = messages.map((msg) => {
      let status = "sent";

      if (msg.from.id === pageId && fbUser) {
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
        ...(msg.from.id === pageId && { status }),
      };
    });

    return {
      messages: messagesArray,
      paging,
    };
  },
};

const getConversationParticipants = async (pageId, token, after = null) => {
  const url = `${GRAPH_BASE_URL}/${pageId}/conversations`;

  const params = {
    fields: "participants,updated_time,unread_count",
    access_token: token,
    limit: 25,
  };

  if (after) {
    params.after = after;
  }

  try {
    const response = await axios.get(url, { params });

    const paging = response?.data?.paging || {};

    const formatted = response?.data?.data.map((conversation) => ({
      conversationId: conversation.id,
      updated_time: conversation?.updated_time,
      unread_count: conversation?.unread_count,
      participants: conversation?.participants?.data,
    }));
    return { participants: formatted, paging };
  } catch (error) {
    console.error(
      "Error fetching FB participants:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch Facebook participants");
  }
};

const getParticipantsProfilePicById = async (psid, token, pageId) => {
  const urlForPagePic = `${GRAPH_BASE_URL}/${psid}/picture`;
  const url = `${GRAPH_BASE_URL}/${psid}?fields=profile_pic,first_name,last_name&access_token=${token}`;

  try {
    if (psid === pageId) {
      // const response = await axios.get(urlForPagePic);
      return urlForPagePic;
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

const markedConversationAsReadBasedOnConversationId = async (
  conversationId,
  token
) => {
  const url = `${GRAPH_BASE_URL}/${conversationId}`;

  const params = {
    access_token: token,
  };

  const data = { read: true };

  return await axios.post(url, data, { params });
};

const fetchPagePostsByPageId = async (pageId, token, after = null) => {
  const url = `${GRAPH_BASE_URL}/${pageId}/posts`;
  const params = {
    access_token: token,
    fields: "fields=id,message,created_time,permalink_url,attachments",
    limit: 3,
  };
  if (after) {
    params.after = after;
  }
  return await axios.get(url, { params });
};

const uploadTextPost = async ({ pageId, token, data, postId }) => {
  const url = postId
    ? `${GRAPH_BASE_URL}/${postId}`
    : `${GRAPH_BASE_URL}/${pageId}/feed`;

  // Create URLSearchParams instead of plain object
  const params = new URLSearchParams();
  params.append("message", data?.message || "");
  params.append("access_token", token);

  if (data?.link) {
    params.append("link", data.link);
  }

  if (data?.publishTime) {
    const now = new Date();
    const minTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
    const maxTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const scheduledTime = new Date(data?.publishTime);

    // Validate the time is in the future
    if (scheduledTime <= now) {
      throw new Error("Scheduled time must be in the future");
    }

    // Validate minimum time buffer (15 minutes)
    if (scheduledTime < minTime) {
      throw new Error(
        "Scheduled time must be at least 15 minutes in the future"
      );
    }

    // Validate maximum time limit (30 days)
    if (scheduledTime > maxTime) {
      throw new Error(
        "Scheduled time cannot be more than 30 days in the future"
      );
    }

    params.append("published", "false");
    params.append(
      "scheduled_publish_time",
      Math.floor(scheduledTime.getTime() / 1000).toString()
    );
    // Unix timestamp conversion
  }
  return await axios.post(url, params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

const deletePostByPostId = async ({ token, postId }) => {
  const url = `${GRAPH_BASE_URL}/${postId}`;
  const params = {
    access_token: token,
  };

  return await axios.delete(url, { params });
};

const fetchPageDetailByPageId = async ({ token, pageId }) => {
  const url = `${GRAPH_BASE_URL}/${pageId}`;

  const params = {
    access_token: token,
    fields: "id,name,about,fan_count,link",
  };

  return await axios.get(url, { params });
};

module.exports = {
  handleEntry,
  FacebookService,
  getConversationParticipants,
  sendTextMessage,
  sendAttachmentMessage,
  getParticipantsProfilePicById,
  markedConversationAsReadBasedOnConversationId,
  fetchPagePostsByPageId,
  uploadTextPost,
  deletePostByPostId,
  fetchPageDetailByPageId,
};
