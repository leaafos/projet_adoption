import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

// Tests de parcours fonctionnels pour la création de compte

describe('User Registration - Functional Journey Tests', () => {
  before(async () => {
    await syncDatabase();
  });

  describe('Parcours 1: Utilisateur novice souhaitant adopter un animal', () => {
    it('should complete full registration journey for new adopter', async () => {
      console.log('\n PARCOURS: Nouvel adoptant se créant un compte...');
      
      const newAdopterData = {
        name: 'Marie',
        surname: 'Leroy',
        email: `marie.leroy.adopter+${Date.now()}@gmail.com`,
        password: 'MonPremierAnimal2024!',
        phoneNumber: '06 12 34 56 78',
        address: '45 Avenue des Champs-Élysées',
        city: 'Paris',
        state: 'Île-de-France',
        country: 'France',
        postalCode: '75008',
        bio: 'Je souhaite adopter mon premier chien. J\'ai un appartement avec balcon et je travaille en télétravail.',
        preferences: {
          animalInterest: ['dogs'],
          experienceLevel: 'beginner',
          housingType: 'apartment',
          hasChildren: false,
          otherPets: false,
          workSchedule: 'remote'
        }
      };

      const registrationRes = await request(app)
        .post('/users')
        .send(newAdopterData)
        .set('Accept', 'application/json');

      console.log('Étape 1 - Inscription:', registrationRes.status);
      assert.equal(registrationRes.status, 201, 'Registration should succeed');
      
      const newUser = registrationRes.body.created;
      assert.ok(newUser.id, 'User should have an ID');
      assert.equal(newUser.email, newAdopterData.email, 'Email should match');
      console.log(`Nouvel utilisateur créé avec ID: ${newUser.id}`);

      const animalsRes = await request(app)
        .get('/animals')
        .set('Accept', 'application/json');

      console.log('Étape 2 - Consultation animaux:', animalsRes.status);
      assert.equal(animalsRes.status, 200, 'Should be able to view animals');
      console.log(`${animalsRes.body.animals?.length || 0} animaux disponibles`);
    });
  });

  describe('Parcours 2: Organisation créant un compte pour publier des animaux', () => {
    it('should complete registration journey for shelter organization', async () => {
      console.log('\n PARCOURS: Organisation refuge se créant un compte...');
      
      const shelterManagerData = {
        name: 'Jean',
        surname: 'Durand',
        email: `jean.durand.refuge+${Date.now()}@asso-refuge.org`,
        password: 'RefugeSecure2024!',
        role: 'organization_admin',
        phoneNumber: '01 45 67 89 10',
        address: '123 Rue du Refuge',
        city: 'Lyon',
        state: 'Auvergne-Rhône-Alpes',
        country: 'France',
        postalCode: '69001',
        bio: 'Responsable du refuge "Pattes d\'Amour" à Lyon. 15 ans d\'expérience dans la protection animale.',
        preferences: {
          role: 'shelter_manager',
          organizationType: 'animal_shelter',
          capacity: 50,
          specializations: ['dogs', 'cats', 'rabbits']
        }
      };

      const managerRes = await request(app)
        .post('/users')
        .send(shelterManagerData)
        .set('Accept', 'application/json');

      console.log('Étape 1 - Compte responsable créé:', managerRes.status);
      assert.equal(managerRes.status, 201, 'Manager account should be created');
      
      const manager = managerRes.body.created;
      console.log(`Responsable créé avec ID: ${manager.id}`);

      const organizationData = {
        name: 'Refuge Pattes d\'Amour',
        email: 'contact@pattes-amour.org',
        phone: '01 45 67 89 10',
        address: '123 Rue du Refuge, Lyon',
        city: 'Lyon',
        state: 'Auvergne-Rhône-Alpes',
        postcode: '69001',
        country: 'France',
        hours: 'Lundi-Samedi 9h-18h, Dimanche 10h-16h',
        url: 'https://www.pattes-amour.org',
        website: 'https://www.pattes-amour.org',
        facebook: 'refuge.pattes.amour',
        instagram: 'refuge_pattes_amour'
      };

      const orgRes = await request(app)
        .post('/organizations')
        .send(organizationData)
        .set('Accept', 'application/json');

      console.log('Étape 2 - Organisation créée:', orgRes.status);
      assert.equal(orgRes.status, 201, 'Organization should be created');
      
      const organization = orgRes.body.created;
      console.log(`   Organisation créée avec ID: ${organization.organization_id}`);

      const animalData = {
        organizationId: organization.organization_id,
        type: 'Dog',
        size: 'Medium',
        genre: 'Female',
        breed: 'Labrador Mix',
        age: 'Adult',
        description: 'Luna est une chienne très douce et affectueuse, parfaite pour une famille.',
        status: 'Available',
        color: 'Golden',
        coat: 'Short',
        name: 'Luna',
        good_with_children: true,
        good_with_dogs: true,
        good_with_cats: true,
        house_trained: true,
        declawed: false,
        special_needs: 'Aucun besoin spécial'
      };

      const animalRes = await request(app)
        .post('/animals')
        .send(animalData)
        .set('Accept', 'application/json');

      console.log('Étape 3 - Animal ajouté:', animalRes.status);
      assert.equal(animalRes.status, 201, 'Should be able to add animals');
      
      const animal = animalRes.body.created;
      console.log(`Animal "${animal.name}" ajouté avec ID: ${animal.id}`);
    });
  });

  describe('Parcours 3: Famille avec enfants cherchant un animal de compagnie', () => {
    it('should complete registration journey for family with specific needs', async () => {
      console.log('\n PARCOURS: Famille avec enfants cherchant un animal...');
      
      const familyUserData = {
        name: 'Pierre',
        surname: 'Martin',
        email: `pierre.martin.famille+${Date.now()}@outlook.fr`,
        password: 'FamilleAnimal2024!',
        phoneNumber: '07 89 12 34 56',
        address: '67 Rue des Familles',
        city: 'Toulouse',
        state: 'Occitanie',
        country: 'France',
        postalCode: '31000',
        bio: 'Papa de deux enfants (8 et 12 ans), nous cherchons un animal de compagnie pour la famille. Nous avons une maison avec jardin.',
        preferences: {
          familyComposition: {
            adults: 2,
            children: 2,
            childrenAges: [8, 12]
          },
          housing: {
            type: 'house',
            hasYard: true,
            size: 'large'
          },
          animalPreferences: {
            goodWithChildren: true,
            maxSize: 'large',
            energyLevel: 'medium',
            trainable: true
          },
          experience: 'some',
          timeAvailable: 'moderate'
        }
      };

      const familyRes = await request(app)
        .post('/users')
        .send(familyUserData)
        .set('Accept', 'application/json');

      console.log('Étape 1 - Compte famille créé:', familyRes.status);
      assert.equal(familyRes.status, 201, 'Family account should be created');
      
      const family = familyRes.body.created;
      console.log(`   Famille inscrite avec ID: ${family.id}`);

      const animalsRes = await request(app)
        .get('/animals')
        .set('Accept', 'application/json');

      console.log('Étape 2 - Recherche d\'animaux:', animalsRes.status);
      assert.equal(animalsRes.status, 200, 'Should be able to search animals');
      
      const animals = animalsRes.body.animals || [];
      const childFriendlyAnimals = animals.filter((animal: any) => 
        animal.good_with_children === true
      );
      
      console.log(`${childFriendlyAnimals.length} animaux compatibles avec les enfants trouvés`);
    });
  });

  describe('Parcours 4: Senior souhaitant adopter un animal de compagnie', () => {
    it('should complete registration journey for senior adopter', async () => {
      console.log('\n PARCOURS: Senior cherchant un compagnon...');
      
      const seniorUserData = {
        name: 'Monique',
        surname: 'Dubois',
        email: `monique.dubois.senior+${Date.now()}@orange.fr`,
        password: 'Compagnon2024!',
        phoneNumber: '05 67 89 01 23',
        address: '12 Rue de la Retraite',
        city: 'Nice',
        state: 'Provence-Alpes-Côte d\'Azur',
        country: 'France',
        postalCode: '06000',
        dateOfBirth: new Date('1945-03-20T00:00:00.000Z'),
        bio: 'Retraitée de 79 ans, je vis seule et j\'aimerais avoir un compagnon à quatre pattes pour me tenir compagnie. Je préfère les animaux calmes.',
        preferences: {
          ageGroup: 'senior',
          lifestyle: 'calm',
          mobilityLevel: 'limited',
          preferredAnimalTraits: {
            energyLevel: 'low',
            size: 'small_to_medium',
            age: 'senior',
            temperament: 'calm'
          },
          careCapacity: 'light',
          supportNeeded: false
        }
      };

      const seniorRes = await request(app)
        .post('/users')
        .send(seniorUserData)
        .set('Accept', 'application/json');

      console.log('Étape 1 - Compte senior créé:', seniorRes.status);
      assert.equal(seniorRes.status, 201, 'Senior account should be created');
      
      const senior = seniorRes.body.created;
      console.log(`   Senior inscrit avec ID: ${senior.id}`);
      
      const age = new Date().getFullYear() - new Date(senior.dateOfBirth).getFullYear();
      console.log(`Âge calculé: ${age} ans`);
      assert.ok(age >= 75, 'Should be in senior age range');

      const animalsRes = await request(app)
        .get('/animals')
        .set('Accept', 'application/json');

      console.log('Étape 2 - Recherche animaux seniors:', animalsRes.status);
      assert.equal(animalsRes.status, 200, 'Should be able to search animals');
    });
  });

  describe('Parcours 5: Gestion d\'erreurs et cas limites', () => {
    it('should handle registration failures gracefully', async () => {
      console.log('\n PARCOURS: Gestion des erreurs d\'inscription...');
      
      const existingEmail = `duplicate.test+${Date.now()}@example.com`;
      
      const firstUser = {
        name: 'Premier',
        surname: 'Utilisateur',
        email: existingEmail,
        password: 'password123'
      };

      const duplicateUser = {
        name: 'Deuxième',
        surname: 'Utilisateur',
        email: existingEmail, 
        password: 'autrePassword456'
      };

      const firstRes = await request(app)
        .post('/users')
        .send(firstUser)
        .set('Accept', 'application/json');

      console.log('Premier utilisateur créé:', firstRes.status);
      assert.equal(firstRes.status, 201);

      const duplicateRes = await request(app)
        .post('/users')
        .send(duplicateUser)
        .set('Accept', 'application/json');

      console.log('Tentative duplication email:', duplicateRes.status);
      assert.ok(duplicateRes.status >= 400, 'Should reject duplicate email');

      const incompleteUser = {
        name: 'Incomplete'
      };

      const incompleteRes = await request(app)
        .post('/users')
        .send(incompleteUser)
        .set('Accept', 'application/json');

      console.log('Données incomplètes:', incompleteRes.status);
      assert.ok(incompleteRes.status >= 400, 'Should reject incomplete data');

      const invalidEmailUser = {
        name: 'Test',
        surname: 'User',
        email: 'email-invalide',
        password: 'password123'
      };

      const invalidEmailRes = await request(app)
        .post('/users')
        .send(invalidEmailUser)
        .set('Accept', 'application/json');

      console.log('Email invalide:', invalidEmailRes.status);
      assert.ok(invalidEmailRes.status >= 400, 'Should reject invalid email');
    });
  });
});
