const dotenv = require("dotenv");

dotenv.config();

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 4048;
const GRAPH_BASE_URL = process.env.GRAPH_BASE_URL;
const FB_PAGE_ID = process.env.FB_PAGE_ID;

module.exports = {
  VERIFY_TOKEN,
  FB_ACCESS_TOKEN,
  PORT,
  GRAPH_BASE_URL,
  FB_PAGE_ID,
};
