const axios = require("axios");
const { GRAPH_BASE_URL } = require("../config");

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
    fields: "name,status,objective,created_time,daily_budget,insights",
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

  const { countries, ...remaining_data } = data || {};

  const payload = {
    ...remaining_data,
    targetting: { geo_locations: { countries: countries } },
    access_token: token,
  };
  // test

  return await axios.post(url, null, {
    params: payload,
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
