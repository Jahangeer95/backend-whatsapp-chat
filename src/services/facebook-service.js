const handleEntry = (entry) => {
  const webhookEvent = entry.messaging ? entry.messaging[0] : entry;
  console.log("Webhook event received:", webhookEvent);

  if (webhookEvent.message) {
    console.log("User sent message:", webhookEvent.message.text);
    // Add message handling logic here
  }
};

module.exports = { handleEntry };
