const { Router } = require("express");
const facebookController = require("../controllers/facebook-controller");

const router = Router();

router
  .route("/webhook")
  .get(facebookController.verifyWebhook)
  .post(facebookController.receiveWebhook);

module.exports = router;
