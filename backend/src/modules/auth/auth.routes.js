const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.post("/check-email", authController.checkEmail);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
