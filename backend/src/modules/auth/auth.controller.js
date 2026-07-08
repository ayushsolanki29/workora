const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const prisma = require("../../database/prisma");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-development";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Generate accessToken
    const payload = {
      userId: user.id,
      hasOrg: !!user.organizationId,
      organizationId: user.organizationId || null,
    };
    
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    // Generate refreshToken
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const me = async (req, res) => {
  try {
    // req.user is populated by authMiddleware
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      const waitlist = await prisma.waitlistLead.findUnique({
        where: { email },
      });
      return res.status(200).json({ exists: false, inWaitlist: !!waitlist });
    }
  } catch (error) {
    console.error("Check email error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  login,
  logout,
  me,
  checkEmail,
};
