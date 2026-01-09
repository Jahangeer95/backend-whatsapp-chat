const bcrypt = require("bcrypt");
const { WHATSAPP_USER_ROLE_OBJ } = require("../config");
const whatsAppUserService = require("../services/whatsapp-app-user-service");

const createOwner = async (req, res) => {
  const { name, email, password } = req.body;

  const owner = await whatsAppUserService.findUserByRole(
    WHATSAPP_USER_ROLE_OBJ.owner
  );

  if (owner) {
    // 409 error for rule violation
    return res.status(409).send({
      message: "Owner already exists. Only one is permitted.",
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  let newUser = await whatsAppUserService.createNewWhatsappUser({
    name,
    email,
    role: WHATSAPP_USER_ROLE_OBJ.owner,
    password: hashPassword,
  });

  const token = newUser.generateAuthToken();
  newUser = newUser.toObject();
  delete newUser.password;

  res.send({
    success: true,
    data: newUser,
    message: "Owner Created successfully",
  });

  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Something went wrong",
    });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let existingUser = await whatsAppUserService.findUserByEmail(email);

    if (existingUser) {
      return res
        .status(400)
        .send({ success: false, message: "This email is already registered." });
    }

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "This username is already registered.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    let newUser = await whatsAppUserService.createNewWhatsappUser({
      name,
      email,
      role,
      password: hashPassword,
    });

    const token = newUser.generateAuthToken();
    newUser = newUser.toObject();

    delete newUser.password;

    res.send({
      success: true,
      data: newUser,
      message: "User created successfuly",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Something went wrong",
    });
  }
};

const loginUser = async (req, res) => {
  const { name, password } = req.body || {};

  let user = await whatsAppUserService.findUserByUsername(name);
  if (!user) {
    return res.status(400).send({ message: "Invalid username or password" });
  }

  const isPasswordValid = await whatsAppUserService.comparePassword({
    savedPassword: user.password,
    password,
  });

  if (!isPasswordValid) {
    return res
      .status(400)
      .send({ success: false, message: "Invalid username or password" });
  }

  const token = user.generateAuthToken();
  user = user.toObject();
  delete user.password;

  res.header("user_auth_token", token).send(user);
};

const fetchAllRegisteredUsers = async (req, res) => {
  try {
    const users = await whatsAppUserService.fetchAllUsers();

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

const createNewWhatsappAccount = async (req, res) => {
  const { whatsapp_access_token, phone_no_id, whatsapp_business_id } = req.body;

  try {
    const { isValid, name } =
      await whatsAppUserService.isValidWhatsappBusinessId({
        whatsapp_business_id,
        whatsapp_access_token,
      });

    if (!isValid) {
      return res
        .status(400)
        .send({ success: false, message: "whatsapp_business_id is invalid" });
    }

    const owner = await whatsAppUserService.findUserByRole(
      WHATSAPP_USER_ROLE_OBJ.owner
    );

    let whatsapp = await whatsAppUserService.createNewWhatsappAccount({
      whatsapp_access_token,
      phone_no_id,
      whatsapp_business_id,
      user_id: owner?._id,
    });
    // if(admin create new account then that user id needs to be added)

    res.send({
      success: true,
      data: whatsapp,
      message: "Whatsapp account linked successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

const updateWhatsappAccount = async (req, res) => {
  const { whatsappDocId } = req.params;

  try {
    let account = await whatsAppUserService.getWhatsappAccountById(
      whatsappDocId
    );

    if (!account) {
      return res.status(400).send({
        success: false,
        message: "whatsapp account Id is invalid",
      });
    }

    const { isValid, name } =
      await whatsAppUserService.isValidWhatsappBusinessId({
        whatsapp_business_id: req.body.whatsapp_business_id,
        whatsapp_access_token: req.body.whatsapp_access_token,
      });

    if (!isValid) {
      return res
        .status(400)
        .send({ success: false, message: "whatsapp_business_id is invalid" });
    }

    const response = await whatsAppUserService.updateWhatsappAccountbyId(
      _id,
      req.body
    );

    console.log(response.data, "update wp");

    res.json({
      success: true,
      message: "Whatsapp account data updated successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

const getAllUserWhatsappAccounts = async (req, res) => {
  try {
  } catch (error) {
    res.json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

module.exports = {
  createOwner,
  createUser,
  loginUser,
  fetchAllRegisteredUsers,
  createNewWhatsappAccount,
  updateWhatsappAccount,
};
