const { Router } = require("express");
const fbAdController = require("../controllers/fb-ad-controller");
const {
  validateNewCampaign,
  validateFbAdHeaders,
} = require("../validator/fb-ad-validator");
const authMiddleware = require("../middlewares/auth-middlware");

const router = Router();

router
  .route("/campaigns")
  .all(authMiddleware, validateFbAdHeaders)
  .post(validateNewCampaign, fbAdController.createfbAdCompaign);

module.exports = router;
