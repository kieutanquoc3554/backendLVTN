const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const User = require("../models/userModel");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kieutanquoc2002@gmail.com",
    pass: process.env.CLIENT_ID_GOOGLE,
  },
});

module.exports = transporter;
