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
  validateAssignWhatsappAccount,
  validateUserUpdate,
} = require("../validator/whatsapp-user-validator");
const authMiddleware = require("../middlewares/auth-middlware");

const router = Router();

router
  .route("/webhook")
  .get(whatsappController.verifyWebhook)
  .post(whatsappController.receiveWebHook);
// permission added in send message
router.post(
  "/send-message",
  authMiddleware,
  whatsAppValidator.validateWhatsappHeaders,
  whatsappUploads.single("file"),
  whatsappController.sendMessage
);

router
  .route("/contacts")
  .all(authMiddleware)
  .get(
    whatsAppValidator.validateWhatsappHeaders,
    whatsappController?.getAllContacts
  );

router
  .route("/messages/:userId")
  .all(authMiddleware)
  .get(
    whatsAppValidator.validateWhatsappHeaders,
    validateUserId,
    whatsappController.getAllMessagesForUser
  );

router
  .route("/media/:id")
  .all(authMiddleware)
  .get(
    whatsAppValidator.validateWhatsappHeaders,
    whatsappController.getMediaByMediaId
  );

router.get(
  "/templates",
  authMiddleware,
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
  .all(authMiddleware)
  .post(validateNewUser, whatsappuserController.createUser)
  .get(whatsappuserController.fetchAllRegisteredUsers);
// update user endpoint, fetch user permission
router
  .route("/user/:userId/accounts")
  .all(authMiddleware)
  .get(whatsappuserController.getAllUserWhatsappAccounts);
// permission added for delete
router
  .route("/user/:userId")
  .all(authMiddleware)
  .delete(whatsappuserController.deleteUserAccount)
  .put(validateUserUpdate, whatsappuserController.updateUser);
// permission added for account creation
router
  .route("/accounts")
  .all(authMiddleware)
  .post(
    validateNewWhatsappAccount,
    whatsappuserController.createNewWhatsappAccount
  );
//permission added for put,delete,post
router
  .route("/accounts/:whatsappDocId")
  .all(authMiddleware)
  .put(validateNewWhatsappAccount, whatsappuserController.updateWhatsappAccount)
  .delete(whatsappuserController.deleteWhatsappAccount)
  .post(
    validateAssignWhatsappAccount,
    whatsappuserController.assignWhatsappAccountToUser
  );

module.exports = router;
