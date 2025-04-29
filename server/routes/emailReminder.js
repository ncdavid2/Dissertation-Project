const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/", async (req, res) => {
  const { email, courseTitle } = req.body;

  if (!email || !courseTitle) {
    return res.status(400).json({ error: "Missing email or courseTitle" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"LearningPulse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Reminder: Finish your course "${courseTitle}"`,
      html: `
        <h1>Hey there!</h1> 
        <p>You started the course "${courseTitle}"</p> 
        <p>but haven't completed it yet.</p> 
        <p>Come back and finish it!</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
