const nodemailer = require("nodemailer");

// Optimized for heavy usage with a generic SMTP or Gmail App Password
// - pool: true enables connection pooling
// - maxConnections: limits concurrent connections (Google limit is usually around 5)
// - maxMessages: max emails per connection before it's refreshed
const transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "false" ? false : true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  maxConnections: 5, 
  maxMessages: 100, 
  rateDelta: 1000, 
  rateLimit: 5, // max 5 emails per second
});

transporter.verify((error, success) => {
  if (error) {
    console.warn("Mailer connection issue (might be normal if SMTP not configured yet):", error.message);
  } else {
    console.log("Mailer is ready and connection pooled");
  }
});

module.exports = transporter;
