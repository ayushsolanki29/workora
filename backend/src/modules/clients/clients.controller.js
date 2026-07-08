const prisma = require("../../database/prisma");

const getClients = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { query = "", status = "ActiveOrLead", page = "1", limit = "10" } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      organizationId,
      ...(status === "ActiveOrLead" ? { status: { not: "Inactive" } } : status !== "All" ? { status } : {}),
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      }),
    };

    const totalCount = await prisma.client.count({ where });

    const clients = await prisma.client.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      clients,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("Fetch clients error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createClient = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { name, email, phone, status } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!email || !/^\\S+@\\S+\\.\\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const existingClient = await prisma.client.findFirst({
      where: {
        email,
        organizationId,
      },
    });

    if (existingClient) {
      return res.status(400).json({ success: false, message: "A client with this email already exists" });
    }

    const newClient = await prisma.client.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        status: status || "Active",
        organizationId,
      },
    });

    return res.status(201).json({ success: true, client: newClient });
  } catch (error) {
    console.error("Create client error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getClientById = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          orderBy: { issueDate: "desc" },
          include: {
            payments: true,
          },
        },
        expenses: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    return res.status(200).json({ success: true, client });
  } catch (error) {
    console.error("Fetch client error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateClient = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;
    const { name, email, phone, status } = req.body;

    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingClient) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    if (email && email.trim().toLowerCase() !== existingClient.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          email: email.trim().toLowerCase(),
          organizationId,
          id: { not: id },
        },
      });

      if (emailExists) {
        return res.status(400).json({ success: false, message: "A client with this email already exists" });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (status !== undefined) updateData.status = status;

    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ success: true, client: updatedClient });
  } catch (error) {
    console.error("Update client error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getClients,
  createClient,
  getClientById,
  updateClient,
};
