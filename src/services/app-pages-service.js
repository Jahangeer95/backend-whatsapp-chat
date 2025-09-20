const { AppPages } = require("../models/app-pages-modal");

const createNewPage = async (data, session) => {
  let page = new AppPages({
    ...data,
  });

  page = await page.save({ session });

  return page;
};

const getAllSavedPages = async () => {
  return await AppPages.find().sort("page_name");
};
module.exports = {
  createNewPage,
  getAllSavedPages,
};
