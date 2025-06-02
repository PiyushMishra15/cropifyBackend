const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const sendEmail = async (options) => {
  console.log(process.env.EMAIL_PASSWORD);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g. 'smtp-relay.brevo.com'
    port: Number(process.env.EMAIL_PORT) || 587, // ensure it's a number
    secure: false, // false for port 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USERNAME, // SMTP login like '8df125001@smtp-brevo.com'
      pass: process.env.EMAIL_PASSWORD, // SMTP master password (not Gmail password)
    },
  });

  const html = await ejs.renderFile(
    path.join(__dirname, `../views/${options.template}.ejs`),
    options.templateData
  );

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html,
    text: options.message, // Fallback
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;
