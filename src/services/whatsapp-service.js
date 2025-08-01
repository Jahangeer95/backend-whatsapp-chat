const axios = require("axios");
const { GRAPH_BASE_URL, PHONE_NO_ID } = require("../config");

const handleEntry = async (entry, io) => {
  console.log(entry);
};

const sendTextMessage = async (to, message) => {
  const url = `${GRAPH_BASE_URL}/${PHONE_NO_ID}/messages`;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: {
      body: message,
    },
  };

  return axios.post(url, payload, {
    headers,
  });
};

module.exports = {
  handleEntry,
  sendTextMessage,
};
