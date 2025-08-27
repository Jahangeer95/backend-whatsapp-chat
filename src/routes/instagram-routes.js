const { Router } = require("express");
const instagramController = require("../controllers/instagram-controller");
const instagramValidator = require("../validator/instagram-validator");
const { instaUploads } = require("../middlewares/multer");

const router = new Router();

router
  .route("/webhook")
  .get(instagramController.verifyWebhook)
  .post(instagramController.receiveWebhook);

router.get(
  "/participants",
  instagramValidator.validateInstagramHeaders,
  instagramController.fetchFollowers
);
// account id = fb page id

router.get(
  "/conversations/:conversationId",
  instagramValidator.validateInstagramHeaders,
  instagramController.fetchConversationById
);

router.post(
  "/send-message",
  instagramValidator.validateInstagramHeaders,
  instaUploads.single("file"),
  instagramController.sendMessage
);

module.exports = router;
