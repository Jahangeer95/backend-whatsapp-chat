const { Router } = require("express");
const userController = require("../controllers/app-user-controller");
const {
  validateLoginUser,
  validateNewUser,
} = require("../validator/user-validator");
const authMiddleware = require("../middlewares/auth-middlware");
const appPagesController = require("../controllers/app-pages-controller");
const { validateNewPage } = require("../validator/app-pages-validator");
const { checkRoleAdmin } = require("../middlewares/authorize-middleware");

const router = Router();

router.post("/login", validateLoginUser, userController.loginUser);

router.route("/sign-up").post(validateNewUser, userController.createUser);

// it needs to be protected
router
  .route("/")
  .all(authMiddleware)
  .post(validateNewUser, userController.createUser)
  .get(userController.fetchUsers);

router
  .route("/pages")
  .all(authMiddleware)
  .post(checkRoleAdmin, validateNewPage, appPagesController.createNewPage);

module.exports = router;
