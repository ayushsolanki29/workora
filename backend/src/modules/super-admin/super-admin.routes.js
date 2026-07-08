const express = require("express");
const router = express.Router();
const superAdminController = require("./super-admin.controller");

// In a real application, you would have a specific authMiddleware for super-admins here
// For this migration, we are keeping it as is from the original implementation
// which just checked session and some basic things.

router.get("/dashboard/charts", superAdminController.getCharts);
router.post("/users", superAdminController.createUser);
router.get("/organizations", superAdminController.getOrganizations);

module.exports = router;
