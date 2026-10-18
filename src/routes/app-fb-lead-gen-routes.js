const { Router } = require("express");
const authMiddleware = require("../middlewares/auth-middlware");
const fbLeadGenController = require("../controllers/fb-lead-gen-controller");
const {
  validateNewFbLeadGenPage,
} = require("../validator/fb-lead-gen-validator");

router = Router();

router
  .route("/")
  .all(authMiddleware)
  .post(validateNewFbLeadGenPage, fbLeadGenController.createFbLeadGen);

router.route("/webhook/:pageId").get(fbLeadGenController.verifyWebhook);

router
  .route("/:pageId")
  .all(authMiddleware)
  .delete(fbLeadGenController.deleteFbLeadGenPageByPageId)
  .put(validateNewFbLeadGenPage, fbLeadGenController.updateFbLeadGenPage);

router
  .route("/:company_id")
  .all(authMiddleware)
  .get(fbLeadGenController.getAllSavedLeadGenPagesByCompanyId);

module.exports = router;
