const prisma = require("../../database/prisma");
const disposableEmailDetector = require("disposable-email-detector");

// Basic email regex for sanity check
const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

const createLead = async (req, res) => {
  try {
    const { fullName, email, country, profession, earningsRange, previousTool } = req.body;

    // 1. Basic Presence Validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Full name is required and must be valid." });
    }

    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Email is required and must be valid." });
    }

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 2. Length Validation
    if (cleanFullName.length < 2 || cleanFullName.length > 50) {
      return res.status(400).json({ success: false, message: "Full name must be between 2 and 50 characters." });
    }

    if (cleanEmail.length > 100) {
      return res.status(400).json({ success: false, message: "Email is too long." });
    }

    // 3. Format Validation
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address format." });
    }

    // 4. Disposable Email Check
    try {
      const isDisposable = await disposableEmailDetector(cleanEmail);
      if (isDisposable) {
        return res.status(400).json({
          success: false,
          message: "Disposable email addresses are not allowed. Please use your primary email.",
        });
      }
    } catch (detectorError) {
      console.warn("Disposable email detector failed (ignoring check):", detectorError);
    }

    // 5. Check if email already exists in waitlist
    const existingLead = await prisma.waitlistLead.findUnique({
      where: { email: cleanEmail },
    });

    if (existingLead) {
      return res.status(400).json({ success: false, message: "You are already on the waitlist!" });
    }

    // 6. Enforce string limits on optional fields
    const cleanCountry = typeof country === "string" ? country.trim().substring(0, 50) : null;
    const cleanProfession = typeof profession === "string" ? profession.trim().substring(0, 50) : null;
    const cleanEarningsRange = typeof earningsRange === "string" ? earningsRange.trim().substring(0, 50) : null;
    const cleanPreviousTool = typeof previousTool === "string" ? previousTool.trim().substring(0, 50) : null;

    const lead = await prisma.waitlistLead.create({
      data: {
        fullName: cleanFullName,
        email: cleanEmail,
        country: cleanCountry,
        profession: cleanProfession,
        earningsRange: cleanEarningsRange,
        previousTool: cleanPreviousTool,
      },
    });

    return res.status(201).json({ success: true, lead });
  } catch (error) {
    console.error("Waitlist lead creation error:", error);
    return res.status(500).json({ success: false, message: "An unexpected error occurred. Please try again later." });
  }
};

module.exports = {
  createLead,
};
