const prisma = require("../../database/prisma");
const bcrypt = require("bcryptjs");

const getCharts = async (req, res) => {
  try {
    // Return mock data for super admin dashboard charts
    return res.status(200).json({
      success: true,
      revenueOverview: [
        { month: "Jan", revenue: 20000, expenses: 15000 },
        { month: "Feb", revenue: 22000, expenses: 16000 },
        { month: "Mar", revenue: 25000, expenses: 18000 },
        { month: "Apr", revenue: 28000, expenses: 17000 },
        { month: "May", revenue: 32000, expenses: 19000 },
        { month: "Jun", revenue: 35000, expenses: 20000 },
        { month: "Jul", revenue: 40000, expenses: 22000 },
        { month: "Aug", revenue: 45000, expenses: 24000 },
      ],
      growthPctNum: 15.3,
      invoiceStatus: [
        { status: "Paid", share: 65, fill: "var(--color-paid)" },
        { status: "Pending", share: 20, fill: "var(--color-pending)" },
        { status: "Overdue", share: 10, fill: "var(--color-overdue)" },
        { status: "Draft", share: 5, fill: "var(--color-draft)" },
      ],
    });
  } catch (error) {
    console.error("Super Admin Charts Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const crypto = require("crypto");

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    // Generate a secure random password
    const password = crypto.randomBytes(8).toString("hex");
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return res.status(201).json({ success: true, user, password });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getOrganizations = async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ success: true, organizations });
  } catch (error) {
    console.error("Fetch orgs error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getCharts,
  createUser,
  getOrganizations,
};
