const bcrypt = require("bcrypt");
const userService = require("../services/app-user-service");
const { USER_ROLE_OBJ } = require("../config");

const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) {
    return res
      .status(400)
      .send({ message: "This email is already registered" });
  }

  if (role === USER_ROLE_OBJ.admin) {
    const admin = await userService.findUserByRole(USER_ROLE_OBJ.admin);
    if (admin)
      // 409 error for rule violation
      return res.status(409).send({
        message:
          "An administrator account already exists. Only one is permitted.",
      });
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  let newUser = await userService.createNewUser({
    username,
    email,
    role,
    password: hashPassword,
  });

  const token = newUser.generateAuthToken();
  newUser = newUser.toObject();
  delete newUser.password;

  res.send({ success: true, message: "User created successfully" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  let user = await userService.findUserByEmail(email);
  if (!user) {
    return res.status(400).send({ message: "Invalid email or password" });
  }

  const isPasswordValid = await userService.passwordComparison({
    savedPassword: user.password,
    password,
  });
  if (!isPasswordValid) {
    return res.status(400).send({ message: "Invalid email or password" });
  }

  const token = user.generateAuthToken();
  user = user.toObject();
  delete user.password;
  delete user.pages;
  res.header("user_auth_token", token).send(user);
};

const fetchUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.send({ success: true, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

const updateUserRole = async (req, res) => {
  const { role } = req.body || {};
  const { userId } = req.params || {};

  try {
    if (role === USER_ROLE_OBJ.admin) {
      const admin = await userService.findUserByRole(USER_ROLE_OBJ.admin);
      if (admin)
        // 409 error for rule violation
        return res.status(409).send({
          message:
            "An administrator account already exists. Only one is permitted.",
        });
    }

    const updatedUser = await userService.updateUserRoleByUserId(userId, role);

    res.send({ success: true, message: "User role  updated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

const deleteAppUser = async (req, res) => {
  try {
    const { userId } = req.params || {};
    const doc = await userService.deleteUserById(userId);

    if (!doc) {
      return res
        .status(400)
        .send({ success: false, message: "No user exist with this Id" });
    }

    res.send({ success: true, message: "User deleted successfully.." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  fetchUsers,
  updateUserRole,
  deleteAppUser,
};
