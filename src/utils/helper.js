function detectMessageType(item) {
  if (item.message) return "text";
  if (item.attachments) return "attachment";
  if (item.sticker) return "sticker";
  if (item.quick_reply) return "quick_reply";
  return "unknown";
}

module.exports = { detectMessageType };
