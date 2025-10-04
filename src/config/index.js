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
const BACKEND_URL = process.env.BACKEND_URL;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const USER_ROLE_OBJ = {
  admin: "ADMIN",
  manager: "MANAGER",
  editor: "EDITOR",
  moderator: "MODERATOR",
};

const CAN_CREATE_USER = [USER_ROLE_OBJ.admin];
const CAN_UPDATE_USER_ROLE = [USER_ROLE_OBJ.admin, USER_ROLE_OBJ.manager];
const CAN_CREATE_PAGE = [USER_ROLE_OBJ.admin];
const CAN_DELETE_PAGE = [USER_ROLE_OBJ.admin];

const CAN_CREATE_POST = [
  USER_ROLE_OBJ.admin,
  USER_ROLE_OBJ.manager,
  USER_ROLE_OBJ.editor,
];

const CAN_DELETE_POST = [USER_ROLE_OBJ.admin, USER_ROLE_OBJ.manager];

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
  BACKEND_URL,
  JWT_SECRET_KEY,
  USER_ROLE_OBJ,
  CAN_CREATE_POST,
  CAN_DELETE_POST,
  CAN_UPDATE_USER_ROLE,
};
