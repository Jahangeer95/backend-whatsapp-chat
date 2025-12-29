const { Router } = require("express");
const whatsappController = require("../controllers/whatsapp-controller");
const { whatsappUploads } = require("../middlewares/multer");
const whatsAppValidator = require("../validator/whatsapp-validator");
const { validateUserId } = require("../validator");

const router = Router();

router
  .route("/webhook")
  .get(whatsappController.verifyWebhook)
  .post(whatsappController.receiveWebHook);

router.post(
  "/send-message",
  whatsAppValidator.validateWhatsappHeaders,
  whatsappUploads.single("file"),
  whatsappController.sendMessage
);

router
  .route("/contacts")
  .get(
    whatsAppValidator.validateWhatsappHeaders,
    whatsappController?.getAllContacts
  );

router
  .route("/messages/:userId")
  .get(
    whatsAppValidator.validateWhatsappHeaders,
    validateUserId,
    whatsappController.getAllMessagesForUser
  );

router
  .route("/media/:id")
  .get(
    whatsAppValidator.validateWhatsappHeaders,
    whatsappController.getMediaByMediaId
  );

router.get(
  "/templates",
  whatsAppValidator.validateWhatsappHeaders,
  whatsappController.fetchAllPageTemplates
);

module.exports = router;
