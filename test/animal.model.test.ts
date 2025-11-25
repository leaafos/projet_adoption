import assert from 'assert';
import models from '../src/models';

// Use the default DB (in-memory under NODE_ENV=test)
// tests globaux, on peut mettre les tests de toutes les tables ici

describe('Animal model (sqlite::memory:)', () => {
  beforeEach(async () => {
    await models.sequelize.sync({ force: true, logging: false, alter: true });
  });

  it('creates and fetches a Animal', async () => {
    // DB is synced in beforeEach
    // D'abord créer une organisation
    const organization = await models.Organization.create({
      name: 'Test Organization',
      email: 'test@org.com',
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
    });

    const created = await models.Animal.create({
      organizationId: organization.organization_id,
      type: 'Dog',
      size: 'Medium',
      genre: 'Male',
      breed: 'Labrador',
      age: 'Adult',
      description: 'A friendly dog',
      status: 'Available',
      color: 'Brown',
      coat: 'Short',
      name: 'Buddy',
      good_with_children: true,
      good_with_dogs: true,
      good_with_cats: false,
      house_trained: true,
      declawed: false,
      special_needs: 'None',
    });
    assert.ok(created.id > 0);

    const found = await models.Animal.findByPk(created.id);
    assert.ok(found);
    assert.equal(found!.type, 'Dog');
    assert.equal(found!.size, 'Medium');
    assert.equal(found!.genre, 'Male');
    assert.equal(found!.breed, 'Labrador');
    assert.equal(found!.age, 'Adult');
    assert.equal(found!.description, 'A friendly dog');
    assert.equal(found!.status, 'Available');
    assert.equal(found!.color, 'Brown');
    assert.equal(found!.coat, 'Short');
    assert.equal(found!.name, 'Buddy');
    assert.equal(found!.good_with_children, true);
    assert.equal(found!.good_with_dogs, true);
    assert.equal(found!.good_with_cats, false);
    assert.equal(found!.house_trained, true);
    assert.equal(found!.declawed, false);
    assert.equal(found!.special_needs, 'None');
  });

  // it('updates and deletes a user', async () => {
  //   // DB is synced in beforeEach

  //   const u = await models.User.create({ name: 'Linus', email: 'linus@example.org' });
  //   assert.ok(u.id > 0);

  //   // Update name and email
  //   await models.User.update({ name: 'Linus T', email: 'linus.t@example.org' }, { where: { id: u.id } });
  //   const updated = await models.User.findByPk(u.id);
  //   assert.ok(updated);
  //   assert.equal(updated!.name, 'Linus T');
  //   assert.equal(updated!.email, 'linus.t@example.org');

  //   // Delete and verify
  //   await models.User.destroy({ where: { id: u.id } });
  //   const deleted = await models.User.findByPk(u.id);
  //   assert.equal(deleted, null);

  //   const count = await models.User.count();
  //   assert.equal(count, 0);
  // });
});
