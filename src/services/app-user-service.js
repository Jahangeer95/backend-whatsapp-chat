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

const getAllUsers = async () => {
  return await AppUser.find().select("username email role").sort("role");
};

const addPageDocIdInUser = async (userId, PageDocId, session = null) => {
  if (session) {
    return await AppUser.findByIdAndUpdate(
      userId,
      {
        $push: { pages: PageDocId },
      },
      { session }
    );
  }

  return await AppUser.findByIdAndUpdate(userId, {
    $push: { pages: PageDocId },
  });
};

module.exports = {
  findUserByEmail,
  createNewUser,
  passwordComparison,
  findUserByRole,
  getAllUsers,
  addPageDocIdInUser,
};
