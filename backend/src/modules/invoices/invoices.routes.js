const express = require("express");
const router = express.Router();
const invoicesController = require("./invoices.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", invoicesController.getInvoices);
router.post("/", invoicesController.createInvoice);
router.get("/:id", invoicesController.getInvoiceById);
router.patch("/:id", invoicesController.updateInvoice);
router.delete("/:id", invoicesController.deleteInvoice);

module.exports = router;
