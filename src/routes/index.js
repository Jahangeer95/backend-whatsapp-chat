const { Router } = require("express");
const fbRouter = require("./facebook-routes");

const router = Router();

router.use("/fb", fbRouter);

module.exports = router;
