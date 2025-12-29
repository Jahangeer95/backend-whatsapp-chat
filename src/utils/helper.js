const mime = require("mime-types");

function detectMessageType(item) {
  if (item.message) return "text";
  if (item.attachments) return "attachment";
  if (item.sticker) return "sticker";
  if (item.quick_reply) return "quick_reply";
  return "unknown";
}

function getInstagramMediaType(filename) {
  const mimeType = mime.lookup(filename);
  if (!mimeType) {
    throw new Error("Unknown file type");
  }

  if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType.startsWith("video/")) {
    // Check for supported video types
    return "video";
  } else if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  throw new Error(`Unsupported media type: ${mimeType}`);
}

function dateConversionISOFormat(date) {
  const dateValue = new Date(date);
  return dateValue?.toISOString();
}

function getWhatsAppHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

module.exports = {
  detectMessageType,
  getInstagramMediaType,
  dateConversionISOFormat,
  getWhatsAppHeaders,
};
