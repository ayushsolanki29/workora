// src/modules/expenses/expenses.service.js
const prisma = require("../../database/prisma");

class ExpensesService {
  async getExpenses(organizationId, page = "1", limit = "25") {
    if (!organizationId) {
      const error = new Error("Unauthorized: No organization found");
      error.status = 401;
      throw error;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 25));
    const skip = (pageNum - 1) * limitNum;

    const where = { organizationId };

    const totalCount = await prisma.expense.count({ where });

    const expenses = await prisma.expense.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        amount: true,
        currency: true,
        exchangeRate: true,
        date: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
        clientId: true,
        projectId: true,
        invoiceId: true,
        client: {
          select: { id: true, name: true }
        },
        project: {
          select: { id: true, title: true }
        },
        invoice: {
          select: { id: true, invoiceNumber: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const allExpenses = await prisma.expense.findMany({
      where,
      select: { amount: true, exchangeRate: true, category: true, date: true }
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const summary = {
      totalExpenses: 0,
      thisMonthExpenses: 0,
      topCategory: "-"
    };

    const categoryTotals = {};

    allExpenses.forEach(exp => {
      const convertedAmount = Number(exp.amount || 0) * Number(exp.exchangeRate || 1.0);
      summary.totalExpenses += convertedAmount;

      if (exp.date) {
        const expDate = new Date(exp.date);
        if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
          summary.thisMonthExpenses += convertedAmount;
        }
      }

      if (exp.category) {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + convertedAmount;
      }
    });

    if (Object.keys(categoryTotals).length > 0) {
      summary.topCategory = Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b);
    }

    return {
      expenses,
      summary,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    };
  }

  async getUniqueCategories(organizationId) {
    if (!organizationId) {
      return [];
    }
    const categories = await prisma.expense.findMany({
      where: { organizationId },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    return categories.map(c => c.category).filter(Boolean);
  }

  async getExpenseById(organizationId, id) {
    if (!organizationId) {
      const error = new Error("Unauthorized: No organization found");
      error.status = 401;
      throw error;
    }

    const expense = await prisma.expense.findUnique({
      where: { id, organizationId },
      include: { client: true, project: true, invoice: true },
    });

    if (!expense) {
      const error = new Error("Expense not found");
      error.status = 404;
      throw error;
    }

    return expense;
  }

  async createExpense(organizationId, data) {
    if (!organizationId) {
      const error = new Error("Unauthorized: No organization found");
      error.status = 401;
      throw error;
    }

    const { description, amount, date, category, status, clientId, projectId, invoiceId, currency, exchangeRate } = data;

    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || expenseAmount <= 0) {
      const error = new Error("Invalid expense amount");
      error.status = 400;
      throw error;
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
        status: status || "Paid",
      },
      include: { client: true, project: true, invoice: true },
    });

    return expense;
  }

  async updateExpense(organizationId, id, data) {
    if (!organizationId) {
      const error = new Error("Unauthorized: No organization found");
      error.status = 401;
      throw error;
    }

    const { description, amount, date, category, status, clientId, projectId, invoiceId, currency, exchangeRate } = data;

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) {
      const expenseAmount = parseFloat(amount);
      if (!expenseAmount || expenseAmount <= 0) {
        const error = new Error("Invalid expense amount");
        error.status = 400;
        throw error;
      }
      updateData.amount = expenseAmount;
    }
    if (date !== undefined) updateData.date = date ? new Date(date) : new Date();
    if (category !== undefined) updateData.category = category || "Other";
    if (clientId !== undefined) updateData.clientId = clientId || null;
    if (projectId !== undefined) updateData.projectId = projectId || null;
    if (invoiceId !== undefined) updateData.invoiceId = invoiceId || null;
    if (currency !== undefined) updateData.currency = currency || null;
    if (exchangeRate !== undefined) updateData.exchangeRate = exchangeRate || null;
    if (status !== undefined) updateData.status = status;

    const expense = await prisma.expense.update({
      where: { id, organizationId },
      data: updateData,
    });

    return expense;
  }

  async deleteExpense(organizationId, id) {
    if (!organizationId) {
      const error = new Error("Unauthorized: No organization found");
      error.status = 401;
      throw error;
    }

    await prisma.expense.delete({
      where: { id, organizationId },
    });

    return { success: true };
  }
}

module.exports = new ExpensesService();
