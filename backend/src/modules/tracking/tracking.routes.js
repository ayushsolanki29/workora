const express = require("express");
const router = express.Router();
const trackingController = require("./tracking.controller");

router.post("/v", trackingController.trackVisit);

module.exports = router;
