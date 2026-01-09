const { Router } = require("express");
const whatsappController = require("../controllers/whatsapp-controller");
const whatsappuserController = require("../controllers/whatsapp-app-user-controller");
const { whatsappUploads } = require("../middlewares/multer");
const whatsAppValidator = require("../validator/whatsapp-validator");
const { validateUserId } = require("../validator");
const {
  validateOwner,
  validateLoginUser,
  validateNewUser,
  validateNewWhatsappAccount,
} = require("../validator/whatsapp-user-validator");

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

router
  .route("/user/sign-up")
  .post(validateOwner, whatsappuserController.createOwner);
router
  .route("/user/login")
  .post(validateLoginUser, whatsappuserController.loginUser);

router
  .route("/user")
  .post(validateNewUser, whatsappuserController.createUser)
  .get(whatsappuserController.fetchAllRegisteredUsers);

router
  .route("/accounts")
  .post(
    validateNewWhatsappAccount,
    whatsappuserController.createNewWhatsappAccount
  );

router
  .route("/accounts/:whatsappDocId")
  .put(
    validateNewWhatsappAccount,
    whatsappuserController.updateWhatsappAccount
  );

module.exports = router;
