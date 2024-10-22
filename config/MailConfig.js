const transport = require("nodemailer").createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// used to send email to user from server logic where it will be called from controller
const sendMail = (to, subject, html) => {
  const mailOptions = {
    from: process.env.from,
    to,
    subject,
    html,
  };
  return transport.sendMail(mailOptions);
};

module.exports = sendMail;
