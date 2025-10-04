const mongoose = require("mongoose");
const pageService = require("../services/app-pages-service");
const appUserService = require("../services/app-user-service");

exports.createNewPage = async (req, res) => {
  const { page_name, page_id, access_token } = req.body;
  //   need to check whether user is admin
  const userId = req.user?._id;
  //   const session = await mongoose.startSession();
  //   session.startTransaction();

  try {
    const isValidPage = await pageService.isValidFbPageId({
      page_id,
      access_token,
    });
    if (!isValidPage) {
      return res
        .status(400)
        .send({ success: false, message: "Facebook page id is invalid" });
    }

    let page = await pageService.getPageByPageId({ page_id });

    if (page) {
      return res
        .status(400)
        .send({ success: false, message: "Page Id must be unique" });
    }
    page = await pageService.createNewPage({
      page_id,
      page_name,
      access_token,
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

exports.addUsertoPage = async (req, res) => {
  const { userId } = req.body;
  const { pageId } = req.params;

  if (!userId) {
    return res
      .status(400)
      .send({ success: false, message: "User Id is required" });
  }

  try {
    let page = await pageService.getPageByPage_Id(pageId);

    if (!page) {
      return res
        .status(400)
        .send({ success: false, message: "Page Id is invalid" });
    }

    await appUserService.addPageDocIdInUser(userId, pageId);

    res.send({ success: true, message: "User add successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};

exports.deleteFbPage = async (req, res) => {
  const { pageId } = req.params;
  try {
    let page = await pageService.getPageByPage_Id(pageId);

    if (!page) {
      return res
        .status(400)
        .send({ success: false, message: "Page Id is invalid" });
    }

    await appUserService.removePage_idFromUser(pageId);

    await pageService.removePagebyPage_id(pageId);

    res.send({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
  }
};
