const { VERIFY_TOKEN } = require("../../config");
const facebookService = require("../services/facebook-service");

exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

exports.receiveWebhook = (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      facebookService.handleEntry(entry);
    });
    return res.status(200).send("EVENT_RECEIVED");
  }
  return res.sendStatus(404);
};
