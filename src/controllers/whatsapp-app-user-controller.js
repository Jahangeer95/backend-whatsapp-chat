const bcrypt = require("bcrypt");
const { USER_ROLE_OBJ } = require("../config");
const whatsAppUserService = require("../services/whatsapp-app-user-service");

const createOwner = async (req, res) => {
  const { name, email, password } = req.body;

  const owner = await whatsAppUserService.findUserByRole(USER_ROLE_OBJ.owner);

  if (owner)
    // 409 error for rule violation
    return res.status(409).send({
      message: "Owner already exists. Only one is permitted.",
    });

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  let newUser = await whatsAppUserService.createNewWhatsappUser({
    name,
    email,
    role: USER_ROLE_OBJ.owner,
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
  const { username, email, password, role } = req.body;

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

module.exports = {
  createOwner,
  createUser,
  loginUser,
};
