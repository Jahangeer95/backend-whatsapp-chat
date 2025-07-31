const { VERIFY_TOKEN } = require("../config");
const whatsappService = require("../services/whatsapp-service");

const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

const receiveWebHook = (req, res) => {
  const body = req.body;
  const io = req.app.get("io"); // Access socket instance

  if (body.object === "whatsapp_business_account") {
    body.entry.forEach((entry) => {
      whatsappService.handleEntry(entry, io);
    });
    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.sendStatus(404);
};

module.exports = {
  verifyWebhook,
};
