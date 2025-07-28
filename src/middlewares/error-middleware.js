const logger = require("../utils/logger");

function errorMiddleware(error, req, res, next) {
  logger.error(error.message);
  res.status(error.statusCode || 500).send({ message: error.message });
  // next();
}

module.exports = errorMiddleware;
