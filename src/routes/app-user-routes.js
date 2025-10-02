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
  checkRoleAdminAndManager,
} = require("../middlewares/authorize-middleware");
const { validateUserId, validatePageId } = require("../validator");

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
  .post(checkRoleAdmin, appPagesController.addUsertoPage);

router
  .route("/:userId")
  .all(authMiddleware, validateUserId)
  .delete(checkRoleAdmin, userController.deleteAppUser)
  .patch(
    checkRoleAdminAndManager,
    validateUserRole,
    userController.updateUserRole
  );

module.exports = router;
