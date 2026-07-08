// src/modules/demo/demo.service.js
const prisma = require('../../database/prisma');
const path = require('path');
const fs = require('fs');

class DemoService {
  // Create demo record
  async createDemo(data) {
    try {
      const demo = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
        },
      });

      return demo;
    } catch (error) {
      throw new Error(`Failed to create demo: ${error.message}`);
    }
  }

  // Get all demo records
  async getAllDemos() {
    try {
      const demos = await prisma.user.findMany({
        include: {
          files: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return demos;
    } catch (error) {
      throw new Error(`Failed to fetch demos: ${error.message}`);
    }
  }

  // Get demo by ID
  async getDemoById(id) {
    try {
      const demo = await prisma.user.findUnique({
        where: { id },
        include: {
          files: true,
        },
      });

      if (!demo) {
        throw new Error('Demo not found');
      }

      return demo;
    } catch (error) {
      throw new Error(`Failed to fetch demo: ${error.message}`);
    }
  }

  // Update demo record
  async updateDemo(id, data) {
    try {
      const demo = await prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
        },
      });

      return demo;
    } catch (error) {
      throw new Error(`Failed to update demo: ${error.message}`);
    }
  }

  // Delete demo record
  async deleteDemo(id) {
    try {
      await prisma.user.delete({
        where: { id },
      });

      return { message: 'Demo deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete demo: ${error.message}`);
    }
  }

  // Upload file
  async uploadFile(userId, file, metadata = {}) {
    try {
      const fileRecord = await prisma.file.create({
        data: {
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          userId: userId,
        },
      });

      return fileRecord;
    } catch (error) {
      // Clean up uploaded file if database operation fails
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Get user files
  async getUserFiles(userId) {
    try {
      const files = await prisma.file.findMany({
        where: { userId },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return files;
    } catch (error) {
      throw new Error(`Failed to fetch files: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(fileId, userId) {
    try {
      const file = await prisma.file.findFirst({
        where: {
          id: fileId,
          userId: userId,
        },
      });

      if (!file) {
        throw new Error('File not found');
      }

      // Delete physical file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Delete database record
      await prisma.file.delete({
        where: { id: fileId },
      });

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}

module.exports = new DemoService();