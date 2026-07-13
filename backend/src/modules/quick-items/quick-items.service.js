// src/modules/quick-items/quick-items.service.js
const prisma = require("../../database/prisma");

class QuickItemsService {
  async getQuickItems(organizationId, page = "1", limit = "25") {
    if (!organizationId) {
      const error = new Error("Unauthorized: No organization found");
      error.status = 401;
      throw error;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 25));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      organizationId,
    };

    const totalCount = await prisma.quickItem.count({ where });

    const quickItems = await prisma.quickItem.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        name: true,
        defaultPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      quickItems,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    };
  }

  async createQuickItem(organizationId, data) {
    if (!organizationId) {
      const error = new Error("Unauthorized: No organization found");
      error.status = 401;
      throw error;
    }

    const { name, defaultPrice } = data;

    const quickItem = await prisma.quickItem.create({
      data: {
        name: name.trim(),
        defaultPrice: parseFloat(defaultPrice) || 0,
        organizationId,
      },
    });

    return quickItem;
  }
}

module.exports = new QuickItemsService();
