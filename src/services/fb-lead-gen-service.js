const axios = require("axios");
const { FbLeadGen } = require("../models/fb-lead-gen-modal");
const { GRAPH_BASE_URL, CRM_BACKEND } = require("../config");

const getLeadGenDataByLeadgenId = async ({ leadgen_id, access_token }) => {
  // collect lead gen info

  const url = `${GRAPH_BASE_URL}/${leadgen_id}`;

  const response = await axios.get(url, {
    params: {
      access_token,
      fields: "id,created_time,field_data",
    },
  });

  return response.data;
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

        const fields = Object.fromEntries(
          (leadData?.field_data ?? []).map((field) => [
            field.name,
            field.values?.[0] ?? null,
          ]),
        );

        const rawLead = {
          phone_number: fields.phone || fields.phone_number || null,
          comment: null,
          followup_date: null,
          lead_priority: "Normal",
          lead_status: "New",
          source: "Facebook Lead Ads",
          task_priority: null,
          task: null,
          customer_name: fields.full_name || fields.name || null,
          customer_address: fields.street_address || fields.address || null,
          project: null,
          updatedby_user: { username: "sabahat" },
          assigned_user: { username: "sabahat" },
          createdby_user: { username: "sabahat" },
          customer_visited: "No",
        };

        console.log("Converted raw lead:", rawLead);

        const crmEndpoint = `${CRM_BACKEND}/api-lead/lead/`;
        try {
          const response = await axios.post(crmEndpoint, rawLead, {
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "ApiKey sabahat:29b5ca94f4b0f32703beff7436b4d97a700b3e11",
            },
          });

          console.log("CRM response:", response.data);
        } catch (error) {
          console.log(error?.response, "====");
          console.error(
            "Error sending lead to CRM:",
            error.response?.data || error.message,
          );
        }
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
