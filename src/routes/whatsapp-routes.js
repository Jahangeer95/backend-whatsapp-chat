const { Router } = require("express");
const whatsappController = require("../controllers/whatsapp-controller");
const { whatsappUploads } = require("../middlewares/multer");

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

module.exports = router;
