const mongoose = require("mongoose");
const pageService = require("../services/app-pages-service");
const appUserService = require("../services/app-user-service");
const { AppFbPages } = require("../models/app-pages-modal");

exports.createNewPage = async (req, res) => {
  const { page_name, page_id, access_token } = req.body;
  //   need to check whether user is admin
  const userId = req.user?._id;
  //   const session = await mongoose.startSession();
  //   session.startTransaction();

  try {
    let page;

    AppFbPages.init().then(async () => {
      page = await pageService.createNewPage({
        page_id,
        page_name,
        access_token,
      });
    });

    await appUserService.addPageDocIdInUser(userId, page?._id);

    // await session.commitTransaction();
    // session.endSession();

    res.send({ success: true, message: "Page created successfully" });
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.getAllUserPages = async (req, res) => {
  try {
    const pages = await pageService.getAllSavedPagesByUserId(req.user._id);
    res.send({ success: true, data: pages });
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
