import nodemailer from "nodemailer";
import { Mail } from "../models/mail";

interface MailData {
  userId: string;
  to: string;
  title: string;
  body: string;
}

export async function sendAndSaveMail({ userId, to, title, body }: MailData) {
  try {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
      user: process.env.MAILTRAP_USER!,
      pass: process.env.MAILTRAP_PASS!,
    },
});

    const info = await transporter.sendMail({
      from: '"Mon App 👋" <no-reply@monapp.com>',
      to,
      subject: title,
      text: body,
    });

    await Mail.create({
      userId,
      title,
      body,
      sentAt: new Date(),
      status: "SENT",
      errorMessage: null,
    });

    console.log("✅ Mail envoyé :", info.messageId);
    return info;
  } catch (error: any) {
    await Mail.create({
      userId,
      title,
      body,
      sentAt: new Date(),
      status: "FAILED",
      errorMessage: error.message,
    });
    console.error("❌ Erreur d’envoi :", error);
    throw error;
  }
}
