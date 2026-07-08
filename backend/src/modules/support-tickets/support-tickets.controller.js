const prisma = require("../../database/prisma");

const getTickets = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { global } = req.query;
    const globalMode = global === "true";

    // In a real app, verify the user has Super Admin role for global mode
    const where = globalMode ? {} : { organizationId };

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Fetch support tickets error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createTicket = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        description,
        priority: priority || "Medium",
        userId,
        organizationId,
      },
    });

    return res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error("Create support ticket error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
        messages: {
          include: {
            sender: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    return res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Fetch ticket details error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
    });

    return res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Update ticket error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const message = await prisma.supportTicketMessage.create({
      data: {
        ticketId: id,
        senderId: userId,
        content,
      },
      include: {
        sender: { select: { name: true, email: true } },
      },
    });

    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Add message error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getTickets,
  createTicket,
  getTicketById,
  updateTicket,
  addMessage,
};
