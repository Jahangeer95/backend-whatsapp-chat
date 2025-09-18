const { Router } = require("express");
const userController = require("../controllers/app-user-controller");
const {
  validateLoginUser,
  validateNewUser,
} = require("../validator/user-validator");
const authMiddleware = require("../middlewares/auth-middlware");

const router = Router();

router.post("/login", validateLoginUser, userController.loginUser);

router.route("/sign-up").post(validateNewUser, userController.createUser);

// it needs to be protected
router
  .route("/")
  .all(authMiddleware)
  .post(validateNewUser, userController.createUser)
  .get(userController.fetchUsers);

module.exports = router;
