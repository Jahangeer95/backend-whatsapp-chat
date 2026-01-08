const { compare } = require("bcrypt");
const {
  WhatsappAppRegisteredUser,
} = require("../models/whatsapp-app-registered-user");

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

module.exports = {
  findUserByRole,
  createNewWhatsappUser,
  findUserByEmail,
  findUserByUsername,
  comparePassword,
};
