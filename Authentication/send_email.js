const nodemailer = require("nodemailer");

const sendMail = async (message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_KEY,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isSendMail = await transporter.sendMail(message);
    if (!isSendMail) return false;
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = sendMail;
