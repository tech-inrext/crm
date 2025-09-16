import nodemailer from "nodemailer";

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });
    this.senderEmail = process.env.SMTP_EMAIL;
  }

  sendEmail = async (to, subject, html) => {
    const mailOptions = {
      from: this.senderEmail,
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  };
}
const mailer = new Mailer();

export default mailer;
