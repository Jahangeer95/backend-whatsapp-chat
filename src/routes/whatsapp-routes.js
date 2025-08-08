const { Router } = require("express");
const whatsappController = require("../controllers/whatsapp-controller");
const { whatsappUploads } = require("../middlewares/multer");
const { validateUserId } = require("../validator");

const router = Router();

router
  .route("/webhook")
  .get(whatsappController.verifyWebhook)
  .post(whatsappController.receiveWebHook);

router.post(
  "/send-message",
  whatsappUploads.single("file"),
  whatsappController.sendMessage
);

router.route("/contacts").get(whatsappController?.getAllContacts);

router
  .route("/messages/:userId")
  .get(validateUserId, whatsappController.getAllMessagesForUser);

router.route("/media/:id").get(whatsappController.getMediaByMediaId);

router.get("/templates", whatsappController.fetchAllPageTemplates);

module.exports = router;
