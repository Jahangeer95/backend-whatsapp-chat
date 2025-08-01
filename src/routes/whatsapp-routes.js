const { Router } = require("express");
const whatsappController = require("../controllers/whatsapp-controller");

const router = Router();

router
  .route("/webhook")
  .get(whatsappController.verifyWebhook)
  .post(whatsappController.receiveWebHook);

module.exports = router;
