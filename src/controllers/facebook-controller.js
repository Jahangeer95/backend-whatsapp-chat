const axios = require("axios");
const fs = require("fs");
const { VERIFY_TOKEN, BACKEND_URL } = require("../config/index");
const facebookService = require("../services/facebook-service");
const logger = require("../utils/logger");

exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

exports.receiveWebhook = (req, res) => {
  const body = req.body;
  const io = req.app.get("io"); // Access socket instance

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      facebookService.handleEntry(entry, io);
    });
    return res.status(200).send("EVENT_RECEIVED");
  }
  return res.sendStatus(404);
};

exports.sendMessage = async (req, res) => {
  const { token, pageId } = req.facebook;
  const { recipientId, message, type } = req.body;
  const file = req.file || null;

  if (!recipientId || !type) {
    return res
      .status(400)
      .json({ error: "recipientId, type and message are required" });
  }

  try {
    // Send message to Facebook

    if (type === "text") {
      await facebookService.sendTextMessage({ recipientId, message, token });
    } else {
      if (!file) {
        return res
          .status(400)
          .json({ error: "Attachment file is required for non-text message" });
      }
      await facebookService.sendAttachmentMessage({
        recipientId,
        file,
        type,
        token,
      });
    }

    res.status(200).json({ success: true, message: "Message sent" });
  } catch (err) {
    logger.error("Send message error:", err.response?.data || err.message);
    res.status(500).json({
      error: err?.message || err.data?.message || "Failed to send message",
    });
  }
};

exports.fetchAllConversations = async (req, res) => {
  try {
    const { token, pageId } = req.facebook;

    const conversations =
      await facebookService.FacebookService.getConversations(pageId, token);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.fetchMessagesByConversationId = async (req, res) => {
  try {
    const { token, pageId } = req.facebook;
    const { conversationId } = req.params;
    const { after } = req.query;
    const messages = await facebookService.FacebookService.getMessages(
      conversationId,
      after,
      token,
      pageId
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.fetchParticipants = async (req, res) => {
  try {
    const { token, pageId } = req.facebook;
    const { after } = req.query;
    const data = await facebookService.getConversationParticipants(
      pageId,
      token,
      after
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.fetchUserProfilePic = async (req, res) => {
  try {
    const { token, pageId } = req.facebook;
    const { userId } = req.params;
    const data = await facebookService.getParticipantsProfilePicById(
      userId,
      token,
      pageId
    );

    if (!data) {
      return res.status(404).send("Profile picture not found");
    }

    // Fetch the image from Facebook and pipe it to the response
    const imageResponse = await axios.get(data, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", imageResponse.headers["content-type"]);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    imageResponse.data.pipe(res);
    // res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error?.message });
  }
};

exports.markedConversationAsRead = async (req, res) => {
  try {
    const { token, pageId } = req.facebook;
    const { conversationId } = req.body;

    await facebookService.markedConversationAsReadBasedOnConversationId(
      conversationId,
      token
    );

    res.status(200).json({ message: "Conversation marked as read" });
  } catch (error) {
    res.json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.fetchAllPosts = async (req, res) => {
  try {
    const { token, pageId } = req.facebook;
    const { after } = req.query;

    const response = await facebookService.fetchPagePostsByPageId(
      pageId,
      token,
      after
    );
    res.json({
      success: true,
      posts: response?.data?.data,
      paging: response?.data?.paging,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error.message });
  }
};

exports.fetchAllUnPublishedPosts = async (req, res) => {
  try {
    const { token, pageId } = req.facebook;
    const { after } = req.query;

    const response = await facebookService.fetchPageUnpublishedPostsByPageId(
      pageId,
      token,
      after
    );
    res.json({
      success: true,
      posts: response?.data?.data,
      paging: response?.data?.paging,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error.message });
  }
};

exports.createTextPost = async (req, res) => {
  const { token, pageId } = req.facebook;
  const { message } = req.body || {};
  const { postId } = req.params;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "Message is required",
    });
  }

  try {
    const response = await facebookService.uploadTextPost({
      pageId,
      token,
      data: req.body,
      postId,
    });
    res.send({
      success: true,
      data: response.data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error?.message });
  }
};

exports.createPhotoPost = async (req, res) => {
  const { token, pageId } = req.facebook;
  const { message = "", publishTime } = req.body || {};
  const { postId } = req.params;
  const file = req.file || null;

  try {
    await facebookService.deletePostByPostId({
      token,
      postId,
    });
    const response = await facebookService.uploadPhotoPost({
      token,
      pageId,
      data: { message, file, publishTime },
    });

    res.send({ success: true, data: response.data });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error?.message });
  } finally {
    fs.unlink(file.path, (err) => {
      if (err) logger.error("File cleanup failed:", err.message);
    });
  }
};

exports.deletePost = async (req, res) => {
  const { token, pageId } = req.facebook;
  const { postId } = req.params;

  try {
    const response = await facebookService.deletePostByPostId({
      token,
      postId,
    });
    return res.send({ data: response?.data });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error?.message });
  }
};

exports.getPageDetail = async (req, res) => {
  const { token, pageId } = req.facebook;

  try {
    const response = await facebookService.fetchPageDetailByPageId({
      token,
      pageId,
    });

    res.send({ data: response.data });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error?.message });
  }
};

exports.getPostComments = async (req, res) => {
  const { token, pageId } = req.facebook;
  const { postId } = req.params;

  try {
    const response = await facebookService.fetchCommentsByPostId({
      token,
      pageId,
      postId,
    });

    res.send({
      success: true,
      data: response?.data?.data,
      paging: response?.data?.paging,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error?.message });
  }
};

exports.getCommentReplies = async (req, res) => {
  const { token, pageId } = req.facebook;
  const { commentId } = req.params;

  try {
    const response = await facebookService.fetchCommentRepliesByCommentId({
      token,
      pageId,
      commentId,
    });

    res.send({
      success: true,
      data: response?.data?.data,
      paging: response?.data?.paging,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error?.message });
  }
};

exports.uploadPostComment = async (req, res) => {
  const { token, pageId } = req.facebook;
  const { postId } = req.params;
  const { message, commentId } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: "Message is required",
    });
  }

  try {
    const response = await facebookService.addCommentOnPostByPostId({
      token,

      postId,
      data: {
        message,
        commentId,
      },
    });

    res.send({ success: true, data: response.data });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error?.message });
  }
};

exports.blockPersonFromPageById = async (req, res) => {
  const { token, pageId } = req.facebook;
  const { psid } = req.body;
  try {
    const response = await facebookService.blockPersonFromPage({
      token,
      pageId,
      psid,
    });

    res.send({ success: true, data: response.data });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error?.message });
  }
};

exports.fetchPageInsights = async (req, res) => {
  const { token, pageId } = req.facebook;
  try {
    const response = await facebookService.getPageInsightsByPageId({
      token,
      pageId,
    });
    res.send({
      success: true,
      data: response?.data?.data,
      paging: response?.data?.paging,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: error?.response?.data?.error?.message || error?.message });
  }
};
