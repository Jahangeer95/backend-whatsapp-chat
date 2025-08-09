const dotenv = require("dotenv");

dotenv.config();

const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PORT = process.env.PORT || 4048;
const GRAPH_BASE_URL = process.env.GRAPH_BASE_URL;
const FB_PAGE_ID = process.env.FB_PAGE_ID;

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NO_ID = process.env.PHONE_NO_ID;
const WHATSAPP_BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ID;

const DATABASE_URI = process.env.DATABASE_URI;

module.exports = {
  VERIFY_TOKEN,
  FB_ACCESS_TOKEN,
  PORT,
  GRAPH_BASE_URL,
  FB_PAGE_ID,
  WHATSAPP_ACCESS_TOKEN,
  PHONE_NO_ID,
  DATABASE_URI,
  WHATSAPP_BUSINESS_ID,
};
