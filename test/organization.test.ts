import request from 'supertest';
import assert from 'assert';
import { app } from '../src/app';

describe('App functional tests', () => {
  it('GET / should return greeting', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  it('POST /organizations should create an organization', async () => {
    const organizationData = {
      organizationId: 'org123',
      name: 'Happy Tails Shelter',
      location: '1234 Bark Ave',
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
    assert.equal(res.body.created.location, organizationData.location);
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
});
