import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

// Test de validation des cartes bancaires - Scénarios réalistes

describe('Card Validation - Realistic Payment Scenarios', () => {
  before(async function() {
    this.timeout(10000);
    await syncDatabase();
  });

  const createTestUser = async () => {
    const userData = {
      name: 'Test',
      surname: 'User',
      email: `test.user.${Date.now()}@example.com`,
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const res = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    return res.body.created;
  };

  const createTestOrganization = async () => {
    const orgData = {
      name: `Test Org ${Date.now()}`,
      phone: '555-0000',
      email: `test.org.${Date.now()}@example.com`,
      website: 'https://www.testorg.com',
      address: '123 Test St',
      city: 'Testville',
      state: 'TS',
      postcode: '12345',
      country: 'USA',
      hours: 'Mon-Fri 9am-5pm',
      url: 'https://www.testorg.com',
      facebook: 'testorg',
      pinterest: 'testorg',
      x: 'testorg',
      youtube: 'testorg',
      instagram: 'testorg',
      photos_url: 'https://www.testorg.com/photos'
    };

    const res = await request(app)
      .post('/organizations')
      .send(orgData)
      .set('Accept', 'application/json');

    return res.body.created;
  };

  describe('Cartes refusées - Scénarios d\'échec', () => {
    it('should reject payment with stolen/blocked card', async function() {
      this.timeout(10000);
      
      const user = await createTestUser();
      const org = await createTestOrganization();

      console.log('Tentative de paiement avec carte bloquée...');

      const paymentData = {
        organizationId: org.organization_id.toString(),
        userId: user.id.toString(),
        amount: 100,
        currency: 'eur',
        payment_method: 'carte_bancaire',
        cardNumber: '4000000000000002', // Carte bloquée
        cardExpiry: '12/25',
        cardCvc: '123'
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(res.status, 400);
      assert.ok(res.body.error.includes('refusée par la banque'));
      console.log('Paiement correctement refusé:', res.body.error);
    });

    it('should reject payment with expired card', async function() {
      this.timeout(10000);
      
      const user = await createTestUser();
      const org = await createTestOrganization();

      console.log('Tentative de paiement avec carte expirée...');

      const paymentData = {
        organizationId: org.organization_id.toString(),
        userId: user.id.toString(),
        amount: 50,
        currency: 'eur',
        payment_method: 'carte_bancaire',
        cardNumber: '4000000000000051', 
        cardExpiry: '01/20', // Expirée
        cardCvc: '123'
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(res.status, 400);
      assert.ok(res.body.error.includes('refusée par la banque'));
      console.log('Carte expirée correctement détectée');
    });

    it('should reject payment with fake card number', async function() {
      this.timeout(10000);
      
      const user = await createTestUser();
      const org = await createTestOrganization();

      console.log('Tentative de paiement avec numéro de carte factice...');

      const paymentData = {
        organizationId: org.organization_id.toString(),
        userId: user.id.toString(),
        amount: 25,
        currency: 'eur',
        payment_method: 'carte_bancaire',
        cardNumber: '1234567890123456', // Numéro factice
        cardExpiry: '12/25',
        cardCvc: '123'
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(res.status, 400);
      assert.ok(res.body.error.includes('refusée par la banque'));
      console.log('Numéro de carte factice correctement détecté');
    });

    it('should reject payment with invalid format', async function() {
      this.timeout(10000);
      
      const user = await createTestUser();
      const org = await createTestOrganization();

      console.log('Tentative de paiement avec format invalide...');

      const paymentData = {
        organizationId: org.organization_id.toString(),
        userId: user.id.toString(),
        amount: 75,
        currency: 'eur',
        payment_method: 'carte_bancaire',
        cardNumber: 'abcd-1234-efgh-5678', // Format invalide
        cardExpiry: '12/25',
        cardCvc: '123'
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(res.status, 400);
      assert.ok(res.body.error.includes('Numéro de carte invalide'));
      console.log('Format de carte invalide correctement détecté');
    });
  });

  describe('Cartes acceptées - Scénarios de succès', () => {
    it('should accept payment with valid Visa card', async function() {
      this.timeout(10000);
      
      const user = await createTestUser();
      const org = await createTestOrganization();

      console.log('Paiement avec carte Visa valide...');

      const paymentData = {
        organizationId: org.organization_id.toString(),
        userId: user.id.toString(),
        amount: 100,
        currency: 'eur',
        payment_method: 'carte_bancaire',
        cardNumber: '4242424242424242', // Visa test valide
        cardExpiry: '12/25',
        cardCvc: '123'
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(res.status, 201);
      assert.ok(res.body.created);
      assert.equal(res.body.created.amount, 100);
      console.log('Paiement Visa réussi!');
    });

    it('should accept payment with valid Mastercard', async function() {
      this.timeout(10000);
      
      const user = await createTestUser();
      const org = await createTestOrganization();

      console.log('Paiement avec carte Mastercard valide...');

      const paymentData = {
        organizationId: org.organization_id.toString(),
        userId: user.id.toString(),
        amount: 150,
        currency: 'eur',
        payment_method: 'carte_bancaire',
        cardNumber: '5555555555554444', // Mastercard test valide
        cardExpiry: '12/25',
        cardCvc: '123'
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(res.status, 201);
      assert.ok(res.body.created);
      assert.equal(res.body.created.amount, 150);
      console.log('Paiement Mastercard réussi!');
    });

    it('should accept payment with card number with spaces', async function() {
      this.timeout(10000);
      
      const user = await createTestUser();
      const org = await createTestOrganization();

      console.log('Paiement avec numéro de carte formaté (espaces)...');

      const paymentData = {
        organizationId: org.organization_id.toString(),
        userId: user.id.toString(),
        amount: 75,
        currency: 'eur',
        payment_method: 'carte_bancaire',
        cardNumber: '4242 4242 4242 4242', // Avec espaces
        cardExpiry: '12/25',
        cardCvc: '123'
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(res.status, 201);
      assert.ok(res.body.created);
      assert.equal(res.body.created.amount, 75);
      console.log('Numéro de carte avec espaces correctement traité!');
    });
  });

  describe('Méthodes de paiement alternatives', () => {
    it('should process PayPal without card validation', async function() {
      this.timeout(10000);
      
      const user = await createTestUser();
      const org = await createTestOrganization();

      console.log('Paiement via PayPal (pas de validation carte)...');

      const paymentData = {
        organizationId: org.organization_id.toString(),
        userId: user.id.toString(),
        amount: 200,
        currency: 'eur',
        payment_method: 'paypal',
        // Pas de cardNumber pour PayPal
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(res.status, 201);
      assert.ok(res.body.created);
      assert.equal(res.body.created.payment_method, 'paypal');
      console.log('Paiement PayPal traité sans validation de carte!');
    });

    it('should process bank transfer without card validation', async function() {
      this.timeout(10000);
      
      const user = await createTestUser();
      const org = await createTestOrganization();

      console.log('Paiement par virement bancaire...');

      const paymentData = {
        organizationId: org.organization_id.toString(),
        userId: user.id.toString(),
        amount: 500,
        currency: 'eur',
        payment_method: 'virement_bancaire',
        // Pas de cardNumber pour virement
      };

      const res = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(res.status, 201);
      assert.ok(res.body.created);
      assert.equal(res.body.created.payment_method, 'virement_bancaire');
      console.log('Virement bancaire traité sans validation de carte!');
    });
  });
});
