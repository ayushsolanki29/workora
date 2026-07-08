// src/modules/demo/demo.controller.js
const demoService = require("./demo.service");

class DemoController {
  // Create demo
  async createDemo(req, res, next) {
    try {
      const result = await demoService.createDemo(req.body);

      res.status(201).json({
        success: true,
        message: "Demo created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all demos
  async getAllDemos(req, res, next) {
    try {
      const result = await demoService.getAllDemos();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get demo by ID
  async getDemoById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await demoService.getDemoById(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update demo
  async updateDemo(req, res, next) {
    try {
      const { id } = req.params;
      const result = await demoService.updateDemo(id, req.body);

      res.status(200).json({
        success: true,
        message: "Demo updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete demo
  async deleteDemo(req, res, next) {
    try {
      const { id } = req.params;
      const result = await demoService.deleteDemo(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Upload file
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // For demo purposes, using a fixed user ID
      // In real application, this would come from authentication
      const userId = "clp9z3z2k0000v2c0v2v2v2v2";

      const result = await demoService.uploadFile(userId, req.file, req.body);

      res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user files
  async getUserFiles(req, res, next) {
    try {
      // For demo purposes, using a fixed user ID
      const userId = "clp9z3z2k0000v2c0v2v2v2v2";

      const result = await demoService.getUserFiles(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete file
  async deleteFile(req, res, next) {
    try {
      const { fileId } = req.params;
      const userId = "clp9z3z2k0000v2c0v2v2v2v2";

      const result = await demoService.deleteFile(fileId, userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DemoController();
