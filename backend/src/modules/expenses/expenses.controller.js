const prisma = require("../../database/prisma");

const getExpenses = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const expenses = await prisma.expense.findMany({
      where: { organizationId },
      include: { client: true, project: true, invoice: true },
      orderBy: { date: "desc" },
    });

    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createExpense = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { description, amount, date, category, clientId, projectId, invoiceId, currency, exchangeRate } = req.body;

    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || expenseAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid expense amount" });
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: expenseAmount,
        date: date ? new Date(date) : new Date(),
        category: category || "Other",
        organizationId,
        clientId: clientId || null,
        projectId: projectId || null,
        invoiceId: invoiceId || null,
        currency: currency || null,
        exchangeRate: exchangeRate || null,
      },
      include: { client: true, project: true, invoice: true },
    });

    return res.status(201).json({ success: true, expense });
  } catch (error) {
    console.error("Record expense error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;
    const { description, amount, date, category, clientId, projectId, invoiceId, currency, exchangeRate } = req.body;

    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || expenseAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid expense amount" });
    }

    const expense = await prisma.expense.update({
      where: { id, organizationId },
      data: {
        description,
        amount: expenseAmount,
        date: date ? new Date(date) : new Date(),
        category: category || "Other",
        clientId: clientId || null,
        projectId: projectId || null,
        invoiceId: invoiceId || null,
        currency: currency || null,
        exchangeRate: exchangeRate || null,
      },
    });

    return res.status(200).json({ success: true, expense });
  } catch (error) {
    console.error("Update expense error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;
    await prisma.expense.delete({
      where: { id, organizationId },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete expense error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
