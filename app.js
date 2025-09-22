const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const logger = require("./src/utils/logger");
const routes = require("./src/routes/index");
const errorMiddleware = require("./src/middlewares/error-middleware");
const { PORT, DATABASE_URI } = require("./src/config");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app); // Instead of app.listen()

const io = new Server(server, {
  cors: {
    origin: "*", // or your frontend domain
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("message_from_client", (data) => {
    console.log("Client sent:", data);
    // broadcast to other clients or handle
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Make io accessible globally or via some module
app.set("io", io); // OR export io

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  exposedHeaders: ["user_auth_token"],
  // exposedHeaders: [],
  // allowedHeaders: [],
  optionsSuccessStatus: 200,
};

mongoose
  .connect(DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(() => {
    logger.info("MongoDB connected");
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err || err.message);
  });

app.use(cors(corsOptions));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(compression());
app.use(helmet());

// app.use((req, res, next) => {
//   // if (req.originalUrl.includes("/webhook")) {
//   console.log("Webhook request received:", req);
//   // }
//   next();
// });
// Serve the uploads folder as static files
app.use(
  "/insta-uploads",
  express.static(path.join(process.cwd(), "insta-uploads"))
);

app.use("/", routes);
app.use(errorMiddleware);

server.listen(PORT, () => {
  logger.info(`[server]: Server is running on port:${PORT}`);
});
