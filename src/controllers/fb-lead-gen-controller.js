const fbLeadGenService = require("../services/fb-lead-gen-service");
const pageService = require("../services/app-pages-service");

exports.verifyWebhook = async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const page_id = req.params.pageId;

  console.log(req.query, "=====");

  const page = await fbLeadGenService.getPageByPageId({ page_id: page_id });

  if (!page) {
    console.log(`No page data found for page_id: ${page_id}`);
    return res.sendStatus(404);
  }

  if (mode === "subscribe" && token === page?.verify_token) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

exports.receiveWebhook = (req, res) => {
  const body = req.body;
  const io = req.app.get("io"); // Access socket instance

  console.log("FACEBOOK WEBHOOK POST RECEIVED");
  console.log(JSON.stringify(req.body));

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      console.log({ entry });
      fbLeadGenService.handleEntry(entry, io);
    });
    return res.status(200).send("EVENT_RECEIVED");
  }
  return res.sendStatus(404);
};

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
    console.log(
      "error",
      error?.response?.data?.error?.message || error?.message,
    );
    res.status(400).json({
      message:
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong",
    });
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

exports.deleteFbLeadGenPageByPageId = async (req, res) => {
  const { pageId } = req.params; //page_id of the page to delete

  try {
    let page = await fbLeadGenService.getPageByPageId({ page_id: pageId });

    if (!page) {
      return res
        .status(400)
        .send({ success: false, message: "Page Id is invalid" });
    }

    await fbLeadGenService.deleteFbLeadGenByPageId({ page_id: pageId });

    res.send({
      success: true,
      message: "Page data deleted successfully.",
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
