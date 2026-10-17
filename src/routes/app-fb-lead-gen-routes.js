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

router
  .route("/:pageId")
  .all(authMiddleware)
  .put(validateNewFbLeadGenPage, fbLeadGenController.updateFbLeadGenPage);

router
  .route("/:company_id")
  .all(authMiddleware)
  .get(fbLeadGenController.getAllSavedLeadGenPagesByCompanyId);

module.exports = router;
