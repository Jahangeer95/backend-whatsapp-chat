const { Router } = require("express");
const userController = require("../controllers/app-user-controller");
const {
  validateLoginUser,
  validateNewUser,
  validateUserRole,
} = require("../validator/user-validator");
const authMiddleware = require("../middlewares/auth-middlware");
const appPagesController = require("../controllers/app-pages-controller");
const { validateNewPage } = require("../validator/app-pages-validator");
const {
  checkRoleAdmin,
  checkAllowedRoles,
} = require("../middlewares/authorize-middleware");
const { validateUserId, validatePageId } = require("../validator");
const { CAN_UPDATE_USER_ROLE } = require("../config");

const router = Router();

router.post("/login", validateLoginUser, userController.loginUser);

router.route("/sign-up").post(validateNewUser, userController.createUser);

// it needs to be protected
router
  .route("/")
  .all(authMiddleware)
  .post(checkRoleAdmin, validateNewUser, userController.createUser)
  .get(userController.fetchUsers);

router
  .route("/pages")
  .all(authMiddleware)
  .get(appPagesController.getAllUserPages)
  .post(checkRoleAdmin, validateNewPage, appPagesController.createNewPage);

router
  .route("/pages/:pageId")
  .all(authMiddleware, validatePageId)
  .delete(checkRoleAdmin, appPagesController.deleteFbPage)
  .post(checkRoleAdmin, appPagesController.addUsertoPage);

router
  .route("/:userId")
  .all(authMiddleware, validateUserId)
  .get(userController.getUserDetail)
  .delete(checkRoleAdmin, userController.deleteAppUser)
  .patch(
    checkAllowedRoles(CAN_UPDATE_USER_ROLE),
    validateUserRole,
    userController.updateUserRole
  );

module.exports = router;
