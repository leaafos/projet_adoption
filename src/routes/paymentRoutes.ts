import { Router } from "express";
import { createPayment } from "../services/paymentStripe";
import { Payment } from "../models/payment";

export const paymentRouter = Router();

// GET /payments - Récupérer tous les paiements
paymentRouter.get("/payments", async (_req, res) => {
  try {
    const payments = await Payment.findAll();
    res.status(200).json({ payments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /payments/:id - Récupérer un paiement par ID
paymentRouter.get("/payments/:id", async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.status(200).json({ payment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

paymentRouter.post("/payments", async (req, res) => {
  try {
    const result = await createPayment(req.body);
    res.status(201).json({ created: result.payment });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
})