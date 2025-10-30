import { Router } from "express";
import { createPayment } from "../services/paymentStripe";

export const paymentRouter = Router();

paymentRouter.post("/payments", async (req, res) => {
  try {
    const payment = await createPayment(req.body);
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
})