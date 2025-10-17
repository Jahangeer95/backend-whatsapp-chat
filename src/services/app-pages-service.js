const { AppFbPages } = require("../models/app-pages-modal");
const { AppUser } = require("../models/app-user-modal");
const axios = require("axios");

const createNewPage = async ({
  page_name,
  page_id,
  access_token,
  ad_token_id,
}) => {
  const adTokenId = ad_token_id ? { ad_token_id } : {};
  let page = new AppFbPages({
    page_id,
    page_name,
    access_token,
    ...adTokenId,
  });

  page = await page.save();

  return page;
};

const getPageByPageId = async ({ page_id }) => {
  return await AppFbPages.findOne({ page_id });
};

const getPageByPage_Id = async (_id) => {
  return await AppFbPages.findOne({ _id });
};

const getAllSavedPagesByUserId = async (userId) => {
  return await AppUser.findById(userId).populate("pages").select("pages");
};

const isValidFbPageId = async ({ page_id, access_token }) => {
  const response = await axios.get(
    `https://graph.facebook.com/${page_id}?access_token=${access_token}`
  );

  return {
    isValid: response?.data?.id === page_id,
    name: response?.data?.name,
  };
};

const removePagebyPage_id = async (_id) => {
  return await AppFbPages.findByIdAndDelete(_id);
};

module.exports = {
  createNewPage,
  getAllSavedPagesByUserId,
  getPageByPageId,
  isValidFbPageId,
  getPageByPage_Id,
  removePagebyPage_id,
};
