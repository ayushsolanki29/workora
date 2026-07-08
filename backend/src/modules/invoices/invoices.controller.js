const prisma = require("../../database/prisma");

const getInvoices = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { clientId, projectId, status } = req.query;

    const where = { organizationId };
    if (clientId && clientId !== "All") where.clientId = clientId;
    if (projectId && projectId !== "All") where.projectId = projectId;
    if (status && status !== "All") where.status = status;

    const invoices = await prisma.invoice.findMany({
      where,
      include: { client: true, project: true },
      orderBy: { issueDate: "desc" },
    });

    return res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error("Fetch invoices error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const {
      clientId,
      projectId,
      invoiceNumber,
      status,
      issueDate,
      dueDate,
      currency,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      exchangeRate,
      notice,
      notes,
      terms,
      items,
    } = req.body;

    if (!clientId || !invoiceNumber || !dueDate) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        clientId,
        projectId: projectId || null,
        invoiceNumber,
        status: status || "Draft",
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: new Date(dueDate),
        currency: currency || "USD",
        subtotal: parseFloat(subtotal) || 0,
        taxAmount: parseFloat(taxAmount) || 0,
        discountAmount: parseFloat(discountAmount) || 0,
        totalAmount: parseFloat(totalAmount) || 0,
        exchangeRate: parseFloat(exchangeRate) || 1.0,
        notice,
        notes,
        terms,
        items: {
          create: items?.map((item) => ({
            description: item.description,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            taxRate: parseFloat(item.taxRate) || 0,
            total: parseFloat(item.total) || 0,
          })) || [],
        },
        activities: {
          create: [{ type: "CREATED", description: "Invoice created" }],
        },
      },
      include: {
        items: true,
        activities: true,
      },
    });

    return res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error("Create invoice error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id, organizationId },
      include: {
        client: true,
        project: true,
        items: true,
        payments: { orderBy: { date: "desc" } },
        activities: { orderBy: { date: "desc" } },
        expenses: { orderBy: { date: "desc" } },
      },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    return res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error("Fetch invoice error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;
    const body = req.body;

    // Check if it's just a status update
    if (Object.keys(body).length === 1 && body.status) {
      const invoice = await prisma.invoice.update({
        where: { id, organizationId },
        data: {
          status: body.status,
          activities: {
            create: [{ type: "UPDATED", description: `Status changed to ${body.status}` }],
          },
        },
      });
      return res.status(200).json({ success: true, invoice });
    }

    const {
      clientId,
      projectId,
      invoiceNumber,
      status,
      issueDate,
      dueDate,
      currency,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      exchangeRate,
      notice,
      notes,
      terms,
      items,
    } = body;

    const invoice = await prisma.invoice.update({
      where: { id, organizationId },
      data: {
        clientId,
        projectId: projectId || null,
        invoiceNumber,
        status: status || "Draft",
        issueDate: issueDate ? new Date(issueDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        currency: currency || "USD",
        subtotal: parseFloat(subtotal) || 0,
        taxAmount: parseFloat(taxAmount) || 0,
        discountAmount: parseFloat(discountAmount) || 0,
        totalAmount: parseFloat(totalAmount) || 0,
        exchangeRate: parseFloat(exchangeRate) || 1.0,
        notice,
        notes,
        terms,
        items: {
          deleteMany: {},
          create: items?.map((item) => ({
            description: item.description,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            taxRate: parseFloat(item.taxRate) || 0,
            total: parseFloat(item.total) || 0,
          })) || [],
        },
        activities: {
          create: [{ type: "UPDATED", description: "Invoice updated" }],
        },
      },
      include: {
        items: true,
        client: true,
        project: true,
      },
    });

    return res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error("Update invoice error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;
    await prisma.invoice.delete({
      where: { id, organizationId },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};
