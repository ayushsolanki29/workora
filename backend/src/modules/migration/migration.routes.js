const express = require("express");
const router = express.Router();
const migrationController = require("./migration.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/import", migrationController.importData);

module.exports = router;
