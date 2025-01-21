const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pratyekpk3@gmail.com", // Replace with your email
    pass: "vvrpulcetdlnknaw",    // Replace with your app password
  },
});

const mailOptions = {
  from: "pratyekpk3@gmail.com",
  to: "pratyekpk3@gmail.com", // Replace with a test recipient email
  subject: "Test Email",
  text: "This is a test email sent from Nodemailer!",
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Email sent:", info.response);
  }
});
