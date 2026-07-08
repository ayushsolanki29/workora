const express = require("express");
const router = express.Router();
const supportTicketsController = require("./support-tickets.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", supportTicketsController.getTickets);
router.post("/", supportTicketsController.createTicket);
router.get("/:id", supportTicketsController.getTicketById);
router.patch("/:id", supportTicketsController.updateTicket);
router.post("/:id/messages", supportTicketsController.addMessage);

module.exports = router;
