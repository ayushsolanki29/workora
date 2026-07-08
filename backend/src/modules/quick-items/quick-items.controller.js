const prisma = require("../../database/prisma");

const getQuickItems = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const quickItems = await prisma.quickItem.findMany({
      where: {
        organizationId,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, quickItems });
  } catch (error) {
    console.error("Fetch quick items error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createQuickItem = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { name, defaultPrice } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const quickItem = await prisma.quickItem.create({
      data: {
        name: name.trim(),
        defaultPrice: parseFloat(defaultPrice) || 0,
        organizationId,
      },
    });

    return res.status(201).json({ success: true, quickItem });
  } catch (error) {
    console.error("Create quick item error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getQuickItems,
  createQuickItem,
};
