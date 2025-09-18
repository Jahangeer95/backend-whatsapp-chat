const { Router } = require("express");
const fbRouter = require("./facebook-routes");
const whatsappRouter = require("./whatsapp-routes");
const instagramRouter = require("./instagram-routes");
const userRouter = require("./app-user-routes");

const router = Router();

router.get("/", (req, res) => res.send("Chat App"));

router.use("/user", userRouter);

router.use("/fb", fbRouter);

router.use("/whatsapp", whatsappRouter);

router.use("/instagram", instagramRouter);

module.exports = router;
