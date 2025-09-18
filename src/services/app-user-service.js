const { compare } = require("bcrypt");
const { AppUser } = require("../models/app-user-modal");

const findUserByEmail = async (email) => {
  const user = await AppUser.findOne({
    email: email,
  });

  return user;
};

const findUserByRole = async (role) => {
  const user = await AppUser.findOne({
    role: role,
  });

  return user;
};

const createNewUser = async ({ username, email, password, role }) => {
  let user = new AppUser({
    username,
    email,
    password,
    role,
  });

  user = await user.save();

  return user;
};

const passwordComparison = async ({ savedPassword, password }) => {
  return await compare(password, savedPassword);
};

module.exports = {
  findUserByEmail,
  createNewUser,
  passwordComparison,
  findUserByRole,
};
