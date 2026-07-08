const express = require("express");
const router = express.Router();
const quickItemsController = require("./quick-items.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", quickItemsController.getQuickItems);
router.post("/", quickItemsController.createQuickItem);

module.exports = router;
