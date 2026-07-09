const express = require("express");
const router = express.Router();
const dashboardController = require("./dashboard.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/stats", dashboardController.getStats);
router.get("/charts", dashboardController.getCharts);
router.get("/data", dashboardController.getDashboardData);

module.exports = router;
