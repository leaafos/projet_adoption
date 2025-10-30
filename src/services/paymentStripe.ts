import Stripe from "stripe";
import { Payment } from "../models/payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

interface PaymentData {
  organizationId: string;
  userId: string;
  amount: number;
  currency: string;
  payment_method: string; // ex: "card"
}

export async function createPayment(paymentData: PaymentData) {
  try {
    // Crée un paiement test sur Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentData.amount * 100), // Stripe travaille en cents
      currency: paymentData.currency,
      payment_method_types: [paymentData.payment_method],
    });

    // Enregistre le paiement dans ta base
    const payment = await Payment.create({
      ...paymentData,
      status: "SUCCESS",
      stripeId: paymentIntent.id,
    });

    return { payment, stripeId: paymentIntent.id };
  } catch (error: any) {
    // Enregistre l'erreur dans ta table
    await Payment.create({
      ...paymentData,
      status: "FAILED",
    });
    console.error("❌ Erreur de paiement :", error);
    throw error;
  }
}
