const { Router } = require("express");
const facebookController = require("../controllers/facebook-controller");

const router = Router();

router
  .route("/webhook")
  .get(facebookController.verifyWebhook)
  .post(facebookController.receiveWebhook);

router.post("/send-message", facebookController.sendMessage);

router.get("/conversations/:pageId", facebookController.fetchAllConversations);
router.get(
  "/messages/:conversationId",
  facebookController.fetchMessagesByConversationId
);

module.exports = router;
