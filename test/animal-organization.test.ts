import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

// tests pour tester les animaux avec leurs organisations

describe('Animals with Organizations API tests', () => {
  before(async () => {
    await syncDatabase();
  });

  async function createTestOrganization(name: string = 'Test Organization') {
    const organizationData = {
      name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@test.com`,
      phone: '555-0000',
      address: '123 Test St',
      city: 'Test City',
      state: 'TC',
      postcode: '00000',
      country: 'USA',
      hours: 'Daily 8AM-6PM',
      url: 'https://test.org',
      website: 'https://test.org',
      facebook: 'testorg',
      pinterest: 'testorg',
      x: 'testorg',
      youtube: 'testorg',
      instagram: 'testorg',
      photos_url: 'https://test.org/photos'
    };

    const res = await request(app)
      .post('/organizations')
      .send(organizationData)
      .set('Accept', 'application/json');

    if (res.status !== 201 || !res.body.created) {
      throw new Error(`Failed to create organization: ${JSON.stringify(res.body)}`);
    }

    return res.body.created.organization_id;
  }
  it('GET / should return greeting', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  it('GET /animals should return animals with their organizations', async () => {
    const organizationId = await createTestOrganization('Pet Haven Shelter');

    const animalData = {
      organizationId: organizationId,
      type: 'Dog',
      size: 'Medium',
      genre: 'Male',
      breed: 'Labrador',
      age: 'Adult',
      description: 'Friendly family dog',
      status: 'Available',
      color: 'Golden',
      coat: 'Short',
      name: 'Buddy',
      good_with_children: true,
      good_with_dogs: true,
      good_with_cats: true,
      house_trained: true,
      declawed: false,
      special_needs: 'None'
    };

    await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    const res = await request(app)
      .get('/animals')
      .set('Accept', 'application/json');

    console.log('\n🐕 GET /animals response:', JSON.stringify(res.body, null, 2));

    assert.equal(res.status, 200);
    assert.ok(res.body.animals);
    assert.ok(Array.isArray(res.body.animals));
    
    const animal = res.body.animals.find((a: any) => a.name === animalData.name);
    assert.ok(animal, 'Animal should be found');
    assert.ok(animal.organization, 'Animal should have organization data');
    assert.equal(animal.organization.name, 'Pet Haven Shelter');
    assert.equal(animal.organizationId, organizationId);
  });

  it('GET /animals/:id should return animal with organization details', async () => {
    const organizationId = await createTestOrganization('Cat Rescue Center');

    const animalData = {
      organizationId: organizationId,
      type: 'Cat',
      size: 'Small',
      genre: 'Female',
      breed: 'Siamese',
      age: 'Young',
      description: 'Beautiful Siamese cat',
      status: 'Available',
      color: 'Cream',
      coat: 'Short',
      name: 'Luna',
      good_with_children: true,
      good_with_dogs: false,
      good_with_cats: true,
      house_trained: true,
      declawed: false,
      special_needs: 'Indoor only'
    };

    const animalRes = await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    const animalId = animalRes.body.created.id;

    const res = await request(app)
      .get(`/animals/${animalId}`)
      .set('Accept', 'application/json');

    console.log('\n🐱 GET /animals/:id response:', JSON.stringify(res.body, null, 2));

    assert.equal(res.status, 200);
    assert.ok(res.body.animal);
    assert.ok(res.body.animal.organization, 'Animal should include organization details');
    assert.equal(res.body.animal.organization.name, 'Cat Rescue Center');
    assert.equal(res.body.animal.organizationId, organizationId);
    
    assert.ok(res.body.animal.organization.email);
    assert.ok(res.body.animal.organization.phone);
    assert.ok(res.body.animal.organization.address);
  });

  it('POST /animals with valid organizationId should create animal', async () => {
    const organizationId = await createTestOrganization('Wildlife Sanctuary');

    const animalData = {
      organizationId: organizationId,
      type: 'Rabbit',
      size: 'Small',
      genre: 'Male',
      breed: 'Holland Lop',
      age: 'Young',
      description: 'Cute bunny',
      status: 'Available',
      color: 'White',
      coat: 'Fluffy',
      name: 'Snowball',
      good_with_children: true,
      good_with_dogs: false,
      good_with_cats: false,
      house_trained: true,
      declawed: false,
      special_needs: 'Quiet environment'
    };

    const res = await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    console.log('\n🐰 POST /animals response:', JSON.stringify(res.body, null, 2));

    assert.equal(res.status, 201);
    assert.ok(res.body.created);
    assert.equal(res.body.created.organizationId, organizationId);
    assert.equal(res.body.created.name, animalData.name);
  });

  it('POST /animals with invalid organizationId should fail', async () => {
    const animalData = {
      organizationId: 99999, 
      type: 'Dog',
      size: 'Large',
      genre: 'Male',
      breed: 'German Shepherd',
      age: 'Adult',
      description: 'Guard dog',
      status: 'Available',
      color: 'Black',
      coat: 'Long',
      name: 'Rex',
      good_with_children: true,
      good_with_dogs: true,
      good_with_cats: false,
      house_trained: true,
      declawed: false,
      special_needs: 'Large yard needed'
    };

    const res = await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    console.log('\n❌ POST /animals with invalid org response:', JSON.stringify(res.body, null, 2));

    assert.ok(res.status >= 400, 'Should fail with invalid organization ID');
  });

  it('GET /animals should include all organization details', async () => {
    const organizationId = await createTestOrganization('Complete Test Org');

    const animalData = {
      organizationId: organizationId,
      type: 'Bird',
      size: 'Small',
      genre: 'Female',
      breed: 'Parrot',
      age: 'Young',
      description: 'Colorful parrot',
      status: 'Available',
      color: 'Green',
      coat: 'Feathers',
      name: 'Polly',
      good_with_children: true,
      good_with_dogs: false,
      good_with_cats: false,
      house_trained: false,
      declawed: false,
      special_needs: 'Large cage'
    };

    await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    const res = await request(app)
      .get('/animals')
      .set('Accept', 'application/json');

    const animal = res.body.animals.find((a: any) => a.name === 'Polly');
    assert.ok(animal, 'Animal should be found');
    assert.ok(animal.organization, 'Animal should have organization');
    
    const org = animal.organization;
    assert.equal(org.name, 'Complete Test Org');
    assert.equal(org.email, 'completetestorg@test.com');
    assert.equal(org.phone, '555-0000');
    assert.equal(org.address, '123 Test St');
    assert.equal(org.city, 'Test City');
    assert.equal(org.state, 'TC');
    assert.equal(org.postcode, '00000');
    assert.equal(org.country, 'USA');
    assert.equal(org.hours, 'Daily 8AM-6PM');
    assert.equal(org.url, 'https://test.org');
    assert.equal(org.website, 'https://test.org');
    assert.ok(org.createdAt);
    assert.ok(org.updatedAt);
  });
});
