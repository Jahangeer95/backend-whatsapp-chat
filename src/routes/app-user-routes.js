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
  checkAuthorizationForUserPaths,
  checkAuthorizationForPagesPaths,
} = require("../middlewares/authorize-middleware");
const { validateUserId, validatePageId } = require("../validator");

const router = Router();
// test

router.post("/login", validateLoginUser, userController.loginUser);

router.route("/sign-up").post(validateOwner, userController.createOwner);

// it needs to be protected
router
  .route("/")
  .all(authMiddleware, checkAuthorizationForUserPaths)
  .post(validateNewUser, userController.createUser)
  .get(userController.fetchUsers);

router
  .route("/pages")
  .all(authMiddleware)
  .get(appPagesController.getAllUserPages)
  .post(
    checkAuthorizationForPagesPaths,
    validateNewPage,
    appPagesController.createNewPage
  );

router
  .route("/pages/:pageId")
  .all(authMiddleware, checkAuthorizationForPagesPaths, validatePageId)
  .delete(appPagesController.deleteFbPage)
  .post(appPagesController.addUsertoPage)
  .put(validateNewPage, appPagesController.updateNewPage);

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
