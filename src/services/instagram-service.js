const path = require("path");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const logger = require("../utils/logger");
const { GRAPH_BASE_URL, BACKEND_URL } = require("../config");
const { InstaUser } = require("../models/instagram-user-modal");
const { getInstagramMediaType } = require("../utils/helper");

const updateUserData = async (userId, updatedData) => {
  await InstaUser.findOneAndUpdate(
    { userId },
    {
      ...updatedData,
    },
    {
      upsert: true,
      new: true,
    }
  );
};

const handleEntry = async (entry, io) => {
  const webhookEvent = entry.messaging ? entry.messaging[0] : entry;
  console.log("Webhook event received:", webhookEvent);

  if (webhookEvent.message) {
    const { message } = webhookEvent;

    const userMessage = message.text;

    if (message?.is_echo) {
      const recipientId = webhookEvent?.recipient?.id;
      const delivery_timestamp = new Date().getTime()?.toString();

      //   console.log({ delivery_timestamp });

      updateUserData(recipientId, { delivery_timestamp });
    } else {
      const { sender } = webhookEvent || {};
      const userId = sender?.id;
      const read_timestamp = new Date().getTime()?.toString();
      const last_message_time = new Date().getTime()?.toString();

      updateUserData(userId, {
        read_timestamp,
        last_message_time,
      });
    }

    // Emit to all connected sockets (or use room for specific users)
    io.emit("message_from_user", {
      senderId: webhookEvent.sender.id,
      message: userMessage,
    });
  } else if (webhookEvent.reaction) {
    const { reaction, sender, timestamp } = webhookEvent || {};
    console.log({ reaction, sender, webhookEvent });

    const userId = sender?.id;
    io.emit("message_reaction", {
      senderId: userId,
      messageId: reaction.mid,
      action: reaction.action,
      reaction: reaction.reaction,
      timestamp: timestamp,
    });
  }
};

const getConversationParticipants = async (
  accountId,
  accessToken,
  after = null
) => {
  const url = `${GRAPH_BASE_URL}/${accountId}/conversations`;

  const params = {
    platform: "instagram",
    fields: "fields=id,participants,updated_time",
    access_token: accessToken,
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
      updatedTime: conversation?.updated_time,
      participants: conversation?.participants?.data,
    }));
    return { participants: formatted, paging };
  } catch (error) {
    console.error(
      "Error fetching Instagram participants:",
      error.response?.data?.error?.message || error.message
    );
    throw new Error(
      error.response?.data?.error?.message ||
        error?.message ||
        "Failed to fetch Instagram participants"
    );
  }
};

const getMessagesByConversationId = async (
  instaId,
  accessToken,
  conversationId,
  after = null
) => {
  const params = {
    fields: "message,attachments,sticker,quick_reply,from,to,created_time",
    access_token: accessToken,
    limit: 20,
  };
  if (after) {
    params.after = after;
  }
  const url = `${GRAPH_BASE_URL}/${conversationId}/messages`;
  const response = await axios.get(url, { params });

  const messages = response?.data?.data || [];
  const paging = response?.data?.paging || {};

  const recipientMessage = messages.find((msg) => {
    return msg.from.id === instaId;
  });
  const userMessage = messages.find((msg) => msg.from.id !== instaId);
  const recipientId =
    recipientMessage?.to?.data?.[0]?.id || userMessage?.from?.id;

  let instaUser = null;
  if (recipientId) {
    instaUser = await InstaUser.findOne({ userId: recipientId });
  }

  const messagesArray = messages.map((msg) => {
    let status = "sent";

    if (msg.from.id === instaId && instaUser) {
      const messageTimestamp = new Date(msg.created_time).getTime();

      if (messageTimestamp <= Number(instaUser.read_timestamp)) {
        status = "read";
      } else if (messageTimestamp <= Number(instaUser.delivery_timestamp)) {
        status = "delivered";
      }

      //   console.log({
      //     messageTimestamp,
      //     read_timestamp: instaUser.read_timestamp,
      //     delivery_timestamp: instaUser.delivery_timestamp,
      //     status,
      //   });

      return {
        ...msg,
        status,
      };
    }

    return {
      ...msg,
      ...(msg.from.id === instaId && { status }),
    };
  });

  return {
    messages: messagesArray,
    paging,
    instaUser,
  };
};

sendTextMessage = async ({ recipientId, message, accessToken }) => {
  return axios.post(
    `${GRAPH_BASE_URL}/me/messages`,
    {
      recipient: { id: recipientId },
      message: { text: message },
    },
    {
      params: { access_token: accessToken },
    }
  );
};

sendAttachmentMessage = async ({
  recipientId,
  file,
  type,
  accessToken,
  pageId,
}) => {
  try {
    const resolvedPath = path.resolve(file.path);
    const mediaType = getInstagramMediaType(file?.filename);

    // console.log({ file }, resolvedPath);

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

    form.append(
      "message",
      JSON.stringify({ attachment: { type, payload: {} } })
    );
    form.append("filedata", fileStream);
    // form.append("platform", "instagram");

    const uploadRes = await axios.post(
      `${GRAPH_BASE_URL}/${pageId}/message_attachments`,
      form,
      {
        headers: form.getHeaders(),
        params: { access_token: accessToken },
      }
    );

    const attachment_id = uploadRes.data.attachment_id;

    const fileUrl = `${BACKEND_URL}/insta-uploads/${file.filename}`;

    const sendRes = await axios.post(
      `${GRAPH_BASE_URL}/${pageId}/messages`,
      {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: mediaType,
            payload: { url: fileUrl },
          },
        },
        messaging_type: "RESPONSE", // recommended field
      },
      {
        params: {
          access_token: accessToken,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log({ sendRes: sendRes.data });

    // console.log({ sendRes: sendRes.data });
  } catch (error) {
    logger.error(
      "Attachment message error:",
      error.response?.data || error.message
    );

    throw error;
  }
  //    finally {
  //     fs.unlink(file.path, (err) => {
  //       if (err) logger.error("File cleanup failed:", err.message);
  //     });
  //   }
};

module.exports = {
  getConversationParticipants,
  getMessagesByConversationId,
  handleEntry,
  sendTextMessage,
  sendAttachmentMessage,
};
