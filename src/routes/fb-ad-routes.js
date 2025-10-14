const { Router } = require("express");
const fbAdController = require("../controllers/fb-ad-controller");
const {
  validateNewCampaign,
  validateFbAdHeaders,
} = require("../validator/fb-ad-validator");

const router = Router();

router
  .route("/campaigns")
  .all(validateFbAdHeaders)
  .post(validateNewCampaign, fbAdController.createfbAdCompaign);

module.exports = router;
