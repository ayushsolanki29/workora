const prisma = require("../../database/prisma");

const getProjects = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { clientId, status } = req.query;

    const where = { organizationId };
    if (clientId) where.clientId = clientId;
    if (status && status !== "All") where.status = status;

    const projects = await prisma.project.findMany({
      where,
      include: { client: true },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Fetch projects error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createProject = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { title, description, startDate, estimatedEndDate, status, clientId } = req.body;

    if (!title || !startDate || !clientId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        estimatedEndDate: estimatedEndDate ? new Date(estimatedEndDate) : null,
        status: status || "Planning",
        clientId,
        organizationId,
      },
    });

    return res.status(201).json({ success: true, project });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!project || project.organizationId !== organizationId) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("Fetch project error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateProject = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;
    const body = req.body;

    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject || existingProject.organizationId !== organizationId) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.estimatedEndDate !== undefined)
      updateData.estimatedEndDate = body.estimatedEndDate ? new Date(body.estimatedEndDate) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.clientId !== undefined) updateData.clientId = body.clientId;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;

    const existingProject = await prisma.project.findUnique({ where: { id } });
    if (!existingProject || existingProject.organizationId !== organizationId) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await prisma.project.delete({ where: { id } });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
};
