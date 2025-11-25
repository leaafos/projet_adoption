import express from "express";
import { sendAndSaveMail } from "../services/mailService";
import { Mail } from "../models/mail";

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

// GET /mails - Récupérer tous les mails
mailRouter.get("/mails", async (_req, res) => {
  try {
    const mails = await Mail.findAll();
    res.status(200).json({ mails });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /mails/:id - Récupérer un mail par ID
mailRouter.get("/mails/:id", async (req, res) => {
  try {
    const mail = await Mail.findByPk(req.params.id);
    if (!mail) {
      return res.status(404).json({ error: "Mail not found" });
    }
    res.status(200).json({ mail });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

