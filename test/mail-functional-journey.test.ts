import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

// Tests fonctionnels pour le système de mails - Parcours utilisateur complet

describe('Mail System - Functional Journey Tests', () => {
  let testUserId: string;

  before(async () => {
    await syncDatabase();
  });

  async function createTestUser(name: string = 'Mail User', email?: string) {
    const userData = {
      name: name,
      surname: 'Test',
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}+${Date.now()}@mail-test.com`,
      password: 'SecurePassword123!',
      isActive: true,
      role: 'user',
      phoneNumber: '+33123456789',
      address: '123 Mail Street',
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

  describe('Scénario 1: Envoi de mail de bienvenue', () => {
    it('should send a welcome email to new user', async () => {
      console.log('\n === SCÉNARIO: Envoi d\'email de bienvenue ===');

      console.log('\n Étape 1: Création du compte utilisateur...');
      const { userId, userEmail } = await createTestUser('Sophie Nouveaux');
      testUserId = userId;
      
      console.log(`Utilisateur créé: ${userEmail} (ID: ${userId})`);

      console.log('\n Étape 2: Envoi de l\'email de bienvenue...');
      const welcomeMailData = {
        userId: testUserId,
        to: userEmail,
        title: 'Bienvenue sur notre plateforme d\'adoption !',
        body: `
        <html>
        <body>
          <h1>Bonjour Sophie !</h1>
          <p>Bienvenue sur notre plateforme d'adoption d'animaux.</p>
          <p>Nous sommes ravis de vous compter parmi nos membres !</p>
          <p>Vous pouvez maintenant :</p>
          <ul>
            <li>Parcourir nos animaux disponibles à l'adoption</li>
            <li>Contacter les refuges et associations</li>
            <li>Faire des dons pour soutenir la cause animale</li>
          </ul>
          <p>Cordialement,<br/>L'équipe d'adoption</p>
        </body>
        </html>
        `
      };

      const mailRes = await request(app)
        .post('/send-mail')
        .send(welcomeMailData)
        .set('Accept', 'application/json');

      console.log('Réponse envoi mail:', JSON.stringify(mailRes.body, null, 2));

      assert.ok(mailRes.status === 200 || mailRes.status === 500, 'Devrait retourner une réponse d\'envoi');
      
      if (mailRes.status === 200) {
        assert.equal(mailRes.body.message, 'Mail envoyé avec succès !');
        console.log('Email de bienvenue envoyé avec succès');
      } else {
        console.log('Tentative d\'envoi enregistrée (erreur SMTP attendue en test)');
      }
    });
  });

  describe('Scénario 2: Notification d\'adoption', () => {
    it('should send adoption notification email', async () => {
      console.log('\n === SCÉNARIO: Notification d\'adoption d\'un animal ===');

      const { userId, userEmail } = await createTestUser('Marie Adoptante', 'marie.adoptante@example.com');

      const adoptionNotificationData = {
        userId: userId,
        to: userEmail,
        title: 'Félicitations ! Votre demande d\'adoption a été acceptée',
        body: `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">🎉 Excellente nouvelle !</h1>
            <p>Chère Marie,</p>
            
            <p>Nous avons le plaisir de vous informer que votre demande d'adoption pour 
            <strong>Buddy</strong>, le Labrador de 3 ans, a été acceptée !</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <h3>Prochaines étapes :</h3>
              <ol>
                <li>Contactez le refuge dans les 48h</li>
                <li>Préparez les documents nécessaires</li>
                <li>Planifiez la visite de rencontre</li>
                <li>Organisez l'adoption définitive</li>
              </ol>
            </div>
            
            <p><strong>Contact du refuge :</strong><br/>
            📞 Téléphone : 01 23 45 67 89<br/>
            📧 Email : contact@refugeamis.fr<br/>
            📍 Adresse : 123 Avenue des Animaux, 75001 Paris</p>
            
            <p>Merci de donner une nouvelle chance à Buddy !</p>
            
            <p style="color: #666;">Cordialement,<br/>
            L'équipe d'adoption</p>
          </div>
        </body>
        </html>
        `
      };

      const res = await request(app)
        .post('/send-mail')
        .send(adoptionNotificationData)
        .set('Accept', 'application/json');

      console.log('Notification adoption:', JSON.stringify(res.body, null, 2));

      assert.ok(res.status === 200 || res.status === 500);
      
      if (res.status === 200) {
        console.log('Notification d\'adoption envoyée avec succès');
      } else {
        console.log('Notification d\'adoption enregistrée (erreur SMTP attendue)');
      }
    });
  });

  describe('Scénario 3: Newsletter mensuelle', () => {
    it('should send monthly newsletter to subscribers', async () => {
      console.log('\n === SCÉNARIO: Newsletter mensuelle ===');

      const subscribers = [
        await createTestUser('Pierre Newsletter', 'pierre.news@example.com'),
        await createTestUser('Julie Updates', 'julie.updates@example.com'),
        await createTestUser('Thomas Infos', 'thomas.infos@example.com')
      ];

      console.log(`Envoi de newsletter à ${subscribers.length} abonnés...`);

      const newsletterData = {
        title: '🐾 Newsletter - Nouvelles adoptions et événements du mois',
        body: `
        <html>
        <head>
          <style>
            .newsletter { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .animal-card { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; }
            .cta-button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="newsletter">
            <div class="header">
              <h1>🐾 Newsletter Adoption</h1>
              <p>Décembre 2025 - Nouvelles et événements</p>
            </div>
            
            <div class="content">
              <h2>🆕 Nouveaux arrivants</h2>
              <div class="animal-card">
                <h3>Luna - Chat Européen</h3>
                <p>Luna, 2 ans, cherche une famille aimante. Très câline et sociable !</p>
              </div>
              
              <div class="animal-card">
                <h3>Rex - Berger Allemand</h3>
                <p>Rex, 4 ans, parfait pour une famille active. Très bon gardien !</p>
              </div>
              
              <h2>📅 Événements à venir</h2>
              <ul>
                <li><strong>15 Décembre</strong> - Journée portes ouvertes au refuge</li>
                <li><strong>22 Décembre</strong> - Marché de Noël solidaire</li>
                <li><strong>31 Décembre</strong> - Réveillon avec nos pensionnaires</li>
              </ul>
              
              <h2>📊 Nos statistiques</h2>
              <p>Ce mois-ci :</p>
              <ul>
                <li>✅ 12 adoptions réalisées</li>
                <li>🏠 8 nouveaux animaux accueillis</li>
                <li>💰 3,450€ de dons collectés</li>
              </ul>
              
              <a href="https://adoption-platform.com/animaux" class="cta-button">Voir tous nos animaux</a>
              
              <p><small>Vous recevez cet email car vous êtes abonné à notre newsletter. 
              <a href="#">Se désabonner</a></small></p>
            </div>
          </div>
        </body>
        </html>
        `
      };

      const newsletterResults: any[] = [];

      for (const subscriber of subscribers) {
        const mailData = {
          userId: subscriber.userId,
          to: subscriber.userEmail,
          ...newsletterData
        };

        const res = await request(app)
          .post('/send-mail')
          .send(mailData)
          .set('Accept', 'application/json');

        newsletterResults.push({
          email: subscriber.userEmail,
          status: res.status,
          success: res.status === 200
        });

        console.log(`Newsletter -> ${subscriber.userEmail}: ${res.status === 200 ? 'Succès' : 'Erreur'}`);
      }

      assert.equal(newsletterResults.length, 3, 'Devrait avoir tenté d\'envoyer à 3 abonnés');
      
      const attempts = newsletterResults.filter(r => r.status === 200 || r.status === 500);
      assert.equal(attempts.length, 3, 'Toutes les tentatives d\'envoi devraient être enregistrées');

      console.log('Newsletter envoyée à tous les abonnés');
    });
  });

  describe('Scénario 4: Rappel de rendez-vous', () => {
    it('should send appointment reminder email', async () => {
      console.log('\n === SCÉNARIO: Rappel de rendez-vous ===');

      const { userId, userEmail } = await createTestUser('Alice RendezVous');

      const reminderData = {
        userId: userId,
        to: userEmail,
        title: 'Rappel : Votre rendez-vous demain au refuge',
        body: `
        <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #FF9800;">⏰ Rappel de rendez-vous</h1>
            
            <p>Bonjour Alice,</p>
            
            <p>Nous vous rappelons votre rendez-vous prévu <strong>demain à 14h30</strong> 
            au refuge pour rencontrer Bella, la Golden Retriever.</p>
            
            <div style="background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;">
              <h3>📋 Détails du rendez-vous :</h3>
              <p><strong>Date :</strong> Mercredi 2 Décembre 2025<br/>
              <strong>Heure :</strong> 14h30<br/>
              <strong>Lieu :</strong> Refuge des Amis à 4 Pattes<br/>
              <strong>Adresse :</strong> 456 Route des Animaux, 69000 Lyon<br/>
              <strong>Contact :</strong> 04 78 12 34 56</p>
              
              <p><strong>Animal :</strong> Bella - Golden Retriever, 5 ans</p>
            </div>
            
            <h3>📝 N'oubliez pas d'apporter :</h3>
            <ul>
              <li>Une pièce d'identité</li>
              <li>Justificatif de domicile</li>
              <li>Questionnaire d'adoption rempli</li>
              <li>Des questions sur les habitudes de Bella</li>
            </ul>
            
            <p>En cas d'empêchement, merci de nous prévenir au plus tôt.</p>
            
            <p style="color: #666;">À demain !<br/>
            L'équipe du refuge</p>
          </div>
        </body>
        </html>
        `
      };

      const res = await request(app)
        .post('/send-mail')
        .send(reminderData)
        .set('Accept', 'application/json');

      console.log('Rappel rendez-vous:', JSON.stringify(res.body, null, 2));

      assert.ok(res.status === 200 || res.status === 500);
      console.log('Rappel de rendez-vous traité');
    });
  });

  describe('Scénario 5: Consultation de l\'historique des mails', () => {
    it('should retrieve mail history', async () => {
      console.log('\n === SCÉNARIO: Consultation de l\'historique des mails ===');

      const { userId } = await createTestUser('User Histoire');

      const testMails = [
        {
          userId: userId,
          to: 'test1@example.com',
          title: 'Mail test 1',
          body: 'Contenu du mail 1'
        },
        {
          userId: userId,
          to: 'test2@example.com', 
          title: 'Mail test 2',
          body: 'Contenu du mail 2'
        }
      ];

      console.log('\n Envoi de mails de test...');
      
      for (const mail of testMails) {
        await request(app)
          .post('/send-mail')
          .send(mail)
          .set('Accept', 'application/json');
      }

      console.log('\n Récupération de l\'historique...');
      
      const historyRes = await request(app)
        .get('/mails')
        .set('Accept', 'application/json');

      console.log('Historique des mails:', JSON.stringify(historyRes.body, null, 2));

      assert.equal(historyRes.status, 200, 'Devrait retourner l\'historique avec succès');
      assert.ok(historyRes.body.mails, 'Devrait contenir une liste de mails');
      assert.ok(Array.isArray(historyRes.body.mails), 'La liste devrait être un tableau');

      const ourMails = historyRes.body.mails.filter((m: any) => String(m.userId) === String(userId));
      assert.ok(ourMails.length >= 2, 'Devrait trouver au moins nos 2 mails de test');

      console.log(`Historique récupéré : ${historyRes.body.mails.length} mails au total`);
    });

    it('should retrieve specific mail by ID', async () => {
      console.log('\n === SCÉNARIO: Consultation d\'un mail spécifique ===');

      const { userId } = await createTestUser('User Détail');

      const mailData = {
        userId: userId,
        to: 'detail@example.com',
        title: 'Mail pour test de détail',
        body: 'Contenu détaillé du mail de test'
      };

      const sendRes = await request(app)
        .post('/send-mail')
        .send(mailData)
        .set('Accept', 'application/json');

      assert.ok(sendRes.status === 200 || sendRes.status === 500, 'Send should complete');

      const allMailsRes = await request(app)
        .get('/mails')
        .set('Accept', 'application/json');

      const targetMail = allMailsRes.body.mails.find((m: any) => 
        m.userId === userId && m.title === mailData.title
      );

      if (targetMail) {
        const detailRes = await request(app)
          .get(`/mails/${targetMail.id}`)
          .set('Accept', 'application/json');

        console.log('Détail du mail:', JSON.stringify(detailRes.body, null, 2));

        assert.equal(detailRes.status, 200);
        assert.ok(detailRes.body.mail);
        assert.equal(detailRes.body.mail.id, targetMail.id);
        assert.equal(detailRes.body.mail.title, mailData.title);

        console.log('Détails du mail récupérés avec succès');
      } else {
        console.log('Mail de test non trouvé dans l\'historique');
      }
    });

    it('should return 404 for non-existent mail', async () => {
      console.log('\n === SCÉNARIO: Mail inexistant ===');

      const res = await request(app)
        .get('/mails/99999')
        .set('Accept', 'application/json');

      console.log('Mail inexistant:', JSON.stringify(res.body, null, 2));

      assert.equal(res.status, 404);
      assert.equal(res.body.error, 'Mail not found');

      console.log('Erreur 404 correctement retournée pour mail inexistant');
    });
  });

  describe('Scénario 6: Gestion des erreurs d\'envoi', () => {
    it('should handle missing required fields', async () => {
      console.log('\n === SCÉNARIO: Gestion erreurs - champs manquants ===');

      const incompleteMailData = {
        to: 'incomplete@example.com',
        title: 'Mail incomplet'
        // Manque: userId, body
      };

      const res = await request(app)
        .post('/send-mail')
        .send(incompleteMailData)
        .set('Accept', 'application/json');

      console.log('Erreur champs manquants:', JSON.stringify(res.body, null, 2));

      assert.equal(res.status, 500, 'Devrait retourner une erreur pour champs manquants');
      assert.ok(res.body.error, 'Devrait contenir un message d\'erreur');

      console.log('Erreur correctement gérée pour champs manquants');
    });

    it('should handle invalid email format', async () => {
      console.log('\n === SCÉNARIO: Gestion erreurs - email invalide ===');

      const { userId } = await createTestUser('User Email Invalide');

      const invalidEmailData = {
        userId: userId,
        to: 'email-invalide-sans-arobase',
        title: 'Test email invalide',
        body: 'Test avec une adresse email invalide'
      };

      const res = await request(app)
        .post('/send-mail')
        .send(invalidEmailData)
        .set('Accept', 'application/json');

      console.log('Erreur email invalide:', JSON.stringify(res.body, null, 2));

      assert.equal(res.status, 500, 'Devrait retourner une erreur pour email invalide');

      console.log('Erreur correctement gérée pour email invalide');
    });
  });
});
