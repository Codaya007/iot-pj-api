const nodemailer = require("nodemailer");

const TRANSPORTER = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER_DM,
        pass: process.env.EMAIL_PASSWORD_DM,
    },
});

module.exports = TRANSPORTER;