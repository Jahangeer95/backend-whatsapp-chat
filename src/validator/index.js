const { Types } = require("mongoose");

const validateObjectId = (id) => {
  return Types.ObjectId.isValid(id);
};

function validateUserId(req, res, next) {
  if (!validateObjectId(req.params.userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }
  next();
}

function validatePageId(req, res, next) {
  if (!validateObjectId(req.params.pageId)) {
    return res.status(400).json({ error: "Invalid page ID format" });
  }
  next();
}

module.exports = { validateUserId, validatePageId };
