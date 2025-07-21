const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  format: format.printf((log) => log.message),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: "logs/connnectionFile.log" }),
  ],

  exceptionHandlers: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: "logs/exceptions.log" }),
  ],

  rejectionHandlers: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: "logs/exceptions.log" }),
  ],
});

logger.exitOnError = false;

module.exports = logger;
