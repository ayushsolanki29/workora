const express = require("express");
const router = express.Router();
const organizationController = require("./organization.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.get("/", authMiddleware, organizationController.getOrganization);
router.patch("/", authMiddleware, organizationController.updateOrganization);
router.post("/setup", authMiddleware, organizationController.setupOrganization);

module.exports = router;
