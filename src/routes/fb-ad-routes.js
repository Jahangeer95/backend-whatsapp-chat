const { Router } = require("express");
const fbAdController = require("../controllers/fb-ad-controller");
const {
  validateNewCampaign,
  validateFbAdHeaders,
  validateAdUpdate,
} = require("../validator/fb-ad-validator");
const authMiddleware = require("../middlewares/auth-middlware");
const { upload } = require("../middlewares/multer");

const router = Router();

router
  .route("/campaigns")
  .all(authMiddleware, validateFbAdHeaders)
  .post(validateNewCampaign, fbAdController.createfbAdCompaign)
  .get(fbAdController.fetchAllCampaign);

router
  .route("/campaigns/:campaignId")
  .all(authMiddleware, validateFbAdHeaders)
  .post(fbAdController.updateAdCampaign)
  .delete(fbAdController.deleteCampaign);

router
  .route("/adsets")
  .all(authMiddleware, validateFbAdHeaders)
  .post(fbAdController.createAnAdset);

router
  .route("/adsets/:campaignId")
  .all(authMiddleware, validateFbAdHeaders)
  .get(fbAdController.getAdsetsByUsingCampaignId);

router
  .route("/adsets/:adsetId")
  .all(authMiddleware, validateFbAdHeaders)
  .delete(fbAdController.deleteAdset)
  .post(fbAdController.updateAdsetByAdsetId);

router
  .route("/adcreatives")
  .all(authMiddleware, validateFbAdHeaders)
  .post(fbAdController.createAdcreative)
  .get(fbAdController.fetchAllAdcreative);

router
  .route("/adcreatives/:adcreativeId")
  .all(authMiddleware, validateFbAdHeaders)
  .delete(fbAdController.deleteAdcreative);

router
  .route("/ads")
  .all(authMiddleware, validateFbAdHeaders)
  .get(fbAdController.fetchAllAds)
  .post(fbAdController.createAd);

router
  .route("/ads/:adId")
  .all(authMiddleware, validateFbAdHeaders)
  .delete(fbAdController.deleteAd)
  .post(validateAdUpdate, fbAdController.updateAd);

router
  .route("/ad-images")
  .all(authMiddleware, validateFbAdHeaders)
  .post(upload.single("file"), fbAdController.uploadImageForAdcreative);

module.exports = router;
