const prisma = require("../../database/prisma");

const getOrganization = async (req, res) => {
  try {
    const { organizationId } = req.user;

    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: { invoices: true, expenses: true },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    return res.status(200).json({ success: true, organization });
  } catch (error) {
    console.error("Fetch organization error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const { organizationId } = req.user;

    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { name, address, invoiceFooterNote, expenseFooterNote, masterCurrency, dateFormat } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Name cannot be empty" });
      }
      updateData.name = name.trim();
    }

    if (address !== undefined) updateData.address = address?.trim() || null;
    if (invoiceFooterNote !== undefined) updateData.invoiceFooterNote = invoiceFooterNote?.trim() || null;
    if (expenseFooterNote !== undefined) updateData.expenseFooterNote = expenseFooterNote?.trim() || null;
    if (dateFormat !== undefined) updateData.dateFormat = dateFormat;

    if (masterCurrency !== undefined) {
      // Prevent changing currency if transactions exist
      const orgWithCounts = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          _count: {
            select: { invoices: true, expenses: true },
          },
        },
      });

      const hasTransactions =
        orgWithCounts && (orgWithCounts._count.invoices > 0 || orgWithCounts._count.expenses > 0);

      if (hasTransactions && orgWithCounts.masterCurrency !== masterCurrency) {
        return res.status(400).json({
          success: false,
          message: "Cannot change master currency because transactions exist.",
        });
      }

      updateData.masterCurrency = masterCurrency;
    }

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });

    return res.status(200).json({ success: true, organization });
  } catch (error) {
    console.error("Update organization error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const jwt = require("jsonwebtoken");

const setupOrganization = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (organizationId) {
      return res.status(400).json({ success: false, message: "You already have an organization setup" });
    }

    const { name, userName, masterCurrency } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Workspace name is required" });
    }
    if (!userName || userName.trim() === "") {
      return res.status(400).json({ success: false, message: "Your name is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        masterCurrency: masterCurrency || "USD",
        users: {
          connect: { id: user.id },
        },
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { name: userName.trim() },
    });

    // Reissue token with organizationId
    const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-development";
    const payload = {
      userId: user.id,
      hasOrg: true,
      organizationId: organization.id,
    };
    
    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie("accessToken", newAccessToken, cookieOptions);

    return res.status(200).json({ success: true, organization });
  } catch (error) {
    console.error("Setup organization error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getOrganization,
  updateOrganization,
  setupOrganization,
};
