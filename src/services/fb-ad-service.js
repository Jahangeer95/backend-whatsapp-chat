const axios = require("axios");
const { GRAPH_BASE_URL } = require("../config");
const { dateConversionISOFormat } = require("../utils/helper");

const createAddCompaign = async (data, token, adAccountId) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/campaigns`;

  const { name, objective, ad_category, status } = data || {};

  const payload = {
    name,
    objective,
    status: status,
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
    fields: "id,name,status,daily_budget,start_time,end_time",
  };

  return await axios.get(url, { params });
};

module.exports = {
  createAddCompaign,
  getAllCampaign,
  createAdSet,
  updateAdCampaignbyCampaignId,
  deleteCampaignByCampaignId,
  getAdsetsByUsingCampaignId,
};
