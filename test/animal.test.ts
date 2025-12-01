import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

// tests pour la table Animal

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

  return res.body.created.organization_id;
}

describe('App functional tests', () => {
  before(async () => {
    await syncDatabase();
  });
  it('GET / should return greeting', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  it('POST /animals should create an animal', async () => {
    const organizationId = await createTestOrganization('Animal Shelter');

    const animalData = {
      organizationId: organizationId,
      type: 'Cat',
      size: 'Small',
      genre: 'Female',
      breed: 'Siamese',
      age: 'Kitten',
      description: 'A cute kitten',
      status: 'Available',
      color: 'Gray',
      coat: 'Short',
      name: 'Whiskers',
      good_with_children: true,
      good_with_dogs: false,
      good_with_cats: true,
      house_trained: true,
      declawed: false,
      special_needs: 'None',
    };

    const res = await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 201);
    assert.ok(res.body.created);
    assert.equal(res.body.created.type, animalData.type);
    assert.equal(res.body.created.size, animalData.size);
    assert.equal(res.body.created.genre, animalData.genre);
    assert.equal(res.body.created.breed, animalData.breed);
    assert.equal(res.body.created.age, animalData.age);
    assert.equal(res.body.created.description, animalData.description);
    assert.equal(res.body.created.status, animalData.status);
    assert.equal(res.body.created.color, animalData.color);
    assert.equal(res.body.created.coat, animalData.coat);
    assert.equal(res.body.created.name, animalData.name);
    assert.equal(res.body.created.good_with_children, animalData.good_with_children);
    assert.equal(res.body.created.good_with_dogs, animalData.good_with_dogs);
    assert.equal(res.body.created.good_with_cats, animalData.good_with_cats);
    assert.equal(res.body.created.house_trained, animalData.house_trained);
    assert.equal(res.body.created.declawed, animalData.declawed);
    assert.equal(res.body.created.special_needs, animalData.special_needs);
  });

  it('GET /animals should return all animals', async () => {
    const organizationId = await createTestOrganization('Pet Shelter');
  
    const animalData = {
      organizationId: organizationId,
      type: 'Dog',
      size: 'Large',
      genre: 'Male',
      breed: 'Golden Retriever',
      age: 'Adult',
      description: 'A friendly dog',
      status: 'Available',
      color: 'Golden',
      coat: 'Long',
      name: 'Buddy',
      good_with_children: true,
      good_with_dogs: true,
      good_with_cats: false,
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

    assert.equal(res.status, 200);
    assert.ok(res.body.animals);
    assert.ok(Array.isArray(res.body.animals));
    assert.ok(res.body.animals.length > 0);
  });

  it('GET /animals/:id should return a specific animal', async () => {
    const organizationId = await createTestOrganization('Rabbit Shelter');

    const animalData = {
      organizationId: organizationId,
      type: 'Rabbit',
      size: 'Small',
      genre: 'Female',
      breed: 'Holland Lop',
      age: 'Young',
      description: 'A cute rabbit',
      status: 'Available',
      color: 'White',
      coat: 'Short',
      name: 'Snowball',
      good_with_children: true,
      good_with_dogs: false,
      good_with_cats: false,
      house_trained: true,
      declawed: false,
      special_needs: 'Quiet environment'
    };

    const createRes = await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    const animalId = createRes.body.created.id;

  
    const res = await request(app)
      .get(`/animals/${animalId}`)
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.animal);
    assert.equal(res.body.animal.id, animalId);
    assert.equal(res.body.animal.name, animalData.name);
    assert.equal(res.body.animal.type, animalData.type);
    assert.equal(res.body.animal.breed, animalData.breed);
  });

  it('GET /animals/:id should return 404 for non-existent animal', async () => {
    const res = await request(app)
      .get('/animals/99999')
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
    assert.equal(res.body.error, 'Animal not found');
  });

  it('PUT /animals/:id should update an animal', async () => {
    const organizationId = await createTestOrganization('Cat Rescue Center');
  
    const animalData = {
      organizationId: organizationId,
      type: 'Cat',
      size: 'Medium',
      genre: 'Male',
      breed: 'Persian',
      age: 'Senior',
      description: 'An old cat',
      status: 'Available',
      color: 'Black',
      coat: 'Long',
      name: 'Shadow',
      good_with_children: false,
      good_with_dogs: false,
      good_with_cats: true,
      house_trained: true,
      declawed: false,
      special_needs: 'Medical needs'
    };

    const createRes = await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    const animalId = createRes.body.created.id;

    const updateData = {
      name: 'Shadow Updated',
      status: 'Adopted',
      description: 'An old cat - now adopted!'
    };

    const res = await request(app)
      .put(`/animals/${animalId}`)
      .send(updateData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.updated);
    assert.equal(res.body.updated.name, updateData.name);
    assert.equal(res.body.updated.status, updateData.status);
    assert.equal(res.body.updated.description, updateData.description);
    assert.equal(res.body.updated.type, animalData.type);
    assert.equal(res.body.updated.breed, animalData.breed);
  });

  it('PUT /animals/:id should return 404 for non-existent animal', async () => {
    const updateData = { name: 'Updated Name' };

    const res = await request(app)
      .put('/animals/99999')
      .send(updateData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
    assert.equal(res.body.error, 'Animal not found');
  });

  it('DELETE /animals/:id should delete an animal', async () => {
    const organizationId = await createTestOrganization('Bird Sanctuary');

    const animalData = {
      organizationId: organizationId,
      type: 'Bird',
      size: 'Small',
      genre: 'Female',
      breed: 'Canary',
      age: 'Young',
      description: 'A singing bird',
      status: 'Available',
      color: 'Yellow',
      coat: 'Feathers',
      name: 'Tweety',
      good_with_children: true,
      good_with_dogs: false,
      good_with_cats: false,
      house_trained: false,
      declawed: false,
      special_needs: 'Cage required'
    };

    const createRes = await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    const animalId = createRes.body.created.id;

    const res = await request(app)
      .delete(`/animals/${animalId}`)
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.message);
    assert.equal(res.body.message, 'Animal deleted successfully');

    const getRes = await request(app)
      .get(`/animals/${animalId}`)
      .set('Accept', 'application/json');

    assert.equal(getRes.status, 404);
  });

  it('DELETE /animals/:id should return 404 for non-existent animal', async () => {
    const res = await request(app)
      .delete('/animals/99999')
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
    assert.equal(res.body.error, 'Animal not found');
  });

  it('POST /animals should handle missing required fields gracefully', async () => {
    const organizationId = await createTestOrganization('Incomplete Test Org');

    const incompleteData = {
      organizationId: organizationId,
      type: 'Cat'
    };

    const res = await request(app)
      .post('/animals')
      .send(incompleteData)
      .set('Accept', 'application/json');

    assert.ok(res.status >= 400);
  });

  it('GET /animals should return animals with their organizations', async () => {
    const organizationData = {
      name: 'Test Animal Organization',
      email: 'test@animalorg.com',
      phone: '555-0123',
      address: '123 Animal St',
      city: 'Pet City',
      state: 'PC',
      postcode: '12345',
      country: 'USA',
      hours: 'Daily 8AM-6PM',
      url: 'https://testanimalorg.com',
      website: 'https://testanimalorg.com',
      facebook: 'testanimalorg',
      pinterest: 'testanimalorg',
      x: 'testanimalorg',
      youtube: 'testanimalorg',
      instagram: 'testanimalorg',
      photos_url: 'https://testanimalorg.com/photos'
    };

    const orgRes = await request(app)
      .post('/organizations')
      .send(organizationData)
      .set('Accept', 'application/json');

    const organizationId = orgRes.body.created.organization_id;

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
      name: 'BuddyTestAnimalOrg', 
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

    assert.equal(res.status, 200);
    assert.ok(res.body.animals);
    assert.ok(Array.isArray(res.body.animals));
    
    const animal = res.body.animals.find((a: any) => a.name === animalData.name);
    assert.ok(animal, 'Animal should be found');
    assert.ok(animal.organization, 'Animal should have organization data');
    assert.equal(animal.organization.name, 'Test Animal Organization');
    assert.equal(animal.organization.email, organizationData.email);
    assert.equal(animal.organizationId, organizationId);
  });

  it('GET /animals/:id should return animal with organization details', async () => {
    const organizationData = {
      name: 'Specific Test Organization',
      email: 'specific@testorg.com',
      phone: '555-9876',
      address: '456 Specific St',
      city: 'Specific City',
      state: 'SC',
      postcode: '54321',
      country: 'USA',
      hours: 'Mon-Fri 9AM-5PM',
      url: 'https://specifictest.com',
      website: 'https://specifictest.com',
      facebook: 'specifictest',
      pinterest: 'specifictest',
      x: 'specifictest',
      youtube: 'specifictest',
      instagram: 'specifictest',
      photos_url: 'https://specifictest.com/photos'
    };

    const orgRes = await request(app)
      .post('/organizations')
      .send(organizationData)
      .set('Accept', 'application/json');

    const organizationId = orgRes.body.created.organization_id;

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

    assert.equal(res.status, 200);
    assert.ok(res.body.animal);
    assert.ok(res.body.animal.organization, 'Animal should include organization details');
    assert.equal(res.body.animal.organization.name, organizationData.name);
    assert.equal(res.body.animal.organization.email, organizationData.email);
    assert.equal(res.body.animal.organization.phone, organizationData.phone);
    assert.equal(res.body.animal.organizationId, organizationId);
  });
});
