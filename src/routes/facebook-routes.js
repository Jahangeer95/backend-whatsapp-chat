const { Router } = require("express");
const facebookController = require("../controllers/facebook-controller");
const { upload } = require("../middlewares/multer");

const router = Router();

router
  .route("/webhook")
  .get(facebookController.verifyWebhook)
  .post(facebookController.receiveWebhook);

router.post(
  "/send-message",
  upload.single("file"),
  facebookController.sendMessage
);
router.get("/user/:userId", facebookController.fetchUserProfilePic);
router.get("/participants/:pageId", facebookController.fetchParticipants);

router.get("/conversations/:pageId", facebookController.fetchAllConversations);
router.get(
  "/messages/:conversationId",
  facebookController.fetchMessagesByConversationId
);

router.post("/mark-as-read", facebookController.markedConversationAsRead);

module.exports = router;
