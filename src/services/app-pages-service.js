const { AppPages } = require("../models/app-pages-modal");
const { AppUser } = require("../models/app-user-modal");

const createNewPage = async (data) => {
  let page = new AppPages({
    ...data,
  });

  page = await page.save();

  return page;
};

const getAllSavedPagesByUserId = async (userId) => {
  return await AppUser.findById(userId).populate("pages").select("pages");
};

module.exports = {
  createNewPage,
  getAllSavedPagesByUserId,
};
