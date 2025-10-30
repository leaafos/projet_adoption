import request from 'supertest';
import assert from 'assert';
import { app } from '../src/routes/app';


// tests pour la table user

describe('App functional tests', () => {
  it('GET / should return greeting', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  it('POST /users should create a user', async () => {
    const userData = {
      name: 'John',
      surname: 'Doe',
      email: `john.doe+${Date.now()}@example.com`, 
      password: 'securepassword',
      isActive: true,
      role: 'user',
      profilePictureUrl: 'https://example.com/profile.jpg',
      bio: 'Just a regular user.',
      dateOfBirth: new Date('1990-01-01T00:00:00.000Z'), 
      phoneNumber: '123-456-7890',
      address: '123 Main St, Anytown, USA',
      city: 'Anytown',
      state: 'CA',
      country: 'USA',
      postalCode: '12345',
      preferences: { theme: 'dark', notifications: true }, 
    };


    const res = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 201);
    const created = res.body.created ?? res.body;

    assert.ok(created);
    assert.equal(created.name, userData.name);
    assert.equal(created.surname, userData.surname);
    assert.equal(created.email, userData.email);
    assert.equal(created.isActive, userData.isActive);
    assert.equal(created.role, userData.role);
    assert.equal(created.profilePictureUrl, userData.profilePictureUrl);
    assert.equal(created.bio, userData.bio);
    assert.equal(created.phoneNumber, userData.phoneNumber);
    assert.equal(created.address, userData.address);
    assert.equal(created.city, userData.city);
    assert.equal(created.state, userData.state);
    assert.equal(created.country, userData.country);
    assert.equal(created.postalCode, userData.postalCode);
    assert.equal(new Date(created.dateOfBirth).toISOString(), userData.dateOfBirth.toISOString());
    assert.deepStrictEqual(created.preferences, userData.preferences);
    assert.equal(created.password, userData.password);
  });
});
