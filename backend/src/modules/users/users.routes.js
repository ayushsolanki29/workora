const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.get("/profile", authMiddleware, usersController.getProfile);
router.patch("/profile", authMiddleware, usersController.updateProfile);

module.exports = router;
