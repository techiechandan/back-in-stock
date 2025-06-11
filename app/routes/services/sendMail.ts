import nodemailer from "nodemailer";
import { URL } from "url";

const mailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Product Available Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f7;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      background-color: #4CAF50;
      color: white;
      padding: 12px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .footer {
      font-size: 12px;
      color: #777;
      text-align: center;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>It's Back in Stock!</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>Good news! The product you were interested in is now available again.</p>
      
      <h2 style="color:#4CAF50;">{{productName}}</h2>
      <p><strong>Variant:</strong> {{variantName}}</p>

      <a href="{{productLink}}" class="button">Buy Now</a>

      <p>If you have any questions or need assistance, feel free to reply to this email.</p>
      <p>Happy shopping!</p>
    </div>
    <div class="footer">
      &copy; 2025 YourShop. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

const transporter = nodemailer.createTransport({
  service: "gmail", // or use host + port for custom config
  auth: {
    user: "chandan.codingkart@gmail.com", // ✅ your real email
    pass: "gcir mdrs gfmf ginl", // ⚠️ NOT your normal Gmail password
  },
});

async function sendMail(
  toEmail: string,
  productName: string,
  variantName: string,
  productLink: string,
) {
  try {
    console.log("Sending email...",toEmail);
    const html = mailTemplate
      .replaceAll("{{productName}}", productName)
      .replaceAll("{{variantName}}", variantName)
      .replaceAll("{{productLink}}", productLink);

    const info = await transporter.sendMail({
      from: '"Chandans Store" <chandan.codingkart@gmail.com>',
      to: toEmail,
      subject: "🎉 Your Product is Back in Stock!",
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

export default sendMail;
