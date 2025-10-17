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
  .post(validateNewCampaign, fbAdController.createfbAdCompaign)
  .get(fbAdController.fetchAllCampaign);

router
  .route("/adsets")
  .all(authMiddleware, validateFbAdHeaders)
  .post(fbAdController.createAnAdset);

module.exports = router;
