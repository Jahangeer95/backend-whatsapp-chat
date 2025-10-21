const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const { GRAPH_BASE_URL } = require("../config");
const { dateConversionISOFormat } = require("../utils/helper");

const createAddCompaign = async (data, token, adAccountId) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/campaigns`;

  const { name, objective, ad_category, status, buying_type } = data || {};

  const payload = {
    name,
    objective,
    status,
    buying_type,
    special_ad_categories: [ad_category],
    access_token: token,
  };

  return await axios.post(url, null, { params: payload });
};

const updateAdCampaignbyCampaignId = async (data, campaign_id, token) => {
  const url = `${GRAPH_BASE_URL}/${campaign_id}`;

  const { ad_category, ...remainingData } = data || {};

  const specialAdCategory = ad_category
    ? {
        special_ad_categories: [ad_category],
      }
    : {};

  const payload = {
    ...remainingData,
    ...specialAdCategory,
    access_token: token,
  };

  return await axios.post(url, null, { params: payload });
};

const deleteCampaignByCampaignId = async (campaign_id, token) => {
  const url = `${GRAPH_BASE_URL}/${campaign_id}`;

  const params = {
    access_token: token,
  };

  return await axios.delete(url, { params });
};

const getAllCampaign = async (token, adAccountId, after) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/campaigns`;

  const payload = {
    fields:
      "id,name,status,objective,effective_status,created_time,start_time,stop_time,daily_budget,lifetime_budget,spend_cap,buying_type,special_ad_categories,updated_time,insights",
    limit: 3,
    access_token: token,
  };

  if (after) {
    payload.after = after;
  }

  return await axios.get(url, {
    params: {
      ...payload,
    },
  });
};

const createAdSet = async (data, token, adAccountId) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/adsets`;
  // test
  const params = new URLSearchParams();

  params.append("name", data.name);
  params.append("campaign_id", data.campaign_id);
  params.append("daily_budget", data.daily_budget);
  params.append("status", data.status);
  params.append("bid_strategy", data.bid_strategy);
  params.append("optimization_goal", data.optimization_goal);
  params.append("billing_event", data.billing_event);
  params.append("access_token", token);

  // Serialize targeting as a JSON string
  params.append("targeting", JSON.stringify(data.targeting));

  // Optional: start_time and end_time if needed
  if (data.start_time) {
    params.append("start_time", dateConversionISOFormat(data.start_time)); // ISO 8601 format
  }
  if (data.end_time) {
    params.append("end_time", dateConversionISOFormat(data.end_time)); // ISO 8601 format
  } // test

  return await axios.post(url, params?.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

const getAdsetsByUsingCampaignId = async (campaign_id, token) => {
  const url = `${GRAPH_BASE_URL}/${campaign_id}/adsets`;

  const params = {
    access_token: token,
    fields:
      "id,name,status,daily_budget,start_time,end_time,bid_amount,targeting,campaign_id",
  };

  return await axios.get(url, { params });
};

const deleteAdsetByAdsetId = async (adset_id, token) => {
  const url = `${GRAPH_BASE_URL}/${adset_id}`;

  const params = {
    access_token: token,
  };

  return await axios.delete(url, { params });
};

const updateAdsetByAdsetId = async (adset_id, data, token) => {
  const url = `${GRAPH_BASE_URL}/${adset_id}`;

  const params = {
    access_token: token,
    ...data,
  };

  return await axios.post(url, null, { params });
};

const createAdCreative = async (data, adAccountId, token) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/adcreatives`;
  // test
  const {
    name,
    page_id,
    message,
    link,
    headline,
    call_to_action_type,
    image_hash,
  } = data;

  const imageHash = image_hash
    ? {
        image_hash,
      }
    : {};

  return await axios.post(url, {
    name,
    object_story_spec: {
      page_id,
      link_data: {
        message,
        link,
        name: headline,
        ...imageHash,
        call_to_action: {
          type: call_to_action_type,
          value: { link },
        },
      },
    },
    access_token: token,
  });
};

const uploadImage = async (file, adAccountId, token) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/adimages`;

  const form = new FormData();
  form.append("access_token", token);
  form.append("filename", fs.createReadStream(file.path));

  const response = await axios.post(url, form, {
    headers: form.getHeaders(),
  });

  // Clean up uploaded file
  fs.unlinkSync(file.path);

  const images = response.data.images;
  const uploaded = Object.values(images)[0];

  return {
    image_hash: uploaded.hash,
    url: uploaded.url,
  };
};

module.exports = {
  createAddCompaign,
  getAllCampaign,
  createAdSet,
  updateAdCampaignbyCampaignId,
  deleteCampaignByCampaignId,
  getAdsetsByUsingCampaignId,
  deleteAdsetByAdsetId,
  updateAdsetByAdsetId,
  createAdCreative,
  uploadImage,
};
