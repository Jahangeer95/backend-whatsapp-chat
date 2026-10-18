const axios = require("axios");
const { FbLeadGen } = require("../models/fb-lead-gen-modal");

const getLeadGenDataByLeadgenId = async ({ leadgen_id, access_token }) => {
  // collect lead gen info

  const url = `${GRAPH_BASE_URL}/${leadgen_id}`;

  const response = await axios.get(url, {
    params: {
      access_token,
      fields: "id,created_time,field_data",
    },
  });

  return respose.data;
};

exports.handleEntry = async (entry, io) => {
  console.log("WEBHOOK ENTRY:", JSON.stringify(entry));
  const page_id = entry.id;
  console.log({ page_id }, "====page_id====");
  const page = await FbLeadGen.findOne({ page_id });

  if (!page) {
    console.log(`No page data found for page_id: ${page_id}`);
    return;
  }

  if (entry.changes && entry.changes.length > 0) {
    entry.changes.forEach(async (change) => {
      if (change.field === "leadgen") {
        const leadgenData = change.value;
        console.log("Received leadgen data:", leadgenData);
        // Handle the leadgen data as needed
        // Emit the leadgen data to the client via socket.io
        // Getting userdata by using leadgen_id

        const leadData = await getLeadGenDataByLeadgenId({
          leadgen_id: leadgenData?.leadgen_id,
          access_token: page?.access_token,
        });

        console.log("Lead gen data", leadData);
      }
    });
  }
};
exports.createFbLeadGen = async ({
  page_name,
  page_id,
  access_token,
  company_id,
  verify_token,
  user_id,
}) => {
  let page = new FbLeadGen({
    page_name,
    page_id,
    access_token,
    verify_token,
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
  return await FbLeadGen.find({ company_id });
};

exports.getPageByPageId = async ({ page_id }) => {
  return await FbLeadGen.findOne({ page_id });
};

exports.deleteFbLeadGenByPageId = async ({ page_id }) => {
  return await FbLeadGen.findOneAndDelete({ page_id });
};
