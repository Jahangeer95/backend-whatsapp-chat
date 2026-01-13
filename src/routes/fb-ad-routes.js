const { Router } = require("express");
const fbAdController = require("../controllers/fb-ad-controller");
const {
  validateNewCampaign,
  validateFbAdHeaders,
  validateAdUpdate,
  validateAdInsightQueryParams,
  validateAdCreativeQueryParams,
} = require("../validator/fb-ad-validator");
const authMiddleware = require("../middlewares/auth-middlware");
const { upload } = require("../middlewares/multer");
const {
  checkAuthorizationForAdsCampaignPaths,
  checkAuthorizationForAdsAdsetPaths,
  checkAuthorizationForAdsCreativePaths,
  checkAuthorizationForAdsPaths,
  checkAllowedRoles,
} = require("../middlewares/authorize-middleware");
const { CAN_VIEW_AD_INSIGHT } = require("../config");

const router = Router();

router
  .route("/campaigns")
  .all(
    authMiddleware,
    validateFbAdHeaders,
    checkAuthorizationForAdsCampaignPaths
  )
  .post(validateNewCampaign, fbAdController.createfbAdCompaign)
  .get(fbAdController.fetchAllCampaign);

router
  .route("/campaigns/:campaignId")
  .all(
    authMiddleware,
    validateFbAdHeaders,
    checkAuthorizationForAdsCampaignPaths
  )
  .post(fbAdController.updateAdCampaign)
  .delete(fbAdController.deleteCampaign);

router
  .route("/adsets")
  .all(authMiddleware, checkAuthorizationForAdsAdsetPaths, validateFbAdHeaders)
  .get(fbAdController.getAdsets)
  .post(fbAdController.createAnAdset);

router
  .route("/adsets/:campaignId")
  .all(authMiddleware, checkAuthorizationForAdsAdsetPaths, validateFbAdHeaders)
  .get(fbAdController.getAdsetsByUsingCampaignId);

router
  .route("/adsets/:adsetId")
  .all(authMiddleware, checkAuthorizationForAdsAdsetPaths, validateFbAdHeaders)
  .delete(fbAdController.deleteAdset)
  .post(fbAdController.updateAdsetByAdsetId);

router
  .route("/adcreatives")
  .all(
    authMiddleware,
    checkAuthorizationForAdsCreativePaths,
    validateFbAdHeaders
  )
  .post(fbAdController.createAdcreative)
  .get(fbAdController.fetchAllAdcreative);

router
  .route("/adcreatives/preview")
  .all(authMiddleware, validateFbAdHeaders)
  .post(fbAdController.createAdCreativePreview);

router
  .route("/adcreatives/:adcreativeId")
  .all(
    authMiddleware,
    checkAuthorizationForAdsCreativePaths,
    validateFbAdHeaders
  )
  .delete(fbAdController.deleteAdcreative);

router
  .route("/adcreatives/:adcreativeId/preview")
  .all(
    authMiddleware,
    checkAuthorizationForAdsCreativePaths,
    validateFbAdHeaders
  )
  .get(validateAdCreativeQueryParams, fbAdController.fetchAdCreativePreview);

router
  .route("/ads")
  .all(authMiddleware, checkAuthorizationForAdsPaths, validateFbAdHeaders)
  .get(fbAdController.fetchAllAds)
  .post(fbAdController.createAd);

router
  .route("/ads/:adId")
  .all(authMiddleware, checkAuthorizationForAdsPaths, validateFbAdHeaders)
  .delete(fbAdController.deleteAd)
  .post(validateAdUpdate, fbAdController.updateAd);

router
  .route("/ads/:adId/preview")
  .all(authMiddleware, checkAuthorizationForAdsPaths, validateFbAdHeaders)
  .get(validateAdCreativeQueryParams, fbAdController.fetchAdPreview);

router
  .route("/insight")
  .all(
    authMiddleware,
    checkAllowedRoles(CAN_VIEW_AD_INSIGHT),
    validateFbAdHeaders
  )
  .get(validateAdInsightQueryParams, fbAdController.fetchAdInsight);

router
  .route("/ad-images")
  .all(authMiddleware, validateFbAdHeaders)
  .post(upload.single("file"), fbAdController.uploadImageForAdcreative);

router
  .route("/ad-images/:hashId")
  .all(authMiddleware, validateFbAdHeaders)
  .get(fbAdController.getMediaByUsingHashId);

module.exports = router;
