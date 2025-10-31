import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

process.env.NODE_ENV = 'test';

// tests pour la table Payment

describe('App functional tests', () => {
  const originalTimeout = 10000;
  
  before(async function() {
    this.timeout(originalTimeout);
    // Synchroniser la base de données avant de commencer les tests
    await syncDatabase();
  });

  it('GET / should return greeting', async function() {
    this.timeout(5000);
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  it('POST /payments should create a payment', async function() {
    this.timeout(10000);
    
    // D'abord créer un utilisateur pour le test
    const userData = {
      name: 'John',
      surname: 'Doe',
      email: 'john.doe.payment@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    // Ensuite créer une organisation pour le test
    const orgData = {
      name: 'Test Payment Org',
      phone: '555-1234',
      email: 'payment@testorg.com',
      website: 'https://www.testpaymentorg.com',
      address: '123 Payment St',
      city: 'Paymentville',
      state: 'PA',
      postcode: '12345',
      country: 'USA',
      hours: 'Mon-Fri 9am-5pm',
      url: 'https://www.testpaymentorg.com',
      facebook: 'testpaymentorg',
      pinterest: 'testpaymentorg',
      x: 'testpaymentorg',
      youtube: 'testpaymentorg',
      instagram: 'testpaymentorg',
      photos_url: 'https://www.testpaymentorg.com/photos'
    };

    const orgRes = await request(app)
      .post('/organizations')
      .send(orgData)
      .set('Accept', 'application/json');

    const paymentData = {
      organizationId: orgRes.body.created.organization_id.toString(), // Utiliser l'ID de l'organisation créée
      userId: userRes.body.created.id.toString(), 
      amount: 100,
      currency: 'usd',
      status: 'PENDING',
      payment_method: 'card',
      stripeId: 'pi_1234567890'
    };

    const res = await request(app)
      .post('/payments')
      .send(paymentData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 201);
    assert.ok(res.body.created);
    assert.equal(res.body.created.organizationId, paymentData.organizationId);
    assert.equal(res.body.created.userId, paymentData.userId);
    assert.equal(res.body.created.amount, paymentData.amount);
    assert.equal(res.body.created.currency, paymentData.currency);
    assert.equal(res.body.created.status, paymentData.status);
    assert.equal(res.body.created.payment_method, paymentData.payment_method);
    assert.equal(res.body.created.stripeId, paymentData.stripeId);
  });

  it('POST /payments should fail with non-existent user', async function() {
    this.timeout(10000);
    
    // Créer une organisation valide pour le test
    const orgData = {
      name: 'Valid Org for User Test',
      phone: '555-0000',
      email: 'valid@usertest.com',
      website: 'https://www.validusertest.com',
      address: '000 Valid St',
      city: 'Validville',
      state: 'VL',
      postcode: '00000',
      country: 'USA',
      hours: 'Mon-Fri 6am-8pm',
      url: 'https://www.validusertest.com',
      facebook: 'validusertest',
      pinterest: 'validusertest',
      x: 'validusertest',
      youtube: 'validusertest',
      instagram: 'validusertest',
      photos_url: 'https://www.validusertest.com/photos'
    };

    const orgRes = await request(app)
      .post('/organizations')
      .send(orgData)
      .set('Accept', 'application/json');
    
    const paymentData = {
      organizationId: orgRes.body.created.organization_id.toString(), // Utiliser une organisation valide
      userId: '99999', // Mais un utilisateur inexistant
      amount: 100,
      currency: 'usd',
      status: 'PENDING',
      payment_method: 'card',
      stripeId: 'pi_1234567890'
    };

    const res = await request(app)
      .post('/payments')
      .send(paymentData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 400);
    assert.ok(res.body.error);
    assert.ok(res.body.error.includes('User with ID 99999 not found'));
  });

  it('POST /payments should fail with non-existent organization', async function() {
    this.timeout(10000);
    
    const userData = {
      name: 'Jane',
      surname: 'Smith',
      email: 'jane.smith.payment@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    const paymentData = {
      organizationId: 'Non Existent Org', 
      userId: userRes.body.created.id.toString(),
      amount: 100,
      currency: 'usd',
      status: 'PENDING',
      payment_method: 'card',
      stripeId: 'pi_1234567890'
    };

    const res = await request(app)
      .post('/payments')
      .send(paymentData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 400);
    assert.ok(res.body.error);
    assert.ok(res.body.error.includes('Organization with ID Non Existent Org not found'));
  });

  it('GET /payments should return all payments', async function() {
    this.timeout(10000);
    
    // Créer un utilisateur pour le test
    const userData = {
      name: 'Test',
      surname: 'User',
      email: 'test.user.get@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    // Créer une organisation pour le test
    const orgData = {
      name: 'Test Get Org',
      phone: '555-5678',
      email: 'test@getorg.com',
      website: 'https://www.testgetorg.com',
      address: '456 Get St',
      city: 'Getville',
      state: 'GT',
      postcode: '54321',
      country: 'USA',
      hours: 'Mon-Fri 8am-6pm',
      url: 'https://www.testgetorg.com',
      facebook: 'testgetorg',
      pinterest: 'testgetorg',
      x: 'testgetorg',
      youtube: 'testgetorg',
      instagram: 'testgetorg',
      photos_url: 'https://www.testgetorg.com/photos'
    };

    const orgRes = await request(app)
      .post('/organizations')
      .send(orgData)
      .set('Accept', 'application/json');
    
    const paymentData = {
      organizationId: orgRes.body.created.organization_id.toString(),
      userId: userRes.body.created.id.toString(),
      amount: 200,
      currency: 'eur',
      status: 'PENDING',
      payment_method: 'card',
      stripeId: 'pi_test_get'
    };

    await request(app)
      .post('/payments')
      .send(paymentData)
      .set('Accept', 'application/json');

    const res = await request(app)
      .get('/payments')
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.payments);
    assert.ok(Array.isArray(res.body.payments));
    assert.ok(res.body.payments.length > 0);
  });

  it('GET /payments/:id should return a specific payment', async function() {
    this.timeout(10000);
    
    // Créer un utilisateur pour le test
    const userData = {
      name: 'Specific',
      surname: 'User',
      email: 'specific.user@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    // Créer une organisation pour le test
    const orgData = {
      name: 'Specific Test Org',
      phone: '555-9999',
      email: 'specific@testorg.com',
      website: 'https://www.specifictestorg.com',
      address: '789 Specific St',
      city: 'Specificville',
      state: 'SP',
      postcode: '67890',
      country: 'USA',
      hours: 'Mon-Fri 7am-7pm',
      url: 'https://www.specifictestorg.com',
      facebook: 'specifictestorg',
      pinterest: 'specifictestorg',
      x: 'specifictestorg',
      youtube: 'specifictestorg',
      instagram: 'specifictestorg',
      photos_url: 'https://www.specifictestorg.com/photos'
    };

    const orgRes = await request(app)
      .post('/organizations')
      .send(orgData)
      .set('Accept', 'application/json');
    
    const paymentData = {
      organizationId: orgRes.body.created.organization_id.toString(),
      userId: userRes.body.created.id.toString(),
      amount: 150,
      currency: 'usd',
      status: 'PENDING',
      payment_method: 'card',
      stripeId: 'pi_test_get_by_id'
    };

    const createRes = await request(app)
      .post('/payments')
      .send(paymentData)
      .set('Accept', 'application/json');

    const paymentId = createRes.body.created.id;

    const res = await request(app)
      .get(`/payments/${paymentId}`)
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.payment);
    assert.equal(res.body.payment.id, paymentId);
    assert.equal(res.body.payment.organizationId, paymentData.organizationId);
    assert.equal(res.body.payment.userId, paymentData.userId);
    assert.equal(res.body.payment.amount, paymentData.amount);
  });

  it('GET /payments/:id should return 404 for non-existent payment', async function() {
    this.timeout(5000);
    
    const res = await request(app)
      .get('/payments/99999')
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
    assert.equal(res.body.error, 'Payment not found');
  });
});

