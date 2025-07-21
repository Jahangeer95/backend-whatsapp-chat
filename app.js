const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const express = require("express");
const compression = require("compression");
const logger = require("./src/utils/logger");
const routes = require("./src/routes/index");
const errorMiddleware = require("./src/middlewares/error-middleware");

dotenv.config();

const PORT = process.env.PORT || 4048;
const app = express();

const corsOptions = {
  exposedHeaders: [],
  allowedHeaders: [],
  optionsSuccessStatus: 200,
  credentials: true,
  origin: "*",
};

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(cors(corsOptions));

app.use(compression());
app.use(helmet());

app.use(errorMiddleware);
app.use("/", routes);

app.listen(PORT, () => {
  logger.info(`[server]: Server is running on port:${PORT}`);
});
