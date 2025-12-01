import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

// Tests fonctionnels pour le système de paiements - Parcours utilisateur complet

describe('Payment System - Functional Journey Tests', () => {
  let createdUserId: string;
  let createdOrganizationId: string;

  before(async () => {
    await syncDatabase();
  });

  async function createTestUser(name: string = 'Payment User') {
    const userData = {
      name: name,
      surname: 'Test',
      email: `${name.toLowerCase().replace(/\s+/g, '')}+${Date.now()}@payment-test.com`,
      password: 'SecurePassword123!',
      isActive: true,
      role: 'user',
      phoneNumber: '+33123456789',
      address: '123 Payment Street',
      city: 'Paris',
      country: 'France',
      postalCode: '75001'
    };

    const res = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    if (res.status !== 201 || !res.body.created) {
      throw new Error(`Failed to create user: ${JSON.stringify(res.body)}`);
    }

    return {
      userId: res.body.created.id,
      userEmail: res.body.created.email
    };
  }

  async function createTestOrganization(name: string = 'Payment Test Org') {
    const orgData = {
      name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@test-org.com`,
      phone: '+33987654321',
      address: '456 Org Avenue',
      city: 'Lyon',
      state: 'Rhône-Alpes',
      postcode: '69000',
      country: 'France',
      hours: 'Mon-Fri 9AM-6PM',
      url: 'https://test-payment-org.com',
      website: 'https://test-payment-org.com',
      facebook: 'testpaymentorg',
      pinterest: 'testpaymentorg',
      x: 'testpaymentorg',
      youtube: 'testpaymentorg',
      instagram: 'testpaymentorg',
      photos_url: 'https://test-payment-org.com/photos'
    };

    const res = await request(app)
      .post('/organizations')
      .send(orgData)
      .set('Accept', 'application/json');

    if (res.status !== 201 || !res.body.created) {
      throw new Error(`Failed to create organization: ${JSON.stringify(res.body)}`);
    }

    return res.body.created.organization_id;
  }

  describe('Scénario 1: Don simple à une organisation', () => {
    it('should complete a full donation journey successfully', async () => {
      console.log('\n === SCÉNARIO: Don de 50€ à une association animalière ===');

      console.log('\n Étape 1: Création du compte donateur...');
      const { userId, userEmail } = await createTestUser('Marie Donateuse');
      createdUserId = userId;
      
      console.log(`Utilisateur créé: ${userEmail} (ID: ${userId})`);

      console.log('\n Étape 2: Création de l\'organisation bénéficiaire...');
      createdOrganizationId = await createTestOrganization('SPA Refuge des Animaux');
      
      console.log(`Organisation créée: SPA Refuge des Animaux (ID: ${createdOrganizationId})`);

      console.log('\n Étape 3: Traitement du don de 50€...');
      const paymentData = {
        organizationId: createdOrganizationId,
        userId: createdUserId,
        amount: 50.00,
        currency: 'EUR',
        status: 'pending',
        payment_method: 'carte_bancaire'
      };

      const paymentRes = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      console.log('Réponse paiement:', JSON.stringify(paymentRes.body, null, 2));

      assert.equal(paymentRes.status, 201, 'Le paiement devrait être créé avec succès');
      assert.ok(paymentRes.body.created, 'Une transaction devrait être retournée');
      
      const payment = paymentRes.body.created;
      assert.equal(payment.amount, paymentData.amount, 'Le montant devrait correspondre');
      assert.equal(payment.currency, paymentData.currency, 'La devise devrait correspondre');
      assert.equal(payment.organizationId, paymentData.organizationId, 'L\'organisation devrait correspondre');
      assert.equal(payment.userId, paymentData.userId, 'L\'utilisateur devrait correspondre');

      console.log(`Don de ${payment.amount}€ traité avec succès!`);

      console.log('\n Étape 4: Vérification de l\'historique des paiements...');
      const historyRes = await request(app)
        .get('/payments')
        .set('Accept', 'application/json');

      assert.equal(historyRes.status, 200, 'L\'historique devrait être accessible');
      assert.ok(Array.isArray(historyRes.body.payments), 'Une liste de paiements devrait être retournée');
      
      const ourPayment = historyRes.body.payments.find((p: any) => p.id === payment.id);
      assert.ok(ourPayment, 'Notre paiement devrait apparaître dans l\'historique');

      console.log('Paiement visible dans l\'historique des transactions');
    });
  });

  describe('Scénario 2: Paiement avec différentes méthodes', () => {
    it('should handle payment with PayPal method', async () => {
      console.log('\n === SCÉNARIO: Paiement via PayPal ===');

      const { userId } = await createTestUser('Paul PayPal');
      const orgId = await createTestOrganization('Association Féline');

      const paymentData = {
        organizationId: orgId,
        userId: userId,
        amount: 25.50,
        currency: 'EUR',
        status: 'pending',
        payment_method: 'paypal'
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      console.log('Paiement PayPal:', JSON.stringify(res.body, null, 2));

      assert.equal(res.status, 201);
      assert.equal(res.body.created.payment_method, 'paypal');
      assert.equal(res.body.created.amount, 25.50);
      
      console.log('Paiement PayPal traité avec succès');
    });

    it('should handle payment with bank transfer', async () => {
      console.log('\n === SCÉNARIO: Paiement par virement bancaire ===');

      const { userId } = await createTestUser('Sophie Virement');
      const orgId = await createTestOrganization('Refuge Canin');

      const paymentData = {
        organizationId: orgId,
        userId: userId,
        amount: 100.00,
        currency: 'EUR',
        status: 'processing',
        payment_method: 'virement_bancaire'
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      console.log('Virement bancaire:', JSON.stringify(res.body, null, 2));

      assert.equal(res.status, 201);
      assert.equal(res.body.created.payment_method, 'virement_bancaire');
      assert.equal(res.body.created.status, 'processing');
      
      console.log('Virement bancaire initié avec succès');
    });
  });

  describe('Scénario 3: Gestion des erreurs de paiement', () => {
    it('should handle payment with insufficient data', async () => {
      console.log('\n === SCÉNARIO: Gestion des erreurs - données manquantes ===');

      const incompletePayment = {
        amount: 50.00,
        currency: 'EUR'
      };

      const res = await request(app)
        .post('/payments')
        .send(incompletePayment)
        .set('Accept', 'application/json');

      console.log('Erreur données manquantes:', JSON.stringify(res.body, null, 2));

      assert.ok(res.status >= 400, 'Devrait retourner une erreur pour données incomplètes');
      
      console.log('Erreur correctement gérée pour données manquantes');
    });

    it('should handle payment with invalid user', async () => {
      console.log('\n === SCÉNARIO: Gestion des erreurs - utilisateur inexistant ===');

      const orgId = await createTestOrganization('Test Error Org');

      const invalidPayment = {
        organizationId: orgId,
        userId: 'user_inexistant_12345',
        amount: 30.00,
        currency: 'EUR',
        status: 'pending',
        payment_method: 'carte_bancaire'
      };

      const res = await request(app)
        .post('/payments')
        .send(invalidPayment)
        .set('Accept', 'application/json');

      console.log('Erreur utilisateur inexistant:', JSON.stringify(res.body, null, 2));

      assert.ok(res.status >= 400, 'Devrait retourner une erreur pour utilisateur inexistant');
      
      console.log('Erreur correctement gérée pour utilisateur inexistant');
    });
  });

  describe('Scénario 4: Suivi et gestion des paiements', () => {
    it('should retrieve payment details by ID', async () => {
      console.log('\n === SCÉNARIO: Consultation des détails d\'un paiement ===');

      const { userId } = await createTestUser('Alice Tracker');
      const orgId = await createTestOrganization('Suivi Payments Org');

      const paymentData = {
        organizationId: orgId,
        userId: userId,
        amount: 75.00,
        currency: 'EUR',
        status: 'completed',
        payment_method: 'carte_bancaire'
      };

      const createRes = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      const paymentId = createRes.body.created.id;
      console.log(`Paiement créé avec ID: ${paymentId}`);

      const detailsRes = await request(app)
        .get(`/payments/${paymentId}`)
        .set('Accept', 'application/json');

      console.log('Détails du paiement:', JSON.stringify(detailsRes.body, null, 2));

      assert.equal(detailsRes.status, 200);
      assert.ok(detailsRes.body.payment);
      assert.equal(detailsRes.body.payment.id, paymentId);
      assert.equal(detailsRes.body.payment.amount, 75.00);
      assert.equal(detailsRes.body.payment.status, 'completed');

      console.log('Détails du paiement récupérés avec succès');
    });

    it('should return 404 for non-existent payment', async () => {
      console.log('\n === SCÉNARIO: Paiement inexistant ===');

      const res = await request(app)
        .get('/payments/99999')
        .set('Accept', 'application/json');

      console.log('Paiement inexistant:', JSON.stringify(res.body, null, 2));

      assert.equal(res.status, 404);
      assert.equal(res.body.error, 'Payment not found');

      console.log('Erreur 404 correctement retournée');
    });
  });

  describe('Scénario 5: Don mensuel récurrent', () => {
    it('should simulate monthly recurring donation setup', async () => {
      console.log('\n === SCÉNARIO: Mise en place d\'un don mensuel récurrent ===');

      const { userId } = await createTestUser('Donateur Récurrent');
      const orgId = await createTestOrganization('Association Récurrente');

      const monthlyPayments = [
        { month: 'Janvier', amount: 20.00 },
        { month: 'Février', amount: 20.00 },
        { month: 'Mars', amount: 20.00 }
      ];

      const createdPayments: any[] = [];

      for (const monthlyPayment of monthlyPayments) {
        console.log(`\n Traitement du don de ${monthlyPayment.month}...`);
        
        const paymentData = {
          organizationId: orgId,
          userId: userId,
          amount: monthlyPayment.amount,
          currency: 'EUR',
          status: 'completed',
          payment_method: 'prelevement_automatique'
        };

        const res = await request(app)
          .post('/payments')
          .send(paymentData)
          .set('Accept', 'application/json');

        assert.equal(res.status, 201);
        createdPayments.push(res.body.created);
        
        console.log(`Don de ${monthlyPayment.month}: ${monthlyPayment.amount}€ traité`);
      }

      console.log('\n Vérification de l\'historique des dons récurrents...');
      
      const historyRes = await request(app)
        .get('/payments')
        .set('Accept', 'application/json');

      const userPayments = historyRes.body.payments.filter(
        (p: any) => String(p.userId) === String(userId) && String(p.organizationId) === String(orgId)
      );

      assert.equal(userPayments.length, 3, 'Devrait avoir 3 paiements récurrents');
      
      const totalDonated = userPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
      assert.equal(totalDonated, 60.00, 'Total des dons devrait être 60€');

      console.log(`Don récurrent configuré: 3 paiements pour un total de ${totalDonated}€`);
    });
  });
});
