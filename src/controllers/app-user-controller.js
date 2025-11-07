const bcrypt = require("bcrypt");
const userService = require("../services/app-user-service");
const { USER_ROLE_OBJ } = require("../config");

const createOwner = async (req, res) => {
  const { username, email, password } = req.body;

  const owner = await userService.findUserByRole(USER_ROLE_OBJ.owner);

  if (owner)
    // 409 error for rule violation
    return res.status(409).send({
      message: "Owner already exists. Only one is permitted.",
    });

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  let newUser = await userService.createNewUser({
    username,
    email,
    role: USER_ROLE_OBJ.owner,
    password: hashPassword,
  });

  const token = newUser.generateAuthToken();
  newUser = newUser.toObject();
  delete newUser.password;

  res.send({ success: true, message: "Owner created successfully" });
};

const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) {
    return res
      .status(400)
      .send({ message: "This email is already registered" });
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
  const { username, password } = req.body || {};

  let user = await userService.findUserByUsername(username);
  if (!user) {
    return res.status(400).send({ message: "Invalid username or password" });
  }

  const isPasswordValid = await userService.passwordComparison({
    savedPassword: user.password,
    password,
  });
  if (!isPasswordValid) {
    return res.status(400).send({ message: "Invalid username or password" });
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

  const user = await userService.findUserById(userId);

  if (user?.role === USER_ROLE_OBJ.owner) {
    return res.status(409).send({
      success: false,
      message: "Owner user role can not be changed",
    });
  }

  try {
    const updatedUser = await userService.updateUserRoleByUserId(userId, role);

    if (!updatedUser) {
      return res.status(400).send({
        success: false,
        message: "No user exists with Id",
      });
    }

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
    const user = await userService.findUserById(userId);

    if (user?.role === USER_ROLE_OBJ.owner) {
      return res.status(409).send({
        success: false,
        message: "User having role owner cannot be deleted",
      });
    }

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

const getUserDetail = async (req, res) => {
  const { userId } = req.params || {};

  try {
    let user = await userService.findUserById(userId);

    if (!user) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid user Id" });
    }

    user = user.toObject();
    delete user.password;
    delete user.pages;

    res.send({ success: true, data: user });
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
  getUserDetail,
  createOwner,
};
