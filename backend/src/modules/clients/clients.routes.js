const express = require("express");
const router = express.Router();
const clientsController = require("./clients.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

// All client routes require auth
router.use(authMiddleware);

router.get("/", clientsController.getClients);
router.post("/", clientsController.createClient);
router.get("/:id", clientsController.getClientById);
router.patch("/:id", clientsController.updateClient);

module.exports = router;
