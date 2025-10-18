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

const updateAdCampaignbyCampaignId = async (
  data,
  campaign_id,
  token,
  adAccountId
) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/campaigns/${campaign_id}`;

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

const getAllCampaign = async (token, adAccountId, after) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/campaigns`;

  const payload = {
    fields: "name,status,objective,created_time,daily_budget,insights",
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

  return await axios.get(url, null, {
    params: payload,
  });
};

module.exports = {
  createAddCompaign,
  getAllCampaign,
  createAdSet,
  updateAdCampaignbyCampaignId,
};
