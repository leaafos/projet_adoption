import request from 'supertest';
import assert from 'assert';
import { app } from '../src/app';

// tests pour la table Animal

describe('App functional tests', () => {
  it('GET / should return greeting', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  it('POST /animals should create an animal', async () => {
    const animalData = {
      organizationId: 'org123',
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
});
