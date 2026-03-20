const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
    return transporter;
  }

  transporter = {
    async sendMail(message) {
      console.log("Password reset email preview:", message);
      return { messageId: "console-preview" };
    },
  };

  return transporter;
}

async function sendPasswordResetEmail({ to, resetUrl, name }) {
  const mailer = getTransporter();

  await mailer.sendMail({
    to,
    from: process.env.MAIL_FROM || "CarePath <no-reply@carepath.app>",
    subject: "Reset your CarePath password",
    text: `Hello ${name}, reset your password here: ${resetUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px;background:#f6f7fb;color:#111827">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px">
          <h1 style="margin:0 0 12px;font-size:24px">Reset your CarePath password</h1>
          <p style="margin:0 0 20px;color:#4b5563">A password reset was requested for your account.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600">Reset Password</a>
          <p style="margin:20px 0 0;color:#6b7280;font-size:14px">This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
