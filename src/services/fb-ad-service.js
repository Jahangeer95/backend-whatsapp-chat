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

const getAllCampaign = async (token, adAccountId) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/campaigns`;

  const payload = {
    fields: "name,status,objective,created_time,daily_budget,insights",
    access_token: token,
  };

  return await axios.get(url, {
    params: {
      ...payload,
    },
  });
};

module.exports = {
  createAddCompaign,
  getAllCampaign,
};
