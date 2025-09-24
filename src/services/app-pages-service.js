const { AppFbPages } = require("../models/app-pages-modal");
const { AppUser } = require("../models/app-user-modal");

const createNewPage = async ({ page_name, page_id, access_token }) => {
  let page = new AppFbPages({
    page_id,
    page_name,
    access_token,
  });

  page = await page.save();

  return page;
};

const getPageByPageId = async ({ page_id }) => {
  return await AppFbPages.findOne({ page_id });
};

const getAllSavedPagesByUserId = async (userId) => {
  return await AppUser.findById(userId).populate("pages").select("pages");
};

module.exports = {
  createNewPage,
  getAllSavedPagesByUserId,
  getPageByPageId,
};
