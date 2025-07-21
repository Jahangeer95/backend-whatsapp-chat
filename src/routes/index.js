const { Router } = require("express");
const fbRouter = require("./facebook-routes");

const router = Router();

router.get("/", (req, res) => res.send("Chat App"));

router.use("/fb", fbRouter);

module.exports = router;
