import Stripe from "stripe";
import { Payment } from "../models/payment";
import models from "../models";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

interface PaymentData {
  organizationId: string;
  userId: string;
  amount: number;
  currency: string;
  payment_method: string;
  status?: string;
  stripeId?: string;
}

export async function createPayment(paymentData: PaymentData) {
  try {
    // Vérifier que les IDs sont des nombres valides
    const userIdNum = parseInt(paymentData.userId);
    if (isNaN(userIdNum)) {
      throw new Error(`User with ID ${paymentData.userId} not found`);
    }
    
    const orgIdNum = parseInt(paymentData.organizationId);
    if (isNaN(orgIdNum)) {
      throw new Error(`Organization with ID ${paymentData.organizationId} not found`);
    }

    const user = await models.User.findByPk(userIdNum);
    if (!user) {
      throw new Error(`User with ID ${paymentData.userId} not found`);
    }

    const organization = await models.Organization.findByPk(orgIdNum);
    if (!organization) {
      throw new Error(`Organization with ID ${paymentData.organizationId} not found`);
    }

    // En mode test, on évite les appels réels à Stripe
    if (process.env.NODE_ENV === 'test') {
      const payment = await Payment.create({
        ...paymentData,
        status: paymentData.status || "PENDING",
        stripeId: paymentData.stripeId || `pi_test_${Date.now()}`,
      });

      return { payment, stripeId: payment.stripeId };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentData.amount * 100), 
      currency: paymentData.currency,
      payment_method_types: [paymentData.payment_method],
    });

    const payment = await Payment.create({
      ...paymentData,
      status: "SUCCESS",
      stripeId: paymentIntent.id,
    });

    return { payment, stripeId: paymentIntent.id };
  } catch (error: any) {
    if (error.message.includes('not found')) {
      throw error;
    }
    
    await Payment.create({
      ...paymentData,
      status: "FAILED",
    });
    console.error("❌ Erreur de paiement :", error);
    throw error;
  }
}
