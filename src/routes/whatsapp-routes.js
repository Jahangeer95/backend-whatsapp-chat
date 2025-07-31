const { Router } = require("express");
const whatsappController = require("../controllers/whatsapp-controller");

const router = Router();

router.route("/webhook").get(whatsappController.verifyWebhook);
//   .post(facebookController.receiveWebhook);q1

module.exports = router;
