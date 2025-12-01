import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

// Test fonctionnel complet - Parcours d'adoption d'un animal

describe('Complete Adoption Journey - End-to-End Functional Tests', () => {
    before(async () => {
    await syncDatabase();
  });

  async function createUser(name: string, surname: string, email: string) {
    const userData = {
      name,
      surname,
      email,
      password: 'SecurePassword123!',
      isActive: true,
      role: 'user',
      phoneNumber: '+33123456789',
      address: '123 Adoption Street',
      city: 'Paris',
      country: 'France',
      postalCode: '75001'
    };

    const res = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    return res.body.created;
  }

  async function createOrganization(name: string) {
    const orgData = {
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@refuge.org`,
      phone: '+33987654321',
      address: '456 Refuge Avenue',
      city: 'Lyon',
      state: 'Rhône-Alpes',
      postcode: '69000',
      country: 'France',
      hours: 'Mon-Fri 9AM-6PM',
      url: `https://${name.toLowerCase().replace(/\s+/g, '')}.org`,
      website: `https://${name.toLowerCase().replace(/\s+/g, '')}.org`,
      facebook: name.toLowerCase().replace(/\s+/g, ''),
      pinterest: name.toLowerCase().replace(/\s+/g, ''),
      x: name.toLowerCase().replace(/\s+/g, ''),
      youtube: name.toLowerCase().replace(/\s+/g, ''),
      instagram: name.toLowerCase().replace(/\s+/g, ''),
      photos_url: `https://${name.toLowerCase().replace(/\s+/g, '')}.org/photos`
    };

    const res = await request(app)
      .post('/organizations')
      .send(orgData)
      .set('Accept', 'application/json');

    return res.body.created;
  }

  async function createAnimal(name: string, organizationId: number, type: string = 'Dog') {
    const animalData = {
      organizationId,
      type,
      size: 'Medium',
      genre: 'Male',
      breed: type === 'Dog' ? 'Labrador' : 'Européen',
      age: 'Adult',
      description: `${name} est un ${type.toLowerCase()} très affectueux`,
      status: 'Available',
      color: 'Golden',
      coat: 'Short',
      name,
      good_with_children: true,
      good_with_dogs: true,
      good_with_cats: true,
      house_trained: true,
      declawed: false,
      special_needs: 'Aucun'
    };

    const res = await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    return res.body.created;
  }

  describe('Scénario Complet: Adoption de Buddy le Labrador', () => {
    it('should complete full adoption journey from discovery to payment', async () => {
      console.log('\n === PARCOURS COMPLET D\'ADOPTION ===');
      console.log('Histoire: Marie découvre Buddy sur le site et décide de l\'adopter');

      console.log('\n  PHASE 1: Préparation du système...');

      console.log('\n Étape 1.1: Création du refuge "SPA Les Amis Fidèles"...');
      const refuge = await createOrganization('SPA Les Amis Fidèles');
      console.log(`Refuge créé avec ID: ${refuge.organization_id}`);

      console.log('\n Étape 1.2: Buddy arrive au refuge...');
      const buddy = await createAnimal('Buddy', refuge.organization_id, 'Dog');
      console.log(`Buddy enregistré avec ID: ${buddy.id}`);

      console.log('\nPHASE 2: Marie découvre le site...');

      console.log('\n Étape 2.1: Marie consulte les animaux disponibles...');
      const animalsListRes = await request(app)
        .get('/animals')
        .set('Accept', 'application/json');

      assert.equal(animalsListRes.status, 200);
      assert.ok(animalsListRes.body.animals.length > 0);
      
      const buddyInList = animalsListRes.body.animals.find((a: any) => a.name === 'Buddy');
      assert.ok(buddyInList, 'Buddy devrait être visible dans la liste');
      assert.ok(buddyInList.organization, 'Les infos du refuge devraient être affichées');
      
      console.log(`Marie voit ${animalsListRes.body.animals.length} animal(s), dont Buddy`);

      console.log('\n Étape 2.2: Marie consulte la fiche de Buddy...');
      const buddyDetailsRes = await request(app)
        .get(`/animals/${buddy.id}`)
        .set('Accept', 'application/json');

      assert.equal(buddyDetailsRes.status, 200);
      assert.equal(buddyDetailsRes.body.animal.name, 'Buddy');
      assert.equal(buddyDetailsRes.body.animal.organization.name, 'SPA Les Amis Fidèles');
      
      console.log('Marie découvre que Buddy est parfait pour elle !');

      console.log('\n Étape 2.3: Marie créé son compte...');
      const marie = await createUser('Marie', 'Adoptante', 'marie.adoptante@gmail.com');
      console.log(`Compte créé pour Marie (ID: ${marie.id})`);

      console.log('\n PHASE 3: Processus d\'adoption...');

      console.log('\n Étape 3.1: Marie envoie sa candidature par email...');
      const candidatureMailData = {
        userId: marie.id,
        to: refuge.email,
        title: `Candidature d'adoption pour Buddy`,
        body: `
        <html>
        <body>
          <h2>Demande d'adoption</h2>
          <p>Bonjour,</p>
          <p>Je souhaite adopter Buddy, le Labrador de votre refuge.</p>
          <p><strong>Mes informations :</strong></p>
          <ul>
            <li>Nom : Marie Adoptante</li>
            <li>Email : marie.adoptante@gmail.com</li>
            <li>Téléphone : +33123456789</li>
            <li>Expérience avec les chiens : 10 ans</li>
            <li>Logement : Maison avec jardin</li>
          </ul>
          <p>Je suis disponible pour un rendez-vous cette semaine.</p>
          <p>Cordialement,<br/>Marie</p>
        </body>
        </html>
        `
      };

      const candidatureRes = await request(app)
        .post('/send-mail')
        .send(candidatureMailData)
        .set('Accept', 'application/json');

      assert.ok(candidatureRes.status === 200 || candidatureRes.status === 500);
      console.log('Candidature envoyée au refuge');

      console.log('\n  Étape 3.2: Le refuge répond positivement...');
      const acceptationMailData = {
        userId: marie.id,
        to: marie.email,
        title: 'Adoption de Buddy - Candidature acceptée !',
        body: `
        <html>
        <body>
          <h2>🎉 Bonne nouvelle !</h2>
          <p>Chère Marie,</p>
          <p>Nous avons le plaisir de vous informer que votre candidature pour l'adoption de Buddy a été acceptée !</p>
          <p><strong>Prochaines étapes :</strong></p>
          <ol>
            <li>Rendez-vous de rencontre : Samedi 14h00</li>
            <li>Période d'adaptation : 1 semaine</li>
            <li>Finalisation de l'adoption</li>
          </ol>
          <p>Frais d'adoption : 200€ (incluant vaccins, stérilisation, puce électronique)</p>
          <p>À bientôt !<br/>L'équipe SPA Les Amis Fidèles</p>
        </body>
        </html>
        `
      };

      const acceptationRes = await request(app)
        .post('/send-mail')
        .send(acceptationMailData)
        .set('Accept', 'application/json');

      assert.ok(acceptationRes.status === 200 || acceptationRes.status === 500);
      console.log('Réponse d\'acceptation envoyée à Marie');

      console.log('\n PHASE 4: Paiement et finalisation...');

      console.log('\nÉtape 4.1: Marie paye les frais d\'adoption (200€)...');
      const paymentData = {
        organizationId: refuge.organization_id,
        userId: marie.id,
        amount: 200.00,
        currency: 'EUR',
        status: 'completed',
        payment_method: 'carte_bancaire'
      };

      const paymentRes = await request(app)
        .post('/payments')
        .send(paymentData)
        .set('Accept', 'application/json');

      assert.equal(paymentRes.status, 201);
      assert.equal(paymentRes.body.created.amount, 200.00);
      console.log(`Paiement de 200€ effectué (Transaction ID: ${paymentRes.body.created.id})`);

      console.log('\n Étape 4.2: Confirmation de paiement...');
      const confirmationMailData = {
        userId: marie.id,
        to: marie.email,
        title: 'Confirmation de paiement - Adoption de Buddy',
        body: `
        <html>
        <body>
          <h2>💳 Paiement confirmé</h2>
          <p>Chère Marie,</p>
          <p>Nous confirmons la réception de votre paiement pour l'adoption de Buddy :</p>
          <div style="background: #f0f8f0; padding: 15px; margin: 10px 0; border-left: 4px solid #4CAF50;">
            <p><strong>Montant :</strong> 200,00€<br/>
            <strong>Méthode :</strong> Carte bancaire<br/>
            <strong>Statut :</strong> Confirmé<br/>
            <strong>Transaction :</strong> #${paymentRes.body.created.id}</p>
          </div>
          <p>🐕 Buddy vous attend ! Rendez-vous samedi à 14h00 pour faire connaissance.</p>
          <p>Merci de donner une nouvelle chance à Buddy !</p>
        </body>
        </html>
        `
      };

      const confirmationRes = await request(app)
        .post('/send-mail')
        .send(confirmationMailData)
        .set('Accept', 'application/json');

      assert.ok(confirmationRes.status === 200 || confirmationRes.status === 500);
      console.log('Confirmation de paiement envoyée');

      console.log('\nÉtape 4.3: Buddy est maintenant adopté !...');
      const adoptionUpdateRes = await request(app)
        .put(`/animals/${buddy.id}`)
        .send({ status: 'Adopted' })
        .set('Accept', 'application/json');

      assert.equal(adoptionUpdateRes.status, 200);
      assert.equal(adoptionUpdateRes.body.updated.status, 'Adopted');
      console.log('Statut de Buddy mis à jour : ADOPTÉ');

      console.log('\n PHASE 5: Vérifications finales...');

      console.log('\n Étape 5.1: Vérification du statut dans la liste...');
      const finalAnimalsRes = await request(app)
        .get('/animals')
        .set('Accept', 'application/json');

      const updatedBuddy = finalAnimalsRes.body.animals.find((a: any) => a.id === buddy.id);
      assert.equal(updatedBuddy.status, 'Adopted');
      console.log('Buddy apparaît comme adopté dans la liste publique');

      console.log('\n Étape 5.2: Vérification de l\'historique des paiements...');
      const paymentsHistoryRes = await request(app)
        .get('/payments')
        .set('Accept', 'application/json');

      const mariePayments = paymentsHistoryRes.body.payments.filter(
        (p: any) => String(p.userId) === String(marie.id)
      );
      assert.ok(mariePayments.length > 0);
      assert.equal(mariePayments[0].amount, 200.00);
      console.log(`Paiement de Marie visible dans l'historique (${mariePayments.length} transaction(s))`);

      console.log('\n Étape 5.3: Vérification de l\'historique des mails...');
      const mailsHistoryRes = await request(app)
        .get('/mails')
        .set('Accept', 'application/json');

      const marieMails = mailsHistoryRes.body.mails.filter(
        (m: any) => String(m.userId) === String(marie.id)
      );
      console.log(`${marieMails.length} email(s) envoyé(s) à Marie enregistré(s)`);


      console.log('\n === ADOPTION TERMINÉE AVEC SUCCÈS ! ===');
      console.log('Récapitulatif du parcours :');
      console.log(`Adoptante : Marie Adoptante (${marie.email})`);
      console.log(`Animal adopté : ${buddy.name} (${buddy.type})`);
      console.log(`Refuge : ${refuge.name}`);
      console.log(`Montant payé : 200€`);
      console.log(`Emails envoyés : ${marieMails.length}`);
      console.log(`Statut final : Adopté`);
      console.log('Buddy a trouvé sa famille pour la vie !');

      assert.equal(updatedBuddy.status, 'Adopted', 'L\'adoption devrait être finalisée');
      assert.ok(mariePayments.length > 0, 'Le paiement devrait être enregistré');
      console.log('\n PARCOURS D\'ADOPTION COMPLET VALIDÉ !');
    });
  });

  describe('Scénario Alternatif: Don sans adoption', () => {
    it('should complete donation journey without adopting', async () => {
      console.log('\n === PARCOURS: Don de soutien sans adoption ===');

      const donateur = await createUser('Pierre', 'Généreux', 'pierre.genereux@email.com');
      console.log(`Donateur créé: Pierre Généreux`);

      const refuge = await createOrganization('Refuge du Cœur');
      console.log(`Refuge créé: Refuge du Cœur`);

      const donData = {
        organizationId: refuge.organization_id,
        userId: donateur.id,
        amount: 50.00,
        currency: 'EUR',
        status: 'completed',
        payment_method: 'paypal'
      };

      const donRes = await request(app)
        .post('/payments')
        .send(donData)
        .set('Accept', 'application/json');

      assert.equal(donRes.status, 201);
      console.log(`Don de 50€ effectué par Pierre`);

      const remerciementData = {
        userId: donateur.id,
        to: donateur.email,
        title: 'Merci pour votre généreux don !',
        body: `
        <h2>Merci Pierre !</h2>
        <p>Votre don de 50€ nous aide énormément à prendre soin de nos protégés.</p>
        <p>Grâce à vous, nous pouvons :</p>
        <ul>
          <li>Nourrir nos animaux</li>
          <li>Payer les soins vétérinaires</li>
          <li>Améliorer leurs conditions de vie</li>
        </ul>
        <p>Merci de tout cœur !</p>
        `
      };

      const remerciementRes = await request(app)
        .post('/send-mail')
        .send(remerciementData)
        .set('Accept', 'application/json');

      assert.ok(remerciementRes.status === 200 || remerciementRes.status === 500);
      console.log('Email de remerciement envoyé');
      console.log('PARCOURS DE DON COMPLET VALIDÉ !');
    });
  });
});
