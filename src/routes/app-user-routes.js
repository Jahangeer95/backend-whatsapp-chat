const { Router } = require("express");
const userController = require("../controllers/app-user-controller");
const {
  validateLoginUser,
  validateNewUser,
  validateUserRole,
  validateOwner,
} = require("../validator/user-validator");
const authMiddleware = require("../middlewares/auth-middlware");
const appPagesController = require("../controllers/app-pages-controller");
const { validateNewPage } = require("../validator/app-pages-validator");
const {
  checkRoleAdmin,
  checkAuthorizationForUserPaths,
} = require("../middlewares/authorize-middleware");
const { validateUserId, validatePageId } = require("../validator");

const router = Router();
// test

router.post("/login", validateLoginUser, userController.loginUser);

router.route("/sign-up").post(validateOwner, userController.createOwner);

// it needs to be protected
router
  .route("/")
  .all(authMiddleware)
  .post(
    validateNewUser,
    checkAuthorizationForUserPaths,
    userController.createUser
  )
  .get(checkAuthorizationForUserPaths, userController.fetchUsers);

router
  .route("/pages")
  .all(authMiddleware)
  .get(appPagesController.getAllUserPages)
  .post(checkRoleAdmin, validateNewPage, appPagesController.createNewPage);

router
  .route("/pages/:pageId")
  .all(authMiddleware, validatePageId)
  .delete(checkRoleAdmin, appPagesController.deleteFbPage)
  .post(checkRoleAdmin, appPagesController.addUsertoPage)
  .put(checkRoleAdmin, validateNewPage, appPagesController.updateNewPage);

router
  .route("/:userId")
  .all(authMiddleware, validateUserId)
  .get(userController.getUserDetail)
  .delete(checkAuthorizationForUserPaths, userController.deleteAppUser)
  .patch(
    checkAuthorizationForUserPaths,
    validateUserRole,
    userController.updateUserRole
  );

module.exports = router;
