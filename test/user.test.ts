import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';


// Tests fonctionnels pour la création de compte utilisateur

describe('User Account Creation - Functional Tests', () => {
  // Synchroniser la base de données avant tous les tests
  before(async () => {
    await syncDatabase();
  });
  it('GET / should return greeting', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  // Test 1: Création de compte avec toutes les données complètes
  it('should create a complete user account successfully', async () => {
    const userData = {
      name: 'Alice',
      surname: 'Dupont',
      email: `alice.dupont+${Date.now()}@example.com`, 
      password: 'MotDePasse123!',
      isActive: true,
      role: 'user',
      profilePictureUrl: 'https://example.com/alice-profile.jpg',
      bio: 'Passionnée par les animaux et leur bien-être.',
      dateOfBirth: new Date('1985-05-15T00:00:00.000Z'), 
      phoneNumber: '+33123456789',
      address: '123 Rue de la Paix',
      city: 'Paris',
      state: 'Île-de-France',
      country: 'France',
      postalCode: '75001',
      preferences: { theme: 'light', notifications: true, language: 'fr' }, 
    };

    const res = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    console.log('\n Complete account creation response:', JSON.stringify(res.body, null, 2));

    assert.equal(res.status, 201, 'Should return 201 Created status');
    assert.ok(res.body.created, 'Should return created user object');
    
    const created = res.body.created;
    assert.equal(created.name, userData.name, 'Name should match');
    assert.equal(created.surname, userData.surname, 'Surname should match');
    assert.equal(created.email, userData.email, 'Email should match');
    assert.equal(created.isActive, userData.isActive, 'Active status should match');
    assert.equal(created.role, userData.role, 'Role should match');
    assert.equal(created.phoneNumber, userData.phoneNumber, 'Phone number should match');
    assert.equal(created.address, userData.address, 'Address should match');
    assert.equal(created.city, userData.city, 'City should match');
    assert.equal(created.country, userData.country, 'Country should match');
    assert.ok(created.id, 'Should have an auto-generated ID');
    assert.ok(created.createdAt, 'Should have creation timestamp');
  });

  // Test 2: Création de compte avec données minimales requises
  it('should create user account with minimal required data', async () => {
    const minimalUserData = {
      name: 'Bob',
      surname: 'Martin',
      email: `bob.martin+${Date.now()}@example.com`,
      password: 'SimplePassword123'
    };

    const res = await request(app)
      .post('/users')
      .send(minimalUserData)
      .set('Accept', 'application/json');

    console.log('\n Minimal account creation response:', JSON.stringify(res.body, null, 2));

    assert.equal(res.status, 201, 'Should create user with minimal data');
    assert.ok(res.body.created, 'Should return created user');
    
    const created = res.body.created;
    assert.equal(created.name, minimalUserData.name);
    assert.equal(created.surname, minimalUserData.surname);
    assert.equal(created.email, minimalUserData.email);
    assert.equal(created.password, minimalUserData.password);
    
    // Vérifier les valeurs par défaut
    assert.ok(typeof created.isActive === 'boolean', 'Should have default isActive value');
    assert.ok(typeof created.role === 'string', 'Should have default role value');
  });

  // Test 3: Validation d'email unique
  it('should prevent creation of duplicate email accounts', async () => {
    const duplicateEmail = `unique.test+${Date.now()}@example.com`;
    
    const firstUser = {
      name: 'Premier',
      surname: 'Utilisateur',
      email: duplicateEmail,
      password: 'password123'
    };

    const secondUser = {
      name: 'Deuxième',
      surname: 'Utilisateur',
      email: duplicateEmail, // Même email
      password: 'autrePassword456'
    };

    // Créer le premier utilisateur
    const firstRes = await request(app)
      .post('/users')
      .send(firstUser)
      .set('Accept', 'application/json');

    assert.equal(firstRes.status, 201, 'First user should be created successfully');

    // Tentative de créer le deuxième utilisateur avec le même email
    const secondRes = await request(app)
      .post('/users')
      .send(secondUser)
      .set('Accept', 'application/json');

    console.log('\n Duplicate email response:', JSON.stringify(secondRes.body, null, 2));

    assert.ok(secondRes.status >= 400, 'Should fail when creating duplicate email');
  });

  // Test 4: Validation des données manquantes
  it('should handle missing required fields gracefully', async () => {
    const incompleteUserData = {
      name: 'Incomplete',
      // Manque surname, email, password
    };

    const res = await request(app)
      .post('/users')
      .send(incompleteUserData)
      .set('Accept', 'application/json');

    console.log('\n Missing fields response:', JSON.stringify(res.body, null, 2));

    assert.ok(res.status >= 400, 'Should fail when required fields are missing');
  });

  // Test 5: Validation du format d'email
  it('should validate email format', async () => {
    const invalidEmailData = {
      name: 'Test',
      surname: 'User',
      email: 'invalid-email-format', // Email invalide
      password: 'password123'
    };

    const res = await request(app)
      .post('/users')
      .send(invalidEmailData)
      .set('Accept', 'application/json');

    console.log('\n Invalid email response:', JSON.stringify(res.body, null, 2));

    assert.ok(res.status >= 400, 'Should fail with invalid email format');
  });

  // Test 6: Test avec des caractères spéciaux et accents français
  it('should handle French characters and special characters correctly', async () => {
    const frenchUserData = {
      name: 'François',
      surname: 'Müller',
      email: `françois.müller+${Date.now()}@example.fr`,
      password: 'MotDePasse123!',
      bio: 'J\'adore les animaux domestiques et je souhaite adopter un chien éventuellement.',
      city: 'Strasbourg',
      country: 'France'
    };

    const res = await request(app)
      .post('/users')
      .send(frenchUserData)
      .set('Accept', 'application/json');

    console.log('\n French characters response:', JSON.stringify(res.body, null, 2));

    assert.equal(res.status, 201, 'Should handle French characters correctly');
    
    const created = res.body.created;
    assert.equal(created.name, frenchUserData.name);
    assert.equal(created.surname, frenchUserData.surname);
    assert.equal(created.email, frenchUserData.email);
    assert.equal(created.bio, frenchUserData.bio);
  });

  // Test 7: Test avec des préférences JSON complexes
  it('should handle complex JSON preferences correctly', async () => {
    const userWithPreferences = {
      name: 'Tech',
      surname: 'Savvy',
      email: `tech.savvy+${Date.now()}@example.com`,
      password: 'TechPassword123',
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        language: 'fr',
        animalPreferences: {
          types: ['dog', 'cat'],
          sizes: ['medium', 'large'],
          ages: ['adult']
        },
        searchRadius: 50,
        contactMethods: ['email', 'phone']
      }
    };

    const res = await request(app)
      .post('/users')
      .send(userWithPreferences)
      .set('Accept', 'application/json');

    console.log('\n Complex preferences response:', JSON.stringify(res.body, null, 2));

    assert.equal(res.status, 201, 'Should handle complex preferences');
    
    const created = res.body.created;
    assert.ok(created.preferences, 'Should have preferences stored');
  });
});
