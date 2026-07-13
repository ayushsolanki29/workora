const quickItemsService = require("./quick-items.service");

class QuickItemsController {
  async getQuickItems(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await quickItemsService.getQuickItems(req.user.organizationId, page, limit);
      return res.status(200).json({ success: true, quickItems: result.quickItems, pagination: result.pagination });
    } catch (error) {
      if (error.status === 401) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async createQuickItem(req, res, next) {
    try {
      const quickItem = await quickItemsService.createQuickItem(req.user.organizationId, req.body);
      return res.status(201).json({ success: true, quickItem });
    } catch (error) {
      if (error.status === 401 || error.status === 400) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new QuickItemsController();
