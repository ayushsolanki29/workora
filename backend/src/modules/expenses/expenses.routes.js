const express = require("express");
const router = express.Router();
const expensesController = require("./expenses.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.use(authMiddleware);

router.get("/", expensesController.getExpenses);
router.post("/", expensesController.createExpense);
router.patch("/:id", expensesController.updateExpense);
router.delete("/:id", expensesController.deleteExpense);

module.exports = router;
