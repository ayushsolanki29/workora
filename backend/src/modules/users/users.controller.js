const prisma = require("../../database/prisma");
const bcrypt = require("bcryptjs");

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
