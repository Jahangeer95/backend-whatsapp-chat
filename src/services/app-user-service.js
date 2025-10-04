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
  return await AppUser.find()
    .populate("pages")
    .select("username email role pages")
    .sort("role");
};

const addPageDocIdInUser = async (userId, PageDocId, session = null) => {
  if (session) {
    return await AppUser.findByIdAndUpdate(
      userId,
      {
        $addToSet: { pages: PageDocId },
      },
      { session }
    );
  }
  // alternative of push but will save unique elements
  return await AppUser.findByIdAndUpdate(userId, {
    $addToSet: { pages: PageDocId },
  });
};

const updateUserRoleByUserId = async (userId, role) => {
  return await AppUser.findByIdAndUpdate(
    userId,
    {
      $set: {
        role: role,
      },
    },
    { new: true, upsert: true }
  );
};

const deleteUserById = async (userId) => {
  return await AppUser.findByIdAndDelete(userId);
};

const removePage_idFromUser = async (_id) => {
  return await AppUser.updateMany(
    {
      pages: _id,
    },
    {
      $pull: {
        pages: _id,
      },
    }
  );
};

module.exports = {
  findUserByEmail,
  createNewUser,
  passwordComparison,
  findUserByRole,
  getAllUsers,
  addPageDocIdInUser,
  updateUserRoleByUserId,
  deleteUserById,
  removePage_idFromUser,
};
