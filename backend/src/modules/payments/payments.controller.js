const prisma = require("../../database/prisma");

const getPayments = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const payments = await prisma.payment.findMany({
      where: {
        invoice: {
          organizationId,
        },
      },
      include: {
        invoice: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getPayments,
};
