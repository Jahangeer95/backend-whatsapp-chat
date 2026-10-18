const fbLeadGenService = require("../services/fb-lead-gen-service");
const pageService = require("../services/app-pages-service");

exports.createFbLeadGen = async (req, res) => {
  const { page_id, access_token, verify_token, company_id, user_id } = req.body;

  try {
    const { isValid, name } = await pageService.isValidFbPageId({
      page_id,
      access_token,
    });
    if (!isValid) {
      return res
        .status(400)
        .send({ success: false, message: "Facebook page id is invalid" });
    }

    let isPageExist = await fbLeadGenService.getPageByPageId({ page_id });

    if (isPageExist) {
      return res
        .status(400)
        .send({ success: false, message: "Page is already saved" });
    }

    const page = await fbLeadGenService.createFbLeadGen({
      page_name: name,
      page_id,
      verify_token,
      access_token,
      company_id,
      user_id,
    });

    if (!page) {
      return res.status(400).send({
        success: false,
        message: "Failed to create page for lead generation",
      });
    }
    res.send({
      success: true,
      message: "Page created successfully For Lead Generation",
    });
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateFbLeadGenPage = async (req, res) => {
  const { pageId } = req.params; //page_id of the page to update

  try {
    let page = await fbLeadGenService.getPageByPageId({ page_id: pageId });

    if (!page) {
      return res
        .status(400)
        .send({ success: false, message: "Page Id is invalid" });
    }

    const { isValid, name } = await pageService.isValidFbPageId({
      page_id: req.body.page_id,
      access_token: req.body?.access_token,
    });

    if (!isValid) {
      return res
        .status(400)
        .send({ success: false, message: "Facebook page id is invalid" });
    }

    const response = await fbLeadGenService.updateFbLeadGenByPage_id(
      page?._id,
      {
        ...req.body,
        page_name: name,
      },
    );

    res.send({
      success: true,
      message: "Page data updated successfully.",
    });
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

exports.getAllSavedLeadGenPagesByCompanyId = async (req, res) => {
  const { company_id } = req.params;

  try {
    const pages = await fbLeadGenService.getFbLeadGenByCompanyId({
      company_id,
    });

    res.send({ success: true, data: pages });
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
