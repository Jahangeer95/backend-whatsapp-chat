const { compare } = require("bcrypt");
const axios = require("axios");
const {
  WhatsappAppRegisteredUser,
} = require("../models/whatsapp-app-registered-user");
const { WhatsappAccount } = require("../models/whatsapp-account-modal");

const findUserByRole = async (role) => {
  const user = await WhatsappAppRegisteredUser.findOne({
    role: role,
  });

  return user;
};

const createNewWhatsappUser = async ({ name, email, password, role }) => {
  let user = new WhatsappAppRegisteredUser({
    name,
    email,
    password,
    role,
  });

  user = await user.save();

  return user;
};

const findUserByEmail = async (email) => {
  const user = await WhatsappAppRegisteredUser.findOne({
    email,
  });

  return user;
};

const findUserByUsername = async (name) => {
  const user = await WhatsappAppRegisteredUser.findOne({
    name,
  });

  return user;
};

const comparePassword = async ({ savedPassword, password }) => {
  return await compare(password, savedPassword);
};

const fetchAllUsers = async () => {
  return await WhatsappAppRegisteredUser.find().sort("role");
};

const createNewWhatsappAccount = async ({
  whatsapp_access_token,
  phone_no_id,
  whatsapp_business_id,
  user_id,
}) => {
  let whatsapp = new WhatsappAccount({
    whatsapp_access_token,
    phone_no_id,
    whatsapp_business_id,
    users: [user_id],
  });

  whatsapp = await whatsapp.save();
  whatsapp = whatsapp.toObject();

  delete whatsapp.users;
  return whatsapp;
};

const isValidWhatsappBusinessId = async ({
  whatsapp_business_id,
  whatsapp_access_token,
}) => {
  const response = await axios.get(
    `https://graph.facebook.com/${whatsapp_business_id}`,
    {
      params: {
        access_token: whatsapp_access_token,
      },
    }
  );

  return {
    isValid: !!response?.data?.id,
    name: response?.data?.name,
  };
};

const updateWhatsappAccountbyId = async (_id, updatedData) => {
  return await WhatsappAccount.findByIdAndUpdate(
    _id,
    {
      ...updatedData,
    },
    {
      upsert: false,
      new: true,
    }
  );
};

const getWhatsappAccountById = async (_id) => {
  return await WhatsappAccount.findOne({ _id });
};

//

module.exports = {
  findUserByRole,
  createNewWhatsappUser,
  findUserByEmail,
  findUserByUsername,
  comparePassword,
  fetchAllUsers,
  createNewWhatsappAccount,
  isValidWhatsappBusinessId,
  updateWhatsappAccountbyId,
  getWhatsappAccountById,
};
