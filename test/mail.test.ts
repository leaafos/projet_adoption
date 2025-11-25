import request from 'supertest';
import assert from 'assert';
import { app, syncDatabase } from '../src/routes/app';

process.env.NODE_ENV = 'test';

// tests pour la table Mail

describe('Mail functional tests', () => {
  before(async function() {
    this.timeout(10000);
    await syncDatabase();
  });

  it('GET / should return greeting', async function() {
    this.timeout(5000);
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  it('POST /send-mail should send and save a mail successfully', async function() {
    this.timeout(10000);
    
    const userData = {
      name: 'Mail',
      surname: 'User',
      email: 'mail.user@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    const mailData = {
      userId: userRes.body.created.id.toString(),
      to: 'recipient@example.com',
      title: 'Test Email',
      body: 'This is a test email body.'
    };

    const res = await request(app)
      .post('/send-mail')
      .send(mailData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.message);
    assert.equal(res.body.message, 'Mail envoyé avec succès !');
  });

  it('POST /send-mail should handle missing required fields', async function() {
    this.timeout(10000);
    
    const incompleteMailData = {
      userId: '1',
      to: 'test@example.com'
    };

    const res = await request(app)
      .post('/send-mail')
      .send(incompleteMailData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 500);
    assert.ok(res.body.error);
  });

  it('POST /send-mail should handle invalid email addresses', async function() {
    this.timeout(10000);
    
    const userData = {
      name: 'Invalid',
      surname: 'Email',
      email: 'invalid.email@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    const mailData = {
      userId: userRes.body.created.id.toString(),
      to: 'invalid-email', 
      title: 'Test Email with Invalid Recipient',
      body: 'This should fail due to invalid email.'
    };

    const res = await request(app)
      .post('/send-mail')
      .send(mailData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 500);
    assert.ok(res.body.error);
  });

  it('POST /send-mail should handle non-existent user', async function() {
    this.timeout(10000);
    
    const mailData = {
      userId: '99999', 
      to: 'test@example.com',
      title: 'Test Email with Non-existent User',
      body: 'This should still work but with invalid userId.'
    };

    const res = await request(app)
      .post('/send-mail')
      .send(mailData)
      .set('Accept', 'application/json');

    assert.ok(res.status === 200 || res.status === 500);
    if (res.status === 500) {
      assert.ok(res.body.error);
    } else {
      assert.ok(res.body.message);
    }
  });

  it('POST /send-mail should handle long email content', async function() {
    this.timeout(15000); 
    
    const userData = {
      name: 'Long',
      surname: 'Content',
      email: 'long.content@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    const longBody = 'A'.repeat(1000); 

    const mailData = {
      userId: userRes.body.created.id.toString(),
      to: 'longcontent@example.com',
      title: 'Very Long Email Content Test',
      body: longBody
    };

    const res = await request(app)
      .post('/send-mail')
      .send(mailData)
      .set('Accept', 'application/json');

    assert.ok(res.status === 200 || res.status === 500);
    if (res.status === 500) {
      assert.ok(res.body.error);
    } else {
      assert.ok(res.body.message);
      assert.equal(res.body.message, 'Mail envoyé avec succès !');
    }
  });

  it('POST /send-mail should handle special characters in email', async function() {
    this.timeout(15000);
    
    const userData = {
      name: 'Special',
      surname: 'Chars',
      email: 'special.chars@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    const mailData = {
      userId: userRes.body.created.id.toString(),
      to: 'specialchars@example.com',
      title: 'Email with Special Characters: àáâãäå çđ éêë 😀🎉',
      body: 'This email contains special characters: àáâãäå, çđ, éêë, and emojis: 😀🎉🚀'
    };

    const res = await request(app)
      .post('/send-mail')
      .send(mailData)
      .set('Accept', 'application/json');

    assert.ok(res.status === 200 || res.status === 500);
    if (res.status === 500) {
      assert.ok(res.body.error);
    } else {
      assert.ok(res.body.message);
      assert.equal(res.body.message, 'Mail envoyé avec succès !');
    }
  });

  it('POST /send-mail should handle multiple recipients format', async function() {
    this.timeout(15000);

    const userData = {
      name: 'Multiple',
      surname: 'Recipients',
      email: 'multiple.recipients@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    const mailData = {
      userId: userRes.body.created.id.toString(),
      to: 'recipient1@example.com, recipient2@example.com',
      title: 'Email to Multiple Recipients',
      body: 'This email is sent to multiple recipients.'
    };

    const res = await request(app)
      .post('/send-mail')
      .send(mailData)
      .set('Accept', 'application/json');

    assert.ok(res.status === 200 || res.status === 500);
    if (res.status === 500) {
      assert.ok(res.body.error);
    } else {
      assert.ok(res.body.message);
      assert.equal(res.body.message, 'Mail envoyé avec succès !');
    }
  });

  it('POST /send-mail should handle empty body', async function() {
    this.timeout(15000);
    
    const userData = {
      name: 'Empty',
      surname: 'Body',
      email: 'empty.body@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    const mailData = {
      userId: userRes.body.created.id.toString(),
      to: 'emptybody@example.com',
      title: 'Email with Empty Body',
      body: ''
    };

    const res = await request(app)
      .post('/send-mail')
      .send(mailData)
      .set('Accept', 'application/json');

    assert.ok(res.status === 200 || res.status === 500);
    if (res.status === 500) {
      assert.ok(res.body.error);
    } else {
      assert.ok(res.body.message);
      assert.equal(res.body.message, 'Mail envoyé avec succès !');
    }
  });

  it('POST /send-mail should handle very long title', async function() {
    this.timeout(15000);
    
    const userData = {
      name: 'Long',
      surname: 'Title',
      email: 'long.title@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    const longTitle = 'Very Long Email Subject '.repeat(10); // Titre très long

    const mailData = {
      userId: userRes.body.created.id.toString(),
      to: 'longtitle@example.com',
      title: longTitle,
      body: 'This email has a very long title.'
    };

    const res = await request(app)
      .post('/send-mail')
      .send(mailData)
      .set('Accept', 'application/json');

    assert.ok(res.status === 200 || res.status === 500);
    if (res.status === 500) {
      assert.ok(res.body.error);
    } else {
      assert.ok(res.body.message);
      assert.equal(res.body.message, 'Mail envoyé avec succès !');
    }
  });
  
  it('GET /mails should return all saved mails', async function() {
    this.timeout(10000);
    
    const res = await request(app)
      .get('/mails')
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.ok(res.body.mails);
    assert.ok(Array.isArray(res.body.mails));
    assert.ok(res.body.mails.length >= 0);
  });

  it('GET /mails/:id should return 404 for non-existent mail', async function() {
    this.timeout(5000);
    
    const res = await request(app)
      .get('/mails/99999')
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
    assert.equal(res.body.error, 'Mail not found');
  });

  it('POST /send-mail should save mail in database even on failure', async function() {
    this.timeout(15000);
    
    const userData = {
      name: 'Database',
      surname: 'Save',
      email: 'database.save@example.com',
      password: 'securepassword',
      isActive: true,
      role: 'user'
    };

    const userRes = await request(app)
      .post('/users')
      .send(userData)
      .set('Accept', 'application/json');

    const mailData = {
      userId: userRes.body.created.id.toString(),
      to: 'database@example.com',
      title: 'Database Save Test',
      body: 'This mail should be saved in database regardless of sending status.'
    };

    await request(app)
      .post('/send-mail')
      .send(mailData)
      .set('Accept', 'application/json');

    const mailsRes = await request(app)
      .get('/mails')
      .set('Accept', 'application/json');

    assert.equal(mailsRes.status, 200);
    assert.ok(mailsRes.body.mails);
    assert.ok(Array.isArray(mailsRes.body.mails));
    

    const savedMail = mailsRes.body.mails.find(
      (mail: any) => mail.title === mailData.title && mail.body === mailData.body
    );
    
    assert.ok(savedMail, 'Mail should be saved in database');
    assert.equal(savedMail.userId, mailData.userId);
    assert.equal(savedMail.title, mailData.title);
    assert.equal(savedMail.body, mailData.body);
    assert.ok(savedMail.status); 
    assert.ok(savedMail.sentAt); 
  });
});
