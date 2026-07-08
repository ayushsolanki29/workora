const prisma = require("../../database/prisma");
const crypto = require("crypto");

// --- PROTECTED ROUTES ---

const getQuestionnaires = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { query = "", status = "All", page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      organizationId,
      ...(status !== "All" ? { status } : {}),
      ...(query && {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      }),
    };

    const totalCount = await prisma.questionnaire.count({ where });

    const questionnaires = await prisma.questionnaire.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      questionnaires: questionnaires.map((q) => ({
        ...q,
        responseCount: q._count.responses,
      })),
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("Fetch questionnaires error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const createQuestionnaire = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { title, description, maxResponses, clientId, projectId, fields } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const slug = crypto.randomUUID();

    const newQuestionnaire = await prisma.questionnaire.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        slug,
        maxResponses: maxResponses ? parseInt(maxResponses) : null,
        organizationId,
        clientId: clientId || null,
        projectId: projectId || null,
        fields:
          fields && fields.length > 0
            ? {
                create: fields.map((field, index) => ({
                  type: field.type,
                  label: field.label,
                  description: field.description || null,
                  required: field.required || false,
                  order: index,
                  options: field.options || null,
                })),
              }
            : undefined,
      },
      include: {
        fields: true,
      },
    });

    return res.status(201).json({ success: true, questionnaire: newQuestionnaire });
  } catch (error) {
    console.error("Create questionnaire error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getQuestionnaireById = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;

    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        id,
        organizationId,
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
        client: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, title: true },
        },
      },
    });

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: "Questionnaire not found" });
    }

    return res.status(200).json({ success: true, questionnaire });
  } catch (error) {
    console.error("Fetch questionnaire error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateQuestionnaire = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;
    const { title, description, status, maxResponses, clientId, projectId, fields } = req.body;

    const existing = await prisma.questionnaire.findUnique({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Questionnaire not found" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (maxResponses !== undefined) updateData.maxResponses = maxResponses === null ? null : parseInt(maxResponses);
    if (clientId !== undefined) updateData.clientId = clientId;
    if (projectId !== undefined) updateData.projectId = projectId;

    if (fields) {
      await prisma.$transaction([
        prisma.questionnaireField.deleteMany({
          where: { questionnaireId: id },
        }),
        prisma.questionnaire.update({
          where: { id },
          data: {
            ...updateData,
            fields: {
              create: fields.map((field, index) => ({
                type: field.type,
                label: field.label,
                description: field.description || null,
                required: field.required || false,
                order: index,
                options: field.options || null,
              })),
            },
          },
        }),
      ]);
    } else {
      await prisma.questionnaire.update({
        where: { id },
        data: updateData,
      });
    }

    const updatedQuestionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    return res.status(200).json({ success: true, questionnaire: updatedQuestionnaire });
  } catch (error) {
    console.error("Update questionnaire error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteQuestionnaire = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;

    const existing = await prisma.questionnaire.findUnique({
      where: { id, organizationId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Questionnaire not found" });
    }

    await prisma.questionnaire.delete({
      where: { id },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete questionnaire error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getQuestionnaireResponses = async (req, res) => {
  try {
    const { organizationId } = req.user;
    if (!organizationId) {
      return res.status(401).json({ success: false, message: "Unauthorized: No organization found" });
    }

    const { id } = req.params;
    const { page = "1", limit = "50" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        id,
        organizationId,
      },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: "Questionnaire not found" });
    }

    const totalCount = await prisma.questionnaireResponse.count({
      where: { questionnaireId: id },
    });

    const responses = await prisma.questionnaireResponse.findMany({
      where: { questionnaireId: id },
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      questionnaire,
      responses,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("Fetch questionnaire responses error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// --- PUBLIC ROUTES ---

const getPublicQuestionnaire = async (req, res) => {
  try {
    const { slug } = req.params;

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { slug },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
        organization: {
          select: { name: true },
        },
      },
    });

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: "Questionnaire not found" });
    }

    if (questionnaire.status !== "Active") {
      return res.status(403).json({ success: false, message: "This questionnaire is currently inactive." });
    }

    if (questionnaire.maxResponses && questionnaire.responseCount >= questionnaire.maxResponses) {
      return res.status(403).json({
        success: false,
        message: "This questionnaire has reached its maximum number of responses.",
      });
    }

    return res.status(200).json({ success: true, questionnaire });
  } catch (error) {
    console.error("Fetch public questionnaire error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const submitQuestionnaireResponse = async (req, res) => {
  try {
    const { slug } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ success: false, message: "Invalid answers payload" });
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { slug },
      include: { fields: true },
    });

    if (!questionnaire) {
      return res.status(404).json({ success: false, message: "Questionnaire not found" });
    }

    if (questionnaire.status !== "Active") {
      return res.status(403).json({ success: false, message: "This questionnaire is currently inactive." });
    }

    if (questionnaire.maxResponses && questionnaire.responseCount >= questionnaire.maxResponses) {
      return res.status(403).json({
        success: false,
        message: "This questionnaire has reached its maximum number of responses.",
      });
    }

    for (const field of questionnaire.fields) {
      if (field.required && !answers[field.id]) {
        return res.status(400).json({ success: false, message: `Field "${field.label}" is required.` });
      }
    }

    await prisma.$transaction([
      prisma.questionnaireResponse.create({
        data: {
          questionnaireId: questionnaire.id,
          clientId: questionnaire.clientId,
          answers: answers,
        },
      }),
      prisma.questionnaire.update({
        where: { id: questionnaire.id },
        data: { responseCount: { increment: 1 } },
      }),
    ]);

    return res.status(201).json({ success: true, message: "Response submitted successfully." });
  } catch (error) {
    console.error("Submit public questionnaire error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getQuestionnaires,
  createQuestionnaire,
  getQuestionnaireById,
  updateQuestionnaire,
  deleteQuestionnaire,
  getQuestionnaireResponses,
  getPublicQuestionnaire,
  submitQuestionnaireResponse,
};
