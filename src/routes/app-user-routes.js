const { Router } = require("express");
const userController = require("../controllers/app-user-controller");
const {
  validateLoginUser,
  validateNewUser,
} = require("../validator/user-validator");

const router = Router();

router.post("/login", validateLoginUser, userController.loginUser);
router.post("/sign-up", validateNewUser, userController.createUser);

module.exports = router;
