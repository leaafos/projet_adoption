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
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
}

// Liste des numéros de cartes invalides pour la démo
const INVALID_CARD_NUMBERS = [
  '4000000000000002', // Carte déclinée générale
  '4000000000000051', // Carte expirée
  '4000000000000069', // Carte avec CVC incorrect
  '4000000000000119', // Erreur de traitement
  '1234567890123456', // Numéro invalide
  '0000000000000000', // Numéro de test invalide
];

function validateCardNumber(cardNumber?: string): { valid: boolean; error?: string } {
  if (!cardNumber) {
    return { valid: false, error: "Numéro de carte manquant" };
  }

  const cleanCardNumber = cardNumber.replace(/[\s-]/g, '');
  
  if (!/^\d{13,19}$/.test(cleanCardNumber)) {
    return { valid: false, error: "Numéro de carte invalide (doit contenir 13-19 chiffres)" };
  }
  
  if (INVALID_CARD_NUMBERS.includes(cleanCardNumber)) {
    return { valid: false, error: "Cette carte bancaire a été refusée par la banque" };
  }
  
  // Algorithme de Luhn pour validation basique
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanCardNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, error: "Numéro de carte invalide (échec de la validation Luhn)" };
  }
  
  return { valid: true };
}

export async function createPayment(paymentData: PaymentData) {
  try {
    if ((paymentData.payment_method === 'carte_bancaire' || paymentData.payment_method === 'card') && paymentData.cardNumber) {
      const cardValidation = validateCardNumber(paymentData.cardNumber);
      if (!cardValidation.valid) {
        throw new Error(`Paiement refusé: ${cardValidation.error}`);
      }
    }
   
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
