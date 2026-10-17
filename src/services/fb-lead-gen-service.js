const { FbLeadGen } = require("../models/fb-lead-gen-modal");

exports.createFbLeadGen = async ({
  page_name,
  page_id,
  access_token,
  company_id,
  user_id,
}) => {
  let page = new FbLeadGen({
    page_id,
    access_token,
    company_id,
    user_id,
  });

  page = await page.save();
  return page;
};

exports.updateFbLeadGenByPage_id = async (_id, updatedData) => {
  return await FbLeadGen.findByIdAndUpdate(
    _id,
    {
      ...updatedData,
    },
    { upsert: true, new: true },
  );
};

exports.getFbLeadGenByCompanyId = async ({ company_id }) => {
  return await FbLeadGen.findOne({ company_id });
};

exports.getPageByPageId = async ({ page_id }) => {
  return await FbLeadGen.findOne({ page_id });
};
