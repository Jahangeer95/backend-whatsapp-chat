const axios = require("axios");
const { GRAPH_BASE_URL } = require("../config");

const createAddCompaign = async (data, token, adAccountId) => {
  const url = `${GRAPH_BASE_URL}/${adAccountId}/campaigns`;

  const { name, objective, ad_category } = data || {};

  const payload = {
    name,
    objective,
    status: "PAUSED",
    special_ad_categories: [ad_category],
    access_token: token,
  };

  return await axios.post(url, null, { params: payload });
};

module.exports = {
  createAddCompaign,
};
