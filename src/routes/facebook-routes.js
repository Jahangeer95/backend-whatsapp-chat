const { Router } = require("express");
const facebookController = require("../controllers/facebook-controller");
const fbValidator = require("../validator/fb-validator");
const { upload } = require("../middlewares/multer");

const router = Router();

router
  .route("/webhook")
  .get(facebookController.verifyWebhook)
  .post(facebookController.receiveWebhook);

router.get(
  "/page-detail",
  fbValidator.validateFbHeaders,
  facebookController.getPageDetail
);

router.post(
  "/send-message",
  fbValidator.validateFbHeaders,
  upload.single("file"),
  facebookController.sendMessage
);
router.get(
  "/user/:userId",
  fbValidator.validateFbHeaders,
  facebookController.fetchUserProfilePic
);
router.get(
  "/participants",
  fbValidator.validateFbHeaders,
  facebookController.fetchParticipants
);

router.get(
  "/conversations",
  fbValidator.validateFbHeaders,
  facebookController.fetchAllConversations
);
router.get(
  "/messages/:conversationId",
  fbValidator.validateFbHeaders,
  facebookController.fetchMessagesByConversationId
);

router.post(
  "/mark-as-read",
  fbValidator.validateFbHeaders,
  facebookController.markedConversationAsRead
);

router
  .route("/page-posts")
  .get(fbValidator.validateFbHeaders, facebookController.fetchAllPosts)
  .post(fbValidator.validateFbHeaders, facebookController.createTextPost);

// An app can only update a Page post if the post was made using that app.

router
  .route("/page-posts/:postId")
  .delete(fbValidator.validateFbHeaders, facebookController.deletePost)
  .post(fbValidator.validateFbHeaders, facebookController.createTextPost);

module.exports = router;
