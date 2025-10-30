import express from "express";
import { sendAndSaveMail } from "../services/mailService";

export const mailRouter = express.Router();

mailRouter.post("/send-mail", async (req, res) => {
  const { userId, to, title, body } = req.body;
  try {
    await sendAndSaveMail({ userId, to, title, body });
    res.json({ message: "Mail envoyé avec succès !" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

