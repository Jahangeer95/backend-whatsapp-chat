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
    let loginUser = await whatsAppUserService.findUserByUserId(req?.user?._id);

    if (!loginUser?.can_create_user) {
      return res.status(409).send({
        success: false,
        message: "You are not authorized to perform this action!!!",
      });
    }

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

    res.json({ success: true, data: users });
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
    let loginUser = await whatsAppUserService.findUserByUserId(req?.user?._id);

    if (!loginUser?.can_link_whatsapp_account) {
      return res.status(409).send({
        success: false,
        message: "You are not authorized to perform this action!!!",
      });
    }

    const { isValid, name } =
      await whatsAppUserService.isValidWhatsappBusinessId({
        whatsapp_business_id,
        whatsapp_access_token,
      });

    console.log(isValid, name);

    if (!isValid) {
      return res
        .status(400)
        .send({ success: false, message: "whatsapp_business_id is invalid" });
    }

    const owner = await whatsAppUserService.findUserByRole(
      WHATSAPP_USER_ROLE_OBJ.owner
    );

    const user_id_arr =
      req?.user?._id === owner?._id
        ? [owner?._id]
        : [owner?._id, req?.user?._id];

    let whatsapp = await whatsAppUserService.createNewWhatsappAccount({
      account_name: name,
      whatsapp_access_token,
      phone_no_id,
      whatsapp_business_id,
      user_id_arr,
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
    let loginUser = await whatsAppUserService.findUserByUserId(req?.user?._id);

    if (!loginUser?.can_link_whatsapp_account) {
      return res.status(409).send({
        success: false,
        message: "You are not authorized to perform this action!!!",
      });
    }

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
      whatsappDocId,
      {
        ...req.body,
        account_name: name,
      }
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
    const { userId } = req.params;

    let user = await whatsAppUserService.findUserByUserId(userId);

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "user Id is invalid",
      });
    }

    const whatsappAccounts =
      await whatsAppUserService.getAllSavedWhatsappAccountsByUserId(userId);

    res.send({ success: true, data: whatsappAccounts });
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

const deleteWhatsappAccount = async (req, res) => {
  const { whatsappDocId } = req.params;

  try {
    let loginUser = await whatsAppUserService.findUserByUserId(req?.user?._id);

    if (!loginUser?.can_delete_whatsapp_account) {
      return res.status(409).send({
        success: false,
        message: "You are not authorized to perform this action!!!",
      });
    }

    let account = await whatsAppUserService.getWhatsappAccountById(
      whatsappDocId
    );

    if (!account) {
      return res.status(400).send({
        success: false,
        message: "whatsapp account Id is invalid",
      });
    }

    await whatsAppUserService.removeWhatsappAccount(whatsappDocId);
    res.send({
      success: true,
      message: "Whatsapp account unlinked successfully",
    });
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

const deleteUserAccount = async (req, res) => {
  const { userId } = req.params;

  try {
    let loginUser = await whatsAppUserService.findUserByUserId(req?.user?._id);

    if (!loginUser?.can_delete_user) {
      return res.status(409).send({
        success: false,
        message: "You are not authorized to perform this action!!!",
      });
    }

    let user = await whatsAppUserService.findUserByUserId(userId);

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "user Id is invalid",
      });
    }

    if (user?.role === WHATSAPP_USER_ROLE_OBJ.owner) {
      return res.status(409).send({
        success: false,
        message: "User having role owner cannot be deleted",
      });
    }

    await whatsAppUserService.deleteUserByUserId(userId);
    await whatsAppUserService.removeUserIdFromWhatsappAccount(userId);

    res.send({
      success: true,
      message: "Whatsapp user deleted successfully",
    });
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

const assignWhatsappAccountToUser = async (req, res) => {
  const { userId, type } = req.body;
  const { whatsappDocId } = req.params;

  try {
    let loginUser = await whatsAppUserService.findUserByUserId(req?.user?._id);

    if (!loginUser?.can_assign_whatsapp_account) {
      return res.status(409).send({
        success: false,
        message: "You are not authorized to perform this action!!!",
      });
    }

    if (!userId) {
      return res
        .status(400)
        .send({ success: false, message: "User Id is required" });
    }

    let user = await whatsAppUserService.findUserByUserId(userId);

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "user Id is invalid",
      });
    }

    let account = await whatsAppUserService.getWhatsappAccountById(
      whatsappDocId
    );

    if (!account) {
      return res.status(400).send({
        success: false,
        message: "whatsapp account Id is invalid",
      });
    }

    await whatsAppUserService.assignWhatsappAccountToUser(
      userId,
      whatsappDocId,
      type
    );

    res.send({
      success: true,
      message: `Whatsapp account ${
        type === "remove" ? "unassigned" : "assigned"
      } successfully.`,
    });
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
  getAllUserWhatsappAccounts,
  deleteWhatsappAccount,
  deleteUserAccount,
  assignWhatsappAccountToUser,
};
