import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

// tests pour la table Organization

describe('App functional tests', () => {
  // Synchroniser la base de données avant tous les tests
  before(async () => {
    await syncDatabase();
  });
  it('GET / should return greeting', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  it('POST /organizations should create an organization', async () => {
    const organizationData = {
      organizationId: 'org123',
      name: 'Happy Tails Shelter',
      phone: '555-1234',
      email: 'info@happytails.org',
      website: 'https://www.happytails.org',
      address: '1234 Bark Ave, Dogtown, DT 56789',
      city: 'Dogtown',
      state: 'DT',
      postcode: '56789',
      country: 'USA',
      hours: 'Mon-Fri 9am-5pm',
      url: 'https://www.happytails.org',
      facebook: 'happytailsfb',
      pinterest: 'happytailspin',
      x: 'happytailsx',
      youtube: 'happytailsyt',
      instagram: 'happytailsig',
      photos_url: 'https://www.happytails.org/photos'
    };

    const res = await request(app)
      .post('/organizations')
      .send(organizationData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 201);
    assert.ok(res.body.created);
    assert.equal(res.body.created.name, organizationData.name);
    assert.equal(res.body.created.phone, organizationData.phone);
    assert.equal(res.body.created.email, organizationData.email);
    assert.equal(res.body.created.website, organizationData.website);
    assert.equal(res.body.created.address, organizationData.address);
    assert.equal(res.body.created.city, organizationData.city);
    assert.equal(res.body.created.state, organizationData.state);
    assert.equal(res.body.created.postcode, organizationData.postcode);
    assert.equal(res.body.created.country, organizationData.country);
    assert.equal(res.body.created.hours, organizationData.hours);
    assert.equal(res.body.created.url, organizationData.url);
    assert.equal(res.body.created.facebook, organizationData.facebook);
    assert.equal(res.body.created.pinterest, organizationData.pinterest);
    assert.equal(res.body.created.x, organizationData.x);
    assert.equal(res.body.created.youtube, organizationData.youtube);
    assert.equal(res.body.created.instagram, organizationData.instagram);
    assert.equal(res.body.created.photos_url, organizationData.photos_url);
  });

  it('GET /organizations should return all organizations', async () => {
    const organizationData = {
      name: 'Pet Haven Shelter',
      email: 'info@pethaven.org',
      phone: '+1-555-987-6543',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      postcode: '90210',
      country: 'USA',
      hours: 'Daily 8AM-8PM',
      url: 'https://pethaven.org',
      website: 'https://pethaven.org',
      facebook: 'https://facebook.com/pethaven',
      pinterest: 'https://pinterest.com/pethaven',
      x: 'https://x.com/pethaven',
      youtube: 'https://youtube.com/pethaven',
      instagram: 'https://instagram.com/pethaven',
      photos_url: 'https://pethaven.org/gallery'
    };

    await request(app)
      .post('/organizations')
      .send(organizationData)
      .set('Accept', 'application/json');

    const res = await request(app)
      .get('/organizations')
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.organizations);
    assert.ok(Array.isArray(res.body.organizations));
    assert.ok(res.body.organizations.length > 0);
  });

  it('GET /organizations/:id should return a specific organization', async () => {
    const organizationData = {
      name: 'Wildlife Sanctuary',
      email: 'help@wildlifesanctuary.org',
      phone: '+1-555-111-2222',
      address: '789 Forest Road',
      city: 'Denver',
      state: 'CO',
      postcode: '80202',
      country: 'USA',
      hours: 'Tue-Sun 10AM-5PM',
      url: 'https://wildlifesanctuary.org',
      website: 'https://wildlifesanctuary.org',
      facebook: 'https://facebook.com/wildlifesanctuary',
      pinterest: 'https://pinterest.com/wildlifesanctuary',
      x: 'https://x.com/wildlifesanctuary',
      youtube: 'https://youtube.com/wildlifesanctuary',
      instagram: 'https://instagram.com/wildlifesanctuary',
      photos_url: 'https://wildlifesanctuary.org/photos'
    };

    const createRes = await request(app)
      .post('/organizations')
      .send(organizationData)
      .set('Accept', 'application/json');

    const organizationId = createRes.body.created.organization_id;

    const res = await request(app)
      .get(`/organizations/${organizationId}`)
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.organization);
    assert.equal(res.body.organization.organization_id, organizationId);
    assert.equal(res.body.organization.name, organizationData.name);
    assert.equal(res.body.organization.email, organizationData.email);
    assert.equal(res.body.organization.city, organizationData.city);
  });

  it('GET /organizations/:id should return 404 for non-existent organization', async () => {
    const res = await request(app)
      .get('/organizations/99999')
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
    assert.equal(res.body.error, 'Organization not found');
  });

  it('PUT /organizations/:id should update an organization', async () => {
    const organizationData = {
      name: 'Cat Rescue Network',
      email: 'contact@catrescue.org',
      phone: '+1-555-333-4444',
      address: '321 Pine Street',
      city: 'Seattle',
      state: 'WA',
      postcode: '98101',
      country: 'USA',
      hours: 'Mon-Sat 9AM-7PM',
      url: 'https://catrescue.org',
      website: 'https://catrescue.org',
      facebook: 'https://facebook.com/catrescue',
      pinterest: '',
      x: 'https://x.com/catrescue',
      youtube: '',
      instagram: 'https://instagram.com/catrescue',
      photos_url: 'https://catrescue.org/cats'
    };

    const createRes = await request(app)
      .post('/organizations')
      .send(organizationData)
      .set('Accept', 'application/json');

    const organizationId = createRes.body.created.organization_id;

    const updateData = {
      name: 'Cat Rescue Network - Updated',
      phone: '+1-555-555-5555',
      hours: 'Daily 8AM-8PM'
    };

    const res = await request(app)
      .put(`/organizations/${organizationId}`)
      .send(updateData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.updated);
    assert.equal(res.body.updated.name, updateData.name);
    assert.equal(res.body.updated.phone, updateData.phone);
    assert.equal(res.body.updated.hours, updateData.hours);
    // Les autres champs doivent rester inchangés
    assert.equal(res.body.updated.email, organizationData.email);
    assert.equal(res.body.updated.city, organizationData.city);
  });

  it('PUT /organizations/:id should return 404 for non-existent organization', async () => {
    const updateData = {
      name: 'Non-existent Organization'
    };

    const res = await request(app)
      .put('/organizations/99999')
      .send(updateData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
    assert.equal(res.body.error, 'Organization not found');
  });

  it('DELETE /organizations/:id should delete an organization', async () => {
    const organizationData = {
      name: 'Temporary Shelter',
      email: 'temp@shelter.org',
      phone: '+1-555-777-8888',
      address: '999 Temp Street',
      city: 'Phoenix',
      state: 'AZ',
      postcode: '85001',
      country: 'USA',
      hours: 'By appointment only',
      url: 'https://tempshelter.org',
      website: 'https://tempshelter.org',
      facebook: '',
      pinterest: '',
      x: '',
      youtube: '',
      instagram: '',
      photos_url: ''
    };

    const createRes = await request(app)
      .post('/organizations')
      .send(organizationData)
      .set('Accept', 'application/json');

    const organizationId = createRes.body.created.organization_id;

    const res = await request(app)
      .delete(`/organizations/${organizationId}`)
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.message);
    assert.equal(res.body.message, 'Organization deleted successfully');

    // Vérifier que l'organisation a bien été supprimée
    const getRes = await request(app)
      .get(`/organizations/${organizationId}`)
      .set('Accept', 'application/json');

    assert.equal(getRes.status, 404);
  });

  it('DELETE /organizations/:id should return 404 for non-existent organization', async () => {
    const res = await request(app)
      .delete('/organizations/99999')
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
    assert.equal(res.body.error, 'Organization not found');
  });

  it('POST /organizations should handle missing required fields', async () => {
    const incompleteData = {
      email: 'incomplete@test.org'
      // name is missing, which is required
    };

    const res = await request(app)
      .post('/organizations')
      .send(incompleteData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 500);
    assert.ok(res.body.error);
  });
});
