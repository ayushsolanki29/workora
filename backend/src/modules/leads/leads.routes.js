const express = require("express");
const router = express.Router();
const leadsController = require("./leads.controller");

// Leads route is public
router.post("/", leadsController.createLead);

module.exports = router;
